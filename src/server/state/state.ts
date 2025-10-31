import { Transaction, Receipt, TxState } from '@/lib/types';
import { getTransactionsCollection, getReceiptsCollection } from '@/lib/db/mongo';
import { classifyTx } from '../classify';
import { decodeFunctionAndArgs, decodeTransactionEvents } from '../decoding/decoders';
import { applyOpportunityScoring } from '../market/opportunityScoring';

// In-memory state management with MongoDB persistence
export class TrackerState {
  private txs = new Map<string, Transaction>();
  private maxSize = 10000; // Limit in-memory size
  private persistenceEnabled = process.env.PERSIST_TO_MONGO === 'true';
  private pendingByAddress = new Map<string, Map<number, string>>();
  private confirmedNonceByAddress = new Map<string, number>();

  constructor() {
    // Optional: load recent transactions from MongoDB on startup
    if (this.persistenceEnabled) {
      this.loadRecentState();
    }
  }

  // Upsert transaction (add or update)
  async upsert(tx: Transaction): Promise<void> {
    const hash = (tx.hash || '').toLowerCase();
    if (!hash) return;

    const prev = this.txs.get(hash);
    const nowSec = Math.floor(Date.now() / 1000);

    // Merge with previous to retain derived fields not present on incoming payload
    const next: Transaction = {
      ...(prev ?? {}),
      ...tx,
    } as Transaction;

    next.hash = hash;
    next._first_seen_ts = next._first_seen_ts ?? prev?._first_seen_ts ?? nowSec;
    next._last_seen_ts = Math.max(next._last_seen_ts ?? 0, nowSec);

    // Classify if not already classified
    if (!next.category_key || next.category_key === '') {
      try {
        const classification = classifyTx(next);
        next.category_key = `${classification.category}:${classification.protocol.toLowerCase()}`;
      } catch (error) {
        console.error(`Failed to classify tx ${hash}:`, error);
      }
    }

    // Decode function if not already decoded and has input
    if (!next._decoded_fn && next.input && next.input !== '0x') {
      try {
        const decoded = await decodeFunctionAndArgs(next);
        if (decoded) {
          next._decoded_fn = decoded;
        }
      } catch (error) {
        console.error(`Failed to decode function for tx ${hash}:`, error);
      }
    }

    // Decode events if we have a receipt and have not decoded yet
    const isFinalized = next._state === TxState.INCLUDED || next._state === TxState.CONFIRMED || next._state === TxState.FINALIZED;
    if (!next._decoded_events && next._receipt && isFinalized) {
      try {
        const decodedEvents = await decodeTransactionEvents(next);
        if (decodedEvents.length > 0) {
          next._decoded_events = decodedEvents;
        }
      } catch (error) {
        console.error(`Failed to decode events for tx ${hash}:`, error);
      }
    }

    // Maintain numeric aliases for inclusion/confirmation if present
    if (next._inclusion_block) {
      const num = parseInt(next._inclusion_block, 16);
      if (!isNaN(num)) next.inclusion_block = num;
    }
    if (typeof next._confirmation_depth === 'number') {
      next.confirmation_depth = next._confirmation_depth;
    }

    // Normalise lifecycle history
    if (!Array.isArray(next.state_history)) {
      next.state_history = prev?.state_history ? [...prev.state_history] : [];
    }

    // Preserve replacement chain
    if (!Array.isArray(next.replacement_chain) && Array.isArray(prev?.replacement_chain)) {
      next.replacement_chain = [...(prev!.replacement_chain!)];
    }

    this.pushStateTransition(next, next._state ?? TxState.PENDING, prev?._state);

    // Update nonce analytics & replacement linkage
    await this.updateNonceAnalytics(next, prev);
    applyOpportunityScoring(next, nowSec);

    // Store in-memory and persist
    this.txs.set(hash, next);
    await this.persist(next);

    this.enforceSizeLimit();
  }

  // Get transaction by hash
  getTx(hash: string): Transaction | null {
    return this.txs.get(hash.toLowerCase()) || null;
  }

  private pushStateTransition(
    tx: Transaction,
    state: TxState,
    prevState?: TxState,
    reason?: string,
    timestamp?: number,
    force = false,
  ): void {
    if (!Array.isArray(tx.state_history)) {
      tx.state_history = [];
    }
    const history = tx.state_history;
    const last = history[history.length - 1];
    const ts = timestamp ?? Math.floor(Date.now() / 1000);

    if (!force) {
      if (prevState && prevState === state && last && last.state === state) {
        return;
      }
      if (!prevState && last && last.state === state) {
        return;
      }
    }

    history.push({ state, timestamp: ts, reason });
  }

