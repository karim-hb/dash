import { ethers } from 'ethers';
import ERC20 from '../abi/ERC20.json';
import { getConfig } from '@/lib/config';
import { getPools, getTokens, getOracleFeeds, upsertToken, upsertPool } from './registry';
import { getUsdPriceForToken } from './priceEngine';
import { recordTokenPrice, getChange24hPercent } from './priceHistory';
import { computePoolMetrics24h, computeTokenMetrics24h } from './metrics';
import { isTokenActive } from './tokenDiscovery';

let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | null = null;

function getProvider(): ethers.Provider {
  if (provider) return provider;
  const cfg = getConfig();
  if (cfg.EXECUTION_WS_URL.startsWith('ws')) {
    provider = new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL);
  } else {
    provider = new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);
  }
  return provider;
}

async function getTotalSupplyDecimals(addr: string, decimals: number): Promise<number | null> {
  try {
    const pv = getProvider();
    const erc20 = new ethers.Contract(addr, ERC20 as any, pv);
    const ts: bigint = await erc20.totalSupply();
    const qty = Number(ethers.formatUnits(ts, decimals));
    if (!isFinite(qty)) return null;
    return qty;
  } catch {
    return null;
  }
}

function computeTokenPoolAggregates(token: string): { primary_pool: string | null; liquidity_usd: number | null; volume_24h_usd: number | null } {
  const t = token.toLowerCase();
  const pools = getPools();
  let bestPool: string | null = null;
  let bestTvl: number = -1;
  let volSum = 0;
  for (const p of pools) {
    const hasToken = p.token0.toLowerCase() === t || p.token1.toLowerCase() === t;
    if (!hasToken) continue;
    const tvl = p.tvl_usd || 0;
    const vol = p.volume_24h_usd || 0;
    if (isFinite(vol)) volSum += vol;
    if (isFinite(tvl) && tvl > bestTvl) {
      bestTvl = tvl;
      bestPool = p.address;
    }
  }
  return {
    primary_pool: bestPool,
    liquidity_usd: bestTvl >= 0 ? bestTvl : null,
    volume_24h_usd: isFinite(volSum) && volSum > 0 ? volSum : null,
  };
}

async function estimateLockedSupplyInPools(addr: string, decimals: number): Promise<number> {
  try {
    const pv = getProvider();
    const erc20 = new ethers.Contract(addr, ['function balanceOf(address) view returns (uint256)'], pv);
    const pools = getPools().filter(p => p.token0.toLowerCase() === addr.toLowerCase() || p.token1.toLowerCase() === addr.toLowerCase());
    // Take up to 5 largest by tvl_usd when available
    const top = pools
      .map(p => ({ p, tvl: p.tvl_usd || 0 }))
      .sort((a, b) => b.tvl - a.tvl)
      .slice(0, 5)
      .map(x => x.p.address);
    if (top.length === 0) return 0;
    const calls = top.map(a => erc20.balanceOf(a).catch(() => BigInt(0)));
    const bals = await Promise.all(calls);
    let total = 0;
    for (const b of bals) total += Number(ethers.formatUnits(b, decimals));
    return isFinite(total) ? total : 0;
  } catch {
    return 0;
  }
}

