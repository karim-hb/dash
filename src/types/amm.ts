export interface PoolMetadata {
  _id?: string;
  poolAddress: string;
  chainId: number;
  protocol: string;
  factoryAddress: string;
  token0Address: string;
  token1Address: string;
  feeTier?: number;
  creationBlock: number;
  creationTimestamp: Date;
  status: 'active' | 'inactive' | 'dead';
  lastActivityBlock?: number;
  lastActivityTimestamp?: Date;
  liquidityUSD?: number;
  volume24hUSD?: number;
  fees24hUSD?: number; // Added for fees tracking
}

export interface PoolEvent {
  _id?: string;
  poolAddress: string;
  chainId: number;
  eventType: 'Swap' | 'Mint' | 'Burn';
  blockNumber: number;
  logIndex: number;
  timestamp: Date;
  amount0: string;
  amount1: string;
  liquidityChange?: string;
  volumeUSD?: number;
  reserves0?: string;
  reserves1?: string;
  feeUSD?: number;
}

// Custom AMM types (separate from existing PoolMetadata/PoolEvent to avoid conflicts)
export interface AMMPoolMetadata {
  _id?: string;
  poolAddress: string;
  chainId: number;
  protocol: string;
  factoryAddress: string;
  token0Address: string;
  token1Address: string;
  feeTier?: number;
  creationBlock: number;
  creationTimestamp: Date;
  status: 'active' | 'inactive' | 'dead';
  lastActivityBlock?: number;
  lastActivityTimestamp?: Date;
  liquidityUSD?: number;
  volume24hUSD?: number;
  fees24hUSD?: number;
  sqrtPriceX96?: string; // For V3-style pools
  tick?: number; // For V3-style pools
  liquidity?: string; // Current liquidity
}

export interface AMMSwap {
  _id?: string;
  poolAddress: string;
  chainId: number;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: Date;
  sender: string;
  recipient: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96?: string;
  liquidity?: string;
  tick?: number;
  volumeUSD?: number;
  feeUSD?: number;
}

export interface AMMPosition {
  _id?: string;
  positionId?: string; // NFT token ID if using NFT positions
  owner: string;
  poolAddress: string;
  chainId: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string;
  depositedAt: Date;
  lastUpdatedBlock: number;
  lastUpdatedTimestamp: Date;
}

export interface AMMLiquidityEvent {
  _id?: string;
  poolAddress: string;
  chainId: number;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  timestamp: Date;
  eventType: 'Mint' | 'Burn';
  owner: string;
  tickLower?: number;
  tickUpper?: number;
  amount0: string;
  amount1: string;
  liquidity?: string;
}
