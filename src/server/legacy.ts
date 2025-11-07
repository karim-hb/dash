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
import { UiSnapshot, Transaction } from '@/lib/types';
import { startPendingIngestion } from './ingest/pending';
import { startHeadsIngestion, initializeIncludedFromBlocks } from './ingest/heads';
import { startTxpoolMonitoring } from './ingest/txpool';
import * as fs from 'fs';
import * as path from 'path';
import { getTokens, getPools, getOracleFeeds, getOracleFeedsByPair } from './market/registry';
import { startOracleUpdates } from './oracles/registry';
import { startUniswapV2Indexer } from './indexers/amm/uniswapV2';
import { startUniswapV3Indexer } from './indexers/amm/uniswapV3';
import { startSushiV2Indexer } from './indexers/amm/sushiswapV2';
import { startHoldersBackfillAndPolling } from './holders/erc20HLL';
import { startTokenDiscovery } from './market/tokenDiscovery';
import { startBalancerV2Indexer } from './indexers/amm/balancerV2';
import { startCurveIndexer } from './indexers/amm/curve';
import { initializeMarketRegistries } from './market/registry';
import { startAmmEngine } from './market/ammEngine';
import { startTokenStatsRefresh } from './market/tokenStats';
import { getAmmStatistics, getTopPoolsByVolume, startMetricsAggregation } from './market/ammMetrics';
import * as http from 'http';
import { URL } from 'url';
import { getConfig } from '@/lib/config';
import { applyOpportunityScoring } from './market/opportunityScoring';
import { startGasOracle, getGasOracle } from './gas/gasOracle';
import { logErrorWithConsole, logWarningWithConsole } from './utils/errorLogger';

const MIN_TOKEN_USD = Number(process.env.UI_TOKEN_MIN_USD || '1000');
const MIN_POOL_USD = Number(process.env.UI_POOL_MIN_USD || '100'); // Lower threshold to show more pools

