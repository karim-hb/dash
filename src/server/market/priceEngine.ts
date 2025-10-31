import tokensCatalog from '../catalog/tokens.json';
import { getOracleFeeds, getTokens, getPools } from './registry';
import { getV2Reserves, getV2PoolsForPair, setV2Reserves } from './reserves';
import { ethers } from 'ethers';

// Global provider instance (avoid circular imports)
let provider: ethers.Provider | null = null;

function getProvider(): ethers.Provider {
  if (provider) return provider;

  // Use environment or default Nethermind RPC
  const rpcUrl = process.env.EXECUTION_WS_URL || process.env.EXECUTION_RPC_URL || 'http://127.0.0.1:8545';

  if (rpcUrl.startsWith('ws')) {
    provider = new ethers.WebSocketProvider(rpcUrl);
  } else {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  return provider;
}

const PRICE_TTL_MS = Number(process.env.PRICE_CACHE_TTL_MS || '20000');
const PRICE_STALE_MS = Number(process.env.PRICE_CACHE_STALE_MS || '90000');
const RESERVE_PROBE_TTL_MS = Number(process.env.RESERVE_PROBE_TTL_MS || '15000');

type PriceSource = 'stable' | 'eth' | 'chainlink' | 'pool' | 'probe' | 'unknown';

export type PriceCacheEntry = {
  token: string;
  price: number | null;
  source: PriceSource;
  provider: string;
  updatedAt: number;
  heartbeat: 'healthy' | 'stale' | 'error';
  liquidityUsd?: number | null;
  metadata?: Record<string, any>;
};

const priceCache: Map<string, PriceCacheEntry> = new Map();
const lastReserveProbeMs: Map<string, number> = new Map();

function nowMs(): number { return Date.now(); }

function resolveHeartbeat(updatedAt: number, hasPrice: boolean): 'healthy' | 'stale' | 'error' {
  if (!hasPrice) return 'error';
  const age = nowMs() - updatedAt;
  if (age <= PRICE_TTL_MS) return 'healthy';
  if (age <= PRICE_STALE_MS) return 'stale';
  return 'error';
}

function cachePrice(address: string, entry: PriceCacheEntry): PriceCacheEntry {
  const key = normalize(address);
  priceCache.set(key, entry);
  return entry;
}

export function getCachedPrice(address: string): PriceCacheEntry | undefined {
  return priceCache.get(normalize(address));
}

type TokenInfo = { symbol: string; decimals: number; name: string };

const STABLES = new Set([
  'USDC','USDT','DAI','LUSD','FRAX','sUSD','BUSD','USDP'
]);

const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
let ammCatalog: any | null = null;
function getAmmCatalog(): any {
  if (!ammCatalog) {
    try { ammCatalog = require('../catalog/amm.json'); } catch { ammCatalog = {}; }
  }
  return ammCatalog;
}

function lookupToken(address: string): TokenInfo | null {
  const addr = normalize(address);

  // First try the catalog
  let info = (tokensCatalog as any)[addr];
  if (!info) {
    // Try original case (checksummed)
    info = (tokensCatalog as any)[address];
  }
  if (info) {
    return { symbol: info.symbol, decimals: info.decimals, name: info.name || '' };
  }

  // If not in catalog, check discovered tokens in registry
  const discoveredTokens = getTokens();
  const discovered = discoveredTokens.find(t => normalize(t.address) === addr);
  if (discovered) {
    return {
      symbol: discovered.symbol || 'UNK',
      decimals: discovered.decimals || 18,
      name: discovered.symbol || 'Unknown Token'
    };
  }

  return null;
}

function normalize(a: string) { return a ? a.toLowerCase() : a; }

type GetPriceOptions = {
  forceRefresh?: boolean;
  ttlMs?: number;
  minLiquidityUsd?: number;
};

export async function getUsdPriceForToken(address: string, opts: GetPriceOptions = {}): Promise<number | null> {
  const key = normalize(address);
  const ttl = opts.ttlMs ?? PRICE_TTL_MS;
  const cached = priceCache.get(key);
  if (!opts.forceRefresh && cached && (nowMs() - cached.updatedAt) <= ttl) {
    return cached.price;
  }

  const info = lookupToken(address);
  const now = nowMs();
  if (!info) {
    cachePrice(address, {
      token: key,
      price: null,
      source: 'unknown',
      provider: 'metadata',
      updatedAt: now,
      heartbeat: 'error',
    });
    return null;
  }

  const symbolUpper = (info.symbol || '').toUpperCase();

  // Stablecoins without oracle dependency
  if (STABLES.has(symbolUpper)) {
    const entry = cachePrice(address, {
      token: key,
      price: 1,
      source: 'stable',
      provider: 'stable',
      updatedAt: now,
      heartbeat: 'healthy',
    });
    return entry.price;
  }

  // Native ETH / WETH price
  if (symbolUpper === 'ETH' || key === WETH_ADDR) {
    const ethEntry = computeEthUsdEntry();
    cachePrice(address, ethEntry);
    return ethEntry.price;
  }

  // Chainlink price if available
  const chainlink = getChainlinkPriceEntry(symbolUpper);
  if (chainlink) {
    const entry = cachePrice(address, {
      token: key,
      price: chainlink.price,
      source: 'chainlink',
      provider: 'Chainlink',
      updatedAt: chainlink.updatedAt,
      heartbeat: resolveHeartbeat(chainlink.updatedAt, chainlink.price != null),
      metadata: { pair: chainlink.pair },
    });
    return entry.price;
  }

  // Probe via WETH liquidity pools
  const probe = await probePriceViaWethPools(key, info.decimals || 18, opts.minLiquidityUsd);
  if (probe && probe.price != null) {
    const entry = cachePrice(address, {
      token: key,
      price: probe.price,
      source: 'pool',
      provider: probe.provider,
      updatedAt: probe.updatedAt,
      heartbeat: resolveHeartbeat(probe.updatedAt, probe.price != null),
      liquidityUsd: probe.liquidityUsd,
      metadata: { pool: probe.pool },
    });
    return entry.price;
  }

  // Final fallback - keep previous value if available but mark stale/error
  if (cached) {
    cachePrice(address, {
      ...cached,
      heartbeat: resolveHeartbeat(cached.updatedAt, cached.price != null),
    });
    return cached.price ?? null;
  }

  cachePrice(address, {
    token: key,
    price: null,
    source: 'unknown',
    provider: 'metrics',
    updatedAt: now,
    heartbeat: 'stale',
    liquidityUsd: null,
  });
  return null;
}

type ChainlinkPriceHit = { price: number | null; updatedAt: number; pair: string } | null;

function computeEthUsdEntry(): PriceCacheEntry {
  const feeds = getOracleFeeds();
  const now = nowMs();
  let price: number | null = null;
  let updatedAt = now;
  let provider: PriceSource = 'unknown';
  const chainlinkFeeds = feeds
    .filter(f => f.provider === 'Chainlink' && (f.pair?.toUpperCase() === 'ETH/USD'))
    .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));

  if (chainlinkFeeds.length > 0) {
    const feed = chainlinkFeeds[0];
    price = typeof feed.price_usd === 'number' ? feed.price_usd : null;
    updatedAt = feed.last_updated || now;
    provider = 'chainlink';
  } else {
    const cgFeeds = feeds
      .filter(f => f.provider === 'CoinGecko' && (f.pair?.toUpperCase() === 'ETH/USD'))
      .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0));
    if (cgFeeds.length > 0) {
      const feed = cgFeeds[0];
      price = typeof feed.price_usd === 'number' ? feed.price_usd : null;
      updatedAt = feed.last_updated || now;
      provider = 'probe';
    }
  }

  if (price == null) {
    const cached = priceCache.get(WETH_ADDR);
    if (cached && cached.price != null) {
      return {
        token: WETH_ADDR,
        price: cached.price,
        source: cached.source,
        provider: cached.provider,
        updatedAt: cached.updatedAt,
        heartbeat: resolveHeartbeat(cached.updatedAt, true),
        liquidityUsd: cached.liquidityUsd,
        metadata: cached.metadata,
      };
    }
  }

  return {
    token: WETH_ADDR,
    price,
    source: provider,
    provider: provider === 'chainlink' ? 'Chainlink' : provider === 'probe' ? 'CoinGecko' : 'none',
    updatedAt,
    heartbeat: resolveHeartbeat(updatedAt, price != null),
  };
}

