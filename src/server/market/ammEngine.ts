import { upsertPool, upsertToken, getPools, getTokens } from './registry';
import { getUsdPriceForToken, getCachedPrice, PriceCacheEntry } from './priceEngine';
import { setV2Reserves } from './reserves';
import { getTokenMetadata } from '../modules/tokens';
import { ethers } from 'ethers';

export type PoolMeta = {
  address: string;
  dex: string;
  version: string;
  token0: string;
  token1: string;
  feeBps?: number | null;
};

type PoolSnapshot = {
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  pool0Usd: number | null;
  pool1Usd: number | null;
  tvlUsd: number | null;
  pool0Pct: number | null;
  pool1Pct: number | null;
  reserveRatio: number | null;
  updatedAt: number;
};

type TokenAggregate = {
  liquidityUsd: number;
  pools: Set<string>;
  lastUpdate: number;
};

const poolSnapshots = new Map<string, PoolSnapshot>();
const tokenAggregates = new Map<string, TokenAggregate>();
const tokenPoolContribution = new Map<string, number>();
const tokenPrimaryPool = new Map<string, { pool: string; value: number }>();

let engineStarted = false;

const PRICE_REFRESH_MS = Number(process.env.AMM_PRICE_REFRESH_MS || '20000');

export async function registerPool(meta: PoolMeta): Promise<void> {
  const key = poolKey(meta.address);
  await ensureTokenMeta(meta.token0);
  await ensureTokenMeta(meta.token1);
  seedTokenAggregate(meta.token0, key);
  seedTokenAggregate(meta.token1, key);

  const existing = findPool(meta.address);
  const token0Meta = await ensureTokenMeta(meta.token0);
  const token1Meta = await ensureTokenMeta(meta.token1);

  upsertPool({
    dex: meta.dex,
    version: meta.version,
    address: meta.address,
    token0: meta.token0,
    token1: meta.token1,
    token0_symbol: existing?.token0_symbol ?? token0Meta.symbol,
    token1_symbol: existing?.token1_symbol ?? token1Meta.symbol,
    fee_bps: meta.feeBps ?? existing?.fee_bps ?? null,
    tvl_usd: existing?.tvl_usd ?? null,
    volume_24h_usd: existing?.volume_24h_usd ?? null,
    fees_24h_usd: existing?.fees_24h_usd ?? null,
    utilization: existing?.utilization ?? null,
    pool0_usd: existing?.pool0_usd ?? null,
    pool1_usd: existing?.pool1_usd ?? null,
    pool0_pct: existing?.pool0_pct ?? null,
    pool1_pct: existing?.pool1_pct ?? null,
    reserve_ratio: existing?.reserve_ratio ?? null,
  });

  startAmmEngine();
}

export async function updateV2PoolReserves(meta: PoolMeta, reserve0: bigint, reserve1: bigint): Promise<void> {
  await registerPool(meta);
  setV2Reserves(meta.address, meta.token0, meta.token1, reserve0, reserve1);
  const [token0Meta, token1Meta] = await Promise.all([
    ensureTokenMeta(meta.token0),
    ensureTokenMeta(meta.token1),
  ]);

  const [price0, price1] = await Promise.all([
    getUsdPriceForToken(meta.token0),
    getUsdPriceForToken(meta.token1),
  ]);

  const snapshot = buildPoolSnapshot({
    token0: meta.token0,
    token1: meta.token1,
    reserve0,
    reserve1,
    decimals0: token0Meta.decimals,
    decimals1: token1Meta.decimals,
    price0,
    price1,
  });

  applyPoolSnapshot(meta, snapshot, token0Meta, token1Meta, price0, price1);
}

