import Big from "big.js";

type BigInstance = ReturnType<typeof Big>;
type Bigish = BigInstance | string | number | bigint | { toString(): string } | null | undefined;

export interface TrendHistoryPoint {
  liquidityChangePct: number;
  timestamp?: number;
}

export interface TrendData {
  history: TrendHistoryPoint[];
}

export interface RawAssetMetrics {
  availableLiquidityWei?: Bigish;
  liquidity?: Bigish;
  totalStableDebtWei?: Bigish;
  totalVariableDebtWei?: Bigish;
  fallbackUsed?: boolean;
  lastUpdate?: number | string;
}

export interface AssetInput {
  assetAddress: string;
  symbol?: string;
  rawMetrics: RawAssetMetrics;
  trend?: TrendData;
}

export interface MetricDefaults {
  liquiditySafetyBufferBps: number;
  fallbackConfidencePenalty: number;
  predictiveEwmaAlpha: number;
  predictiveRecoveryTargetPct: number;
  highUtilizationThresholdPct: number;
  liquidityShockThresholdPct: number;
}

export interface MetricSettings {
  defaults: MetricDefaults;
}

export interface DerivedAaveMetrics {
  assetAddress: string;
  symbol?: string;
  availableLiquidityWei: string;
  effectiveLiquidityWei: string;
  totalStableDebtWei: string;
  totalVariableDebtWei: string;
  totalDebtWei: string;
  safetyBufferWei: string;
  utilizationPct: number;
  confidenceScore: number;
  confidenceBreakdown: {
    pool: number;
    dataProvider: number;
    debtMetrics: number;
  };
  fallbackActive: boolean;
  lastUpdateTimestamp: number | string | undefined;
  trend?: TrendData;
}

export interface VelocityMetrics {
  liquidityChangeRate: number;
  utilizationTrendSlope: number;
  recoveryTimeEst: number | null;
  stale: boolean;
}

export interface RiskScore {
  score: number;
  flags: string[];
}

export interface VirtualPool {
  poolId: string;
  poolType: "virtual-reserve";
  flashableLiquidityWei: string;
  analytics: DerivedAaveMetrics;
}

function bigIntFrom(value: Bigish): Big {
  if (value === null || value === undefined) {
    return new Big(0);
  }

  if (typeof value === "bigint") {
    return new Big(value.toString());
  }

  if (typeof value === "number" || typeof value === "string") {
    return new Big(value);
  }

  if (typeof value === "object" && "toString" in value) {
    return new Big(value.toString());
  }

  return new Big(0);
}

export function computeUtilizationPct(totalDebt: Big, totalLiquidity: Big): number {
  const denominator = totalDebt.plus(totalLiquidity);
  if (denominator.eq(0)) return 0;
  return totalDebt.div(denominator).times(100).toNumber();
}

export function deriveAaveMetrics(asset: AssetInput, settings: MetricSettings): DerivedAaveMetrics {
  const availableLiquidity = bigIntFrom(
    asset.rawMetrics.availableLiquidityWei ?? asset.rawMetrics.liquidity ?? 0
  );
  const totalStableDebt = bigIntFrom(asset.rawMetrics.totalStableDebtWei ?? 0);
  const totalVariableDebt = bigIntFrom(asset.rawMetrics.totalVariableDebtWei ?? 0);

  const totalDebt = totalStableDebt.plus(totalVariableDebt);

  const safetyBuffer = availableLiquidity
    .times(settings.defaults.liquiditySafetyBufferBps)
    .div(10_000);
  const effectiveLiquidityCandidate = availableLiquidity.minus(safetyBuffer);
  const effectiveLiquidity = effectiveLiquidityCandidate.gt(0)
    ? effectiveLiquidityCandidate
    : new Big(0);

  const utilizationPct = computeUtilizationPct(totalDebt, availableLiquidity);

  let confidenceScore = 1.0;
  if (asset.rawMetrics.fallbackUsed) {
    confidenceScore -= settings.defaults.fallbackConfidencePenalty;
  }
  confidenceScore = Math.max(0, Math.min(confidenceScore, 1));

  const confidenceBreakdown = {
    pool: 0.6,
    dataProvider: 0.3,
    debtMetrics: 0.1
  };

  return {
    assetAddress: asset.assetAddress,
    symbol: asset.symbol,
    availableLiquidityWei: availableLiquidity.toString(),
    effectiveLiquidityWei: effectiveLiquidity.toString(),
    totalStableDebtWei: totalStableDebt.toString(),
    totalVariableDebtWei: totalVariableDebt.toString(),
    totalDebtWei: totalDebt.toString(),
    safetyBufferWei: safetyBuffer.toString(),
    utilizationPct,
    confidenceScore,
    confidenceBreakdown,
    fallbackActive: !!asset.rawMetrics.fallbackUsed,
    lastUpdateTimestamp: asset.rawMetrics.lastUpdate,
    trend: asset.trend
  };
}

export function computeVelocityMetrics(
  metrics: DerivedAaveMetrics,
  settings: MetricSettings
): VelocityMetrics {
  const history = metrics.trend?.history ?? [];
  const alpha = settings.defaults.predictiveEwmaAlpha ?? 0.3;

  if (!history.length) {
    return {
      liquidityChangeRate: 0,
      utilizationTrendSlope: 0,
      recoveryTimeEst: null,
      stale: true
    };
  }

  let ewma = history[0].liquidityChangePct;
  for (let i = 1; i < history.length; i += 1) {
    ewma = alpha * history[i].liquidityChangePct + (1 - alpha) * ewma;
  }

  const liquidityChangeRate = Number(ewma.toFixed(3));
  const utilizationTrendSlope = Number(((liquidityChangeRate * metrics.utilizationPct) / 100).toFixed(3));

  let recoveryTimeEst: number | null = null;
  const target = settings.defaults.predictiveRecoveryTargetPct ?? 80;
  if (liquidityChangeRate < 0) {
    recoveryTimeEst = Number(((100 - target) / Math.abs(liquidityChangeRate)).toFixed(2));
  }

  return {
    liquidityChangeRate,
    utilizationTrendSlope,
    recoveryTimeEst,
    stale: false
  };
}

export function computeRiskScore(
  metrics: DerivedAaveMetrics,
  trend: Partial<VelocityMetrics> & { liquidityChangePct?: number } | undefined,
  settings: MetricSettings
): RiskScore {
  let score = 0;
  const flags: string[] = [];

  if (metrics.utilizationPct >= settings.defaults.highUtilizationThresholdPct) {
    score += 0.3;
    flags.push("highUtilization");
  }

  const liquidityDelta =
    trend?.liquidityChangePct ??
    trend?.liquidityChangeRate ??
    0;
  if (liquidityDelta <= -settings.defaults.liquidityShockThresholdPct) {
    score += 0.3;
    flags.push("liquidityShock");
  }

  if (metrics.fallbackActive) {
    score += 0.2;
    flags.push("fallbackActive");
  }

  if (metrics.confidenceScore < 0.7) {
    score += 0.1;
    flags.push("lowConfidence");
  }

  return {
    score: Math.min(score, 1),
    flags
  };
}

export function buildVirtualPool(assetMetrics: DerivedAaveMetrics): VirtualPool {
  return {
    poolId: `aave:${assetMetrics.assetAddress.toLowerCase()}`,
    poolType: "virtual-reserve",
    flashableLiquidityWei: assetMetrics.effectiveLiquidityWei,
    analytics: assetMetrics
  };
}