function getChainlinkPriceEntry(symbolUpper: string): ChainlinkPriceHit {
  if (!symbolUpper) return null;
  const feeds = getOracleFeeds();
  const now = nowMs();
  let best: ChainlinkPriceHit = null;

  for (const feed of feeds) {
    if (feed.provider !== 'Chainlink' || !feed.pair) continue;
    const pair = feed.pair.toUpperCase();
    const [base, quote] = pair.split('/');
    let price: number | null = null;
    if (base === symbolUpper && quote === 'USD') {
      price = typeof feed.price_usd === 'number' ? feed.price_usd : null;
    } else if (base === 'USD' && quote === symbolUpper) {
      if (typeof feed.price_usd === 'number' && feed.price_usd > 0) {
        price = 1 / feed.price_usd;
      }
    }
    if (price == null) continue;
    const updatedAt = feed.last_updated || now;
    if (!best || updatedAt > best.updatedAt) {
      best = { price, updatedAt, pair: feed.pair };
    }
  }

  return best;
}

type PoolProbe = {
  price: number | null;
  liquidityUsd: number;
  provider: string;
  pool: string;
  updatedAt: number;
};

async function probePriceViaWethPools(token: string, decimals: number, minLiquidityUsd = 0): Promise<PoolProbe | null> {
  const ethPrice = getEthUsdPrice();
  if (ethPrice == null) return null;

  const pools = getV2PoolsForPair(token, WETH_ADDR);
  if (!pools.length) return null;

  const allPools = getPools();
  const now = nowMs();
  let best: PoolProbe | null = null;

  for (const poolAddr of pools) {
    const poolMeta = allPools.find(p => p.address.toLowerCase() === poolAddr.toLowerCase());
    if (!poolMeta) continue;

    let reserves = getV2Reserves(poolAddr);
    const needsProbe = !reserves || (now - reserves.updatedAt) > RESERVE_PROBE_TTL_MS;
    if (needsProbe) {
      const lastProbe = lastReserveProbeMs.get(poolAddr) || 0;
      if ((now - lastProbe) > RESERVE_PROBE_TTL_MS) {
        try {
          lastReserveProbeMs.set(poolAddr, now);
          const data = await getProvider().call({ to: poolAddr, data: '0x0902f1ac' });
          if (data && data.length >= 130) {
            const reserve0 = BigInt('0x' + data.slice(2, 66));
            const reserve1 = BigInt('0x' + data.slice(66, 130));
            setV2Reserves(poolAddr, poolMeta.token0, poolMeta.token1, reserve0, reserve1);
            reserves = getV2Reserves(poolAddr);
          }
        } catch (err) {
          // ignore probe errors for individual pools
        }
      }
    }

    if (!reserves) continue;

    const t0 = lookupToken(reserves.token0);
    const t1 = lookupToken(reserves.token1);
    if (!t0 || !t1) continue;

    const tokenIs0 = reserves.token0 === token;
    const tokenDecimals = tokenIs0 ? t0.decimals : t1.decimals;
    const wethDecimals = tokenIs0 ? t1.decimals : t0.decimals;
    const tokenReserve = tokenIs0 ? reserves.reserve0 : reserves.reserve1;
    const wethReserve = tokenIs0 ? reserves.reserve1 : reserves.reserve0;

    if (tokenReserve === 0n || wethReserve === 0n) continue;

    const tokenFloat = Number(tokenReserve) / 10 ** tokenDecimals;
    const wethFloat = Number(wethReserve) / 10 ** wethDecimals;

    if (!isFinite(tokenFloat) || !isFinite(wethFloat) || tokenFloat <= 0 || wethFloat <= 0) continue;

    const priceEth = wethFloat / tokenFloat;
    const priceUsd = priceEth * ethPrice;
    if (!isFinite(priceUsd) || priceUsd <= 0) continue;

    const wethUsd = wethFloat * ethPrice;
    const tokenUsd = tokenFloat * priceUsd;
    const liquidityUsd = tokenUsd + wethUsd;

    if (liquidityUsd < minLiquidityUsd) continue;

    const updatedAt = reserves.updatedAt;
    if (!best || liquidityUsd > best.liquidityUsd) {
      best = {
        price: priceUsd,
        liquidityUsd,
        provider: `${poolMeta.dex} V2`,
        pool: poolAddr,
        updatedAt,
      };
    }
  }

  return best;
}

