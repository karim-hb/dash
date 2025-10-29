import { getWsClient } from '../../rpc/wsClient';
import { config } from '@/lib/config';
import amm from '../../catalog/amm.json';
import { upsertPool, getPools } from '../../market/registry';
import { recordSwapUsd } from '../../market/poolStats';
import { getUsdPriceForToken } from '../../market/priceEngine';
import tokensCatalog from '../../catalog/tokens.json';
import { id } from 'ethers';

const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
const SWAP_TOPIC = id('Swap(address,uint256,uint256,uint256,uint256,address)');

function hexToAddress(topic: string): string {
  if (!topic || topic.length < 66) return '0x0000000000000000000000000000000000000000';
  return '0x' + topic.slice(26);
}

function parseAddressFromDataSlot(data: string, slotIndex: number): string {
  const clean = data.replace(/^0x/, '');
  const start = slotIndex * 64;
  const slot = clean.slice(start, start + 64);
  return '0x' + slot.slice(24);
}

async function handlePairCreated(log: any) {
  try {
    const token0 = hexToAddress(log.topics[1]).toLowerCase();
    const token1 = hexToAddress(log.topics[2]).toLowerCase();
    const pair = parseAddressFromDataSlot(log.data, 0).toLowerCase();
    upsertPool({
      dex: 'Sushi',
      version: 'V2',
      address: pair,
      token0,
      token1,
      fee_bps: 30,
      tvl_usd: null,
      volume_24h_usd: null,
      fees_24h_usd: null,
      utilization: null,
    });
  } catch {}
}

export async function startSushiV2Indexer(): Promise<void> {
  if (!config.ENABLE_SUSHI) return;
  const factory = (amm as any).sushiswap_v2?.factory;
  if (!factory) return;
  const ws = getWsClient();

  try {
    const latestHex = await ws.rpc('eth_blockNumber', []);
    const latest = parseInt(latestHex, 16);
    const from = Math.max(0, latest - config.BACKFILL_BLOCKS);
    const logs = await ws.rpc('eth_getLogs', [{ address: factory, topics: [PAIR_CREATED_TOPIC], fromBlock: '0x' + from.toString(16), toBlock: latestHex }]);
    for (const log of logs || []) await handlePairCreated(log);
  } catch (e) { console.warn('SushiV2 backfill failed', e); }

  await ws.subscribeLogs({ address: factory, topics: [PAIR_CREATED_TOPIC] }, (res) => handlePairCreated(res));

  // Swap events for Sushi V2
  await ws.subscribeLogs({ topics: [SWAP_TOPIC] }, (log) => {
    try {
      const pair = (log.address || '').toLowerCase();
      const pool = getPools().find((p: any) => p.address.toLowerCase() === pair);
      if (!pool || pool.dex !== 'Sushi') return;
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


