import { Transaction, TxState, StateTransition } from '@/lib/types';
import { getTrackerState } from '../state/state';
import { hexToNumber } from '@/lib/util/hex';

// Nonce tracking per sender
interface NonceInfo {
  pending_nonce: number;
  confirmed_nonce: number;
  last_seen_block: number;
  gap_detected: boolean;
}

// Block monitoring for transaction lifecycle
export class BlockMonitor {
  private nonceTracker = new Map<string, NonceInfo>();
  private currentBlock: number = 0;
  private mempoolTxHashes = new Set<string>();

  constructor() {
    this.startMonitoring();
  }

  // Start block monitoring
  private startMonitoring(): void {
    // This would be called from the main ingestion loop
    console.log('🔍 BlockMonitor initialized');
  }

  // Update current block number
  setCurrentBlock(blockNumber: number): void {
    this.currentBlock = blockNumber;
  }

  // Update mempool transaction set
  updateMempoolTxs(txHashes: string[]): void {
    this.mempoolTxHashes = new Set(txHashes.map(h => h.toLowerCase()));
  }

  // Process new block to detect inclusions
  async processBlock(blockNumber: number, blockTxs: Transaction[]): Promise<void> {
    const state = getTrackerState();
    this.currentBlock = blockNumber;

    // Track which transactions are in this block
    const blockTxHashes = new Set(blockTxs.map(tx => tx.hash.toLowerCase()));

    // Get all pending transactions
    const snapshot = await state.snapshot(5000);
    const pendingTxs = snapshot.txs.filter(tx => 
      tx._state === TxState.PENDING || 
      tx._state === TxState.RESUBMITTED
    );

    // Check each pending transaction
    for (const pendingTx of pendingTxs) {
      const hash = pendingTx.hash.toLowerCase();

      // Check if transaction was included in this block
      if (blockTxHashes.has(hash)) {
        await this.handleInclusion(pendingTx, blockNumber.toString());
        continue;
      }

      // Check if transaction was replaced
      const replacement = await this.detectReplacement(pendingTx, blockTxs);
      if (replacement) {
        await this.handleReplacement(pendingTx, replacement, blockNumber.toString());
        continue;
      }

      // Check if transaction should be marked as dropped
      if (!this.mempoolTxHashes.has(hash)) {
        await this.handleDrop(pendingTx, blockNumber);
      }
    }

    // Update confirmation depths
    await state.updateConfirmationDepth(blockNumber);

    // Update nonce tracking
    await this.updateNonceTracking(blockTxs, blockNumber);
  }

  // Handle transaction inclusion
  private async handleInclusion(tx: Transaction, blockNumber: string): Promise<void> {
    const state = getTrackerState();
    
    tx._state = TxState.INCLUDED;
    tx._inclusion_block = blockNumber;
    tx._inclusion_ts = Date.now() / 1000;
    tx._confirmation_depth = 0;

    // Add state transition
    const transition: StateTransition = {
      from_state: tx._state_history?.[tx._state_history.length - 1]?.to_state || TxState.PENDING,
      to_state: TxState.INCLUDED,
      timestamp: Date.now() / 1000,
      reason: 'included in block',
      block_number: blockNumber
    };

    if (!tx._state_history) {
      tx._state_history = [];
    }
    tx._state_history.push(transition);

    await state.upsert(tx);
    console.log(`✅ Transaction ${tx.hash} included in block ${blockNumber}`);
  }

  // Detect transaction replacement (same nonce, higher gas)
  private async detectReplacement(originalTx: Transaction, blockTxs: Transaction[]): Promise<Transaction | null> {
    const originalNonce = hexToNumber(originalTx.nonce);
    const originalFrom = originalTx.from.toLowerCase();

    for (const blockTx of blockTxs) {
      const blockTxNonce = hexToNumber(blockTx.nonce);
      const blockTxFrom = blockTx.from.toLowerCase();

      // Same sender and nonce = replacement
      if (blockTxFrom === originalFrom && blockTxNonce === originalNonce) {
        // Check if it's actually a different transaction
        if (blockTx.hash.toLowerCase() !== originalTx.hash.toLowerCase()) {
          // Verify higher gas price
          const originalGas = this.getEffectiveGasPrice(originalTx);
          const blockTxGas = this.getEffectiveGasPrice(blockTx);
          
          if (blockTxGas >= originalGas) {
            return blockTx;
          }
        }
      }
    }

    return null;
  }

  // Get effective gas price for comparison
  private getEffectiveGasPrice(tx: Transaction): bigint {
    if (tx.maxFeePerGas) {
      return BigInt(tx.maxFeePerGas);
    } else if (tx.gasPrice) {
      return BigInt(tx.gasPrice);
    }
    return 0n;
  }