export function getEthUsdPrice(opts?: { forceRefresh?: boolean }): number | null {
  const ttl = PRICE_TTL_MS;
  const cached = priceCache.get(WETH_ADDR);
  if (!opts?.forceRefresh && cached && (nowMs() - cached.updatedAt) <= ttl) {
    return cached.price;
  }
  const entry = computeEthUsdEntry();
  cachePrice(WETH_ADDR, entry);
  return entry.price;
}

export async function computeV2TvlUsd(token0: string, token1: string, reserve0: bigint, reserve1: bigint): Promise<number | null> {
  const i0 = lookupToken(token0);
  const i1 = lookupToken(token1);
  const p0 = await getUsdPriceForToken(token0);
  const p1 = await getUsdPriceForToken(token1);
  if (!i0 || !i1 || p0 == null || p1 == null) return null;
  const q0 = Number(reserve0) / 10 ** i0.decimals;
  const q1 = Number(reserve1) / 10 ** i1.decimals;
  const tvl = q0 * p0 + q1 * p1;
  if (!isFinite(tvl)) return null;
  return tvl;
}

export function getUsdPriceViaWeth(token: string): number | null {
  const normalized = token.toLowerCase();
  if (normalized === WETH_ADDR) return getEthUsdPrice();
  const ethUsd = getEthUsdPrice();
  if (ethUsd == null) return null;
  const pools = getV2PoolsForPair(normalized, WETH_ADDR);
  let bestUsd: number | null = null;
  for (const pool of pools) {
    const reserves = getV2Reserves(pool);
    if (!reserves) continue;
    const tokenIs0 = reserves.token0 === normalized;
    const wethIs0 = reserves.token0 === WETH_ADDR;
    const wethIs1 = reserves.token1 === WETH_ADDR;
    if (!wethIs0 && !wethIs1) continue;

    const tokenAddress = tokenIs0 ? reserves.token0 : reserves.token1;
    const wethAddress = tokenIs0 ? reserves.token1 : reserves.token0;
    if (wethAddress !== WETH_ADDR) continue;

    const tokenInfo = lookupToken(tokenAddress);
    const wethInfo = lookupToken(wethAddress);
    if (!tokenInfo || !wethInfo) continue;

    const tokenReserve = tokenIs0 ? reserves.reserve0 : reserves.reserve1;
    const wethReserve = tokenIs0 ? reserves.reserve1 : reserves.reserve0;
    if (tokenReserve === 0n || wethReserve === 0n) continue;

    const tokenFloat = Number(tokenReserve) / 10 ** (tokenInfo.decimals || 18);
    const wethFloat = Number(wethReserve) / 10 ** (wethInfo.decimals || 18);
    if (!isFinite(tokenFloat) || !isFinite(wethFloat) || tokenFloat <= 0 || wethFloat <= 0) continue;

    const priceEth = wethFloat / tokenFloat;
    if (!isFinite(priceEth) || priceEth <= 0) continue;
    const usd = priceEth * ethUsd;
    if (isFinite(usd) && usd > 0) {
      if (bestUsd == null) bestUsd = usd;
      else bestUsd = Math.max(bestUsd, usd);
    }
  }
  return bestUsd;
}

