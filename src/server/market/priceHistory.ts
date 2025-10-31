// In-memory token price history for 24h change computation
// Stores per-token array of { ts, price } and prunes >24h

type PricePoint = { ts: number; price: number };

const historyByToken = new Map<string, PricePoint[]>();

function norm(addr: string): string { return (addr || '').toLowerCase(); }

export function recordTokenPrice(address: string, price: number | null | undefined, now: number = Date.now()): void {
  if (price == null || !isFinite(price)) return;
  const key = norm(address);
  const arr = historyByToken.get(key) || [];
  arr.push({ ts: now, price });
  prune(arr, now);
  historyByToken.set(key, arr);
}

export function getChange24hPercent(address: string, now: number = Date.now()): number | null {
  const key = norm(address);
  const arr = historyByToken.get(key);
  if (!arr || arr.length === 0) return null;
  prune(arr, now);
  const cutoff = now - 24 * 60 * 60 * 1000;
  // Find first point older than or equal to cutoff; if none, use earliest
  let base: PricePoint | null = null;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].ts <= cutoff) base = arr[i];
    else break;
  }
  if (!base) base = arr[0];
  const latest = arr[arr.length - 1];
  if (!base || !latest || base.price <= 0) return null;
  const pct = ((latest.price - base.price) / base.price) * 100;
  return isFinite(pct) ? pct : null;
}

function prune(arr: PricePoint[], now: number): void {
  const cutoff = now - 24 * 60 * 60 * 1000;
  let idx = 0;
  while (idx < arr.length && arr[idx].ts < cutoff) idx++;
  if (idx > 0) arr.splice(0, idx);
}


