// Store recent AMM reserves for price routing

type V2Reserves = {
  token0: string;
  token1: string;
  reserve0: bigint;
  reserve1: bigint;
  updatedAt: number;
};

const v2ReservesByPool = new Map<string, V2Reserves>();
const poolsByTokenPair = new Map<string, Set<string>>(); // key: tokenA|tokenB -> set of pool addresses

function norm(a: string): string { return a.toLowerCase(); }

function pairKey(a: string, b: string): string {
  const aN = norm(a), bN = norm(b);
  return aN < bN ? `${aN}|${bN}` : `${bN}|${aN}`;
}

export function setV2Reserves(pool: string, token0: string, token1: string, reserve0: bigint, reserve1: bigint) {
  const key = norm(pool);
  v2ReservesByPool.set(key, { token0: norm(token0), token1: norm(token1), reserve0, reserve1, updatedAt: Date.now() });
  const pk = pairKey(token0, token1);
  let s = poolsByTokenPair.get(pk);
  if (!s) { s = new Set<string>(); poolsByTokenPair.set(pk, s); }
  s.add(key);
}

export function getV2PoolsForPair(a: string, b: string): string[] {
  const pk = pairKey(a, b);
  const s = poolsByTokenPair.get(pk);
  return s ? Array.from(s) : [];
}

export function getV2Reserves(pool: string): V2Reserves | undefined {
  return v2ReservesByPool.get(norm(pool));
}


