import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { upsertPool, upsertToken, getPools } from '../../market/registry';
import tokensCatalog from '../../catalog/tokens.json';
import { getUsdPriceViaWeth } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { ethers } from 'ethers';
import { setV2Reserves } from '../../market/reserves';
import { getProvider } from '../../modules/provider';
import { getTokenMetadata } from '../../modules/tokens';
import { recordSwapBucket } from '../../market/bucket';

const V2_FACTORY_ABI = [
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)'
];
const V2_PAIR_ABI = [
  'event Sync(uint112 reserve0, uint112 reserve1)',
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)'
];
const IFactory = new ethers.Interface(V2_FACTORY_ABI);
const IPair = new ethers.Interface(V2_PAIR_ABI);
const PAIR_CREATED_TOPIC = IFactory.getEvent('PairCreated')!.topicHash;
const SYNC_TOPIC = IPair.getEvent('Sync')!.topicHash;
const SWAP_TOPIC = IPair.getEvent('Swap')!.topicHash;

const discoveredPairs = new Set<string>();

async function handlePairCreated(log: any, dexName: string) {
  try {
    const parsed = IFactory.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return;
    const token0 = String(parsed.args[0]).toLowerCase();
    const token1 = String(parsed.args[1]).toLowerCase();
    const pair = String(parsed.args[2]).toLowerCase();

    if (discoveredPairs.has(pair)) return;
    discoveredPairs.add(pair);

    console.log(`🏦 ${dexName} V2: discovered pair ${pair} (${token0.slice(0,6)}…/${token1.slice(0,6)}…)`);

    upsertPool({
      dex: dexName,
      version: 'V2',
      address: pair,
      token0,
      token1,
      fee_bps: 30, // default typical for V2 (approx)
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
      try {
        const meta = await getTokenMetadata(token0);
        upsertToken({ address: token0, symbol: meta.symbol, decimals: meta.decimals, price_usd: null });
      } catch {}
    }
    if (t1Meta) {
      upsertToken({ address: token1, symbol: t1Meta.symbol, decimals: t1Meta.decimals, price_usd: null });
    } else {
      try {
        const meta = await getTokenMetadata(token1);
        upsertToken({ address: token1, symbol: meta.symbol, decimals: meta.decimals, price_usd: null });
      } catch {}
    }

    // Seed reserves immediately to enable pricing before first Sync
    try {
      const provider = getProvider();
      const reservesData = await provider.call({ to: pair, data: '0x0902f1ac' }); // getReserves()
      if (reservesData && reservesData.length >= 130) {
        const r0 = BigInt('0x' + reservesData.slice(2, 66));
        const r1 = BigInt('0x' + reservesData.slice(66, 130));
        setV2Reserves(pair, token0, token1, r0, r1);
      }
    } catch {}
  } catch (e) {
    console.error('🏦 PairCreated error:', e);
  }
}

async function handleSync(log: any) {
  try {
    const pair = (log.address || '').toLowerCase();
    const parsed = IPair.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return;
    const r0 = BigInt(parsed.args[0]);
    const r1 = BigInt(parsed.args[1]);
    const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
    if (!pool) return;
    setV2Reserves(pair, pool.token0, pool.token1, r0, r1);
    const p0 = getUsdPriceViaWeth(pool.token0);
    const p1 = getUsdPriceViaWeth(pool.token1);
    let tvl: number | null = null;
    let pool0Usd: number | null = null;
    let pool1Usd: number | null = null;
    let pool0Pct: number | null = null;
    let pool1Pct: number | null = null;
    let reserveRatio: number | null = null;
    const meta0: any = (tokensCatalog as any)[pool.token0] || { decimals: 18, symbol: 'UNK' };
    const meta1: any = (tokensCatalog as any)[pool.token1] || { decimals: 18, symbol: 'UNK' };
    if (p0 != null && p1 != null) {
      const q0 = Number(r0) / 10 ** (meta0.decimals || 18);
      const q1 = Number(r1) / 10 ** (meta1.decimals || 18);
      pool0Usd = q0 * p0;
      pool1Usd = q1 * p1;
      const sum = pool0Usd + pool1Usd;
      tvl = isFinite(sum) ? sum : null;
      if (tvl && tvl > 0) {
        pool0Pct = (pool0Usd / tvl) * 100;
        pool1Pct = (pool1Usd / tvl) * 100;
        reserveRatio = pool1Usd > 0 ? (pool0Usd / pool1Usd) : null;
      }
    }
    upsertPool({
      dex: pool.dex,
      version: pool.version,
      address: pool.address,
      token0: pool.token0,
      token1: pool.token1,
      token0_symbol: meta0.symbol || 'UNK',
      token1_symbol: meta1.symbol || 'UNK',
      fee_bps: pool.fee_bps,
      tvl_usd: tvl,
      volume_24h_usd: pool.volume_24h_usd,
      fees_24h_usd: pool.fees_24h_usd,
      utilization: pool.utilization,
      pool0_usd: pool0Usd,
      pool1_usd: pool1Usd,
      pool0_pct: pool0Pct,
      pool1_pct: pool1Pct,
      reserve_ratio: reserveRatio,
    });
  } catch {}
}

export async function startUniswapV2Indexer(): Promise<void> {
  console.log('🏦 Starting Uniswap V2 indexer...');
  if (!config.ENABLE_AMM_UNIV2) {
    console.log('🏦 Uniswap V2 indexer disabled');
    return;
  }
  const factory = (amm as any).uniswap_v2?.factory;
  if (!factory) {
    console.log('🏦 No Uniswap V2 factory configured');
    return;
  }
  const provider = getProvider();

  // Backfill recent PairCreated events
  try {
    const latest = await provider.getBlockNumber();
    const from = Math.max(0, latest - config.BACKFILL_BLOCKS);
    const logs = await provider.getLogs({ address: factory, topics: [PAIR_CREATED_TOPIC], fromBlock: from, toBlock: latest });
    for (const log of logs || []) await handlePairCreated(log, 'Uniswap');
  } catch (e) {
    console.warn('UniswapV2 backfill failed', e);
  }

  // Backfill last 24h swaps into buckets/volume
  try {
    const latest = await provider.getBlockNumber();
    const LOOKBACK = Number(process.env.VOL_24H_LOOKBACK_BLOCKS || '7200');
    const from = Math.max(0, latest - LOOKBACK);
    const poolsV2 = getPools().filter((p: any) => p.version === 'V2').map((p: any) => p.address);
    const chunk = 200;
    for (let i = 0; i < poolsV2.length; i += chunk) {
      const addrs = poolsV2.slice(i, i + chunk);
      try {
        const logs = await provider.getLogs({ address: addrs, topics: [SWAP_TOPIC], fromBlock: from, toBlock: latest });
        for (const log of logs || []) {
          try {
            const pair = (log.address || '').toLowerCase();
            const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
            if (!pool) continue;
            const parsed = IPair.parseLog({ topics: log.topics, data: log.data });
            if (!parsed) continue;
            const a0in = BigInt(parsed.args[1]);
            const a1in = BigInt(parsed.args[2]);
            const a0out = BigInt(parsed.args[3]);
            const a1out = BigInt(parsed.args[4]);
            let amount: bigint = BigInt(0);
            let token: string = pool.token0;
            const zero = BigInt(0);
            if (a0in > zero) { amount = a0in; token = pool.token0; }
            else if (a1in > zero) { amount = a1in; token = pool.token1; }
            else if (a0out > zero) { amount = a0out; token = pool.token0; }
            else if (a1out > zero) { amount = a1out; token = pool.token1; }
            const price = getUsdPriceViaWeth(token);
            const meta: any = (tokensCatalog as any)[token] || { decimals: 18 };
            if (price == null) continue;
            const qty = Number(amount) / 10 ** (meta.decimals || 18);
            const usd = qty * (price || 0);
            if (isFinite(usd) && usd > 0) {
              recordSwapBucket(pair, price || 0, usd, log.blockNumber).catch(() => {});
            }
          } catch {}
        }
      } catch {}
    }
  } catch {}

  // Live subscriptions
  provider.on({ address: factory, topics: [PAIR_CREATED_TOPIC] }, (res: any) => {
    handlePairCreated(res, 'Uniswap');
  });

  // Subscribe to Sync for discovered pairs (broad filter over topic, no address list)
  provider.on({ topics: [SYNC_TOPIC] }, (res: any) => handleSync(res));

  // Subscribe to Swap events (compute 24h volume/fees)
  provider.on({ topics: [SWAP_TOPIC] }, (log: any) => {
    try {
      const pair = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
      if (!pool) return;
      const parsed = IPair.parseLog({ topics: log.topics, data: log.data });
      if (!parsed) return;
      const a0in = BigInt(parsed.args[1]);
      const a1in = BigInt(parsed.args[2]);
      const a0out = BigInt(parsed.args[3]);
      const a1out = BigInt(parsed.args[4]);
      let amount: bigint = BigInt(0);
      let token: string = pool.token0;
      const zero = BigInt(0);
      if (a0in > zero) { amount = a0in; token = pool.token0; }
      else if (a1in > zero) { amount = a1in; token = pool.token1; }
      else if (a0out > zero) { amount = a0out; token = pool.token0; }
      else if (a1out > zero) { amount = a1out; token = pool.token1; }
      const price = getUsdPriceViaWeth(token);
      const meta: any = (tokensCatalog as any)[token] || { decimals: 18 };
      if (price == null) return;
      const qty = Number(amount) / 10 ** (meta.decimals || 18);
      const usd = qty * (price || 0);
      const feeBps = pool.fee_bps || 30;
      const feeUsd = usd * (feeBps / 10000);
      if (isFinite(usd) && usd > 0) recordSwapUsd(pair, usd, feeUsd);
      if (isFinite(usd) && usd > 0) {
        recordSwapBucket(pair, price || 0, usd, log.blockNumber).catch(() => {});
      }
    } catch {}
  });
}