  private parseNonce(raw: string | number | null | undefined): number | null {
    if (raw === null || raw === undefined) return null;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
    if (typeof raw === 'string' && raw.length > 0) {
      const trimmed = raw.trim();
      const base = trimmed.startsWith('0x') ? 16 : 10;
      const parsed = Number.parseInt(trimmed, base);
      return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  private async updateNonceAnalytics(next: Transaction, prev?: Transaction): Promise<void> {
    const from = (next.from || '').toLowerCase();
    if (!from) return;

    const nonceNum = this.parseNonce(next.nonce);
    if (nonceNum === null) return;

    const hash = next.hash.toLowerCase();
    const pendingMap = this.pendingByAddress.get(from) ?? new Map<number, string>();
    const mappedHash = pendingMap.get(nonceNum);
    const nowSec = Math.floor(Date.now() / 1000);

    const isPending = next._state === TxState.PENDING;

    // Handle transitions away from pending
    if (!isPending) {
      if (mappedHash === hash) {
        pendingMap.delete(nonceNum);
        if (pendingMap.size === 0) {
          this.pendingByAddress.delete(from);
        } else {
          this.pendingByAddress.set(from, pendingMap);
        }
      }
      await this.recomputeAddressNonceAnalytics(from);
      return;
    }

    // Replacement detection
    if (mappedHash && mappedHash !== hash) {
      const existing = this.txs.get(mappedHash);
      if (existing) {
        const prevState = existing._state;
        existing._state = TxState.REPLACED;
        existing.replaced_by = hash;
        existing.drop_reason = 'nonce_replacement';
        existing._last_seen_ts = Math.max(existing._last_seen_ts ?? nowSec, nowSec);
        existing.replacement_chain = Array.isArray(existing.replacement_chain)
          ? [...existing.replacement_chain, hash]
          : [hash];
        this.pushStateTransition(existing, TxState.REPLACED, prevState, 'nonce_replacement', nowSec, true);
        this.txs.set(mappedHash, existing);
        await this.persist(existing);
      }

      next.replacement_tx = mappedHash;
      if (!Array.isArray(next.replacement_chain)) {
        next.replacement_chain = [];
      }
      if (!next.replacement_chain.includes(mappedHash)) {
        next.replacement_chain.unshift(mappedHash);
      }
      this.pushStateTransition(next, TxState.RESUBMITTED, prev?._state, 'nonce_replacement', nowSec, true);
      pendingMap.delete(nonceNum);
    }

    pendingMap.set(nonceNum, hash);
    this.pendingByAddress.set(from, pendingMap);

    const analytics = await this.recomputeAddressNonceAnalytics(from);
    const nextUpdate = analytics.get(hash);
    if (nextUpdate) {
      Object.assign(next, nextUpdate);
    }
  }

  private async recomputeAddressNonceAnalytics(address: string): Promise<Map<string, Partial<Transaction>>> {
    const key = address.toLowerCase();
    const pendingMap = this.pendingByAddress.get(key);
    const updates = new Map<string, Partial<Transaction>>();
    if (!pendingMap || pendingMap.size === 0) {
      return updates;
    }

    const confirmedNonce = this.confirmedNonceByAddress.get(key) ?? null;
    const pendingEntries = Array.from(pendingMap.entries()).sort((a, b) => a[0] - b[0]);
    const highestPending = pendingEntries[pendingEntries.length - 1]?.[0] ?? null;

    for (const [nonceNum, hash] of pendingEntries) {
      const gap = confirmedNonce !== null ? Math.max(0, nonceNum - (confirmedNonce + 1)) : null;
      const warning = gap && gap > 0 ? 'gap' : null;
      updates.set(hash, {
        sender_confirmed_nonce: confirmedNonce,
        sender_pending_nonce: highestPending ?? nonceNum,
        nonce_gap: gap,
        nonce_warning: warning,
      });
    }

    const persistPromises: Promise<void>[] = [];
    for (const [hash, update] of updates.entries()) {
      const tx = this.txs.get(hash);
      if (!tx) continue;
      Object.assign(tx, update);
      this.txs.set(hash, tx);
      persistPromises.push(this.persist(tx));
    }
    if (persistPromises.length) {
      await Promise.allSettled(persistPromises);
    }

    return updates;
  }

  async recordConfirmedNonce(address: string, nonce: number): Promise<void> {
    const key = address.toLowerCase();
    const current = this.confirmedNonceByAddress.get(key);
    if (current === undefined || nonce > current) {
      this.confirmedNonceByAddress.set(key, nonce);
      await this.recomputeAddressNonceAnalytics(key);
    }
  }

  private async persist(tx: Transaction): Promise<void> {
    if (!this.persistenceEnabled) return;
    try {
      const collection = getTransactionsCollection();
      await collection.updateOne(
        { hash: tx.hash },
        { $set: tx },
        { upsert: true }
      );
    } catch (error) {
      console.error('Failed to persist transaction:', error);
    }
  }

  private enforceSizeLimit(): void {
    if (this.txs.size <= this.maxSize) return;
    const entries = Array.from(this.txs.entries());
    entries.sort((a, b) => (a[1]._first_seen_ts || 0) - (b[1]._first_seen_ts || 0));
    const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.1));
    for (const [hash, tx] of toRemove) {
      this.txs.delete(hash);
      const from = (tx.from || '').toLowerCase();
      const nonceNum = this.parseNonce(tx.nonce);
      if (!from || nonceNum === null) continue;
      const map = this.pendingByAddress.get(from);
      if (map && map.get(nonceNum) === hash) {
        map.delete(nonceNum);
        if (map.size === 0) this.pendingByAddress.delete(from);
      }
    }
  }

