import { Transaction, TxState } from '@/lib/types';
import { hexToBigInt } from '@/lib/util/hex';

// Address performance metrics
export interface AddressMetrics {
  address: string;
  total_txs: number;
  successful_txs: number;
  failed_txs: number;
  win_rate: number; // Percentage of successful transactions
  total_volume_eth: number;
  total_gas_spent_eth: number;
  estimated_pnl_eth: number; // Estimated profit/loss
  avg_gas_price_gwei: number;
  first_seen: number;
  last_seen: number;
  score: number; // Overall profitability score
}

// Copy-trading opportunity
export interface CopyTradingOpportunity {
  address: string;
  confidence: number; // 0-1 score
  metrics: AddressMetrics;
  recent_wins: number;
  recent_win_rate: number;
  tags: string[]; // e.g., ['high_volume', 'consistent', 'dex_trader']
}

// Address profitability tracker
export class AddressTracker {
  private addressMetrics = new Map<string, AddressMetrics>();
  private txsByAddress = new Map<string, Transaction[]>();
  private maxTxsPerAddress = 1000;

  // Track a transaction for an address
  trackTransaction(tx: Transaction): void {
    const address = tx.from.toLowerCase();

    // Get or create address metrics
    let metrics = this.addressMetrics.get(address);
    if (!metrics) {
      metrics = {
        address,
        total_txs: 0,
        successful_txs: 0,
        failed_txs: 0,
        win_rate: 0,
        total_volume_eth: 0,
        total_gas_spent_eth: 0,
        estimated_pnl_eth: 0,
        avg_gas_price_gwei: 0,
        first_seen: tx._first_seen_ts,
        last_seen: tx._last_seen_ts,
        score: 0
      };
      this.addressMetrics.set(address, metrics);
    }

    // Track transaction
    let txs = this.txsByAddress.get(address);
    if (!txs) {
      txs = [];
      this.txsByAddress.set(address, txs);
    }
    
    // Add transaction if not already tracked
    if (!txs.find(t => t.hash === tx.hash)) {
      txs.push(tx);
      
      // Maintain size limit
      if (txs.length > this.maxTxsPerAddress) {
        txs.shift(); // Remove oldest
      }
    }

    // Update metrics
    this.updateMetrics(address);
  }

  // Update metrics for an address
  private updateMetrics(address: string): void {
    const metrics = this.addressMetrics.get(address);
    const txs = this.txsByAddress.get(address);
    
    if (!metrics || !txs || txs.length === 0) return;

    // Reset counts
    metrics.total_txs = txs.length;
    metrics.successful_txs = 0;
    metrics.failed_txs = 0;
    metrics.total_volume_eth = 0;
    metrics.total_gas_spent_eth = 0;

    let totalGasPrice = 0n;
    let gasCount = 0;

    for (const tx of txs) {
      // Count successful/failed based on receipt status
      if (tx._receipt) {
        if (tx._receipt.status === '0x1' || tx._receipt.status === '1') {
          metrics.successful_txs++;
        } else {
          metrics.failed_txs++;
        }

        // Calculate gas spent
        const gasUsed = hexToBigInt(tx._receipt.gasUsed);
        const gasPrice = hexToBigInt(tx._receipt.effectiveGasPrice || tx.gasPrice || '0');
        const gasCost = gasUsed * gasPrice;
        metrics.total_gas_spent_eth += Number(gasCost) / 1e18;
      }

      // Calculate volume
      const value = hexToBigInt(tx.value);
      metrics.total_volume_eth += Number(value) / 1e18;

      // Track gas prices
      const txGasPrice = hexToBigInt(tx.maxFeePerGas || tx.gasPrice || '0');
      if (txGasPrice > 0n) {
        totalGasPrice += txGasPrice;
        gasCount++;
      }

      // Update timestamps
      if (tx._first_seen_ts < metrics.first_seen) {
        metrics.first_seen = tx._first_seen_ts;
      }
      if (tx._last_seen_ts > metrics.last_seen) {
        metrics.last_seen = tx._last_seen_ts;
      }
    }

    // Calculate win rate
    const totalCompleted = metrics.successful_txs + metrics.failed_txs;
    metrics.win_rate = totalCompleted > 0 
      ? (metrics.successful_txs / totalCompleted) * 100 
      : 0;

    // Calculate average gas price
    metrics.avg_gas_price_gwei = gasCount > 0 
      ? Number(totalGasPrice / BigInt(gasCount)) / 1e9 
      : 0;

    // Estimate PnL (simplified - based on volume vs gas spent)
    // In reality, would need to track token balances, DEX trades, etc.
    metrics.estimated_pnl_eth = metrics.total_volume_eth - metrics.total_gas_spent_eth;

    // Calculate overall score
    metrics.score = this.calculateScore(metrics);
  }

  // Calculate profitability score (0-100)
  private calculateScore(metrics: AddressMetrics): number {
    let score = 0;

    // Win rate component (0-40 points)
    score += (metrics.win_rate / 100) * 40;

    // Volume component (0-30 points)
    const volumeScore = Math.min(metrics.total_volume_eth / 10, 1) * 30; // Max at 10 ETH
    score += volumeScore;

    // Transaction count component (0-20 points)
    const txScore = Math.min(metrics.total_txs / 100, 1) * 20; // Max at 100 txs
    score += txScore;

    // PnL component (0-10 points)
    if (metrics.estimated_pnl_eth > 0) {
      score += Math.min(metrics.estimated_pnl_eth, 1) * 10; // Max at 1 ETH profit
    }

    return Math.min(Math.round(score), 100);
  }

