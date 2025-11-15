import { MongoClient, Db, Collection } from 'mongodb';
import { Transaction, Receipt, Token } from '@/lib/types/transaction';
import { PoolMetadata, PoolEvent, AMMPoolMetadata, AMMSwap, AMMPosition, AMMLiquidityEvent } from '@/types/amm';
import { AssetTrendDocument, AssetMetricsDocument } from '@/lib/db/types/aave';
import { logErrorWithConsole, logWarningWithConsole } from '@/server/utils/errorLogger';

// Global connection cache
let client: MongoClient | null = null;
let db: Db | null = null;

// Collections
let transactionsCollection: Collection<Transaction> | null = null;
let receiptsCollection: Collection<Receipt> | null = null;
let signaturesCacheCollection: Collection<{ selector: string; signature: string }> | null = null;
let tokensCollection: Collection<Token> | null = null;
let poolMetadataCollection: Collection<PoolMetadata> | null = null;
let poolEventsCollection: Collection<PoolEvent> | null = null;
let assetTrendCollection: Collection<AssetTrendDocument> | null = null;
let assetMetricsCollection: Collection<AssetMetricsDocument> | null = null;
// Custom AMM collections (separate from existing pool collections)
let ammPoolsCollection: Collection<AMMPoolMetadata> | null = null;
let ammSwapsCollection: Collection<AMMSwap> | null = null;
let ammPositionsCollection: Collection<AMMPosition> | null = null;
let ammLiquidityEventsCollection: Collection<AMMLiquidityEvent> | null = null;

// Initialize MongoDB connection
export async function initMongo(url: string = 'mongodb://127.0.0.1:27017/tracker'): Promise<void> {
  if (client) return; // Already initialized

  try {
    client = new MongoClient(url);
    await client.connect();
    db = client.db('tracker');

    // Initialize collections
    transactionsCollection = db.collection<Transaction>('transactions');
    receiptsCollection = db.collection<Receipt>('receipts');
    signaturesCacheCollection = db.collection<{ selector: string; signature: string }>('signatures_cache');
    tokensCollection = db.collection<Token>('tokens');
    poolMetadataCollection = db.collection<PoolMetadata>('pool_metadata');
    poolEventsCollection = db.collection<PoolEvent>('pool_events');
    assetTrendCollection = db.collection<AssetTrendDocument>('asset_trend');
    assetMetricsCollection = db.collection<AssetMetricsDocument>('asset_metrics');
    // Custom AMM collections
    ammPoolsCollection = db.collection<AMMPoolMetadata>('amm_pools');
    ammSwapsCollection = db.collection<AMMSwap>('amm_swaps');
    ammPositionsCollection = db.collection<AMMPosition>('amm_positions');
    ammLiquidityEventsCollection = db.collection<AMMLiquidityEvent>('amm_liquidity_events');

    // Create indexes for performance
    await transactionsCollection.createIndex({ hash: 1 }, { unique: true });
    await transactionsCollection.createIndex({ _state: 1, _first_seen_ts: -1 });
    await transactionsCollection.createIndex({ category_key: 1 });
    await receiptsCollection.createIndex({ transactionHash: 1 }, { unique: true });
    await signaturesCacheCollection.createIndex({ selector: 1 }, { unique: true });
    await tokensCollection.createIndex({ address: 1 }, { unique: true });

    // AMM indexes
    await poolMetadataCollection.createIndex({ poolAddress: 1 }, { unique: true });
    await poolMetadataCollection.createIndex({ creationBlock: 1 });
    await poolMetadataCollection.createIndex({ status: 1 });
    await poolMetadataCollection.createIndex({ lastActivityBlock: 1 });
    await poolEventsCollection.createIndex({ poolAddress: 1, blockNumber: 1 });
    await poolEventsCollection.createIndex({ timestamp: 1 });
    await poolEventsCollection.createIndex({ eventType: 1 });

    // Asset analytics indexes
    await assetTrendCollection.createIndex({ assetAddress: 1, timestamp: 1 });
    await assetTrendCollection.createIndex({ assetAddress: 1, blockNumber: 1 });
    await assetTrendCollection.createIndex({ updateType: 1, timestamp: -1 });
    await assetMetricsCollection.createIndex({ assetAddress: 1 }, { unique: true });

    // Custom AMM indexes
    await ammPoolsCollection.createIndex({ poolAddress: 1 }, { unique: true });
    await ammPoolsCollection.createIndex({ creationBlock: 1 });
    await ammPoolsCollection.createIndex({ status: 1 });
    await ammPoolsCollection.createIndex({ lastActivityBlock: 1 });
    await ammSwapsCollection.createIndex({ poolAddress: 1, blockNumber: 1 });
    await ammSwapsCollection.createIndex({ txHash: 1, logIndex: 1 }, { unique: true });
    await ammSwapsCollection.createIndex({ timestamp: 1 });
    await ammPositionsCollection.createIndex({ owner: 1, poolAddress: 1 });
    await ammPositionsCollection.createIndex({ poolAddress: 1 });
    await ammPositionsCollection.createIndex({ positionId: 1 }, { unique: true, sparse: true });
    await ammLiquidityEventsCollection.createIndex({ poolAddress: 1, blockNumber: 1 });
    await ammLiquidityEventsCollection.createIndex({ txHash: 1, logIndex: 1 }, { unique: true });
    await ammLiquidityEventsCollection.createIndex({ timestamp: 1 });
    await ammLiquidityEventsCollection.createIndex({ eventType: 1 });

    console.log('✅ MongoDB connected and initialized');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    throw error;
  }
}

