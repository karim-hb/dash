import { ethers } from 'ethers';
import { getWsClient } from '../rpc/wsClient';
import ERC20 from '../abi/ERC20.json';
import { upsertToken, getTokens, getPools } from './registry';
import { getConfig } from '@/lib/config';
import amm from '../catalog/amm.json';

// Note: Token list loading disabled for now - focus on DEX discovery

const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

let provider: ethers.Provider | null = null;
function getProvider(): ethers.Provider {
  if (provider) return provider;
  const cfg = getConfig();
  provider = cfg.EXECUTION_WS_URL.startsWith('ws')
    ? new ethers.WebSocketProvider(cfg.EXECUTION_WS_URL)
    : new ethers.JsonRpcProvider(cfg.EXECUTION_WS_URL);
  return provider;
}

const known = new Set<string>();
const activeTokens = new Map<string, number>(); // token -> lastActivityTimestamp

// Persistent token storage
const TOKEN_CACHE_FILE = './src/server/catalog/discovered_tokens.json';

function loadDiscoveredTokens(): void {
  try {
    const fs = require('fs');
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(TOKEN_CACHE_FILE, 'utf8'));
      let loadedCount = 0;
      for (const [addr, meta] of Object.entries(data as any)) {
        const lowerAddr = addr.toLowerCase();
        if (!known.has(lowerAddr)) {
          upsertToken({
            address: addr, // Keep original checksummed format
            symbol: meta.symbol,
            decimals: meta.decimals,
            price_usd: null,
            active: false
          });
          known.add(lowerAddr);
          activeTokens.set(lowerAddr, 0);
          loadedCount++;
        }
      }
      console.log(`🔍 Loaded ${loadedCount} previously discovered tokens (${Object.keys(data).length} total in file)`);
    }
  } catch (e) {
    console.warn('🔍 Failed to load discovered tokens:', e.message);
  }
}

function saveDiscoveredTokens(): void {
  try {
    const fs = require('fs');
    const path = require('path');

    // Get all tokens that are not in the main catalog
    const mainCatalog = require('../catalog/tokens.json');
    const discovered: any = {};

    for (const token of getTokens()) {
      if (!mainCatalog[token.address.toLowerCase()]) {
        discovered[token.address] = {
          symbol: token.symbol,
          decimals: token.decimals
        };
      }
    }

    // Ensure directory exists
    const dir = path.dirname(TOKEN_CACHE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(discovered, null, 2));
    console.log(`💾 Saved ${Object.keys(discovered).length} discovered tokens to cache`);
  } catch (e) {
    console.warn('💾 Failed to save discovered tokens:', e.message);
  }
}

