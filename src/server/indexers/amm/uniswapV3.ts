import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { upsertPool, upsertToken, getPools } from '../../market/registry';
import { getUsdPriceViaWeth } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { ethers } from 'ethers';
import tokensCatalog from '../../catalog/tokens.json';
import { getProvider } from '../../modules/provider';
import { getTokenMetadata } from '../../modules/tokens';
import { recordSwapBucket } from '../../market/bucket';

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

function hexToAddress(topic: string): string { return '0x' + topic.slice(26); }

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

    upsertPool({
      dex: 'Uniswap',
      version: 'V3',
      address: pool,
      token0,
      token1,
      fee_bps: feeBps,
      tvl_usd: null,
      volume_24h_usd: null,
      fees_24h_usd: null,
      utilization: null,
    });

    const t0Meta: any = (tokensCatalog as any)[token0] || null;
    const t1Meta: any = (tokensCatalog as any)[token1] || null;
    if (t0Meta) {
      upsertToken({ address: token0, symbol: t0Meta.symbol, decimals: t0Meta.decimals, price_usd: null });
    } else {
      try { const meta = await getTokenMetadata(token0); upsertToken({ address: token0, symbol: meta.symbol, decimals: meta.decimals, price_usd: null }); } catch {}
    }
    if (t1Meta) {
      upsertToken({ address: token1, symbol: t1Meta.symbol, decimals: t1Meta.decimals, price_usd: null });
    } else {
      try { const meta = await getTokenMetadata(token1); upsertToken({ address: token1, symbol: meta.symbol, decimals: meta.decimals, price_usd: null }); } catch {}
    }
  } catch {}
}

function pad32(addr: string): string { return addr.toLowerCase().replace(/^0x/, '').padStart(64, '0'); }

