import { getWsClient } from '../../rpc/wsClient';
import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { upsertPool, upsertToken, getPools } from '../../market/registry';
import tokensCatalog from '../../catalog/tokens.json';
import { computeV2TvlUsd, getUsdPriceForToken } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { id } from 'ethers';
import { setV2Reserves } from '../../market/reserves';

const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
const SYNC_TOPIC = '0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1';
const SWAP_TOPIC = id('Swap(address,uint256,uint256,uint256,uint256,address)');

const discoveredPairs = new Set<string>();

function hexToAddress(topic: string): string {
  // topics are 32 bytes, address is last 20 bytes
  if (!topic || topic.length < 66) return '0x0000000000000000000000000000000000000000';
  return '0x' + topic.slice(26);
}

function parseAddressFromDataSlot(data: string, slotIndex: number): string {
  const clean = data.replace(/^0x/, '');
  const start = slotIndex * 64;
  const slot = clean.slice(start, start + 64);
  return '0x' + slot.slice(24);
}

function parseUintFromDataSlot(data: string, slotIndex: number): bigint {
  const clean = data.replace(/^0x/, '');
  const start = slotIndex * 64;
  const slot = clean.slice(start, start + 64);
  return BigInt('0x' + slot);
}

async function handlePairCreated(log: any, dexName: string) {
  try {
    const token0 = hexToAddress(log.topics[1]).toLowerCase();
    const token1 = hexToAddress(log.topics[2]).toLowerCase();
    const pair = parseAddressFromDataSlot(log.data, 0).toLowerCase();

    if (discoveredPairs.has(pair)) return;
    discoveredPairs.add(pair);

    upsertPool({
      dex: dexName,
      version: 'V2',
      address: pair,
      token0,
      token1,
      fee_bps: 30, // default typical for V2 (approx)
      tvl_usd: null,
      volume_24h_usd: null,
      fees_24h_usd: null,
      utilization: null,
    });

    const t0Meta: any = (tokensCatalog as any)[token0];
    if (t0Meta) upsertToken({ address: token0, symbol: t0Meta.symbol, decimals: t0Meta.decimals, price_usd: null });
    const t1Meta: any = (tokensCatalog as any)[token1];
    if (t1Meta) upsertToken({ address: token1, symbol: t1Meta.symbol, decimals: t1Meta.decimals, price_usd: null });
  } catch {}
}

async function handleSync(log: any) {
  try {
    const pair = (log.address || '').toLowerCase();
    const r0 = parseUintFromDataSlot(log.data, 0);
    const r1 = parseUintFromDataSlot(log.data, 1);
    const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
    if (!pool) return;
    setV2Reserves(pair, pool.token0, pool.token1, r0, r1);
    const tvl = computeV2TvlUsd(pool.token0, pool.token1, r0, r1);
    if (tvl != null) {
      upsertPool({
        dex: pool.dex,
        version: pool.version,
        address: pool.address,
        token0: pool.token0,
        token1: pool.token1,
        fee_bps: pool.fee_bps,
        tvl_usd: tvl,
        volume_24h_usd: pool.volume_24h_usd,
        fees_24h_usd: pool.fees_24h_usd,
        utilization: pool.utilization,
      });
    }
  } catch {}
}

export async function startUniswapV2Indexer(): Promise<void> {
  if (!config.ENABLE_AMM_UNIV2) return;
  const factory = (amm as any).uniswap_v2?.factory;
  if (!factory) return;

  const ws = getWsClient();

  // Backfill recent PairCreated events
  try {
    const latestHex = await ws.rpc('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);
    const from = Math.max(0, latest - config.BACKFILL_BLOCKS);
    const logs = await ws.rpc('eth_getLogs', [{
      address: factory,
      topics: [PAIR_CREATED_TOPIC],
      fromBlock: '0x' + from.toString(16),
      toBlock: latestHex,
    }]);
    for (const log of logs || []) await handlePairCreated(log, 'Uniswap');
  } catch (e) {
    console.warn('UniswapV2 backfill failed', e);
  }

  // Live subscriptions
  await ws.subscribeLogs({ address: factory, topics: [PAIR_CREATED_TOPIC] }, (res) => {
    handlePairCreated(res, 'Uniswap');
  });

  // Subscribe to Sync for discovered pairs (broad filter over topic, no address list)
  await ws.subscribeLogs({ topics: [SYNC_TOPIC] }, (res) => {
    handleSync(res);
  });

  // Subscribe to Swap events (compute 24h volume/fees)
  await ws.subscribeLogs({ topics: [SWAP_TOPIC] }, (log) => {
    try {
      const pair = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
      if (!pool) return;
      const d = log.data.replace(/^0x/, '');
      if (d.length < 64 * 4) return;
      const a0in = BigInt('0x' + d.slice(0, 64));
      const a1in = BigInt('0x' + d.slice(64, 128));
      const a0out = BigInt('0x' + d.slice(128, 192));
      const a1out = BigInt('0x' + d.slice(192, 256));
      let amount: bigint = BigInt(0);
      let token: string = pool.token0;
      const zero = BigInt(0);
      if (a0in > zero) { amount = a0in; token = pool.token0; }
      else if (a1in > zero) { amount = a1in; token = pool.token1; }
      else if (a0out > zero) { amount = a0out; token = pool.token0; }
      else if (a1out > zero) { amount = a1out; token = pool.token1; }
      const price = getUsdPriceForToken(token);
      const meta: any = (tokensCatalog as any)[token];
      if (price == null || !meta) return;
      const qty = Number(amount) / 10 ** meta.decimals;
      const usd = qty * price;
      const feeBps = pool.fee_bps || 30;
      const feeUsd = usd * (feeBps / 10000);
      if (isFinite(usd) && usd > 0) recordSwapUsd(pair, usd, feeUsd);
    } catch {}
  });
}