// Server startup script
async function main() {
  console.log('🚀 Starting Ethereum Mempool Tracker Server...');

  try {
    // Initialize MongoDB (optional)
    try {
      await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker');
      console.log('✅ MongoDB initialized');
      // Hydrate in-memory registry from persisted tokens if present
      try {
        const { getDb } = await import('@/lib/db/mongo');
        const db = getDb();
        const docs = await db.collection('market_tokens').find({}).project({ _id: 0 }).limit(50000).toArray();
        const { upsertToken } = await import('./market/registry');
        for (const d of docs) {
          upsertToken(d as any);
        }
        console.log(`🗄️ Hydrated ${docs.length} tokens from Mongo into registry`);
      } catch (e) {
        logWarningWithConsole(e, 'MongoDB hydration');
      }
    } catch {
      console.log('ℹ️ MongoDB not available, continuing without persistence');
    }

    // Initialize ABI registry (loads signatures and cached signatures)
    await initAbiRegistry();
    console.log('✅ ABI registry initialized');

    // Initialize market registries (pre-populate tokens from catalog)
    initializeMarketRegistries();
    startAmmEngine();
    console.log('✅ Market registries initialized');

    // Temporarily disable ingestion pipelines for HTTP API testing
    console.log('🔒 Ingestion pipelines temporarily disabled for HTTP API testing');
    /*
    // Start ingestion pipelines
    await startPendingIngestion();
    await startHeadsIngestion();
    await startTxpoolMonitoring();
    startGasOracle();
    console.log('✅ Ingestion pipelines started');
    */

    // Populate included transactions from recent blocks (one-time warm-up)
    try {
      // Skip for now due to Nethermind eth_call issues
      // await initializeIncludedFromBlocks();
      console.log('⏭️ Skipped initializing included transactions from recent blocks (Nethermind issues)');
    } catch (e) {
      logWarningWithConsole(e, 'Initialize included transactions');
    }

    // Start embedded WebSocket broadcast server ASAP (before heavy indexers)
    // Bind to the exact requested port to avoid UI/WS mismatches
    try {
      if (!wss) {
        const wsPortEarly = parseInt(process.env.UI_WS_PORT || '3006', 10);
        await startWsBroadcast(wsPortEarly);
      }
    } catch (e) {
      logErrorWithConsole(e, 'Early WebSocket broadcaster startup');
    }

    // Temporarily disable oracles for HTTP API testing
    console.log('🔒 Oracle updates temporarily disabled for HTTP API testing');
    /*
    // Start oracles
    console.log('Starting oracle updates...');
    await startOracleUpdates();
    console.log('Oracle updates started');
    */

    // Start AMM indexers (use config values, which default to true for V2/V3)
    try {
      const cfg = getConfig();
      if (cfg.ENABLE_AMM_UNIV2) {
        console.log('🏦 Starting Uniswap V2 indexer...');
        await startUniswapV2Indexer();
      } else {
        console.log('🔒 Uniswap V2 indexer disabled (ENABLE_AMM_UNIV2=false)');
      }
      if (cfg.ENABLE_AMM_UNIV3) {
        console.log('🏦 Starting Uniswap V3 indexer...');
        // Temporarily disable V3 indexer - backfill range needs more work
        console.log('🔒 Uniswap V3 indexer temporarily disabled for backfill range issues');
        // await startUniswapV3Indexer();
      } else {
        console.log('🔒 Uniswap V3 indexer disabled (ENABLE_AMM_UNIV3=false)');
      }
      if (cfg.ENABLE_SUSHI) {
        console.log('🏦 Starting Sushi V2 indexer...');
        // Temporarily disable Sushi for testing
        console.log('🔒 Sushi indexer temporarily disabled for testing');
        // await startSushiV2Indexer();
      } else {
        console.log('🔒 Sushi indexer disabled (ENABLE_SUSHI=false)');
      }
      if (cfg.ENABLE_BALANCER) {
        console.log('🏦 Starting Balancer V2 indexer...');
        await startBalancerV2Indexer();
      } else {
        console.log('🔒 Balancer indexer disabled (ENABLE_BALANCER=false)');
      }
      if (cfg.ENABLE_CURVE) {
        console.log('🏦 Starting Curve indexer...');
        await startCurveIndexer();
      } else {
        console.log('🔒 Curve indexer disabled (ENABLE_CURVE=false)');
      }
      console.log('✅ AMM indexers started');

      // Start metrics aggregation (runs periodically)
      startMetricsAggregation();
      console.log('✅ AMM metrics aggregation started');
    } catch (e) {
      logErrorWithConsole(e, 'AMM indexer startup');
      console.log('⚠️ Continuing without AMM indexers...');
    }

    // Start holders estimator (approximate)
    if ((process.env.ENABLE_HOLDERS || 'false') === 'true') {
      console.log('Starting holders backfill...');
      startHoldersBackfillAndPolling();
    } else {
      console.log('🔒 Holders backfill disabled (ENABLE_HOLDERS!=true)');
    }

    // Start ERC-20 token discovery (from Transfer logs) if enabled
    if ((process.env.ENABLE_TOKEN_DISCOVERY || 'false') === 'true') {
      console.log('About to call startTokenDiscovery...');
      try {
        console.log('Starting token discovery...');
        await startTokenDiscovery();
        console.log('startTokenDiscovery() returned successfully');
      } catch (e) {
        logErrorWithConsole(e, 'startTokenDiscovery');
      }
    } else {
      console.log('🔒 Token discovery disabled (ENABLE_TOKEN_DISCOVERY!=true)');
    }

    // Start token stats refresher (onchain supply, liquidity, 24h vol, mcap)
    if ((process.env.ENABLE_TOKEN_STATS || 'false') === 'true') {
      console.log('Starting token stats refresh...');
      startTokenStatsRefresh();
    } else {
      console.log('🔒 Token stats refresh disabled (ENABLE_TOKEN_STATS!=true)');
    }

    // Temporarily disable WebSocket broadcaster for HTTP API testing
    console.log('🔒 WebSocket broadcaster temporarily disabled for HTTP API testing');
    /*
    // Start embedded WebSocket broadcast server (shares in-memory state)
    // (May already be started above; guard to avoid double-start)
    if (!wss) {
      const wsPort = parseInt(process.env.UI_WS_PORT || '3006', 10);
      await startWsBroadcast(wsPort);
    }
    */

    // Start lightweight HTTP API for paginated data access (CORS-enabled)
    console.log('🔧 About to start HTTP API...');
    let httpPort = parseInt(process.env.PORT || '3005', 10);
    console.log(`🔍 Finding free port starting from ${httpPort}...`);
    httpPort = await findFreeWsPort(httpPort, 10);
    console.log(`✅ Found free port: ${httpPort}`);
    console.log('🚀 Starting HTTP API server...');
    try {
      await startHttpApi(httpPort);
      console.log('✅ HTTP API started successfully');
    } catch (e: any) {
      // Retry on next port if bind failed
      const errMsg = e?.message || String(e);
      console.error('❌ HTTP API start failed:', errMsg);
      logWarningWithConsole(errMsg, 'HTTP API start failed, retrying on next port');
      try {
        console.log('🔄 Retrying on next port...');
        httpPort = await findFreeWsPort(httpPort + 1, 10);
        await startHttpApi(httpPort);
        console.log('✅ HTTP API retry successful');
        } catch (e2: any) {
          console.error('❌ HTTP API retry failed:', e2.message);
        logErrorWithConsole(e2, 'HTTP API retry failed');
      }
    }

    console.log('🎯 Server ready! WebSocket ingestion active.');
    const wsPortLog = parseInt(process.env.UI_WS_PORT || '3006', 10);
    console.log(`💻 Start Next.js UI with: NEXT_PUBLIC_UI_WS_URL=ws://localhost:${wsPortLog} npm run dev`);
    try {
      const runtimePath = path.join(process.cwd(), '.runtime-ports.json');
      fs.writeFileSync(runtimePath, JSON.stringify({ ws_port: wsPortLog, http_port: httpPort }, null, 2));
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
    logErrorWithConsole(error, 'Server startup');
    process.exit(1);
  }
}

main().catch((error) => {
  logErrorWithConsole(error, 'Main process');
  process.exit(1);
});

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
          console.log('👤 First WebSocket client connected, starting broadcast loop...');
          startBroadcastLoop();
        }
      });

      // @ts-ignore
      wss.on('listening', () => {
        console.log(`✅ WebSocket broadcaster listening on ws://localhost:${port}`);
        // Start broadcast loop immediately
        console.log('📡 Starting WebSocket broadcast loop...');
        startBroadcastLoop();
        resolve();
      });

      // @ts-ignore
      wss.on('error', (err: any) => {
        logErrorWithConsole(err, 'WS server');
        reject(err);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function findFreeWsPort(start: number, maxTries: number): Promise<number> {
  let port = start;
  for (let i = 0; i < maxTries; i++) {
    const probe = http.createServer();
    const isFree = await new Promise<boolean>((resolve) => {
      const onError = (err: any) => {
        if (err && (err.code === 'EADDRINUSE')) {
          resolve(false);
        } else {
          // Treat unknown errors as not free to be safe
          resolve(false);
        }
      };
      probe.once('error', onError);
      probe.listen(port, '127.0.0.1', () => {
        probe.removeListener('error', onError);
        probe.close(() => resolve(true));
      });
    });
    if (isFree) return port;
    port += 1;
  }
  return port;
}

function startBroadcastLoop(): void {
  const aggregator = getMetricsAggregator();
  console.log('📡 Starting WebSocket broadcast loop...');
  broadcastInterval = setInterval(async () => {
    try {
      const snapshot = await generateUiSnapshot(aggregator);
      const message = JSON.stringify(snapshot, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value
      );
      const dead: any[] = [];
      let clientCount = 0;
      // @ts-ignore
      wss?.clients.forEach((client: any) => {
        clientCount++;
        // @ts-ignore
        if (client.readyState === WebSocket.OPEN) {
          try { client.send(message); } catch { dead.push(client); }
        } else { dead.push(client); }
      });
      if (clientCount > 0) {
        console.log(`📡 Broadcasted to ${clientCount} clients`);
      }
      for (const c of dead) {
        try { c.close(); } catch {}
      }
    } catch (err) {
      logErrorWithConsole(err, 'Broadcast');
    }
  }, 200);
}

// --- Lightweight HTTP API (read-only) ---
async function startHttpApi(port: number): Promise<void> {
  // Helper to serialize responses with BigNumber handling
  const serializeResponse = (obj: any): string => {
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    });
  };

  const server = http.createServer(async (req, res) => {
    try {
      // CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (!req.url) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Bad request' }));
        return;
      }

      const fullUrl = new URL(req.url, `http://localhost:${port}`);
      const pathname = fullUrl.pathname;

      if (req.method === 'GET' && pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ts: Date.now() }));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/tokens') {
        const q = (fullUrl.searchParams.get('q') || '').trim().toLowerCase();
        const tab = (fullUrl.searchParams.get('tab') || 'all').toLowerCase(); // all | v1 | v2 | v3
        const page = Math.max(1, parseInt(fullUrl.searchParams.get('page') || '1', 10));
        const limit = Math.min(250, Math.max(1, parseInt(fullUrl.searchParams.get('limit') || '50', 10)));
        const sort = (fullUrl.searchParams.get('sort') || 'score').toLowerCase(); // price | score
        const minTvl = parseFloat(fullUrl.searchParams.get('min_tvl') || 'NaN');
        const minVol = parseFloat(fullUrl.searchParams.get('min_vol') || 'NaN');
        const minHolders = parseInt(fullUrl.searchParams.get('min_holders') || 'NaN', 10);
        const topParam = (fullUrl.searchParams.get('top') ?? (process.env.TOKENS_TOP_LIMIT_ENABLED ?? '1')).toLowerCase();
        const topEnabled = topParam === '1' || topParam === 'true';
        const topLimit = Math.max(1, parseInt(fullUrl.searchParams.get('top_limit') || (process.env.TOKENS_TOP_LIMIT_N || '300'), 10));
        const topBy = (fullUrl.searchParams.get('top_by') || 'score').toLowerCase(); // score | price

        const allTokens = getTokens();
        const allPools = getPools();

        // Build token -> versions map once
        const tokenVersions = new Map<string, Set<string>>();
        for (const p of allPools) {
          const v = (p.version || '').toUpperCase();
          const t0 = (p.token0 || '').toLowerCase();
          const t1 = (p.token1 || '').toLowerCase();
          if (t0) {
            const set = tokenVersions.get(t0) || new Set<string>();
            set.add(v);
            tokenVersions.set(t0, set);
          }
          if (t1) {
            const set = tokenVersions.get(t1) || new Set<string>();
            set.add(v);
            tokenVersions.set(t1, set);
          }
        }

        // Counts by version across all tokens
        const countsByVersion = { V1: 0, V2: 0, V3: 0 } as Record<'V1' | 'V2' | 'V3', number>;
        for (const [_, set] of tokenVersions) {
          if (set.has('V1')) countsByVersion.V1 += 1;
          if (set.has('V2')) countsByVersion.V2 += 1;
          if (set.has('V3')) countsByVersion.V3 += 1;
        }

        const pricedCount = allTokens.filter(t => t.price_usd != null).length;

        const pinnedSymbols = new Set(['ETH', 'WETH', 'WBTC', 'USDT', 'USDC', 'DAI']);

        // Filter tokens by search
        let filtered = allTokens.filter(t => {
          if (!q) return true;
          const sym = (t.symbol || '').toLowerCase();
          const addr = (t.address || '').toLowerCase();
          return sym.includes(q) || addr.includes(q);
        });

        // Drop obviously bad tokens (no price, zero, or absurd) unless pinned
        filtered = filtered.filter(t => {
          const symbol = (t.symbol || '').toUpperCase();
          const pinned = pinnedSymbols.has(symbol);
          const price = typeof t.price_usd === 'number' ? t.price_usd : null;
          if (pinned) return true;
          if (price == null || !Number.isFinite(price)) return false;
          if (price <= 0) return false;
          if (price > 1_000_000) return false;
          const status = t.heartbeat?.status?.toLowerCase();
          if (!t.active && status && status !== 'healthy' && status !== 'warm') return false;
          return true;
        });

        // Filter by version tab
        if (tab !== 'all') {
          const wanted = tab.toUpperCase(); // V1/V2/V3
          filtered = filtered.filter(t => tokenVersions.get((t.address || '').toLowerCase())?.has(wanted) === true);
        }

        // Compute aggregates and score
        const tokenAgg = new Map<string, { tvl: number; vol24h: number; poolCount: number; dexCount: number; score: number }>();
        for (const t of filtered) {
          const addr = (t.address || '').toLowerCase();
          let tvl = 0;
          let vol = 0;
          const poolsForToken = allPools.filter(p => (p.token0?.toLowerCase() === addr || p.token1?.toLowerCase() === addr));
          const poolCount = poolsForToken.length;
          const dexSet = new Set<string>();
          for (const p of poolsForToken) {
            tvl += p.tvl_usd || 0;
            vol += p.volume_24h_usd || 0;
            dexSet.add(`${p.dex}|${p.version}`);
          }
          const dexCount = dexSet.size;
          const score = tvl * 0.5 + vol * 0.3 + poolCount * 1000;
          tokenAgg.set(addr, { tvl, vol24h: vol, poolCount, dexCount, score });
        }

        // Optional thresholds
        if (!Number.isNaN(minTvl)) {
          filtered = filtered.filter(t => (tokenAgg.get((t.address || '').toLowerCase())?.tvl || 0) >= minTvl);
        }
        if (!Number.isNaN(minVol)) {
          filtered = filtered.filter(t => (tokenAgg.get((t.address || '').toLowerCase())?.vol24h || 0) >= minVol);
        }
        if (!Number.isNaN(minHolders)) {
          filtered = filtered.filter(t => (t.holders_est || 0) >= minHolders);
        }

        // Select top-N if enabled (pre-sorting stage)
        if (topEnabled) {
          const ranked = [...filtered].sort((a, b) => {
            if (topBy === 'price') {
              const ap = typeof a.price_usd === 'number' ? a.price_usd : -Infinity;
              const bp = typeof b.price_usd === 'number' ? b.price_usd : -Infinity;
              if (bp !== ap) return bp - ap;
              return (a.symbol || '').localeCompare(b.symbol || '');
            } else {
              const as = tokenAgg.get((a.address || '').toLowerCase())?.score || -Infinity;
              const bs = tokenAgg.get((b.address || '').toLowerCase())?.score || -Infinity;
              if (bs !== as) return bs - as;
              return (a.symbol || '').localeCompare(b.symbol || '');
            }
          });
          const topSet = new Set(ranked.slice(0, topLimit).map(t => (t.address || '').toLowerCase()));
          filtered = filtered.filter(t => topSet.has((t.address || '').toLowerCase()));
        }

        // Sort
        if (sort === 'score') {
          filtered.sort((a, b) => {
            const as = tokenAgg.get((a.address || '').toLowerCase())?.score || -Infinity;
            const bs = tokenAgg.get((b.address || '').toLowerCase())?.score || -Infinity;
            if (bs !== as) return bs - as;
            return (a.symbol || '').localeCompare(b.symbol || '');
          });
        } else {
          // price desc, then active, then symbol
          filtered.sort((a, b) => {
            const ap = typeof a.price_usd === 'number' ? a.price_usd : -Infinity;
            const bp = typeof b.price_usd === 'number' ? b.price_usd : -Infinity;
            if (bp !== ap) return bp - ap;
            const aActive = !!a.active;
            const bActive = !!b.active;
            if (aActive !== bActive) return aActive ? -1 : 1;
            return (a.symbol || '').localeCompare(b.symbol || '');
          });
        }

        const total = filtered.length;
        const start = (page - 1) * limit;
        const end = start + limit;
        const pageRows = filtered.slice(start, end).map(t => {
          const versions = Array.from(tokenVersions.get((t.address || '').toLowerCase()) || new Set<string>())
            .sort()
            .join('/');
          const agg = tokenAgg.get((t.address || '').toLowerCase());
          return { ...t, versions, score: agg?.score || 0, pool_count: agg?.poolCount || 0, dex_count: agg?.dexCount || 0, tvl_sum_usd: agg?.tvl || 0, vol_24h_sum_usd: agg?.vol24h || 0 };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          total,
          page,
          limit,
          pricedCount,
          countsByVersion,
          totalTokens: allTokens.length,
          topApplied: topEnabled,
          topLimit,
          topBy,
          rows: pageRows,
        }));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/gas') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getGasOracle().getSnapshot()));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/pools') {
        const token = (fullUrl.searchParams.get('token') || '').toLowerCase();
        const allPools = getPools();
        let rows = allPools;
        if (token) {
          rows = allPools.filter(p => (p.token0 || '').toLowerCase() === token || (p.token1 || '').toLowerCase() === token);
        }
        // Stable sort for UX
        rows.sort((a, b) => (b.tvl_usd || 0) - (a.tvl_usd || 0));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ total: rows.length, rows }));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/dashboard/stats') {
        try {
          // Get basic dashboard statistics
          const tokens = getTokens();
          const pools = getPools();
          const gasOracle = getGasOracle();

          const stats = {
            totalTokens: tokens.length,
            activeTokens: tokens.filter(t => t.active).length,
            totalPools: pools.length,
            activePools: pools.filter(p => p.tvl_usd && p.tvl_usd > 0).length,
            totalLiquidity: pools.reduce((sum, p) => sum + (p.tvl_usd || 0), 0),
            gasOracle: gasOracle.getSnapshot(),
            timestamp: Date.now()
          };

          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' });
          res.end(JSON.stringify(stats));
          return;
        } catch (e) {
          logErrorWithConsole(e, 'Dashboard stats API');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }

      // AMM endpoints
      if (req.method === 'GET' && pathname === '/api/amm/stats') {
        try {
          const stats = await getAmmStatistics();
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' });
          res.end(serializeResponse(stats));
          return;
        } catch (e) {
          logErrorWithConsole(e, 'AMM stats API');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }

      if (req.method === 'GET' && pathname === '/api/amm/pools') {
        try {
          const pools = await getTopPoolsByVolume(100); // Top 100 pools
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' });
          res.end(serializeResponse(pools));
          return;
        } catch (e) {
          logErrorWithConsole(e, 'AMM pools API');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }

      if (req.method === 'GET' && pathname.startsWith('/api/amm/pool/')) {
        try {
          const poolAddress = pathname.split('/api/amm/pool/')[1];
          if (!poolAddress) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Pool address required' }));
            return;
          }
          // For now, return basic pool info from getTopPoolsByVolume
          const pools = await getTopPoolsByVolume(1000); // Get more pools to find the specific one
          const pool = pools.find(p => p.address?.toLowerCase() === poolAddress.toLowerCase());
          if (!pool) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Pool not found' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=30' });
          res.end(serializeResponse(pool));
          return;
        } catch (e) {
          logErrorWithConsole(e, 'AMM pool details API');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }

      if (req.method === 'GET' && pathname === '/api/amm/health') {
        try {
          // Basic health check for AMM
          const stats = await getAmmStatistics();
          const isHealthy = stats.totalPools > 0;
          res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=10' });
          res.end(serializeResponse({
            healthy: isHealthy,
            totalPools: stats.totalPools,
            activePools: stats.activePools,
            volume24h: stats.totalVolume24h,
            liquidity: stats.totalLiquidity
          }));
          return;
        } catch (e) {
          logErrorWithConsole(e, 'AMM health API');
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Internal server error' }));
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    } catch (error) {
      try {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal error' }));
      } catch {}
      logErrorWithConsole(error, 'HTTP API');
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`✅ HTTP API listening on http://localhost:${port}`);
      resolve();
    });
  });
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
  const gasSuggestions = feeHistoryToSuggestions(feeHistory);
  const gasOracleSnapshot = getGasOracle().getSnapshot();

  const included = await state.snapshotIncluded(200);

  // Calculate scores for all transactions
  const nowTs = Date.now() / 1000;
  const scoredTxs = snap.txs.map(tx => {
    if (typeof tx.composite_score !== 'number' || Number.isNaN(tx.composite_score)) {
      const clone = { ...tx } as Transaction;
      applyOpportunityScoring(clone, nowTs);
      return clone;
    }
    return tx;
  });

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

  const rawTokens = getTokens().map(t => ({ ...t, heartbeat: t.heartbeat ?? undefined }));
  // Show all tokens with price OR liquidity OR mcap, or if they're active
  const tokens = rawTokens.filter(t => {
    const hasPrice = typeof t.price_usd === 'number' && Number.isFinite(t.price_usd) && t.price_usd > 0;
    const hasLiquidity = typeof t.liquidity_usd === 'number' && t.liquidity_usd >= MIN_TOKEN_USD;
    const hasMcap = typeof t.mcap_onchain_usd === 'number' && t.mcap_onchain_usd >= MIN_TOKEN_USD;
    const isActive = t.active === true;
    // Show if it has any meaningful data or is active
    return hasPrice || hasLiquidity || hasMcap || isActive;
  });

  const rawPools = getPools();
  // Show pools with TVL/reserves above threshold, volume, or just discovered (less aggressive filtering)
  const pools = rawPools.filter(p => {
    // Always show if TVL is above threshold
    const tvl = typeof p.tvl_usd === 'number' ? p.tvl_usd : null;
    if (tvl != null && tvl >= MIN_POOL_USD) return true;
    
    // Show if reserves are above threshold
    const partial = (typeof p.pool0_usd === 'number' ? p.pool0_usd : 0) + (typeof p.pool1_usd === 'number' ? p.pool1_usd : 0);
    if (partial >= MIN_POOL_USD) return true;
    
    // Show if it has volume (even if TVL is low)
    const hasVolume = typeof p.volume_24h_usd === 'number' && p.volume_24h_usd > 0;
    if (hasVolume) return true;
    
    // Show V3 pools even if TVL not yet calculated (position indexer might be delayed)
    if (p.version === 'V3') {
      // Show if pool has been registered (address exists)
      return !!p.address;
    }
    
    // Show V2 pools if they have reserves (even if below threshold)
    if (p.version === 'V2') {
      const hasReserves = (typeof p.pool0_usd === 'number' && p.pool0_usd > 0) || 
                         (typeof p.pool1_usd === 'number' && p.pool1_usd > 0);
      return hasReserves;
    }
    
    return false;
  });
  const oracles = getOracleFeeds();

  console.log(`📡 Broadcasting: ${tokens.length} tokens, ${pools.length} pools, ${oracles.length} oracles`);
  if (tokens.length > 0) {
    console.log(`📡 First token: ${tokens[0].symbol} active=${tokens[0].active} price=${tokens[0].price_usd} heartbeat=${JSON.stringify(tokens[0].heartbeat)}`);
  }


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
      .filter(tx => (tx.composite_score ?? tx._score ?? 0) > 0) // Lower threshold since we want opportunities
      .sort((a, b) => (b.composite_score ?? b._score ?? 0) - (a.composite_score ?? a._score ?? 0))
      .slice(0, 50) // More opportunities
      .map((tx, index) => ({
        hash: tx.hash,
        rank: index + 1,
        score: tx.composite_score ?? tx._score ?? 0,
        category_key: tx.category_key,
        decoded_fn: tx._decoded_fn,
        value_score: tx.value_score ?? null,
        gas_score: tx.gas_score ?? null,
        mev_score: tx.mev_score ?? null,
        smart_money_score: tx.smart_money_score ?? null,
        urgency_score: tx.urgency_score ?? null,
        composite_score: tx.composite_score ?? tx._score ?? 0,
        score_breakdown: tx.score_breakdown ?? null,
        smart_money_flag: tx.smart_money_flag ?? false,
        state_history: tx.state_history ?? [],
        replacement_tx: tx.replacement_tx ?? null,
        replaced_by: tx.replaced_by ?? null,
        drop_reason: tx.drop_reason ?? null,
        sender_pending_nonce: tx.sender_pending_nonce ?? null,
        sender_confirmed_nonce: tx.sender_confirmed_nonce ?? null,
        nonce_gap: tx.nonce_gap ?? null,
        nonce_warning: tx.nonce_warning ?? null,
      })),
    live: scoredTxs.slice(0, 200), // Show more in live view
    included,
    senders,
    gas: ({ suggestions: gasSuggestions, oracle: gasOracleSnapshot } as any),
    tokens,
    pools,
    oracles,
    status: {
      ws_connected: true,
      rpc_latency_ms: rpcLatency,
      subscriptions_active: ['newPendingTransactions', 'newHeads'],
      errors: [],
    },
  };
}
