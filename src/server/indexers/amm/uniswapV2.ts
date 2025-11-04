import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { getPools } from '../../market/registry';
import { getUsdPriceViaWeth } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { ethers } from 'ethers';
import { getProvider } from '../../modules/provider';
import { recordSwapBucket } from '../../market/bucket';
import { registerPool, updateV2PoolReserves } from '../../market/ammEngine';
import tokensCatalog from '../../catalog/tokens.json';
import { getTokens } from '../../market/registry';
import { logErrorWithConsole } from '@/server/utils/errorLogger';

const V2_FACTORY_ABI = [
  'event PairCreated(address indexed token0, address indexed token1, address pair, uint256)'
];
const V2_PAIR_ABI = [
  'event Sync(uint112 reserve0, uint112 reserve1)',
  'event Swap(address indexed sender, uint256 amount0In, uint256 amount1In, uint256 amount0Out, uint256 amount1Out, address indexed to)'
];
const IFactory = new ethers.Interface(V2_FACTORY_ABI);
const IPair = new ethers.Interface(V2_PAIR_ABI);
const PAIR_CREATED_TOPIC = IFactory.getEvent('PairCreated')!.topicHash;
const SYNC_TOPIC = IPair.getEvent('Sync')!.topicHash;
const SWAP_TOPIC = IPair.getEvent('Swap')!.topicHash;

const discoveredPairs = new Set<string>();

function getTokenDecimalsCached(address: string): number {
  const lower = address.toLowerCase();
  const existing = getTokens().find(t => (t.address || '').toLowerCase() === lower);
  if (existing && typeof existing.decimals === 'number') return existing.decimals;
  const catalogEntry: any = (tokensCatalog as any)[lower] || (tokensCatalog as any)[address];
  if (catalogEntry && typeof catalogEntry.decimals === 'number') return catalogEntry.decimals;
  return 18;
}

async function handlePairCreated(log: any, dexName: string) {
  try {
    const parsed = IFactory.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return;
    const token0 = String(parsed.args[0]).toLowerCase();
    const token1 = String(parsed.args[1]).toLowerCase();
    const pair = String(parsed.args[2]).toLowerCase();

    if (discoveredPairs.has(pair)) return;
    discoveredPairs.add(pair);

    console.log(`🏦 ${dexName} V2: discovered pair ${pair} (${token0.slice(0,6)}…/${token1.slice(0,6)}…)`);

    // Store to MongoDB
    try {
      const { getPoolMetadataCollection } = await import('../../../lib/db/mongo');
      const metadataCollection = getPoolMetadataCollection();
      const metadata = {
        poolAddress: pair,
        chainId: 1, // Ethereum mainnet
        protocol: dexName,
        factoryAddress: (amm as any).uniswap_v2?.factory,
        token0Address: token0,
        token1Address: token1,
        feeTier: 30, // 0.3% for V2
        creationBlock: log.blockNumber,
        creationTimestamp: new Date(),
        status: 'active' as const,
        lastActivityBlock: log.blockNumber,
        liquidityUSD: 0, // Will be updated by metrics
        volume24hUSD: 0,
        fees24hUSD: 0
      };
      await metadataCollection.updateOne(
        { poolAddress: pair },
        { $set: metadata },
        { upsert: true }
      );
    } catch (dbError) {
      logErrorWithConsole(dbError, 'V2 pool metadata storage failed');
    }

    await registerPool({ dex: dexName, version: 'V2', address: pair, token0, token1, feeBps: 30 });

    // Seed reserves immediately to enable pricing before first Sync
    try {
      const provider = getProvider();
      const reservesData = await provider.call({ to: pair, data: '0x0902f1ac' }); // getReserves()
      if (reservesData && reservesData.length >= 130) {
        const r0 = BigInt('0x' + reservesData.slice(2, 66));
        const r1 = BigInt('0x' + reservesData.slice(66, 130));
        await updateV2PoolReserves({ dex: dexName, version: 'V2', address: pair, token0, token1, feeBps: 30 }, r0, r1);
      }
    } catch (err) {
      console.warn(`🏦 Failed to seed initial reserves for ${pair}:`, err);
    }
  } catch (e) {
    logErrorWithConsole(e, 'PairCreated error');
  }
}

async function handleSync(log: any) {
  try {
    const pair = (log.address || '').toLowerCase();
    const parsed = IPair.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return;
    const r0 = BigInt(parsed.args[0]);
    const r1 = BigInt(parsed.args[1]);
    const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
    if (!pool) return;
    await updateV2PoolReserves({
      dex: pool.dex,
      version: pool.version,
      address: pool.address,
      token0: pool.token0,
      token1: pool.token1,
      feeBps: pool.fee_bps ?? 30,
    }, r0, r1);
  } catch (err) {
    logErrorWithConsole(err, 'Sync handler error');
  }
}

