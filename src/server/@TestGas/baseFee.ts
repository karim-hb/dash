export const ELASTICITY_MULTIPLIER = BigInt(2);
export const BASE_FEE_CHANGE_DENOMINATOR = BigInt(8);
export const MIN_BASE_FEE_WEI = BigInt(1_000_000_000); // 1 gwei

export function computeNextBaseFee(
  parentBaseFeePerGas: bigint | number | string,
  parentGasUsed: bigint | number | string,
  parentGasLimit: bigint | number | string
): bigint {
  if (
    parentBaseFeePerGas === null ||
    parentBaseFeePerGas === undefined ||
    parentGasUsed === null ||
    parentGasUsed === undefined ||
    parentGasLimit === null ||
    parentGasLimit === undefined
  ) {
    throw new Error("computeNextBaseFee requires baseFeePerGas, gasUsed, and gasLimit");
  }

  const baseFee = BigInt(parentBaseFeePerGas);
  const gasUsed = BigInt(parentGasUsed);
  const gasLimit = BigInt(parentGasLimit);

  if (gasLimit === BigInt(0)) {
    return baseFee < MIN_BASE_FEE_WEI ? MIN_BASE_FEE_WEI : baseFee;
  }

  const targetGas = gasLimit / ELASTICITY_MULTIPLIER;
  if (targetGas === BigInt(0)) {
    return baseFee < MIN_BASE_FEE_WEI ? MIN_BASE_FEE_WEI : baseFee;
  }

  const gasDelta = gasUsed - targetGas;
  const baseFeeDelta = (baseFee * gasDelta) / (targetGas * BASE_FEE_CHANGE_DENOMINATOR);
  const nextBaseFee = baseFee + baseFeeDelta;

  return nextBaseFee > BigInt(0) ? nextBaseFee : BigInt(0);
}

export function computePendingAdjustedBaseFee({
  parentBaseFee,
  parentGasUsed,
  parentGasLimit,
  pendingGasUsed,
  elasticityDenom = BASE_FEE_CHANGE_DENOMINATOR,
}: {
  parentBaseFee: bigint;
  parentGasUsed: bigint | number | string;
  parentGasLimit: bigint | number | string;
  pendingGasUsed: bigint;
  elasticityDenom?: bigint;
}): bigint {
  const gasLimit = BigInt(parentGasLimit);
  if (gasLimit === BigInt(0)) {
    return clampBaseFee(parentBaseFee);
  }

  const targetGas = gasLimit / ELASTICITY_MULTIPLIER;
  if (targetGas === BigInt(0)) {
    return clampBaseFee(parentBaseFee);
  }

  const gasUsedDelta = BigInt(parentGasUsed) - targetGas;
  const baseFeeDelta = (parentBaseFee * gasUsedDelta) / targetGas / elasticityDenom;

  const pendingDelta = (parentBaseFee * (pendingGasUsed - targetGas)) / targetGas / elasticityDenom;

  const nextBaseFee = parentBaseFee + baseFeeDelta + pendingDelta;
  return nextBaseFee > BigInt(0) ? nextBaseFee : BigInt(0);
}

export function clampBaseFee(value: bigint | number | string | null | undefined, minBaseFee = MIN_BASE_FEE_WEI) {
  if (value === null || value === undefined) {
    return minBaseFee;
  }
  const asBigInt = BigInt(value);
  return asBigInt < minBaseFee ? minBaseFee : asBigInt;
}

