import { TxState, Transaction } from '@/lib/types';
import { getTrackerState } from '../state/state';
import { getFeeHistoryAnalytics } from '../metrics/aggregator';
import { hexToBigInt } from '@/lib/util/hex';
import { formatUnits, ethers } from 'ethers';
import { logErrorWithConsole } from '../utils/errorLogger';
import BigNumber from 'bignumber.js';
import { predictNextBaseFees, calculatePercentiles, fetchLatestBlock } from './gasPredictor';
import { getProvider } from '../modules/provider';

type PercentileMap = {
  p10: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
};

type GasOracleBlockEntry = {
  ts: number;
  baseFeeGwei: number;
  priorityP50: number;
  priorityP90: number;
};

export type GasOracleSnapshot = {
  updatedAt: number;
  mempoolCount: number;
  baseFeeGwei: number | null;
  predictedBaseFeeGwei: number | null;
  predictedBaseFeesNextBlocks: number[]; // Next 5 blocks predicted base fees
  predictedPriorityFeeGwei: number | null;
  priorityPercentiles: PercentileMap;
  suggestions: {
    slow: number | null;
    average: number | null;
    fast: number | null;
  };
  confidence: number;
  blockHistory: GasOracleBlockEntry[];
};

const DEFAULT_SNAPSHOT: GasOracleSnapshot = {
  updatedAt: 0,
  mempoolCount: 0,
  baseFeeGwei: null,
  predictedBaseFeeGwei: null,
  predictedBaseFeesNextBlocks: [],
  predictedPriorityFeeGwei: null,
  priorityPercentiles: { p10: 0, p25: 0, p50: 0, p75: 0, p90: 0 },
  suggestions: { slow: null, average: null, fast: null },
  confidence: 0,
  blockHistory: [],
};

// Use calculatePercentiles from gasPredictor instead

function toGwei(valueWei: number | null | undefined): number | null {
  if (valueWei == null || Number.isNaN(valueWei)) return null;
  try {
    const wei = BigInt(Math.max(0, Math.floor(valueWei)));
    return Number(formatUnits(wei, 9));
  } catch {
    return null;
  }
}

class GasOracle {
  private latest: GasOracleSnapshot = { ...DEFAULT_SNAPSHOT };
  private blockHistory: GasOracleBlockEntry[] = [];
  private interval: NodeJS.Timeout | null = null;
  private readonly refreshMs: number;

  constructor(refreshMs = Number(process.env.GAS_ORACLE_REFRESH_MS || '4000')) {
    this.refreshMs = refreshMs;
  }

