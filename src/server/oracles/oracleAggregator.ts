import { ethers } from 'ethers';
import AggregatorV3 from '../abi/ChainlinkAggregatorV3.json';
import { getConfig } from '@/lib/config';
import { upsertOracleFeed } from '../market/registry';
import staticFeedsJson from './oracleFeeds.json';
import { derivePriceRatio } from '../indexers/amm/uniswapV3Math';
import { getUsdPriceForToken } from '../market/priceEngine';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

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
  baseAddress?: string | null;
  quoteAddress?: string | null;
  staleToleranceMultiplier?: number; // multiply heartbeat tolerance for status
};

type NormalizedConfig = OracleFeedConfig & { key: string };

const ERC20_ABI = ['function decimals() view returns (uint8)'];

const FEED_REGISTRY_ADDRESS = '0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf';

/**
 * Helper to check if an error is an expected "execution reverted" error
 * These are normal when querying non-existent contracts or feeds
 */
function isExecutionRevertedError(error: any): boolean {
  if (!error) return false;
  const message = error.message || error.toString() || '';
  const code = error.code;
  
  // Check for execution reverted in message
  if (message.includes('execution reverted') || 
      message.includes('Execution reverted') ||
      message.includes('execution revert')) {
    return true;
  }
  
  // Check for RPC error code -32000 (Server error / execution reverted)
  if (code === -32000 || code === '-32000') {
    return true;
  }
  
  // Check for error reason containing revert
  if (error.reason && (
    error.reason.includes('reverted') ||
    error.reason.includes('revert')
  )) {
    return true;
  }
  
  return false;
}

/**
 * Wrapper for contract calls that suppresses expected execution reverted errors
 */
async function safeContractCall<T>(
  call: () => Promise<T>,
  defaultValue: T | null = null
): Promise<T | null> {
  try {
    return await call();
  } catch (error: any) {
    // Suppress expected execution reverted errors (non-existent contracts/feeds)
    if (isExecutionRevertedError(error)) {
      return defaultValue;
    }
    // Re-throw unexpected errors
    throw error;
  }
}
const FEED_REGISTRY_ABI = [
  'function getFeed(address base, address quote) external view returns (address aggregator)',
  'function latestRoundData(address base, address quote) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals(address base, address quote) external view returns (uint8)',
  // Enhanced (best-effort) methods; guarded by try/catch where used
  'function getRoundData(address base, address quote, uint80 roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function latestRound(address base, address quote) external view returns (uint256 roundId)',
  'function proposedGetRoundData(address base, address quote, uint80 roundId) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function proposedLatestRoundData(address base, address quote) external view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'
];

const USD_QUOTE_ADDRESS = '0x0000000000000000000000000000000000000348';

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
  MKR: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  LDO: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
  COMP: '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  UNI: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  SUSHI: '0x6B3595068778DD592e39A122f4f5a5Cf09C90fE2',
  CRV: '0xD533a949740bb3306d119CC777fa900bA034cd52',
  MATIC: '0x7D1AfA7B718fb893dB30A3abc0Cfc608AaCfeBB0',
  SOL: '0xA9d8Df9c0b61a06F4dC354Be8b4e9fA9C1A3e826',
  DOT: '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
  BNB: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
};

const BASE_ADDRESS_OVERRIDES: Record<string, string> = {
  ETH: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};

