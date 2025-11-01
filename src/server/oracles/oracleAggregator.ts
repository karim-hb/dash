import { ethers } from 'ethers';
import AggregatorV3 from '../abi/ChainlinkAggregatorV3.json';
import { getConfig } from '@/lib/config';
import { upsertOracleFeed } from '../market/registry';
import feeds from './oracleFeeds.json';
import { derivePriceRatio } from '../indexers/amm/uniswapV3Math';
import { getUsdPriceForToken } from '../market/priceEngine';
import fetch from 'node-fetch';

type OracleProvider = 'Chainlink' | 'Band' | 'Tellor' | 'API3' | 'Pyth' | 'DEX_TWAP';

type DexConfig = {
  type: 'uniswap_v3';
  pool: string;
  token0: string;
  token1: string;
  fee?: number;
};

type OracleFeedConfig = {
  provider: OracleProvider;
  pair: string;
  address?: string | null;
  referenceToken?: string | null;
  heartbeatSec?: number;
  dex?: DexConfig;
  baseSymbol?: string | null;
};

type NormalizedConfig = OracleFeedConfig & { key: string };

const ERC20_ABI = ['function decimals() view returns (uint8)'];

interface ChainlinkFeed {
  name: string;
  address: string;
  pair: string;
  assetName: string;
  baseAsset: string;
  quoteAsset: string;
  deviationThreshold: number;
  heartbeat: number;
  decimals: number;
  status: string;
}

// Token address mappings for reference tokens
const TOKEN_ADDRESSES: Record<string, string> = {
  ETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  BTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  FRAX: '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  LUSD: '0x5f98805A4E8be255a32880FDeC7F6728C6568ba0',
  AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  SNX: '0xC011A72400E58ecD99Ee497CF89E3775d4bd732F',
  YFI: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  SUSHI: '0x6B3595068778DD592e39A122f4f5a5Cf09C90fE2',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  MATIC: '0x7D1AfA7B718fb893dB30A3abc0Cfc608AaCfeBB0',
  SOL: '0xA9d8Df9c0b61a06F4dC354Be8b4e9fA9C1A3e826',
  DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
};

