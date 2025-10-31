import { getPools } from './registry';
import { getPool24hMetrics } from './bucket';

export function computePoolMetrics24h(poolAddr: string) {
  return getPool24hMetrics(poolAddr);
}

export function computeTokenMetrics24h(tokenAddr: string): { volume_24h_usd: number; price_change_24h: number | null } {
  const t = tokenAddr.toLowerCase();
  const pools = getPools().filter(p => p.token0.toLowerCase() === t || p.token1.toLowerCase() === t);
  let volSum = 0;
  let first: number | null = null;
  let last: number | null = null;
  for (const p of pools) {
    const m = getPool24hMetrics(p.address);
    volSum += m.volume_24h_usd || 0;
    if (m.price_first != null) {
      if (first == null) first = m.price_first;
    }
    if (m.price_last != null) {
      last = m.price_last;
    }
  }
  const change = (first != null && last != null && first > 0) ? ((last - first) / first) * 100 : null;
  return { volume_24h_usd: volSum, price_change_24h: (change != null && isFinite(change)) ? change : null };
}


