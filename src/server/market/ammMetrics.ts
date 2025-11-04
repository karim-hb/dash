import { getPoolEventsCollection, getPoolMetadataCollection } from '../../lib/db/mongo';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

export interface PoolMetrics {
  poolAddress: string;
  timestamp: Date;
  liquidityUSD: number;
  volume24hUSD: number;
  feeAccumulatedUSD: number;
  swapCount24h: number;
  lastUpdateBlock: number;
}

/**
 * Aggregate 24h metrics for all active pools
 */
export async function aggregatePoolMetrics(): Promise<void> {
  try {
    const eventsCollection = getPoolEventsCollection();
    const metadataCollection = getPoolMetadataCollection();

    // Get all active pools
    const activePools = await metadataCollection
      .find({ status: 'active' }, { projection: { poolAddress: 1 } })
      .toArray();

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    console.log(`📊 Aggregating metrics for ${activePools.length} active pools...`);

    for (const pool of activePools) {
      try {
        const poolAddress = pool.poolAddress;

        // Aggregate 24h volume and fees
        const volumeStats = await eventsCollection.aggregate([
          {
            $match: {
              poolAddress,
              timestamp: { $gte: oneDayAgo },
              eventType: 'Swap'
            }
          },
          {
            $group: {
              _id: null,
              volume24hUSD: { $sum: '$volumeUSD' },
              feeAccumulatedUSD: { $sum: '$feeUSD' },
              swapCount24h: { $sum: 1 },
              lastBlock: { $max: '$blockNumber' }
            }
          }
        ]).toArray();

        const stats = volumeStats[0] || {
          volume24hUSD: 0,
          feeAccumulatedUSD: 0,
          swapCount24h: 0,
          lastBlock: 0
        };

        // Get current liquidity from in-memory registry
        let currentLiquidity = 0;
        try {
          const { getPools } = await import('./registry');
          const inMemoryPools = getPools();
          const inMemPool = inMemoryPools.find(p => p.address?.toLowerCase() === poolAddress.toLowerCase());
          if (inMemPool?.tvl_usd != null) {
            currentLiquidity = inMemPool.tvl_usd;
          }
        } catch (e) {
          // Ignore errors getting liquidity from registry
        }

        const metrics: PoolMetrics = {
          poolAddress,
          timestamp: now,
          liquidityUSD: currentLiquidity,
          volume24hUSD: stats.volume24hUSD || 0,
          feeAccumulatedUSD: stats.feeAccumulatedUSD || 0,
          swapCount24h: stats.swapCount24h || 0,
          lastUpdateBlock: stats.lastBlock || 0
        };

        // Update pool metadata with latest metrics
        await metadataCollection.updateOne(
          { poolAddress },
          {
            $set: {
              volume24hUSD: metrics.volume24hUSD,
              liquidityUSD: metrics.liquidityUSD,
              fees24hUSD: metrics.feeAccumulatedUSD, // Store fees with correct field name
              lastMetricsUpdate: now
            }
          }
        );

      } catch (poolError) {
        logWarningWithConsole(poolError, `Metrics aggregation failed for pool ${pool.poolAddress}`);
      }
    }

    console.log(`✅ AMM metrics aggregation completed for ${activePools.length} pools`);

  } catch (error) {
    logErrorWithConsole(error, 'AMM metrics aggregation failed');
  }
}

/**
 * Get top pools by volume for the dashboard
 * Merges data from MongoDB and in-memory registry
 */
