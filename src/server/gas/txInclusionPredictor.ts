import { ethers } from "ethers";
import { formatUnits } from "ethers";
import { GasPrediction, TransactionData } from "./gasPredictor";

export interface TransactionInclusionPrediction {
  hash: string;
  from: string;
  to: string | null;
  nonce: number;
  value: bigint;
  gasLimit: bigint;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  gasPrice: bigint | null;
  
  // Prediction fields
  predictedInclusionBlock: number | null; // Which block it will be included (1 = next block, 2 = block after next)
  inclusionProbability: number; // 0-1 probability
  effectiveGasPriceGwei: number;
  sufficientFee: boolean; // Whether maxFeePerGas covers predicted base fee
  priorityFeeRank: number; // Rank among all pending txs (1 = highest)
  estimatedGasCostETH: number;
  estimatedGasCostUSD: number;
  
  // Status
  status: 'likely_next_block' | 'likely_2_blocks' | 'unlikely_soon' | 'insufficient_fee' | 'nonce_blocked';
  reason: string;
  
  // Timestamps
  firstSeen: number;
  timeInPool: number; // seconds
}

export interface InclusionMapping {
  nextBlock: TransactionInclusionPrediction[];
  next2Blocks: TransactionInclusionPrediction[];
  unlikely: TransactionInclusionPrediction[];
  insufficientFee: TransactionInclusionPrediction[];
  nonceBlocked: TransactionInclusionPrediction[];
  summary: {
    total: number;
    nextBlock: number;
    next2Blocks: number;
    unlikely: number;
    insufficientFee: number;
    nonceBlocked: number;
  };
}

/**
 * Predict which transactions will be included in upcoming blocks
 */
