#!/usr/bin/env tsx
/**
 * Historical backfill script for Uniswap V1
 * Usage: npm run ingest:uniswapv1:historical
 */

import 'dotenv/config';
import { initMongo, closeMongo, getPoolMetadataCollection, getPoolEventsCollection } from '@/lib/db/mongo';
import { getProvider } from '@/server/modules/provider';
import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { PoolMetadata, PoolEvent } from '@/types/amm';

// Uniswap V1 Exchange ABI - TokenPurchase and EthPurchase events
const UNISWAP_V1_EXCHANGE_ABI = [
  'event TokenPurchase(address indexed buyer, uint256 indexed eth_sold, uint256 indexed tokens_bought)',
  'event EthPurchase(address indexed buyer, uint256 indexed tokens_sold, uint256 indexed eth_bought)',
  'event AddLiquidity(address indexed provider, uint256 indexed eth_amount, uint256 indexed token_amount)',
  'event RemoveLiquidity(address indexed provider, uint256 indexed eth_amount, uint256 indexed token_amount)'
];

const IExchange = new ethers.utils.Interface(UNISWAP_V1_EXCHANGE_ABI);
const TOKEN_PURCHASE_TOPIC = IExchange.getEvent('TokenPurchase')!.topicHash;
const ETH_PURCHASE_TOPIC = IExchange.getEvent('EthPurchase')!.topicHash;
const ADD_LIQUIDITY_TOPIC = IExchange.getEvent('AddLiquidity')!.topicHash;
const REMOVE_LIQUIDITY_TOPIC = IExchange.getEvent('RemoveLiquidity')!.topicHash;

async function getExchangeAddresses(factory: string, fromBlock: number, toBlock: number): Promise<string[]> {
  const context = 'UniswapV1.historical.getExchangeAddresses';
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    // Uniswap V1 factory doesn't have a standard event for exchange creation
    // We'll need to query known exchanges or use a different method
    // For now, return empty array - exchanges should be configured in catalog
    const exchanges = (amm as any).uniswap_v1?.exchanges || [];
    if (Array.isArray(exchanges)) {
      return exchanges.map((addr: string) => addr.toLowerCase());
    }
    return [];
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

async function backfillExchangeEvents(exchangeAddress: string, fromBlock: number, toBlock: number): Promise<void> {
  const context = `UniswapV1.historical.backfillExchangeEvents.${exchangeAddress}`;
  try {
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    const eventsCollection = getPoolEventsCollection();
    const metadataCollection = getPoolMetadataCollection();

    // Backfill TokenPurchase events
    const tokenPurchaseLogs = await provider.getLogs({
      address: exchangeAddress,
      topics: [TOKEN_PURCHASE_TOPIC],
      fromBlock,
      toBlock
    });

    // Backfill EthPurchase events
    const ethPurchaseLogs = await provider.getLogs({
      address: exchangeAddress,
      topics: [ETH_PURCHASE_TOPIC],
      fromBlock,
      toBlock
    });

    console.log(`📦 Exchange ${exchangeAddress}: ${tokenPurchaseLogs.length} TokenPurchase, ${ethPurchaseLogs.length} EthPurchase events`);

    // Process TokenPurchase events
    for (const log of tokenPurchaseLogs) {
      try {
        const parsed = IExchange.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse TokenPurchase log at block ${log.blockNumber}`);
        }

        const event: PoolEvent = {
          poolAddress: exchangeAddress,
          chainId: 1,
          eventType: 'Swap',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: parsed.args[1].toString(), // eth_sold
          amount1: parsed.args[2].toString(), // tokens_bought
        };

        await eventsCollection.insertOne(event);
      } catch (error) {
        logErrorWithConsole(error, `${context} - TokenPurchase block ${log.blockNumber}`);
        throw error;
      }
    }

    // Process EthPurchase events
    for (const log of ethPurchaseLogs) {
      try {
        const parsed = IExchange.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) {
          throw new Error(`Failed to parse EthPurchase log at block ${log.blockNumber}`);
        }

        const event: PoolEvent = {
          poolAddress: exchangeAddress,
          chainId: 1,
          eventType: 'Swap',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: parsed.args[1].toString(), // tokens_sold
          amount1: parsed.args[2].toString(), // eth_bought
        };

        await eventsCollection.insertOne(event);
      } catch (error) {
        logErrorWithConsole(error, `${context} - EthPurchase block ${log.blockNumber}`);
        throw error;
      }
    }

    // Update pool metadata
    if (tokenPurchaseLogs.length > 0 || ethPurchaseLogs.length > 0) {
      const lastBlock = Math.max(
        ...tokenPurchaseLogs.map(l => l.blockNumber),
        ...ethPurchaseLogs.map(l => l.blockNumber)
      );
      await metadataCollection.updateOne(
        { poolAddress: exchangeAddress },
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
  const context = 'UniswapV1.historical.main';
  try {
    console.log('🚀 Starting Uniswap V1 historical backfill...');

    if (!config.ENABLE_UNISWAP_V1) {
      console.log('🔒 Uniswap V1 indexer disabled (ENABLE_UNISWAP_V1=false)');
      return;
    }

    // Initialize MongoDB
    await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker');
    console.log('✅ MongoDB initialized');

    // Get factory address
    const factory = (amm as any).uniswap_v1?.factory;
    if (!factory) {
      throw new Error('Uniswap V1 factory address not configured in catalog/amm.json');
    }

    console.log(`🏦 Factory address: ${factory}`);

    // Get provider
    const provider = getProvider();
    if (!provider) {
      throw new Error('Provider not initialized');
    }

    // Get block range
    const latest = await provider.getBlockNumber();
    const fromBlock = process.env.UNISWAP_V1_BACKFILL_FROM_BLOCK
      ? Number(process.env.UNISWAP_V1_BACKFILL_FROM_BLOCK)
      : Math.max(0, latest - config.BACKFILL_BLOCKS);
    const toBlock = process.env.UNISWAP_V1_BACKFILL_TO_BLOCK
      ? Number(process.env.UNISWAP_V1_BACKFILL_TO_BLOCK)
      : latest;

    console.log(`📦 Backfill range: ${fromBlock} to ${toBlock} (${toBlock - fromBlock} blocks)`);

    // Get exchange addresses
    const exchanges = await getExchangeAddresses(factory, fromBlock, toBlock);
    if (exchanges.length === 0) {
      console.log('⚠️ No exchanges found. Add exchange addresses to catalog/amm.json uniswap_v1.exchanges array');
      return;
    }

    console.log(`📦 Found ${exchanges.length} exchanges to backfill`);

    // Backfill each exchange
    for (const exchange of exchanges) {
      await backfillExchangeEvents(exchange, fromBlock, toBlock);
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
  logErrorWithConsole(error, 'UniswapV1.historical.main - unhandled');
  process.exit(1);
});

