import { ethers } from "ethers";
import {
  fetchPendingBlock,
  fetchLatestBlock,
  analyzeMempoolTransactions,
  predictGasCosts,
  type GasPrediction,
  type BlockData,
  type MempoolStats,
  type BlockHistoryEntry,
} from "./gasPredictor";
import {
  predictTransactionInclusion,
  formatInclusionMapping,
  type InclusionMapping,
  type TransactionInclusionPrediction,
} from "./txInclusionPredictor";

export interface PredictionAccuracy {
  predictedBlock: number | null;
  actualBlock: number | null;
  predictedAt: number;
  includedAt: number | null;
  accuracy: 'correct' | 'early' | 'late' | 'missed' | null;
  blockDifference: number | null; // actualBlock - predictedBlock
}

export interface PredictionState {
  gasPredictions: GasPrediction[];
  inclusionMapping: InclusionMapping | null;
  mempoolStats: MempoolStats | null;
  currentBlock: BlockData | null;
  pendingBlock: BlockData | null;
  lastUpdateBlock: number;
  lastUpdateTime: number;
  predictionHistory: Map<string, PredictionAccuracy>;
  blockHistory: BlockHistoryEntry[];
}

class GasPredictionService {
  private state: PredictionState = {
    gasPredictions: [],
    inclusionMapping: null,
    mempoolStats: null,
    currentBlock: null,
    pendingBlock: null,
    lastUpdateBlock: 0,
    lastUpdateTime: 0,
    predictionHistory: new Map(),
    blockHistory: [],
  };

  private provider: ethers.Provider | null = null;
  private readonly MAX_BLOCK_HISTORY = 20;

  /**
   * Initialize the service with a provider
   */
  initialize(provider: ethers.Provider): void {
    this.provider = provider;
  }

  /**
   * Update predictions based on current block state
   */
  async updatePredictions(
    ethPriceUSD: number,
    provider: ethers.Provider
  ): Promise<void> {
    if (!provider) {
      throw new Error("Provider not initialized");
    }

    try {
      // Fetch latest confirmed block
      const latestBlock = await fetchLatestBlock(provider);
      if (!latestBlock || !latestBlock.baseFeePerGas || latestBlock.number === null) {
        console.warn("Could not fetch latest block or missing base fee");
        return;
      }

      // Only update if we have a new block
      if (latestBlock.number <= this.state.lastUpdateBlock) {
        return;
      }

      // Fetch pending block for mempool analysis
      const pendingBlock = await fetchPendingBlock(provider);

      // Analyze mempool transactions (limit processing for performance)
      const mempoolTxs = pendingBlock?.transactions || [];
      const mempoolStats = analyzeMempoolTransactions(mempoolTxs);

      // Update block history with latest block
      if (latestBlock.baseFeePerGas) {
        const historyEntry: BlockHistoryEntry = {
          blockNumber: latestBlock.number || 0,
          gasUsed: latestBlock.gasUsed,
          gasLimit: latestBlock.gasLimit,
          baseFeePerGas: latestBlock.baseFeePerGas,
          timestamp: latestBlock.timestamp,
        };
        
        this.state.blockHistory.push(historyEntry);
        // Keep only last MAX_BLOCK_HISTORY blocks
        if (this.state.blockHistory.length > this.MAX_BLOCK_HISTORY) {
          this.state.blockHistory.shift();
        }
      }

      // Predict gas costs for next 5 blocks with block history
      const gasPredictions = predictGasCosts(
        latestBlock,
        mempoolStats,
        ethPriceUSD,
        latestBlock.gasLimit,
        5,
        this.state.blockHistory
      );

      // Update state
      this.state.currentBlock = latestBlock;
      this.state.pendingBlock = pendingBlock;
      this.state.mempoolStats = mempoolStats;
      this.state.gasPredictions = gasPredictions;
      this.state.lastUpdateBlock = latestBlock.number;
      this.state.lastUpdateTime = Date.now();

      // Update inclusion predictions if we have pending transactions
      if (pendingBlock && pendingBlock.transactions.length > 0) {
        const inclusionMapping = predictTransactionInclusion(
          pendingBlock.transactions.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            nonce: tx.nonce,
            value: tx.value,
            gasLimit: tx.gasLimit,
            maxFeePerGas: tx.maxFeePerGas,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
            gasPrice: tx.gasPrice,
            firstSeen: tx.timestampObserved,
          })),
          gasPredictions,
          latestBlock.number,
          ethPriceUSD
        );
        this.state.inclusionMapping = inclusionMapping;

