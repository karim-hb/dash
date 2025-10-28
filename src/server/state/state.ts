import { Transaction, Receipt, TxState } from '@/lib/types';
import { getTransactionsCollection, getReceiptsCollection } from '@/lib/db/mongo';
import { classifyTx } from '../classify';
import { decodeFunctionAndArgs } from '../decoding/decoders';

// In-memory state management with MongoDB persistence
export class TrackerState {
  private txs = new Map<string, Transaction>();
  private maxSize = 10000; // Limit in-memory size
  private persistenceEnabled = process.env.PERSIST_TO_MONGO === 'true';

  constructor() {
    // Optional: load recent transactions from MongoDB on startup
    if (this.persistenceEnabled) {
      this.loadRecentState();
    }
  }

  // Upsert transaction (add or update)
  async upsert(tx: Transaction): Promise<void> {
    const hash = tx.hash.toLowerCase();

    // Classify if not already classified
    if (!tx.category_key) {
      const classification = classifyTx(tx);
      tx.category_key = `${classification.category}:${classification.protocol.toLowerCase()}`;
    }

    // Decode function if not already decoded and has input
    if (!tx._decoded_fn && tx.input && tx.input !== '0x') {
      try {
        const decoded = await decodeFunctionAndArgs(tx);
        if (decoded) {
          tx._decoded_fn = decoded;
        }
      } catch (error) {
        console.error(`Failed to decode tx ${hash}:`, error);
      }
    }

    // Update in-memory state
    this.txs.set(hash, { ...tx });

    // Persist to MongoDB
    if (this.persistenceEnabled) {
      try {
        const collection = getTransactionsCollection();
        await collection.updateOne(
          { hash },
          { $set: tx },
          { upsert: true }
        );
      } catch (error) {
        console.error('Failed to persist transaction:', error);
      }
    }

    // Maintain size limit
    if (this.txs.size > this.maxSize) {
      // Remove oldest entries (simple FIFO)
      const entries = Array.from(this.txs.entries());
      entries.sort((a, b) => (a[1]._first_seen_ts || 0) - (b[1]._first_seen_ts || 0));
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1)); // Remove 10%
      for (const [hash] of toRemove) {
        this.txs.delete(hash);
      }
    }
  }

  // Get transaction by hash
  getTx(hash: string): Transaction | null {
    return this.txs.get(hash.toLowerCase()) || null;
  }

  // Mark transaction as included
  async markIncluded(hash: string, blockNumber: string): Promise<void> {
    const tx = this.getTx(hash);
    if (!tx) return;

    tx._state = TxState.INCLUDED;
    tx._inclusion_block = blockNumber;
    tx._inclusion_ts = Date.now() / 1000;

    await this.upsert(tx);
  }

  // Set receipt for transaction
  async setReceipt(hash: string, receipt: Receipt): Promise<void> {
    const tx = this.getTx(hash);
    if (!tx) return;

    tx._receipt = receipt;

    // Persist receipt
    if (this.persistenceEnabled) {
      try {
        const collection = getReceiptsCollection();
        await collection.updateOne(
          { transactionHash: hash },
          { $set: receipt },
          { upsert: true }
        );
      } catch (error) {
        console.error('Failed to persist receipt:', error);
      }
    }

    await this.upsert(tx);
  }

  // Get state snapshot
  async snapshot(limit: number = 1000): Promise<{ txs: Transaction[] }> {
    const txs = Array.from(this.txs.values());

    // Sort by most recent first
    txs.sort((a, b) => (b._first_seen_ts || 0) - (a._first_seen_ts || 0));

    return { txs: txs.slice(0, limit) };
  }

  // Get included transactions
  async snapshotIncluded(limit: number = 200): Promise<Transaction[]> {
    const included = Array.from(this.txs.values())
      .filter(tx => tx._state === TxState.INCLUDED || tx._state === TxState.CONFIRMED || tx._state === TxState.FINALIZED)
      .sort((a, b) => (b._inclusion_ts || 0) - (a._inclusion_ts || 0));

    return included.slice(0, limit);
  }

  // Update confirmation depths
  async updateConfirmationDepth(currentBlock: number): Promise<void> {
    const updates: Promise<void>[] = [];

    for (const tx of this.txs.values()) {
      if (tx._state === TxState.INCLUDED && tx._inclusion_block) {
        const inclusionBlock = parseInt(tx._inclusion_block);
        if (!isNaN(inclusionBlock)) {
          const depth = currentBlock - inclusionBlock;
          tx._confirmation_depth = Math.max(0, depth);

          // Update state based on confirmations
          if (depth >= 12) {
            tx._state = TxState.FINALIZED;
          } else if (depth >= 1) {
            tx._state = TxState.CONFIRMED;
          }

          updates.push(this.upsert(tx));
        }
      }
    }

    await Promise.allSettled(updates);
  }

  // Get transaction count by state
  getStateCounts(): Record<string, number> {
    const counts: Record<string, number> = {};

    for (const tx of this.txs.values()) {
      const state = tx._state || TxState.PENDING;
      counts[state] = (counts[state] || 0) + 1;
    }

    return counts;
  }

  // Get metrics
  getMetrics(): {
    total: number;
    pending: number;
    included: number;
    confirmed: number;
    finalized: number;
    dropped: number;
  } {
    const counts = this.getStateCounts();

    return {
      total: this.txs.size,
      pending: counts[TxState.PENDING] || 0,
      included: counts[TxState.INCLUDED] || 0,
      confirmed: counts[TxState.CONFIRMED] || 0,
      finalized: counts[TxState.FINALIZED] || 0,
      dropped: counts[TxState.DROPPED] || 0,
    };
  }

  // Load recent state from MongoDB
  private async loadRecentState(): Promise<void> {
    try {
      const collection = getTransactionsCollection();
      const recent = await collection
        .find({})
        .sort({ _first_seen_ts: -1 })
        .limit(1000)
        .toArray();

      for (const doc of recent) {
        this.txs.set(doc.hash.toLowerCase(), doc as Transaction);
      }

      console.log(`✅ Loaded ${recent.length} transactions from MongoDB`);
    } catch (error) {
      console.error('Failed to load recent state:', error);
    }
  }

  // Clear state (for testing)
  clear(): void {
    this.txs.clear();
  }
}

// Global state instance
let state: TrackerState | null = null;

export function getTrackerState(): TrackerState {
  if (!state) {
    state = new TrackerState();
  }
  return state;
}
