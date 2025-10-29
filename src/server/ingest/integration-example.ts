/**
 * Integration Example: How to integrate BlockMonitor and AddressTracker
 * into the existing ingestion pipeline
 * 
 * This file shows how to modify your existing head tracking and transaction
 * processing to use the new monitoring features.
 */

import { getBlockMonitor } from '../monitoring/blockMonitor';
import { getAddressTracker } from '../monitoring/addressTracker';
import { getTrackerState } from '../state/state';
import { Transaction } from '@/lib/types';

// Example integration with heads.ts or block processing
export async function integrateBlockMonitoring() {
  const blockMonitor = getBlockMonitor();
  const addressTracker = getAddressTracker();
  const state = getTrackerState();

  /**
   * STEP 1: When you receive a new block from your RPC
   */
  async function onNewBlock(blockNumber: number, blockTransactions: Transaction[]) {
    console.log(`📦 Processing block ${blockNumber}`);

    // Update current block in monitor
    blockMonitor.setCurrentBlock(blockNumber);

    // Get current mempool transactions
    const mempoolSnapshot = await state.snapshot(5000);
    const mempoolHashes = mempoolSnapshot.txs
      .filter(tx => tx._state === 'PENDING' || tx._state === 'RESUBMITTED')
      .map(tx => tx.hash);
    
    // Update mempool in monitor
    blockMonitor.updateMempoolTxs(mempoolHashes);

    // Process block for inclusions, replacements, drops
    await blockMonitor.processBlock(blockNumber, blockTransactions);

    // Log statistics
    const nonceGaps = blockMonitor.getAddressesWithNonceGaps();
    if (nonceGaps.length > 0) {
      console.log(`⚠️  Detected ${nonceGaps.length} addresses with nonce gaps`);
    }
  }

  /**
   * STEP 2: When you receive a new pending transaction
   */
  async function onPendingTransaction(tx: Transaction) {
    // Existing: Store in state
    await state.upsert(tx);

    // NEW: Track for profitability analysis
    addressTracker.trackTransaction(tx);
  }

  /**
   * STEP 3: When transaction gets included in block
   */
  async function onTransactionIncluded(tx: Transaction, blockNumber: string) {
    // Existing: Mark as included
    await state.markIncluded(tx.hash, blockNumber);

    // NEW: Track for profitability
    addressTracker.trackTransaction(tx);
  }

  /**
   * STEP 4: Periodic analysis (e.g., every 10 blocks)
   */
  async function performPeriodicAnalysis() {
    // Get copy-trading opportunities
    const opportunities = addressTracker.identifyCopyTradingOpportunities(
      70,  // minScore
      10   // minTxs
    );

    if (opportunities.length > 0) {
      console.log(`💰 Found ${opportunities.length} copy-trading opportunities`);
      opportunities.slice(0, 5).forEach((opp, i) => {
        console.log(`  ${i + 1}. ${opp.address}`);
        console.log(`     Confidence: ${(opp.confidence * 100).toFixed(1)}%`);
        console.log(`     Win Rate: ${opp.recent_win_rate.toFixed(1)}%`);
        console.log(`     Tags: ${opp.tags.join(', ')}`);
      });
    }

    // Get statistics
    const stats = addressTracker.getStatistics();
    console.log('📊 Address Statistics:');
    console.log(`   Total addresses tracked: ${stats.total_addresses}`);
    console.log(`   Profitable addresses: ${stats.addresses_with_profit}`);
    console.log(`   Average win rate: ${stats.avg_win_rate.toFixed(1)}%`);
  }

  /**
   * STEP 5: Query nonce information
   */
  function getNonceInfo(address: string) {
    const nonceInfo = blockMonitor.getNonceInfo(address);
    
    if (nonceInfo) {
      console.log(`🔢 Nonce info for ${address}:`);
      console.log(`   Confirmed nonce: ${nonceInfo.confirmed_nonce}`);
      console.log(`   Pending nonce: ${nonceInfo.pending_nonce}`);
      console.log(`   Gap detected: ${nonceInfo.gap_detected}`);
      console.log(`   Last seen block: ${nonceInfo.last_seen_block}`);
    }
  }

  /**
   * STEP 6: Query address metrics
   */
  function getAddressMetrics(address: string) {
    const metrics = addressTracker.getMetrics(address);
    
    if (metrics) {
      console.log(`📈 Metrics for ${address}:`);
      console.log(`   Total transactions: ${metrics.total_txs}`);
      console.log(`   Win rate: ${metrics.win_rate.toFixed(1)}%`);
      console.log(`   Total volume: ${metrics.total_volume_eth.toFixed(4)} ETH`);
      console.log(`   Gas spent: ${metrics.total_gas_spent_eth.toFixed(4)} ETH`);
      console.log(`   Estimated PnL: ${metrics.estimated_pnl_eth.toFixed(4)} ETH`);
      console.log(`   Score: ${metrics.score}/100`);
    }
  }

  return {
    onNewBlock,
    onPendingTransaction,
    onTransactionIncluded,
    performPeriodicAnalysis,
    getNonceInfo,
    getAddressMetrics
  };
}

/**
 * Example: Modify your existing heads.ts
 */
export function exampleHeadsIntegration() {
  const integration = integrateBlockMonitoring();

  // In your existing block subscription handler:
  async function handleNewBlockHeader(header: any) {
    const blockNumber = parseInt(header.number, 16);
    
    // Fetch full block transactions
    const block = await fetchBlock(blockNumber);
    
    // NEW: Process with monitoring
    await integration.onNewBlock(blockNumber, block.transactions);
    
    // Existing: Process transactions normally
    for (const tx of block.transactions) {
      await integration.onTransactionIncluded(tx, header.number);
    }
    
    // NEW: Every 10 blocks, run analysis
    if (blockNumber % 10 === 0) {
      await integration.performPeriodicAnalysis();
    }
  }
}

/**
 * Example: Modify your existing pending.ts
 */
export function examplePendingIntegration() {
  const integration = integrateBlockMonitoring();

  // In your existing pending transaction handler:
  async function handlePendingTransaction(txHash: string) {
    // Fetch transaction details
    const tx = await fetchTransaction(txHash);
    
    // NEW: Process with monitoring
    await integration.onPendingTransaction(tx);
    
    // Existing: Process transaction normally
    // ... your existing code ...
  }
}

// Placeholder functions (replace with your actual RPC calls)
async function fetchBlock(blockNumber: number): Promise<any> {
  // Your RPC call to fetch block
  return {};
}

async function fetchTransaction(hash: string): Promise<any> {
  // Your RPC call to fetch transaction
  return {};
}

/**
 * WebSocket API Integration Example
 * 
 * Add these endpoints to ws-server.ts
 */
export function wsServerIntegration() {
  return {
    // Get nonce info for address
    getNonceInfo: (address: string) => {
      const blockMonitor = getBlockMonitor();
      return blockMonitor.getNonceInfo(address);
    },

    // Get address metrics
    getAddressMetrics: (address: string) => {
      const addressTracker = getAddressTracker();
      return addressTracker.getMetrics(address);
    },

    // Get copy-trading opportunities
    getCopyTradingOpportunities: (minScore = 70, minTxs = 10) => {
      const addressTracker = getAddressTracker();
      return addressTracker.identifyCopyTradingOpportunities(minScore, minTxs);
    },

    // Get top performers
    getTopAddresses: (limit = 50) => {
      const addressTracker = getAddressTracker();
      return addressTracker.getTopAddresses(limit);
    },

    // Get statistics
    getStatistics: () => {
      const addressTracker = getAddressTracker();
      return addressTracker.getStatistics();
    }
  };
}
