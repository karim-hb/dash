import { ethers } from "ethers";
import { formatUnits } from "ethers";

export interface BlockData {
  number: number | null;
  hash: string | null;
  parentHash: string;
  gasLimit: bigint;
  gasUsed: bigint;
  baseFeePerGas: bigint | null;
  timestamp: number;
  transactions: TransactionData[];
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string | null;
  value: bigint;
  gasLimit: bigint;
  maxFeePerGas: bigint | null;
  maxPriorityFeePerGas: bigint | null;
  gasPrice: bigint | null;
  type: number;
  nonce: number;
  data: string;
  timestampObserved?: number;
}

export interface GasPrediction {
  blockNumber: number;
  baseFeeGwei: number;
  estimatedPriorityFeeGwei: number;
  effectiveGasPriceGwei: number;
  gasCostETH: number;
  gasCostUSD: number;
  confidence: number;
}

export interface MempoolStats {
  totalPending: number;
  priorityFees: number[];
  maxFeeFees: number[];
  percentiles: {
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
  };
}

export interface BlockHistoryEntry {
  blockNumber: number;
  gasUsed: bigint;
  gasLimit: bigint;
  baseFeePerGas: bigint | null;
  timestamp: number;
}

/**
 * Predict next N blocks base fees using EIP-1559 formula
 * Formula: BaseFee_{n+1} = BaseFee_n * (1 + (GasUsed_n - TargetGas) / TargetGas / 8)
 * 
 * @param currentBaseFee Current block's base fee in wei
 * @param gasUsed Gas used in current block
 * @param gasLimit Gas limit of current block
 * @param nBlocks Number of blocks to predict ahead
 * @returns Array of predicted base fees in wei for next N blocks
 */
export function predictNextBaseFees(
  currentBaseFee: bigint,
  gasUsed: bigint,
  gasLimit: bigint,
  nBlocks: number = 3
): bigint[] {
  const targetGas = gasLimit / BigInt(2); // Target is 50% of gas limit
  const baseFees: bigint[] = [];
  let baseFee = currentBaseFee;

  for (let i = 0; i < nBlocks; i++) {
    // Calculate adjustment factor
    // Adjustment = (GasUsed - TargetGas) / TargetGas / 8
    // We use 1e6 for precision to avoid floating point issues
    const gasUsedDiff = gasUsed - targetGas;
    const adjustment = (gasUsedDiff * BigInt(1000000)) / targetGas / BigInt(8);
    
    // Apply adjustment: baseFee * (1 + adjustment / 1e6)
    // baseFee * (1e6 + adjustment) / 1e6
    baseFee = (baseFee * (BigInt(1000000) + adjustment)) / BigInt(1000000);
    
    // Ensure base fee doesn't go below 1 gwei (minimum)
    const minBaseFee = BigInt(1000000000); // 1 gwei in wei
    baseFee = baseFee < minBaseFee ? minBaseFee : baseFee;
    
    baseFees.push(baseFee);
  }

  return baseFees;
}

/**
 * Calculate percentiles from sorted array
 */
export function calculatePercentiles(sorted: number[]): {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
} {
  if (sorted.length === 0) {
    return { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0, p95: 0 };
  }

  const percentile = (arr: number[], p: number): number => {
    if (p <= 0) return arr[0];
    if (p >= 1) return arr[arr.length - 1];
    const index = Math.floor((arr.length - 1) * p);
    return arr[index];
  };

  return {
    p10: percentile(sorted, 0.10),
    p25: percentile(sorted, 0.25),
    p50: percentile(sorted, 0.50),
    p75: percentile(sorted, 0.75),
    p90: percentile(sorted, 0.90),
    p95: percentile(sorted, 0.95),
  };
}

/**
 * Analyze mempool transactions to get priority fee statistics
 */
export function analyzeMempoolTransactions(
  transactions: TransactionData[]
): MempoolStats {
  const priorityFees: number[] = [];
  const maxFeeFees: number[] = [];

  for (const tx of transactions) {
    if (tx.maxPriorityFeePerGas) {
      const priorityGwei = Number(formatUnits(tx.maxPriorityFeePerGas, "gwei"));
      if (priorityGwei > 0 && isFinite(priorityGwei)) {
        priorityFees.push(priorityGwei);
      }
    }
    if (tx.maxFeePerGas) {
      const maxFeeGwei = Number(formatUnits(tx.maxFeePerGas, "gwei"));
      if (maxFeeGwei > 0 && isFinite(maxFeeGwei)) {
        maxFeeFees.push(maxFeeGwei);
      }
    }
  }

  priorityFees.sort((a, b) => a - b);
  maxFeeFees.sort((a, b) => a - b);

  return {
    totalPending: transactions.length,
    priorityFees,
    maxFeeFees,
    percentiles: calculatePercentiles(priorityFees.length > 0 ? priorityFees : maxFeeFees),
  };
}