export async function startUniswapV2Indexer(): Promise<void> {
  console.log('🏦 Starting Uniswap V2 indexer...');
  if (!config.ENABLE_AMM_UNIV2) {
    console.log('🏦 Uniswap V2 indexer disabled');
    return;
  }
  const factory = (amm as any).uniswap_v2?.factory;
  if (!factory) {
    console.log('🏦 No Uniswap V2 factory configured');
    return;
  }
  const provider = getProvider();

  // Backfill recent PairCreated events
  try {
    const latest = await provider.getBlockNumber();
    const from = Math.max(0, latest - 10000); // Backfill last 10k blocks
    console.log(`🏦 V2 backfilling pairs from block ${from} to ${latest}`);
    const logs = await provider.getLogs({ address: factory, topics: [PAIR_CREATED_TOPIC], fromBlock: from, toBlock: latest });
    console.log(`🏦 Found ${logs.length} PairCreated logs`);
    for (const log of logs || []) await handlePairCreated(log, 'Uniswap');
    console.log('🏦 V2 backfill completed');
  } catch (e) {
    logErrorWithConsole(e, 'UniswapV2 backfill failed');
  }

  // Backfill last 24h swaps into buckets/volume
  try {
    const latest = await provider.getBlockNumber();
    const LOOKBACK = Number(process.env.VOL_24H_LOOKBACK_BLOCKS || '7200');
    const from = Math.max(0, latest - LOOKBACK);
    const poolsV2 = getPools().filter((p: any) => p.version === 'V2').map((p: any) => p.address);
    console.log(`🏦 Backfilling swaps for ${poolsV2.length} V2 pools from block ${from} to ${latest}`);
    const chunk = 200;
    for (let i = 0; i < poolsV2.length; i += chunk) {
      const addrs = poolsV2.slice(i, i + chunk);
      try {
        const logs = await provider.getLogs({ address: addrs, topics: [SWAP_TOPIC], fromBlock: from, toBlock: latest });
        console.log(`🏦 Processing ${logs.length} swap logs for chunk ${i / chunk + 1}/${Math.ceil(poolsV2.length / chunk)}`);
        for (const log of logs || []) {
          try {
            await processSwapLog(log);
          } catch (err) {
            console.warn(`🏦 Failed to process swap log:`, err);
          }
        }
      } catch (err) {
        console.warn(`🏦 Failed to backfill swaps for chunk:`, err);
      }
    }
    console.log('🏦 V2 swap backfill completed');
  } catch (e) {
    logErrorWithConsole(e, 'UniswapV2 swap backfill failed');
  }

  async function processSwapLog(log: any): Promise<void> {
    try {
      const poolAddr = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === poolAddr);
      if (!pool) return;

      const parsed = IPair.parseLog({ topics: log.topics, data: log.data });
      if (!parsed) return;

      const amount0In = BigInt(parsed.args[0]);
      const amount1In = BigInt(parsed.args[1]);
      const amount0Out = BigInt(parsed.args[2]);
      const amount1Out = BigInt(parsed.args[3]);

      const decimals0 = getTokenDecimalsCached(pool.token0);
      const decimals1 = getTokenDecimalsCached(pool.token1);

      const qty0 = Number(ethers.formatUnits(amount0In > amount0Out ? amount0In : amount0Out, decimals0));
      const qty1 = Number(ethers.formatUnits(amount1In > amount1Out ? amount1In : amount1Out, decimals1));

      const [price0, price1] = await Promise.all([
        getUsdPriceForToken(pool.token0),
        getUsdPriceForToken(pool.token1),
      ]);

      let volumeUSD = 0;
      if (price0 != null && isFinite(price0) && qty0 > 0) {
        volumeUSD = qty0 * price0;
      } else if (price1 != null && isFinite(price1) && qty1 > 0) {
        volumeUSD = qty1 * price1;
      }

      if (!isFinite(volumeUSD) || volumeUSD <= 0) return;

      const feeBps = pool.fee_bps ?? 30;
      const feeUSD = volumeUSD * (feeBps / 10000);

      // Store to MongoDB
      try {
        const { getPoolEventsCollection } = await import('../../../lib/db/mongo');
        const eventsCollection = getPoolEventsCollection();
        const event = {
          poolAddress: poolAddr,
          chainId: 1,
          eventType: 'Swap',
          blockNumber: log.blockNumber,
          logIndex: log.logIndex,
          timestamp: new Date(),
          amount0: qty0.toString(),
          amount1: qty1.toString(),
          volumeUSD,
          feeUSD,
        };
        await eventsCollection.insertOne(event);
      } catch (dbError) {
        logErrorWithConsole(dbError, 'V2 swap event storage failed');
      }

      recordSwapUsd(poolAddr, volumeUSD, feeUSD);

      const priceForBucket = price0 != null && isFinite(price0) ? price0 :
                            (price1 != null && isFinite(price1) ? price1 : null);
      if (priceForBucket) {
        recordSwapBucket(poolAddr, priceForBucket, volumeUSD, log.blockNumber).catch(() => {});
      }
    } catch (e) {
      logErrorWithConsole(e, 'processSwapLog error');
    }
  }

  // Live subscriptions
  provider.on({ address: factory, topics: [PAIR_CREATED_TOPIC] }, (res: any) => {
    handlePairCreated(res, 'Uniswap').catch(err => logErrorWithConsole(err, 'PairCreated handler error'));
  });

  // Subscribe to Sync for discovered pairs (broad filter over topic, no address list)
  provider.on({ topics: [SYNC_TOPIC] }, (res: any) => {
    handleSync(res).catch(err => logErrorWithConsole(err, 'Sync handler error'));
  });

  // Subscribe to Swap events (compute 24h volume/fees)
  provider.on({ topics: [SWAP_TOPIC] }, (log: any) => {
    processSwapLog(log).catch(err => logErrorWithConsole(err, 'Swap handler error'));
  });
}