export async function updateV3PoolBalances(meta: PoolMeta, balance0: bigint, balance1: bigint): Promise<void> {
  await registerPool(meta);
  const [token0Meta, token1Meta] = await Promise.all([
    ensureTokenMeta(meta.token0),
    ensureTokenMeta(meta.token1),
  ]);

  const [price0, price1] = await Promise.all([
    getUsdPriceForToken(meta.token0),
    getUsdPriceForToken(meta.token1),
  ]);

  const snapshot = buildPoolSnapshot({
    token0: meta.token0,
    token1: meta.token1,
    reserve0: balance0,
    reserve1: balance1,
    decimals0: token0Meta.decimals,
    decimals1: token1Meta.decimals,
    price0,
    price1,
  });

  applyPoolSnapshot(meta, snapshot, token0Meta, token1Meta, price0, price1);
}

export function startAmmEngine(): void {
  if (engineStarted) return;
  engineStarted = true;

  const refresh = async () => {
    const tokens = Array.from(tokenAggregates.keys());
    if (!tokens.length) return;
    for (const token of tokens) {
      try {
        await getUsdPriceForToken(token, { forceRefresh: true });
        const meta = await ensureTokenMeta(token);
        updateTokenEntry(token, meta);
      } catch (err) {
        console.error('AMM engine price refresh failed for token', token, err);
      }
    }
  };

  refresh().catch(err => console.error('AMM engine initial refresh failed', err));
  setInterval(() => { refresh().catch(err => console.error('AMM engine refresh error', err)); }, PRICE_REFRESH_MS);
}

// --- helpers ---

type BuildSnapshotArgs = {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  decimals0: number;
  decimals1: number;
  price0: number | null;
  price1: number | null;
};

type TokenMetaLite = { symbol: string; decimals: number };

async function ensureTokenMeta(address: string): Promise<TokenMetaLite> {
  const lower = address.toLowerCase();
  const existing = findToken(address);
  if (existing && existing.symbol && existing.decimals != null) {
    return { symbol: existing.symbol, decimals: existing.decimals };
  }

  const meta = await getTokenMetadataWithRetry(address);
  const payload: any = {
    address,
    symbol: meta.symbol,
    decimals: meta.decimals,
    price_usd: existing?.price_usd ?? null,
    change_24h: existing?.change_24h ?? null,
    volume_24h_usd: existing?.volume_24h_usd ?? null,
    mcap_onchain_usd: existing?.mcap_onchain_usd ?? null,
    mcap_circ_usd: existing?.mcap_circ_usd ?? null,
    holders_est: existing?.holders_est ?? null,
    liquidity_usd: existing?.liquidity_usd ?? null,
    primary_pool: existing?.primary_pool ?? null,
    active: existing?.active ?? null,
  };
  if (existing?.heartbeat) payload.heartbeat = existing.heartbeat;
  upsertToken(payload);
  return { symbol: meta.symbol, decimals: meta.decimals };
}

