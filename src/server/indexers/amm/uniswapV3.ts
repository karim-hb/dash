import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { getPools, getTokens } from '../../market/registry';
import { getUsdPriceForToken } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { ethers } from 'ethers';
import tokensCatalog from '../../catalog/tokens.json';
import { getProvider } from '../../modules/provider';
import { recordSwapBucket } from '../../market/bucket';
import { registerPool } from '../../market/ammEngine';
import { initUniswapV3PositionIndexer, registerV3PoolMeta, schedulePoolRecompute } from './uniswapV3Positions';
import { derivePriceRatio } from './uniswapV3Math';

const V3_FACTORY_ABI = [
  'event PoolCreated(address indexed token0, address indexed token1, uint24 fee, int24 tickSpacing, address pool)'
];
const V3_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'
];
const IFactory = new ethers.Interface(V3_FACTORY_ABI);
const IPool = new ethers.Interface(V3_POOL_ABI);
const POOL_CREATED_TOPIC = IFactory.getEvent('PoolCreated')!.topicHash;
const SWAP_TOPIC_V3 = IPool.getEvent('Swap')!.topicHash;

function getTokenDecimalsCached(address: string): number {
  const lower = address.toLowerCase();
  const existing = getTokens().find(t => (t.address || '').toLowerCase() === lower);
  if (existing && typeof existing.decimals === 'number') return existing.decimals;
  const catalogEntry: any = (tokensCatalog as any)[lower] || (tokensCatalog as any)[address];
  if (catalogEntry && typeof catalogEntry.decimals === 'number') return catalogEntry.decimals;
  return 18;
}

function absBigInt(value: bigint): bigint {
  return value < 0n ? -value : value;
}

async function handlePoolCreated(log: any) {
  try {
    const parsed = IFactory.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return;
    const token0 = String(parsed.args[0]).toLowerCase();
    const token1 = String(parsed.args[1]).toLowerCase();
    const fee = Number(parsed.args[2]);
    const pool = String(parsed.args[4]).toLowerCase();
    const feeBps = Math.round(fee / 100); // 500->5bps, 3000->30bps, 10000->100bps

    console.log(`🏦 V3 discovered pool ${pool} (${token0.slice(0,6)}…/${token1.slice(0,6)}… fee:${feeBps}bps)`);

    await registerPool({ dex: 'Uniswap', version: 'V3', address: pool, token0, token1, feeBps });
    registerV3PoolMeta({ dex: 'Uniswap', version: 'V3', address: pool, token0, token1, feeBps, fee });
  } catch {}
}

