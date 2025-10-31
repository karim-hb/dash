import { ethers } from 'ethers';
import amm from '../../catalog/amm.json';
import { getProvider } from '../../modules/provider';
import { updateV3PoolBalances, registerPool, type PoolMeta } from '../../market/ammEngine';
import { computeAmountsForPosition, derivePriceRatio } from './uniswapV3Math';

const POSITION_MANAGER_ADDRESS = (process.env.UNIV3_POSITION_MANAGER || '0xC36442b4a4522E871399CD717aBDD847Ab11FE88').toLowerCase();
const rawFactory = (amm as any).uniswap_v3?.factory || process.env.UNIV3_FACTORY;
const FACTORY_ADDRESS = rawFactory ? (rawFactory as string).toLowerCase() : null;

const POSITION_MANAGER_ABI = [
  'event Mint(address indexed sender, address indexed recipient, uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
  'event IncreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
  'event DecreaseLiquidity(uint256 indexed tokenId, uint128 liquidity, uint256 amount0, uint256 amount1)',
  'event Collect(uint256 indexed tokenId, address recipient, uint256 amount0, uint256 amount1)',
  'event Burn(uint256 indexed tokenId)',
  'function positions(uint256 tokenId) view returns (uint96 nonce, address operator, address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)'
];

const FACTORY_ABI = ['function getPool(address tokenA, address tokenB, uint24 fee) view returns (address pool)'];
const ERC20_ABI = ['function balanceOf(address account) view returns (uint256)'];
const POOL_ABI = [
  'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)'
];

type PositionRecord = {
  tokenId: bigint;
  pool: string;
  token0: string;
  token1: string;
  fee: number;
  tickLower: number;
  tickUpper: number;
  liquidity: bigint;
};

type PoolState = {
  amount0: bigint;
  amount1: bigint;
  sqrtPriceX96: bigint;
  updatedAt: number;
};

let started = false;

const provider = getProvider();
const positionManager = new ethers.Contract(POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI, provider);
const factoryContract = FACTORY_ADDRESS
  ? new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, provider)
  : null;

const positionById = new Map<bigint, PositionRecord>();
const positionsByPool = new Map<string, Map<bigint, PositionRecord>>();
const poolMetas = new Map<string, PoolMeta & { fee: number }>();
const poolState = new Map<string, PoolState>();
const poolContracts = new Map<string, ethers.Contract>();
const tokenContracts = new Map<string, ethers.Contract>();
const recomputeLocks = new Map<string, Promise<void>>();

const MINT_TOPIC = positionManager.interface.getEvent('Mint')!.topicHash;
const INCREASE_TOPIC = positionManager.interface.getEvent('IncreaseLiquidity')!.topicHash;
const DECREASE_TOPIC = positionManager.interface.getEvent('DecreaseLiquidity')!.topicHash;
const BURN_TOPIC = positionManager.interface.getEvent('Burn')!.topicHash;

function getTokenContract(address: string): ethers.Contract {
  const key = address.toLowerCase();
  let contract = tokenContracts.get(key);
  if (!contract) {
    contract = new ethers.Contract(key, ERC20_ABI, provider);
    tokenContracts.set(key, contract);
  }
  return contract;
}

function getPoolContract(address: string): ethers.Contract {
  const key = address.toLowerCase();
  let contract = poolContracts.get(key);
  if (!contract) {
    contract = new ethers.Contract(key, POOL_ABI, provider);
    poolContracts.set(key, contract);
  }
  return contract;
}

async function getPoolAddress(token0: string, token1: string, fee: number): Promise<string | null> {
  if (!factoryContract) return null;
  try {
    const pool = await factoryContract.getPool(token0, token1, fee);
    if (pool && pool !== ethers.ZeroAddress) {
      return pool.toLowerCase();
    }
  } catch (err) {
    console.error('Failed to compute pool address', err);
  }
  return null;
}

function storePosition(position: PositionRecord): void {
  positionById.set(position.tokenId, position);
  const poolKey = position.pool;
  let poolMap = positionsByPool.get(poolKey);
  if (!poolMap) {
    poolMap = new Map();
    positionsByPool.set(poolKey, poolMap);
  }
  poolMap.set(position.tokenId, position);
}

function removePosition(tokenId: bigint): string | null {
  const existing = positionById.get(tokenId);
  if (!existing) return null;
  positionById.delete(tokenId);
  const poolMap = positionsByPool.get(existing.pool);
  if (poolMap) {
    poolMap.delete(tokenId);
    if (poolMap.size === 0) {
      positionsByPool.delete(existing.pool);
    }
  }
  return existing.pool;
}

async function loadPosition(tokenId: bigint): Promise<PositionRecord | null> {
  try {
    const raw = await positionManager.positions(tokenId);
    const liquidity = BigInt(raw[7]);
    const token0 = (raw[2] as string).toLowerCase();
    const token1 = (raw[3] as string).toLowerCase();
    const fee = Number(raw[4]);
    const tickLower = Number(raw[5]);
    const tickUpper = Number(raw[6]);
    const pool = await getPoolAddress(token0, token1, fee);
    if (!pool) return null;

    return {
      tokenId,
      pool,
      token0,
      token1,
      fee,
      tickLower,
      tickUpper,
      liquidity,
    };
  } catch (err) {
    console.error('Failed to load Uniswap V3 position', err);
    return null;
  }
}

async function refreshPosition(tokenId: bigint): Promise<void> {
  const position = await loadPosition(tokenId);
  const previousPool = removePosition(tokenId);
  if (!position || position.liquidity === 0n) {
    if (previousPool) await schedulePoolRecompute(previousPool);
    return;
  }

  storePosition(position);
  await schedulePoolRecompute(position.pool);
}

