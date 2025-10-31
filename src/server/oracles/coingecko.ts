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
  if (ids.length === 0) return;

  console.log(`🪙 CoinGecko: requesting ${ids.length} symbols`);

  // Process in batches to avoid rate limits
  const batches = [];
  for (let i = 0; i < ids.length; i += 50) {
    batches.push(ids.slice(i, i + 50));
  }

  for (const batch of batches) {
    const key = `cg:${batch.join(',')}:${vs}`;
    const cached = getCache(key);

    if (cached) {
      // Use cached data
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
    } else {
      try {
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(batch.join(','))}&vs_currencies=${vs}`;
        console.log(`🪙 Fetching batch of ${batch.length} from CoinGecko`);

        const res = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'TokenTracker/1.0'
          },
          timeout: 10000
        });

        if (!res.ok) {
          console.log(`🪙 CoinGecko API error: ${res.status} ${res.statusText}`);
          continue;
        }

        const json = await res.json();
        setCache(key, json, ttlMs);

        let updated = 0;
        for (const id of Object.keys(json)) {
          const price = json[id]?.[vs];
          upsertOracleFeed(`coingecko:${id.toUpperCase()}/${vs.toUpperCase()}`, {
            provider: 'CoinGecko',
            pair: `${id.toUpperCase()}/${vs.toUpperCase()}`,
            price_usd: typeof price === 'number' && price > 0 ? price : null,
            last_updated: Date.now(),
            status: price ? 'healthy' : 'error',
          });
          if (price) updated++;
        }

        console.log(`🪙 Updated ${updated}/${batch.length} prices from CoinGecko`);

      } catch (e) {
        console.log(`🪙 CoinGecko fetch error: ${e.message}`);
        for (const id of batch) {
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

    // Rate limit between batches
    if (batches.length > 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}


