// Note: avoid ethers.formatUnits with 96 decimals; use integer scaling instead

export const Q96 = 2n ** 96n;
export const Q192 = Q96 * Q96;
export const MIN_TICK = -887272;
export const MAX_TICK = 887272;

const SQRT_SCALE = 1_000_000_000_000n; // 1e12 precision for sqrt price conversion
const SQRT_SCALE_NUMBER = Number(SQRT_SCALE);

const MAX_UINT256 = (1n << 256n) - 1n;

const POWERS: bigint[] = [
  0xfffcb933bd6fad37aa2d162d1a594001n,
  0xfff97272373d413259a46990580e213an,
  0xfff2e50f5f656932ef12357cf3c7fdccn,
  0xffe5caca7e10e4e61c3624eaa0941cd0n,
  0xffcb9843d60f6159c9db58835c926644n,
  0xff973b41fa98c081472e6896dfb254c0n,
  0xff2ea16466c96a3843ec78b326b52861n,
  0xfe5dee046a99a2a811c461f1969c3053n,
  0xfcbe86c7900a88aedcffc83b479aa3a4n,
  0xf987a7253ac413176f2b074cf7815e54n,
  0xf3392b0822b70005940c7a398e4b70f3n,
  0xe7159475a2c29b7443b29c7fa6e889d9n,
  0xd097f3bdfd2022b8845ad8f792aa5825n,
  0xa9f746462d870fdf8a65dc1f90e061e5n,
  0x70d869a156d2a1b890bb3df62baf32f7n,
  0x31be135f97d08fd981231505542fcfa6n,
  0x9aa508b5b7a84e1c677de54f3e99bc9n,
  0x5d6af8dedb81196699c329225ee604n,
  0x2216e584f5fa1ea926041bedfe98n,
  0x48a170391f7dc42444e8fa2n,
];

function mulDiv(a: bigint, b: bigint, denominator: bigint): bigint {
  return (a * b) / denominator;
}

function mulDivRoundingUp(a: bigint, b: bigint, denominator: bigint): bigint {
  const product = a * b;
  const result = product / denominator;
  if (product % denominator === 0n) return result;
  return result + 1n;
}

function divRoundingUp(numerator: bigint, denominator: bigint): bigint {
  const result = numerator / denominator;
  if (numerator % denominator === 0n) return result;
  return result + 1n;
}

export function getSqrtRatioAtTick(tick: number): bigint {
  if (tick < MIN_TICK || tick > MAX_TICK) {
    throw new Error(`Tick ${tick} out of range`);
  }

  let absTick = tick < 0 ? -tick : tick;
  let ratio = (absTick & 1) !== 0 ? POWERS[0] : 0x100000000000000000000000000000000n;

  for (let i = 1; i < POWERS.length; i++) {
    if ((absTick & (1 << i)) !== 0) {
      ratio = (ratio * POWERS[i]) >> 128n;
    }
  }

  if (tick > 0) {
    ratio = MAX_UINT256 / ratio;
  }

  const roundBitMask = (1n << 32n) - 1n;
  const shifted = ratio >> 32n;
  const hasRemainder = (ratio & roundBitMask) !== 0n;

  return shifted + (hasRemainder ? 1n : 0n);
}

export function getAmount0ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  let sqrtA = sqrtRatioAX96;
  let sqrtB = sqrtRatioBX96;
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];

  if (sqrtA === 0n) throw new Error('sqrtA cannot be zero');

  const numerator = liquidity << 96n;
  const intermediate = mulDivRoundingUp(numerator, sqrtB - sqrtA, sqrtB);
  return divRoundingUp(intermediate, sqrtA);
}

export function getAmount1ForLiquidity(
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): bigint {
  let sqrtA = sqrtRatioAX96;
  let sqrtB = sqrtRatioBX96;
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];
  return mulDiv(liquidity, sqrtB - sqrtA, Q96);
}

export function getAmountsForLiquidity(
  sqrtRatioX96: bigint,
  sqrtRatioAX96: bigint,
  sqrtRatioBX96: bigint,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  let amount0 = 0n;
  let amount1 = 0n;

  let sqrtA = sqrtRatioAX96;
  let sqrtB = sqrtRatioBX96;
  if (sqrtA > sqrtB) [sqrtA, sqrtB] = [sqrtB, sqrtA];

  if (sqrtRatioX96 <= sqrtA) {
    amount0 = getAmount0ForLiquidity(sqrtA, sqrtB, liquidity);
  } else if (sqrtRatioX96 < sqrtB) {
    amount0 = getAmount0ForLiquidity(sqrtRatioX96, sqrtB, liquidity);
    amount1 = getAmount1ForLiquidity(sqrtA, sqrtRatioX96, liquidity);
  } else {
    amount1 = getAmount1ForLiquidity(sqrtA, sqrtB, liquidity);
  }

  return { amount0, amount1 };
}

export function computeAmountsForPosition(
  sqrtRatioX96: bigint,
  tickLower: number,
  tickUpper: number,
  liquidity: bigint
): { amount0: bigint; amount1: bigint } {
  const sqrtLower = getSqrtRatioAtTick(tickLower);
  const sqrtUpper = getSqrtRatioAtTick(tickUpper);
  return getAmountsForLiquidity(sqrtRatioX96, sqrtLower, sqrtUpper, liquidity);
}

export function derivePriceRatio(
  sqrtPriceX96: bigint,
  decimalsToken0: number,
  decimalsToken1: number
): number {
  if (sqrtPriceX96 === 0n) return 0;
  // Convert Q64.96 to float with fixed precision to avoid 96-decimal formatter limits
  const scaledSqrt = (sqrtPriceX96 * SQRT_SCALE + (Q96 / 2n)) / Q96; // rounding
  const sqrt = Number(scaledSqrt) / SQRT_SCALE_NUMBER;
  if (!isFinite(sqrt) || sqrt === 0) return 0;
  const ratio = sqrt * sqrt;
  const decimalAdjust = Math.pow(10, decimalsToken0 - decimalsToken1);
  return ratio * decimalAdjust;
}