async function fetchErc20Meta(addr: string): Promise<{ symbol: string; decimals: number } | null> {
  try {
    const pv = getProvider();

    // First check if it's a known token
    const knownSymbols: Record<string, string> = {
      // Native and wrapped
      '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': 'ETH',
      '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2': 'WETH',

      // Stablecoins
      '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': 'USDC',
      '0xdAC17F958D2ee523a2206206994597C13D831ec7': 'USDT',
      '0x6B175474E89094C44Da98b954EedeAC495271d0F': 'DAI',
      '0x853d955aCEf822Db058eb8505911ED77F175b99e': 'FRAX',
      '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0': 'LUSD',
      '0x99D8a9C45b2ecA8864373A26D1459e3Dff1e17F3': 'MIM',

      // DeFi tokens
      '0x514910771AF9Ca656af840dff83E8264EcF986CA': 'LINK',
      '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': 'UNI',
      '0x6B3595068778DD592e39A122f4f5a5CF09C90fE2': 'SUSHI',
      '0x1CF4592faD8d9AE8eCa3F8D6b1E1A1b8b9b8b8b8': 'CRV',
      '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9': 'AAVE',
      '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e': 'YFI',
      '0x9f8F72AA9304c8B593d555F12eF6589cC3A579A2': 'MKR',
      '0xc00e94Cb662C3520282E6f5717214004A7f26888': 'COMP',

      // Other major tokens
      '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599': 'WBTC',
      '0x4E15361FD6b4BB609Fa63C81A2be19d873717870': 'FTM',
      '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0': 'MATIC',
      '0x4Fabb145d64652a948d72533023f6E7A623C7C53': 'BUSD',
      '0x8E870D67F660D95d5be530380D0eC0bd388289E1': 'PAX',
      '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51': 'sUSD',
      '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32': 'LDO',
      '0x090185f2135308BaD17527004364eBcC2D37e5F6': 'SPELL',
      '0x64aa3364F17a4D01c6f1751Fd97C2BD3D7e7f1D5': 'OHM',
      '0x6f80310CA7F2C65469161745fF9F7a6e5714a887': 'SAND',
      '0x3845badAde8e6dFF049820680d1F14bD3903a5d0': 'SAND',
      '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942': 'MANA',
    };

    if (knownSymbols[addr.toLowerCase()]) {
      return { symbol: knownSymbols[addr.toLowerCase()], decimals: 18 };
    }

    // Check if it's a proxy contract and get implementation
    let targetAddr = addr;
    try {
      const proxyContract = new ethers.Contract(addr, [
        'function implementation() view returns (address)',
        'function proxy() view returns (address)',
        'function target() view returns (address)',
        'function getImplementation() view returns (address)',
        'function masterCopy() view returns (address)',
        'function logic() view returns (address)',
      ], pv);

      const impl = await proxyContract.implementation().catch(() => null) ||
                   await proxyContract.proxy().catch(() => null) ||
                   await proxyContract.target().catch(() => null) ||
                   await proxyContract.getImplementation().catch(() => null) ||
                   await proxyContract.masterCopy().catch(() => null) ||
                   await proxyContract.logic().catch(() => null);

      if (impl && impl !== '0x0000000000000000000000000000000000000000' && impl !== addr) {
        targetAddr = impl;
        console.log(`🔗 Proxy detected: ${addr} -> ${targetAddr}`);
      }
    } catch {
      // Not a proxy, continue with original address
    }

    const c = new ethers.Contract(targetAddr, ERC20 as any, pv);
    let symbol = '';
    let decimals = 18;

    // Try multiple methods to get symbol
    const symbolMethods = ['symbol', 'SYMBOL', 'getSymbol', 'symbol()', 'get_symbol', '_symbol'];
    for (const method of symbolMethods) {
      try {
        if (method === 'symbol()') {
          // Direct call
          const result = await pv.call({ to: targetAddr, data: '0x95d89b41' }); // symbol()
          if (result && result !== '0x') {
            const decoded = ethers.toUtf8String(result);
            symbol = decoded.replace(/\0/g, '').trim();
            if (symbol && symbol.length > 0) break;
          }
        } else {
          const symbolRaw = await c[method]();
          if (symbolRaw) {
            if (typeof symbolRaw === 'string') {
              symbol = symbolRaw.trim();
            } else if (symbolRaw && typeof symbolRaw === 'object') {
              // Handle bytes32 and other formats
              if (symbolRaw.length === 32) {
                // bytes32 - try different decodings
                try {
                  symbol = ethers.toUtf8String(symbolRaw).replace(/\0/g, '').trim();
                } catch {
                  // Try as hex string
                  symbol = symbolRaw.toString().replace(/\0/g, '').trim();
                }
              } else if (symbolRaw.length > 0) {
                // Try as bytes array
                try {
                  symbol = ethers.toUtf8String(symbolRaw).replace(/\0/g, '').trim();
                } catch {
                  symbol = Buffer.from(symbolRaw).toString('utf8').replace(/\0/g, '').trim();
                }
              } else {
                symbol = symbolRaw.toString().trim();
              }
            } else if (typeof symbolRaw === 'bigint' || typeof symbolRaw === 'number') {
              // Some tokens return numbers
              symbol = symbolRaw.toString();
            }

            // Clean up common encoding issues
            if (symbol) {
              symbol = symbol.replace(/^0x/, ''); // Remove hex prefix if present
              symbol = symbol.replace(/[^\x20-\x7E]/g, ''); // Remove non-printable chars
              symbol = symbol.trim();
            }

            if (symbol && symbol.length > 0 && symbol.length <= 20) break;
          }
        }
      } catch {
        continue;
      }
    }

    // If still no symbol, try name
    if (!symbol) {
      const nameMethods = ['name', 'NAME', 'getName', 'name()'];
      for (const method of nameMethods) {
        try {
          if (method === 'name()') {
            const result = await pv.call({ to: targetAddr, data: '0x06fdde03' }); // name()
            if (result && result !== '0x') {
              symbol = ethers.toUtf8String(result).replace(/\0/g, '').trim();
              break;
            }
          } else {
            const nameRaw = await c[method]();
            if (nameRaw && typeof nameRaw === 'string') {
              symbol = nameRaw.trim();
              // Use first 8 chars of name as symbol
              if (symbol.length > 8) {
                symbol = symbol.slice(0, 8).toUpperCase();
              }
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }

    // Try decimals
    const decimalsMethods = ['decimals', 'DECIMALS', 'getDecimals'];
    for (const method of decimalsMethods) {
      try {
        const dec = await c[method]();
        if (typeof dec === 'number' || typeof dec === 'bigint') {
          decimals = Number(dec);
          break;
        }
      } catch {
        continue;
      }
    }

    // If still no symbol, try special token standards and advanced methods
    if (!symbol) {
      // Try ERC-777 standard
      try {
        const erc777Contract = new ethers.Contract(targetAddr, [
          'function symbol() view returns (string)',
          'function granularity() view returns (uint256)',
        ], pv);

        const erc777Symbol = await erc777Contract.symbol().catch(() => null);
        if (erc777Symbol && typeof erc777Symbol === 'string') {
          symbol = erc777Symbol.trim();
        }
      } catch {
        // Not ERC-777
      }

      // Try to decode from contract bytecode (advanced)
      if (!symbol) {
        try {
          const code = await pv.getCode(targetAddr);
          if (code && code.length > 1000) {
            // Look for UTF-8 strings in bytecode
            const utf8Matches = code.match(/([A-Z]{2,12})/g);
            if (utf8Matches && utf8Matches.length > 0) {
              // Filter for reasonable token symbols
              for (const match of utf8Matches) {
                if (match.length >= 2 && match.length <= 12 &&
                    /^[A-Z0-9]+$/.test(match) &&
                    !match.includes('0X') && !match.includes('0x')) {
                  symbol = match;
                  break;
                }
              }
            }

            // If still no symbol, try hex-encoded strings
            if (!symbol) {
              const hexStrings = code.match(/0x[0-9a-fA-F]{64,}/g);
              if (hexStrings) {
                for (const hexStr of hexStrings.slice(0, 5)) { // Check first few
                  try {
                    const decoded = ethers.toUtf8String(hexStr);
                    if (decoded && decoded.length >= 2 && decoded.length <= 12 &&
                        /^[A-Z0-9]+$/.test(decoded.replace(/\0/g, ''))) {
                      symbol = decoded.replace(/\0/g, '').trim();
                      break;
                    }
                  } catch {
                    continue;
                  }
                }
              }
            }
          }
        } catch {
          // Ignore bytecode analysis failures
        }
      }

      // Last resort: check if it's a known wrapped token pattern
      if (!symbol) {
        const wrappedPatterns = [
          /^0x[0-9a-f]{40}$/i, // Any address
        ];

        // For tokens that are likely wrapped versions, try to get original
        try {
          const wrappedContract = new ethers.Contract(targetAddr, [
            'function underlying() view returns (address)',
            'function token() view returns (address)',
            'function asset() view returns (address)',
          ], pv);

          const underlying = await wrappedContract.underlying().catch(() => null) ||
                           await wrappedContract.token().catch(() => null) ||
                           await wrappedContract.asset().catch(() => null);

          if (underlying && underlying !== '0x0000000000000000000000000000000000000000') {
            // Recursively try to decode the underlying token
            const underlyingMeta = await fetchErc20Meta(underlying);
            if (underlyingMeta) {
              symbol = `W${underlyingMeta.symbol}`;
            }
          }
        } catch {
          // Not a wrapped token
        }
      }
    }

    // Final fallback
    if (!symbol || symbol.length === 0) {
      symbol = `UNK-${addr.slice(2, 8).toUpperCase()}`;
    }

    // Validate and clean
    if (typeof decimals !== 'number' || decimals < 0 || decimals > 36) {
      decimals = 18;
    }

    symbol = symbol.slice(0, 12).replace(/[^\w\-$.]/g, '').trim();
    if (!symbol || symbol.length === 0) {
      return null;
    }

    console.log(`✅ Decoded ${addr}: ${symbol} (${decimals} decimals)`);
    return { symbol, decimals };

  } catch (e) {
    console.log(`❌ Failed to decode ${addr}: ${e.message}`);
    return null;
  }
}

// Token list loading disabled - focus on DEX discovery for now

// Re-decode tokens that have unknown symbols
async function reDecodeUnknownTokens(): Promise<void> {
  console.log('🔄 Re-decoding tokens with unknown symbols...');

  const tokens = getTokens();
  let reDecoded = 0;

  for (const token of tokens) {
    if (token.symbol && token.symbol.startsWith('UNK-')) {
      try {
        const meta = await fetchErc20Meta(token.address);
        if (meta && meta.symbol && !meta.symbol.startsWith('UNK-')) {
          upsertToken({
            address: token.address,
            symbol: meta.symbol,
            decimals: meta.decimals,
            price_usd: token.price_usd,
            change_24h: token.change_24h,
            volume_24h_usd: token.volume_24h_usd,
            mcap_onchain_usd: token.mcap_onchain_usd,
            mcap_circ_usd: token.mcap_circ_usd,
            holders_est: token.holders_est,
            liquidity_usd: token.liquidity_usd,
            primary_pool: token.primary_pool,
            active: token.active,
          });
          reDecoded++;
          console.log(`🔄 Re-decoded ${token.address}: ${token.symbol} -> ${meta.symbol}`);

          if (reDecoded % 10 === 0) {
            console.log(`🔄 Re-decoded ${reDecoded} tokens so far...`);
          }
        }
      } catch (e) {
        console.log(`❌ Failed to re-decode ${token.address}: ${e.message}`);
      }

      // Rate limit to avoid overwhelming RPC
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Re-decoding complete: updated ${reDecoded} tokens`);
}

// Extract tokens from V3 pools only (fast)
async function discoverTokensFromV3Pools(ws: any): Promise<void> {
  console.log('🔍 Discovering tokens from V3 pools...');

  const pools = getPools().filter(p => p.version === 'V3');
  console.log(`🔍 Checking ${pools.length} V3 pools for tokens...`);

  if (pools.length === 0) {
    console.log('🔍 No V3 pools available yet');
    return;
  }

  const tokenAddresses = new Set<string>();

  // Extract all token addresses from V3 pools
  for (const pool of pools) {
    if (pool.token0) tokenAddresses.add(pool.token0.toLowerCase());
    if (pool.token1) tokenAddresses.add(pool.token1.toLowerCase());
  }

  console.log(`🔍 Found ${tokenAddresses.size} unique token addresses from ${pools.length} V3 pools`);

  // Filter out already known tokens
  const newAddresses = Array.from(tokenAddresses).filter(addr => !known.has(addr));
  console.log(`🔍 ${newAddresses.length} new V3 tokens to discover`);

  if (newAddresses.length === 0) {
    console.log('🔍 No new V3 tokens to discover');
    return;
  }

  // Process new tokens in batches
  let discoveredTokens = 0;
  const batchSize = 20;

  for (let i = 0; i < newAddresses.length; i += batchSize) {
    const batch = newAddresses.slice(i, i + batchSize);
    console.log(`🔍 Processing V3 tokens batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newAddresses.length/batchSize)} (${batch.length} tokens)`);

    const promises = batch.map(async (addr) => {
      const meta = await fetchErc20Meta(addr);
      if (meta) {
        upsertToken({
          address: addr,
          symbol: meta.symbol,
          decimals: meta.decimals,
          price_usd: null,
          active: true
        });
        known.add(addr);
        activeTokens.set(addr, Date.now());
        discoveredTokens++;
        console.log(`✅ V3 token added: ${meta.symbol} (${addr})`);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < newAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`🔍 V3 token discovery complete: added ${discoveredTokens} new tokens`);
}

// Extract tokens from all pools in the registry
async function discoverTokensFromExistingPools(ws: any): Promise<void> {
  console.log('🔍 Discovering tokens from existing pools...');

  const pools = getPools();
  console.log(`🔍 Checking ${pools.length} pools for tokens...`);

  if (pools.length === 0) {
    console.log('🔍 No pools available yet, will retry later');
    // Schedule retry in 30 seconds
    setTimeout(() => discoverTokensFromExistingPools(ws), 30000);
    return;
  }

  const tokenAddresses = new Set<string>();

  // Extract all token addresses from pools
  for (const pool of pools) {
    if (pool.token0) tokenAddresses.add(pool.token0.toLowerCase());
    if (pool.token1) tokenAddresses.add(pool.token1.toLowerCase());
  }

  console.log(`🔍 Found ${tokenAddresses.size} unique token addresses from ${pools.length} pools`);

  // Filter out already known tokens
  const newAddresses = Array.from(tokenAddresses).filter(addr => !known.has(addr.toLowerCase()));
  console.log(`🔍 ${newAddresses.length} new tokens to discover from pools (known set has ${known.size} tokens)`);
  console.log(`🔍 Sample new addresses:`, newAddresses.slice(0, 3));
  console.log(`🔍 Sample known addresses:`, Array.from(known).slice(0, 3));

  if (newAddresses.length === 0) {
    console.log('🔍 No new tokens to discover from pools');
    return;
  }

  // Process new tokens in batches
  let discoveredTokens = 0;
  const batchSize = 10;

  for (let i = 0; i < newAddresses.length; i += batchSize) {
    const batch = newAddresses.slice(i, i + batchSize);
    console.log(`🔍 Processing pool tokens batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(newAddresses.length/batchSize)} (${batch.length} tokens)`);

    const promises = batch.map(async (addr) => {
      try {
        const meta = await fetchErc20Meta(addr);
        if (meta) {
          upsertToken({
            address: addr,
            symbol: meta.symbol,
            decimals: meta.decimals,
            price_usd: null,
            active: true
          });
          known.add(addr);
          activeTokens.set(addr, Date.now());
          discoveredTokens++;
          if (discoveredTokens % 10 === 0) {
            console.log(`✅ Added ${discoveredTokens} tokens so far: ${meta.symbol} (${addr})`);
          }
        } else {
          // Still add the token even if metadata fetch fails
          upsertToken({
            address: addr,
            symbol: `UNK-${addr.slice(0,6)}`, // Unknown token with address prefix
            decimals: 18, // Default to 18 decimals
            price_usd: null,
            active: true
          });
          known.add(addr);
          activeTokens.set(addr, Date.now());
          discoveredTokens++;
          if (discoveredTokens % 10 === 0) {
            console.log(`✅ Added ${discoveredTokens} tokens so far (with default metadata): ${addr}`);
          }
        }
      } catch (e) {
        console.log(`❌ Error processing ${addr}: ${e.message}`);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < newAddresses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  console.log(`🔍 Pool token discovery complete: added ${discoveredTokens} new tokens`);
}

// Comprehensive DEX discovery - query factories directly for all pairs
async function discoverTokensFromDEXConservative(ws: any): Promise<void> {
  console.log('🔍 Starting comprehensive DEX discovery...');

  const tokenAddresses = new Set<string>();

  try {
    // Uniswap V1 Factory - different approach, exchanges were created directly
    const v1Factory = amm.uniswap_v1?.factory;
    if (v1Factory) {
      console.log(`🔍 Querying Uniswap V1 factory ${v1Factory} for exchanges...`);

      try {
        // V1 used token addresses as exchange identifiers
        // We'll query some known popular V1 tokens and their exchanges
        const popularV1Tokens = [
          '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
          '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
          '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          '0x514910771AF9Ca656af840dff83E8264EcF986CA', // LINK
          '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
          '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
          '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
          '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', // YFI
          '0x9f8F72AA9304c8B593d555F12eF6589cC3A579A2', // MKR
        ];

        for (const tokenAddr of popularV1Tokens) {
          try {
            // Get the exchange address for this token
            const exchangeResult = await ws.rpc('eth_call', [{
              to: v1Factory,
              data: '0xe6a43905' + tokenAddr.slice(2).padStart(64, '0') // getExchange(address)
            }, 'latest']);

            if (exchangeResult && exchangeResult !== '0x' && exchangeResult !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
              const exchangeAddr = '0x' + exchangeResult.slice(26).toLowerCase();

              // Get token from exchange
              const tokenResult = await ws.rpc('eth_call', [{
                to: exchangeAddr,
                data: '0x0dfe1681' // tokenAddress()
              }, 'latest']);

              if (tokenResult) {
                const token = '0x' + tokenResult.slice(26).toLowerCase();
                tokenAddresses.add(token);

                upsertPool({
                  dex: 'Uniswap',
                  version: 'V1',
                  address: exchangeAddr,
                  token0: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
                  token1: token,
                  fee_bps: 30, // V1 had 0.3% fee
                });
              }
            }
          } catch (e) {
            // Continue with other tokens
          }
        }
      } catch (e) {
        console.warn('🔍 V1 factory query failed:', e);
      }
    }

    // Uniswap V2 Factory - query all pairs directly
    const v2Factory = amm.uniswap_v2?.factory;
    if (v2Factory) {
      console.log(`🔍 Querying Uniswap V2 factory ${v2Factory} for ALL pairs...`);

      try {
        // Get total number of pairs
        const pairCountHex = await ws.rpc('eth_call', [{
          to: v2Factory,
          data: '0x574f2ba3' // allPairsLength()
        }, 'latest']);
        const pairCount = parseInt(pairCountHex, 16);
        console.log(`🔍 V2 factory has ${pairCount} total pairs`);

        // Sample pairs instead of querying all (much faster)
        // Query every 50th pair to get better coverage
        const sampleSize = Math.min(10000, pairCount); // Max 10,000 samples for better coverage
        const step = Math.max(1, Math.floor(pairCount / sampleSize));
        console.log(`🔍 Sampling ${sampleSize} V2 pairs (every ${step}th pair) out of ${pairCount} total...`);

        let processedCount = 0;
        for (let j = 0; j < pairCount; j += step) {
          try {
            const indexHex = '0x' + j.toString(16).padStart(64, '0');
            const pairResult = await ws.rpc('eth_call', [{
              to: v2Factory,
              data: '0x1e3dd18c' + indexHex // allPairs(uint256)
            }, 'latest']);

            if (pairResult && pairResult !== '0x' && pairResult.length >= 66) {
              const pairAddress = '0x' + pairResult.slice(26).toLowerCase();

              // Skip zero address pairs
              if (pairAddress === '0x0000000000000000000000000000000000000000') {
                continue;
              }

              // Get token0 and token1 from the pair contract
              try {
                const [token0Result, token1Result] = await Promise.all([
                  ws.rpc('eth_call', [{
                    to: pairAddress,
                    data: '0x0dfe1681' // token0()
                  }, 'latest']),
                  ws.rpc('eth_call', [{
                    to: pairAddress,
                    data: '0xd21220a7' // token1()
                  }, 'latest'])
                ]);

                if (token0Result && token1Result && token0Result.length >= 66 && token1Result.length >= 66) {
                  const token0 = '0x' + token0Result.slice(26).toLowerCase();
                  const token1 = '0x' + token1Result.slice(26).toLowerCase();

                  // Only add valid token addresses
                  if (token0 !== '0x0000000000000000000000000000000000000000' &&
                      token1 !== '0x0000000000000000000000000000000000000000') {
                    tokenAddresses.add(token0);
                    tokenAddresses.add(token1);
                  }
                }
              } catch (e) {
                // Skip pairs that fail token queries
                continue;
              }
            }

            processedCount++;
            if (processedCount % 50 === 0) {
              console.log(`🔍 Processed ${processedCount}/${sampleSize} V2 pair samples (${tokenAddresses.size} unique tokens found)...`);
            }
          } catch (e) {
            // Continue with next pair on RPC errors
            continue;
          }

          // Small delay to avoid overwhelming RPC
          if (processedCount % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } catch (e) {
        console.warn('🔍 V2 factory query failed:', e);
      }
    }

    // Uniswap V3 Factory - for now keep the event-based approach since V3 has fewer pools
    const v3Factory = amm.uniswap_v3?.factory;
    if (v3Factory) {
      console.log(`🔍 Querying Uniswap V3 factory ${v3Factory} for recent pools...`);

      // Get the latest block
      const latestHex = await ws.rpc('eth_blockNumber', []);
      const latest = parseInt(latestHex, 16);
      // Go back far enough to cover V3 history (V3 launched ~block 12M)
      const fromBlock = Math.max(0, latest - 12000000); // 12M blocks back

      const poolLogs = await ws.rpc('eth_getLogs', [{
        address: v3Factory,
        topics: [POOL_CREATED_TOPIC],
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: latestHex,
      }]);

      console.log(`🔍 Found ${poolLogs?.length || 0} V3 PoolCreated events`);

      // Extract token addresses from V3 events
      for (const log of poolLogs || []) {
        if (log.data && log.data.length >= 128) {
          // PoolCreated event: address token0, address token1, uint24 fee, int24 tickSpacing, address pool
          const token0 = '0x' + log.data.slice(26, 66).toLowerCase();
          const token1 = '0x' + log.data.slice(90, 130).toLowerCase();
          tokenAddresses.add(token0);
          tokenAddresses.add(token1);
        }
      }
    }

    // SushiSwap V2 Factory - keep event-based for now since Sushi has fewer pairs
    const sushiFactory = amm.sushiswap_v2?.factory;
    if (sushiFactory) {
      console.log(`🔍 Querying SushiSwap V2 factory ${sushiFactory} for recent pairs...`);

      // Get the latest block for Sushi
      const latestHex = await ws.rpc('eth_blockNumber', []);
      const latest = parseInt(latestHex, 16);
      const fromBlock = Math.max(0, latest - 50000); // Recent blocks for Sushi

      const sushiLogs = await ws.rpc('eth_getLogs', [{
        address: sushiFactory,
        topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
        fromBlock: '0x' + fromBlock.toString(16),
        toBlock: latestHex,
      }]);

      console.log(`🔍 Found ${sushiLogs?.length || 0} Sushi V2 PairCreated events`);

      // Extract token addresses from Sushi events
      for (const log of sushiLogs || []) {
        if (log.topics && log.topics.length >= 3) {
          const token0 = '0x' + log.topics[1].slice(26).toLowerCase();
          const token1 = '0x' + log.topics[2].slice(26).toLowerCase();
          tokenAddresses.add(token0);
          tokenAddresses.add(token1);
        }
      }
    }

    console.log(`🔍 Found ${tokenAddresses.size} unique token addresses from DEX factories`);

    // Process tokens in small batches
    const addresses = Array.from(tokenAddresses);
    let discoveredTokens = 0;

    for (let i = 0; i < addresses.length; i += 10) { // Process 10 at a time
      const batch = addresses.slice(i, i + 10);
      console.log(`🔍 Processing batch ${Math.floor(i/10) + 1}/${Math.ceil(addresses.length/10)} (${batch.length} tokens)`);

      const promises = batch.map(async (addr) => {
        if (known.has(addr)) return; // Already known

        const meta = await fetchErc20Meta(addr);
        if (meta) {
          upsertToken({
            address: addr,
            symbol: meta.symbol,
            decimals: meta.decimals,
            price_usd: null,
            active: true
          });
          known.add(addr);
          activeTokens.set(addr, Date.now());
          discoveredTokens++;
        }
      });

      await Promise.all(promises);

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`🔍 Conservative DEX discovery complete: added ${discoveredTokens} new tokens from recent pairs`);

  } catch (e) {
    console.error('🔍 Conservative DEX discovery failed:', e);
  }
}

// Discover tokens from DEX factories by querying PairCreated events
async function discoverTokensFromDEX(ws: any): Promise<void> {
  console.log('🔍 Discovering tokens from DEX factories...');

  // Timeout after 5 minutes to prevent hanging
  const timeout = setTimeout(() => {
    console.log('🔍 DEX discovery timed out after 5 minutes');
  }, 5 * 60 * 1000);

  try {
    const factories = [
      amm.uniswap_v2?.factory,
      amm.uniswap_v3?.factory,
      amm.sushiswap_v2?.factory,
      // Add more factory addresses as needed
    ].filter(Boolean);

  const PAIR_CREATED_TOPIC = '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
  const POOL_CREATED_TOPIC = '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b711'; // Uniswap V3

  let discoveredTokens = 0;
  const batchSize = 1000; // Process in batches to avoid overwhelming

  for (const factory of factories) {
    if (!factory) continue;

    try {
      console.log(`🔍 Querying factory ${factory}...`);

      // Query PairCreated events (backfill recent blocks)
      const latestHex = await ws.rpc('eth_blockNumber', []);
      const latest = parseInt(latestHex, 16);
      const fromBlock = Math.max(0, latest - 50000); // Last 50k blocks

      console.log(`🔍 Querying factory ${factory} directly for all pairs...`);

      // For Uniswap V2 style factories, query allPairs directly instead of logs
      let pairAddresses: string[] = [];
      try {
        // Call allPairsLength()
        const lengthResult = await ws.rpc('eth_call', [{
          to: factory,
          data: '0x574f2ba3' // allPairsLength()
        }, 'latest']);
        const length = parseInt(lengthResult, 16);

        console.log(`🔍 Factory ${factory} has ${length} total pairs`);

        // Query pairs in batches to avoid overwhelming RPC
        const pairBatchSize = 100;
        for (let i = 0; i < length; i += pairBatchSize) {
          const batchEnd = Math.min(i + pairBatchSize, length);
          console.log(`🔍 Querying pairs ${i} to ${batchEnd - 1}...`);

          // Query this batch of pairs
          const batchPromises = [];
          for (let j = i; j < batchEnd; j++) {
            // Call allPairs(index)
            const data = '0x1e3dd18c' + j.toString(16).padStart(64, '0'); // allPairs(uint256)
            batchPromises.push(
              ws.rpc('eth_call', [{
                to: factory,
                data: data
              }, 'latest'])
            );
          }

          const batchResults = await Promise.all(batchPromises);
          for (const result of batchResults) {
            if (result && result !== '0x') {
              const pairAddr = '0x' + result.slice(26).toLowerCase();
              pairAddresses.push(pairAddr);
            }
          }

          // Small delay between batches
          if (i + pairBatchSize < length) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }

        console.log(`🔍 Retrieved ${pairAddresses.length} pair addresses from factory ${factory}`);

      } catch (e) {
        console.error(`🔍 Failed to query factory ${factory} directly:`, e);
        // Fallback to log-based approach for smaller range
        console.log('🔍 Falling back to log-based discovery...');

        const pairLogs = await ws.rpc('eth_getLogs', [{
          address: factory,
          topics: [PAIR_CREATED_TOPIC],
          fromBlock: '0x' + fromBlock.toString(16),
          toBlock: latestHex,
        }]);

        console.log(`🔍 Found ${pairLogs?.length || 0} PairCreated events for ${factory}`);
        pairAddresses = (pairLogs || []).map(log => log.address).filter(Boolean);
      }

      // Extract token addresses from pairs
      const tokenAddresses = new Set<string>();
      console.log(`🔍 Processing ${pairAddresses.length} pairs to extract tokens...`);

      for (let i = 0; i < pairAddresses.length; i += 50) {
        const batch = pairAddresses.slice(i, i + 50);
        const batchPromises = batch.map(async (pairAddr) => {
          try {
            // Query token0 and token1 from the pair contract
            const [token0Result, token1Result] = await Promise.all([
              ws.rpc('eth_call', [{ to: pairAddr, data: '0x0dfe1681' }, 'latest']), // token0()
              ws.rpc('eth_call', [{ to: pairAddr, data: '0xd21220a7' }, 'latest'])  // token1()
            ]);

            if (token0Result && token0Result !== '0x') {
              tokenAddresses.add('0x' + token0Result.slice(26).toLowerCase());
            }
            if (token1Result && token1Result !== '0x') {
              tokenAddresses.add('0x' + token1Result.slice(26).toLowerCase());
            }
          } catch (e) {
            // Ignore individual pair errors
          }
        });

        await Promise.all(batchPromises);

        // Progress logging
        if (i % 1000 === 0) {
          console.log(`🔍 Processed ${i}/${pairAddresses.length} pairs, found ${tokenAddresses.size} unique tokens so far`);
        }
      }

      // For V3 factory, also query PoolCreated events
      if (factory === amm.uniswap_v3?.factory) {
        try {
          const poolLogs = await ws.rpc('eth_getLogs', [{
            address: factory,
            topics: [POOL_CREATED_TOPIC],
            fromBlock: '0x' + fromBlock.toString(16),
            toBlock: latestHex,
          }]);

          console.log(`🔍 Found ${poolLogs?.length || 0} PoolCreated events for V3 factory`);

          for (const log of poolLogs || []) {
            if (log.data && log.data.length >= 128) {
              // PoolCreated(address indexed token0, address indexed token1, uint24 fee, int24 tickSpacing, address pool)
              const token0 = '0x' + log.data.slice(26, 66).toLowerCase();
              const token1 = '0x' + log.data.slice(90, 130).toLowerCase();
              tokenAddresses.add(token0);
              tokenAddresses.add(token1);
            }
          }
        } catch (e) {
          console.warn('🔍 V3 pool discovery failed:', e.message);
        }
      }

      // Process discovered tokens in batches
      const addresses = Array.from(tokenAddresses);
      console.log(`🔍 Processing ${addresses.length} unique token addresses from ${factory}`);

      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize);
        console.log(`🔍 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(addresses.length/batchSize)} (${batch.length} tokens)`);

        // Process batch concurrently but with rate limiting
        const promises = batch.map(async (addr) => {
          if (known.has(addr)) return; // Already known

          const meta = await fetchErc20Meta(addr);
          if (meta) {
            upsertToken({
              address: addr,
              symbol: meta.symbol,
              decimals: meta.decimals,
              price_usd: null,
              active: true
            });
            known.add(addr);
            activeTokens.set(addr, Date.now());
            discoveredTokens++;
          }
        });

        await Promise.all(promises);

        // Small delay between batches
        if (i + batchSize < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

    } catch (e) {
      console.error(`🔍 Error querying factory ${factory}:`, e);
    }
  }

    console.log(`🔍 DEX discovery complete: added ${discoveredTokens} new tokens from ${addresses.length} total addresses`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function startTokenDiscovery(): Promise<void> {
  // Load previously discovered tokens from cache
  loadDiscoveredTokens();

  // Seed known set from current registry (including loaded ones)
  for (const t of getTokens()) {
    const addr = t.address.toLowerCase();
    known.add(addr);
    activeTokens.set(addr, 0); // Initialize as not active
  }

  // Re-decode tokens with unknown symbols using improved decoding (background task)
  setTimeout(async () => {
    try {
      await reDecodeUnknownTokens();
    } catch (e) {
      console.log('❌ Re-decoding failed:', e.message);
    }
  }, 10000); // Start after 10 seconds to let system stabilize

  const ws = getWsClient();

  // Discover tokens from DEX factories (comprehensive approach)
  // Run in background to avoid blocking startup
  setTimeout(async () => {
    try {
      console.log('🔍 Starting comprehensive DEX token discovery in background...');

      // Start V3 discovery immediately (fast)
      console.log('🔍 Starting fast V3 token discovery...');
      await discoverTokensFromV3Pools(ws);

      // Extract tokens from existing pools immediately (don't wait for V2 discovery)
      console.log('🔍 Extracting tokens from existing pools...');
      await discoverTokensFromExistingPools(ws);

      // Start comprehensive V2 discovery in background (don't wait for it)
      discoverTokensFromDEXConservative(ws).then(async () => {
        // Extract tokens again after V2 discovery completes
        console.log('🔍 Final token extraction after V2 discovery...');
        await discoverTokensFromExistingPools(ws);

        console.log('🔍 DEX discovery complete, saving tokens...');
        saveDiscoveredTokens();
      }).catch(e => {
        console.error('🔍 V2 DEX discovery failed:', e);
      });

    } catch (e) {
      console.error('🔍 DEX discovery failed:', e);
    }
  }, 15000); // Start 15 seconds after server startup

  // Periodic save of discovered tokens
  setInterval(() => {
    saveDiscoveredTokens();
  }, 5 * 60 * 1000); // Save every 5 minutes

  // Live subscription to global Transfer logs for NEW token discovery
  console.log('🔍 Starting live token discovery subscription...');
  await ws.subscribeLogs({ topics: [TRANSFER_TOPIC] }, async (log) => {
    try {
      const token = (log.address || '').toLowerCase();
      if (!token) return;

      // Update activity for known tokens
      if (known.has(token)) {
        activeTokens.set(token, Date.now());
        // Mark as active in registry
        const existingToken = getTokens().find(t => t.address.toLowerCase() === token);
        if (existingToken && !existingToken.active) {
          upsertToken({
            ...existingToken,
            active: true
          });
        }
      }

      // Discover new tokens
      if (!known.has(token)) {
        console.log(`🔍 Live discovery: ${token}`);
        const meta = await fetchErc20Meta(token);
        if (meta) {
          console.log(`✅ Live added token: ${meta.symbol} (${token})`);
          upsertToken({ address: token, symbol: meta.symbol, decimals: meta.decimals, price_usd: null, active: true });
          known.add(token);
          activeTokens.set(token, Date.now());
        }
      }
    } catch (e) {
      console.error('🔍 Live discovery error:', e);
    }
  });

  console.log(`🔍 Token discovery ready - monitoring ${known.size} known tokens for activity`);
}

export function getActiveTokens(hours: number = 24): { address: string; lastActivity: number }[] {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  return Array.from(activeTokens.entries())
    .filter(([_, timestamp]) => timestamp > cutoff)
    .map(([address, lastActivity]) => ({ address, lastActivity }))
    .sort((a, b) => b.lastActivity - a.lastActivity);
}

export function isTokenActive(address: string, hours: number = 24): boolean {
  const cutoff = Date.now() - (hours * 60 * 60 * 1000);
  const lastActivity = activeTokens.get(address.toLowerCase());
  return lastActivity ? lastActivity > cutoff : false;
}