async function updateV3TvlOnce(poolAddr: string, token0: string, token1: string) {
  try {
    const provider = getProvider();
    const erc20Abi = ['function balanceOf(address) view returns (uint256)'];
    const c0 = new ethers.Contract(token0, erc20Abi, provider);
    const c1 = new ethers.Contract(token1, erc20Abi, provider);
    const [bal0, bal1] = await Promise.all([
      c0.balanceOf(poolAddr).catch(() => BigInt(0)),
      c1.balanceOf(poolAddr).catch(() => BigInt(0)),
    ]);
    const meta0: any = (tokensCatalog as any)[token0] || { decimals: 18, symbol: 'UNK' };
    const meta1: any = (tokensCatalog as any)[token1] || { decimals: 18, symbol: 'UNK' };
    const p0 = getUsdPriceViaWeth(token0);
    const p1 = getUsdPriceViaWeth(token1);
    let tvl = 0;
    let pool0Usd: number | null = null;
    let pool1Usd: number | null = null;
    let pool0Pct: number | null = null;
    let pool1Pct: number | null = null;
    let reserveRatio: number | null = null;
    if (p0 != null) {
      pool0Usd = Number(bal0) / 10 ** (meta0.decimals || 18) * (p0 || 0);
      tvl += pool0Usd;
    }
    if (p1 != null) {
      pool1Usd = Number(bal1) / 10 ** (meta1.decimals || 18) * (p1 || 0);
      tvl += pool1Usd;
    }
    if (isFinite(tvl) && tvl > 0) {
      if (pool0Usd != null && pool1Usd != null) {
        pool0Pct = (pool0Usd / tvl) * 100;
        pool1Pct = (pool1Usd / tvl) * 100;
        reserveRatio = pool1Usd > 0 ? (pool0Usd / pool1Usd) : null;
      }
      const existing = getPools().find((p: any) => p.address.toLowerCase() === poolAddr.toLowerCase());
      if (existing) {
        upsertPool({
          dex: existing.dex,
          version: existing.version,
          address: existing.address,
          token0: existing.token0,
          token1: existing.token1,
          token0_symbol: meta0.symbol || 'UNK',
          token1_symbol: meta1.symbol || 'UNK',
          fee_bps: existing.fee_bps,
          tvl_usd: tvl,
          volume_24h_usd: existing.volume_24h_usd,
          fees_24h_usd: existing.fees_24h_usd,
          utilization: existing.utilization,
          pool0_usd: pool0Usd,
          pool1_usd: pool1Usd,
          pool0_pct: pool0Pct,
          pool1_pct: pool1Pct,
          reserve_ratio: reserveRatio,
        });
      }
    }
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

  // Backfill pool created (chunked)
  try {
    const latest = await provider.getBlockNumber();
    // Try to go back far enough to include most V3 pools; chunk to avoid RPC limits
    const targetStart = 12000000; // around V3 launch
    const from = Math.max(0, Math.min(targetStart, latest));
    const step = 100000; // 100k blocks per query
    console.log(`🏦 V3 backfilling chunked from block ${from} to ${latest} in steps of ${step}`);
    for (let start = Math.max(from, latest - Math.max(config.BACKFILL_BLOCKS, 200000)); start <= latest; start += step) {
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
          try {
            const poolAddr = (log.address || '').toLowerCase();
            const pool = getPools().find((p: any) => p.address.toLowerCase() === poolAddr);
            if (!pool) continue;
            const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
            if (!parsed) continue;
            const a0 = BigInt(parsed.args[2]);
            const a1 = BigInt(parsed.args[3]);
            const meta0: any = (tokensCatalog as any)[pool.token0] || { decimals: 18 };
            const meta1: any = (tokensCatalog as any)[pool.token1] || { decimals: 18 };
            const p0 = getUsdPriceViaWeth(pool.token0);
            const p1 = getUsdPriceViaWeth(pool.token1);
            let usd = 0;
            if (p0 != null) usd = Math.abs(Number(a0)) / 10 ** (meta0.decimals || 18) * (p0 || 0);
            else if (p1 != null) usd = Math.abs(Number(a1)) / 10 ** (meta1.decimals || 18) * (p1 || 0);
            if (isFinite(usd) && usd > 0) {
              const price = (p0 != null ? p0 : (p1 != null ? p1 : 0));
              if (price && isFinite(price)) {
                recordSwapBucket(poolAddr, price, usd, log.blockNumber).catch(() => {});
              }
            }
          } catch {}
        }
      } catch {}
    }
  } catch {}

  provider.on({ address: factory, topics: [POOL_CREATED_TOPIC] }, (res: any) => handlePoolCreated(res));

  // Subscribe to V3 Swap events across pools
  provider.on({ topics: [SWAP_TOPIC_V3] }, (log: any) => {
    try {
      const poolAddr = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === poolAddr);
      if (!pool) return;
      const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
      if (!parsed) return;
      const a0 = BigInt(parsed.args[2]);
      const a1 = BigInt(parsed.args[3]);
      // Signed amounts already handled by BigInt via two's complement parsing in ethers
      // Choose leg with known price
      const meta0: any = (tokensCatalog as any)[pool.token0];
      const meta1: any = (tokensCatalog as any)[pool.token1];
      const p0 = getUsdPriceViaWeth(pool.token0);
      const p1 = getUsdPriceViaWeth(pool.token1);
      let usd = 0;
      if (p0 != null && meta0) usd = Math.abs(Number(a0)) / 10 ** (meta0.decimals || 18) * (p0 || 0);
      else if (p1 != null && meta1) usd = Math.abs(Number(a1)) / 10 ** (meta1.decimals || 18) * (p1 || 0);
      if (!isFinite(usd) || usd <= 0) return;
      const feeBps = pool.fee_bps || 30;
      const feeUsd = usd * (feeBps / 10000);
      recordSwapUsd(poolAddr, usd, feeUsd);
      const price = (p0 != null ? p0 : (p1 != null ? p1 : 0));
      if (price && isFinite(price)) {
        recordSwapBucket(poolAddr, price, usd, log.blockNumber).catch(() => {});
      }
    } catch {}
  });

  // Periodically update TVL for V3 pools via balanceOf
  setInterval(() => {
    try {
      for (const p of getPools().filter((x: any) => x.version === 'V3')) {
        updateV3TvlOnce(p.address, p.token0, p.token1);
      }
    } catch {}
  }, 60_000);
}


