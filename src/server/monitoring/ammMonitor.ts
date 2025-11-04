import { getProvider } from '../modules/provider';
import { getPoolEventsCollection, getPoolMetadataCollection } from '../../lib/db/mongo';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

let lastIndexedBlock = 0;
let lastKnownParentHash: string = '';

/**
 * Monitor indexing lag and alert if falling behind
 */
export async function checkIndexingLag(): Promise<void> {
  try {
    const provider = getProvider();
    const currentBlock = await provider.getBlockNumber();

    // Get the latest event block from MongoDB
    const eventsCollection = getPoolEventsCollection();
    const latestEvent = await eventsCollection
      .find({}, { projection: { blockNumber: 1 } })
      .sort({ blockNumber: -1 })
      .limit(1)
      .toArray();

    const latestEventBlock = latestEvent[0]?.blockNumber || 0;
    const lag = currentBlock - latestEventBlock;

    // Update global state
    lastIndexedBlock = Math.max(lastIndexedBlock, latestEventBlock);

    const LAG_THRESHOLD = Number(process.env.AMM_INDEXING_LAG_THRESHOLD || '100');
    if (lag > LAG_THRESHOLD) {
      logWarningWithConsole(
        new Error(`AMM indexing lag: ${lag} blocks (${currentBlock} - ${latestEventBlock})`),
        'AMM indexing lag'
      );
    }

    // Check for stuck indexing
    const STUCK_THRESHOLD_MINUTES = 10;
    const lastActivityTime = Date.now() - (STUCK_THRESHOLD_MINUTES * 60 * 1000);
    if (lag > LAG_THRESHOLD && latestEventBlock === lastIndexedBlock) {
      logWarningWithConsole(
        new Error(`AMM indexing appears stuck at block ${latestEventBlock}`),
        'AMM indexing stuck'
      );
    }

  } catch (error) {
    logErrorWithConsole(error, 'AMM indexing lag check failed');
  }
}

/**
 * Detect and handle blockchain reorgs
 */
export async function detectReorg(): Promise<boolean> {
  try {
    const provider = getProvider();
    const currentBlock = await provider.getBlockNumber();

    // Check a recent block's parent hash
    if (currentBlock > 12) { // Ensure we have confirmations
      const block = await provider.getBlock(currentBlock - 12);
      if (block) {
        const currentParentHash = block.hash;

        // If parent hash changed, we have a reorg
        if (lastKnownParentHash && lastKnownParentHash !== currentParentHash) {
          logWarningWithConsole(
            new Error(`Blockchain reorg detected at block ${currentBlock - 12}. Rolling back events.`),
            'AMM reorg detected'
          );
          await rollbackReorg(currentBlock - 12);
          lastKnownParentHash = currentParentHash || lastKnownParentHash;
          return true;
        }

        lastKnownParentHash = currentParentHash || lastKnownParentHash;
      }
    }

    return false;
  } catch (error) {
    logErrorWithConsole(error, 'AMM reorg detection failed');
    return false;
  }
}

/**
 * Rollback events after a reorg
 */
export async function rollbackReorg(fromBlock: number): Promise<void> {
  try {
    const eventsCollection = getPoolEventsCollection();
    const metadataCollection = getPoolMetadataCollection();

    // Delete events from affected blocks
    const deleteResult = await eventsCollection.deleteMany({
      blockNumber: { $gte: fromBlock }
    });

    // Reset last activity blocks in metadata for affected pools
    const affectedPools = await eventsCollection.distinct('poolAddress', {
      blockNumber: { $gte: fromBlock }
    });

    for (const poolAddress of affectedPools) {
      // Find the last valid event for this pool
      const lastValidEvent = await eventsCollection
        .find({ poolAddress }, { projection: { blockNumber: 1, timestamp: 1 } })
        .sort({ blockNumber: -1 })
        .limit(1)
        .toArray();

      if (lastValidEvent[0]) {
        await metadataCollection.updateOne(
          { poolAddress },
          {
            $set: {
              lastActivityBlock: lastValidEvent[0].blockNumber,
              lastActivityTimestamp: lastValidEvent[0].timestamp
            }
          }
        );
      }
    }

    logWarningWithConsole(
      new Error(`Rolled back ${deleteResult.deletedCount} AMM events from block ${fromBlock}+`),
      'AMM reorg rollback'
    );

  } catch (error) {
    logErrorWithConsole(error, `AMM reorg rollback failed from block ${fromBlock}`);
  }
}

/**
 * Get AMM indexing health metrics
 */
export async function getAmmHealthMetrics(): Promise<{
  latestBlock: number;
  lastIndexedBlock: number;
  lag: number;
  totalPools: number;
  activePools: number;
  totalEvents: number;
}> {
  try {
    const provider = getProvider();
    const currentBlock = await provider.getBlockNumber();

    const eventsCollection = getPoolEventsCollection();
    const metadataCollection = getPoolMetadataCollection();

    const [eventStats, poolStats] = await Promise.all([
      eventsCollection.aggregate([
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            lastBlock: { $max: '$blockNumber' }
          }
        }
      ]).toArray(),
      metadataCollection.aggregate([
        {
          $group: {
            _id: null,
            totalPools: { $sum: 1 },
            activePools: {
              $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
            }
          }
        }
      ]).toArray()
    ]);

    const eventData = eventStats[0] || {};
    const poolData = poolStats[0] || {};

    return {
      latestBlock: currentBlock,
      lastIndexedBlock: eventData.lastBlock || 0,
      lag: currentBlock - (eventData.lastBlock || 0),
      totalPools: poolData.totalPools || 0,
      activePools: poolData.activePools || 0,
      totalEvents: eventData.totalEvents || 0
    };

  } catch (error) {
    logErrorWithConsole(error, 'AMM health metrics failed');
    return {
      latestBlock: 0,
      lastIndexedBlock: 0,
      lag: 0,
      totalPools: 0,
      activePools: 0,
      totalEvents: 0
    };
  }
}

/**
 * Start monitoring loops
 */
export function startAmmMonitoring(): void {
  // Check lag every 5 minutes
  setInterval(checkIndexingLag, 5 * 60 * 1000);

  // Check for reorgs every 2 minutes
  setInterval(async () => {
    await detectReorg();
  }, 2 * 60 * 1000);

  console.log('🔍 AMM monitoring started');
}