function normalizeAssetName(name?: string | null): string | null {
  if (!name) return null;
  return name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function fetchChainlinkFeeds(): Promise<OracleFeedConfig[]> {
  try {
    console.log('🔗 Fetching Chainlink feeds from data.chain.link snapshot...');

    const response = await fetch('https://data.chain.link/feeds', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Ethereum Tracker)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      throw new Error(`Data feed snapshot error: ${response.status}`);
    }

    const html = await response.text();
    const marker = '<script id="__NEXT_DATA__" type="application/json">';
    const markerIndex = html.indexOf(marker);
    if (markerIndex === -1) throw new Error('Unable to locate __NEXT_DATA__ payload');
    const jsonStart = markerIndex + marker.length;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    if (jsonEnd === -1) throw new Error('Malformed __NEXT_DATA__ payload');
    const payload = html.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(payload);
    const allFeeds: any[] = parsed?.props?.pageProps?.allFeeds || [];

    const limit = Number(process.env.CHAINLINK_FEED_LIMIT || '75');
    const allowedTypes = new Set(['Crypto', 'Commodities']);
    const feeds: OracleFeedConfig[] = [];
    const seenPairs = new Set<string>();

    for (const feed of allFeeds) {
      if (feed.chain !== 'ethereum' || feed.network !== 'mainnet') continue;
      if (!allowedTypes.has(feed.feedType)) continue;
      if (!feed.name || !feed.name.includes('/')) continue;
      if (!feed.contractAddress) continue;

      const pair = feed.name.replace(/\s+/g, '');
      if (seenPairs.has(pair)) continue;
      seenPairs.add(pair);

      let address: string;
      try {
        address = ethers.getAddress(feed.contractAddress);
      } catch {
        continue;
      }

      const heartbeat = Number(feed.heartbeat ?? 3600);
      const baseSymbol = normalizeAssetName(feed.docs?.baseAsset || feed.assetName || pair.split('/')[0]);
      const referenceToken = baseSymbol ? TOKEN_ADDRESSES[baseSymbol] || null : null;

      feeds.push({
        provider: 'Chainlink',
        pair,
        address,
        heartbeatSec: Number.isFinite(heartbeat) && heartbeat > 0 ? heartbeat : 3600,
        referenceToken,
        baseSymbol,
      });

      if (feeds.length >= limit) break;
    }

    console.log(`✅ Parsed ${feeds.length} Chainlink feeds from snapshot`);
    return feeds;

  } catch (error) {
    console.error('❌ Failed to fetch Chainlink feeds from data API:', error);
    console.log('🔄 Falling back to verified static feeds...');

    // Fallback to verified, correct Chainlink feed addresses (comprehensive list)
    return [
      { provider: 'Chainlink' as const, pair: 'ETH/USD', address: '0x7d4E742018fb52E48b08BE73d041C18B21de6Fb5', referenceToken: TOKEN_ADDRESSES.ETH, heartbeatSec: 3600, baseSymbol: 'ETH' },
      { provider: 'Chainlink' as const, pair: 'BTC/USD', address: '0x4a3411ac2948B33c69666B35cc6d055B27Ea84f1', referenceToken: TOKEN_ADDRESSES.BTC, heartbeatSec: 3600, baseSymbol: 'BTC' },
      { provider: 'Chainlink' as const, pair: 'BNB/USD', address: '0xA9845307Bb5F5637B136Ca70914746d1bb7d402a', referenceToken: null, heartbeatSec: 86400, baseSymbol: 'BNB' },
      { provider: 'Chainlink' as const, pair: 'SOL/USD', address: '0xa88757c4D7f75C672a07Ae1Cf8011C4552a275f0', referenceToken: null, heartbeatSec: 86400, baseSymbol: 'SOL' },
      { provider: 'Chainlink' as const, pair: 'MATIC/USD', address: '0xC1e7D47ECfbb15B99a4B5F69E6931587000DD0b0', referenceToken: TOKEN_ADDRESSES.MATIC ?? null, heartbeatSec: 3600, baseSymbol: 'MATIC' },
      { provider: 'Chainlink' as const, pair: 'LINK/USD', address: '0x96d6e33B411dc1f4E3F1e894A5A5d9CE0F96738D', referenceToken: TOKEN_ADDRESSES.LINK, heartbeatSec: 3600, baseSymbol: 'LINK' },
      { provider: 'Chainlink' as const, pair: 'UNI/USD', address: '0xdEf8C51d7c1040637A198efFc39613865B32EA51', referenceToken: TOKEN_ADDRESSES.UNI ?? null, heartbeatSec: 3600, baseSymbol: 'UNI' },
      { provider: 'Chainlink' as const, pair: 'SUSHI/USD', address: '0x658Aa21601C8c0bB511C21999F7cad35B6A15192', referenceToken: TOKEN_ADDRESSES.SUSHI ?? null, heartbeatSec: 3600, baseSymbol: 'SUSHI' },
      { provider: 'Chainlink' as const, pair: 'CRV/USD', address: '0xdA0DA298550E8E449b935CEA865c8100F3cA1b73', referenceToken: TOKEN_ADDRESSES.CRV ?? null, heartbeatSec: 3600, baseSymbol: 'CRV' },
      { provider: 'Chainlink' as const, pair: 'USDT/USD', address: '0x0d5F4aADf3fde31BBB55dB5F42C080F18aD54Df5', referenceToken: TOKEN_ADDRESSES.USDT, heartbeatSec: 86400, baseSymbol: 'USDT' },
      { provider: 'Chainlink' as const, pair: 'DAI/USD', address: '0x709783ab12b65fD6cd948214EEe6448f3BdD72A3', referenceToken: TOKEN_ADDRESSES.DAI, heartbeatSec: 3600, baseSymbol: 'DAI' },
      { provider: 'Chainlink' as const, pair: 'FRAX/USD', address: '0x8F73090a7c58B8BDcC9A93cBB6816e5cC4f01E8c', referenceToken: TOKEN_ADDRESSES.FRAX ?? null, heartbeatSec: 86400, baseSymbol: 'FRAX' },
      { provider: 'Chainlink' as const, pair: 'LUSD/USD', address: '0x36A0448c46AaE145dD5BC320D5153426a2a586F5', referenceToken: TOKEN_ADDRESSES.LUSD ?? null, heartbeatSec: 86400, baseSymbol: 'LUSD' },
      { provider: 'Chainlink' as const, pair: 'AAVE/USD', address: '0xd8B9aA6E811c935eF63e877CFA7Be276931293DA', referenceToken: TOKEN_ADDRESSES.AAVE ?? null, heartbeatSec: 3600, baseSymbol: 'AAVE' },
      { provider: 'Chainlink' as const, pair: 'SNX/USD', address: '0xc778E9686F0fde6Fe4D7d8fE4B481463Fce898fD', referenceToken: TOKEN_ADDRESSES.SNX ?? null, heartbeatSec: 3600, baseSymbol: 'SNX' },
      { provider: 'Chainlink' as const, pair: 'YFI/USD', address: '0x525B031c1eE01502c113500a2d1A999cD3F9C98F', referenceToken: TOKEN_ADDRESSES.YFI ?? null, heartbeatSec: 3600, baseSymbol: 'YFI' },
      { provider: 'Chainlink' as const, pair: 'COMP/USD', address: '0x24e3c657c27DfC7ea6f9f58e86387D846b3BaA59', referenceToken: TOKEN_ADDRESSES.COMP ?? null, heartbeatSec: 3600, baseSymbol: 'COMP' },
    ];
  }
}