async function recomputePool(poolAddr: string): Promise<void> {
  const key = poolAddr.toLowerCase();
  const meta = poolMetas.get(key);
  if (!meta) return;

  try {
    await registerPool(meta);
  } catch (err) {
    console.error('Failed to register V3 pool', err);
  }

  const poolMap = positionsByPool.get(key);
  let amount0 = 0n;
  let amount1 = 0n;
  let sqrtPriceX96 = 0n;

  try {
    const poolContract = getPoolContract(key);
    const slot0 = await poolContract.slot0();
    sqrtPriceX96 = BigInt(slot0[0]);

    if (poolMap && poolMap.size > 0) {
      for (const position of poolMap.values()) {
        if (position.liquidity === 0n) continue;
        const { amount0: posAmount0, amount1: posAmount1 } = computeAmountsForPosition(
          sqrtPriceX96,
          position.tickLower,
          position.tickUpper,
          position.liquidity
        );
        amount0 += posAmount0;
        amount1 += posAmount1;
      }
    } else {
      // fallback to direct token balances
      const token0Contract = getTokenContract(meta.token0);
      const token1Contract = getTokenContract(meta.token1);
      const [bal0, bal1] = await Promise.all([
        token0Contract.balanceOf(meta.address),
        token1Contract.balanceOf(meta.address),
      ]);
      amount0 = BigInt(bal0);
      amount1 = BigInt(bal1);
    }
  } catch (err) {
    console.error('Failed to recompute V3 pool amounts', err);
    return;
  }

  poolState.set(key, {
    amount0,
    amount1,
    sqrtPriceX96,
    updatedAt: Date.now(),
  });

  try {
    await updateV3PoolBalances(meta, amount0, amount1);
  } catch (err) {
    console.error('Failed to update V3 pool balances', err);
  }
}

export function schedulePoolRecompute(poolAddr: string): Promise<void> {
  const key = poolAddr.toLowerCase();
  const existing = recomputeLocks.get(key);
  if (existing) {
    return existing;
  }
  const promise = (async () => {
    try {
      await recomputePool(key);
    } catch (err) {
      console.error('V3 recompute error', err);
    } finally {
      recomputeLocks.delete(key);
    }
  })();
  recomputeLocks.set(key, promise);
  return promise;
}

export function registerV3PoolMeta(meta: PoolMeta & { fee: number }): void {
  const key = meta.address.toLowerCase();
  poolMetas.set(key, { ...meta, fee: meta.fee });
  schedulePoolRecompute(key).catch(err => console.error('Failed to schedule recompute on register', err));
}

export function getCachedPoolState(poolAddr: string): PoolState | undefined {
  return poolState.get(poolAddr.toLowerCase());
}

async function processPositionLog(log: ethers.Log): Promise<void> {
  try {
    const parsed = positionManager.interface.parseLog(log);
    const tokenId = BigInt(parsed.args.tokenId ?? parsed.args[2]);
    switch (parsed.name) {
      case 'Mint':
      case 'IncreaseLiquidity':
      case 'DecreaseLiquidity':
        await refreshPosition(tokenId);
        break;
      case 'Burn': {
        const pool = removePosition(tokenId);
        if (pool) await schedulePoolRecompute(pool);
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Failed to process position log', err);
  }
}

async function backfillPositions(): Promise<void> {
  const latest = await provider.getBlockNumber();
  const defaultStart = 12369621; // Uniswap V3 deployment block on mainnet
  const startBlock = Number(process.env.UNIV3_POSITIONS_START_BLOCK || defaultStart);
  const step = Number(process.env.UNIV3_POSITIONS_BACKFILL_STEP || 5000);

  for (let from = startBlock; from <= latest; from += step) {
    const to = Math.min(latest, from + step - 1);
    try {
      const logs = await provider.getLogs({
        address: POSITION_MANAGER_ADDRESS,
        topics: [[MINT_TOPIC, INCREASE_TOPIC, DECREASE_TOPIC, BURN_TOPIC]],
        fromBlock: from,
        toBlock: to,
      });
      if (!logs || logs.length === 0) continue;
      for (const log of logs) {
        await processPositionLog(log);
      }
    } catch (err) {
      console.error(`Failed to backfill positions for range [${from}, ${to}]`, err);
    }
  }
}

function subscribeToEvents(): void {
  provider.on({ address: POSITION_MANAGER_ADDRESS, topics: [MINT_TOPIC] }, (log) => {
    processPositionLog(log).catch(err => console.error('Mint log processing failed', err));
  });

  provider.on({ address: POSITION_MANAGER_ADDRESS, topics: [INCREASE_TOPIC] }, (log) => {
    processPositionLog(log).catch(err => console.error('IncreaseLiquidity log processing failed', err));
  });

  provider.on({ address: POSITION_MANAGER_ADDRESS, topics: [DECREASE_TOPIC] }, (log) => {
    processPositionLog(log).catch(err => console.error('DecreaseLiquidity log processing failed', err));
  });

  provider.on({ address: POSITION_MANAGER_ADDRESS, topics: [BURN_TOPIC] }, (log) => {
    processPositionLog(log).catch(err => console.error('Burn log processing failed', err));
  });
}

export async function initUniswapV3PositionIndexer(): Promise<void> {
  if (started) return;
  started = true;

  if (!FACTORY_ADDRESS) {
    console.warn('Uniswap V3 factory address missing; position indexer disabled');
    return;
  }

  await backfillPositions();
  subscribeToEvents();
}

export function deriveTokenPriceFromState(
  poolAddr: string,
  decimalsToken0: number,
  decimalsToken1: number
): number {
  const state = getCachedPoolState(poolAddr);
  if (!state) return 0;
  return derivePriceRatio(state.sqrtPriceX96, decimalsToken0, decimalsToken1);
}

