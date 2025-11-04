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