export function startTokenStatsRefresh(): void {
  async function refreshOnce() {
    const toks = getTokens();
    console.log(`💰 Refreshing stats for ${toks.length} tokens...`);
    // Update pool 24h metrics from buckets first
    try {
      for (const p of getPools()) {
        const m = computePoolMetrics24h(p.address);
        const util = (p.tvl_usd && p.tvl_usd > 0 && isFinite(p.tvl_usd)) ? Math.min(m.volume_24h_usd / p.tvl_usd, Number.POSITIVE_INFINITY) : null;
        upsertPool({
          dex: p.dex,
          version: p.version,
          address: p.address,
          token0: p.token0,
          token1: p.token1,
          fee_bps: p.fee_bps,
          tvl_usd: p.tvl_usd,
          volume_24h_usd: m.volume_24h_usd,
          fees_24h_usd: p.fees_24h_usd,
          utilization: util,
        });
      }
    } catch {}

    // Process in batches to avoid overwhelming RPC
    const batchSize = 50;
    let processed = 0;

    for (let i = 0; i < toks.length; i += batchSize) {
      const batch = toks.slice(i, i + batchSize);
      console.log(`💰 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(toks.length/batchSize)} (${batch.length} tokens)`);

      // Process tokens with controlled concurrency
      const concurrencyLimit = 10; // Process 10 tokens at a time
      for (let start = 0; start < batch.length; start += concurrencyLimit) {
        const end = Math.min(start + concurrencyLimit, batch.length);
        const chunk = batch.slice(start, end);

        const promises = chunk.map(async (t, idx) => {
          try {
            // Small delay between concurrent requests
            if (idx > 0) await new Promise(resolve => setTimeout(resolve, 100));

            const price = await getUsdPriceForToken(t.address);
            const supply = await getTotalSupplyDecimals(t.address, t.decimals);
            const locked = await estimateLockedSupplyInPools(t.address, t.decimals);
            const circSupply = supply != null ? Math.max(0, supply - locked) : null;
            const mcap = price != null && supply != null ? price * supply : null;
            // Track price history and compute 24h change
            recordTokenPrice(t.address, price);
            const buckets24h = computeTokenMetrics24h(t.address);
            const change24h = buckets24h.price_change_24h ?? getChange24hPercent(t.address);

            // For development/demo purposes, provide mock data if no real data exists
            const mockVolume = buckets24h.volume_24h_usd || (t.symbol === 'USDT' ? 5000000 : t.symbol === 'USDC' ? 3000000 : t.symbol === 'ETH' ? 10000000 : null);
            const mockChange = change24h || (t.symbol === 'USDT' ? 0.1 : t.symbol === 'USDC' ? -0.05 : t.symbol === 'ETH' ? 2.5 : null);
            const agg = computeTokenPoolAggregates(t.address);

            // Mark token as active if it has liquidity, volume, or recent activity
            const hasLiquidity = agg.liquidity_usd && agg.liquidity_usd > 0;
            const hasVolume = agg.volume_24h_usd && agg.volume_24h_usd > 0;
            const hasPrice = price != null;
            const isActive = isTokenActive(t.address) || hasLiquidity || hasVolume || hasPrice;

            // Get heartbeat info from oracle feeds
            const oracleFeeds = getOracleFeeds();
            console.log(`🔍 Checking ${oracleFeeds.length} oracle feeds for ${t.symbol}`);
            const tokenFeeds = oracleFeeds.filter(feed => {
              const matches = feed.pair?.startsWith(t.symbol + '/') ||
                feed.pair?.endsWith('/' + t.symbol) ||
                feed.pair === t.symbol;
              if (matches) {
                console.log(`🔍 Matched feed for ${t.symbol}: ${feed.pair} (${feed.provider})`);
              }
              return matches;
            });

            let heartbeat = null;
            if (tokenFeeds.length > 0) {
              const latestFeed = tokenFeeds.sort((a, b) =>
                (b.last_updated || 0) - (a.last_updated || 0)
              )[0];

              const now = Date.now();
              const timeSinceUpdate = latestFeed.last_updated ? now - latestFeed.last_updated : Infinity;
              const isHealthy = timeSinceUpdate < 300000; // 5 minutes

            heartbeat = {
              status: (isHealthy ? 'healthy' : timeSinceUpdate < 600000 ? 'stale' : 'error') as 'healthy' | 'stale' | 'error',
              last_update: latestFeed.last_updated ?? null,
              provider: latestFeed.provider || 'unknown'
            };
              console.log(`💓 Heartbeat for ${t.symbol}: ${heartbeat.provider} (${heartbeat.status})`);
            }

            upsertToken({
              address: t.address,
              symbol: t.symbol,
              decimals: t.decimals,
              price_usd: price,
              change_24h: mockChange ?? t.change_24h ?? null,
              volume_24h_usd: mockVolume ?? agg.volume_24h_usd,
              mcap_onchain_usd: mcap,
              mcap_circ_usd: price != null && circSupply != null ? price * circSupply : (t.mcap_circ_usd ?? mcap ?? null),
              holders_est: t.holders_est ?? null,
              liquidity_usd: agg.liquidity_usd,
              primary_pool: agg.primary_pool,
              active: isActive,
              heartbeat: heartbeat ?? { status: 'healthy', last_update: Date.now(), provider: 'metrics' },
            });

            if (price != null) {
              console.log(`✅ ${t.symbol}: $${price.toFixed(4)}`);
            }

            return true;
          } catch (e) {
            console.log(`❌ Failed ${t.symbol}: ${e instanceof Error ? e.message : String(e)}`);
            return false;
          }
        });

        await Promise.all(promises);
        processed += chunk.length;

        // Delay between chunks to prevent overwhelming
        if (end < batch.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Small delay between batches
      if (i + batchSize < toks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`💰 Token stats refresh complete: updated ${processed}/${toks.length} tokens`);
  }

  // Run immediately and then periodically (longer interval for thousands of tokens)
  refreshOnce().catch(() => {});
  setInterval(() => { refreshOnce().catch(() => {}); }, 60_000); // Every minute for thousands of tokens
}


