import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { getProvider } from '@/server/modules/provider';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { getPoolMetadataCollection, getPoolEventsCollection } from '@/lib/db/mongo';
import { PoolEvent } from '@/types/amm';

const CURVE_V1_OLD_POOL_ABI = [
  'event TokenExchange(address indexed buyer, int128 sold_id, uint256 tokens_sold, int128 bought_id, uint256 tokens_bought)',
  'event AddLiquidity(address indexed provider, uint256[2] token_amounts, uint256[2] fees, uint256 invariant, uint256 token_supply)',
  'event RemoveLiquidity(address indexed provider, uint256[2] token_amounts, uint256[2] fees, uint256 token_supply)'
];

const IPool = new ethers.utils.Interface(CURVE_V1_OLD_POOL_ABI);
const TOKEN_EXCHANGE_TOPIC = IPool.getEvent('TokenExchange')!.topicHash;
const ADD_LIQUIDITY_TOPIC = IPool.getEvent('AddLiquidity')!.topicHash;
const REMOVE_LIQUIDITY_TOPIC = IPool.getEvent('RemoveLiquidity')!.topicHash;

async function handleTokenExchange(log: any): Promise<void> {
  const context = 'CurveV1Old.realtime.handleTokenExchange';
  try {
    const poolAddress = (log.address || '').toLowerCase();
    if (!poolAddress) {
      throw new Error(`Missing pool address in TokenExchange log at block ${log.blockNumber}`);
    }

    const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse TokenExchange log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const eventsCollection = getPoolEventsCollection();
    const event: PoolEvent = {
      poolAddress: poolAddress,
      chainId: 1,
      eventType: 'Swap',
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      timestamp: new Date(),
      amount0: parsed.args[2].toString(), // tokens_sold
      amount1: parsed.args[4].toString(), // tokens_bought
    };

    await eventsCollection.insertOne(event);

    // Update pool metadata
    const metadataCollection = getPoolMetadataCollection();
    await metadataCollection.updateOne(
      { poolAddress: poolAddress },
      {
        $set: {
          lastActivityBlock: log.blockNumber,
          lastActivityTimestamp: new Date()
        }
      },
      { upsert: false }
    );
  } catch (error) {
    logErrorWithConsole(error, `${context} - block ${log.blockNumber}, logIndex ${log.logIndex}`);
    throw error;
  }
}

async function handleLiquidityEvent(log: any, eventType: 'Mint' | 'Burn'): Promise<void> {
  const context = `CurveV1Old.realtime.handleLiquidityEvent.${eventType}`;
  try {
    const poolAddress = (log.address || '').toLowerCase();
    if (!poolAddress) {
      throw new Error(`Missing pool address in ${eventType} log at block ${log.blockNumber}`);
    }

    const parsed = IPool.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse ${eventType} log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const amounts = parsed.args[1]; // token_amounts array
    const eventsCollection = getPoolEventsCollection();
    const event: PoolEvent = {
      poolAddress: poolAddress,
      chainId: 1,
      eventType: eventType,
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      timestamp: new Date(),
      amount0: amounts[0].toString(),
      amount1: amounts[1].toString(),
    };

    await eventsCollection.insertOne(event);

    // Update pool metadata
    const metadataCollection = getPoolMetadataCollection();
    await metadataCollection.updateOne(
      { poolAddress: poolAddress },
      {
        $set: {
          lastActivityBlock: log.blockNumber,
          lastActivityTimestamp: new Date()
        }
      },
      { upsert: false }
    );
  } catch (error) {
    logErrorWithConsole(error, `${context} - block ${log.blockNumber}, logIndex ${log.logIndex}`);
    throw error;
  }
}

export async function startCurveV1OldIndexer(): Promise<void> {
  const context = 'CurveV1Old.realtime.startCurveV1OldIndexer';
  console.log('🏦 Starting Curve V1 Old indexer...');
  console.log('🏦 ENABLE_CURVE_V1_OLD:', config.ENABLE_CURVE_V1_OLD);

  if (!config.ENABLE_CURVE_V1_OLD) {
    console.log('🏦 Curve V1 Old indexer disabled');
    return;
  }

  try {
    const pools = (amm as any).curve_v1_old?.pools || [];
    if (!Array.isArray(pools) || pools.length === 0) {
      console.log('⚠️ No pools configured. Add pool addresses to catalog/amm.json curve_v1_old.pools array');
      return;
    }

    console.log(`🏦 Found ${pools.length} pools to monitor`);
    const provider = getProvider();

    if (!provider) {
      throw new Error('Provider not initialized - cannot start Curve V1 Old indexer');
    }

    const poolAddresses = pools.map((p: string) => p.toLowerCase());

    // Subscribe to TokenExchange events
    provider.on({ topics: [TOKEN_EXCHANGE_TOPIC] }, (log: any) => {
      const poolAddr = (log.address || '').toLowerCase();
      if (poolAddresses.includes(poolAddr)) {
        handleTokenExchange(log).catch((error) => {
          logErrorWithConsole(error, `${context} - TokenExchange subscription`);
        });
      }
    });

    // Subscribe to AddLiquidity events
    provider.on({ topics: [ADD_LIQUIDITY_TOPIC] }, (log: any) => {
      const poolAddr = (log.address || '').toLowerCase();
      if (poolAddresses.includes(poolAddr)) {
        handleLiquidityEvent(log, 'Mint').catch((error) => {
          logErrorWithConsole(error, `${context} - AddLiquidity subscription`);
        });
      }
    });

    // Subscribe to RemoveLiquidity events
    provider.on({ topics: [REMOVE_LIQUIDITY_TOPIC] }, (log: any) => {
      const poolAddr = (log.address || '').toLowerCase();
      if (poolAddresses.includes(poolAddr)) {
        handleLiquidityEvent(log, 'Burn').catch((error) => {
          logErrorWithConsole(error, `${context} - RemoveLiquidity subscription`);
        });
      }
    });

    console.log('✅ Curve V1 Old indexer started successfully');
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

