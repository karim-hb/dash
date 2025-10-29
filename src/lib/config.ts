// Configuration loader for tracker_web
import { z } from 'zod';

// Environment schema
const configSchema = z.object({
  EXECUTION_WS_URL: z.string().url().default('ws://127.0.0.1:8545'),
  MONGO_URL: z.string().url().default('mongodb://127.0.0.1:27017/tracker'),
  JWT_PATH: z.string().optional(),
  ENABLE_4BYTE: z.string().transform(val => val === 'true').default('false'),
  UI_REFRESH_MS: z.string().transform(Number).default('200'),
  RECEIPT_CONCURRENCY: z.string().transform(Number).default('8'),
  TOKEN_CONCURRENCY: z.string().transform(Number).default('4'),
  ETHERSCAN_API_KEY: z.string().optional(),
  ETHERSCAN_BASE_URL: z.string().default('https://api.etherscan.io'),
});

export type Config = z.infer<typeof configSchema>;

// Load configuration from environment
export function loadConfig(): Config {
  return configSchema.parse(process.env);
}

// Get config (cached)
let cachedConfig: Config | null = null;

export function getConfig(): Config {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
}

// Export individual config values
export const config = getConfig();
