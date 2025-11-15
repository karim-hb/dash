import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { getProvider } from '../../modules/provider';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { getAmmPoolsCollection, getAmmSwapsCollection, getAmmLiquidityEventsCollection } from '@/lib/db/mongo';
import { AMMPoolMetadata, AMMSwap, AMMLiquidityEvent } from '@/types/amm';

// AMM Factory ABI - PoolCreated event
const AMM_FACTORY_ABI = [
  'event PoolCreated(address indexed token0, address indexed token1, uint24 fee, address pool)'
];

// AMM Pool ABI - Swap, Sync, Mint, Burn events
const AMM_POOL_ABI = [
  'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)',
  'event Sync(uint112 reserve0, uint112 reserve1)',
  'event Mint(address indexed sender, uint256 amount0, uint256 amount1)',
  'event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to)'
];

const IFactory = new ethers.Interface(AMM_FACTORY_ABI);
const IPool = new ethers.Interface(AMM_POOL_ABI);
const POOL_CREATED_TOPIC = IFactory.getEvent('PoolCreated')!.topicHash;
const SWAP_TOPIC = IPool.getEvent('Swap')!.topicHash;
const SYNC_TOPIC = IPool.getEvent('Sync')!.topicHash;
const MINT_TOPIC = IPool.getEvent('Mint')!.topicHash;
const BURN_TOPIC = IPool.getEvent('Burn')!.topicHash;

