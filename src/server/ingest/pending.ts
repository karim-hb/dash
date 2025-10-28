import { RawTransaction, Transaction, TxState } from '@/lib/types';
import { getWsClient } from '../rpc/wsClient';
import { getTrackerState } from '../state/state';
import { now } from '@/lib/util/time';

let subscriptionId: string | null = null;
let isRunning = false;

// Start pending transactions ingestion
export async function startPendingIngestion(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  const wsClient = getWsClient();
  const state = getTrackerState();

  try {
    // Subscribe to new pending transactions
    subscriptionId = await wsClient.subscribe('newPendingTransactions', handlePendingHash);

    console.log('✅ Started pending transactions ingestion');

    // Initial fetch of current pending transactions
    await fetchCurrentPending();

  } catch (error) {
    console.error('❌ Failed to start pending ingestion:', error);
    isRunning = false;
    throw error;
  }
}

// Stop pending transactions ingestion
export async function stopPendingIngestion(): Promise<void> {
  if (!isRunning) return;

  try {
    if (subscriptionId) {
      await getWsClient().unsubscribe(subscriptionId);
      subscriptionId = null;
    }
    isRunning = false;
    console.log('✅ Stopped pending transactions ingestion');
  } catch (error) {
    console.error('Failed to stop pending ingestion:', error);
  }
}

// Handle new pending transaction hash
async function handlePendingHash(hash: string): Promise<void> {
  try {
    // Skip if we've seen this hash recently (basic deduplication)
    const state = getTrackerState();
    if (state.getTx(hash)) return;

    // Hydrate the transaction
    await hydrateTransaction(hash);

  } catch (error) {
    console.error(`Failed to handle pending hash ${hash}:`, error);
  }
}

// Hydrate transaction from hash
async function hydrateTransaction(hash: string): Promise<void> {
  try {
    const wsClient = getWsClient();

    // Get transaction by hash
    const txData = await wsClient.rpc('eth_getTransactionByHash', [hash]);

    if (!txData || typeof txData !== 'object') return;

    // Convert to our transaction format
    const rawTx: RawTransaction = txData;
    const tx: Transaction = {
      type: rawTx.type || '0x2',
      nonce: rawTx.nonce,
      to: rawTx.to,
      from: rawTx.from,
      value: rawTx.value,
      input: rawTx.input,
      gasPrice: rawTx.gasPrice,
      maxFeePerGas: rawTx.maxFeePerGas,
      maxPriorityFeePerGas: rawTx.maxPriorityFeePerGas,
      gas: rawTx.gas,
      v: rawTx.v,
      r: rawTx.r,
      s: rawTx.s,
      hash: rawTx.hash || hash,
      transactionIndex: rawTx.transactionIndex,
      blockHash: rawTx.blockHash,
      blockNumber: rawTx.blockNumber,

      // Extended fields
      category_key: '',
      _first_seen_ts: now(),
      _last_seen_ts: now(),
      _score: 0,
      _state: TxState.PENDING,
      _confirmation_depth: 0,
    };

    // Add to state
    await getTrackerState().upsert(tx);

  } catch (error) {
    console.error(`Failed to hydrate transaction ${hash}:`, error);
  }
}

// Fetch current pending transactions from txpool
async function fetchCurrentPending(): Promise<void> {
  try {
    const wsClient = getWsClient();
    const state = getTrackerState();

    // Get txpool content
    const txpoolData = await wsClient.rpc('txpool_content', []);

    if (!txpoolData || typeof txpoolData !== 'object') return;

    const pending = txpoolData.pending || {};
    let count = 0;

    // Process pending transactions
    for (const [sender, txs] of Object.entries(pending)) {
      if (typeof txs === 'object' && txs !== null) {
        for (const [nonce, tx] of Object.entries(txs as Record<string, any>)) {
          if (tx && tx.hash) {
            try {
              const transaction: Transaction = {
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
                _first_seen_ts: now(),
                _last_seen_ts: now(),
                _score: 0,
                _state: TxState.PENDING,
                _confirmation_depth: 0,
              };

              await state.upsert(transaction);
              count++;

              // Limit initial load
              if (count >= 500) break;
            } catch (error) {
              console.error(`Failed to process pending tx ${tx.hash}:`, error);
            }
          }
        }
      }
      if (count >= 500) break;
    }

    console.log(`✅ Loaded ${count} pending transactions from txpool`);

  } catch (error) {
    console.error('Failed to fetch current pending transactions:', error);
  }
}

// Get pending transaction count
export function getPendingCount(): number {
  const metrics = getTrackerState().getMetrics();
  return metrics.pending;
}
