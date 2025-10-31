import { getConfig } from '@/lib/config';
import { fetchCoinGeckoSimplePrice } from './coingecko';
import { getTokens, upsertToken } from '../market/registry';
import { getUsdPriceForToken } from '../market/priceEngine';
import { startOracleAggregator } from './oracleAggregator';

// Kick off periodic oracle updates
let started = false;
export function startOracleUpdates() {
  if (started) return; started = true;
  console.log('🛰️ Starting oracle updates...');
  const cfg = getConfig();
  console.log(`🛰️ Config loaded: ENABLE_ORACLES=${cfg.ENABLE_ORACLES}, ENABLE_CHAINLINK=${cfg.ENABLE_CHAINLINK}`);
  if (cfg.ENABLE_ORACLES) {
    console.log('🛰️ Oracles enabled');
    startOracleAggregator();

    // Nethermind on-chain price discovery (DEX-based)
    console.log('🔗 Starting Nethermind DEX price discovery...');
    const dexPriceInterval = setInterval(async () => {
      try {
        const tokens = getTokens().filter(t => !t.price_usd && t.symbol && !t.symbol.startsWith('UNK-'));
        if (tokens.length > 0) {
          console.log(`🔗 Checking DEX prices for ${tokens.length} tokens without prices`);
          // The price engine will automatically check DEX prices when called
        }
      } catch (e) {
        console.log(`🔗 DEX price discovery error: ${e.message}`);
      }
    }, 45_000);

    // Periodically refresh token USD prices for discovered tokens
    const refreshTokens = () => {
      const toks = getTokens();
      let updated = 0;
      for (const t of toks) {
        const p = getUsdPriceForToken(t.address);
        upsertToken({
          address: t.address,
          symbol: t.symbol,
          decimals: t.decimals,
          price_usd: p,
          change_24h: t.change_24h,
          volume_24h_usd: t.volume_24h_usd,
          mcap_onchain_usd: t.mcap_onchain_usd,
          mcap_circ_usd: t.mcap_circ_usd,
          holders_est: t.holders_est,
          liquidity_usd: t.liquidity_usd,
          primary_pool: t.primary_pool,
        });
        if (p != null) updated++;
      }
      if (updated > 0) {
        console.log(`💰 Updated ${updated}/${toks.length} token prices`);
      }
    };
    refreshTokens();
    setInterval(refreshTokens, 30_000);
  } else {
    console.log('🛰️ Oracles disabled in config');
  }
}


