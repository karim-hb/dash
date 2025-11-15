// server.ts
import { ethers } from "ethers";
import { UiPoolDataProvider } from "@aave/contract-helpers";
import Big from "big.js";
import * as aaveAddressBook from "@bgd-labs/aave-address-book";
import {
  deriveAaveMetrics,
  computeVelocityMetrics,
  computeRiskScore,
  buildVirtualPool,
  type DerivedAaveMetrics,
  type VelocityMetrics,
  type VirtualPool,
  type RiskScore,
  type RawAssetMetrics
} from "./aaveMetrics";
import { getMetricSettings } from "./config/metrics";
import {
  initMongo,
  closeMongo,
  getAssetTrendCollection,
  getAssetMetricsCollection
} from "@/lib/db/mongo";
import { AssetTrendUpdateType, AssetTrendDocument, AssetMetricsDocument } from "@/lib/db/types/aave";

/**
 * Single-file test monitor + analysis for Aave V3 reserves.
 * - Connects via WS (events) + HTTP (queries)
 * - Fetches UiPoolDataProvider.getReservesHumanized()
 * - Prints a readable per-reserve block
 * - Produces a small "analyze" summary (totals, top N, utilization, flags)
 *
 * Drop into your project and run (ts-node / compile -> node).
 */

/* --------------- config --------------- */
const RPC_HTTP_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const RPC_WS_URL =
  process.env.RPC_WS_URL ||
  process.env.WS_URL ||
  inferWsUrl(RPC_HTTP_URL) ||
  "ws://127.0.0.1:8545";
const CHAIN_ID = 1;

const UI_POOL_DATA_PROVIDER = aaveAddressBook.AaveV3Ethereum.UI_POOL_DATA_PROVIDER;
const POOL_ADDRESSES_PROVIDER = aaveAddressBook.AaveV3Ethereum.POOL_ADDRESSES_PROVIDER;
const POOL_CORE = aaveAddressBook.AaveV3Ethereum.POOL;

const FLASH_LOAN_PROTOCOL_FEE = 0.0009; // 0.09%
const FLASH_LOAN_SAMPLE_AMOUNT = (() => {
  const raw = process.env.FLASH_LOAN_AMOUNT;
  if (!raw) return 1_000_000;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1_000_000;
})();

const METRIC_SETTINGS = getMetricSettings();

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    void closeMongo()
      .catch(() => undefined)
      .finally(() => {
        process.exit(0);
      });
  });
}

type ReserveSnapshot = Array<Record<string, unknown>>;

interface ReserveAnalyticsRow {
  reserve: Record<string, unknown>;
  metrics: DerivedAaveMetrics;
  velocity: VelocityMetrics;
  risk: RiskScore;
  virtualPool: VirtualPool;
  decimals?: number;
}

interface PersistContext {
  reason: string;
  blockNumber: number;
  timestamp: number;
  updateType: AssetTrendUpdateType;
  eventName?: string;
  txHash?: string;
}

function inferWsUrl(url: string): string | undefined {
  if (url.startsWith("http://")) return url.replace("http://", "ws://");
  if (url.startsWith("https://")) return url.replace("https://", "wss://");
  return undefined;
}

/* --------------- helpers --------------- */

function isBN(x: any): boolean {
  return !!(x && typeof x === "object" && ("_hex" in x || ("toHexString" in x && typeof x.toHexString === "function")));
}

/**
 * Attempt to return a humanized numeric string for an amount.
 * - If amount is BigNumber or an integer string and decimals are provided => formatUnits
 * - If amount is a decimal string (contains '.') => return as-is
 * - If amount is number => convert to string
 * - If missing/zero-like => "0"
 */
function formatAmount(amount: any, decimals?: number | string): string {
  if (amount === null || amount === undefined) return "0";
  // if BigNumber
  if (isBN(amount)) {
    try {
      if (decimals !== undefined) {
        return ethers.utils.formatUnits(amount as ethers.BigNumber, Number(decimals));
      }
      return (amount as ethers.BigNumber).toString();
    } catch {
      return (amount as ethers.BigNumber).toString();
    }
  }
  if (typeof amount === "string") {
    const trimmed = amount.trim();
    if (trimmed === "" || trimmed === "0") return "0";
    if (trimmed.includes(".")) {
      // already humanized decimal string
      return trimmed;
    }
    // integer-like string (no dot). If decimals is known and string looks like raw integer -> formatUnits
    if (/^\d+$/.test(trimmed) && decimals !== undefined) {
      // heuristic: if length > decimals (i.e. not tiny), it's possibly raw integer in base units
      if (trimmed.length > Math.max(0, Number(decimals))) {
        try {
          return ethers.utils.formatUnits(trimmed, Number(decimals));
        } catch {
          return trimmed;
        }
      }
      // otherwise it's probably already humanized integer
      return trimmed;
    }
    return trimmed;
  }
  if (typeof amount === "number") {
    if (Number.isFinite(amount)) return String(amount);
    return String(amount);
  }
  try {
    return String(amount);
  } catch {
    return "0";
  }
}