// Get database instance
export function getDb(): Db {
  if (!db) throw new Error('MongoDB not initialized');
  return db;
}

// Get collections
export function getTransactionsCollection(): Collection<Transaction> {
  if (!transactionsCollection) throw new Error('Transactions collection not initialized');
  return transactionsCollection;
}

export function getReceiptsCollection(): Collection<Receipt> {
  if (!receiptsCollection) throw new Error('Receipts collection not initialized');
  return receiptsCollection;
}

export function getSignaturesCacheCollection(): Collection<{ selector: string; signature: string }> {
  if (!signaturesCacheCollection) throw new Error('Signatures cache collection not initialized');
  return signaturesCacheCollection;
}

export function getTokensCollection(): Collection<Token> {
  if (!tokensCollection) throw new Error('Tokens collection not initialized');
  return tokensCollection;
}

export function getPoolMetadataCollection(): Collection<PoolMetadata> {
  if (!poolMetadataCollection) throw new Error('Pool metadata collection not initialized');
  return poolMetadataCollection;
}

export function getPoolEventsCollection(): Collection<PoolEvent> {
  if (!poolEventsCollection) throw new Error('Pool events collection not initialized');
  return poolEventsCollection;
}

export function getAssetTrendCollection(): Collection<AssetTrendDocument> {
  if (!assetTrendCollection) throw new Error('Asset trend collection not initialized');
  return assetTrendCollection;
}

export function getAssetMetricsCollection(): Collection<AssetMetricsDocument> {
  if (!assetMetricsCollection) throw new Error('Asset metrics collection not initialized');
  return assetMetricsCollection;
}

// Custom AMM collection getters
export function getAmmPoolsCollection(): Collection<AMMPoolMetadata> {
  if (!ammPoolsCollection) throw new Error('AMM pools collection not initialized');
  return ammPoolsCollection;
}

export function getAmmSwapsCollection(): Collection<AMMSwap> {
  if (!ammSwapsCollection) throw new Error('AMM swaps collection not initialized');
  return ammSwapsCollection;
}

export function getAmmPositionsCollection(): Collection<AMMPosition> {
  if (!ammPositionsCollection) throw new Error('AMM positions collection not initialized');
  return ammPositionsCollection;
}

export function getAmmLiquidityEventsCollection(): Collection<AMMLiquidityEvent> {
  if (!ammLiquidityEventsCollection) throw new Error('AMM liquidity events collection not initialized');
  return ammLiquidityEventsCollection;
}

// Close connection
export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    transactionsCollection = null;
    receiptsCollection = null;
    signaturesCacheCollection = null;
    tokensCollection = null;
    poolMetadataCollection = null;
    poolEventsCollection = null;
    assetTrendCollection = null;
    assetMetricsCollection = null;
    ammPoolsCollection = null;
    ammSwapsCollection = null;
    ammPositionsCollection = null;
    ammLiquidityEventsCollection = null;
    console.log('✅ MongoDB connection closed');
  }
}

// Health check
export async function pingMongo(): Promise<boolean> {
  try {
    if (!db) return false;
    await db.admin().ping();
    return true;
  } catch {
    return false;
  }
}
