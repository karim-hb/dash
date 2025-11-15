import { createClient, type RedisClientType } from "redis";

const DEFAULT_REDIS_URL = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: RedisClientType | null = null;
let connecting = false;

async function initClient(): Promise<RedisClientType> {
  if (client) return client;
  if (connecting) {
    // wait until existing connection resolves
    return new Promise<RedisClientType>((resolve, reject) => {
      const check = () => {
        if (client) {
          resolve(client as RedisClientType);
        } else if (!connecting) {
          reject(new Error("Failed to initialize Redis client"));
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  }

  connecting = true;
  const redisClient = createClient({
    url: DEFAULT_REDIS_URL,
  });

  redisClient.on("error", (err) => {
    console.error("❌ Redis error:", err.message);
  });

  await redisClient.connect();
  console.log(`🔌 Connected to Redis at ${DEFAULT_REDIS_URL}`);

  client = redisClient;
  connecting = false;
  return redisClient;
}

export async function getRedisClient(): Promise<RedisClientType> {
  return initClient();
}

export async function pingRedis(): Promise<string> {
  const redis = await initClient();
  return redis.ping();
}

export function candidateKey(hash: string) {
  return `tx:candidate:${hash.toLowerCase()}`;
}

export const CANDIDATE_PENDING_SET_KEY = "tx:candidates:pending";

