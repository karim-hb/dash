import tokensCatalog from '../catalog/tokens.json';
import { getOracleFeeds, getTokens, getPools } from './registry';
import { getV2Reserves, getV2PoolsForPair } from './reserves';
import { ethers } from 'ethers';

// Global provider instance (avoid circular imports)
let provider: ethers.Provider | null = null;

function getProvider(): ethers.Provider {
  if (provider) return provider;

  // Use environment or default Nethermind RPC
  const rpcUrl = process.env.EXECUTION_WS_URL || process.env.EXECUTION_RPC_URL || 'http://127.0.0.1:8545';

  if (rpcUrl.startsWith('ws')) {
    provider = new ethers.WebSocketProvider(rpcUrl);
  } else {
    provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  return provider;
}

type TokenInfo = { symbol: string; decimals: number; name: string };

const STABLES = new Set([
  'USDC','USDT','DAI','LUSD','FRAX','sUSD','BUSD','USDP'
]);

const WETH_ADDR = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
let ammCatalog: any | null = null;
function getAmmCatalog(): any {
  if (!ammCatalog) {
    try { ammCatalog = require('../catalog/amm.json'); } catch { ammCatalog = {}; }
  }
  return ammCatalog;
}

function lookupToken(address: string): TokenInfo | null {
  const addr = normalize(address);

  // First try the catalog
  let info = (tokensCatalog as any)[addr];
  if (!info) {
    // Try original case (checksummed)
    info = (tokensCatalog as any)[address];
  }
  if (info) {
    return { symbol: info.symbol, decimals: info.decimals, name: info.name || '' };
  }

  // If not in catalog, check discovered tokens in registry
  const discoveredTokens = getTokens();
  const discovered = discoveredTokens.find(t => normalize(t.address) === addr);
  if (discovered) {
    return {
      symbol: discovered.symbol || 'UNK',
      decimals: discovered.decimals || 18,
      name: discovered.symbol || 'Unknown Token'
    };
  }

  return null;
}

function normalize(a: string) { return a ? a.toLowerCase() : a; }

export async function getUsdPriceForToken(address: string): Promise<number | null> {
  const info = lookupToken(address);
  if (!info) return null;

  // Handle known symbols
  if (STABLES.has(info.symbol)) return 1.0;
  if (info.symbol === 'WETH') return getEthUsdPrice();
  if (info.symbol === 'ETH') return getEthUsdPrice();

  // ONLY Nethermind DEX prices (no external API fallbacks)
  try {
    const dexPrice = await getNethermindDexPrice(address);
    if (dexPrice && dexPrice > 0) {
      console.log(`🔗 Nethermind DEX price for ${info.symbol}: $${dexPrice.toFixed(4)}`);
      return dexPrice;
    }
  } catch (e: any) {
    console.log(`⚠️ Nethermind DEX price failed for ${address}: ${e?.message || e}`);
  }

  // ONLY Chainlink oracles (no external APIs)
  const chainlinkPrice = getChainlinkPriceForToken(address);
  if (chainlinkPrice) {
    console.log(`🟡 Chainlink price for ${info.symbol}: $${chainlinkPrice.toFixed(4)}`);
    return chainlinkPrice;
  }

  // NO external API fallbacks - return null if no on-chain data available
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

export async function computeV2TvlUsd(token0: string, token1: string, reserve0: bigint, reserve1: bigint): Promise<number | null> {
  const i0 = lookupToken(token0);
  const i1 = lookupToken(token1);
  const p0 = await getUsdPriceForToken(token0);
  const p1 = await getUsdPriceForToken(token1);
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

function getChainlinkPriceForToken(address: string): number | null {
  const feeds = getOracleFeeds();
  const addr = normalize(address);

  // Find Chainlink feed for this token
  const feed = feeds.find(f =>
    f.provider === 'Chainlink' &&
    f.feed_address &&
    normalize(f.feed_address) === addr
  );

  return feed?.price_usd || null;
}

function getCoingeckoPriceForToken(address: string): number | null {
  const feeds = getOracleFeeds();
  const info = lookupToken(address);

  if (!info) return null;

  // First try to find by symbol in CoinGecko feeds
  const symbolFeed = feeds.find(f =>
    f.provider === 'CoinGecko' &&
    f.pair?.toLowerCase().startsWith(info.symbol.toLowerCase() + '/')
  );

  if (symbolFeed?.price_usd) return symbolFeed.price_usd;

  // Fallback: try to find any CoinGecko feed with matching symbol
  const anyCgFeed = feeds.find(f =>
    f.provider === 'CoinGecko' &&
    f.pair?.split('/')[0].toLowerCase() === info.symbol.toLowerCase()
  );

  return anyCgFeed?.price_usd || null;
}

// Nethermind DEX price fetching via direct RPC calls
async function getNethermindDexPrice(tokenAddress: string): Promise<number | null> {
  // Reduced logging to prevent spam
  try {
    const pv = getProvider();
    if (!pv) return null;

    const token = normalize(tokenAddress);

    // Try Uniswap V2 pools first (simpler) by scanning registry pools
    const allPools = getPools();
    const v2Candidates = allPools.filter(p => (p.version === 'V2') && (
      (p.token0.toLowerCase() === token && p.token1.toLowerCase() === WETH_ADDR) ||
      (p.token1.toLowerCase() === token && p.token0.toLowerCase() === WETH_ADDR)
    ));
    if (v2Candidates.length > 0) {
      // Prefer pool with largest TVL
      v2Candidates.sort((a, b) => (b.tvl_usd || 0) - (a.tvl_usd || 0));
      const pool = v2Candidates[0];
      const reservesData = await pv.call({ to: pool.address, data: '0x0902f1ac' });
      if (reservesData && reservesData.length >= 130) {
        const reserve0 = BigInt('0x' + reservesData.slice(2, 66));
        const reserve1 = BigInt('0x' + reservesData.slice(66, 130));
        if (reserve0 > BigInt(0) && reserve1 > BigInt(0)) {
          const tokenInfo = lookupToken(token);
          if (!tokenInfo) return null;
          const ethPrice = getEthUsdPrice();
          if (!ethPrice) return null;
          const decimals = tokenInfo.decimals;
          const wethDecimals = 18;
          let price: number;
          if (pool.token0.toLowerCase() === token) {
            price = (Number(reserve1) / Number(reserve0)) * Math.pow(10, decimals - wethDecimals) * ethPrice;
          } else {
            price = (Number(reserve0) / Number(reserve1)) * Math.pow(10, decimals - wethDecimals) * ethPrice;
          }
          return isFinite(price) && price > 0 ? price : null;
        }
      }
    }

    // Try Uniswap V3 pools using slot0(sqrtPriceX96)
    const v3Candidates = allPools.filter(p => (p.version === 'V3') && (
      (p.token0.toLowerCase() === token && p.token1.toLowerCase() === WETH_ADDR) ||
      (p.token1.toLowerCase() === token && p.token0.toLowerCase() === WETH_ADDR)
    ));
    if (v3Candidates.length > 0) {
      v3Candidates.sort((a, b) => (b.tvl_usd || 0) - (a.tvl_usd || 0));
      const pool = v3Candidates[0];
      const iface = new ethers.Interface(['function slot0() view returns (uint160 sqrtPriceX96,int24,int24,uint16,uint16,uint16,uint8,bool)']);
      const data = iface.encodeFunctionData('slot0', []);
      const ret = await pv.call({ to: pool.address, data });
      if (ret && ret !== '0x') {
        const decoded = iface.decodeFunctionResult('slot0', ret);
        const sqrtPriceX96 = Number(decoded[0]);
        const sqrt = sqrtPriceX96 / Math.pow(2, 96);
        const price1Per0 = sqrt * sqrt;
        const info0 = lookupToken(pool.token0);
        const info1 = lookupToken(pool.token1);
        if (info0 && info1) {
          const scale = Math.pow(10, info0.decimals - info1.decimals);
          const p1p0 = price1Per0 * scale; // token1 per token0
          const ethPrice = getEthUsdPrice();
          if (!ethPrice) return null;
          let priceUsd: number | null = null;
          if (pool.token0.toLowerCase() === token) {
            // token0 is token; token1 is WETH; price token->USD = p1p0 * eth
            priceUsd = p1p0 * ethPrice;
          } else {
            // token1 is token; token per WETH = 1/p1p0
            if (p1p0 > 0) priceUsd = (1 / p1p0) * ethPrice;
          }
          if (priceUsd && isFinite(priceUsd) && priceUsd > 0) return priceUsd;
        }
      }
    }

    // Try Uniswap V1 exchange price (token/ETH)
    const v1Factory = getAmmCatalog().uniswap_v1?.factory;
    if (v1Factory) {
      try {
        const iface = new ethers.Interface(['function getExchange(address) view returns (address)']);
        const data = iface.encodeFunctionData('getExchange', [token]);
        const ret = await pv.call({ to: v1Factory, data });
        if (ret && ret !== '0x') {
          const [exchange] = iface.decodeFunctionResult('getExchange', ret) as any[];
          const exAddr = String(exchange);
          if (exAddr && exAddr.toLowerCase() !== '0x0000000000000000000000000000000000000000') {
            const info = lookupToken(token);
            if (!info) return null;
            const tokenBal = await new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], pv).balanceOf(exAddr).catch(() => BigInt(0));
            const ethBal = await pv.getBalance(exAddr).catch(() => BigInt(0));
            if (tokenBal > BigInt(0) && ethBal > BigInt(0)) {
              const ethPrice = getEthUsdPrice();
              if (!ethPrice) return null;
              // priceETH = (ethBal/1e18) / (tokenBal/10^decimals)
              const priceEth = Number(ethBal) / 1e18 / (Number(tokenBal) / Math.pow(10, info.decimals));
              const priceUsd = priceEth * ethPrice;
              return isFinite(priceUsd) && priceUsd > 0 ? priceUsd : null;
            }
          }
        }
      } catch {}
    }

    return null;
  } catch (e: any) {
    console.log(`❌ Nethermind DEX price fetch failed for ${tokenAddress}: ${e?.message || e}`);
    return null;
  }
}

function getEstimatedPriceFromRelatedTokens(address: string): number | null {
  // Try cached V2 reserves first (faster)
  const poolAddrs = getV2PoolsForPair(address, WETH_ADDR);
  if (poolAddrs.length > 0) {
    const res = getV2Reserves(poolAddrs[0]);
    if (res && res.reserve0 > BigInt(0) && res.reserve1 > BigInt(0)) {
      const ethPrice = getEthUsdPrice();
      if (ethPrice) {
        const reserve0 = Number(res.reserve0);
        const reserve1 = Number(res.reserve1);
        if (res.token0.toLowerCase() === normalize(address)) {
          return (reserve1 / reserve0) * ethPrice;
        } else {
          return (reserve0 / reserve1) * ethPrice;
        }
      }
    }
  }

  return null;
}

// Get comprehensive token data including volume, market cap, etc.
export function getTokenMarketData(address: string) {
  const info = lookupToken(address);
  if (!info) return null;

  const price = getUsdPriceForToken(address);
  const token = getTokens().find(t => normalize(t.address) === normalize(address));

  return {
    symbol: info.symbol,
    decimals: info.decimals,
    price_usd: price,
    change_24h: token?.change_24h || null,
    volume_24h_usd: token?.volume_24h_usd || null,
    mcap_circ_usd: token?.mcap_circ_usd || null,
    mcap_onchain_usd: token?.mcap_onchain_usd || null,
    holders_est: token?.holders_est || null,
    liquidity_usd: token?.liquidity_usd || null,
    primary_pool: token?.primary_pool || null,
    active: token?.active || false
  };
}


