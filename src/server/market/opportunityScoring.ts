import { Transaction } from '@/lib/types';
import { hexToBigInt } from '@/lib/util/hex';
import { formatUnits } from 'ethers';
import { opportunityWeights, smartMoneyAddresses } from '@/lib/config';

type ScoreComponents = {
  value: number;
  gas: number;
  mev: number;
  smartMoney: number;
  urgency: number;
};

function normalizeScore(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(min, Math.min(max, value));
}

function computeValueScore(tx: Transaction): number {
  try {
    const valueWei = hexToBigInt(tx.value || '0x0');
    const valueEth = Number(formatUnits(valueWei, 18));
    if (!Number.isFinite(valueEth) || valueEth <= 0) return 0;
    // Logarithmic scaling: 1 ETH -> ~43, 10 ETH -> ~66, 100 ETH -> ~87
    const score = Math.log10(valueEth + 1) * 43;
    return normalizeScore(score);
  } catch {
    return 0;
  }
}

function computeGasScore(tx: Transaction): number {
  try {
    const raw = tx.maxFeePerGas || tx.gasPrice;
    if (!raw) return 0;
    const feeGwei = Number(formatUnits(hexToBigInt(raw), 9));
    if (!Number.isFinite(feeGwei) || feeGwei <= 0) return 0;
    // Higher gas bids rank higher (capped at 300 gwei => 100 score)
    const score = (feeGwei / 3);
    return normalizeScore(score);
  } catch {
    return 0;
  }
}

function computeMevScore(tx: Transaction): number {
  try {
    const swap = tx._swap_details;
    if (!swap) return 0;

    let amountOutEth = 0;
    let amountInEth = 0;
    if (swap.amount_out) {
      try { amountOutEth = Number(formatUnits(BigInt(swap.amount_out), 18)); } catch {}
    }
    if (swap.amount_in) {
      try { amountInEth = Number(formatUnits(BigInt(swap.amount_in), 18)); } catch {}
    }

    const pathLen = Array.isArray(swap.path) ? swap.path.length : 0;
    const base = Math.max(amountOutEth, amountInEth);
    const multiplier = pathLen >= 3 ? 1.6 : 1.2;
    const score = Math.log10(base + 1) * 40 * multiplier;
    return normalizeScore(score);
  } catch {
    return 0;
  }
}

function computeSmartMoneyScore(tx: Transaction): { score: number; flag: boolean } {
  const from = (tx.from || '').toLowerCase();
  const flag = smartMoneyAddresses.has(from);
  return {
    score: flag ? 100 : 0,
    flag,
  };
}

function computeUrgencyScore(tx: Transaction, nowSec: number): number {
  const ageSec = Math.max(0, nowSec - (tx._first_seen_ts || nowSec));
  let priorityGwei = 0;
  try {
    if (tx.maxPriorityFeePerGas) {
      priorityGwei = Number(formatUnits(hexToBigInt(tx.maxPriorityFeePerGas), 9));
    }
  } catch {}

  // Higher priority fee and younger transactions are more urgent
  const priorityComponent = Math.min(100, priorityGwei * 4);
  const ageComponent = ageSec <= 60 ? (60 - ageSec) * 1.2 : 0;
  const score = priorityComponent * 0.7 + ageComponent * 0.3;
  return normalizeScore(score);
}

export function applyOpportunityScoring(tx: Transaction, nowSec: number = Date.now() / 1000): void {
  const valueScore = computeValueScore(tx);
  const gasScore = computeGasScore(tx);
  const mevScore = computeMevScore(tx);
  const { score: smartMoneyScore, flag: smartMoneyFlag } = computeSmartMoneyScore(tx);
  const urgencyScore = computeUrgencyScore(tx, nowSec);

  const components: ScoreComponents = {
    value: valueScore,
    gas: gasScore,
    mev: mevScore,
    smartMoney: smartMoneyScore,
    urgency: urgencyScore,
  };

  const weightSum =
    opportunityWeights.value +
    opportunityWeights.gas +
    opportunityWeights.mev +
    opportunityWeights.smartMoney +
    opportunityWeights.urgency;

  const composite = weightSum > 0
    ? (
        components.value * opportunityWeights.value +
        components.gas * opportunityWeights.gas +
        components.mev * opportunityWeights.mev +
        components.smartMoney * opportunityWeights.smartMoney +
        components.urgency * opportunityWeights.urgency
      ) / weightSum
    : 0;

  tx.value_score = normalizeScore(components.value);
  tx.gas_score = normalizeScore(components.gas);
  tx.mev_score = normalizeScore(components.mev);
  tx.smart_money_score = normalizeScore(components.smartMoney);
  tx.urgency_score = normalizeScore(components.urgency);
  tx.composite_score = normalizeScore(composite);
  tx.smart_money_flag = smartMoneyFlag;
  tx.score_breakdown = {
    value: tx.value_score,
    gas: tx.gas_score,
    mev: tx.mev_score,
    smartMoney: tx.smart_money_score,
    urgency: tx.urgency_score,
  };

  tx._score = tx.composite_score ?? tx._score;
}

