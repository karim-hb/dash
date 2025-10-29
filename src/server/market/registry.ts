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
};

type PoolEntry = {
  dex: string;
  version: string;
  address: string;
  token0: string;
  token1: string;
  fee_bps?: number | null;
  tvl_usd?: number | null;
  volume_24h_usd?: number | null;
  fees_24h_usd?: number | null;
  utilization?: number | null;
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

export function upsertToken(entry: TokenEntry) {
  tokens.set(entry.address.toLowerCase(), entry);
}

export function upsertPool(entry: PoolEntry) {
  pools.set(entry.address.toLowerCase(), entry);
}

export function upsertOracleFeed(key: string, entry: OracleFeed) {
  oracleFeeds.set(key, entry);
}

export function getTokens(): TokenEntry[] { return Array.from(tokens.values()); }
export function getPools(): PoolEntry[] { return Array.from(pools.values()); }
export function getOracleFeeds(): OracleFeed[] { return Array.from(oracleFeeds.values()); }

// Initialize with empty defaults to avoid undefined in UI
export function initializeMarketRegistries() {
  // no-op; retained for future startup hooks
}


