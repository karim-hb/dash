# Ethereum Mempool Tracker Web

A real-time Ethereum transaction monitoring dashboard built with Next.js, WebSocket JSON-RPC, and MongoDB.

## Features

- **Real-time WebSocket ingestion**: Direct connection to Ethereum node via WebSocket
- **Local-only decoding**: Fast ABI decoding using local catalogs (no external API calls)
- **MongoDB persistence**: Efficient storage with selective persistence
- **Live dashboard**: 8 tabs with realtime updates (200ms intervals)
- **Lightweight UI**: Optimized tables with virtualization and minimal bundle size

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js UI    │◄──►│  WebSocket API   │◄──►│   Server Core    │
│   (React/TS)    │    │  (/api/ws)       │    │   (Node/TS)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                       │
                                               ┌───────┴───────┐
                                               │   Ingestion   │
                                               │   Pipelines   │
                                               └───────┬───────┘
                                                       │
                                               ┌───────┴───────┐
                                               │  Ethereum     │
                                               │  Node (WS)    │
                                               └───────────────┘
```

## Prerequisites

- Node.js 18+ (Node 20+ recommended for Next.js 16)
- MongoDB (local or remote)
- Ethereum node with WebSocket support (e.g., Nethermind, Geth)

## Setup

1. **Install dependencies**:
   ```bash
   cd tracker_web
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.local.example .env.local  # Edit with your settings
   ```

   Required environment variables:
   ```env
   EXECUTION_WS_URL=ws://127.0.0.1:8545
   MONGO_URL=mongodb://127.0.0.1:27017/tracker
   JWT_PATH=/path/to/jwt.hex  # Optional
   ```

3. **Start MongoDB**:
   ```bash
   mongod  # Or use your preferred MongoDB setup
   ```

4. **Start the ingestion server**:
   ```bash
   npm run server
   ```
   This starts the WebSocket ingestion pipelines and keeps them running.

5. **Start the UI** (in another terminal):
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Project Structure

```
tracker_web/
├── src/
│   ├── app/                 # Next.js pages/routes
│   │   ├── api/ws/route.ts  # WebSocket broadcast endpoint
│   │   ├── components/      # UI components (Summary, Live, etc.)
│   │   └── page.tsx         # Main dashboard with tabs
│   ├── server/              # Backend logic
│   │   ├── rpc/wsClient.ts  # WebSocket JSON-RPC client
│   │   ├── ingest/          # Ingestion pipelines
│   │   │   ├── pending.ts   # newPendingTransactions
│   │   │   ├── heads.ts     # newHeads + inclusion
│   │   │   └── txpool.ts    # txpool monitoring
│   │   ├── decoding/        # ABI decoding logic
│   │   │   ├── coreDecoder.ts  # Heuristics + ABI
│   │   │   ├── decoders.ts     # Public decode API
│   │   │   └── abiRegistry.ts  # Signatures + cache
│   │   ├── state/           # In-memory state + MongoDB
│   │   │   └── state.ts     # TrackerState class
│   │   └── index.ts         # Server startup
│   ├── lib/                 # Shared utilities
│   │   ├── db/mongo.ts      # MongoDB connection
│   │   ├── types/           # TypeScript types
│   │   ├── util/            # Helper functions
│   │   └── config.ts        # Environment config
│   └── server/catalog/      # ABI catalogs (from Python tracker)
│       ├── signatures.json
│       ├── selectors.json
│       └── ...
```

## Tabs Overview

1. **Summary**: Pool status, ingress/egress rates, mempool health, gas buckets
2. **Opportunities**: Ranked high-value transactions by score
3. **Live**: Recent pending transactions with filters
4. **Included**: Confirmed transactions with gas analysis
5. **Gas**: Fee history analytics and suggestions
6. **Contracts**: Top interacted contracts by frequency
7. **Senders**: Top sending addresses and success rates
8. **Status**: System health, WS status, error logs

## Decoding Features

- **Local-first**: Uses pre-loaded catalogs (signatures.json, 4byte_cache.json)
- **Heuristics**: ERC-20 transfers, approvals, multicall, NFT patterns
- **Signature caching**: Discovered selectors saved to MongoDB
- **Swap detection**: DEX router identification with amount/path extraction
- **No external APIs**: Pure local processing for low latency

## Performance

- **200ms UI updates**: Minimal diffs over WebSocket
- **Virtualized tables**: Handle 1000s of transactions smoothly
- **Selective persistence**: Only critical data goes to MongoDB
- **Concurrent processing**: Receipt fetching and decoding pipelines
- **Light bundle**: Tree-shaken dependencies for fast loading

## Development

- **Hot reload**: Next.js dev server with instant updates
- **TypeScript**: Full type safety across frontend/backend
- **Modular architecture**: Easy to extend with new features
- **Catalog updates**: Add new signatures/routers without redeploy

## Production Deployment

For production, consider:
- Reverse proxy (nginx) for WS connections
- MongoDB clustering for high throughput
- Docker containerization
- Environment-specific configs

## Troubleshooting

- **WS connection fails**: Check Ethereum node WS URL and JWT auth
- **MongoDB errors**: Verify connection string and database permissions
- **No data appearing**: Check server logs for ingestion errors
- **UI not updating**: Verify WebSocket connection in browser dev tools

## Migration from Python Tracker

This implementation maintains feature parity with the Python version:
- All ingestion pipelines ported (pending, heads, txpool)
- Decoding logic preserved with TypeScript types
- State management with MongoDB instead of SQLite
- Same catalog files and router registries
- Equivalent metrics and gas analytics

The main differences:
- Web UI instead of terminal TUI
- TypeScript instead of Python
- MongoDB instead of SQLite
- Realtime WebSocket broadcasting instead of terminal updates