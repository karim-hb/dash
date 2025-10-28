import { TxState } from '@/lib/types';
import { getWsClient } from '../rpc/wsClient';
import { getTrackerState } from '../state/state';

// Txpool status and content monitoring
export interface TxpoolStatus {
  pending: string; // hex
  queued: string;  // hex
}

export interface TxpoolContent {
  pending: Record<string, Record<string, any>>;
  queued: Record<string, Record<string, any>>;
}

// Get txpool status
export async function getTxpoolStatus(): Promise<TxpoolStatus | null> {
  try {
    const wsClient = getWsClient();
    const status = await wsClient.rpc('txpool_status', []);

    if (status && typeof status === 'object') {
      return {
        pending: status.pending || '0x0',
        queued: status.queued || '0x0',
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get txpool status:', error);
    return null;
  }
}

// Get txpool content
export async function getTxpoolContent(): Promise<TxpoolContent | null> {
  try {
    const wsClient = getWsClient();
    const content = await wsClient.rpc('txpool_content', []);

    if (content && typeof content === 'object') {
      return {
        pending: content.pending || {},
        queued: content.queued || {},
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get txpool content:', error);
    return null;
  }
}

// Process txpool content and update state
export async function processTxpoolContent(): Promise<void> {
  try {
    const content = await getTxpoolContent();
    if (!content) return;

    const state = getTrackerState();
    let updated = 0;

    // Process pending transactions
    for (const [sender, txs] of Object.entries(content.pending)) {
      for (const [nonce, tx] of Object.entries(txs)) {
        if (tx && tx.hash) {
          // Check if we already have this transaction
          const existing = state.getTx(tx.hash);
          if (!existing) {
            try {
              // Add new pending transaction
              const transaction = {
                type: tx.type || '0x2',
                nonce: tx.nonce,
                to: tx.to,
                from: tx.from,
                value: tx.value,
                input: tx.input,
                gasPrice: tx.gasPrice,
                maxFeePerGas: tx.maxFeePerGas,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
                gas: tx.gas,
                v: tx.v,
                r: tx.r,
                s: tx.s,
                hash: tx.hash,
                transactionIndex: null,
                blockHash: null,
                blockNumber: null,

                category_key: '',
                _first_seen_ts: Date.now() / 1000,
                _last_seen_ts: Date.now() / 1000,
                _score: 0,
                _state: TxState.PENDING,
                _confirmation_depth: 0,
              };

              await state.upsert(transaction);
              updated++;
            } catch (error) {
              console.error(`Failed to add txpool tx ${tx.hash}:`, error);
            }
          }
        }
      }
    }

    if (updated > 0) {
      console.log(`📊 Updated ${updated} transactions from txpool`);
    }

  } catch (error) {
    console.error('Failed to process txpool content:', error);
  }
}

// Clean up dropped transactions (compare txpool with our state)
export async function cleanupDroppedTransactions(): Promise<void> {
  try {
    const content = await getTxpoolContent();
    if (!content) return;

    const state = getTrackerState();
    const pendingHashes = new Set<string>();

    // Collect all hashes currently in txpool
    for (const [sender, txs] of Object.entries(content.pending)) {
      for (const [nonce, tx] of Object.entries(txs)) {
        if (tx && tx.hash) {
          pendingHashes.add(tx.hash.toLowerCase());
        }
      }
    }

    // Find transactions we think are pending but aren't in txpool
    const snapshot = await state.snapshot();
    let dropped = 0;

    for (const tx of snapshot.txs) {
      if (tx._state === TxState.PENDING && !pendingHashes.has(tx.hash.toLowerCase())) {
        // Mark as dropped (might have been included or replaced)
        tx._state = TxState.DROPPED;
        await state.upsert(tx);
        dropped++;
      }
    }

    if (dropped > 0) {
      console.log(`🗑️ Marked ${dropped} transactions as dropped`);
    }

  } catch (error) {
    console.error('Failed to cleanup dropped transactions:', error);
  }
}

// Periodic txpool monitoring task
let monitoringInterval: NodeJS.Timeout | null = null;

export function startTxpoolMonitoring(): void {
  if (monitoringInterval) return;

  // Check txpool every 30 seconds
  monitoringInterval = setInterval(async () => {
    try {
      await processTxpoolContent();
      await cleanupDroppedTransactions();
    } catch (error) {
      console.error('Txpool monitoring error:', error);
    }
  }, 30000);

  console.log('✅ Started txpool monitoring');
}

export function stopTxpoolMonitoring(): void {
  if (monitoringInterval) {
    clearInterval(monitoringInterval);
    monitoringInterval = null;
    console.log('✅ Stopped txpool monitoring');
  }
}