async function getTokenMetadataWithRetry(address: string, attempts = 3, delayMs = 250): Promise<{ symbol: string; decimals: number }> {
  let lastError: unknown = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const meta = await getTokenMetadata(address);
      return { symbol: meta.symbol, decimals: meta.decimals };
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise(res => setTimeout(res, delayMs * (i + 1)));
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Token metadata fetch failed for ${address}`);
}

function buildPoolSnapshot(args: BuildSnapshotArgs): PoolSnapshot {
  const { token0, token1, reserve0, reserve1, decimals0, decimals1, price0, price1 } = args;
  const qty0 = Number(ethers.formatUnits(reserve0, decimals0));
  const qty1 = Number(ethers.formatUnits(reserve1, decimals1));

  const pool0Usd = price0 != null && isFinite(price0) ? qty0 * price0 : null;
  const pool1Usd = price1 != null && isFinite(price1) ? qty1 * price1 : null;
  const tvlUsd = sumDefined(pool0Usd, pool1Usd);
  const pool0Pct = tvlUsd && pool0Usd != null && tvlUsd > 0 ? (pool0Usd / tvlUsd) * 100 : null;
  const pool1Pct = tvlUsd && pool1Usd != null && tvlUsd > 0 ? (pool1Usd / tvlUsd) * 100 : null;
  const reserveRatio = pool0Usd != null && pool1Usd && pool1Usd > 0 ? pool0Usd / pool1Usd : null;

  return {
    token0: token0.toLowerCase(),
    token1: token1.toLowerCase(),
    reserve0: reserve0.toString(),
    reserve1: reserve1.toString(),
    pool0Usd,
    pool1Usd,
    tvlUsd,
    pool0Pct,
    pool1Pct,
    reserveRatio,
    updatedAt: Date.now(),
  };
}

function applyPoolSnapshot(meta: PoolMeta, snapshot: PoolSnapshot, token0Meta: TokenMetaLite, token1Meta: TokenMetaLite, price0: number | null, price1: number | null) {
  const key = poolKey(meta.address);
  const prev = poolSnapshots.get(key);
  if (!hasMeaningfulPoolChange(prev, snapshot)) {
    return;
  }
  poolSnapshots.set(key, snapshot);

  updateTokenContribution(key, snapshot.token0, snapshot.pool0Usd);
  updateTokenContribution(key, snapshot.token1, snapshot.pool1Usd);

  const existing = findPool(meta.address);
  upsertPool({
    dex: meta.dex,
    version: meta.version,
    address: meta.address,
    token0: meta.token0,
    token1: meta.token1,
    token0_symbol: token0Meta.symbol,
    token1_symbol: token1Meta.symbol,
    fee_bps: meta.feeBps ?? existing?.fee_bps ?? null,
    tvl_usd: snapshot.tvlUsd ?? existing?.tvl_usd ?? null,
    volume_24h_usd: existing?.volume_24h_usd ?? null,
    fees_24h_usd: existing?.fees_24h_usd ?? null,
    utilization: existing?.utilization ?? null,
    pool0_usd: snapshot.pool0Usd,
    pool1_usd: snapshot.pool1Usd,
    pool0_pct: snapshot.pool0Pct,
    pool1_pct: snapshot.pool1Pct,
    reserve_ratio: snapshot.reserveRatio,
  });

  updateTokenEntry(meta.token0, token0Meta, price0);
  updateTokenEntry(meta.token1, token1Meta, price1);
}

function updateTokenEntry(address: string, meta: TokenMetaLite, explicitPrice?: number | null) {
  const lower = address.toLowerCase();
  const existing = findToken(address);
  const aggregate = tokenAggregates.get(lower);
  const priceEntry = getCachedPrice(address);
  const price = explicitPrice !== undefined
    ? (explicitPrice ?? priceEntry?.price ?? existing?.price_usd ?? null)
    : priceEntry?.price ?? existing?.price_usd ?? null;
  const heartbeat = buildHeartbeat(address, priceEntry ?? null);
  const primary = tokenPrimaryPool.get(lower);

  const payload: any = {
    address,
    symbol: meta.symbol,
    decimals: meta.decimals,
    price_usd: price,
    change_24h: existing?.change_24h ?? null,
    volume_24h_usd: existing?.volume_24h_usd ?? null,
    mcap_onchain_usd: existing?.mcap_onchain_usd ?? null,
    mcap_circ_usd: existing?.mcap_circ_usd ?? null,
    holders_est: existing?.holders_est ?? null,
    liquidity_usd: aggregate ? Number(aggregate.liquidityUsd) : existing?.liquidity_usd ?? null,
    primary_pool: primary?.pool ?? existing?.primary_pool ?? null,
    active: aggregate ? aggregate.liquidityUsd > 0 : existing?.active ?? null,
  };
  if (heartbeat) {
    payload.heartbeat = heartbeat;
  } else if (existing?.heartbeat) {
    payload.heartbeat = existing.heartbeat;
  }
  upsertToken(payload);
}

function buildHeartbeat(address: string, entry: PriceCacheEntry | null): { status: 'healthy' | 'stale' | 'error'; last_update: number | null; provider: string } | undefined {
  const cacheEntry = entry ?? getCachedPrice(address);
  if (!cacheEntry) return undefined;
  // Suppress noisy 'none/error' heartbeat in early startup; defer until a real source is available
  if ((cacheEntry.provider || '').toLowerCase() === 'none') return undefined;
  return {
    status: cacheEntry.heartbeat,
    last_update: cacheEntry.updatedAt,
    provider: cacheEntry.provider,
  };
}

function updateTokenContribution(pool: string, token: string, usd: number | null) {
  const tokenKey = token.toLowerCase();
  const key = contributionKey(pool, tokenKey);
  const previous = tokenPoolContribution.get(key) ?? 0;
  const next = usd != null && isFinite(usd) ? usd : 0;
  if (Math.abs(previous - next) < 1e-6) return;
  tokenPoolContribution.set(key, next);

  const aggregate = tokenAggregates.get(tokenKey) || { liquidityUsd: 0, pools: new Set<string>(), lastUpdate: 0 };
  aggregate.liquidityUsd = Math.max(0, aggregate.liquidityUsd - previous + next);
  aggregate.pools.add(pool);
  aggregate.lastUpdate = Date.now();
  tokenAggregates.set(tokenKey, aggregate);

  const primary = tokenPrimaryPool.get(tokenKey);
  if (!primary || next > primary.value + 1e-6 || primary.pool === pool) {
    tokenPrimaryPool.set(tokenKey, recomputePrimaryPool(tokenKey));
  }
}

function recomputePrimaryPool(token: string): { pool: string; value: number } {
  const tokenKey = token.toLowerCase();
  let bestPool = '';
  let bestValue = 0;
  for (const [key, value] of tokenPoolContribution.entries()) {
    const [, tokenPart] = key.split(':');
    if (tokenPart === tokenKey && value > bestValue) {
      bestValue = value;
      bestPool = key.split(':')[0];
    }
  }
  return { pool: bestPool, value: bestValue };
}

function hasMeaningfulPoolChange(prev: PoolSnapshot | undefined, next: PoolSnapshot): boolean {
  if (!prev) return true;
  if (prev.reserve0 !== next.reserve0 || prev.reserve1 !== next.reserve1) return true;
  if (!nearlyEqual(prev.pool0Usd, next.pool0Usd)) return true;
  if (!nearlyEqual(prev.pool1Usd, next.pool1Usd)) return true;
  if (!nearlyEqual(prev.tvlUsd, next.tvlUsd)) return true;
  if (!nearlyEqual(prev.pool0Pct, next.pool0Pct, 0.01)) return true;
  if (!nearlyEqual(prev.pool1Pct, next.pool1Pct, 0.01)) return true;
  if (!nearlyEqual(prev.reserveRatio, next.reserveRatio, 0.01)) return true;
  return false;
}

function nearlyEqual(a: number | null, b: number | null, relTol = 0.005): boolean {
  if (a == null && b == null) return true;
  if (a == null || b == null) return false;
  const diff = Math.abs(a - b);
  const scale = Math.max(Math.abs(a), Math.abs(b), 1);
  return diff <= relTol * scale;
}

function sumDefined(...vals: Array<number | null>): number | null {
  let sum = 0;
  let counted = 0;
  for (const v of vals) {
    if (v != null && isFinite(v)) {
      sum += v;
      counted += 1;
    }
  }
  return counted === 0 ? null : sum;
}

function seedTokenAggregate(token: string, pool: string) {
  const key = token.toLowerCase();
  if (!tokenAggregates.has(key)) {
    tokenAggregates.set(key, { liquidityUsd: 0, pools: new Set<string>([pool]), lastUpdate: Date.now() });
  } else {
    tokenAggregates.get(key)!.pools.add(pool);
  }
}

function findPool(address: string): any {
  const lower = address.toLowerCase();
  return getPools().find(p => p.address.toLowerCase() === lower);
}

function findToken(address: string): any {
  const lower = address.toLowerCase();
  return getTokens().find(t => t.address.toLowerCase() === lower);
}

function poolKey(address: string): string {
  return address.toLowerCase();
}

function contributionKey(pool: string, token: string): string {
  return `${pool}:${token}`;
}
