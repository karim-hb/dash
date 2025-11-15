import "dotenv/config";
import { ethers } from "ethers";
import { UiPoolDataProvider } from "@aave/contract-helpers";
import * as aaveAddressBook from "@bgd-labs/aave-address-book";
import Big from "big.js";

import {
  initMongo,
  closeMongo,
  getAssetTrendCollection
} from "@/lib/db/mongo";
import { AssetTrendDocument } from "@/lib/db/types/aave";

const DEFAULT_BLOCK_STEP = Number(process.env.AAVE_HISTORY_BLOCK_STEP ?? 1800);
const DEFAULT_MAX_BLOCKS = Number(process.env.AAVE_HISTORY_MAX_STEPS ?? 50);
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const START_BLOCK = process.env.AAVE_HISTORY_START_BLOCK ? Number(process.env.AAVE_HISTORY_START_BLOCK) : undefined;
const END_BLOCK = process.env.AAVE_HISTORY_END_BLOCK ? Number(process.env.AAVE_HISTORY_END_BLOCK) : undefined;

function buildUiPool(provider: ethers.providers.Provider): UiPoolDataProvider {
  return new UiPoolDataProvider({
    provider,
    uiPoolDataProviderAddress: aaveAddressBook.AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
    chainId: 1
  });
}

function getNumeric(value: unknown): string {
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  if (value && typeof value === "object" && "toString" in value) {
    return (value as { toString(): string }).toString();
  }
  return "0";
}

async function writeSnapshot(
  blockNumber: number,
  blockTimestamp: number,
  reserves: Array<Record<string, unknown>>
): Promise<void> {
  const collection = getAssetTrendCollection();
  const operations = [];

  for (const reserve of reserves) {
    const assetAddress = getNumeric(reserve["underlyingAsset"] ?? reserve["address"] ?? reserve["asset"]).toLowerCase();
    if (!assetAddress) continue;

    const availableLiquidityWei = getNumeric(
      reserve["availableLiquidity"] ??
        reserve["availableLiquidityWei"] ??
        reserve["availableLiquidityTokenBalance"] ??
        reserve["liquidity"]
    );
    const totalStableDebtWei = getNumeric(
      reserve["totalStableDebt"] ??
        reserve["totalStableDebtWei"] ??
        reserve["totalStableBorrow"] ??
        reserve["stableDebt"]
    );
    const totalVariableDebtWei = getNumeric(
      reserve["totalScaledVariableDebt"] ??
        reserve["totalVariableDebt"] ??
        reserve["totalVariableDebtWei"] ??
        reserve["variableDebt"]
    );

    const available = new Big(availableLiquidityWei || "0");
    const stableDebt = new Big(totalStableDebtWei || "0");
    const variableDebt = new Big(totalVariableDebtWei || "0");
    const totalDebt = stableDebt.plus(variableDebt);
    const denominator = totalDebt.plus(available);
    const utilizationPct = denominator.eq(0) ? 0 : totalDebt.div(denominator).times(100).toNumber();

    const latestRecord = await collection.findOne(
      { assetAddress },
      { sort: { blockNumber: -1 }, projection: { availableLiquidityWei: 1 } }
    );

    let liquidityChangePct = 0;
    if (latestRecord) {
      const previousAvailable = new Big(latestRecord.availableLiquidityWei || "0");
      if (previousAvailable.eq(0)) {
        liquidityChangePct = available.eq(0) ? 0 : 100;
      } else {
        liquidityChangePct = available.minus(previousAvailable).div(previousAvailable).times(100).toNumber();
      }
    }

    const documentBase: Omit<AssetTrendDocument, "createdAt" | "updatedAt"> = {
      assetAddress,
      blockNumber,
      timestamp: blockTimestamp,
      availableLiquidityWei,
      totalStableDebtWei,
      totalVariableDebtWei,
      totalDebtWei: totalDebt.toString(),
      liquidityChangePct,
      utilizationPct,
      updateType: "snapshot",
      reason: "historical_snapshot",
      updatedAt: new Date()
    };
    const createdAt = new Date();

    operations.push({
      updateOne: {
        filter: { assetAddress, blockNumber },
        update: {
          $set: {
            ...documentBase,
            updatedAt: documentBase.updatedAt
          },
          $setOnInsert: {
            createdAt
          }
        },
        upsert: true
      }
    });
  }

  if (operations.length > 0) {
    await collection.bulkWrite(operations, { ordered: false });
  }
}

async function main(): Promise<void> {
  await initMongo();
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const poolData = buildUiPool(provider);

  const latestBlock = await provider.getBlockNumber();
  const targetEndBlock = END_BLOCK ?? latestBlock;
  const step = Math.max(DEFAULT_BLOCK_STEP, 1);
  const maxSteps = Math.max(DEFAULT_MAX_BLOCKS, 1);

  let currentBlock = START_BLOCK ?? targetEndBlock - step * maxSteps;
  if (currentBlock < 0) currentBlock = 0;

  const summary: Array<{ blockNumber: number; assets: number }> = [];

  while (currentBlock <= targetEndBlock) {
    const block = await provider.getBlock(currentBlock);
    if (!block) {
      currentBlock += step;
      continue;
    }

    console.log(`Pulling Aave snapshot @ block ${currentBlock} (ts ${block.timestamp})`);
    const { reservesData } = await poolData.getReservesHumanized(
      {
        lendingPoolAddressProvider: aaveAddressBook.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
        chainId: 1
      } as any,
      currentBlock
    );

    await writeSnapshot(currentBlock, block.timestamp, reservesData);
    summary.push({ blockNumber: currentBlock, assets: reservesData.length });
    currentBlock += step;
  }

  console.log("Snapshot summary:", summary);
  await closeMongo();
}

main().catch(async error => {
  console.error("Historical snapshot job failed:", error);
  await closeMongo().catch(() => undefined);
  process.exit(1);
});

