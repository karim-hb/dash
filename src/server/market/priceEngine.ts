import tokensCatalog from '../catalog/tokens.json';
import { getOracleFeeds, getTokens } from './registry';
import { getV2PoolsForPair, getV2Reserves } from './reserves';

type TokenInfo = { symbol: string; decimals: number; name: string };

const STABLES = new Set([
  'USDC','USDT','DAI','LUSD','FRAX','sUSD','BUSD','USDP'
]);

const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();

function lookupToken(address: string): TokenInfo | null {
  const info = (tokensCatalog as any)[normalize(address)];
  if (!info) return null;
  return { symbol: info.symbol, decimals: info.decimals, name: info.name };
}

function normalize(a: string) { return a ? a.toLowerCase() : a; }

export function getUsdPriceForToken(address: string): number | null {
  const info = lookupToken(address);
  if (!info) return null;
  if (STABLES.has(info.symbol)) return 1.0;
  if (info.symbol === 'WETH') return getEthUsdPrice();
  // Try routing via WETH on V2 pools
  const via = getUsdPriceViaWeth(address);
  if (via != null) return via;
  return null;
}

export function getEthUsdPrice(): number | null {
  const feeds = getOracleFeeds();
  // Prefer Chainlink ETH/USD
  const cl = feeds.find(f => f.provider === 'Chainlink' && (f.pair?.toUpperCase() === 'ETH/USD'));
  if (cl && typeof cl.price_usd === 'number') return cl.price_usd;
  // Fallback CoinGecko
  const cg = feeds.find(f => f.provider === 'CoinGecko' && (f.pair?.toUpperCase() === 'ETH/USD'));
  if (cg && typeof cg.price_usd === 'number') return cg.price_usd;
  return null;
}

export function computeV2TvlUsd(token0: string, token1: string, reserve0: bigint, reserve1: bigint): number | null {
  const i0 = lookupToken(token0);
  const i1 = lookupToken(token1);
  const p0 = getUsdPriceForToken(token0);
  const p1 = getUsdPriceForToken(token1);
  if (!i0 || !i1 || p0 == null || p1 == null) return null;
  const q0 = Number(reserve0) / 10 ** i0.decimals;
  const q1 = Number(reserve1) / 10 ** i1.decimals;
  const tvl = q0 * p0 + q1 * p1;
  if (!isFinite(tvl)) return null;
  return tvl;
}

export function getUsdPriceViaWeth(token: string): number | null {
  const t = token.toLowerCase();
  if (t === WETH_ADDR) return getEthUsdPrice();
  const ethUsd = getEthUsdPrice();
  if (ethUsd == null) return null;
  const pools = getV2PoolsForPair(t, WETH_ADDR);
  let bestUsd: number | null = null;
  for (const pool of pools) {
    const res = getV2Reserves(pool);
    if (!res) continue;
    // find which side is token
    const i0 = lookupToken(res.token0);
    const i1 = lookupToken(res.token1);
    if (!i0 || !i1) continue;
    let priceWeth = 0;
    if (res.token0 === t && res.token1 === WETH_ADDR) {
      const q0 = Number(res.reserve0) / 10 ** i0.decimals;
      const q1 = Number(res.reserve1) / 10 ** i1.decimals;
      if (q0 > 0) priceWeth = q1 / q0;
    } else if (res.token1 === t && res.token0 === WETH_ADDR) {
      const q0 = Number(res.reserve0) / 10 ** i0.decimals;
      const q1 = Number(res.reserve1) / 10 ** i1.decimals;
      if (q1 > 0) priceWeth = q0 / q1;
    } else { continue; }
    if (!isFinite(priceWeth) || priceWeth <= 0) continue;
    const usd = priceWeth * ethUsd;
    if (isFinite(usd) && usd > 0) {
      if (bestUsd == null) bestUsd = usd;
      else bestUsd = (bestUsd + usd) / 2; // rough blend if multiple pools
    }
  }
  return bestUsd;
}