  // Handle transaction replacement
  private async handleReplacement(originalTx: Transaction, replacementTx: Transaction, blockNumber: string): Promise<void> {
    const state = getTrackerState();

    // Update original transaction as REPLACED
    originalTx._state = TxState.REPLACED;
    originalTx._replaced_by = replacementTx.hash;

    const transition: StateTransition = {
      from_state: originalTx._state_history?.[originalTx._state_history.length - 1]?.to_state || TxState.PENDING,
      to_state: TxState.REPLACED,
      timestamp: Date.now() / 1000,
      reason: 'replaced by higher gas transaction',
      block_number: blockNumber
    };

    if (!originalTx._state_history) {
      originalTx._state_history = [];
    }
    originalTx._state_history.push(transition);

    await state.upsert(originalTx);

    // Mark replacement transaction
    replacementTx._replacement_tx = originalTx.hash;
    await state.upsert(replacementTx);

    console.log(`🔄 Transaction ${originalTx.hash} replaced by ${replacementTx.hash}`);
  }

  // Handle transaction drop
  private async handleDrop(tx: Transaction, currentBlock: number): Promise<void> {
    const state = getTrackerState();
    const timeSinceFirstSeen = (Date.now() / 1000) - tx._first_seen_ts;

    // Only drop if transaction has been pending for a while (e.g., 5 minutes)
    if (timeSinceFirstSeen < 300) {
      return;
    }

    // Detect drop reason
    let dropReason = 'unknown';
    
    const nonceInfo = this.nonceTracker.get(tx.from.toLowerCase());
    if (nonceInfo) {
      const txNonce = hexToNumber(tx.nonce);
      
      if (txNonce < nonceInfo.confirmed_nonce) {
        dropReason = 'nonce too low';
      } else if (txNonce > nonceInfo.pending_nonce + 5) {
        dropReason = 'nonce gap detected';
      } else {
        const gasPrice = this.getEffectiveGasPrice(tx);
        if (gasPrice < BigInt(1e9)) { // Less than 1 gwei
          dropReason = 'gas price too low';
        }
      }
    }

    tx._state = TxState.DROPPED;
    tx._drop_reason = dropReason;

    const transition: StateTransition = {
      from_state: tx._state_history?.[tx._state_history.length - 1]?.to_state || TxState.PENDING,
      to_state: TxState.DROPPED,
      timestamp: Date.now() / 1000,
      reason: dropReason
    };

    if (!tx._state_history) {
      tx._state_history = [];
    }
    tx._state_history.push(transition);

    await state.upsert(tx);
    console.log(`❌ Transaction ${tx.hash} dropped: ${dropReason}`);
  }

  // Update nonce tracking for all addresses
  private async updateNonceTracking(blockTxs: Transaction[], blockNumber: number): Promise<void> {
    const state = getTrackerState();

    // Update confirmed nonces from block transactions
    for (const tx of blockTxs) {
      const address = tx.from.toLowerCase();
      const nonce = hexToNumber(tx.nonce);

      let nonceInfo = this.nonceTracker.get(address);
      if (!nonceInfo) {
        nonceInfo = {
          pending_nonce: nonce,
          confirmed_nonce: nonce,
          last_seen_block: blockNumber,
          gap_detected: false
        };
      }

      // Update confirmed nonce (highest nonce seen in blocks)
      if (nonce >= nonceInfo.confirmed_nonce) {
        nonceInfo.confirmed_nonce = nonce + 1; // Next expected nonce
      }

      nonceInfo.last_seen_block = blockNumber;
      this.nonceTracker.set(address, nonceInfo);
    }

    // Update pending nonces from mempool
    const snapshot = await state.snapshot(5000);
    const pendingTxs = snapshot.txs.filter(tx => tx._state === TxState.PENDING);

    for (const tx of pendingTxs) {
      const address = tx.from.toLowerCase();
      const nonce = hexToNumber(tx.nonce);

      let nonceInfo = this.nonceTracker.get(address);
      if (!nonceInfo) {
        nonceInfo = {
          pending_nonce: nonce,
          confirmed_nonce: 0,
          last_seen_block: blockNumber,
          gap_detected: false
        };
      }

      // Update pending nonce (highest nonce seen in mempool)
      if (nonce > nonceInfo.pending_nonce) {
        nonceInfo.pending_nonce = nonce;
      }

      // Detect nonce gaps
      if (nonce > nonceInfo.confirmed_nonce + 1) {
        nonceInfo.gap_detected = true;
      }

      this.nonceTracker.set(address, nonceInfo);
    }
  }

  // Get nonce info for an address
  getNonceInfo(address: string): NonceInfo | null {
    return this.nonceTracker.get(address.toLowerCase()) || null;
  }

  // Get all addresses with nonce gaps
  getAddressesWithNonceGaps(): string[] {
    const addresses: string[] = [];
    for (const [address, info] of this.nonceTracker.entries()) {
      if (info.gap_detected) {
        addresses.push(address);
      }
    }
    return addresses;
  }

  // Get current block number
  getCurrentBlock(): number {
    return this.currentBlock;
  }
}

// Global block monitor instance
let blockMonitor: BlockMonitor | null = null;

export function getBlockMonitor(): BlockMonitor {
  if (!blockMonitor) {
    blockMonitor = new BlockMonitor();
  }
  return blockMonitor;
}
