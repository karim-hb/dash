import { Transaction, MetricsResult, StateMetrics, FeeHistoryPercentile, GasSuggestions } from '@/lib/types';
import { getTrackerState } from '../state/state';
import { getTxpoolStatus } from '../ingest/txpool';
import { getWsClient } from '../rpc/wsClient';
import { hexToBigInt } from '@/lib/util/hex';
import { formatUnits } from 'ethers';

// Score transaction based on amount, gas, and age (similar to ranking.py)
function scoreTx(tx: Transaction, nowTs: number = Date.now() / 1000): number {
  const amountWei = hexToBigInt(tx.value || '0x0');
  const amountEth = Number(formatUnits(amountWei, 18));
  const maxFee = tx.maxFeePerGas || tx.gasPrice || '0x0';
  const gasWei = hexToBigInt(maxFee);
  const gasGwei = Number(formatUnits(gasWei, 9));
  const age = tx._first_seen_ts ? Math.max(0, nowTs - tx._first_seen_ts) : 0;

  // Base weights (same as ranking.py)
  const wAmount = 2.0;
  const wGas = 1.0;
  const wAge = 0.2;

  return wAmount * (amountEth <= 0 ? 0 : (1.0 + amountEth) ** 0.3) + wGas * gasGwei - wAge * age;
}

// Metrics aggregator for real-time statistics
export class MetricsAggregator {
  private ingressHistory: number[] = [];
  private includedHistory: number[] = [];
  private droppedHistory: number[] = [];
  private pendingHistory: number[] = [];
  private maxPoints = 60; // last 60 intervals (~12s @200ms broadcast or ~60s if per second)

  // Build metrics from transactions and txpool status
  async build(txs: Transaction[], txpoolStatus?: any): Promise<MetricsResult> {
    // Get txpool status if not provided
    if (!txpoolStatus) {
      txpoolStatus = await getTxpoolStatus();
    }

    // Count transactions by category
    const byType: Record<string, number> = {};
    let largeEthCount = 0;

    for (const tx of txs) {
      // Count by type
      const type = tx.category_key || 'unknown';
      byType[type] = (byType[type] || 0) + 1;

      // Count large ETH transfers
      if (tx.value && !tx.input) {
        const value = hexToBigInt(tx.value);
        if (value >= 1_000_000_000_000_000_000n) { // >= 1 ETH
          largeEthCount++;
        }
      }
    }

    // Gas buckets from effective fee (gwei)
    const gasBuckets = {
      gte_100: 0,
      gte_150: 0,
      gte_200: 0,
      gte_300: 0,
    };
    for (const tx of txs) {
      try {
        const wei = tx.maxFeePerGas || tx.gasPrice;
        if (!wei) continue;
        const gwei = Number(formatUnits(hexToBigInt(wei), 9));
        if (gwei >= 100) gasBuckets.gte_100++;
        if (gwei >= 150) gasBuckets.gte_150++;
        if (gwei >= 200) gasBuckets.gte_200++;
        if (gwei >= 300) gasBuckets.gte_300++;
      } catch {}
    }

    // Parse txpool status
    let pending = 0;
    let queued = 0;

    if (txpoolStatus) {
      try {
        if (typeof txpoolStatus.pending === 'string') {
          pending = Number(hexToBigInt(txpoolStatus.pending));
        }
        if (typeof txpoolStatus.queued === 'string') {
          queued = Number(hexToBigInt(txpoolStatus.queued));
        }
      } catch (error) {
        console.error('Failed to parse txpool status:', error);
      }
    }

    // Fallback to in-memory counts if txpool status unavailable or zero
    try {
      const stateMetrics = getTrackerState().getMetrics();
      if (!pending && stateMetrics.pending) pending = stateMetrics.pending;
      if (!queued) queued = 0;
    } catch {}

    // Calculate rates from timestamps
    const nowSec = Date.now() / 1000;
    const ingressPerSec = txs.filter(tx => (tx._first_seen_ts || 0) >= (nowSec - 1)).length;
    const egressPerSec = txs.filter(tx => (tx._inclusion_ts || 0) >= (nowSec - 1)).length;
    const droppedPerSec = txs.filter(tx => tx._state === 'DROPPED' && (tx._last_seen_ts || 0) >= (nowSec - 1)).length as number;

    // Age percentiles (simplified)
    const ages = txs
      .filter(tx => tx._first_seen_ts)
      .map(tx => Date.now() / 1000 - tx._first_seen_ts!)
      .sort((a, b) => a - b);

    let ageP50: number | null = null;
    let ageP90: number | null = null;
    let ageMax: number | null = null;

    if (ages.length > 0) {
      const mid = Math.floor(ages.length / 2);
      ageP50 = ages[mid];
      const p90Index = Math.floor(ages.length * 0.9);
      ageP90 = ages[Math.min(p90Index, ages.length - 1)];
      ageMax = ages[ages.length - 1];
    }

    // Update flow histories (truncate to maxPoints)
    this.pushHistory(this.ingressHistory, ingressPerSec);
    this.pushHistory(this.includedHistory, egressPerSec);
    this.pushHistory(this.droppedHistory, droppedPerSec);
    this.pushHistory(this.pendingHistory, pending);

    return {
      total_pending: pending,
      total_queued: queued,
      by_type: byType,
      large_eth_count: largeEthCount,
      gas_buckets: gasBuckets,
      ingress_per_sec: ingressPerSec,
      egress_per_sec: egressPerSec,
      age_p50: ageP50,
      age_p90: ageP90,
      age_max: ageMax,
    };
  }

