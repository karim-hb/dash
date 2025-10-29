#!/usr/bin/env tsx

// @ts-ignore - WebSocket types conflict between browser and ws package
import * as WebSocket from 'ws';
import { getTrackerState } from './state/state';
import { getMetricsAggregator } from './metrics/aggregator';
import { getTxpoolStatus } from './ingest/txpool';
import { UiSnapshot } from '@/lib/types';

// WebSocket server for real-time UI updates
class TrackerWebSocketServer {
  // @ts-ignore
  private wss: any = null;
  private broadcastInterval: NodeJS.Timeout | null = null;
  private port: number;

  constructor(port: number = 3006) {
    this.port = port;
  }

  // Start the WebSocket server
  async start(): Promise<void> {
    console.log(`🚀 Starting WebSocket server on port ${this.port}...`);

    // @ts-ignore
    this.wss = new WebSocket.Server({
      port: this.port,
      perMessageDeflate: false,
    });

    // @ts-ignore
    this.wss.on('connection', (ws: any) => {
      console.log('📡 New WebSocket connection established');

      ws.on('error', (error: any) => {
        console.error('WebSocket connection error:', error);
      });

      ws.on('close', () => {
        console.log('📡 WebSocket connection closed');
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));

      // Start broadcasting if this is the first connection
      if (this.wss && this.wss.clients.size === 1 && !this.broadcastInterval) {
        this.startBroadcasting();
      }
    });

    // @ts-ignore
    this.wss.on('error', (error: any) => {
      console.error('WebSocket server error:', error);
    });

    console.log(`✅ WebSocket server listening on ws://localhost:${this.port}`);
  }

  // Stop the WebSocket server
  async stop(): Promise<void> {
    console.log('🛑 Stopping WebSocket server...');

    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
    }

    if (this.wss) {
      // @ts-ignore
      this.wss.clients.forEach((client: any) => {
        client.close();
      });
      this.wss.close();
      this.wss = null;
    }

    console.log('✅ WebSocket server stopped');
  }

  // Start broadcasting UI updates
  private startBroadcasting(): void {
    console.log('🎯 Starting UI broadcast (200ms intervals)');

    this.broadcastInterval = setInterval(async () => {
      try {
        const snapshot = await this.generateUiSnapshot();
        const message = JSON.stringify(snapshot);

        // Send to all connected clients
        let activeConnections = 0;
        // @ts-ignore
        this.wss?.clients.forEach((client: any) => {
          // @ts-ignore
          if (client.readyState === WebSocket.OPEN) {
            try {
              client.send(message);
              activeConnections++;
            } catch (error) {
              console.error('Failed to send to client:', error);
            }
          }
        });

        if (activeConnections === 0) {
          console.log('No active connections, stopping broadcast');
          this.stopBroadcasting();
        }

      } catch (error) {
        console.error('Broadcast error:', error);
      }
    }, 200); // 200ms intervals for smooth realtime updates
  }

  // Stop broadcasting
  private stopBroadcasting(): void {
    if (this.broadcastInterval) {
      clearInterval(this.broadcastInterval);
      this.broadcastInterval = null;
      console.log('🎯 Stopped UI broadcast');
    }
  }

  // Generate UI snapshot
  private async generateUiSnapshot(): Promise<UiSnapshot> {
    const state = getTrackerState();
    const aggregator = getMetricsAggregator();

    // Get basic metrics
    const txpoolStatus = await getTxpoolStatus();
    const snapshot = await state.snapshot(100);
    const metrics = await aggregator.build(snapshot.txs, txpoolStatus);
    const stateMetrics = aggregator.getStateMetrics();
    const flowSparklines = aggregator.getFlowSparklines();

    // Get included transactions
    const included = await state.snapshotIncluded(50);
    // Gas data from fee history
    const { getFeeHistoryAnalytics, feeHistoryToSuggestions } = await import('./metrics/aggregator');
    const fh = await getFeeHistoryAnalytics(20);
    const gasData = feeHistoryToSuggestions(fh);

    // Build opportunities (top transactions by score)
    const opportunities = snapshot.txs
      .filter(tx => (tx._score || 0) > 100)
      .sort((a, b) => (b._score || 0) - (a._score || 0))
      .slice(0, 20)
      .map(tx => ({
        hash: tx.hash,
        rank: 0,
        score: tx._score || 0,
        category_key: tx.category_key,
        decoded_fn: tx._decoded_fn,
        decoded_events: tx._decoded_events,
      }));

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
      opportunities,
      live: snapshot.txs.slice(0, 50), // Recent transactions
      included,
      gas: gasData,
      status: {
        ws_connected: true, // Would check actual WS status
        rpc_latency_ms: 50, // Placeholder
        subscriptions_active: ['newPendingTransactions', 'newHeads'],
        errors: [],
      },
    };
  }
}

// Main execution
async function main() {
  const desired = parseInt(process.env.UI_WS_PORT || process.env.PORT || '3006', 10);
  const server = new TrackerWebSocketServer(desired);

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down...');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down...');
    await server.stop();
    process.exit(0);
  });

  // Start the server
  try {
    await server.start();
    console.log('🎯 WebSocket server ready for UI connections');
  } catch (error) {
    console.error('Failed to start WebSocket server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