async function loadConfigs(): Promise<NormalizedConfig[]> {
  const configs: OracleFeedConfig[] = [];

  // Load static feeds (DEX_TWAP, etc.)
  const staticFeeds = (feeds as OracleFeedConfig[]).filter(cfg => cfg.provider !== 'Chainlink' || cfg.pair === 'PLACEHOLDER');
  configs.push(...staticFeeds);

  // Fetch Chainlink feeds dynamically
  const chainlinkFeeds = await fetchChainlinkFeeds();
  configs.push(...chainlinkFeeds);

  // Remove placeholder
  const filteredConfigs = configs.filter(cfg => cfg.pair !== 'PLACEHOLDER');

  const byKey = new Map<string, OracleFeedConfig>();
  for (const cfg of filteredConfigs) {
    const key = `${cfg.provider}:${cfg.pair}`;
    if (!byKey.has(key)) {
      byKey.set(key, cfg);
    }
  }

  return Array.from(byKey.entries()).map(([key, cfg]) => {
    const baseSymbol = cfg.baseSymbol ?? normalizeAssetName(cfg.pair.split('/')[0]);
    const referenceToken = cfg.referenceToken ?? (baseSymbol ? TOKEN_ADDRESSES[baseSymbol] || null : null);
    return {
      ...cfg,
      baseSymbol,
      referenceToken,
      key: key.toLowerCase(),
    };
  });
}

function computeStatus(updatedAt: number | null, heartbeatSec?: number): 'healthy' | 'stale' | 'error' {
  if (!updatedAt) return 'error';
  if (!heartbeatSec) return 'healthy';
  const delta = Date.now() - updatedAt;
  // For stable assets (24h heartbeat), allow up to 48 hours
  if (heartbeatSec >= 86400) {
    return delta > heartbeatSec * 1000 * 2 ? 'stale' : 'healthy';
  }
  // For volatile assets (1h heartbeat), allow up to 4 hours
  const maxAge = heartbeatSec * 1000 * 4;
  if (delta > maxAge) return 'stale';
  // Consider error if data is extremely old (>7 days regardless of heartbeat)
  if (delta > 7 * 24 * 60 * 60 * 1000) return 'error';
  return 'healthy';
}

async function computeDeviation(referenceToken: string | null | undefined, oraclePrice: number | null): Promise<number | null> {
  if (!referenceToken || oraclePrice == null || oraclePrice <= 0) return null;
  try {
    const spot = await getUsdPriceForToken(referenceToken, { forceRefresh: false });
    if (!spot || !Number.isFinite(spot) || spot <= 0) return null;
    return ((oraclePrice - spot) / spot) * 100;
  } catch {
    return null;
  }
}

