import { ethers } from 'ethers';
import AggregatorV3 from '../abi/ChainlinkAggregatorV3.json';
import { getConfig } from '@/lib/config';
import { upsertOracleFeed } from '../market/registry';
import feeds from './oracleFeeds.json';
import { derivePriceRatio } from '../indexers/amm/uniswapV3Math';
import { getUsdPriceForToken } from '../market/priceEngine';

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
};

type NormalizedConfig = OracleFeedConfig & { key: string };

const ERC20_ABI = ['function decimals() view returns (uint8)'];

function loadConfigs(): NormalizedConfig[] {
  return (feeds as OracleFeedConfig[]).map((cfg) => ({
    ...cfg,
    key: `${cfg.provider.toLowerCase()}:${cfg.pair}`,
  }));
}

function computeStatus(updatedAt: number | null, heartbeatSec?: number): 'healthy' | 'stale' | 'error' {
  if (!updatedAt) return 'stale';
  if (!heartbeatSec) return 'healthy';
  const delta = Date.now() - updatedAt;
  return delta <= heartbeatSec * 1000 * 2 ? 'healthy' : 'stale';
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
  private readonly configs: NormalizedConfig[];
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly pollIntervalMs = Number(process.env.ORACLE_REFRESH_MS || '30000')) {
    const cfg = getConfig();
    this.provider = cfg.EXECUTION_WS_URL.startsWith('ws')
      ? new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL)
      : new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);
    this.configs = loadConfigs();
  }

  start(): void {
    if (this.timer) return;
    this.refresh().catch(err => console.error('oracle aggregator initial refresh failed', err));
    this.timer = setInterval(() => {
      this.refresh().catch(err => console.error('oracle aggregator refresh error', err));
    }, this.pollIntervalMs);
    console.log(`??? Oracle aggregator started (interval ${this.pollIntervalMs} ms)`);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async refresh(): Promise<void> {
    await Promise.all(this.configs.map(cfg => this.refreshFeed(cfg).catch(err => {
      console.error(`Oracle feed refresh failed for ${cfg.provider} ${cfg.pair}:`, err);
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
  }

  private async refreshFeed(cfg: NormalizedConfig): Promise<void> {
    switch (cfg.provider) {
      case 'Chainlink':
      case 'Band':
      case 'Tellor':
      case 'API3':
      case 'Pyth':
        await this.refreshAggregatorFeed(cfg);
        break;
      case 'DEX_TWAP':
        await this.refreshDexTwapFeed(cfg);
        break;
      default:
        throw new Error(`Unsupported oracle provider: ${cfg.provider}`);
    }
  }

  private async refreshAggregatorFeed(cfg: NormalizedConfig): Promise<void> {
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
      });
      return;
    }

    const contract = new ethers.Contract(cfg.address, AggregatorV3 as any, this.provider);
    const [decimals, roundData] = await Promise.all([
      contract.decimals(),
      contract.latestRoundData(),
    ]);

    const price = Number(roundData.answer) / 10 ** Number(decimals);
    const updatedAtSec = Number(roundData.updatedAt);
    const updatedAtMs = Number.isFinite(updatedAtSec) ? updatedAtSec * 1000 : null;
    const deviation = await computeDeviation(cfg.referenceToken ?? null, price);

    upsertOracleFeed(cfg.key, {
      provider: cfg.provider,
      pair: cfg.pair,
      feed_address: cfg.address,
      price_usd: Number.isFinite(price) ? price : null,
      last_updated: updatedAtMs,
      heartbeat_sec: cfg.heartbeatSec ?? null,
      status: computeStatus(updatedAtMs, cfg.heartbeatSec),
      deviation_vs_spot_pct: deviation,
    });
  }

  private async refreshDexTwapFeed(cfg: NormalizedConfig): Promise<void> {
    const dex = cfg.dex;
    if (!dex || dex.type !== 'uniswap_v3') {
      throw new Error(`Unsupported DEX config for ${cfg.pair}`);
    }

    const pool = new ethers.Contract(dex.pool, [
      'function slot0() view returns (uint160 sqrtPriceX96, int24, uint16, uint16, uint16, uint8, bool)',
    ], this.provider);

    const token0Contract = new ethers.Contract(dex.token0, ERC20_ABI, this.provider);
    const token1Contract = new ethers.Contract(dex.token1, ERC20_ABI, this.provider);

    const [slot0, decimals0, decimals1] = await Promise.all([
      pool.slot0(),
      token0Contract.decimals(),
      token1Contract.decimals(),
    ]);

    const sqrtPriceX96 = BigInt(slot0[0]);
    const priceRatio = derivePriceRatio(sqrtPriceX96, Number(decimals0), Number(decimals1));
    const deviation = await computeDeviation(cfg.referenceToken ?? dex.token0, priceRatio);

    upsertOracleFeed(cfg.key, {
      provider: 'DEX_TWAP',
      pair: cfg.pair,
      feed_address: dex.pool,
      price_usd: Number.isFinite(priceRatio) ? priceRatio : null,
      last_updated: Date.now(),
      heartbeat_sec: cfg.heartbeatSec ?? null,
      status: 'healthy',
      deviation_vs_spot_pct: deviation,
    });
  }
}

const aggregator = new OracleAggregator();

export function startOracleAggregator(): void {
  aggregator.start();
}

export function getOracleAggregator(): OracleAggregator {
  return aggregator;
}