/**
 * Calculate base confidence from recent block history
 * Analyzes gas usage patterns to determine predictability
 * Returns confidence between 0.3 and 0.7
 */
export function calculateBaseConfidence(
  blockHistory: BlockHistoryEntry[]
): number {
  if (blockHistory.length === 0) {
    return 0.3; // Minimum baseline confidence
  }

  // Calculate gas usage ratios (gasUsed / gasLimit)
  const usageRatios: number[] = [];
  for (const block of blockHistory) {
    if (block.gasLimit > BigInt(0)) {
      const ratio = Number(block.gasUsed) / Number(block.gasLimit);
      usageRatios.push(ratio);
    }
  }

  if (usageRatios.length === 0) {
    return 0.3;
  }

  // Calculate average and standard deviation
  const avgRatio = usageRatios.reduce((a, b) => a + b, 0) / usageRatios.length;
  const variance = usageRatios.reduce((sum, ratio) => sum + Math.pow(ratio - avgRatio, 2), 0) / usageRatios.length;
  const stdDev = Math.sqrt(variance);

  // Higher average ratio (closer to 1.0) = more predictable = higher confidence
  // Lower standard deviation = more consistent = higher confidence
  // Confidence ranges from 0.3 to 0.7
  const avgConfidence = Math.min(0.5, avgRatio * 0.5); // 0.0 to 0.5 based on average usage
  const consistencyConfidence = Math.max(0, 0.2 - (stdDev * 0.4)); // 0.0 to 0.2 based on consistency
  const baseConfidence = 0.3 + avgConfidence + consistencyConfidence;

  return Math.min(0.7, Math.max(0.3, baseConfidence));
}

/**
 * Predict gas costs for next N blocks
 */
export function predictGasCosts(
  currentBlock: BlockData,
  mempoolStats: MempoolStats,
  ethPriceUSD: number,
  gasLimit: bigint,
  nBlocks: number = 3,
  blockHistory: BlockHistoryEntry[] = []
): GasPrediction[] {
  if (!currentBlock.baseFeePerGas) {
    throw new Error("Current block must have baseFeePerGas");
  }

  const predictions: GasPrediction[] = [];
  const predictedBaseFees = predictNextBaseFees(
    currentBlock.baseFeePerGas,
    currentBlock.gasUsed,
    gasLimit,
    nBlocks
  );

  // Use p75 or p90 for competitive priority fee estimation
  const estimatedPriorityFee = mempoolStats.percentiles.p75 || mempoolStats.percentiles.p50 || 1.0;
  const estimatedPriorityFeeWei = BigInt(Math.floor(estimatedPriorityFee * 1e9));

  // Calculate confidence: baseConfidence (0.3-0.7) + mempoolConfidence (0.0-0.3)
  const baseConfidence = calculateBaseConfidence(blockHistory);
  const mempoolConfidence = Math.min(0.3, mempoolStats.totalPending / 2000);
  const confidence = Math.min(1.0, baseConfidence + mempoolConfidence);

  for (let i = 0; i < predictedBaseFees.length; i++) {
    const baseFeeGwei = Number(formatUnits(predictedBaseFees[i], "gwei"));
    const effectiveGasPriceGwei = baseFeeGwei + estimatedPriorityFee;
    
    // Calculate cost for standard transaction (21000 gas)
    const standardGasLimit = BigInt(21000);
    const gasCostWei = (predictedBaseFees[i] + estimatedPriorityFeeWei) * standardGasLimit;
    const gasCostETH = Number(formatUnits(gasCostWei, "ether"));
    const gasCostUSD = gasCostETH * ethPriceUSD;

    predictions.push({
      blockNumber: (currentBlock.number || 0) + i + 1,
      baseFeeGwei,
      estimatedPriorityFeeGwei: estimatedPriorityFee,
      effectiveGasPriceGwei,
      gasCostETH,
      gasCostUSD,
      confidence,
    });
  }

  return predictions;
}