  // Get state metrics summary
  getStateMetrics(): StateMetrics {
    const state = getTrackerState();
    const metrics = state.getMetrics();
    const counts = state.getStateCounts();

    // Calculate success rate (included / (included + dropped))
    const included = metrics.included + metrics.confirmed + metrics.finalized;
    const dropped = metrics.dropped;
    const successRate = included + dropped > 0 ? included / (included + dropped) : null;

    // Calculate average inclusion time over recent included txs
    const includedTxs = Array.from((state as any).txs?.values?.() || [])
      .filter((t: any) => t._inclusion_ts && t._first_seen_ts && t._inclusion_ts > t._first_seen_ts)
      .slice(-500);
    const avgInclusionTime = includedTxs.length > 0
      ? includedTxs.reduce((sum: number, t: any) => sum + (t._inclusion_ts - t._first_seen_ts), 0) / includedTxs.length
      : null;

    // Calculate congestion (pending / (pending + included rate))
    const congestion = metrics.pending > 0 ? metrics.pending / (metrics.pending + 1) : 0;

    return {
      state_counts: counts,
      success_rate: successRate,
      avg_inclusion_time: avgInclusionTime,
      congestion: congestion,
      flow_ingress_per_window: metrics.pending,
      flow_included_per_window: metrics.included,
      flow_dropped_per_window: metrics.dropped,
      flow_stuck_per_window: metrics.pending, // Simplified
    };
  }

  // Get flow sparkline data (simplified)
  getFlowSparklines(): Record<string, string> {
    return {
      ingress: this.ingressHistory.join(','),
      included: this.includedHistory.join(','),
      dropped: this.droppedHistory.join(','),
      stuck: this.pendingHistory.join(','),
    };
  }

  private pushHistory(arr: number[], value: number): void {
    arr.push(value);
    if (arr.length > this.maxPoints) arr.splice(0, arr.length - this.maxPoints);
  }
}

// Gas analytics
export async function getFeeHistoryAnalytics(blocks: number = 20): Promise<FeeHistoryPercentile> {
  try {
    const wsClient = getWsClient();

    // Get latest block number
    const latestBlock = await wsClient.rpc('eth_blockNumber', []);
    const latestBlockNum = Number(hexToBigInt(latestBlock));

    // Get fee history
    const { numberToHex } = await import('@/lib/util/hex');
    const feeHistory = await wsClient.rpc('eth_feeHistory', [numberToHex(blocks), latestBlock, [10, 50, 90]]);

    if (!feeHistory || !feeHistory.baseFeePerGas) {
      return {
        base_fee: null,
        suggested_gas_price: null,
        suggested_max_fee: null,
        suggested_priority_fee: null,
        percentiles: {},
      };
    }

    // Extract base fee (latest)
    const baseFees = feeHistory.baseFeePerGas.map((fee: string) => Number(hexToBigInt(fee)));
    const baseFee = baseFees.length > 0 ? baseFees[baseFees.length - 1] : null;

    // Calculate suggestions based on percentiles
    const priorityFees = feeHistory.reward?.map((rewards: string[]) =>
      rewards.map((r: string) => Number(hexToBigInt(r)))
    ) || [];

    // Simple suggestion logic
    const suggestedPriorityFee = baseFee ? Math.max(baseFee * 0.1, 2e9) : null; // 2 gwei min
    const suggestedMaxFee = baseFee ? baseFee + (suggestedPriorityFee || 0) : null;

    // Use last block reward percentiles when available
    const last = priorityFees.length > 0 ? priorityFees[priorityFees.length - 1] : [0, 0, 0];

    return {
      base_fee: baseFee,
      suggested_gas_price: suggestedMaxFee, // For legacy txs
      suggested_max_fee: suggestedMaxFee,
      suggested_priority_fee: suggestedPriorityFee,
      percentiles: {
        '10': last[0] || 0,
        '50': last[1] || 0,
        '90': last[2] || 0,
      },
    };
  } catch (error) {
    console.error('Failed to get fee history analytics:', error);
    return {
      base_fee: null,
      suggested_gas_price: null,
      suggested_max_fee: null,
      suggested_priority_fee: null,
      percentiles: {},
    };
  }
}

// Convert fee history to gas suggestions
export function feeHistoryToSuggestions(feeHistory: FeeHistoryPercentile): GasSuggestions {
  return {
    base_fee: feeHistory.base_fee,
    tips: {
      '1_block': feeHistory.percentiles['10'] || 0,
      '3_blocks': feeHistory.percentiles['50'] || 0,
      '5_blocks': feeHistory.percentiles['90'] || 0,
    },
  };
}

// Global aggregator instance
let aggregator: MetricsAggregator | null = null;

export function getMetricsAggregator(): MetricsAggregator {
  if (!aggregator) {
    aggregator = new MetricsAggregator();
  }
  return aggregator;
}