  // Get metrics for an address
  getMetrics(address: string): AddressMetrics | null {
    return this.addressMetrics.get(address.toLowerCase()) || null;
  }

  // Get all tracked addresses sorted by score
  getTopAddresses(limit: number = 50): AddressMetrics[] {
    const allMetrics = Array.from(this.addressMetrics.values());
    allMetrics.sort((a, b) => b.score - a.score);
    return allMetrics.slice(0, limit);
  }

  // Identify copy-trading opportunities
  identifyCopyTradingOpportunities(minScore: number = 70, minTxs: number = 10): CopyTradingOpportunity[] {
    const opportunities: CopyTradingOpportunity[] = [];

    for (const metrics of this.addressMetrics.values()) {
      // Filter by minimum criteria
      if (metrics.score < minScore || metrics.total_txs < minTxs) {
        continue;
      }

      // Calculate recent performance (last 20 transactions)
      const txs = this.txsByAddress.get(metrics.address);
      if (!txs) continue;

      const recentTxs = txs.slice(-20);
      const recentSuccessful = recentTxs.filter(tx => 
        tx._receipt && (tx._receipt.status === '0x1' || tx._receipt.status === '1')
      ).length;
      const recentCompleted = recentTxs.filter(tx => tx._receipt).length;
      const recentWinRate = recentCompleted > 0 
        ? (recentSuccessful / recentCompleted) * 100 
        : 0;

      // Only include if recent performance is good
      if (recentWinRate < 70) {
        continue;
      }

      // Generate tags
      const tags: string[] = [];
      if (metrics.total_volume_eth > 5) tags.push('high_volume');
      if (metrics.win_rate > 85) tags.push('consistent');
      if (metrics.total_txs > 50) tags.push('active');
      if (metrics.avg_gas_price_gwei > 50) tags.push('high_gas_bidder');

      // Detect trading patterns from transactions
      const dexTxs = recentTxs.filter(tx => 
        tx.category_key.startsWith('dex:')
      ).length;
      if (dexTxs > recentTxs.length * 0.5) {
        tags.push('dex_trader');
      }

      // Calculate confidence score
      const confidence = this.calculateConfidence(metrics, recentWinRate, recentTxs.length);

      opportunities.push({
        address: metrics.address,
        confidence,
        metrics,
        recent_wins: recentSuccessful,
        recent_win_rate: recentWinRate,
        tags
      });
    }

    // Sort by confidence
    opportunities.sort((a, b) => b.confidence - a.confidence);
    return opportunities;
  }

  // Calculate confidence score for copy-trading
  private calculateConfidence(
    metrics: AddressMetrics, 
    recentWinRate: number, 
    recentTxCount: number
  ): number {
    let confidence = 0;

    // Historical win rate (0-30%)
    confidence += (metrics.win_rate / 100) * 0.3;

    // Recent win rate (0-40%)
    confidence += (recentWinRate / 100) * 0.4;

    // Transaction count reliability (0-15%)
    confidence += Math.min(metrics.total_txs / 100, 1) * 0.15;

    // Recent activity (0-15%)
    confidence += Math.min(recentTxCount / 20, 1) * 0.15;

    return Math.min(confidence, 1);
  }

  // Get addresses with high success rates
  getHighSuccessRateAddresses(minWinRate: number = 80, minTxs: number = 10): AddressMetrics[] {
    const filtered = Array.from(this.addressMetrics.values()).filter(metrics => 
      metrics.win_rate >= minWinRate && 
      metrics.total_txs >= minTxs
    );
    
    filtered.sort((a, b) => b.win_rate - a.win_rate);
    return filtered;
  }

  // Get statistics
  getStatistics(): {
    total_addresses: number;
    addresses_with_profit: number;
    total_volume_eth: number;
    total_gas_spent_eth: number;
    avg_win_rate: number;
  } {
    const allMetrics = Array.from(this.addressMetrics.values());
    
    let totalVolume = 0;
    let totalGasSpent = 0;
    let totalWinRate = 0;
    let profitableAddresses = 0;

    for (const metrics of allMetrics) {
      totalVolume += metrics.total_volume_eth;
      totalGasSpent += metrics.total_gas_spent_eth;
      totalWinRate += metrics.win_rate;
      
      if (metrics.estimated_pnl_eth > 0) {
        profitableAddresses++;
      }
    }

    return {
      total_addresses: allMetrics.length,
      addresses_with_profit: profitableAddresses,
      total_volume_eth: totalVolume,
      total_gas_spent_eth: totalGasSpent,
      avg_win_rate: allMetrics.length > 0 ? totalWinRate / allMetrics.length : 0
    };
  }
}

// Global address tracker instance
let addressTracker: AddressTracker | null = null;

export function getAddressTracker(): AddressTracker {
  if (!addressTracker) {
    addressTracker = new AddressTracker();
  }
  return addressTracker;
}