function getChainlinkPriceForToken(address: string): number | null {
  const feeds = getOracleFeeds();
  const addr = normalize(address);

  // Find Chainlink feed for this token
  const feed = feeds.find(f =>
    f.provider === 'Chainlink' &&
    f.feed_address &&
    normalize(f.feed_address) === addr
  );

  return feed?.price_usd || null;
}

function getCoingeckoPriceForToken(address: string): number | null {
  const feeds = getOracleFeeds();
  const info = lookupToken(address);

  if (!info) return null;

  // First try to find by symbol in CoinGecko feeds
  const symbolFeed = feeds.find(f =>
    f.provider === 'CoinGecko' &&
    f.pair?.toLowerCase().startsWith(info.symbol.toLowerCase() + '/')
  );

  if (symbolFeed?.price_usd) return symbolFeed.price_usd;

  // Fallback: try to find any CoinGecko feed with matching symbol
  const anyCgFeed = feeds.find(f =>
    f.provider === 'CoinGecko' &&
    f.pair?.split('/')[0].toLowerCase() === info.symbol.toLowerCase()
  );

  return anyCgFeed?.price_usd || null;
}

// Nethermind DEX price fetching via direct RPC calls
async function getNethermindDexPrice(tokenAddress: string): Promise<number | null> {
  // Reduced logging to prevent spam
  try {
    const pv = getProvider();
    if (!pv) return null;

    const token = normalize(tokenAddress);

    // Try Uniswap V2 pools first (simpler) by scanning registry pools
    const allPools = getPools();
    const v2Candidates = allPools.filter(p => (p.version === 'V2') && (
      (p.token0.toLowerCase() === token && p.token1.toLowerCase() === WETH_ADDR) ||
      (p.token1.toLowerCase() === token && p.token0.toLowerCase() === WETH_ADDR)
    ));
    if (v2Candidates.length > 0) {
      // Prefer pool with largest TVL
      v2Candidates.sort((a, b) => (b.tvl_usd || 0) - (a.tvl_usd || 0));
      const pool = v2Candidates[0];
      const reservesData = await pv.call({ to: pool.address, data: '0x0902f1ac' });
      if (reservesData && reservesData.length >= 130) {
        const reserve0 = BigInt('0x' + reservesData.slice(2, 66));
        const reserve1 = BigInt('0x' + reservesData.slice(66, 130));
        if (reserve0 > BigInt(0) && reserve1 > BigInt(0)) {
          const tokenInfo = lookupToken(token);
          if (!tokenInfo) return null;
          const ethPrice = getEthUsdPrice();
          if (!ethPrice) return null;
          const decimals = tokenInfo.decimals;
          const wethDecimals = 18;
          let price: number;
          if (pool.token0.toLowerCase() === token) {
            price = (Number(reserve1) / Number(reserve0)) * Math.pow(10, decimals - wethDecimals) * ethPrice;
          } else {
            price = (Number(reserve0) / Number(reserve1)) * Math.pow(10, decimals - wethDecimals) * ethPrice;
          }
          return isFinite(price) && price > 0 ? price : null;
        }
      }
    }

    // Try Uniswap V3 pools using slot0(sqrtPriceX96)
    const v3Candidates = allPools.filter(p => (p.version === 'V3') && (
      (p.token0.toLowerCase() === token && p.token1.toLowerCase() === WETH_ADDR) ||
      (p.token1.toLowerCase() === token && p.token0.toLowerCase() === WETH_ADDR)
    ));
    if (v3Candidates.length > 0) {
      v3Candidates.sort((a, b) => (b.tvl_usd || 0) - (a.tvl_usd || 0));
      const pool = v3Candidates[0];
      const iface = new ethers.Interface(['function slot0() view returns (uint160 sqrtPriceX96,int24,int24,uint16,uint16,uint16,uint8,bool)']);
      const data = iface.encodeFunctionData('slot0', []);
      const ret = await pv.call({ to: pool.address, data });
      if (ret && ret !== '0x') {
        const decoded = iface.decodeFunctionResult('slot0', ret);
        const sqrtPriceX96 = Number(decoded[0]);
        const sqrt = sqrtPriceX96 / Math.pow(2, 96);
        const price1Per0 = sqrt * sqrt;
        const info0 = lookupToken(pool.token0);
        const info1 = lookupToken(pool.token1);
        if (info0 && info1) {
          const scale = Math.pow(10, info0.decimals - info1.decimals);
          const p1p0 = price1Per0 * scale; // token1 per token0
          const ethPrice = getEthUsdPrice();
          if (!ethPrice) return null;
          let priceUsd: number | null = null;
          if (pool.token0.toLowerCase() === token) {
            // token0 is token; token1 is WETH; price token->USD = p1p0 * eth
            priceUsd = p1p0 * ethPrice;
          } else {
            // token1 is token; token per WETH = 1/p1p0
            if (p1p0 > 0) priceUsd = (1 / p1p0) * ethPrice;
          }
          if (priceUsd && isFinite(priceUsd) && priceUsd > 0) return priceUsd;
        }
      }
    }

    // Try Uniswap V1 exchange price (token/ETH)
    const v1Factory = getAmmCatalog().uniswap_v1?.factory;
    if (v1Factory) {
      try {
        const iface = new ethers.Interface(['function getExchange(address) view returns (address)']);
        const data = iface.encodeFunctionData('getExchange', [token]);
        const ret = await pv.call({ to: v1Factory, data });
        if (ret && ret !== '0x') {
          const [exchange] = iface.decodeFunctionResult('getExchange', ret) as any[];
          const exAddr = String(exchange);
          if (exAddr && exAddr.toLowerCase() !== '0x0000000000000000000000000000000000000000') {
            const info = lookupToken(token);
            if (!info) return null;
            const tokenBal = await new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], pv).balanceOf(exAddr).catch(() => BigInt(0));
            const ethBal = await pv.getBalance(exAddr).catch(() => BigInt(0));
            if (tokenBal > BigInt(0) && ethBal > BigInt(0)) {
              const ethPrice = getEthUsdPrice();
              if (!ethPrice) return null;
              // priceETH = (ethBal/1e18) / (tokenBal/10^decimals)
              const priceEth = Number(ethBal) / 1e18 / (Number(tokenBal) / Math.pow(10, info.decimals));
              const priceUsd = priceEth * ethPrice;
              return isFinite(priceUsd) && priceUsd > 0 ? priceUsd : null;
            }
          }
        }
      } catch {}
    }

    return null;
  } catch (e: any) {
    console.log(`? Nethermind DEX price fetch failed for ${tokenAddress}: ${e?.message || e}`);
    return null;
  }
}

