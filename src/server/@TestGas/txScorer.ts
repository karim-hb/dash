export interface PendingTxInput {
  hash: string;
  from: string;
  nonce: number;
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  firstSeen: number;
  valueWei: bigint;
}

export interface ScoredPendingTx extends PendingTxInput {
  effectiveGas: bigint;
  expectedTip: bigint;
  score: bigint;
  insufficientFee: boolean;
  nonceBlocked: boolean;
}

export function computeEffectiveGas(tx: PendingTxInput, predictedBaseFee: bigint): Pick<ScoredPendingTx, "effectiveGas" | "expectedTip" | "score" | "insufficientFee"> {
  const maxFee = tx.maxFeePerGas;
  const priorityFee = tx.maxPriorityFeePerGas;

  const cap = predictedBaseFee + priorityFee;
  const effectiveGas = maxFee < cap ? maxFee : cap;

  const expectedTip =
    maxFee > predictedBaseFee
      ? (priorityFee < maxFee - predictedBaseFee ? priorityFee : maxFee - predictedBaseFee)
      : BigInt(0);
  const insufficientFee = maxFee < predictedBaseFee;
  const score = expectedTip * tx.gasLimit;

  return { effectiveGas, expectedTip, score, insufficientFee };
}

