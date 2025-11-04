import tokensCatalog from '../catalog/tokens.json';
import { getPools, getTokens, upsertToken } from '../market/registry';
import { ethers } from 'ethers';
import { getProvider } from '../modules/provider';
import { initMongo, getDb } from '@/lib/db/mongo';

// Simple linear counting estimator (bitmap of m bits)
class BitEstimator {
  private bits: Uint8Array;
  private m: number;
  private zeroCount: number;

  constructor(mBits = 1 << 18) { // 262,144 bits
    this.m = mBits;
    this.bits = new Uint8Array(this.m >> 3);
    this.zeroCount = this.m; // start with all zero
  }

  add(hashHex: string) {
    const h = BigInt('0x' + hashHex.slice(2));
    const idx = Number(h % BigInt(this.m));
    const byteIndex = idx >> 3;
    const mask = 1 << (idx & 7);
    const before = this.bits[byteIndex];
    if ((before & mask) === 0) {
      this.bits[byteIndex] = before | mask;
      this.zeroCount -= 1;
    }
  }

  estimate(): number {
    const V = this.zeroCount;
    if (V <= 0) return this.m * Math.log(this.m / 1); // saturated
    return Math.round(-this.m * Math.log(V / this.m));
  }
}

const estimators = new Map<string, BitEstimator>();

function getEstimator(token: string): BitEstimator {
  const k = token.toLowerCase();
  let e = estimators.get(k);
  if (!e) { e = new BitEstimator(); estimators.set(k, e); }
  return e;
}

function toAddressFromTopic(topic: string): string { return '0x' + topic.slice(26).toLowerCase(); }

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const TRANSFER_IFACE = new ethers.Interface(['event Transfer(address indexed from, address indexed to, uint256 value)']);

