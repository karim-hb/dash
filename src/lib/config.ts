// Configuration loader for tracker_web
import { z } from 'zod';

// Environment schema
const configSchema = z.object({
  EXECUTION_WS_URL: z.string().url().default('ws://127.0.0.1:8545'),
  MONGO_URL: z.string().url().default('mongodb://127.0.0.1:27017/tracker'),
  JWT_PATH: z.string().optional(),
  ENABLE_4BYTE: z.string().default('false').transform(val => val === 'true'),
  UI_REFRESH_MS: z.string().default('200').transform(Number),
  RECEIPT_CONCURRENCY: z.string().default('8').transform(Number),
  TOKEN_CONCURRENCY: z.string().default('4').transform(Number),
  ETHERSCAN_API_KEY: z.string().optional(),
  ETHERSCAN_BASE_URL: z.string().default('https://api.etherscan.io'),
  // Feature toggles
  ENABLE_AMM_UNIV2: z.string().default('true').transform(v => v === 'true'),
  ENABLE_AMM_UNIV3: z.string().default('true').transform(v => v === 'true'),
  ENABLE_SUSHI: z.string().default('true').transform(v => v === 'true'),
  ENABLE_CURVE: z.string().default('false').transform(v => v === 'true'),
  ENABLE_BALANCER: z.string().default('false').transform(v => v === 'true'),
  ENABLE_AMM_CUSTOM: z.string().default('false').transform(v => v === 'true'),
  ENABLE_UNISWAP_V1: z.string().default('false').transform(v => v === 'true'),
  ENABLE_CURVE_V1_OLD: z.string().default('false').transform(v => v === 'true'),
  ENABLE_ORACLES: z.string().default('true').transform(v => v === 'true'),
  ENABLE_CHAINLINK: z.string().default('true').transform(v => v === 'true'),
  ENABLE_COINGECKO: z.string().default('false').transform(v => v === 'true'),
  // Oracle settings
  CG_RATE_LIMIT_QPM: z.string().default('60').transform(Number),
  BACKFILL_BLOCKS: z.string().default('50000').transform(Number),
  ETH_USD_FEED: z.string().default('0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419'),
  ORACLE_HEARTBEAT_SLACK_SEC: z.string().default('3600').transform(Number),
  // Opportunity scoring weights
  OPP_VALUE_WEIGHT: z.string().default('0.35').transform(Number),
  OPP_GAS_WEIGHT: z.string().default('0.15').transform(Number),
  OPP_MEV_WEIGHT: z.string().default('0.2').transform(Number),
  OPP_SMART_MONEY_WEIGHT: z.string().default('0.15').transform(Number),
  OPP_URGENCY_WEIGHT: z.string().default('0.15').transform(Number),
  SMART_MONEY_ADDRESSES: z.string().default(''),
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

export const opportunityWeights = {
  value: config.OPP_VALUE_WEIGHT,
  gas: config.OPP_GAS_WEIGHT,
  mev: config.OPP_MEV_WEIGHT,
  smartMoney: config.OPP_SMART_MONEY_WEIGHT,
  urgency: config.OPP_URGENCY_WEIGHT,
};

export const smartMoneyAddresses = new Set(
  config.SMART_MONEY_ADDRESSES
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(Boolean),
);
