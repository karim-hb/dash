export type WebSocketEnvelope =
  | { type: 'snapshot'; payload: SnapshotPayload }
  | { type: 'transaction'; payload: TransactionEntry }
  | { type: 'transactionConfirmed'; payload: TransactionConfirmedPayload }
  | { type: 'price'; payload: PricePayload }
  | { type: 'pool'; payload: PoolPayload }
  | { type: 'predictions'; payload: GasPredictionState };

export interface SnapshotPayload {
  ethPrice: number;
  lastBlock: number | null;
  transactions: TransactionEntry[];
  tracked: TrackedTx[];
  predictions: GasPredictionState | null;
  accuracy: GasAccuracyStats | null;
  metrics?: SnapshotMetrics | null;
}

export interface TransactionEntry {
  hash: string;
  from: string;
  to: string | null;
  valueEth: string;
  valueUsd: string;
  valueSource: string;
  gasPrice: string | null;
  maxFeePerGas: string | null;
  maxPriorityFeePerGas: string | null;
  gasEth: string;
  gasUsd: string;
  token: string | null;
  tokenAmount: string | null;
  tokenValueUsd: string | null;
  tokenUnitPriceUsd: number | null;
  functionName: string | null;
  decoded: Record<string, unknown> | null;
  timestamp: string;
}

export interface TrackedTx {
  hash: string;
  firstSeenInPool?: number;
  lastSeenInPool?: number;
  poolStatus?: string;
  decoded?: Record<string, unknown> | null;
  predictedInclusionBlock?: number | null;
  inclusionProbability?: number | null;
  priorityFeeRank?: number | null;
  effectiveGasPriceGwei?: number | null;
  valueUsd?: number | null;
  valueSource?: string | null;
  tokenSymbol?: string | null;
  tokenAmount?: number | string | null;
  confirmedBlock?: number | null;
  timeToConfirm?: number | null;
}

export interface GasPredictionState {
  gasPredictions: GasPredictionRow[];
  inclusionMapping?: InclusionMapping;
  mempoolStats?: MempoolStats;
  currentBlock?: Record<string, unknown> | null;
  lastUpdateBlock?: number | null;
  meta?: GasPredictionMeta | null;
}

export interface GasPredictionRow {
  blockNumber: number;
  baseFeeGwei: number;
  estimatedPriorityFeeGwei: number;
  effectiveGasPriceGwei: number;
  gasCostETH: number;
  gasCostUSD: number;
  confidence: number;
}

export interface GasPredictionMeta {
  smoothingAlpha?: number;
  baseFeeVolatility?: number;
  sampleSize?: number;
  fallback?: string | null;
  estimatedPriorityFeeGwei?: number;
}

export interface InclusionMapping {
  nextBlock?: InclusionBucket;
  next2Blocks?: InclusionBucket;
  unlikely?: InclusionBucket;
  insufficientFee?: InclusionBucket;
  nonceBlocked?: InclusionBucket;
  summary?: Record<string, number>;
}

export interface InclusionBucket extends Array<InclusionEntry> {}

export interface InclusionEntry {
  hash: string;
  from?: string;
  to?: string;
  nonce?: number;
  value?: number | string;
  gasLimit?: number | string;
  maxFeePerGas?: number | string;
  maxPriorityFeePerGas?: number | string;
  gasPrice?: number | string;
  predictedInclusionBlock?: number | null;
  inclusionProbability?: number | null;
  effectiveGasPriceGwei?: number | null;
  priorityFeeRank?: number | null;
  estimatedGasCostETH?: number | null;
  estimatedGasCostUSD?: number | null;
  status?: string;
  reason?: string;
  firstSeen?: number;
  timeInPool?: number;
}

export interface MempoolStats {
  totalPending: number;
  priorityFees?: number[];
  maxFeeFees?: number[];
  percentiles?: Record<string, number> & { sampleSize?: number };
  averagePriorityFee?: number;
}

export interface GasAccuracyStats {
  total: number;
  correct: number;
  early: number;
  late: number;
  missed: number;
  accuracyRate: number;
  averageBlockDifference: number;
}

export interface SnapshotMetrics {
  decodedCounts?: Record<string, number>;
}

export interface TransactionConfirmedPayload {
  hash: string;
  receipt?: Record<string, unknown>;
  tracked?: TrackedTx;
}

export interface PricePayload {
  price: number;
}

export interface PoolPayload {
  pending: number;
  queued: number;
  tracked: number;
  lastUpdated: number;
}

export interface WsEventLogEntry {
  id: string;
  type: string;
  timestamp: number;
  summary: string;
}

export interface WebSocketDashboardState {
  connected: boolean;
  reconnecting: boolean;
  snapshot: SnapshotPayload | null;
  transactions: TransactionEntry[];
  tracked: TrackedTx[];
  predictions: GasPredictionState | null;
  accuracy: GasAccuracyStats | null;
  metrics: SnapshotMetrics | null;
  price: number | null;
  pool: PoolPayload | null;
  events: WsEventLogEntry[];
  lastEventType: string | null;
  lastUpdated: number | null;
}