export async function startHoldersBackfillAndPolling(): Promise<void> {
  const provider = getProvider();
  let lastBlock = 0;
  const pendingBalanceChecks = new Map<string, Set<string>>(); // token -> addresses
  const LOOKBACK_BLOCKS = Number(process.env.HOLDERS_LOOKBACK_BLOCKS || '100000');

  const tick = async () => {
    try {
      const latest = await provider.getBlockNumber();
      const from = lastBlock > 0 ? lastBlock + 1 : Math.max(0, latest - LOOKBACK_BLOCKS);
      lastBlock = latest;

      // Build tracked address list: known catalog + discovered tokens from pools/registry
      const addrSet = new Set<string>(Object.keys(tokensCatalog).map(a => a.toLowerCase()));
      for (const p of getPools()) { addrSet.add(p.token0.toLowerCase()); addrSet.add(p.token1.toLowerCase()); }
      for (const t of getTokens()) { addrSet.add(t.address.toLowerCase()); }
      const addresses = Array.from(addrSet);
      if (addresses.length === 0) return;

      // Chunk addresses to keep payload smaller
      const chunkSize = 50;
      const updatedTokens = new Set<string>();
      const holderOps: any[] = [];
      for (let i = 0; i < addresses.length; i += chunkSize) {
        const chunk = addresses.slice(i, i + chunkSize);
        const logs = await provider.getLogs({ address: chunk, topics: [TRANSFER_TOPIC], fromBlock: from, toBlock: latest });
        for (const log of logs || []) {
          const token = (log.address || '').toLowerCase();
          let fromAddr = '';
          let toAddr = '';
          try {
            const parsed = TRANSFER_IFACE.parseLog({ topics: log.topics, data: log.data });
            if (parsed) {
              fromAddr = String(parsed.args[0]).toLowerCase();
              toAddr = String(parsed.args[1]).toLowerCase();
            }
          } catch {
            // Fallback to topic slicing if parse fails (rare ERC-20 variants)
            fromAddr = toAddressFromTopic(log.topics?.[1] || '');
            toAddr = toAddressFromTopic(log.topics?.[2] || '');
          }
          if (fromAddr && fromAddr !== '0x0000000000000000000000000000000000000000') {
            getEstimator(token).add(fromAddr);
            const s = pendingBalanceChecks.get(token) || new Set<string>();
            s.add(fromAddr);
            pendingBalanceChecks.set(token, s);
          }
          if (toAddr && toAddr !== '0x0000000000000000000000000000000000000000') {
            getEstimator(token).add(toAddr);
            const s = pendingBalanceChecks.get(token) || new Set<string>();
            s.add(toAddr);
            pendingBalanceChecks.set(token, s);
          }

          // Build persistence ops for exact unique holders
          if (fromAddr && fromAddr !== '0x0000000000000000000000000000000000000000') {
            holderOps.push({
              updateOne: {
                filter: { token, holder: fromAddr },
                update: { $setOnInsert: { token, holder: fromAddr, first_seen: new Date() } },
                upsert: true,
              }
            });
            updatedTokens.add(token);
          }
          if (toAddr && toAddr !== '0x0000000000000000000000000000000000000000') {
            holderOps.push({
              updateOne: {
                filter: { token, holder: toAddr },
                update: { $setOnInsert: { token, holder: toAddr, first_seen: new Date() } },
                upsert: true,
              }
            });
            updatedTokens.add(token);
          }
        }
      }

      // Persist to Mongo and compute exact counts for updated tokens
      try {
        await initMongo(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/tracker');
        const db = getDb();
        const setCol = db.collection('token_holders_set');
        try { await setCol.createIndex({ token: 1, holder: 1 }, { unique: true }); } catch {}
        if (holderOps.length > 0) {
          try { await setCol.bulkWrite(holderOps, { ordered: false }); } catch {}
        }
        // Update holder counts and push into registry
        for (const token of Array.from(updatedTokens)) {
          let exactCount = 0;
          try { exactCount = await setCol.countDocuments({ token }); } catch {}
          const t = getTokens().find(x => x.address.toLowerCase() === token);
          if (!t) continue;
          const fallbackEst = getEstimator(token).estimate();
          const holders = exactCount > 0 ? exactCount : (fallbackEst > 0 ? fallbackEst : null);
          upsertToken({
            address: t.address,
            symbol: t.symbol,
            decimals: t.decimals,
            price_usd: t.price_usd,
            change_24h: t.change_24h,
            volume_24h_usd: t.volume_24h_usd,
            mcap_onchain_usd: t.mcap_onchain_usd,
            mcap_circ_usd: t.mcap_circ_usd,
            holders_est: holders,
            liquidity_usd: t.liquidity_usd,
            primary_pool: t.primary_pool,
            active: t.active,
            heartbeat: t.heartbeat || undefined,
          });
          try {
            await db.collection('token_holders').updateOne(
              { address: t.address.toLowerCase() },
              { $set: { address: t.address, holders_est: holders, updated_at: new Date() } },
              { upsert: true }
            );
          } catch {}
        }

        // Balance > 0 enforcement (cap checks per tick)
        const erc20Abi = ['function balanceOf(address) view returns (uint256)'];
        const maxChecksPerToken = 200;
        for (const [token, addrSet] of pendingBalanceChecks.entries()) {
          const t = getTokens().find(x => x.address.toLowerCase() === token);
          if (!t) continue;
          const c = new ethers.Contract(t.address, erc20Abi, provider);
          const addrs = Array.from(addrSet).slice(0, maxChecksPerToken);
          const calls = addrs.map(a => c.balanceOf(a).then((b: bigint) => ({ a, b })).catch(() => ({ a, b: BigInt(0) })));
          const results = await Promise.all(calls);
          for (const { a, b } of results) {
            if (b > BigInt(0)) {
              try { await setCol.updateOne({ token, holder: a }, { $set: { token, holder: a } }, { upsert: true }); } catch {}
            } else {
              try { await setCol.deleteOne({ token, holder: a }); } catch {}
            }
          }
          pendingBalanceChecks.set(token, new Set<string>());
        }
      } catch {}
    } catch (e) {
      // ignore
    }
  };

  await tick();
  setInterval(tick, 30_000);
}


