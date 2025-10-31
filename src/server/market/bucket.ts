import { getProvider } from '../modules/provider';

type Bucket = {
  ts: number; // bucket start ms
  volume_usd: number;
  sum_price_x_usd: number; // sum(price_usd * swap_usd)
  last_price_usd: number | null;
};

const INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

const bucketsByPool = new Map<string, Bucket[]>();
const blockTsCache = new Map<number, number>(); // blockNumber -> ts(ms)

function floorToInterval(tsMs: number): number {
  return tsMs - (tsMs % INTERVAL_MS);
}

async function getBlockTimestampMs(blockNumber: number): Promise<number> {
  const cached = blockTsCache.get(blockNumber);
  if (cached) return cached;
  const pv = getProvider();
  const block = await pv.getBlock(blockNumber);
  const ts = (block?.timestamp ? block.timestamp * 1000 : Date.now());
  blockTsCache.set(blockNumber, ts);
  // Prevent unbounded growth
  if (blockTsCache.size > 50000) {
    blockTsCache.clear();
  }
  return ts;
}

function prune(pool: string, nowMs: number): void {
  const arr = bucketsByPool.get(pool);
  if (!arr || arr.length === 0) return;
  const cutoff = nowMs - WINDOW_MS;
  let i = 0;
  while (i < arr.length && arr[i].ts < cutoff) i++;
  if (i > 0) arr.splice(0, i);
}

export async function recordSwapBucket(
  pool: string,
  priceUsd: number | null | undefined,
  swapUsd: number | null | undefined,
  blockNumber: number
): Promise<void> {
  if (!isFinite(Number(swapUsd)) || (swapUsd as number) <= 0) return;
  const nowMs = await getBlockTimestampMs(blockNumber);
  const ts = floorToInterval(nowMs);
  const key = pool.toLowerCase();
  const arr = bucketsByPool.get(key) || [];
  let b = arr.find(x => x.ts === ts);
  if (!b) {
    b = { ts, volume_usd: 0, sum_price_x_usd: 0, last_price_usd: null };
    arr.push(b);
    // Keep sorted by ts
    arr.sort((a, b) => a.ts - b.ts);
    bucketsByPool.set(key, arr);
  }
  const vol = Number(swapUsd);
  b.volume_usd += vol;
  if (isFinite(Number(priceUsd)) && (priceUsd as number) > 0) {
    b.sum_price_x_usd += Number(priceUsd) * vol;
    b.last_price_usd = Number(priceUsd);
  }
  prune(key, nowMs);
}

export function getPoolBuckets(pool: string): Bucket[] {
  return (bucketsByPool.get(pool.toLowerCase()) || []).slice();
}

export function getPool24hMetrics(pool: string): { volume_24h_usd: number; price_first: number | null; price_last: number | null; price_change_24h: number | null } {
  const arr = bucketsByPool.get(pool.toLowerCase()) || [];
  if (arr.length === 0) return { volume_24h_usd: 0, price_first: null, price_last: null, price_change_24h: null };
  let vol = 0;
  let firstPrice: number | null = null;
  let lastPrice: number | null = null;
  for (let i = 0; i < arr.length; i++) {
    vol += arr[i].volume_usd;
    const v = arr[i].volume_usd;
    const p = arr[i].sum_price_x_usd > 0 && v > 0 ? arr[i].sum_price_x_usd / v : arr[i].last_price_usd;
    if (p && isFinite(p)) {
      if (firstPrice == null) firstPrice = p;
      lastPrice = p;
    }
  }
  const change = (firstPrice != null && lastPrice != null && firstPrice > 0)
    ? ((lastPrice - firstPrice) / firstPrice) * 100
    : null;
  return { volume_24h_usd: vol, price_first: firstPrice, price_last: lastPrice, price_change_24h: (change != null && isFinite(change)) ? change : null };
}

export function getToken24hMetrics(token: string): { volume_24h_usd: number; price_change_24h: number | null } {
  const t = token.toLowerCase();
  let vol = 0;
  let first: number | null = null;
  let last: number | null = null;
  for (const [pool, buckets] of bucketsByPool.entries()) {
    // We cannot determine token membership from bucket map alone; caller aggregates by pools of that token.
    // This function is a placeholder and should be used with explicit pools per token via registry where needed.
  }
  return { volume_24h_usd: vol, price_change_24h: null };
}


