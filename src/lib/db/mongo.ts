import { MongoClient, Db, Collection } from 'mongodb';
import { Transaction, Receipt, Token } from '@/lib/types/transaction';
import { PoolMetadata, PoolEvent } from '@/types/amm';
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
