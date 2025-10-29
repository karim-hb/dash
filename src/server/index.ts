#!/usr/bin/env tsx

import 'dotenv/config';
import { initMongo } from '@/lib/db/mongo';
import { initAbiRegistry } from './decoding/abiRegistry';
// Realtime WS broadcasting (embedded to share in-memory state)
// @ts-ignore - Node ws types
import * as WebSocket from 'ws';
import { getTrackerState } from './state/state';
import { getMetricsAggregator, getFeeHistoryAnalytics, feeHistoryToSuggestions } from './metrics/aggregator';
import { getTxpoolStatus } from './ingest/txpool';
import { UiSnapshot } from '@/lib/types';
import { startPendingIngestion } from './ingest/pending';
import { startHeadsIngestion } from './ingest/heads';
import { startTxpoolMonitoring } from './ingest/txpool';
import * as fs from 'fs';
import * as path from 'path';
import { getTokens, getPools, getOracleFeeds } from './market/registry';
import { startOracleUpdates } from './oracles/registry';
import { startUniswapV2Indexer } from './indexers/amm/uniswapV2';
import { startUniswapV3Indexer } from './indexers/amm/uniswapV3';
import { startSushiV2Indexer } from './indexers/amm/sushiswapV2';
import { startHoldersBackfillAndPolling } from './holders/erc20HLL';
import { startBalancerV2Indexer } from './indexers/amm/balancerV2';
import { startCurveIndexer } from './indexers/amm/curve';

// Server startup script
async function main() {
  console.log('🚀 Starting Ethereum Mempool Tracker Server...');

  try {
    // Initialize MongoDB (optional)
    if (process.env.PERSIST_TO_MONGO === 'true') {
      await initMongo();
      console.log('✅ MongoDB initialized');
    } else {
      console.log('ℹ️ MongoDB disabled (PERSIST_TO_MONGO!=true)');
    }

    // Initialize ABI registry (loads signatures and cached signatures)
    await initAbiRegistry();
    console.log('✅ ABI registry initialized');

    // Start ingestion pipelines
    await startPendingIngestion();
    await startHeadsIngestion();
    await startTxpoolMonitoring();
    console.log('✅ Ingestion pipelines started');

    // Start oracles
    startOracleUpdates();

    // Start AMM indexers
    await startUniswapV2Indexer();
    await startUniswapV3Indexer();
    await startSushiV2Indexer();
    await startBalancerV2Indexer();
    await startCurveIndexer();

    // Start holders estimator (approximate)
    startHoldersBackfillAndPolling();

    // Start embedded WebSocket broadcast server (shares in-memory state)
    let wsPort = parseInt(process.env.UI_WS_PORT || '3006', 10);
    wsPort = await findFreeWsPort(wsPort, 10);
    await startWsBroadcast(wsPort);

    console.log('🎯 Server ready! WebSocket ingestion active.');
    console.log(`💻 Start Next.js UI with: npm run dev (WS at ws://localhost:${wsPort})`);
    try {
      const runtimePath = path.join(process.cwd(), '.runtime-ports.json');
      fs.writeFileSync(runtimePath, JSON.stringify({ ws_port: wsPort }, null, 2));
    } catch {}

    // Keep server running
    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down...');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down...');
      process.exit(0);
    });

    // Keep alive
    await new Promise(() => {}); // Never resolves

  } catch (error) {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);

// --- Embedded WS Broadcast Server ---
let wss: any = null as any;
let broadcastInterval: NodeJS.Timeout | null = null;