export async function startUniswapV3Indexer(): Promise<void> {
  console.log('🏦 Starting Uniswap V3 indexer...');
  console.log('🏦 ENABLE_AMM_UNIV3:', config.ENABLE_AMM_UNIV3);
  if (!config.ENABLE_AMM_UNIV3) {
    console.log('🏦 Uniswap V3 indexer disabled');
    return;
  }
  const factory = (amm as any).uniswap_v3?.factory;
  console.log('🏦 V3 factory address:', factory);
  if (!factory) {
    console.log('🏦 No Uniswap V3 factory configured');
    return;
  }
  const provider = getProvider();

  await initUniswapV3PositionIndexer();

  // Seed position aggregator with any pools already in registry
  for (const pool of getPools().filter((p: any) => p.version === 'V3')) {
    const feeBps = typeof pool.fee_bps === 'number' ? pool.fee_bps : 30;
    const fee = Math.round(feeBps * 100);
    registerV3PoolMeta({
      dex: pool.dex || 'Uniswap',
      version: pool.version || 'V3',
      address: pool.address.toLowerCase(),
      token0: pool.token0.toLowerCase(),
      token1: pool.token1.toLowerCase(),
      feeBps,
      fee,
    });
  }

  // Backfill pool created (chunked)
  try {
    const latest = await provider.getBlockNumber();
    const defaultStart = Number(process.env.UNIV3_FACTORY_DEPLOY_BLOCK || 12369621);
    const startBlock = Math.max(0, Math.min(defaultStart, latest));
    const step = Number(process.env.UNIV3_POOL_BACKFILL_STEP || 20000);
    console.log(`🏦 V3 backfilling pools from block ${startBlock} to ${latest} in ${step} block steps`);
    for (let start = startBlock; start <= latest; start += step) {
      const end = Math.min(latest, start + step - 1);
      try {
        const logs = await provider.getLogs({ address: factory, topics: [POOL_CREATED_TOPIC], fromBlock: start, toBlock: end });
        if (logs && logs.length) {
          for (const log of logs) await handlePoolCreated(log);
        }
      } catch (e) {
        // continue to next chunk
      }
    }
  } catch (e) { console.warn('UniswapV3 backfill failed', e); }

  // Backfill last 24h swaps into buckets/volume
  try {
    const latest = await provider.getBlockNumber();
    const LOOKBACK = Number(process.env.VOL_24H_LOOKBACK_BLOCKS || '7200');
    const from = Math.max(0, latest - LOOKBACK);
    const poolsV3 = getPools().filter((p: any) => p.version === 'V3').map((p: any) => p.address);
    const chunk = 200;
    for (let i = 0; i < poolsV3.length; i += chunk) {
      const addrs = poolsV3.slice(i, i + chunk);
      try {
        const logs = await provider.getLogs({ address: addrs, topics: [SWAP_TOPIC_V3], fromBlock: from, toBlock: latest });
        for (const log of logs || []) {
          await processSwapLog(log);
        }
      } catch {}
    }
  } catch {}

  provider.on({ address: factory, topics: [POOL_CREATED_TOPIC] }, (res: any) => {
    handlePoolCreated(res).catch(err => console.error('🏦 V3 PoolCreated handler error:', err));
  });

  // Subscribe to V3 Swap events across pools
  provider.on({ topics: [SWAP_TOPIC_V3] }, (log: any) => {
    processSwapLog(log).catch(err => console.error('🏦 V3 swap processing failed', err));
  });

  // Periodically refresh TVL for V3 pools via position recompute
  setInterval(() => {
    try {
      for (const p of getPools().filter((x: any) => x.version === 'V3')) {
        schedulePoolRecompute(p.address).catch(() => {});
      }
    } catch {}
  }, 60_000);
}


async function processSwapLog(log: any): Promise<void> {
  const poolAddr = (log.address || '').toLowerCase();
  const pool = getPools().find((p: any) => p.address.toLowerCase() === poolAddr);
  if (!pool) return;

  const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
  if (!parsed) return;

  const amount0 = BigInt(parsed.args[2]);
  const amount1 = BigInt(parsed.args[3]);
  const sqrtPriceX96 = BigInt(parsed.args[4]);

  const decimals0 = getTokenDecimalsCached(pool.token0);
  const decimals1 = getTokenDecimalsCached(pool.token1);

  const ratio = derivePriceRatio(sqrtPriceX96, decimals0, decimals1);
  const [price0Raw, price1Raw] = await Promise.all([
    getUsdPriceForToken(pool.token0),
    getUsdPriceForToken(pool.token1),
  ]);

  let price0 = price0Raw;
  let price1 = price1Raw;

  if (ratio > 0) {
    if ((price0 == null || !isFinite(price0)) && price1 != null && isFinite(price1)) {
      price0 = price1 / ratio;
    }
    if ((price1 == null || !isFinite(price1)) && price0 != null && isFinite(price0)) {
      price1 = price0 * ratio;
    }
  }

  const qty0 = Number(ethers.formatUnits(absBigInt(amount0), decimals0));
  const qty1 = Number(ethers.formatUnits(absBigInt(amount1), decimals1));

  const usdCandidates: number[] = [];
  if (price0 != null && isFinite(price0) && qty0 > 0) usdCandidates.push(qty0 * price0);
  if (price1 != null && isFinite(price1) && qty1 > 0) usdCandidates.push(qty1 * price1);

  if (!usdCandidates.length) return;

  const usd = Math.max(...usdCandidates);
  if (!isFinite(usd) || usd <= 0) return;

  const feeBps = typeof pool.fee_bps === 'number'
    ? pool.fee_bps
    : Math.round(Number(pool.fee ?? 3000) / 100);
  const feeUsd = usd * (feeBps / 10000);
  recordSwapUsd(poolAddr, usd, feeUsd);

  const priceForBucket = price0 != null && isFinite(price0)
    ? price0
    : (price1 != null && isFinite(price1) && ratio > 0 ? price1 / ratio : null);

  if (priceForBucket && isFinite(priceForBucket)) {
    recordSwapBucket(poolAddr, priceForBucket, usd, log.blockNumber).catch(() => {});
  }

  schedulePoolRecompute(poolAddr).catch(() => {});
}


