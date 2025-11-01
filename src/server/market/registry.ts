// In-memory registries for tokens, pools, and oracle feeds

type TokenEntry = {
  address: string;
  symbol: string;
  decimals: number;
  price_usd: number | null;
  change_24h?: number | null;
  volume_24h_usd?: number | null;
  mcap_onchain_usd?: number | null;
  mcap_circ_usd?: number | null;
  holders_est?: number | null;
  liquidity_usd?: number | null;
  primary_pool?: string | null;
  active?: boolean | null;
  heartbeat?: {
    status: 'healthy' | 'stale' | 'error';
    last_update: number | null;
    provider: string;
  } | null;
};

type PoolEntry = {
  dex: string;
  version: string;
  address: string;
  token0: string;
  token1: string;
  token0_symbol?: string | null;
  token1_symbol?: string | null;
  fee_bps?: number | null;
  tvl_usd?: number | null;
  volume_24h_usd?: number | null;
  fees_24h_usd?: number | null;
  utilization?: number | null;
  pool0_usd?: number | null;
  pool1_usd?: number | null;
  pool0_pct?: number | null;
  pool1_pct?: number | null;
  reserve_ratio?: number | null;
};

type OracleFeed = {
  provider: string; // 'Chainlink' | 'CoinGecko' | etc.
  pair: string; // e.g., 'ETH/USD'
  feed_address?: string | null;
  price_usd: number | null;
  last_updated?: number | null;
  heartbeat_sec?: number | null;
  status?: 'healthy' | 'stale' | 'error';
  deviation_vs_spot_pct?: number | null;
};

const tokens: Map<string, TokenEntry> = new Map();
const pools: Map<string, PoolEntry> = new Map();
const oracleFeeds: Map<string, OracleFeed> = new Map();

let mongoReady = false;
async function persistToken(entry: TokenEntry) {
  try {
    // Lazy import to avoid hard dependency at module load
    const { getDb, initMongo } = await import('@/lib/db/mongo');
    if (!mongoReady) {
      try { await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker'); } catch {}
      try {
        const db = getDb();
        await db.collection('market_tokens').createIndex({ address: 1 }, { unique: true });
        await db.collection('market_tokens').createIndex({ symbol: 1 });
      } catch {}
      mongoReady = true;
    }
    const db = getDb();
    await db.collection('market_tokens').updateOne(
      { address: entry.address.toLowerCase() },
      { $set: { ...entry, updated_at: new Date() } },
      { upsert: true }
    );
  } catch {}
}

export function upsertToken(entry: TokenEntry) {
  if (entry.heartbeat) {
    console.log(`📊 Storing token ${entry.symbol} with heartbeat: ${entry.heartbeat.provider} (${entry.heartbeat.status})`);
  }
  tokens.set(entry.address.toLowerCase(), entry);
  // Best-effort persistence
  // Fire and forget; don't await to avoid blocking hot path
  // noinspection JSIgnoredPromiseFromCall
  persistToken(entry);
}

export function upsertPool(entry: PoolEntry) {
  const key = entry.address.toLowerCase();
  const prev = pools.get(key) || {} as any;
  pools.set(key, { ...prev, ...entry });
}

export function upsertOracleFeed(key: string, entry: OracleFeed) {
  console.log(`📡 Upserting oracle feed: ${key} -> ${entry.pair} (${entry.provider}) status: ${entry.status}`);
  oracleFeeds.set(key, entry);
  console.log(`📡 Oracle feeds now has ${oracleFeeds.size} entries`);
}

export function getTokens(): TokenEntry[] { return Array.from(tokens.values()); }
export function getPools(): PoolEntry[] { return Array.from(pools.values()); }
export function getOracleFeeds(): OracleFeed[] { return Array.from(oracleFeeds.values()); }

// Group oracle feeds by pair for comparison view
export function getOracleFeedsByPair(): Map<string, OracleFeed[]> {
  const byPair = new Map<string, OracleFeed[]>();
  for (const feed of oracleFeeds.values()) {
    const pair = feed.pair || 'UNKNOWN';
    const existing = byPair.get(pair) || [];
    existing.push(feed);
    byPair.set(pair, existing);
  }
  return byPair;
}

// Initialize with empty defaults to avoid undefined in UI
export function initializeMarketRegistries() {
  // Pre-populate with known tokens from catalog
  try {
    const tokensCatalog = require('../catalog/tokens.json');
    let count = 0;
    for (const addr of Object.keys(tokensCatalog as any)) {
      const meta: any = (tokensCatalog as any)[addr];
      if (!tokens.has(addr.toLowerCase())) {
        upsertToken({
          address: addr,
          symbol: meta.symbol,
          decimals: meta.decimals,
          price_usd: null,
          change_24h: null,
          volume_24h_usd: null,
          mcap_onchain_usd: null,
          mcap_circ_usd: null,
          holders_est: null,
          liquidity_usd: null,
          primary_pool: null,
          active: null,
        });
        count++;
      }
    }
    console.log(`✅ Initialized ${count} tokens from catalog`);
  } catch (e) {
    console.warn('Failed to initialize token catalog:', e);
  }
}