  start(): void {
    if (this.interval) return;
    this.refresh().catch(err => logErrorWithConsole(err, 'GasOracle initial refresh failed'));
    this.interval = setInterval(() => {
      this.refresh().catch(err => logErrorWithConsole(err, 'GasOracle refresh failed'));
    }, this.refreshMs);
    console.log(`? Gas oracle started (refresh ${this.refreshMs} ms)`);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getSnapshot(): GasOracleSnapshot {
    return this.latest;
  }

  private async refresh(): Promise<void> {
    const now = Date.now();
    const { priorityValues, mempoolCount } = await this.collectPendingStats();
    const feeHistory = await getFeeHistoryAnalytics(15);

    const baseFeeGwei = toGwei(feeHistory.base_fee ?? null);
    const historyPercentiles = {
      p10: toGwei(feeHistory.percentiles['10'] ?? null) ?? 0,
      p50: toGwei(feeHistory.percentiles['50'] ?? null) ?? 0,
      p90: toGwei(feeHistory.percentiles['90'] ?? null) ?? 0,
    };

    // Use calculatePercentiles from gasPredictor
    const percentilesMap = calculatePercentiles(priorityValues);
    const percentiles: PercentileMap = {
      p10: percentilesMap.p10,
      p25: percentilesMap.p25,
      p50: percentilesMap.p50,
      p75: percentilesMap.p75,
      p90: percentilesMap.p90,
    };
    const { p10, p25, p50, p75, p90 } = percentiles;

    // Use BigNumber for precise pressure and fee calculations
    const pressureBN = new BigNumber(mempoolCount).div(2000);
    const pressure = BigNumber.max(BigNumber.min(pressureBN, new BigNumber(0.5)), new BigNumber(0)).toNumber();

    let predictedBaseFeeGwei: number | null = null;
    let predictedBaseFeesNextBlocks: number[] = [];
    
    if (baseFeeGwei != null) {
      // Use EIP-1559 formula for more accurate prediction
      // Fetch latest block to get gasUsed and gasLimit
      try {
        const provider = getProvider();
        const latestBlock = await fetchLatestBlock(provider);
        
        if (latestBlock && latestBlock.gasUsed && latestBlock.gasLimit) {
          const baseFeeWei = BigInt(Math.floor(baseFeeGwei * 1e9));
          const predictedBaseFeesWei = predictNextBaseFees(
            baseFeeWei,
            latestBlock.gasUsed,
            latestBlock.gasLimit,
            5
          );
          predictedBaseFeesNextBlocks = predictedBaseFeesWei.map(bf => Number(formatUnits(bf, "gwei")));
          predictedBaseFeeGwei = predictedBaseFeesNextBlocks[0] || baseFeeGwei;
        } else {
          // Fallback to pressure-based prediction
          const baseFeeBN = new BigNumber(baseFeeGwei);
          const predictedBN = BigNumber.max(baseFeeBN, baseFeeBN.multipliedBy(new BigNumber(1).plus(pressure)));
          predictedBaseFeeGwei = predictedBN.toNumber();
          predictedBaseFeesNextBlocks = [predictedBaseFeeGwei];
        }
      } catch (err) {
        // Fallback to pressure-based prediction on error
        const baseFeeBN = new BigNumber(baseFeeGwei);
        const predictedBN = BigNumber.max(baseFeeBN, baseFeeBN.multipliedBy(new BigNumber(1).plus(pressure)));
        predictedBaseFeeGwei = predictedBN.toNumber();
        predictedBaseFeesNextBlocks = [predictedBaseFeeGwei];
      }
    }

    const predictedPriorityFeeGwei = p75 || historyPercentiles.p90 || historyPercentiles.p50;

    // Use BigNumber for precise suggestion calculations
    const suggestions = {
      slow: baseFeeGwei != null ? new BigNumber(baseFeeGwei).plus(p25 || historyPercentiles.p10).toNumber() : null,
      average: baseFeeGwei != null ? new BigNumber(baseFeeGwei).plus(p50 || historyPercentiles.p50).toNumber() : null,
      fast: baseFeeGwei != null ? new BigNumber(baseFeeGwei).plus(p90 || historyPercentiles.p90).toNumber() : null,
    };

    if (baseFeeGwei != null) {
      this.blockHistory.push({
        ts: now,
        baseFeeGwei,
        priorityP50: p50 || historyPercentiles.p50,
        priorityP90: p90 || historyPercentiles.p90,
      });
      if (this.blockHistory.length > 180) {
        this.blockHistory.splice(0, this.blockHistory.length - 180);
      }
    }

    // Use BigNumber for precise confidence calculation
    const confidence = BigNumber.max(BigNumber.min(new BigNumber(mempoolCount).div(200), new BigNumber(1)), new BigNumber(0)).toNumber();

    this.latest = {
      updatedAt: now,
      mempoolCount,
      baseFeeGwei,
      predictedBaseFeeGwei,
      predictedBaseFeesNextBlocks,
      predictedPriorityFeeGwei,
      priorityPercentiles: percentiles,
      suggestions,
      confidence,
      blockHistory: [...this.blockHistory],
    };
  }

  private async collectPendingStats(): Promise<{ priorityValues: number[]; mempoolCount: number }> {
    const state = getTrackerState();
    const snap = await state.snapshot(2000);
    const values: number[] = [];

    for (const tx of snap.txs) {
      if (tx._state !== TxState.PENDING) continue;
      const priority = this.extractPriorityFee(tx);
      if (priority != null && Number.isFinite(priority)) {
        values.push(priority);
      }
    }

    values.sort((a, b) => a - b);
    return { priorityValues: values, mempoolCount: values.length };
  }

  private extractPriorityFee(tx: Transaction): number | null {
    try {
      if (tx.maxPriorityFeePerGas) {
        return Number(formatUnits(hexToBigInt(tx.maxPriorityFeePerGas), 9));
      }
      if (tx.maxFeePerGas && tx._state === TxState.PENDING) {
        // Approximate priority fee when only maxFee is available
        return Number(formatUnits(hexToBigInt(tx.maxFeePerGas), 9));
      }
      return null;
    } catch (e) { logErrorWithConsole(e, 'Failed to extract priority fee'); }
    return null;
  }
}

const oracle = new GasOracle();

export function startGasOracle(): void {
  oracle.start();
}

export function getGasOracle(): GasOracle {
  return oracle;
}

