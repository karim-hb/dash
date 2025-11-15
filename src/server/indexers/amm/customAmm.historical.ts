#!/usr/bin/env tsx
/**
 * Historical backfill script for Custom AMM
 * Usage: npm run ingest:amm:historical
 */

import 'dotenv/config';
import { initMongo, closeMongo, getAmmPoolsCollection, getAmmSwapsCollection, getAmmLiquidityEventsCollection } from '@/lib/db/mongo';
import { getProvider } from '@/server/modules/provider';
import { config } from '@/lib/config';
import amm from '../catalog/amm.json';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { AMMPoolMetadata, AMMSwap, AMMLiquidityEvent } from '@/types/amm';

const AMM_FACTORY_ABI = [
  'event PoolCreated(address indexed token0, address indexed token1, uint24 fee, address pool)'
];

const AMM_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)'
];

const IFactory = new ethers.Interface(AMM_FACTORY_ABI);
const IPool = new ethers.Interface(AMM_POOL_ABI);
const POOL_CREATED_TOPIC = IFactory.getEvent('PoolCreated')!.topicHash;
const SWAP_TOPIC = IPool.getEvent('Swap')!.topicHash;
const MINT_TOPIC = IPool.getEvent('Mint')!.topicHash;
const BURN_TOPIC = IPool.getEvent('Burn')!.topicHash;

async function backfillPools(factory: string, fromBlock: number, toBlock: number): Promise<void> {
  const context = 'CustomAmm.historical.backfillPools';
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    console.log(`📦 Backfilling pools from block ${fromBlock} to ${toBlock}...`);
    const logs = await provider.getLogs({
      address: factory,
      topics: [POOL_CREATED_TOPIC],
      fromBlock,
      toBlock
    });

    console.log(`📦 Found ${logs.length} PoolCreated events`);
    const poolsCollection = getAmmPoolsCollection();

    for (const log of logs) {
      try {
        const parsed = IFactory.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse PoolCreated log at block ${log.blockNumber}`);
        }

        const token0 = String(parsed.args[0]).toLowerCase();
        const token1 = String(parsed.args[1]).toLowerCase();
        const fee = Number(parsed.args[2]);
        const pool = String(parsed.args[3]).toLowerCase();
        const feeBps = Math.round(fee / 100);

        const metadata: AMMPoolMetadata = {
          poolAddress: pool,
          chainId: 1,
          protocol: 'CustomAMM',
          factoryAddress: factory,
          token0Address: token0,
          token1Address: token1,
          feeTier: feeBps,
          creationBlock: log.blockNumber,
          creationTimestamp: new Date(),
          status: 'active' as const,
          lastActivityBlock: log.blockNumber,
          liquidityUSD: 0,
          volume24hUSD: 0,
          fees24hUSD: 0
        };

        await poolsCollection.updateOne(
          { poolAddress: pool },
          { $set: metadata },
          { upsert: true }
        );
      } catch (error) {
        logErrorWithConsole(error, `${context} - block ${log.blockNumber}`);
        throw error; // Fail fast
      }
    }

    console.log(`✅ Backfilled ${logs.length} pools`);
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

async function backfillSwaps(pools: string[], fromBlock: number, toBlock: number): Promise<void> {
  const context = 'CustomAmm.historical.backfillSwaps';
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    console.log(`📦 Backfilling swaps for ${pools.length} pools from block ${fromBlock} to ${toBlock}...`);
    const swapsCollection = getAmmSwapsCollection();
    const poolsCollection = getAmmPoolsCollection();

    const CHUNK_SIZE = 200;
    let totalSwaps = 0;

    for (let i = 0; i < pools.length; i += CHUNK_SIZE) {
      const chunk = pools.slice(i, i + CHUNK_SIZE);
      try {
        const logs = await provider.getLogs({
          address: chunk,
          topics: [SWAP_TOPIC],
          fromBlock,
          toBlock
        });

        console.log(`📦 Processing ${logs.length} swap logs for chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(pools.length / CHUNK_SIZE)}`);

        for (const log of logs) {
          try {
            const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
            if (!parsed) {
              throw new Error(`Failed to parse Swap log at block ${log.blockNumber}`);
            }

            const poolAddr = (log.address || '').toLowerCase();
            const sender = String(parsed.args[0]).toLowerCase();
            const recipient = String(parsed.args[1]).toLowerCase();
            const amount0 = parsed.args[2].toString();
            const amount1 = parsed.args[3].toString();
            const sqrtPriceX96 = parsed.args[4]?.toString();
            const liquidity = parsed.args[5]?.toString();
            const tick = parsed.args[6] ? Number(parsed.args[6]) : undefined;

            const swap: AMMSwap = {
              poolAddress: poolAddr,
              chainId: 1,
              txHash: log.transactionHash || '',
              blockNumber: log.blockNumber,
              logIndex: log.logIndex,
              timestamp: new Date(),
              sender,
              recipient,
              amount0,
              amount1,
              sqrtPriceX96,
              liquidity,
              tick
            };

            await swapsCollection.insertOne(swap);
            totalSwaps++;

            // Update pool last activity
            await poolsCollection.updateOne(
              { poolAddress: poolAddr },
              {
                $set: {
                  lastActivityBlock: log.blockNumber,
                  lastActivityTimestamp: new Date()
                }
              }
            );
          } catch (error) {
            logErrorWithConsole(error, `${context} - block ${log.blockNumber}, logIndex ${log.logIndex}`);
            throw error; // Fail fast
          }
        }
      } catch (error) {
        logErrorWithConsole(error, `${context} - chunk ${Math.floor(i / CHUNK_SIZE) + 1}`);
        throw error; // Fail fast
      }
    }

    console.log(`✅ Backfilled ${totalSwaps} swaps`);
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

async function main(): Promise<void> {
  const context = 'CustomAmm.historical.main';
  try {
    console.log('🚀 Starting Custom AMM historical backfill...');

    // Initialize MongoDB
    await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker');
    console.log('✅ MongoDB initialized');

    // Get factory address
    const factory = (amm as any).custom_amm?.factory;
    if (!factory) {
      throw new Error('Custom AMM factory address not configured in catalog/amm.json');
    }

    console.log(`🏦 Factory address: ${factory}`);

    // Get provider
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    // Get block range
    const latest = await provider.getBlockNumber();
    const fromBlock = process.env.AMM_BACKFILL_FROM_BLOCK
      ? Number(process.env.AMM_BACKFILL_FROM_BLOCK)
      : Math.max(0, latest - config.BACKFILL_BLOCKS);
    const toBlock = process.env.AMM_BACKFILL_TO_BLOCK
      ? Number(process.env.AMM_BACKFILL_TO_BLOCK)
      : latest;

    console.log(`📦 Backfill range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)`);

    // Backfill pools
    await backfillPools(factory, fromBlock, toBlock);

    // Get all pools and backfill swaps
    const poolsCollection = getAmmPoolsCollection();
    const pools = await poolsCollection.find({}).toArray();
    const poolAddresses = pools.map(p => p.poolAddress);

    if (poolAddresses.length > 0) {
      await backfillSwaps(poolAddresses, fromBlock, toBlock);
    } else {
      console.log('⚠️ No pools found to backfill swaps for');
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
  logErrorWithConsole(error, 'CustomAmm.historical.main - unhandled');
  process.exit(1);
});


