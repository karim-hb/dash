import { getPools, upsertPool } from './registry';

type SwapPoint = { ts: number; usd: number; fee_usd: number };

const windowMs = 24 * 60 * 60 * 1000;
const swapsByPool = new Map<string, SwapPoint[]>();

function prune(pool: string) {
  const arr = swapsByPool.get(pool);
  if (!arr) return;
  const cutoff = Date.now() - windowMs;
  let i = 0;
  while (i < arr.length && arr[i].ts < cutoff) i++;
  if (i > 0) arr.splice(0, i);
}

export function recordSwapUsd(pool: string, usd: number, feeUsd: number) {
  if (!isFinite(usd) || usd <= 0) return;
  const key = pool.toLowerCase();
  const arr = swapsByPool.get(key) || [];
  arr.push({ ts: Date.now(), usd, fee_usd: isFinite(feeUsd) ? feeUsd : 0 });
  swapsByPool.set(key, arr);
  prune(key);
  refreshPoolAggregates(key);
}

export function getPoolAggregates(pool: string): { volume_24h_usd: number; fees_24h_usd: number } {
  prune(pool.toLowerCase());
  const arr = swapsByPool.get(pool.toLowerCase()) || [];
  let vol = 0, fees = 0;
  for (const p of arr) { vol += p.usd; fees += p.fee_usd; }
  return { volume_24h_usd: vol, fees_24h_usd: fees };
}

export function refreshPoolAggregates(pool: string) {
  const key = pool.toLowerCase();
  const { volume_24h_usd, fees_24h_usd } = getPoolAggregates(key);
  const current = getPools().find((p: any) => p.address.toLowerCase() === key);
  if (!current) return;
  const tvl = current.tvl_usd || 0;
  const util = tvl > 0 && isFinite(tvl) ? Math.min(volume_24h_usd / tvl, Number.POSITIVE_INFINITY) : null;
  upsertPool({
    dex: current.dex,
    version: current.version,
    address: current.address,
    token0: current.token0,
    token1: current.token1,
    fee_bps: current.fee_bps,
    tvl_usd: current.tvl_usd,
    volume_24h_usd,
    fees_24h_usd,
    utilization: util,
  });
}


