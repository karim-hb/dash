import { getConfig } from '@/lib/config';
import { fetchChainlinkPrice } from './chainlink';
import { fetchCoinGeckoSimplePrice } from './coingecko';
import { getTokens, upsertToken } from '../market/registry';
import { getUsdPriceForToken } from '../market/priceEngine';

// Kick off periodic oracle updates
let started = false;
export function startOracleUpdates() {
  if (started) return; started = true;
  const cfg = getConfig();
  if (cfg.ENABLE_ORACLES) {
    // Chainlink ETH/USD
    if (cfg.ENABLE_CHAINLINK && cfg.ETH_USD_FEED) {
      const tick = async () => { await fetchChainlinkPrice(cfg.ETH_USD_FEED, 'ETH/USD'); };
      tick();
      setInterval(tick, 30_000);
    }
    // CoinGecko (optional)
    if (cfg.ENABLE_COINGECKO) {
      const tickCg = async () => { await fetchCoinGeckoSimplePrice(['ethereum'], 'usd', 60_000); };
      tickCg();
      setInterval(tickCg, 60_000);
    }

    // Periodically refresh token USD prices for discovered tokens
    const refreshTokens = () => {
      const toks = getTokens();
      for (const t of toks) {
        const p = getUsdPriceForToken(t.address);
        if (p != null) {
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
        }
      }
    };
    refreshTokens();
    setInterval(refreshTokens, 30_000);
  }
}


