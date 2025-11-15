#!/usr/bin/env tsx
/**
 * Historical backfill script for Curve V1 Old pools
 * Usage: npm run ingest:curvev1old:historical
 */

import 'dotenv/config';
import { initMongo, closeMongo, getPoolMetadataCollection, getPoolEventsCollection } from '@/lib/db/mongo';
import { getProvider } from '@/server/modules/provider';
import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { PoolMetadata, PoolEvent } from '@/types/amm';

const CURVE_V1_OLD_POOL_ABI = [
  'event TokenExchange(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)',
  'event AddLiquidity(address indexed provider, uint256[2] token_amounts, uint256[2] fees, uint256 invariant, uint256 token_supply)',
  'event RemoveLiquidity(address indexed provider, uint256[2] token_amounts, uint256[2] fees, uint256 token_supply)'
];

const IPool = new ethers.utils.Interface(CURVE_V1_OLD_POOL_ABI);
const TOKEN_EXCHANGE_TOPIC = IPool.getEvent('TokenExchange')!.topicHash;
const ADD_LIQUIDITY_TOPIC = IPool.getEvent('AddLiquidity')!.topicHash;
const REMOVE_LIQUIDITY_TOPIC = IPool.getEvent('RemoveLiquidity')!.topicHash;

async function backfillPoolEvents(poolAddress: string, fromBlock: number, toBlock: number): Promise<void> {
  const context = `CurveV1Old.historical.backfillPoolEvents.${poolAddress}`;
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    const eventsCollection = getPoolEventsCollection();
    const metadataCollection = getPoolMetadataCollection();

    // Backfill TokenExchange events
    const exchangeLogs = await provider.getLogs({
      address: poolAddress,
      topics: [TOKEN_EXCHANGE_TOPIC],
      fromBlock,
      toBlock
    });

    // Backfill AddLiquidity events
    const addLiquidityLogs = await provider.getLogs({
      address: poolAddress,
      topics: [ADD_LIQUIDITY_TOPIC],
      fromBlock,
      toBlock
    });

    // Backfill RemoveLiquidity events
    const removeLiquidityLogs = await provider.getLogs({
      address: poolAddress,
      topics: [REMOVE_LIQUIDITY_TOPIC],
      fromBlock,
      toBlock
    });

    console.log(`📦 Pool ${poolAddress}: ${exchangeLogs.length} TokenExchange, ${addLiquidityLogs.length} AddLiquidity, ${removeLiquidityLogs.length} RemoveLiquidity events`);

    // Process TokenExchange events
    for (const log of exchangeLogs) {
      try {
        const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse TokenExchange log at block ${log.blockNumber}`);
        }

        const event: PoolEvent = {
          poolAddress: poolAddress.toLowerCase(),
          chainId: 1,
          eventType: 'Swap',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: parsed.args[2].toString(), // tokens_sold
          amount1: parsed.args[4].toString(), // tokens_bought
        };

        await eventsCollection.insertOne(event);
      } catch (error) {
        logErrorWithConsole(error, `${context} - TokenExchange block ${log.blockNumber}`);
        throw error;
      }
    }

    // Process AddLiquidity events
    for (const log of addLiquidityLogs) {
      try {
        const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse AddLiquidity log at block ${log.blockNumber}`);
        }

        const amounts = parsed.args[1]; // token_amounts array
        const event: PoolEvent = {
          poolAddress: poolAddress.toLowerCase(),
          chainId: 1,
          eventType: 'Mint',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: amounts[0].toString(),
          amount1: amounts[1].toString(),
        };

        await eventsCollection.insertOne(event);
      } catch (error) {
        logErrorWithConsole(error, `${context} - AddLiquidity block ${log.blockNumber}`);
        throw error;
      }
    }

    // Process RemoveLiquidity events
    for (const log of removeLiquidityLogs) {
      try {
        const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse RemoveLiquidity log at block ${log.blockNumber}`);
        }

        const amounts = parsed.args[1]; // token_amounts array
        const event: PoolEvent = {
          poolAddress: poolAddress.toLowerCase(),
          chainId: 1,
          eventType: 'Burn',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: amounts[0].toString(),
          amount1: amounts[1].toString(),
        };

        await eventsCollection.insertOne(event);
      } catch (error) {
        logErrorWithConsole(error, `${context} - RemoveLiquidity block ${log.blockNumber}`);
        throw error;
      }
    }

    // Update pool metadata
    const allLogs = [...exchangeLogs, ...addLiquidityLogs, ...removeLiquidityLogs];
    if (allLogs.length > 0) {
      const lastBlock = Math.max(...allLogs.map(l => l.blockNumber));
      await metadataCollection.updateOne(
        { poolAddress: poolAddress.toLowerCase() },
        {
          $set: {
            lastActivityBlock: lastBlock,
            lastActivityTimestamp: new Date()
          }
        },
        { upsert: false }
      );
    }
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

async function main(): Promise<void> {
  const context = 'CurveV1Old.historical.main';
  try {
    console.log('🚀 Starting Curve V1 Old historical backfill...');

    if (!config.ENABLE_CURVE_V1_OLD) {
      console.log('🔒 Curve V1 Old indexer disabled (ENABLE_CURVE_V1_OLD=false)');
      return;
    }

    // Initialize MongoDB
    await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker');
    console.log('✅ MongoDB initialized');

    // Get pool addresses
    const pools = (amm as any).curve_v1_old?.pools || [];
    if (!Array.isArray(pools) || pools.length === 0) {
      console.log('⚠️ No pools configured. Add pool addresses to catalog/amm.json curve_v1_old.pools array');
      return;
    }

    console.log(`🏦 Found ${pools.length} pools to backfill`);

    // Get provider
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    // Get block range
    const latest = await provider.getBlockNumber();
    const fromBlock = process.env.CURVE_V1_OLD_BACKFILL_FROM_BLOCK
      ? Number(process.env.CURVE_V1_OLD_BACKFILL_FROM_BLOCK)
      : Math.max(0, latest - config.BACKFILL_BLOCKS);
    const toBlock = process.env.CURVE_V1_OLD_BACKFILL_TO_BLOCK
      ? Number(process.env.CURVE_V1_OLD_BACKFILL_TO_BLOCK)
      : latest;

    console.log(`📦 Backfill range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)`);

    // Backfill each pool
    for (const pool of pools) {
      await backfillPoolEvents(pool, fromBlock, toBlock);
    }

    console.log('✅ Historical backfill completed');
  } catch (error) {
    logErrorWithConsole(error, context);
    process.exit(1);
  } finally {
    await closeMongo();
  }
}

main().catch((error) => {
  logErrorWithConsole(error, 'CurveV1Old.historical.main - unhandled');
  process.exit(1);
});

