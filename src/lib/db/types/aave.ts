export type AssetTrendUpdateType = "snapshot" | "event";

export interface TrendPoint {
  timestamp?: number;
  liquidityChangePct: number;
}

export interface AssetTrendDocument {
  assetAddress: string;
  blockNumber: number;
  timestamp: number;
  availableLiquidityWei: string;
  totalStableDebtWei: string;
  totalVariableDebtWei: string;
  totalDebtWei: string;
  liquidityChangePct: number;
  utilizationPct: number;
  updateType: AssetTrendUpdateType;
  eventName?: string;
  txHash?: string;
  reason?: string;
  liquidityDeltaWei?: string;
  totalVariableDebtDeltaWei?: string;
  premiumWei?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface AssetMetricsDocument {
  assetAddress: string;
  blockNumber: number;
  timestamp: number;
  availableLiquidityWei: string;
  effectiveLiquidityWei: string;
  totalStableDebtWei: string;
  totalVariableDebtWei: string;
  totalDebtWei: string;
  safetyBufferWei: string;
  utilizationPct: number;
  liquidityChangeRate?: number;
  utilizationTrendSlope?: number;
  recoveryTimeEst?: number | null;
  confidenceScore?: number;
  confidenceBreakdown?: {
    pool: number;
    dataProvider: number;
    debtMetrics: number;
  };
  riskScore?: {
    score: number;
    flags: string[];
  };
  trendHistory?: TrendPoint[];
  fallbackActive?: boolean;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt: Date;
}

