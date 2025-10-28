import { TxState } from '@/lib/types';
import { getWsClient } from '../rpc/wsClient';
import { getTrackerState } from '../state/state';

let subscriptionId: string | null = null;
let isRunning = false;

// Start new heads ingestion
export async function startHeadsIngestion(): Promise<void> {
  if (isRunning) return;
  isRunning = true;

  const wsClient = getWsClient();

  try {
    // Subscribe to new heads
    subscriptionId = await wsClient.subscribe('newHeads', handleNewHead);

    console.log('✅ Started heads ingestion');

  } catch (error) {
    console.error('❌ Failed to start heads ingestion:', error);
    isRunning = false;
    throw error;
  }
}

// Stop heads ingestion
export async function stopHeadsIngestion(): Promise<void> {
  if (!isRunning) return;

  try {
    if (subscriptionId) {
      await getWsClient().unsubscribe(subscriptionId);
      subscriptionId = null;
    }
    isRunning = false;
    console.log('✅ Stopped heads ingestion');
  } catch (error) {
    console.error('Failed to stop heads ingestion:', error);
  }
}

// Handle new block head
async function handleNewHead(head: any): Promise<void> {
  try {
    if (!head || typeof head !== 'object') return;

    const blockHash = head.hash;
    const blockNumber = head.number;

    if (!blockHash || !blockNumber) return;

    console.log(`📦 Processing block ${blockNumber} (${blockHash})`);

    // Fetch full block with transactions
    await processBlock(blockHash, blockNumber);

    // Update confirmation depths
    const currentBlock = parseInt(blockNumber, 16);
    if (!isNaN(currentBlock)) {
      await getTrackerState().updateConfirmationDepth(currentBlock);
    }

  } catch (error) {
    console.error('Failed to handle new head:', error);
  }
}

// Process block and mark included transactions
async function processBlock(blockHash: string, blockNumber: string): Promise<void> {
  try {
    const wsClient = getWsClient();
    const state = getTrackerState();

    // Get block with transactions
    const block = await wsClient.rpc('eth_getBlockByHash', [blockHash, true]);

    if (!block || !block.transactions) return;

    const transactions = block.transactions;
    console.log(`📦 Block ${blockNumber} has ${transactions.length} transactions`);

    // Process each transaction in the block
    for (const tx of transactions) {
      if (tx && tx.hash) {
        try {
          // Check if we have this transaction in our state
          const existingTx = state.getTx(tx.hash);

          if (existingTx) {
            // Mark as included
            await state.markIncluded(tx.hash, blockNumber);
          } else {
            // Not seen before: add minimal transaction and mark as included
            const nowSec = Date.now() / 1000;
            const inclusionTs = block?.timestamp ? parseInt(block.timestamp, 16) : nowSec;
            await state.upsert({
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
              transactionIndex: tx.transactionIndex,
              blockHash: tx.blockHash,
              blockNumber: tx.blockNumber,
              category_key: '',
              _first_seen_ts: inclusionTs, // best-effort when first seen unknown
              _last_seen_ts: inclusionTs,
              _score: 0,
              _state: TxState.INCLUDED,
              _confirmation_depth: 0,
              _inclusion_block: blockNumber,
              _inclusion_ts: inclusionTs,
            } as any);
          }

          // Fetch receipt for gas analysis and persistence
          try {
            const receipt = await wsClient.rpc('eth_getTransactionReceipt', [tx.hash]);
            if (receipt) {
              await state.setReceipt(tx.hash, receipt);
            }
          } catch (error) {
            // ignore receipt fetch errors
          }
        } catch (error) {
          console.error(`Failed to process tx ${tx.hash} in block:`, error);
        }
      }
    }

  } catch (error) {
    console.error(`Failed to process block ${blockHash}:`, error);
  }
}

// Get current block number
export async function getCurrentBlockNumber(): Promise<number | null> {
  try {
    const wsClient = getWsClient();
    const blockNumberHex = await wsClient.rpc('eth_blockNumber', []);

    if (typeof blockNumberHex === 'string') {
      return parseInt(blockNumberHex, 16);
    }

    return null;
  } catch (error) {
    console.error('Failed to get current block number:', error);
    return null;
  }
}

// Initialize included transactions from recent blocks
export async function initializeIncludedFromBlocks(): Promise<void> {
  try {
    const wsClient = getWsClient();
    const state = getTrackerState();

    // Get current block
    const currentBlockHex = await wsClient.rpc('eth_blockNumber', []);
    const currentBlock = parseInt(currentBlockHex, 16);

    console.log(`📦 Initializing included txs from recent blocks (current: ${currentBlock})`);

    // Process last 5 blocks
    const blocksToProcess = Math.min(5, currentBlock);
    let totalTxs = 0;

    for (let i = 0; i < blocksToProcess; i++) {
      const blockNumber = currentBlock - i;
      const blockNumberHex = `0x${blockNumber.toString(16)}`;

      try {
        // Get block
        const block = await wsClient.rpc('eth_getBlockByNumber', [blockNumberHex, true]);

        if (block && block.transactions) {
          console.log(`📦 Processing block ${blockNumber} (${block.transactions.length} txs)`);

          // Process transactions (limit to avoid overload)
          for (const tx of block.transactions.slice(0, 20)) {
            if (tx && tx.hash) {
              try {
                // Create transaction object
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
                  transactionIndex: tx.transactionIndex,
                  blockHash: tx.blockHash,
                  blockNumber: tx.blockNumber,

                  category_key: '',
                  _first_seen_ts: Date.now() / 1000,
                  _last_seen_ts: Date.now() / 1000,
                  _score: 0,
                  _state: TxState.INCLUDED,
                  _confirmation_depth: currentBlock - blockNumber,
                  _inclusion_block: blockNumberHex,
                  _inclusion_ts: block.timestamp ? parseInt(block.timestamp, 16) : Date.now() / 1000,
                };

                // Add to state
                await state.upsert(transaction);

                // Get receipt
                try {
                  const receipt = await wsClient.rpc('eth_getTransactionReceipt', [tx.hash]);
                  if (receipt) {
                    await state.setReceipt(tx.hash, receipt);
                  }
                } catch (error) {
                  // Receipt might not be available yet
                }

                totalTxs++;
              } catch (error) {
                console.error(`Failed to process tx ${tx.hash}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process block ${blockNumber}:`, error);
      }
    }

    console.log(`✅ Initialized ${totalTxs} included transactions from ${blocksToProcess} recent blocks`);

  } catch (error) {
    console.error('Failed to initialize included transactions:', error);
  }
}