  // Mark transaction as included
  async markIncluded(hash: string, blockNumber: string): Promise<void> {
    const tx = this.getTx(hash);
    if (!tx) return;

    const inclusionTs = Date.now() / 1000;
    const updated: Transaction = {
      ...tx,
      _state: TxState.INCLUDED,
      _inclusion_block: blockNumber,
      _inclusion_ts: inclusionTs,
      inclusion_block: (() => {
        const num = parseInt(blockNumber, 16);
        return Number.isNaN(num) ? tx.inclusion_block ?? null : num;
      })(),
    };

    await this.upsert(updated);
  }

  // Set receipt for transaction
  async setReceipt(hash: string, receipt: Receipt): Promise<void> {
    const tx = this.getTx(hash);
    if (!tx) return;

    const updated: Transaction = { ...tx, _receipt: receipt };

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

    await this.upsert(updated);
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
          const updated: Transaction = {
            ...tx,
            _confirmation_depth: Math.max(0, depth),
            confirmation_depth: Math.max(0, depth),
          };

          if (depth >= 12 && tx._state !== TxState.FINALIZED) {
            updated._state = TxState.FINALIZED;
          } else if (depth >= 1 && tx._state === TxState.INCLUDED) {
            updated._state = TxState.CONFIRMED;
          }

          updates.push(this.upsert(updated));
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

      const addressesNeedingRecompute = new Set<string>();

      for (const doc of recent) {
        const hash = doc.hash.toLowerCase();
        const tx = doc as Transaction;
        if (typeof tx.composite_score !== 'number' || Number.isNaN(tx.composite_score)) {
          applyOpportunityScoring(tx);
        }
        this.txs.set(hash, tx);

        if (tx._state === TxState.PENDING) {
          const from = (tx.from || '').toLowerCase();
          const nonceNum = this.parseNonce(tx.nonce);
          if (from && nonceNum !== null) {
            const map = this.pendingByAddress.get(from) ?? new Map<number, string>();
            map.set(nonceNum, hash);
            this.pendingByAddress.set(from, map);
            addressesNeedingRecompute.add(from);
          }
        }

        if (typeof tx.sender_confirmed_nonce === 'number') {
          const from = (tx.from || '').toLowerCase();
          if (from) {
            const current = this.confirmedNonceByAddress.get(from) ?? -1;
            if (tx.sender_confirmed_nonce > current) {
              this.confirmedNonceByAddress.set(from, tx.sender_confirmed_nonce);
              addressesNeedingRecompute.add(from);
            }
          }
        }
      }

      if (addressesNeedingRecompute.size) {
        await Promise.allSettled(
          Array.from(addressesNeedingRecompute).map(addr => this.recomputeAddressNonceAnalytics(addr))
        );
      }

      console.log(`? Loaded ${recent.length} transactions from MongoDB`);
    } catch (error) {
      console.error('Failed to load recent state:', error);
    }
  }

  // Clear state (for testing)
  clear(): void {
    this.txs.clear();
    this.pendingByAddress.clear();
    this.confirmedNonceByAddress.clear();
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
