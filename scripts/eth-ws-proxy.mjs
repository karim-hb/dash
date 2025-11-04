import http from 'http';
import https from 'https';
import { WebSocketServer } from 'ws';
import crypto from 'crypto';

// Simple JSON-RPC over WebSocket proxy that:
// - Proxies JSON-RPC requests to HTTP endpoint
// - Emulates eth_subscribe for newHeads and newPendingTransactions by polling

function parseArgs() {
  const args = process.argv.slice(2);
  const out = { target: 'http://127.0.0.1:8545', port: 9545, pollIntervalMs: 4000 };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--target' && args[i + 1]) {
      let t = args[++i];
      if (t.startsWith('ws://')) t = 'http://' + t.slice('ws://'.length);
      if (t.startsWith('wss://')) t = 'https://' + t.slice('wss://'.length);
      out.target = t;
    } else if (a === '--port' && args[i + 1]) {
      out.port = parseInt(args[++i], 10);
    } else if (a === '--poll-interval' && args[i + 1]) {
      out.pollIntervalMs = parseInt(args[++i], 10);
    }
  }
  return out;
}

const { target, port, pollIntervalMs } = parseArgs();
const targetUrl = new URL(target);
const httpAgent = targetUrl.protocol === 'https:' ? https : http;

function httpRpc(body) {
  return new Promise((resolve, reject) => {
    const req = httpAgent.request(
      {
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: targetUrl.pathname || '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            resolve(json);
          } catch (e) {
            reject(new Error('Invalid JSON from RPC'));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

const wss = new WebSocketServer({ host: '0.0.0.0', port });
console.log(`web3-proxy: listening on ws://0.0.0.0:${port} -> ${target}`);

// Subscriptions
let lastEmittedBlock = null; // hex string
let lastPendingSet = new Set(); // of hashes
const clients = new Set();

function randSubId() {
  return '0x' + crypto.randomBytes(16).toString('hex');
}

async function pollNewHeads() {
  try {
    const res = await httpRpc({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] });
    const num = res && res.result;
    if (typeof num === 'string' && num !== lastEmittedBlock) {
      // handle gaps
      const prev = lastEmittedBlock ? parseInt(lastEmittedBlock, 16) : parseInt(num, 16) - 1;
      const curr = parseInt(num, 16);
      for (let n = prev + 1; n <= curr; n++) {
        const hex = '0x' + n.toString(16);
        const blockRes = await httpRpc({ jsonrpc: '2.0', id: 1, method: 'eth_getBlockByNumber', params: [hex, false] });
        const block = blockRes && blockRes.result;
        if (!block) continue;
        for (const ws of clients) {
          for (const [subId, ev] of ws.subscriptions.entries()) {
            if (ev === 'newHeads') {
              ws.send(
                JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_subscription',
                  params: { subscription: subId, result: block },
                })
              );
            }
          }
        }
      }
      lastEmittedBlock = num;
    }
  } catch (e) {
    // ignore transient errors
  }
}

async function pollPending() {
  try {
    const res = await httpRpc({ jsonrpc: '2.0', id: 1, method: 'txpool_content', params: [] });
    const pending = (res && res.result && res.result.pending) || {};
    const nextSet = new Set();
    const newTxs = [];
    for (const sender of Object.keys(pending)) {
      const txs = pending[sender] || {};
      for (const k of Object.keys(txs)) {
        const tx = txs[k];
        if (tx && tx.hash) {
          nextSet.add(tx.hash);
          if (!lastPendingSet.has(tx.hash)) newTxs.push(tx.hash);
        }
      }
    }
    if (newTxs.length > 0) {
      for (const ws of clients) {
        for (const [subId, ev] of ws.subscriptions.entries()) {
          if (ev === 'newPendingTransactions') {
            for (const h of newTxs) {
              ws.send(
                JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_subscription',
                  params: { subscription: subId, result: h },
                })
              );
            }
          }
        }
      }
    }
    lastPendingSet = nextSet;
  } catch (e) {
    // ignore
  }
}

setInterval(pollNewHeads, pollIntervalMs);
setInterval(pollPending, pollIntervalMs);

wss.on('connection', (ws) => {
  ws.subscriptions = new Map();
  clients.add(ws);
  ws.on('message', async (data) => {
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (e) {
      return;
    }
    const { id, method, params } = msg || {};
    if (!method) return;

    if (method === 'eth_subscribe') {
      const event = params && params[0];
      const subId = randSubId();
      ws.subscriptions.set(subId, event);
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: subId }));
      return;
    }
    if (method === 'eth_unsubscribe') {
      const subId = params && params[0];
      const ok = ws.subscriptions.delete(subId);
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: !!ok }));
      return;
    }

    // Pass-through other JSON-RPC methods to HTTP endpoint
    try {
      const rpcRes = await httpRpc({ jsonrpc: '2.0', id, method, params: params || [] });
      ws.send(JSON.stringify(rpcRes));
    } catch (e) {
      ws.send(
        JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32603, message: 'Proxy error' } })
      );
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
  });
});