/**
 * Fetch mempool transactions using txpool_content
 * This gives us ALL pending transactions, not just those in the pending block
 */
export async function fetchMempoolTransactions(
  provider: ethers.Provider
): Promise<TransactionData[]> {
  const txLimit = Number(process.env.GAS_PREDICTION_TX_LIMIT || '2000');
  
  try {
    // Use txpool_content to get all pending transactions
    // Cast provider to any to access send method (ethers Provider supports it but types don't)
    const txpoolContent = await (provider as any).send('txpool_content', []);
    if (!txpoolContent || typeof txpoolContent !== 'object') {
      return [];
    }

    const transactions: TransactionData[] = [];
    const pending = txpoolContent.pending || {};
    const queued = txpoolContent.queued || {};
    const allTxHashes = new Set<string>();

    // Process pending transactions
    for (const [sender, txs] of Object.entries(pending)) {
      if (typeof txs !== 'object' || txs === null) continue;
      if (transactions.length >= txLimit) break;
      
      for (const [nonce, tx] of Object.entries(txs)) {
        if (transactions.length >= txLimit) break;
        if (!tx || typeof tx !== 'object' || !tx.hash) continue;
        if (allTxHashes.has(tx.hash.toLowerCase())) continue; // Avoid duplicates
        allTxHashes.add(tx.hash.toLowerCase());
        
        try {
          // Try to use transaction data from txpool_content if it has all fields
          // Otherwise fetch full transaction details
          let txData: TransactionData | null = null;
          
          // Check if txpool transaction has all required fields
          if (tx.from && tx.value !== undefined && tx.gas !== undefined) {
            // Use txpool data directly (faster)
            txData = {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || null,
              value: typeof tx.value === 'string' ? BigInt(tx.value) : BigInt(tx.value || 0),
              gasLimit: typeof tx.gas === 'string' ? BigInt(tx.gas) : BigInt(tx.gas || 0),
              maxFeePerGas: tx.maxFeePerGas ? (typeof tx.maxFeePerGas === 'string' ? BigInt(tx.maxFeePerGas) : BigInt(tx.maxFeePerGas)) : null,
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? (typeof tx.maxPriorityFeePerGas === 'string' ? BigInt(tx.maxPriorityFeePerGas) : BigInt(tx.maxPriorityFeePerGas)) : null,
              gasPrice: tx.gasPrice ? (typeof tx.gasPrice === 'string' ? BigInt(tx.gasPrice) : BigInt(tx.gasPrice)) : null,
              type: typeof tx.type === 'string' ? parseInt(tx.type, 16) : (tx.type || 0),
              nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce, 16) : (tx.nonce || 0),
              data: tx.input || tx.data || "0x",
              timestampObserved: Date.now(),
            };
          } else {
            // Fetch full transaction details if txpool data is incomplete
            const fullTx = await provider.getTransaction(tx.hash);
            if (!fullTx) continue;

            txData = {
              hash: fullTx.hash,
              from: fullTx.from,
              to: fullTx.to,
              value: fullTx.value,
              gasLimit: fullTx.gasLimit,
              maxFeePerGas: fullTx.maxFeePerGas || null,
              maxPriorityFeePerGas: fullTx.maxPriorityFeePerGas || null,
              gasPrice: fullTx.gasPrice || null,
              type: fullTx.type || 0,
              nonce: fullTx.nonce,
              data: fullTx.data || "0x",
              timestampObserved: Date.now(),
            };
          }
          
          if (txData) {
            transactions.push(txData);
          }
        } catch (err) {
          // Skip if we can't process transaction
          continue;
        }
      }
    }

    // Also process queued transactions (they're still in mempool)
    for (const [sender, txs] of Object.entries(queued)) {
      if (typeof txs !== 'object' || txs === null) continue;
      if (transactions.length >= txLimit) break;
      
      for (const [nonce, tx] of Object.entries(txs)) {
        if (transactions.length >= txLimit) break;
        if (!tx || typeof tx !== 'object' || !tx.hash) continue;
        if (allTxHashes.has(tx.hash.toLowerCase())) continue; // Avoid duplicates
        allTxHashes.add(tx.hash.toLowerCase());
        
        try {
          // Try to use transaction data from txpool_content if it has all fields
          let txData: TransactionData | null = null;
          
          if (tx.from && tx.value !== undefined && tx.gas !== undefined) {
            // Use txpool data directly (faster)
            txData = {
              hash: tx.hash,
              from: tx.from,
              to: tx.to || null,
              value: typeof tx.value === 'string' ? BigInt(tx.value) : BigInt(tx.value || 0),
              gasLimit: typeof tx.gas === 'string' ? BigInt(tx.gas) : BigInt(tx.gas || 0),
              maxFeePerGas: tx.maxFeePerGas ? (typeof tx.maxFeePerGas === 'string' ? BigInt(tx.maxFeePerGas) : BigInt(tx.maxFeePerGas)) : null,
              maxPriorityFeePerGas: tx.maxPriorityFeePerGas ? (typeof tx.maxPriorityFeePerGas === 'string' ? BigInt(tx.maxPriorityFeePerGas) : BigInt(tx.maxPriorityFeePerGas)) : null,
              gasPrice: tx.gasPrice ? (typeof tx.gasPrice === 'string' ? BigInt(tx.gasPrice) : BigInt(tx.gasPrice)) : null,
              type: typeof tx.type === 'string' ? parseInt(tx.type, 16) : (tx.type || 0),
              nonce: typeof tx.nonce === 'string' ? parseInt(tx.nonce, 16) : (tx.nonce || 0),
              data: tx.input || tx.data || "0x",
              timestampObserved: Date.now(),
            };
          } else {
            // Fetch full transaction details if txpool data is incomplete
            const fullTx = await provider.getTransaction(tx.hash);
            if (!fullTx) continue;

            txData = {
              hash: fullTx.hash,
              from: fullTx.from,
              to: fullTx.to,
              value: fullTx.value,
              gasLimit: fullTx.gasLimit,
              maxFeePerGas: fullTx.maxFeePerGas || null,
              maxPriorityFeePerGas: fullTx.maxPriorityFeePerGas || null,
              gasPrice: fullTx.gasPrice || null,
              type: fullTx.type || 0,
              nonce: fullTx.nonce,
              data: fullTx.data || "0x",
              timestampObserved: Date.now(),
            };
          }
          
          if (txData) {
            transactions.push(txData);
          }
        } catch (err) {
          continue;
        }
      }
    }

    return transactions;
  } catch (error) {
    // Error fetching mempool - return empty array, don't crash
    return [];
  }
}