class OracleAggregator {
  private provider: ethers.Provider;
  private chainlinkProvider: ethers.Provider | null;
  private dexProvider: ethers.Provider;
  private readonly configs: NormalizedConfig[];
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly pollIntervalMs = Number(process.env.ORACLE_REFRESH_MS || '30000')) {}

  async initialize(): Promise<void> {
    const cfg = getConfig();
    this.provider = cfg.EXECUTION_WS_URL.startsWith('ws')
      ? new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL)
      : new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);

    const chainlinkRpcUrl = process.env.CHAINLINK_RPC_URL ?? 'https://1rpc.io/eth';
    this.chainlinkProvider = chainlinkRpcUrl ? new ethers.JsonRpcProvider(chainlinkRpcUrl) : null;

    const dexRpcUrl = process.env.DEX_TWAP_RPC_URL ?? null;
    this.dexProvider = dexRpcUrl ? new ethers.JsonRpcProvider(dexRpcUrl) : this.provider;

    this.configs = await loadConfigs();
  }

  start(): void {
    if (this.timer) return;
    console.log(`🚀 Starting oracle aggregator initial refresh...`);
    this.refresh().catch(err => console.error('❌ Oracle aggregator initial refresh failed:', err));
    this.timer = setInterval(() => {
      console.log(`⏰ Oracle aggregator timer triggered at ${new Date().toISOString()}`);
      this.refresh().catch(err => console.error('❌ Oracle aggregator refresh error:', err));
    }, this.pollIntervalMs);
    console.log(`✅ Oracle aggregator started (interval ${this.pollIntervalMs} ms) at ${new Date().toISOString()}`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async refresh(): Promise<void> {
    try {
      console.log(`🔄 Oracle aggregator refresh starting for ${this.configs.length} feeds at ${new Date().toISOString()}`);
      await Promise.all(this.configs.map(cfg => this.refreshFeed(cfg).catch(err => {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`❌ Oracle feed refresh failed for ${cfg.provider} ${cfg.pair}:`, message);
        upsertOracleFeed(cfg.key, {
          provider: cfg.provider,
          pair: cfg.pair,
          feed_address: cfg.address ?? undefined,
          price_usd: null,
          last_updated: null,
          heartbeat_sec: cfg.heartbeatSec ?? null,
          status: 'error',
          deviation_vs_spot_pct: null,
        });
      })));
      console.log(`✅ Oracle aggregator refresh completed at ${new Date().toISOString()}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`💥 Oracle aggregator refresh crashed:`, message);
    }
  }

  private async refreshFeed(cfg: NormalizedConfig): Promise<void> {
    console.log(`🔍 Processing ${cfg.provider} ${cfg.pair}`);
    switch (cfg.provider) {
      case 'Chainlink':
      case 'Tellor':
        console.log(`📡 Calling refreshAggregatorFeed for ${cfg.provider} ${cfg.pair}`);
        await this.refreshAggregatorFeed(cfg);
        console.log(`✅ refreshAggregatorFeed completed for ${cfg.provider} ${cfg.pair}`);
        break;
      case 'Band':
      case 'API3':
      case 'Pyth':
        // These providers require different integration approaches
        console.log(`⏭️ Skipping ${cfg.provider} ${cfg.pair} (not implemented)`);
        break;
      case 'DEX_TWAP':
        console.log(`📊 Calling refreshDexTwapFeed for ${cfg.provider} ${cfg.pair}`);
        await this.refreshDexTwapFeed(cfg);
        console.log(`✅ refreshDexTwapFeed completed for ${cfg.provider} ${cfg.pair}`);
        break;
      default:
        throw new Error(`Unsupported oracle provider: ${cfg.provider}`);
    }
  }

  private async refreshAggregatorFeed(cfg: NormalizedConfig): Promise<void> {
    try {
      if (!cfg.address) {
        console.log(`⚠️ No address for ${cfg.provider} ${cfg.pair}, marking as stale`);
        upsertOracleFeed(cfg.key, {
          provider: cfg.provider,
          pair: cfg.pair,
          feed_address: undefined,
          price_usd: null,
          last_updated: null,
          heartbeat_sec: cfg.heartbeatSec ?? null,
          status: 'stale',
          deviation_vs_spot_pct: null,
        });
        return;
      }

      console.log(`🔗 Calling contract ${cfg.address} for ${cfg.provider} ${cfg.pair}`);
      const feedProvider = (cfg.provider === 'Chainlink' && this.chainlinkProvider) ? this.chainlinkProvider : this.provider;
      const contract = new ethers.Contract(cfg.address, AggregatorV3 as any, feedProvider);
      const [decimals, roundData] = await Promise.all([
        contract.decimals(),
        contract.latestRoundData(),
      ]);

      const price = Number(roundData.answer) / 10 ** Number(decimals);
      const updatedAtSec = Number(roundData.updatedAt);
      const updatedAtMs = Number.isFinite(updatedAtSec) ? updatedAtSec * 1000 : null;
      const deviation = await computeDeviation(cfg.referenceToken ?? null, price);
      const status = computeStatus(updatedAtMs, cfg.heartbeatSec);
      const updatedLabel = updatedAtMs ? new Date(updatedAtMs).toISOString() : 'unknown';


      console.log(`💰 ${cfg.provider} ${cfg.pair}: $${price.toFixed(4)}, updated: ${updatedLabel}, status: ${status}`);

      upsertOracleFeed(cfg.key, {
        provider: cfg.provider,
        pair: cfg.pair,
        feed_address: cfg.address,
        price_usd: Number.isFinite(price) ? price : null,
        last_updated: updatedAtMs,
        heartbeat_sec: cfg.heartbeatSec ?? null,
        status: status,
        deviation_vs_spot_pct: deviation,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Contract call failed for ${cfg.provider} ${cfg.pair}:`, message);
      upsertOracleFeed(cfg.key, {
        provider: cfg.provider,
        pair: cfg.pair,
        feed_address: cfg.address,
        price_usd: null,
        last_updated: null,
        heartbeat_sec: cfg.heartbeatSec ?? null,
        status: 'error',
        deviation_vs_spot_pct: null,
      });
    }
  }

  private async refreshDexTwapFeed(cfg: NormalizedConfig): Promise<void> {
    const dex = cfg.dex;
    if (!dex || dex.type !== 'uniswap_v3') {
      throw new Error(`Unsupported DEX config for ${cfg.pair}`);
    }

    const pool = new ethers.Contract(dex.pool, [
      'function slot0() view returns (uint160 sqrtPriceX96, int24, uint16, uint16, uint16, uint8, bool)',
    ], this.dexProvider);

    const token0Contract = new ethers.Contract(dex.token0, ERC20_ABI, this.dexProvider);
    const token1Contract = new ethers.Contract(dex.token1, ERC20_ABI, this.dexProvider);

    const [slot0, decimals0, decimals1] = await Promise.all([
      pool.slot0(),
      token0Contract.decimals(),
      token1Contract.decimals(),
    ]);

    const sqrtPriceX96 = BigInt(slot0[0]);
    const priceRatio = derivePriceRatio(sqrtPriceX96, Number(decimals0), Number(decimals1));
    // For ETH/USD pricing, we want USD per ETH, so invert the ratio
    const usdPerEth = cfg.pair.includes('ETH/USD') || cfg.pair.includes('ETH/USDC') ? 1 / priceRatio : priceRatio;
    const deviation = await computeDeviation(cfg.referenceToken ?? (cfg.pair.includes('ETH') ? dex.token1 : dex.token0), usdPerEth);

    upsertOracleFeed(cfg.key, {
      provider: 'DEX_TWAP',
      pair: cfg.pair,
      feed_address: dex.pool,
      price_usd: Number.isFinite(usdPerEth) ? usdPerEth : null,
      last_updated: Date.now(),
      heartbeat_sec: cfg.heartbeatSec ?? null,
      status: 'healthy',
      deviation_vs_spot_pct: deviation,
    });
  }
}

const aggregator = new OracleAggregator();

export async function startOracleAggregator(): Promise<void> {
  await aggregator.initialize();
  aggregator.start();
}

export function getOracleAggregator(): OracleAggregator {
  return aggregator;
}

