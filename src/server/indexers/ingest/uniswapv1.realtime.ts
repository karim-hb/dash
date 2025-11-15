import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { getProvider } from '@/server/modules/provider';
import { ethers } from 'ethers';
import { logErrorWithConsole } from '@/server/utils/errorLogger';
import { getPoolMetadataCollection, getPoolEventsCollection } from '@/lib/db/mongo';
import { PoolEvent } from '@/types/amm';

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

async function handleTokenPurchase(log: any): Promise<void> {
  const context = 'UniswapV1.realtime.handleTokenPurchase';
  try {
    const exchangeAddress = (log.address || '').toLowerCase();
    if (!exchangeAddress) {
      throw new Error(`Missing exchange address in TokenPurchase log at block ${log.blockNumber}`);
    }

    const parsed = IExchange.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse TokenPurchase log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const eventsCollection = getPoolEventsCollection();
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

    // Update pool metadata
    const metadataCollection = getPoolMetadataCollection();
    await metadataCollection.updateOne(
      { poolAddress: exchangeAddress },
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

async function handleEthPurchase(log: any): Promise<void> {
  const context = 'UniswapV1.realtime.handleEthPurchase';
  try {
    const exchangeAddress = (log.address || '').toLowerCase();
    if (!exchangeAddress) {
      throw new Error(`Missing exchange address in EthPurchase log at block ${log.blockNumber}`);
    }

    const parsed = IExchange.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) {
      throw new Error(`Failed to parse EthPurchase log at block ${log.blockNumber}, logIndex ${log.logIndex}`);
    }

    const eventsCollection = getPoolEventsCollection();
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

    // Update pool metadata
    const metadataCollection = getPoolMetadataCollection();
    await metadataCollection.updateOne(
      { poolAddress: exchangeAddress },
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

export async function startUniswapV1Indexer(): Promise<void> {
  const context = 'UniswapV1.realtime.startUniswapV1Indexer';
  console.log('🏦 Starting Uniswap V1 indexer...');
  console.log('🏦 ENABLE_UNISWAP_V1:', config.ENABLE_UNISWAP_V1);

  if (!config.ENABLE_UNISWAP_V1) {
    console.log('🏦 Uniswap V1 indexer disabled');
    return;
  }

  try {
    const factory = (amm as any).uniswap_v1?.factory;
    if (!factory) {
      throw new Error('Uniswap V1 factory address not configured in catalog/amm.json');
    }

    console.log('🏦 Uniswap V1 factory address:', factory);
    const provider = getProvider();

    if (!provider) {
      throw new Error('Provider not initialized - cannot start Uniswap V1 indexer');
    }

    // Get exchange addresses from catalog
    const exchanges = (amm as any).uniswap_v1?.exchanges || [];
    if (!Array.isArray(exchanges) || exchanges.length === 0) {
      console.log('⚠️ No exchanges configured. Add exchange addresses to catalog/amm.json uniswap_v1.exchanges array');
      return;
    }

    console.log(`🏦 Subscribing to ${exchanges.length} exchanges`);

    // Subscribe to TokenPurchase events
    provider.on({ topics: [TOKEN_PURCHASE_TOPIC] }, (log: any) => {
      const exchangeAddr = (log.address || '').toLowerCase();
      if (exchanges.includes(exchangeAddr)) {
        handleTokenPurchase(log).catch((error) => {
          logErrorWithConsole(error, `${context} - TokenPurchase subscription`);
        });
      }
    });

    // Subscribe to EthPurchase events
    provider.on({ topics: [ETH_PURCHASE_TOPIC] }, (log: any) => {
      const exchangeAddr = (log.address || '').toLowerCase();
      if (exchanges.includes(exchangeAddr)) {
        handleEthPurchase(log).catch((error) => {
          logErrorWithConsole(error, `${context} - EthPurchase subscription`);
        });
      }
    });

    console.log('✅ Uniswap V1 indexer started successfully');
  } catch (error) {
    logErrorWithConsole(error, context);
    throw error;
  }
}