function normalizeAssetName(name?: string | null): string | null {
  if (!name) return null;
  return name.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function loadConfigs(): Promise<NormalizedConfig[]> {
  const configs: OracleFeedConfig[] = (staticFeedsJson as OracleFeedConfig[]).filter(cfg => cfg.pair && cfg.provider);

  const byKey = new Map<string, OracleFeedConfig>();
  for (const cfg of configs) {
    const key = `${cfg.provider}:${cfg.pair}`;
    if (!byKey.has(key)) {
      byKey.set(key, cfg);
    }
  }

  return Array.from(byKey.entries()).map(([key, cfg]) => {
    const baseSymbol = cfg.baseSymbol ?? normalizeAssetName(cfg.pair.split('/')[0]);
    const referenceToken = cfg.referenceToken ?? (baseSymbol ? TOKEN_ADDRESSES[baseSymbol] || null : null);
    const baseAddress = cfg.baseAddress ?? (baseSymbol && BASE_ADDRESS_OVERRIDES[baseSymbol] ? BASE_ADDRESS_OVERRIDES[baseSymbol] : null);
    const quoteAddress = cfg.quoteAddress ?? (cfg.provider === 'Chainlink' ? USD_QUOTE_ADDRESS : null);
    return {
      ...cfg,
      baseSymbol,
      referenceToken,
      baseAddress,
      quoteAddress,
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
  private provider!: ethers.Provider;
  private dexProvider!: ethers.Provider;
  private configs: NormalizedConfig[] = [];
  private timer: NodeJS.Timeout | null = null;
  private feedRegistry: ethers.Contract | null = null;

  constructor(private readonly pollIntervalMs = Number(process.env.ORACLE_REFRESH_MS || '30000')) {}

  async initialize(): Promise<void> {
    const cfg = getConfig();
    // Use Nethermind node for all oracle calls (real-time via WebSocket if available)
    this.provider = cfg.EXECUTION_WS_URL.startsWith('ws')
      ? new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL)
      : new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);

    console.log(`🔗 Using Nethermind node: ${cfg.EXECUTION_WS_URL}`);

    // Initialize Feed Registry contract on Nethermind node
    this.feedRegistry = new ethers.Contract(FEED_REGISTRY_ADDRESS, FEED_REGISTRY_ABI, this.provider);

    const dexRpcUrl = process.env.DEX_TWAP_RPC_URL ?? null;
    this.dexProvider = dexRpcUrl ? new ethers.JsonRpcProvider(dexRpcUrl) : this.provider;

    this.configs = await loadConfigs();
    console.log(`✅ Loaded ${this.configs.length} oracle feed configurations`);
  }

  start(): void {
    if (this.timer) return;
    console.log(`🚀 Starting oracle aggregator (interval: ${this.pollIntervalMs}ms, feeds: ${this.configs.length})`);
    this.refresh().catch(err => {
      logErrorWithConsole(err, 'Oracle aggregator initial refresh');
    });
    this.timer = setInterval(() => {
      this.refresh().catch(err => {
        logErrorWithConsole(err, 'Oracle aggregator refresh');
      });
    }, this.pollIntervalMs);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async refresh(): Promise<void> {
    try {
      const startTime = Date.now();
      const results = await Promise.allSettled(
        this.configs.map(cfg => this.refreshFeed(cfg))
      );
      
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      const duration = Date.now() - startTime;
      
      if (failureCount > 0) {
        console.log(`🔄 Oracle refresh: ${successCount}/${this.configs.length} feeds updated, ${failureCount} failed (${duration}ms)`);
      } else {
        console.log(`✅ Oracle refresh: ${successCount}/${this.configs.length} feeds updated (${duration}ms)`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logErrorWithConsole(err, 'Oracle aggregator refresh crashed');
    }
  }

  private async refreshFeed(cfg: NormalizedConfig): Promise<void> {
    switch (cfg.provider) {
      case 'Chainlink':
      case 'Tellor':
        await this.refreshAggregatorFeed(cfg);
        break;
      case 'Band':
      case 'API3':
      case 'Pyth':
        // These providers require different integration approaches
        break;
      case 'DEX_TWAP':
        await this.refreshDexTwapFeed(cfg);
        break;
      default:
        throw new Error(`Unsupported oracle provider: ${cfg.provider}`);
    }
  }

  // Gather extended heartbeat/authenticity signals from aggregator (best-effort; may not be available on all feeds)
  private async getNethermindHeartbeatData(cfg: NormalizedConfig): Promise<{
    latestUpdate: number | null;
    roundId: number | null;
    phaseId?: number;
    transmitters?: number;
    oracleCount?: number;
    aggregatorAddress?: string;
    proposedAggregator?: string;
    minAnswer?: number;
    maxAnswer?: number;
    description?: string;
  }> {
    if (!cfg.address) return { latestUpdate: null, roundId: null };
    const aggregator = new ethers.Contract(cfg.address, [
      'function decimals() view returns (uint8)',
      'function description() view returns (string)',
      'function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)',
      'function latestRound() view returns (uint256)',
      'function phaseId() view returns (uint16)',
      'function aggregator() view returns (address)',
      'function proposedAggregator() view returns (address)',
      'function minAnswer() view returns (int256)',
      'function maxAnswer() view returns (int256)'
    ], this.provider);

    try {
      const [rd, desc, roundNow, phase, aggAddr, propAgg, minA, maxA] = await Promise.all([
        safeContractCall(() => aggregator.latestRoundData(), null),
        safeContractCall(() => aggregator.description(), null),
        safeContractCall(() => aggregator.latestRound(), null),
        safeContractCall(() => aggregator.phaseId(), null),
        safeContractCall(() => aggregator.aggregator(), null),
        safeContractCall(() => aggregator.proposedAggregator(), null),
        safeContractCall(() => aggregator.minAnswer(), null),
        safeContractCall(() => aggregator.maxAnswer(), null),
      ]);

      return {
        latestUpdate: rd ? Number(rd.updatedAt) * 1000 : null,
        roundId: roundNow ? Number(roundNow) : (rd ? Number(rd.roundId) : null),
        phaseId: phase ? Number(phase) : undefined,
        aggregatorAddress: aggAddr || undefined,
        proposedAggregator: propAgg || undefined,
        minAnswer: minA != null ? Number(minA) : undefined,
        maxAnswer: maxA != null ? Number(maxA) : undefined,
        description: desc || undefined,
      };
    } catch {
      return { latestUpdate: null, roundId: null };
    }
  }

  // Compute a lightweight authenticity confidence score based on metadata
  private async verifyNethermindAuthenticity(cfg: NormalizedConfig, price: number, hb: { latestUpdate: number | null; roundId: number | null; phaseId?: number; minAnswer?: number; maxAnswer?: number; description?: string; }): Promise<{ isAuthentic: boolean; confidence: number; }>{
    let confidence = 0;
    if (hb.minAnswer != null && hb.maxAnswer != null && price >= hb.minAnswer && price <= hb.maxAnswer) confidence += 25;
    if (hb.roundId && hb.roundId > 0) confidence += 25;
    if (hb.phaseId && hb.phaseId > 0) confidence += 10;
    if (hb.description && cfg.pair && hb.description.toUpperCase().includes(cfg.pair.split('/')[0])) confidence += 10;
    if (hb.latestUpdate && Date.now() - hb.latestUpdate < (cfg.heartbeatSec ? cfg.heartbeatSec * 1000 * 4 : 4 * 3600 * 1000)) confidence += 30;
    return { isAuthentic: confidence >= 50, confidence: Math.min(confidence, 100) };
  }

  private async refreshAggregatorFeed(cfg: NormalizedConfig): Promise<void> {
    try {
      // Priority 1: Use Feed Registry if we have base/quote addresses (preferred method)
      if (cfg.provider === 'Chainlink' && this.feedRegistry && cfg.baseAddress && cfg.quoteAddress) {
        try {
          return await this.refreshViaFeedRegistry(cfg);
        } catch (registryError) {
          // Only log non-execution-reverted errors (actual problems, not missing feeds)
          if (!isExecutionRevertedError(registryError)) {
            const message = registryError instanceof Error ? registryError.message : String(registryError);
            logWarningWithConsole(registryError, `Feed Registry query failed for ${cfg.pair}`);
          }
          // Fall through to direct aggregator call
        }
      }

      // Priority 2: Direct aggregator contract call (fallback or when registry not available)
      if (!cfg.address) {
        upsertOracleFeed(cfg.key, {
          provider: cfg.provider,
          pair: cfg.pair,
          feed_address: undefined,
          price_usd: null,
          last_updated: null,
          heartbeat_sec: cfg.heartbeatSec ?? null,
          status: 'stale',
          deviation_vs_spot_pct: null,
          authenticity_score: 0, // No address = cannot authenticate
          oracle_count: undefined,
          round_id: undefined,
          aggregator_phase: undefined,
        });
        return;
      }

      await this.refreshViaDirectAggregator(cfg);
    } catch (error) {
      // Only log non-execution-reverted errors (actual problems, not missing feeds)
      if (!isExecutionRevertedError(error)) {
        logErrorWithConsole(error, `Oracle feed refresh failed for ${cfg.provider} ${cfg.pair}`);
      }
      upsertOracleFeed(cfg.key, {
        provider: cfg.provider,
        pair: cfg.pair,
        feed_address: cfg.address ?? undefined,
        price_usd: null,
        last_updated: null,
        heartbeat_sec: cfg.heartbeatSec ?? null,
        status: 'error',
        deviation_vs_spot_pct: null,
        authenticity_score: 0, // Error state = no authenticity
        oracle_count: undefined,
        round_id: undefined,
        aggregator_phase: undefined,
      });
    }
  }

  /**
   * Fetch price via Chainlink Feed Registry (real-time from Nethermind node)
   */
  private async refreshViaFeedRegistry(cfg: NormalizedConfig): Promise<void> {
    if (!this.feedRegistry || !cfg.baseAddress || !cfg.quoteAddress) {
      throw new Error('Feed Registry not available or missing base/quote addresses');
    }

    // Resolve aggregator first to avoid revert on latestRoundData for non-existent feeds
    let feedAddress = cfg.address ?? null;
    if (!feedAddress) {
      const resolved = await safeContractCall(
        () => this.feedRegistry!.getFeed(cfg.baseAddress!, cfg.quoteAddress!),
        ethers.ZeroAddress
      );
      if (resolved && resolved !== ethers.ZeroAddress) {
        feedAddress = resolved;
      } else {
        // No mapping in registry; bail out to caller for fallback handling
        throw new Error(`No feed found in registry for ${cfg.pair}`);
      }
    }

    // Fetch latest round data and decimals via registry
    const [latestRaw, decimals] = await Promise.all([
      safeContractCall(
        () => this.feedRegistry!.latestRoundData(cfg.baseAddress!, cfg.quoteAddress!),
        null
      ),
      safeContractCall(
        () => this.feedRegistry!.decimals(cfg.baseAddress!, cfg.quoteAddress!),
        null
      ),
    ]);
    
    if (!latestRaw || decimals === null) {
      throw new Error(`No feed data available in registry for ${cfg.pair}`);
    }

    const latest: any = latestRaw;
    const answer = latest?.answer ?? latest?.[1];
    const updatedAtSecRaw = latest?.updatedAt ?? latest?.[3];
    
    if (answer == null || updatedAtSecRaw == null) {
      throw new Error(`Invalid round data from registry for ${cfg.pair}`);
    }

    const price = Number(answer) / 10 ** Number(decimals);
    const updatedAtSec = Number(updatedAtSecRaw);
    const updatedAtMs = Number.isFinite(updatedAtSec) ? updatedAtSec * 1000 : null;

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid price from registry: ${price}`);
    }

    const deviation = await computeDeviation(cfg.referenceToken ?? null, price);
    const hb = await this.getNethermindHeartbeatData({ ...cfg, address: feedAddress ?? cfg.address } as NormalizedConfig);
    const authenticity = await this.verifyNethermindAuthenticity(cfg, price, hb);
    const effectiveHeartbeat = cfg.heartbeatSec ? Math.round(cfg.heartbeatSec * (cfg.staleToleranceMultiplier || 1)) : cfg.heartbeatSec;
    const status = authenticity.isAuthentic ? computeStatus(updatedAtMs, effectiveHeartbeat) : 'error';

    upsertOracleFeed(cfg.key, {
      provider: cfg.provider,
      pair: cfg.pair,
      feed_address: feedAddress ?? undefined,
      price_usd: price,
      last_updated: updatedAtMs,
      heartbeat_sec: cfg.heartbeatSec ?? null,
      status: status,
      deviation_vs_spot_pct: deviation,
      authenticity_score: authenticity.confidence,
      oracle_count: hb.oracleCount ?? hb.transmitters,
      round_id: hb.roundId || (latest && typeof latest.roundId !== 'undefined' ? Number(latest.roundId) : undefined),
      aggregator_phase: hb.phaseId,
    });
  }

  /**
   * Fetch price via direct aggregator contract call (fallback method)
   */
  private async refreshViaDirectAggregator(cfg: NormalizedConfig): Promise<void> {
    if (!cfg.address) {
      throw new Error(`No aggregator address configured for ${cfg.pair}`);
    }

    const contract = new ethers.Contract(cfg.address, AggregatorV3 as any, this.provider);

    const [decimals, roundData] = await Promise.all([
      safeContractCall(() => contract.decimals(), null),
      safeContractCall(() => contract.latestRoundData(), null),
    ]);
    
    if (decimals === null || roundData === null) {
      throw new Error(`Failed to fetch data from aggregator for ${cfg.pair}`);
    }

    const price = Number(roundData.answer) / 10 ** Number(decimals);
    const updatedAtSec = Number(roundData.updatedAt);
    const updatedAtMs = Number.isFinite(updatedAtSec) ? updatedAtSec * 1000 : null;

    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Invalid price from aggregator: ${price}`);
    }

    const deviation = await computeDeviation(cfg.referenceToken ?? null, price);
    const hb = await this.getNethermindHeartbeatData(cfg);
    const authenticity = await this.verifyNethermindAuthenticity(cfg, price, hb);
    const effectiveHeartbeat = cfg.heartbeatSec ? Math.round(cfg.heartbeatSec * (cfg.staleToleranceMultiplier || 1)) : cfg.heartbeatSec;
    const status = authenticity.isAuthentic ? computeStatus(updatedAtMs, effectiveHeartbeat) : 'error';

    // Use round data from contract call if metadata unavailable
    const roundId = hb.roundId || (roundData && typeof roundData.roundId !== 'undefined' ? Number(roundData.roundId) : undefined);

    upsertOracleFeed(cfg.key, {
      provider: cfg.provider,
      pair: cfg.pair,
      feed_address: cfg.address,
      price_usd: price,
      last_updated: updatedAtMs,
      heartbeat_sec: cfg.heartbeatSec ?? null,
      status: status,
      deviation_vs_spot_pct: deviation,
      authenticity_score: authenticity.confidence,
      oracle_count: hb.oracleCount ?? hb.transmitters,
      round_id: roundId,
      aggregator_phase: hb.phaseId,
    });
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
      safeContractCall(() => pool.slot0(), null),
      safeContractCall(() => token0Contract.decimals(), null),
      safeContractCall(() => token1Contract.decimals(), null),
    ]);
    
    if (slot0 === null || decimals0 === null || decimals1 === null) {
      throw new Error(`Failed to fetch DEX pool data for ${cfg.pair}`);
    }

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
      authenticity_score: 100, // DEX pools are inherently authentic (on-chain)
      oracle_count: undefined, // DEX doesn't use oracles
      round_id: undefined, // DEX doesn't use rounds
      aggregator_phase: undefined, // Not applicable
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