/**
 * Fetch pending block data (for block info, not transactions)
 * Uses getBlock("pending") for block metadata and txpool_content for transactions
 */
export async function fetchPendingBlock(
  provider: ethers.Provider
): Promise<BlockData | null> {
  try {
    // Get block metadata from pending block
    const block = await provider.getBlock("pending", true);
    if (!block) return null;

    // Get mempool transactions separately using txpool_content
    const transactions = await fetchMempoolTransactions(provider);

    return {
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      baseFeePerGas: block.baseFeePerGas || null,
      timestamp: block.timestamp,
      transactions, // Use mempool transactions instead of pending block transactions
    };
  } catch (error) {
    // Error fetching pending block - return null, don't crash
    return null;
  }
}

/**
 * Fetch latest confirmed block
 */
export async function fetchLatestBlock(
  provider: ethers.Provider
): Promise<BlockData | null> {
  try {
    const blockNumber = await provider.getBlockNumber();
    const block = await provider.getBlock(blockNumber, true);
    if (!block) return null;

    const transactions: TransactionData[] = [];
    
    if (block.transactions && Array.isArray(block.transactions)) {
      for (const tx of block.transactions) {
        if (typeof tx === "string") continue;
        
        const txData: TransactionData = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          gasLimit: tx.gasLimit,
          maxFeePerGas: tx.maxFeePerGas || null,
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas || null,
          gasPrice: tx.gasPrice || null,
          type: tx.type || 0,
          nonce: tx.nonce,
          data: tx.data || "0x",
        };
        transactions.push(txData);
      }
    }

    return {
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      gasLimit: block.gasLimit,
      gasUsed: block.gasUsed,
      baseFeePerGas: block.baseFeePerGas || null,
      timestamp: block.timestamp,
      transactions,
    };
  } catch (error) {
    console.error("Error fetching latest block:", error);
    return null;
  }
}

