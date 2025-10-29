import { getWsClient } from '../../rpc/wsClient';
import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { upsertPool, upsertToken, getPools } from '../../market/registry';
import { getUsdPriceForToken } from '../../market/priceEngine';
import { recordSwapUsd } from '../../market/poolStats';
import { id } from 'ethers';
import { getWsClient } from '../../rpc/wsClient';
import tokensCatalog from '../../catalog/tokens.json';

const POOL_CREATED_TOPIC = '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a3e3d7f0eafc7e23c9c';
const SWAP_TOPIC_V3 = id('Swap(address,address,int256,int256,uint160,uint128,int24)');

function hexToAddress(topic: string): string {
  if (!topic || topic.length < 66) return '0x0000000000000000000000000000000000000000';
  return '0x' + topic.slice(26);
}

function parseUintFromDataSlot(data: string, slotIndex: number): bigint {
  const clean = data.replace(/^0x/, '');
  const start = slotIndex * 64;
  const slot = clean.slice(start, start + 64);
  return BigInt('0x' + slot);
}

function parseAddressFromDataSlot(data: string, slotIndex: number): string {
  const clean = data.replace(/^0x/, '');
  const start = slotIndex * 64;
  const slot = clean.slice(start, start + 64);
  return '0x' + slot.slice(24);
}

async function handlePoolCreated(log: any) {
  try {
    const token0 = hexToAddress(log.topics[1]).toLowerCase();
    const token1 = hexToAddress(log.topics[2]).toLowerCase();
    const fee = Number(parseUintFromDataSlot(log.data, 0));
    const pool = parseAddressFromDataSlot(log.data, 2).toLowerCase();
    const feeBps = Math.round(fee / 100); // 500->5bps, 3000->30bps, 10000->100bps

    upsertPool({
      dex: 'Uniswap',
      version: 'V3',
      address: pool,
      token0,
      token1,
      fee_bps: feeBps,
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

function pad32(addr: string): string { return addr.toLowerCase().replace(/^0x/, '').padStart(64, '0'); }

async function updateV3TvlOnce(poolAddr: string, token0: string, token1: string) {
  try {
    const ws = getWsClient();
    const data = '0x70a08231'; // balanceOf(address)
    const call0 = await ws.rpc('eth_call', [{ to: token0, data: data + pad32(poolAddr) }, 'latest']);
    const call1 = await ws.rpc('eth_call', [{ to: token1, data: data + pad32(poolAddr) }, 'latest']);
    const bal0 = BigInt(call0 || '0x0');
    const bal1 = BigInt(call1 || '0x0');
    const meta0: any = (tokensCatalog as any)[token0];
    const meta1: any = (tokensCatalog as any)[token1];
    const p0 = getUsdPriceForToken(token0);
    const p1 = getUsdPriceForToken(token1);
    let tvl = 0;
    if (meta0 && p0 != null) tvl += Number(bal0) / 10 ** meta0.decimals * p0;
    if (meta1 && p1 != null) tvl += Number(bal1) / 10 ** meta1.decimals * p1;
    if (isFinite(tvl) && tvl > 0) {
      const existing = getPools().find((p: any) => p.address.toLowerCase() === poolAddr.toLowerCase());
      if (existing) {
        upsertPool({
          dex: existing.dex,
          version: existing.version,
          address: existing.address,
          token0: existing.token0,
          token1: existing.token1,
          fee_bps: existing.fee_bps,
          tvl_usd: tvl,
          volume_24h_usd: existing.volume_24h_usd,
          fees_24h_usd: existing.fees_24h_usd,
          utilization: existing.utilization,
        });
      }
    }
  } catch {}
}

export async function startUniswapV3Indexer(): Promise<void> {
  if (!config.ENABLE_AMM_UNIV3) return;
  const factory = (amm as any).uniswap_v3?.factory;
  if (!factory) return;
  const ws = getWsClient();

  // Backfill pool created
  try {
    const latestHex = await ws.rpc('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);
    const from = Math.max(0, latest - config.BACKFILL_BLOCKS);
    const logs = await ws.rpc('eth_getLogs', [{ address: factory, topics: [POOL_CREATED_TOPIC], fromBlock: '0x' + from.toString(16), toBlock: latestHex }]);
    for (const log of logs || []) await handlePoolCreated(log);
  } catch (e) { console.warn('UniswapV3 backfill failed', e); }

  await ws.subscribeLogs({ address: factory, topics: [POOL_CREATED_TOPIC] }, (res) => handlePoolCreated(res));

  // Subscribe to V3 Swap events across pools
  await ws.subscribeLogs({ topics: [SWAP_TOPIC_V3] }, (log) => {
    try {
      const poolAddr = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === poolAddr);
      if (!pool) return;
      const d = log.data.replace(/^0x/, '');
      if (d.length < 64 * 5) return;
      const amount0 = BigInt('0x' + d.slice(0, 64));
      const amount1 = BigInt('0x' + d.slice(64, 128));
      // Amounts are signed; convert to signed BigInt
      const toSigned = (x: bigint) => {
        const msb = (x >> BigInt(255)) & BigInt(1);
        return msb === BigInt(1) ? (x - (BigInt(1) << BigInt(256))) : x;
      };
      const a0 = toSigned(amount0);
      const a1 = toSigned(amount1);
      // Choose leg with known price
      const meta0: any = (tokensCatalog as any)[pool.token0];
      const meta1: any = (tokensCatalog as any)[pool.token1];
      const p0 = getUsdPriceForToken(pool.token0);
      const p1 = getUsdPriceForToken(pool.token1);
      let usd = 0;
      if (p0 != null && meta0) usd = Math.abs(Number(a0)) / 10 ** meta0.decimals * p0;
      else if (p1 != null && meta1) usd = Math.abs(Number(a1)) / 10 ** meta1.decimals * p1;
      if (!isFinite(usd) || usd <= 0) return;
      const feeBps = pool.fee_bps || 30;
      const feeUsd = usd * (feeBps / 10000);
      recordSwapUsd(poolAddr, usd, feeUsd);
    } catch {}
  });

  // Periodically update TVL for V3 pools via balanceOf
  setInterval(() => {
    try {
      for (const p of getPools().filter((x: any) => x.version === 'V3')) {
        updateV3TvlOnce(p.address, p.token0, p.token1);
      }
    } catch {}
  }, 60_000);
}