function getEstimatedPriceFromRelatedTokens(address: string): number | null {
  // Try cached V2 reserves first (faster)
  const poolAddrs = getV2PoolsForPair(address, WETH_ADDR);
  if (poolAddrs.length > 0) {
    const res = getV2Reserves(poolAddrs[0]);
    if (res && res.reserve0 > BigInt(0) && res.reserve1 > BigInt(0)) {
      const ethPrice = getEthUsdPrice();
      if (ethPrice) {
        const reserve0 = Number(res.reserve0);
        const reserve1 = Number(res.reserve1);
        if (res.token0.toLowerCase() === normalize(address)) {
          return (reserve1 / reserve0) * ethPrice;
        } else {
          return (reserve0 / reserve1) * ethPrice;
        }
      }
    }
  }

  return null;
}

// Get comprehensive token data including volume, market cap, etc.
export function getTokenMarketData(address: string) {
  const info = lookupToken(address);
  if (!info) return null;

  const cached = getCachedPrice(address);
  const price = cached?.price ?? null;
  const token = getTokens().find(t => normalize(t.address) === normalize(address));

  return {
    symbol: info.symbol,
    decimals: info.decimals,
    price_usd: price,
    change_24h: token?.change_24h || null,
    volume_24h_usd: token?.volume_24h_usd || null,
    mcap_circ_usd: token?.mcap_circ_usd || null,
    mcap_onchain_usd: token?.mcap_onchain_usd || null,
    holders_est: token?.holders_est || null,
    liquidity_usd: token?.liquidity_usd || null,
    primary_pool: token?.primary_pool || null,
    active: token?.active || false
  };
}


