import type { ScoredPendingTx } from "./txScorer";

const BLOCK_INTERVAL_MS = 12_000;
const FORECAST_MODEL_VERSION = "v2.2";

export interface InclusionForecast {
  probNextBlock: number;
  probTwoBlocks: number;
  probDelayed: number;
  bucket: InclusionBucket;
  notes: string[];
  modelVersion: string;
}

export type InclusionBucket =
  | "next_block"
  | "two_blocks"
  | "nonce_blocked"
  | "insufficient_fee"
  | "delayed_short"
  | "delayed_long";

export function applyLatencyDiscount(probability: number, tx: ScoredPendingTx, blockIntervalMs = BLOCK_INTERVAL_MS): number {
  const deltaMs = Date.now() - tx.firstSeen;
  const discount = 1 - Math.exp(-deltaMs / blockIntervalMs);
  return Math.max(0, probability * discount);
}

export interface ForecastContext {
  cumulativeGas: bigint;
  targetGas: bigint;
  pendingGasWindow?: bigint;
  parentGasUsed?: bigint;
  parentGasLimit?: bigint;
  tipRatio?: number;
  queueFactor?: number;
}

export function computeInclusionForecast(
  tx: ScoredPendingTx,
  context: ForecastContext
): InclusionForecast {
  const { cumulativeGas, targetGas, parentGasUsed, parentGasLimit } = context;
  const targetGasNumber = Number(targetGas);
  const cumulativeGasNumber = Number(cumulativeGas);
  const notes: string[] = [];

  let baseProb =
    cumulativeGasNumber <= targetGasNumber
      ? 0.6 + 0.35 * (1 - cumulativeGasNumber / targetGasNumber)
      : 0.1;

  if (tx.nonceBlocked) {
    baseProb = Math.min(baseProb, 0.25);
    notes.push("nonceBlocked");
  }
  if (tx.insufficientFee) {
    baseProb = Math.min(baseProb, 0.15);
    notes.push("insufficientFee");
  }

  const queueFactor = clampProbability(context.queueFactor ?? 1);
  const tipRatio = clampRatio(context.tipRatio ?? 1);
  const tipBoost = clampMultiplier(0.8 + 0.4 * Math.tanh(tipRatio - 1));
  const queueBoost = clampMultiplier(0.6 + 0.4 * queueFactor);

  const probNextBlock = clampProbability(applyLatencyDiscount(baseProb, tx) * tipBoost * queueBoost);
  const elasticity = computeElasticity(cumulativeGas, targetGas);
  const congestionFactor = computeCongestionFactor(parentGasUsed, parentGasLimit);
  const adaptiveDecay = 0.35 + 0.45 * (elasticity * congestionFactor);
  const queueDecay = clampMultiplier(0.5 + 0.5 * (1 - queueFactor));
  const probTwoBlocks = clampProbability((1 - probNextBlock) * adaptiveDecay * queueDecay);
  const probDelayedRaw = 1 - (probNextBlock + probTwoBlocks);
  const probDelayed = clampProbability(probDelayedRaw);
  return normalizeProbabilities(probNextBlock, probTwoBlocks, probDelayed, notes, queueFactor);
}

function clampProbability(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function clampMultiplier(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 0.2), 2);
}

function clampRatio(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(Math.max(value, 0.05), 5);
}

function normalizeProbabilities(
  probNextBlock: number,
  probTwoBlocks: number,
  probDelayed: number,
  notes: string[],
  queueFactor: number
): InclusionForecast {
  const sum = probNextBlock + probTwoBlocks + probDelayed;
  const divisor = sum > 0 ? sum : 1;
  const normalized = {
    probNextBlock: clampProbability(probNextBlock / divisor),
    probTwoBlocks: clampProbability(probTwoBlocks / divisor),
    probDelayed: clampProbability(probDelayed / divisor),
  };
  const bucket = chooseBucket(normalized.probNextBlock, normalized.probTwoBlocks, normalized.probDelayed, notes, queueFactor);
  return { ...normalized, bucket, notes, modelVersion: FORECAST_MODEL_VERSION };
}

function chooseBucket(
  probNextBlock: number,
  probTwoBlocks: number,
  probDelayed: number,
  notes: string[],
  queueFactor: number
): InclusionBucket {
  if (notes.includes("insufficientFee")) return "insufficient_fee";
  if (notes.includes("nonceBlocked")) return "nonce_blocked";
  const delayedBucket: InclusionBucket = queueFactor >= 0.5 ? "delayed_short" : "delayed_long";
  const probabilities: Array<{ bucket: InclusionBucket; value: number }> = [
    { bucket: "next_block", value: probNextBlock },
    { bucket: "two_blocks", value: probTwoBlocks },
    { bucket: delayedBucket, value: probDelayed },
  ];
  const top = probabilities.reduce((acc, current) => (current.value > acc.value ? current : acc));
  return top.bucket;
}

function computeElasticity(cumulativeGas: bigint, targetGas: bigint): number {
  if (targetGas === BigInt(0)) return 1;
  const ratio = Number(cumulativeGas) / Number(targetGas);
  return clampProbability(1 / Math.max(1, ratio));
}

function computeCongestionFactor(parentGasUsed?: bigint, parentGasLimit?: bigint): number {
  if (parentGasUsed === undefined || parentGasLimit === undefined || parentGasLimit === BigInt(0)) {
    return 1;
  }
  const usage = Number(parentGasUsed) / Number(parentGasLimit);
  return clampProbability(1 - Math.min(usage, 1));
}

