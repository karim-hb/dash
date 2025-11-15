import type { ScoredPendingTx } from "./txScorer";

export function rankTxsByGas(txs: ScoredPendingTx[], targetGas: bigint = BigInt(15_000_000)) {
  let cumGas = BigInt(0);
  const ranked: Array<ScoredPendingTx & { cumulativeGas: bigint }> = [];

  const sorted = [...txs].sort((a, b) => {
    if (a.score === b.score) return Number(b.maxPriorityFeePerGas - a.maxPriorityFeePerGas);
    return Number(b.score - a.score);
  });

  for (const tx of sorted) {
    if (cumGas >= targetGas) break;
    cumGas += tx.gasLimit;
    ranked.push({ ...tx, cumulativeGas: cumGas });
  }

  return ranked;
}

