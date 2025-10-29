import { getWsClient } from '../rpc/wsClient';
import tokensCatalog from '../catalog/tokens.json';
import { getPools, getTokens, upsertToken } from '../market/registry';

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

export async function startHoldersBackfillAndPolling(): Promise<void> {
  const ws = getWsClient();
  let lastBlock = 0;

  const tick = async () => {
    try {
      const latestHex = await ws.rpc('eth_blockNumber', []);
      const latest = parseInt(latestHex, 16);
      const from = lastBlock > 0 ? lastBlock + 1 : Math.max(0, latest - 1000);
      lastBlock = latest;

      // Build tracked address list: known catalog + discovered tokens from pools/registry
      const addrSet = new Set<string>(Object.keys(tokensCatalog).map(a => a.toLowerCase()));
      for (const p of getPools()) { addrSet.add(p.token0.toLowerCase()); addrSet.add(p.token1.toLowerCase()); }
      for (const t of getTokens()) { addrSet.add(t.address.toLowerCase()); }
      const addresses = Array.from(addrSet);
      if (addresses.length === 0) return;

      // Chunk addresses to keep payload smaller
      const chunkSize = 50;
      for (let i = 0; i < addresses.length; i += chunkSize) {
        const chunk = addresses.slice(i, i + chunkSize);
        const logs = await ws.rpc('eth_getLogs', [{
          address: chunk,
          topics: [TRANSFER_TOPIC],
          fromBlock: '0x' + from.toString(16),
          toBlock: latestHex,
        }]);
        for (const log of logs || []) {
          const token = (log.address || '').toLowerCase();
          const fromAddr = toAddressFromTopic(log.topics?.[1] || '');
          const toAddr = toAddressFromTopic(log.topics?.[2] || '');
          if (fromAddr && fromAddr !== '0x0000000000000000000000000000000000000000') getEstimator(token).add(fromAddr);
          if (toAddr && toAddr !== '0x0000000000000000000000000000000000000000') getEstimator(token).add(toAddr);
        }
      }

      // Push estimates into registry tokens
      for (const t of getTokens()) {
        const est = getEstimator(t.address).estimate();
        if (est && est > 0) {
          upsertToken({
            address: t.address,
            symbol: t.symbol,
            decimals: t.decimals,
            price_usd: t.price_usd,
            change_24h: t.change_24h,
            volume_24h_usd: t.volume_24h_usd,
            mcap_onchain_usd: t.mcap_onchain_usd,
            mcap_circ_usd: t.mcap_circ_usd,
            holders_est: est,
            liquidity_usd: t.liquidity_usd,
            primary_pool: t.primary_pool,
          });
        }
      }
    } catch (e) {
      // ignore
    }
  };

  await tick();
  setInterval(tick, 30_000);
}