/** Convert a humanized amount (string) into a float for lightweight analysis.
 * Safe: if extremely large or not parseable returns 0.
 */
function parseHumanFloat(h: string): number {
  if (!h && h !== "0") return 0;
  // remove commas, safe chars
  const cleaned = String(h).replace(/,/g, "");
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function formatNumber(value: number, fractionDigits = 2): string {
  if (!Number.isFinite(value)) return "0";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return value.toExponential(2);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits
  });
}

/**
 * Format rates. Many Aave fields are represented as RAY (1e27) integers,
 * or already humanized decimals (e.g., "0.0324"). Try both.
 * Return percent string, e.g. "3.2400%".
 */
function formatRate(rate: any): string {
  if (rate === null || rate === undefined) return "0.0000%";
  if (isBN(rate)) {
    try {
      const human = Number(ethers.utils.formatUnits(rate as ethers.BigNumber, 27)); // RAY -> decimal
      if (Number.isFinite(human)) return (human * 100).toFixed(4) + "%";
    } catch {
      return (rate as ethers.BigNumber).toString();
    }
  }
  if (typeof rate === "string") {
    const t = rate.trim();
    if (t === "" || t === "0") return "0.0000%";
    if (t.includes(".")) {
      const num = Number(t);
      if (!Number.isNaN(num)) return (num * 100).toFixed(4) + "%";
      // if it's a huge integer string, try formatUnits as RAY
      if (/^\d+$/.test(t) && t.length > 20) {
        try {
          const human = Number(ethers.utils.formatUnits(t, 27));
          if (!Number.isNaN(human)) return (human * 100).toFixed(4) + "%";
        } catch {}
      }
      return t;
    }
    // integer string -> try RAY decode
    if (/^\d+$/.test(t)) {
      try {
        const human = Number(ethers.utils.formatUnits(t, 27));
        if (!Number.isNaN(human)) return (human * 100).toFixed(4) + "%";
      } catch {}
      return t;
    }
    return t;
  }
  if (typeof rate === "number") return (rate * 100).toFixed(4) + "%";
  try {
    return String(rate);
  } catch {
    return "0.0000%";
  }
}

async function getBlockTimestamp(
  provider: ethers.providers.Provider,
  blockNumber: number
): Promise<number> {
  try {
    const block = await provider.getBlock(blockNumber);
    if (block?.timestamp) return block.timestamp;
  } catch (error) {
    console.warn(`Failed to fetch block ${blockNumber} timestamp`, error);
  }
  return Math.floor(Date.now() / 1000);
}

function latestTrendValue(row: ReserveAnalyticsRow): number {
  const history = row.metrics.trend?.history;
  if (history && history.length > 0) {
    const last = history[history.length - 1];
    if (typeof last?.liquidityChangePct === "number") {
      return last.liquidityChangePct;
    }
  }
  return row.velocity.liquidityChangeRate ?? 0;
}

function docToDerivedMetrics(doc: AssetMetricsDocument): DerivedAaveMetrics {
  return {
    assetAddress: doc.assetAddress,
    symbol: undefined,
    availableLiquidityWei: doc.availableLiquidityWei,
    effectiveLiquidityWei: doc.effectiveLiquidityWei,
    totalStableDebtWei: doc.totalStableDebtWei,
    totalVariableDebtWei: doc.totalVariableDebtWei,
    totalDebtWei: doc.totalDebtWei,
    safetyBufferWei: doc.safetyBufferWei,
    utilizationPct: doc.utilizationPct,
    confidenceScore: doc.confidenceScore ?? 1,
    confidenceBreakdown:
      doc.confidenceBreakdown ?? {
        pool: 0.6,
        dataProvider: 0.3,
        debtMetrics: 0.1
      },
    fallbackActive: doc.fallbackActive ?? false,
    lastUpdateTimestamp: doc.timestamp,
    trend: doc.trendHistory ? { history: doc.trendHistory } : { history: [] }
  };
}