async function startWsBroadcast(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // @ts-ignore
      wss = new WebSocket.Server({ port, perMessageDeflate: false });

      // @ts-ignore
      wss.on('connection', (ws: any) => {
        try {
          ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
        } catch {}

        if (wss && wss.clients.size === 1 && !broadcastInterval) {
          startBroadcastLoop();
        }
      });

      // @ts-ignore
      wss.on('error', (err: any) => {
        console.error('WS server error:', err);
      });

      console.log(`✅ WebSocket broadcaster listening on ws://localhost:${port}`);
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

async function findFreeWsPort(start: number, maxTries: number): Promise<number> {
  let port = start;
  for (let i = 0; i < maxTries; i++) {
    try {
      // Try to start and immediately close a temporary server to probe the port
      // @ts-ignore
      const probe = new WebSocket.Server({ port, perMessageDeflate: false });
      await new Promise(res => setTimeout(res, 10));
      // @ts-ignore
      probe.close();
      return port;
    } catch (e: any) {
      if (e && (e.code === 'EADDRINUSE' || e.message?.includes('EADDRINUSE'))) {
        port += 1;
        continue;
      }
      // Unknown error, break and use start
      break;
    }
  }
  return port;
}

function startBroadcastLoop(): void {
  const aggregator = getMetricsAggregator();
  broadcastInterval = setInterval(async () => {
    try {
      const snapshot = await generateUiSnapshot(aggregator);
      const message = JSON.stringify(snapshot, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
      const dead: any[] = [];
      // @ts-ignore
      wss?.clients.forEach((client: any) => {
        // @ts-ignore
        if (client.readyState === WebSocket.OPEN) {
          try { client.send(message); } catch { dead.push(client); }
        } else { dead.push(client); }
      });
      for (const c of dead) {
        try { c.close(); } catch {}
      }
    } catch (err) {
      console.error('Broadcast error:', err);
    }
  }, 200);
}

async function generateUiSnapshot(aggregator = getMetricsAggregator()): Promise<UiSnapshot> {
  const state = getTrackerState();
  const txpoolStatus = await getTxpoolStatus();
  const snap = await state.snapshot(300);
  const metrics = await aggregator.build(snap.txs, txpoolStatus);
  const stateMetrics = aggregator.getStateMetrics();
  const flowSparklines = aggregator.getFlowSparklines();

  // Real gas data from fee history
  const t0 = Date.now();
  const feeHistory = await getFeeHistoryAnalytics(20);
  const rpcLatency = Date.now() - t0;
  const gas = feeHistoryToSuggestions(feeHistory);

  const included = await state.snapshotIncluded(200);

  // Calculate scores for all transactions
  const nowTs = Date.now() / 1000;
  const scoredTxs = snap.txs.map(tx => ({
    ...tx,
    _score: scoreTx(tx, nowTs),
  }));

  // Build sender stats (best-effort)
  const senderStats = new Map<string, { address: string; tx_count: number; included: number; dropped: number; total_value: bigint }>();
  for (const tx of snap.txs) {
    const addr = (tx.from || '').toLowerCase();
    if (!addr) continue;
    const s = senderStats.get(addr) || { address: addr, tx_count: 0, included: 0, dropped: 0, total_value: BigInt(0) };
    s.tx_count += 1;
    if (tx._state === 'INCLUDED' || tx._state === 'CONFIRMED' || tx._state === 'FINALIZED') s.included += 1;
    if (tx._state === 'DROPPED' || tx._state === 'REPLACED') s.dropped += 1;
    try { s.total_value += BigInt(tx.value || '0x0'); } catch {}
    senderStats.set(addr, s);
  }
  const senders = Array.from(senderStats.values())
    .map(s => ({
      address: s.address,
      tx_count: s.tx_count,
      success_rate: (s.included + s.dropped) > 0 ? s.included / (s.included + s.dropped) : 0,
      total_value: `0x${s.total_value.toString(16)}`
    }))
    .sort((a, b) => b.tx_count - a.tx_count)
    .slice(0, 50);

  return {
    timestamp: Date.now(),
    summary: {
      ...metrics,
      state_counts: stateMetrics.state_counts,
      success_rate: stateMetrics.success_rate,
      avg_inclusion_time: stateMetrics.avg_inclusion_time,
      congestion: stateMetrics.congestion,
      flow_spark: flowSparklines,
    },
    opportunities: scoredTxs
      .filter(tx => (tx._score || 0) > 0) // Lower threshold since we want opportunities
      .sort((a, b) => (b._score || 0) - (a._score || 0))
      .slice(0, 50) // More opportunities
      .map((tx, index) => ({
        hash: tx.hash,
        rank: index + 1,
        score: tx._score || 0,
        category_key: tx.category_key,
        decoded_fn: tx._decoded_fn,
      })),
    live: scoredTxs.slice(0, 200), // Show more in live view
    included,
    senders,
    gas,
    tokens: getTokens(),
    pools: getPools(),
    oracles: getOracleFeeds(),
    status: {
      ws_connected: true,
      rpc_latency_ms: rpcLatency,
      subscriptions_active: ['newPendingTransactions', 'newHeads'],
      errors: [],
    },
  };
}

// Score transaction based on amount, gas, and age (same as ranking.py)
function scoreTx(tx: any, nowTs: number = Date.now() / 1000): number {
  const amountEth = parseInt(tx.value || '0x0', 16) / 1e18;
  const gasGwei = (parseInt(tx.maxFeePerGas || tx.gasPrice || '0x0', 16) / 1e9);
  const age = tx._first_seen_ts ? Math.max(0, nowTs - tx._first_seen_ts) : 0;

  // Base weights (same as ranking.py)
  const wAmount = 2.0;
  const wGas = 1.0;
  const wAge = 0.2;

  return wAmount * (amountEth <= 0 ? 0 : (1.0 + amountEth) ** 0.3) + wGas * gasGwei - wAge * age;
}
