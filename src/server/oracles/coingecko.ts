import { upsertOracleFeed } from '../market/registry';

type CacheEntry = { value: any; expire: number };
const cache = new Map<string, CacheEntry>();

function getCache(key: string): any | null {
  const v = cache.get(key);
  if (!v) return null;
  if (Date.now() > v.expire) { cache.delete(key); return null; }
  return v.value;
}

function setCache(key: string, value: any, ttlMs: number) {
  cache.set(key, { value, expire: Date.now() + ttlMs });
}

export async function fetchCoinGeckoSimplePrice(ids: string[], vs = 'usd', ttlMs = 60_000): Promise<void> {
  const key = `cg:${ids.join(',')}:${vs}`;
  const cached = getCache(key);
  if (cached) {
    for (const id of Object.keys(cached)) {
      const price = cached[id]?.[vs];
      upsertOracleFeed(`coingecko:${id.toUpperCase()}/${vs.toUpperCase()}`, {
        provider: 'CoinGecko',
        pair: `${id.toUpperCase()}/${vs.toUpperCase()}`,
        price_usd: typeof price === 'number' ? price : null,
        last_updated: Date.now(),
        status: price ? 'healthy' : 'error',
      });
    }
    return;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${vs}`;
    const res = await fetch(url);
    const json = await res.json();
    setCache(key, json, ttlMs);
    for (const id of Object.keys(json)) {
      const price = json[id]?.[vs];
      upsertOracleFeed(`coingecko:${id.toUpperCase()}/${vs.toUpperCase()}`, {
        provider: 'CoinGecko',
        pair: `${id.toUpperCase()}/${vs.toUpperCase()}`,
        price_usd: typeof price === 'number' ? price : null,
        last_updated: Date.now(),
        status: price ? 'healthy' : 'error',
      });
    }
  } catch {
    for (const id of ids) {
      upsertOracleFeed(`coingecko:${id.toUpperCase()}/${vs.toUpperCase()}`, {
        provider: 'CoinGecko',
        pair: `${id.toUpperCase()}/${vs.toUpperCase()}`,
        price_usd: null,
        last_updated: null,
        status: 'error',
      });
    }
  }
}