export function predictTransactionInclusion(
  transactions: Array<{
    hash: string;
    from: string;
    to: string | null;
    nonce: number;
    value: bigint;
    gasLimit: bigint;
    maxFeePerGas: bigint | null;
    maxPriorityFeePerGas: bigint | null;
    gasPrice: bigint | null;
    firstSeen?: number;
  }>,
  gasPredictions: GasPrediction[],
  currentBlockNumber: number,
  ethPriceUSD: number
): InclusionMapping {
  if (gasPredictions.length === 0) {
    return {
      nextBlock: [],
      next2Blocks: [],
      unlikely: [],
      insufficientFee: [],
      nonceBlocked: [],
      summary: { total: 0, nextBlock: 0, next2Blocks: 0, unlikely: 0, insufficientFee: 0, nonceBlocked: 0 },
    };
  }

  const nextBlockPrediction = gasPredictions[0];
  const next2BlocksPrediction = gasPredictions[1] || gasPredictions[0];

  // Group transactions by sender to check nonce ordering
  const bySender = new Map<string, Array<typeof transactions[0]>>();
  for (const tx of transactions) {
    if (!bySender.has(tx.from)) {
      bySender.set(tx.from, []);
    }
    bySender.get(tx.from)!.push(tx);
  }

  // Sort each sender's transactions by nonce
  for (const [sender, txs] of bySender.entries()) {
    txs.sort((a, b) => a.nonce - b.nonce);
  }

  // Track confirmed nonces (would need to fetch from chain, but for now assume 0)
  // In production, you'd fetch the current nonce for each sender
  const confirmedNonces = new Map<string, number>();

  const predictions: TransactionInclusionPrediction[] = [];

  // First pass: Calculate effective gas prices and rank by priority
  const txWithEffectiveGas: Array<{
    tx: typeof transactions[0];
    effectiveGasPriceGwei: number;
    priorityFeeGwei: number;
    maxFeeGwei: number;
  }> = [];

  for (const tx of transactions) {
    let effectiveGasPriceGwei = 0;
    let priorityFeeGwei = 0;
    let maxFeeGwei = 0;

    if (tx.maxFeePerGas && tx.maxPriorityFeePerGas) {
      // EIP-1559 transaction
      maxFeeGwei = Number(formatUnits(tx.maxFeePerGas, "gwei"));
      priorityFeeGwei = Number(formatUnits(tx.maxPriorityFeePerGas, "gwei"));
      // Effective = base fee + priority fee (but we'll use predicted base fee)
      effectiveGasPriceGwei = nextBlockPrediction.baseFeeGwei + priorityFeeGwei;
    } else if (tx.gasPrice) {
      // Legacy transaction
      maxFeeGwei = Number(formatUnits(tx.gasPrice, "gwei"));
      priorityFeeGwei = Math.max(0, maxFeeGwei - nextBlockPrediction.baseFeeGwei);
      effectiveGasPriceGwei = maxFeeGwei;
    } else {
      continue; // Skip if no gas info
    }

    txWithEffectiveGas.push({
      tx,
      effectiveGasPriceGwei,
      priorityFeeGwei,
      maxFeeGwei,
    });
  }

  // Sort by effective gas price (descending) - higher fee = higher priority
  txWithEffectiveGas.sort((a, b) => b.effectiveGasPriceGwei - a.effectiveGasPriceGwei);

  // Second pass: Predict inclusion for each transaction
  for (let i = 0; i < txWithEffectiveGas.length; i++) {
    const { tx, effectiveGasPriceGwei, priorityFeeGwei, maxFeeGwei } = txWithEffectiveGas[i];
    const senderTxs = bySender.get(tx.from) || [];
    const senderNonce = confirmedNonces.get(tx.from) || 0;

    // Check if nonce is blocked (earlier nonce not included)
    const isNonceBlocked = tx.nonce > senderNonce && 
      senderTxs.some(t => t.nonce < tx.nonce && t.hash !== tx.hash);

    // Check if maxFeePerGas is sufficient for predicted base fee
    const nextBlockBaseFee = nextBlockPrediction.baseFeeGwei;
    const next2BlocksBaseFee = next2BlocksPrediction.baseFeeGwei;
    const sufficientForNextBlock = maxFeeGwei >= nextBlockBaseFee;
    const sufficientForNext2Blocks = maxFeeGwei >= next2BlocksBaseFee;

    // Calculate inclusion probability
    let inclusionProbability = 0;
    let predictedInclusionBlock: number | null = null;
    let status: TransactionInclusionPrediction['status'];
    let reason = "";

    if (isNonceBlocked) {
      status = 'nonce_blocked';
      reason = `Nonce ${tx.nonce} blocked by earlier nonce`;
      inclusionProbability = 0.1;
    } else if (!sufficientForNextBlock && !sufficientForNext2Blocks) {
      status = 'insufficient_fee';
      reason = `Max fee ${maxFeeGwei.toFixed(2)} Gwei < predicted base fee ${nextBlockBaseFee.toFixed(2)} Gwei`;
      inclusionProbability = 0.05;
    } else {
      // Rank-based probability (higher rank = higher probability)
      const rankPercentile = 1 - (i / txWithEffectiveGas.length);
      
      if (sufficientForNextBlock && rankPercentile > 0.5) {
        // Top 50% with sufficient fee likely in next block
        status = 'likely_next_block';
        predictedInclusionBlock = currentBlockNumber + 1;
        inclusionProbability = Math.min(0.95, 0.6 + rankPercentile * 0.35);
        reason = `High priority fee (${priorityFeeGwei.toFixed(2)} Gwei), rank ${i + 1}/${txWithEffectiveGas.length}`;
      } else if (sufficientForNext2Blocks && rankPercentile > 0.3) {
        // Top 70% with sufficient fee likely in 2 blocks
        status = 'likely_2_blocks';
        predictedInclusionBlock = currentBlockNumber + 2;
        inclusionProbability = Math.min(0.85, 0.4 + rankPercentile * 0.45);
        reason = `Moderate priority fee (${priorityFeeGwei.toFixed(2)} Gwei), rank ${i + 1}/${txWithEffectiveGas.length}`;
      } else {
        status = 'unlikely_soon';
        inclusionProbability = Math.max(0.1, rankPercentile * 0.3);
        reason = `Low priority fee (${priorityFeeGwei.toFixed(2)} Gwei), rank ${i + 1}/${txWithEffectiveGas.length}`;
      }
    }

    // Calculate estimated gas cost
    const gasCostWei = BigInt(Math.floor(effectiveGasPriceGwei * 1e9)) * tx.gasLimit;
    const estimatedGasCostETH = Number(formatUnits(gasCostWei, "ether"));
    const estimatedGasCostUSD = estimatedGasCostETH * ethPriceUSD;

    const timeInPool = tx.firstSeen ? (Date.now() - tx.firstSeen) / 1000 : 0;

    predictions.push({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      nonce: tx.nonce,
      value: tx.value,
      gasLimit: tx.gasLimit,
      maxFeePerGas: tx.maxFeePerGas,
      maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
      gasPrice: tx.gasPrice,
      predictedInclusionBlock,
      inclusionProbability,
      effectiveGasPriceGwei,
      sufficientFee: sufficientForNextBlock || sufficientForNext2Blocks,
      priorityFeeRank: i + 1,
      estimatedGasCostETH,
      estimatedGasCostUSD,
      status,
      reason,
      firstSeen: tx.firstSeen || Date.now(),
      timeInPool,
    });
  }

  // Group predictions by status
  const mapping: InclusionMapping = {
    nextBlock: predictions.filter(p => p.status === 'likely_next_block'),
    next2Blocks: predictions.filter(p => p.status === 'likely_2_blocks'),
    unlikely: predictions.filter(p => p.status === 'unlikely_soon'),
    insufficientFee: predictions.filter(p => p.status === 'insufficient_fee'),
    nonceBlocked: predictions.filter(p => p.status === 'nonce_blocked'),
    summary: {
      total: predictions.length,
      nextBlock: predictions.filter(p => p.status === 'likely_next_block').length,
      next2Blocks: predictions.filter(p => p.status === 'likely_2_blocks').length,
      unlikely: predictions.filter(p => p.status === 'unlikely_soon').length,
      insufficientFee: predictions.filter(p => p.status === 'insufficient_fee').length,
      nonceBlocked: predictions.filter(p => p.status === 'nonce_blocked').length,
    },
  };

  return mapping;
}

