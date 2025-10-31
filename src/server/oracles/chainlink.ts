import { ethers } from 'ethers';
import AggregatorV3 from '../abi/ChainlinkAggregatorV3.json';
import { getConfig } from '@/lib/config';
import { upsertOracleFeed } from '../market/registry';

let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | null = null;

function getProvider(): ethers.Provider {
  if (provider) return provider;
  const cfg = getConfig();
  // Prefer WS if provided
  if (cfg.EXECUTION_WS_URL.startsWith('ws')) {
    provider = new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL);
  } else {
    provider = new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);
  }
  return provider;
}

export async function fetchChainlinkPrice(feedAddress: string, pairLabel = 'ETH/USD'): Promise<void> {
  console.log(`🟡 Fetching Chainlink price for ${pairLabel} from ${feedAddress}`);
  try {
    const pv = getProvider();
    console.log(`🟡 Using provider for Chainlink: ${pv ? 'OK' : 'NULL'}`);

    const agg = new ethers.Contract(feedAddress, AggregatorV3 as any, pv);
    console.log(`🟡 Created contract for ${pairLabel}`);

    const [decimals, rd] = await Promise.all([
      agg.decimals(),
      agg.latestRoundData(),
    ]);

    console.log(`🟡 Got data for ${pairLabel}: decimals=${decimals}, answer=${rd.answer}, updatedAt=${rd.updatedAt}`);

    const ans = Number(rd.answer) / 10 ** Number(decimals);
    const updatedAt = Number(rd.updatedAt) * 1000;

    console.log(`🟡 Calculated price for ${pairLabel}: $${ans}, updated: ${new Date(updatedAt).toISOString()}`);

    console.log(`📡 Calling upsertOracleFeed for ${pairLabel}`);
    upsertOracleFeed(`chainlink:${pairLabel}`, {
      provider: 'Chainlink',
      pair: pairLabel,
      feed_address: feedAddress,
      price_usd: isFinite(ans) ? ans : null,
      last_updated: isFinite(updatedAt) ? updatedAt : null,
      heartbeat_sec: null,
      status: 'healthy',
      deviation_vs_spot_pct: null,
    });
    console.log(`✅ Chainlink price updated for ${pairLabel}: $${ans}`);
  } catch (e) {
    console.log(`❌ Chainlink fetch failed for ${pairLabel}: ${e.message}`);
    upsertOracleFeed(`chainlink:${pairLabel}`, {
      provider: 'Chainlink',
      pair: pairLabel,
      feed_address: feedAddress,
      price_usd: null,
      last_updated: null,
      heartbeat_sec: null,
      status: 'error',
      deviation_vs_spot_pct: null,
    });
  }
}