async function handlePoolCreated(log: any): Promise<void> {
  const context = 'CustomAmm.handlePoolCreated';
  try {
    const parsed = IFactory.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse PoolCreated log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const token0 = String(parsed.args[0]).toLowerCase();
    const token1 = String(parsed.args[1]).toLowerCase();
    const fee = Number(parsed.args[2]);
    const pool = String(parsed.args[3]).toLowerCase();
    const feeBps = Math.round(fee / 100); // Convert to basis points

    console.log(`🏦 Custom AMM: discovered pool ${pool} (${token0.slice(0, 6)}…/${token1.slice(0, 6)}… fee:${feeBps}bps)`);

    // Store to MongoDB - fail if collection not initialized
    const poolsCollection = getAmmPoolsCollection();
    const metadata: AMMPoolMetadata = {
      poolAddress: pool,
      chainId: 1, // Ethereum mainnet
      protocol: 'CustomAMM',
      factoryAddress: (amm as any).custom_amm?.factory || '',
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
    logErrorWithConsole(error, `${context} - block ${log.blockNumber}, logIndex ${log.logIndex}`);
    throw error; // Propagate error - no fallback
  }
}

async function handleSwap(log: any): Promise<void> {
  const context = 'CustomAmm.handleSwap';
  try {
    const poolAddr = (log.address || '').toLowerCase();
    if (!poolAddr) {
      throw new Error(`Missing pool address in swap log at block ${log.blockNumber}`);
    }

    const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse Swap log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const sender = String(parsed.args[0]).toLowerCase();
    const recipient = String(parsed.args[1]).toLowerCase();
    const amount0 = parsed.args[2].toString();
    const amount1 = parsed.args[3].toString();
    const sqrtPriceX96 = parsed.args[4]?.toString();
    const liquidity = parsed.args[5]?.toString();
    const tick = parsed.args[6] ? Number(parsed.args[6]) : undefined;

    // Verify pool exists
    const poolsCollection = getAmmPoolsCollection();
    const pool = await poolsCollection.findOne({ poolAddress: poolAddr });
    if (!pool) {
      throw new Error(`Pool ${poolAddr} not found in database for swap at block ${log.blockNumber}`);
    }

    // Store swap event
    const swapsCollection = getAmmSwapsCollection();
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
    throw error; // Propagate error - no fallback
  }
}

async function handleLiquidityEvent(log: any, eventType: 'Mint' | 'Burn'): Promise<void> {
  const context = `CustomAmm.handleLiquidityEvent.${eventType}`;
  try {
    const poolAddr = (log.address || '').toLowerCase();
    if (!poolAddr) {
      throw new Error(`Missing pool address in ${eventType} log at block ${log.blockNumber}`);
    }

    const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse ${eventType} log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const sender = String(parsed.args[0]).toLowerCase();
    const amount0 = parsed.args[1]?.toString() || '0';
    const amount1 = parsed.args[2]?.toString() || '0';
    const to = eventType === 'Burn' ? String(parsed.args[3]).toLowerCase() : sender;

    // Verify pool exists
    const poolsCollection = getAmmPoolsCollection();
    const pool = await poolsCollection.findOne({ poolAddress: poolAddr });
    if (!pool) {
      throw new Error(`Pool ${poolAddr} not found in database for ${eventType} at block ${log.blockNumber}`);
    }

    // Store liquidity event
    const eventsCollection = getAmmLiquidityEventsCollection();
    const event: AMMLiquidityEvent = {
      poolAddress: poolAddr,
      chainId: 1,
      txHash: log.transactionHash || '',
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      timestamp: new Date(),
      eventType,
      owner: to,
      amount0,
      amount1
    };

    await eventsCollection.insertOne(event);

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
    throw error; // Propagate error - no fallback
  }
}

export async function startCustomAmmIndexer(): Promise<void> {
  const context = 'CustomAmm.startCustomAmmIndexer';
  console.log('🏦 Starting Custom AMM indexer...');
  console.log('🏦 ENABLE_AMM_CUSTOM:', config.ENABLE_AMM_CUSTOM);

  if (!config.ENABLE_AMM_CUSTOM) {
    console.log('🏦 Custom AMM indexer disabled');
    return;
  }

  try {
    const factory = (amm as any).custom_amm?.factory;
    if (!factory) {
      throw new Error('Custom AMM factory address not configured in catalog/amm.json');
    }

    console.log('🏦 Custom AMM factory address:', factory);
    const provider = getProvider();

    if (!provider) {
      throw new Error('Provider not initialized - cannot start Custom AMM indexer');
    }

    // Backfill recent PoolCreated events
    try {
      const latest = await provider.getBlockNumber();
      const from = Math.max(0, latest - config.BACKFILL_BLOCKS);
      console.log(`🏦 Custom AMM backfilling pools from block ${from} to ${latest}`);
      const logs = await provider.getLogs({
        address: factory,
        topics: [POOL_CREATED_TOPIC],
        fromBlock: from,
        toBlock: latest
      });
      console.log(`🏦 Found ${logs.length} PoolCreated logs`);
      for (const log of logs || []) {
        await handlePoolCreated(log);
      }
      console.log('🏦 Custom AMM pool backfill completed');
    } catch (error) {
      logErrorWithConsole(error, `${context} - pool backfill`);
      throw error; // Fail fast - don't continue if backfill fails
    }

    // Subscribe to PoolCreated events
    provider.on({ address: factory, topics: [POOL_CREATED_TOPIC] }, (log: any) => {
      handlePoolCreated(log).catch((error) => {
        logErrorWithConsole(error, `${context} - PoolCreated subscription`);
        // Don't throw here - let subscription continue, but log error
      });
    });

    // Subscribe to Swap events
    provider.on({ topics: [SWAP_TOPIC] }, (log: any) => {
      handleSwap(log).catch((error) => {
        logErrorWithConsole(error, `${context} - Swap subscription`);
        // Don't throw here - let subscription continue, but log error
      });
    });

    // Subscribe to Mint events
    provider.on({ topics: [MINT_TOPIC] }, (log: any) => {
      handleLiquidityEvent(log, 'Mint').catch((error) => {
        logErrorWithConsole(error, `${context} - Mint subscription`);
        // Don't throw here - let subscription continue, but log error
      });
    });

    // Subscribe to Burn events
    provider.on({ topics: [BURN_TOPIC] }, (log: any) => {
      handleLiquidityEvent(log, 'Burn').catch((error) => {
        logErrorWithConsole(error, `${context} - Burn subscription`);
        // Don't throw here - let subscription continue, but log error
      });
    });

    console.log('✅ Custom AMM indexer started successfully');
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error; // Fail fast - don't start indexer if initialization fails
  }
}