        // Store predictions in history for accuracy tracking
        for (const prediction of [
          ...inclusionMapping.nextBlock,
          ...inclusionMapping.next2Blocks,
        ]) {
          if (prediction.predictedInclusionBlock !== null) {
            const existing = this.state.predictionHistory.get(prediction.hash);
            if (!existing || existing.predictedBlock !== prediction.predictedInclusionBlock) {
              this.state.predictionHistory.set(prediction.hash, {
                predictedBlock: prediction.predictedInclusionBlock,
                actualBlock: null,
                predictedAt: Date.now(),
                includedAt: null,
                accuracy: null,
                blockDifference: null,
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating gas predictions:", error);
    }
  }

  /**
   * Record actual inclusion of a transaction and update accuracy
   */
  recordTransactionInclusion(
    txHash: string,
    actualBlock: number,
    includedAt: number
  ): void {
    const prediction = this.state.predictionHistory.get(txHash);
    if (!prediction) return;

    prediction.actualBlock = actualBlock;
    prediction.includedAt = includedAt;

    if (prediction.predictedBlock === null) {
      prediction.accuracy = 'missed';
      prediction.blockDifference = null;
    } else {
      const blockDiff = actualBlock - prediction.predictedBlock;
      prediction.blockDifference = blockDiff;

      if (blockDiff === 0) {
        prediction.accuracy = 'correct';
      } else if (blockDiff < 0) {
        prediction.accuracy = 'early'; // Included earlier than predicted
      } else if (blockDiff <= 1) {
        prediction.accuracy = 'late'; // Included 1 block later (acceptable)
      } else {
        prediction.accuracy = 'missed'; // Included much later
      }
    }
  }

  /**
   * Get current predictions
   */
  getPredictions(): {
    gasPredictions: GasPrediction[];
    inclusionMapping: InclusionMapping | null;
    mempoolStats: MempoolStats | null;
    currentBlock: BlockData | null;
    lastUpdateBlock: number;
  } {
    return {
      gasPredictions: this.state.gasPredictions,
      inclusionMapping: this.state.inclusionMapping,
      mempoolStats: this.state.mempoolStats,
      currentBlock: this.state.currentBlock,
      lastUpdateBlock: this.state.lastUpdateBlock,
    };
  }

  /**
   * Get inclusion mapping
   */
  getInclusionMapping(): InclusionMapping | null {
    return this.state.inclusionMapping;
  }

  /**
   * Get prediction accuracy statistics
   */
  getAccuracyStats(): {
    total: number;
    correct: number;
    early: number;
    late: number;
    missed: number;
    accuracyRate: number;
    averageBlockDifference: number;
  } {
    const predictions = Array.from(this.state.predictionHistory.values());
    const completed = predictions.filter(p => p.actualBlock !== null);

    const correct = completed.filter(p => p.accuracy === 'correct').length;
    const early = completed.filter(p => p.accuracy === 'early').length;
    const late = completed.filter(p => p.accuracy === 'late').length;
    const missed = completed.filter(p => p.accuracy === 'missed').length;

    const blockDiffs = completed
      .filter(p => p.blockDifference !== null)
      .map(p => p.blockDifference!);
    const avgBlockDiff =
      blockDiffs.length > 0
        ? blockDiffs.reduce((a, b) => a + b, 0) / blockDiffs.length
        : 0;

    return {
      total: completed.length,
      correct,
      early,
      late,
      missed,
      accuracyRate: completed.length > 0 ? correct / completed.length : 0,
      averageBlockDifference: avgBlockDiff,
    };
  }

  /**
   * Get prediction for a specific transaction
   */
  getTransactionPrediction(txHash: string): TransactionInclusionPrediction | null {
    if (!this.state.inclusionMapping) return null;

    const allPredictions = [
      ...this.state.inclusionMapping.nextBlock,
      ...this.state.inclusionMapping.next2Blocks,
      ...this.state.inclusionMapping.unlikely,
      ...this.state.inclusionMapping.insufficientFee,
      ...this.state.inclusionMapping.nonceBlocked,
    ];

    return allPredictions.find(p => p.hash.toLowerCase() === txHash.toLowerCase()) || null;
  }

  /**
   * Format predictions for logging
   */
  formatPredictions(): string {
    let output = "\n" + "=".repeat(80) + "\n";
    output += "🔮 GAS PREDICTIONS (Next 5 Blocks)\n";
    output += "=".repeat(80) + "\n";

    if (this.state.currentBlock) {
      output += `Current Block: ${this.state.currentBlock.number}\n`;
      if (this.state.currentBlock.baseFeePerGas) {
        output += `Current Base Fee: ${Number(ethers.formatUnits(this.state.currentBlock.baseFeePerGas, "gwei")).toFixed(2)} Gwei\n`;
      }
      output += `Gas Used: ${this.state.currentBlock.gasUsed.toString()} / ${this.state.currentBlock.gasLimit.toString()}\n`;
    }

    if (this.state.mempoolStats) {
      output += `Mempool Size: ${this.state.mempoolStats.totalPending} transactions\n`;
      output += `Priority Fee Percentiles:\n`;
      output += `  P50: ${this.state.mempoolStats.percentiles.p50.toFixed(2)} Gwei\n`;
      output += `  P75: ${this.state.mempoolStats.percentiles.p75.toFixed(2)} Gwei\n`;
      output += `  P90: ${this.state.mempoolStats.percentiles.p90.toFixed(2)} Gwei\n`;
    }

    output += "\nPredictions:\n";
    this.state.gasPredictions.forEach((pred) => {
      output += `\n  Block ${pred.blockNumber}:\n`;
      output += `    Base Fee: ${pred.baseFeeGwei.toFixed(2)} Gwei\n`;
      output += `    Priority Fee (est): ${pred.estimatedPriorityFeeGwei.toFixed(2)} Gwei\n`;
      output += `    Effective Gas Price: ${pred.effectiveGasPriceGwei.toFixed(2)} Gwei\n`;
      output += `    Cost (21k gas): ${pred.gasCostETH.toFixed(8)} ETH ($${pred.gasCostUSD.toFixed(2)})\n`;
      output += `    Confidence: ${(pred.confidence * 100).toFixed(1)}%\n`;
    });

    if (this.state.inclusionMapping) {
      output += formatInclusionMapping(this.state.inclusionMapping);
    }

    // Add accuracy stats
    const accuracy = this.getAccuracyStats();
    if (accuracy.total > 0) {
      output += "\n📊 PREDICTION ACCURACY:\n";
      output += "-".repeat(80) + "\n";
      output += `Total Predictions: ${accuracy.total}\n`;
      output += `Correct: ${accuracy.correct} (${(accuracy.accuracyRate * 100).toFixed(1)}%)\n`;
      output += `Early: ${accuracy.early}\n`;
      output += `Late (1 block): ${accuracy.late}\n`;
      output += `Missed: ${accuracy.missed}\n`;
      output += `Average Block Difference: ${accuracy.averageBlockDifference.toFixed(2)}\n`;
    }

    output += "=".repeat(80) + "\n";
    return output;
  }

  /**
   * Clean up old prediction history (keep last 1000 entries)
   */
  cleanupHistory(): void {
    if (this.state.predictionHistory.size > 1000) {
      const entries = Array.from(this.state.predictionHistory.entries());
      // Keep most recent 1000 entries
      entries.sort((a, b) => b[1].predictedAt - a[1].predictedAt);
      const toKeep = entries.slice(0, 1000);
      this.state.predictionHistory = new Map(toKeep);
    }
  }
}

// Singleton instance
const gasPredictionService = new GasPredictionService();

export function getGasPredictionService(): GasPredictionService {
  return gasPredictionService;
}

export function initializeGasPredictionService(provider: ethers.Provider): void {
  gasPredictionService.initialize(provider);
}