/**
 * Format inclusion mapping for display
 */
export function formatInclusionMapping(mapping: InclusionMapping): string {
  let output = "\n" + "=".repeat(80) + "\n";
  output += "🎯 TRANSACTION INCLUSION PREDICTIONS\n";
  output += "=".repeat(80) + "\n";
  output += `Total Transactions: ${mapping.summary.total}\n`;
  output += `  ✅ Likely Next Block: ${mapping.summary.nextBlock}\n`;
  output += `  ⏳ Likely 2 Blocks: ${mapping.summary.next2Blocks}\n`;
  output += `  ⚠️  Unlikely Soon: ${mapping.summary.unlikely}\n`;
  output += `  ❌ Insufficient Fee: ${mapping.summary.insufficientFee}\n`;
  output += `  🔒 Nonce Blocked: ${mapping.summary.nonceBlocked}\n\n`;

  if (mapping.nextBlock.length > 0) {
    output += "📋 LIKELY NEXT BLOCK:\n";
    output += "-".repeat(80) + "\n";
    mapping.nextBlock.slice(0, 10).forEach((tx, idx) => {
      output += `${idx + 1}. ${tx.hash.slice(0, 16)}...\n`;
      output += `   From: ${tx.from.slice(0, 10)}... | Nonce: ${tx.nonce}\n`;
      output += `   Effective Gas: ${tx.effectiveGasPriceGwei.toFixed(2)} Gwei\n`;
      output += `   Priority Fee: ${tx.maxPriorityFeePerGas ? Number(formatUnits(tx.maxPriorityFeePerGas, "gwei")).toFixed(2) : 'N/A'} Gwei\n`;
      output += `   Probability: ${(tx.inclusionProbability * 100).toFixed(1)}%\n`;
      output += `   Rank: #${tx.priorityFeeRank}\n`;
      output += `   ${tx.reason}\n\n`;
    });
    if (mapping.nextBlock.length > 10) {
      output += `   ... and ${mapping.nextBlock.length - 10} more\n\n`;
    }
  }

  if (mapping.next2Blocks.length > 0) {
    output += "⏳ LIKELY IN 2 BLOCKS:\n";
    output += "-".repeat(80) + "\n";
    mapping.next2Blocks.slice(0, 5).forEach((tx, idx) => {
      output += `${idx + 1}. ${tx.hash.slice(0, 16)}...\n`;
      output += `   Probability: ${(tx.inclusionProbability * 100).toFixed(1)}%\n`;
      output += `   ${tx.reason}\n\n`;
    });
  }

  if (mapping.insufficientFee.length > 0) {
    output += "❌ INSUFFICIENT FEE:\n";
    output += "-".repeat(80) + "\n";
    mapping.insufficientFee.slice(0, 5).forEach((tx, idx) => {
      output += `${idx + 1}. ${tx.hash.slice(0, 16)}...\n`;
      output += `   ${tx.reason}\n\n`;
    });
  }

  output += "=".repeat(80) + "\n";
  return output;
}