async function persistAnalyticsRows(
  rows: ReserveAnalyticsRow[],
  ctx: PersistContext
): Promise<void> {
  if (!rows.length) return;

  const trendCollection = getAssetTrendCollection();
  const metricsCollection = getAssetMetricsCollection();
  const now = new Date();

  const trendOps = rows.map(row => {
    const assetAddress = row.metrics.assetAddress.toLowerCase();
    return {
      updateOne: {
        filter: {
          assetAddress,
          blockNumber: ctx.blockNumber,
          updateType: ctx.updateType,
          reason: ctx.reason
        },
        update: {
          $set: {
            assetAddress,
            blockNumber: ctx.blockNumber,
            timestamp: ctx.timestamp,
            availableLiquidityWei: row.metrics.availableLiquidityWei,
            totalStableDebtWei: row.metrics.totalStableDebtWei,
            totalVariableDebtWei: row.metrics.totalVariableDebtWei,
            totalDebtWei: row.metrics.totalDebtWei,
            liquidityChangePct: latestTrendValue(row),
            utilizationPct: row.metrics.utilizationPct,
            updateType: ctx.updateType,
            eventName: ctx.eventName,
            txHash: ctx.txHash,
            reason: ctx.reason,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        upsert: true
      }
    };
  });

  const metricsOps = rows.map(row => {
    const assetAddress = row.metrics.assetAddress.toLowerCase();
    return {
      updateOne: {
        filter: { assetAddress },
        update: {
          $set: {
            assetAddress,
            blockNumber: ctx.blockNumber,
            timestamp: ctx.timestamp,
            availableLiquidityWei: row.metrics.availableLiquidityWei,
            effectiveLiquidityWei: row.metrics.effectiveLiquidityWei,
            totalStableDebtWei: row.metrics.totalStableDebtWei,
            totalVariableDebtWei: row.metrics.totalVariableDebtWei,
            totalDebtWei: row.metrics.totalDebtWei,
            safetyBufferWei: row.metrics.safetyBufferWei,
            utilizationPct: row.metrics.utilizationPct,
            liquidityChangeRate: row.velocity.liquidityChangeRate,
            utilizationTrendSlope: row.velocity.utilizationTrendSlope,
            recoveryTimeEst: row.velocity.recoveryTimeEst ?? null,
            confidenceScore: row.metrics.confidenceScore,
            confidenceBreakdown: row.metrics.confidenceBreakdown,
            riskScore: { score: row.risk.score, flags: row.risk.flags },
            trendHistory: row.metrics.trend?.history ?? [],
            fallbackActive: row.metrics.fallbackActive,
            updatedAt: now
          },
          $setOnInsert: {
            createdAt: now
          }
        },
        upsert: true
      }
    };
  });

  if (trendOps.length) {
    await trendCollection.bulkWrite(trendOps, { ordered: false });
  }
  if (metricsOps.length) {
    await metricsCollection.bulkWrite(metricsOps, { ordered: false });
  }
}

interface PoolEventContext {
  eventName: string;
  reserve: string;
  amount?: ethers.BigNumberish;
  premium?: ethers.BigNumberish;
  blockNumber: number;
  txHash: string;
  timestamp: number;
}

async function recordEventTrend(context: PoolEventContext): Promise<void> {
  const metricsCollection = getAssetMetricsCollection();
  const trendCollection = getAssetTrendCollection();
  const assetAddress = context.reserve.toLowerCase();
  const metrics = await metricsCollection.findOne({ assetAddress });
  if (!metrics) return;

  const now = new Date();
  const amount = context.amount ? new Big(context.amount.toString()) : new Big(0);
  const premium = context.premium ? new Big(context.premium.toString()) : new Big(0);

  let liquidityDelta = new Big(0);
  let variableDebtDelta = new Big(0);

  switch (context.eventName) {
    case "Deposit":
      liquidityDelta = amount;
      break;
    case "Withdraw":
      liquidityDelta = amount.times(-1);
      break;
    case "Borrow":
      liquidityDelta = amount.times(-1);
      variableDebtDelta = amount;
      break;
    case "Repay":
      liquidityDelta = amount;
      variableDebtDelta = amount.times(-1);
      break;
    case "FlashLoan":
      // Treat flash loans as net-zero for liquidity; premium represents protocol fee
      liquidityDelta = new Big(0);
      break;
    case "LiquidationCall":
      // Approximate: assume liquidity increases by debt covered
      liquidityDelta = amount;
      break;
    default:
      break;
  }

  const availableBase = new Big(metrics.availableLiquidityWei || "0");
  const stableDebtBase = new Big(metrics.totalStableDebtWei || "0");
  const variableDebtBase = new Big(metrics.totalVariableDebtWei || "0");

  const newAvailable = availableBase.plus(liquidityDelta);
  let newVariableDebt = variableDebtBase.plus(variableDebtDelta);
  if (newVariableDebt.lt(0)) {
    newVariableDebt = new Big(0);
  }
  const totalDebt = stableDebtBase.plus(newVariableDebt);
  const denominator = totalDebt.plus(newAvailable);

  const utilizationPct = denominator.eq(0)
    ? 0
    : totalDebt.div(denominator).times(100).toNumber();
  const liquidityChangePct = availableBase.eq(0)
    ? liquidityDelta.eq(0)
      ? 0
      : 100
    : liquidityDelta.div(availableBase).times(100).toNumber();

  const documentUpdate = {
    assetAddress,
    blockNumber: context.blockNumber,
    timestamp: context.timestamp,
    availableLiquidityWei: newAvailable.toString(),
    totalStableDebtWei: stableDebtBase.toString(),
    totalVariableDebtWei: newVariableDebt.toString(),
    totalDebtWei: totalDebt.toString(),
    liquidityChangePct,
    utilizationPct,
    updateType: "event" as AssetTrendUpdateType,
    eventName: context.eventName,
    txHash: context.txHash,
    reason: "pool_event",
    liquidityDeltaWei: liquidityDelta.toString(),
    totalVariableDebtDeltaWei: variableDebtDelta.toString(),
    premiumWei: premium.toString(),
    updatedAt: now
  } satisfies Partial<AssetTrendDocument>;

  await trendCollection.updateOne(
    {
      assetAddress,
      blockNumber: context.blockNumber,
      txHash: context.txHash,
      updateType: "event"
    },
    {
      $set: documentUpdate,
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );
}
/* --------------- main monitor + analysis --------------- */

async function main() {
  await initMongo();
  const wsProvider = new ethers.providers.WebSocketProvider(RPC_WS_URL);
  const httpProvider = new ethers.providers.JsonRpcProvider(RPC_HTTP_URL);
  console.log(`Connected to RPC (ws):  ${RPC_WS_URL}`);
  console.log(`Connected to RPC (http): ${RPC_HTTP_URL}`);

  const poolData = new UiPoolDataProvider({
    uiPoolDataProviderAddress: UI_POOL_DATA_PROVIDER,
    provider: httpProvider,
    chainId: CHAIN_ID
  });

  let latestReserves: ReserveSnapshot | null = null;
  let latestDerivedMetrics: DerivedAaveMetrics[] = [];
  let latestVirtualPools: VirtualPool[] = [];
  let inflight = false;

  try {
    const metricsDocs = await getAssetMetricsCollection()
      .find(
        {},
        {
          projection: {
            assetAddress: 1,
            availableLiquidityWei: 1,
            effectiveLiquidityWei: 1,
            totalStableDebtWei: 1,
            totalVariableDebtWei: 1,
            totalDebtWei: 1,
            safetyBufferWei: 1,
            utilizationPct: 1,
            confidenceScore: 1,
            confidenceBreakdown: 1,
            fallbackActive: 1,
            timestamp: 1,
            trendHistory: 1
          }
        }
      )
      .toArray();
    latestDerivedMetrics = metricsDocs.map(docToDerivedMetrics);
  } catch (hydrateError) {
    console.warn("Failed to hydrate derived metrics cache from Mongo:", hydrateError);
  }

  const printReserve = (row: ReserveAnalyticsRow) => {
    const { reserve, metrics, velocity, risk, virtualPool, decimals } = row;
    const underlyingAsset =
      (reserve["underlyingAsset"] ||
        reserve["underlyingAssetAddress"] ||
        reserve["address"] ||
        reserve["asset"] ||
        metrics.assetAddress ||
        "n/a") as string;
    const symbol =
      metrics.symbol ||
      (reserve["symbol"] || reserve["tokenSymbol"] || reserve["name"] || "UNKNOWN");
    const name = (reserve["name"] || reserve["tokenName"] || "") as string;

    // rates from reserve snapshot (already humanized strings / rays)
    const liquidityRate = reserve["liquidityRate"] ?? reserve["liquidity_rate"] ?? reserve["supplyRate"] ?? null;
    const stableBorrowRate =
      reserve["stableBorrowRate"] ?? reserve["stable_rate"] ?? reserve["stableBorrowRateHumanized"] ?? null;
    const variableBorrowRate =
      reserve["variableBorrowRate"] ?? reserve["variable_rate"] ?? reserve["variableBorrowRateHumanized"] ?? null;

    const availableStr = formatAmount(metrics.availableLiquidityWei, decimals);
    const effectiveStr = formatAmount(metrics.effectiveLiquidityWei, decimals);
    const stableDebtStr = formatAmount(metrics.totalStableDebtWei, decimals);
    const variableDebtStr = formatAmount(metrics.totalVariableDebtWei, decimals);
    const totalDebtStr = formatAmount(metrics.totalDebtWei, decimals);
    const safetyBufferStr = formatAmount(metrics.safetyBufferWei, decimals);

    const flashLoanCapacity = parseHumanFloat(effectiveStr);
    const sampleNotional = Math.min(flashLoanCapacity, FLASH_LOAN_SAMPLE_AMOUNT);
    const flashFeeSample = sampleNotional * FLASH_LOAN_PROTOCOL_FEE;

    console.log("------------------------------------------------------------");
    console.log(`${symbol} — ${name}`);
    console.log("  underlyingAsset        :", underlyingAsset);
    if (decimals !== undefined) console.log("  decimals               :", decimals);
    console.log("  availableLiquidity     :", availableStr);
    console.log("  effectiveLiquidity     :", effectiveStr);
    console.log("  safetyBuffer           :", safetyBufferStr);
    console.log("  totalStableDebt        :", stableDebtStr);
    console.log("  totalVariableDebt      :", variableDebtStr);
    console.log("  totalDebt              :", totalDebtStr);
    console.log("  utilizationPct         :", `${metrics.utilizationPct.toFixed(2)}%`);
    console.log("  liquidityRate          :", formatRate(liquidityRate));
    console.log("  stableBorrowRate       :", stableBorrowRate ? formatRate(stableBorrowRate) : "0.0000%");
    console.log("  variableBorrowRate     :", variableBorrowRate ? formatRate(variableBorrowRate) : "0.0000%");
    console.log("  confidenceScore        :", metrics.confidenceScore.toFixed(2));
    console.log("  confidenceBreakdown    :", metrics.confidenceBreakdown);
    console.log("  fallbackActive         :", metrics.fallbackActive);
    console.log(
      "  riskScore              :",
      `${risk.score.toFixed(2)}${risk.flags.length ? ` (flags: ${risk.flags.join(", ")})` : ""}`
    );
    console.log(
      "  velocityEWMA           :",
      `Δliq ${velocity.liquidityChangeRate}% | slope ${velocity.utilizationTrendSlope}% | recovery ${velocity.recoveryTimeEst ?? "n/a"}`
    );
    console.log("  virtualPoolId          :", virtualPool.poolId);
    console.log("  flashLoanFeeRate       :", "0.09% (protocol)");
    if (flashLoanCapacity > 0) {
      console.log(
        "  flashLoanCapacity      :",
        `${formatNumber(flashLoanCapacity)} (max borrowable in one tx)`
      );
      console.log(
        "  flashLoanFeeSample     :",
        `${formatNumber(sampleNotional)} -> fee ${formatNumber(flashFeeSample, 6)}`
      );
    } else {
      console.log("  flashLoanCapacity      :", "Insufficient liquidity");
    }
    console.log("  flashLoanAPRImpact     :", "Negligible (single-transaction borrow)");
    console.log("  lastUpdateTimestamp    :", metrics.lastUpdateTimestamp ?? "n/a");
  };

  const analyzeAndPrint = (rows: ReserveAnalyticsRow[]) => {
    const analyticsRows = rows.map(row => {
      const decimals = row.decimals;
      const available = parseHumanFloat(formatAmount(row.metrics.availableLiquidityWei, decimals));
      const effective = parseHumanFloat(formatAmount(row.metrics.effectiveLiquidityWei, decimals));
      const totalBorrowed = parseHumanFloat(formatAmount(row.metrics.totalDebtWei, decimals));
      const flashable = parseHumanFloat(formatAmount(row.virtualPool.flashableLiquidityWei, decimals));
      return {
        symbol:
          row.metrics.symbol ||
          (row.reserve["symbol"] || row.reserve["name"] || "UNKNOWN"),
        available,
        effective,
        totalBorrowed,
        utilization: row.metrics.utilizationPct,
        riskScore: row.risk.score,
        riskFlags: row.risk.flags.join(", "),
        confidence: row.metrics.confidenceScore,
        flashable,
        fallbackActive: row.metrics.fallbackActive,
        liquidityChangeRate: row.velocity.liquidityChangeRate
      };
    });

    const totals = analyticsRows.reduce(
      (acc, cur) => {
        acc.totalAvailable += cur.available;
        acc.totalEffective += cur.effective;
        acc.totalBorrowed += cur.totalBorrowed;
        if (cur.totalBorrowed > 0) acc.assetsWithBorrow += 1;
        if (cur.riskScore >= 0.7) acc.highRiskAssets += 1;
        if (cur.fallbackActive) acc.fallbackAssets += 1;
        return acc;
      },
      {
        totalAvailable: 0,
        totalEffective: 0,
        totalBorrowed: 0,
        assetsWithBorrow: 0,
        highRiskAssets: 0,
        fallbackAssets: 0
      }
    );

    const topByEffective = [...analyticsRows]
      .sort((a, b) => b.effective - a.effective)
      .slice(0, 10);
    const topByUtilization = [...analyticsRows]
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 10);
    const topByRisk = [...analyticsRows]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const mostlyIdle = analyticsRows.filter(r => r.utilization < 1 && r.effective > 1_000);

    console.log("\n================= ANALYSIS =================");
    console.log(`Reserves scanned: ${analyticsRows.length}`);
    console.log(`Total available (human units sum): ${formatNumber(totals.totalAvailable)}`);
    console.log(`Total effective liquidity: ${formatNumber(totals.totalEffective)}`);
    console.log(`Total borrowed (sum stable+variable): ${formatNumber(totals.totalBorrowed)}`);
    console.log(`Assets currently borrowed > 0: ${totals.assetsWithBorrow}`);
    console.log(`High-risk assets (score ≥ 0.7): ${totals.highRiskAssets}`);
    console.log(`Assets with fallback data active: ${totals.fallbackAssets}`);
    console.log(
      `Flash loan protocol fee (Aave v3 Ethereum): ${(FLASH_LOAN_PROTOCOL_FEE * 100).toFixed(2)}%`
    );
    console.log(
      `Sample flash loan cost: ${formatNumber(FLASH_LOAN_SAMPLE_AMOUNT)} -> fee ${formatNumber(
        FLASH_LOAN_SAMPLE_AMOUNT * FLASH_LOAN_PROTOCOL_FEE,
        6
      )}`
    );
    console.log("\nTop 10 by effective flashable liquidity:");
    console.table(
      topByEffective.map(r => ({
        symbol: r.symbol,
        effective: formatNumber(r.effective),
        flashable: formatNumber(r.flashable),
        utilization: r.utilization.toFixed(2),
        risk: r.riskScore.toFixed(2)
      }))
    );
    console.log("\nTop 10 by utilization %:");
    console.table(
      topByUtilization.map(r => ({
        symbol: r.symbol,
        utilization_pct: r.utilization.toFixed(2),
        effective: formatNumber(r.effective),
        risk: r.riskScore.toFixed(2)
      }))
    );
    console.log("\nTop 10 by risk score:");
    console.table(
      topByRisk.map(r => ({
        symbol: r.symbol,
        risk: r.riskScore.toFixed(2),
        riskFlags: r.riskFlags || "none",
        utilization_pct: r.utilization.toFixed(2),
        liquidityChangeRate: r.liquidityChangeRate
      }))
    );

    console.log(`\nAssets with utilization <1% and effective liquidity > 1k (count): ${mostlyIdle.length}`);
    if (mostlyIdle.length > 0) {
      console.log("Examples (symbol, effective, utilization):");
      console.table(
        mostlyIdle.slice(0, 10).map(r => ({
          symbol: r.symbol,
          effective: formatNumber(r.effective),
          util_pct: r.utilization.toFixed(3)
        }))
      );
    }

    console.log("========== end analysis ==========\n");
  };

  const fetchReserves = async (reason: string, trigger?: unknown) => {
    if (inflight) return;
    inflight = true;
    try {
      console.log(`[${reason}] Fetching reserves data…`);
      const { reservesData } = await poolData.getReservesHumanized({
        lendingPoolAddressProvider: POOL_ADDRESSES_PROVIDER
      });
      latestReserves = reservesData as ReserveSnapshot;
      latestDerivedMetrics = [];
      latestVirtualPools = [];
      console.log(`[${reason}] Snapshot contains ${reservesData.length} reserves`);

      const analyticsRows: ReserveAnalyticsRow[] = [];
      const metricsCollection = getAssetMetricsCollection();

      for (const reserveEntry of reservesData) {
        try {
          const reserve = reserveEntry as Record<string, unknown>;
          const decimals =
            typeof reserve["decimals"] === "number"
              ? reserve["decimals"]
              : reserve["decimals"]
              ? Number(reserve["decimals"])
              : undefined;

          const assetAddress = (reserve["underlyingAsset"] || reserve["address"] || reserve["asset"] || "") as string;
          const symbol = (reserve["symbol"] || reserve["tokenSymbol"] || reserve["name"]) as string | undefined;

          const lastUpdateRaw = reserve["lastUpdateTimestamp"] ?? reserve["lastUpdate"] ?? reserve["lastUpdateAt"];

          const rawMetrics: RawAssetMetrics = {
            availableLiquidityWei:
              (reserve["availableLiquidity"] ??
                reserve["availableLiquidityWei"] ??
                reserve["availableLiquidityTokenBalance"] ??
                reserve["liquidity"]) as string | number | bigint | { toString(): string } | undefined,
            liquidity: reserve["liquidity"] as string | number | bigint | { toString(): string } | undefined,
            totalStableDebtWei:
              (reserve["totalStableDebt"] ??
                reserve["totalStableDebtWei"] ??
                reserve["totalStableBorrow"] ??
                reserve["stableDebt"]) as string | number | bigint | { toString(): string } | undefined,
            totalVariableDebtWei:
              (reserve["totalScaledVariableDebt"] ??
                reserve["totalVariableDebt"] ??
                reserve["totalVariableDebtWei"] ??
                reserve["variableDebt"]) as string | number | bigint | { toString(): string } | undefined,
            fallbackUsed: Boolean(reserve["isFallbackData"] ?? reserve["isFallbackActive"]),
            lastUpdate:
              typeof lastUpdateRaw === "number" || typeof lastUpdateRaw === "string" ? lastUpdateRaw : undefined
          } as const;

          const trendHistory = Array.isArray(reserve["trendHistory"])
            ? {
                history: (reserve["trendHistory"] as Array<{ liquidityChangePct: number }>).filter(
                  point => typeof point?.liquidityChangePct === "number"
                )
              }
            : undefined;

          const metrics = deriveAaveMetrics(
            {
              assetAddress,
              symbol,
              rawMetrics,
              trend: trendHistory
            },
            METRIC_SETTINGS
          );

          // Attach single-step liquidity trend so velocity metrics have input
          try {
            let prevMetrics = latestDerivedMetrics.find(
              m => m.assetAddress && m.assetAddress.toLowerCase() === assetAddress.toLowerCase()
            );

            if (!prevMetrics) {
              const storedMetrics = await metricsCollection.findOne(
                { assetAddress: assetAddress.toLowerCase() },
                {
                  projection: {
                    assetAddress: 1,
                    availableLiquidityWei: 1,
                    effectiveLiquidityWei: 1,
                    totalStableDebtWei: 1,
                    totalVariableDebtWei: 1,
                    totalDebtWei: 1,
                    safetyBufferWei: 1,
                    utilizationPct: 1,
                    confidenceScore: 1,
                    confidenceBreakdown: 1,
                    fallbackActive: 1,
                    timestamp: 1,
                    trendHistory: 1
                  }
                }
              );
              if (storedMetrics) {
                prevMetrics = docToDerivedMetrics(storedMetrics);
              }
            }

            const prevAvailable = prevMetrics
              ? parseHumanFloat(formatAmount(prevMetrics.availableLiquidityWei, decimals))
              : null;
            const currentAvailable = parseHumanFloat(formatAmount(metrics.availableLiquidityWei, decimals));

            const history =
              prevMetrics?.trend?.history && prevMetrics.trend.history.length
                ? [...prevMetrics.trend.history].slice(-15)
                : [];

            let changePct = 0;
            if (prevAvailable === null) {
              metrics.trend = { history: [] };
            } else if (prevAvailable === 0) {
              changePct = currentAvailable === 0 ? 0 : 100;
              history.push({
                liquidityChangePct: Number(changePct.toFixed(6)),
                timestamp: Date.now()
              });
              metrics.trend = { history };
            } else {
              changePct = ((currentAvailable - prevAvailable) / prevAvailable) * 100;
              history.push({
                liquidityChangePct: Number(changePct.toFixed(6)),
                timestamp: Date.now()
              });
              metrics.trend = { history };
            }
          } catch (trendErr) {
            metrics.trend = { history: [] };
            console.warn("Trend derivation failed for", assetAddress, trendErr);
          }

          const velocity = computeVelocityMetrics(metrics, METRIC_SETTINGS);
          const risk = computeRiskScore(
            metrics,
            { liquidityChangeRate: velocity.liquidityChangeRate },
            METRIC_SETTINGS
          );
          const virtualPool = buildVirtualPool(metrics);

          const row: ReserveAnalyticsRow = {
            reserve,
            metrics,
            velocity,
            risk,
            virtualPool,
            decimals
          };

          analyticsRows.push(row);
          printReserve(row);
        } catch (err) {
          console.error("Error printing reserve:", err);
        }
      }

      latestDerivedMetrics = analyticsRows.map(row => row.metrics);
      latestVirtualPools = analyticsRows.map(row => row.virtualPool);

      try {
        const derivedBlock =
          typeof (trigger as { blockNumber?: number })?.blockNumber === "number"
            ? (trigger as { blockNumber: number }).blockNumber
            : await httpProvider.getBlockNumber();
        const timestampHint = (trigger as { eventTimestamp?: number })?.eventTimestamp;
        const derivedTimestamp =
          typeof timestampHint === "number"
            ? timestampHint
            : await getBlockTimestamp(httpProvider, derivedBlock);

        await persistAnalyticsRows(analyticsRows, {
          reason,
          blockNumber: derivedBlock,
          timestamp: derivedTimestamp,
          updateType: reason === "event" ? "event" : "snapshot",
          eventName: (trigger as { eventName?: string })?.eventName,
          txHash: (trigger as { txHash?: string })?.txHash
        });
      } catch (persistError) {
        console.error("Failed to persist analytics rows:", persistError);
      }

      // Run single-file analysis
      try {
        analyzeAndPrint(analyticsRows);
      } catch (err) {
        console.error("Analysis failed:", err);
      }

      if (trigger && typeof trigger === "object") {
        console.log(`[${reason}] Trigger details:`, trigger);
      }
    } catch (error) {
      console.error(`[${reason}] Failed to fetch reserves`, error);
    } finally {
      inflight = false;
    }
  };

  wsProvider.on("block", blockNumber => {
    console.log(`New block detected: ${blockNumber}`);
    void fetchReserves("block", { blockNumber });
  });

  const POOL_ABI = [
    "event ReserveDataUpdated(address indexed reserve,uint256 liquidityRate,uint256 stableBorrowRate,uint256 variableBorrowRate,uint128 liquidityIndex,uint128 variableBorrowIndex)",
    "event Deposit(address indexed reserve,address user,address onBehalfOf,uint256 amount,uint16 referralCode)",
    "event Withdraw(address indexed reserve,address user,address to,uint256 amount)",
    "event Borrow(address indexed reserve,address user,address onBehalfOf,uint256 amount,uint256 borrowRateMode,uint256 borrowRate,uint16 referralCode)",
    "event Repay(address indexed reserve,address user,address repayer,uint256 amount,bool useATokens)",
    "event FlashLoan(address target,address initiator,address asset,uint256 amount,uint256 premium,uint16 referralCode)",
    "event LiquidationCall(address indexed collateralAsset,address indexed debtAsset,address indexed user,uint256 debtToCover,uint256 liquidatedCollateralAmount,address liquidator,bool receiveAToken)"
  ] as const;
  const poolContract = new ethers.Contract(POOL_CORE, POOL_ABI, wsProvider);

  const handlePoolEvent = async (context: PoolEventContext) => {
    try {
      await recordEventTrend(context);
    } catch (error) {
      console.error(`Failed to persist pool event trend for ${context.eventName}`, error);
    }
    void fetchReserves("event", {
      reserve: context.reserve,
      blockNumber: context.blockNumber,
      txHash: context.txHash,
      eventName: context.eventName,
      eventTimestamp: context.timestamp
    });
  };

  poolContract.on(
    "ReserveDataUpdated",
    async (
      reserve: string,
      liquidityRate,
      stableBorrowRate,
      variableBorrowRate,
      liquidityIndex,
      variableBorrowIndex,
      event
    ) => {
      console.log(`Reserve updated: ${reserve} @ block ${event.blockNumber}`);
      console.log("  liquidityRate      :", liquidityRate?.toString ? liquidityRate.toString() : liquidityRate);
      console.log("  stableBorrowRate   :", stableBorrowRate?.toString ? stableBorrowRate.toString() : stableBorrowRate);
      console.log("  variableBorrowRate :", variableBorrowRate?.toString ? variableBorrowRate.toString() : variableBorrowRate);
      console.log("  liquidityIndex     :", liquidityIndex?.toString ? liquidityIndex.toString() : liquidityIndex);
      console.log("  variableBorrowIndex:", variableBorrowIndex?.toString ? variableBorrowIndex.toString() : variableBorrowIndex);
      void fetchReserves("event", {
        reserve,
        blockNumber: event.blockNumber,
        eventName: "ReserveDataUpdated",
        txHash: event.transactionHash,
        eventTimestamp: await getBlockTimestamp(httpProvider, event.blockNumber)
      });
    }
  );

  poolContract.on(
    "Deposit",
    async (reserve: string, user, onBehalfOf, amount, referralCode, event) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "Deposit",
        reserve,
        amount,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  poolContract.on(
    "Withdraw",
    async (reserve: string, user, to, amount, event) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "Withdraw",
        reserve,
        amount,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  poolContract.on(
    "Borrow",
    async (reserve: string, user, onBehalfOf, amount, borrowRateMode, borrowRate, referralCode, event) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "Borrow",
        reserve,
        amount,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  poolContract.on(
    "Repay",
    async (reserve: string, user, repayer, amount, useATokens, event) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "Repay",
        reserve,
        amount,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  poolContract.on(
    "FlashLoan",
    async (target, initiator, asset, amount, premium, referralCode, event) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "FlashLoan",
        reserve: asset,
        amount,
        premium,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  poolContract.on(
    "LiquidationCall",
    async (
      collateralAsset: string,
      debtAsset,
      user,
      debtToCover,
      liquidatedCollateralAmount,
      liquidator,
      receiveAToken,
      event
    ) => {
      const timestamp = await getBlockTimestamp(httpProvider, event.blockNumber);
      await handlePoolEvent({
        eventName: "LiquidationCall",
        reserve: collateralAsset,
        amount: debtToCover,
        blockNumber: event.blockNumber,
        txHash: event.transactionHash,
        timestamp
      });
    }
  );

  wsProvider.on("error", error => {
    console.error("WebSocket provider error:", error);
  });

  const rawSocket = (wsProvider as unknown as { _websocket?: unknown })._websocket as {
    on?: (event: string, handler: (code: number) => void) => void;
  } | undefined;
  if (rawSocket?.on) {
    rawSocket.on("close", (code: number) => {
      console.warn(`WebSocket connection closed (code: ${code})`);
    });
  }

  // initial startup fetch
  await fetchReserves("startup");
}

main().catch(async err => {
  console.error("Fatal error:", err);
  await closeMongo().catch(() => undefined);
  process.exit(1);
});