export async function getTopPoolsByVolume(limit: number = 50): Promise<any[]> {
  try {
    const metadataCollection = getPoolMetadataCollection();
    const { getPools } = await import('./registry');
    const inMemoryPools = getPools();

    // Get all pools from MongoDB (not just those with volume > 0)
    const mongoPools = await metadataCollection
      .find({ status: 'active' })
      .toArray();

    // Create a map of in-memory pools by address for quick lookup
    const inMemoryMap = new Map<string, any>();
    for (const pool of inMemoryPools) {
      const addr = pool.address?.toLowerCase();
      if (addr) {
        inMemoryMap.set(addr, pool);
      }
    }

    // Merge MongoDB pools with in-memory registry data
    const mergedPools = mongoPools.map(pool => {
      const addr = pool.poolAddress.toLowerCase();
      const inMem = inMemoryMap.get(addr);
      
      return {
        address: pool.poolAddress,
        token0: pool.token0Address,
        token1: pool.token1Address,
        feeTier: pool.feeTier,
        protocol: pool.protocol || 'Uniswap',
        version: inMem?.version || (pool.feeTier ? 'V3' : 'V2'),
        volume24hUSD: pool.volume24hUSD || inMem?.volume_24h_usd || 0,
        liquidityUSD: pool.liquidityUSD || inMem?.tvl_usd || 0,
        fees24hUSD: pool.fees24hUSD || inMem?.fees_24h_usd || 0,
        utilization: inMem?.utilization || null,
        pool0Pct: inMem?.pool0_pct || null,
        pool1Pct: inMem?.pool1_pct || null,
        reserveRatio: inMem?.reserve_ratio || null,
        lastActivity: pool.lastActivityTimestamp
      };
    });

    // Add in-memory pools that aren't in MongoDB yet
    for (const pool of inMemoryPools) {
      const addr = pool.address?.toLowerCase();
      if (!addr) continue;
      
      const existsInMongo = mongoPools.some(p => p.poolAddress.toLowerCase() === addr);
      if (!existsInMongo) {
        mergedPools.push({
          address: pool.address,
          token0: pool.token0,
          token1: pool.token1,
          feeTier: pool.fee_bps ? pool.fee_bps * 100 : undefined,
          protocol: pool.dex || 'Uniswap',
          version: pool.version || 'V2',
          volume24hUSD: pool.volume_24h_usd || 0,
          liquidityUSD: pool.tvl_usd || 0,
          fees24hUSD: pool.fees_24h_usd || 0,
          utilization: pool.utilization || null,
          pool0Pct: pool.pool0_pct || null,
          pool1Pct: pool.pool1_pct || null,
          reserveRatio: pool.reserve_ratio || null,
          lastActivity: null
        });
      }
    }

    // Sort by volume (descending), then by liquidity
    mergedPools.sort((a, b) => {
      if (b.volume24hUSD !== a.volume24hUSD) {
        return b.volume24hUSD - a.volume24hUSD;
      }
      return b.liquidityUSD - a.liquidityUSD;
    });

    return mergedPools.slice(0, limit);

  } catch (error) {
    logErrorWithConsole(error, 'Top pools by volume query failed');
    return [];
  }
}

/**
 * Get overall AMM statistics
 */
export async function getAmmStatistics(): Promise<{
  totalPools: number;
  activePools: number;
  totalVolume24h: number;
  totalLiquidity: number;
  totalSwaps24h: number;
}> {
  try {
    const metadataCollection = getPoolMetadataCollection();

    const stats = await metadataCollection.aggregate([
      {
        $group: {
          _id: null,
          totalPools: { $sum: 1 },
          activePools: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalVolume24h: { $sum: '$volume24hUSD' },
          totalLiquidity: { $sum: '$liquidityUSD' }
        }
      }
    ]).toArray();

    // Get total swaps from events (simplified - in production, cache this)
    const eventsCollection = getPoolEventsCollection();
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const swapStats = await eventsCollection.aggregate([
      {
        $match: {
          timestamp: { $gte: oneDayAgo },
          eventType: 'Swap'
        }
      },
      {
        $group: {
          _id: null,
          totalSwaps24h: { $sum: 1 }
        }
      }
    ]).toArray();

    const data = stats[0] || {};
    const swaps = swapStats[0] || {};

    return {
      totalPools: data.totalPools || 0,
      activePools: data.activePools || 0,
      totalVolume24h: data.totalVolume24h || 0,
      totalLiquidity: data.totalLiquidity || 0,
      totalSwaps24h: swaps.totalSwaps24h || 0
    };

  } catch (error) {
    logErrorWithConsole(error, 'AMM statistics query failed');
    return {
      totalPools: 0,
      activePools: 0,
      totalVolume24h: 0,
      totalLiquidity: 0,
      totalSwaps24h: 0
    };
  }
}

/**
 * Clean up old event data (keep last 30 days)
 */
export async function cleanupOldEvents(): Promise<void> {
  try {
    const eventsCollection = getPoolEventsCollection();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const result = await eventsCollection.deleteMany({
      timestamp: { $lt: thirtyDaysAgo }
    });

    if (result.deletedCount > 0) {
      logWarningWithConsole(
        new Error(`Cleaned up ${result.deletedCount} old AMM events`),
        'AMM cleanup'
      );
    }

  } catch (error) {
    logErrorWithConsole(error, 'AMM events cleanup failed');
  }
}

/**
 * Start periodic metrics aggregation
 */
export function startMetricsAggregation(): void {
  // Aggregate metrics every 5 minutes (more frequent for better UX)
  setInterval(aggregatePoolMetrics, 5 * 60 * 1000);

  // Cleanup old events weekly
  setInterval(cleanupOldEvents, 7 * 24 * 60 * 60 * 1000);

  // Run initial aggregation sooner
  setTimeout(aggregatePoolMetrics, 5000); // Start 5 seconds after server startup

  console.log('📈 AMM metrics aggregation started (runs every 5 minutes)');
}
