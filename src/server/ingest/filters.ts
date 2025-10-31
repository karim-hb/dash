import { Transaction } from '@/lib/types';
import { selector, wordAt, hexToNumber } from '@/lib/util/hex';
import { getUsdPriceForToken, getEthUsdPrice } from '../market/priceEngine';
import { getCoreDecoder } from '../decoding/coreDecoder';
import tokensCatalog from '../catalog/tokens.json';
import fs from 'fs';
import path from 'path';

// Minimal high-liquidity token whitelist with USD thresholds
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'.toLowerCase();
const TOKEN_WHITELIST: Record<string, { symbol: string; minUSD: number }> = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', minUSD: 5000 },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', minUSD: 5000 },
  [WETH]: { symbol: 'WETH', minUSD: 1000 },
};

// Allowed function selectors for swaps/multicall and ERC20 transfer
const ALLOWED_SELECTORS = new Set([
  // Uniswap V2
  '38ed1739', // swapExactTokensForTokens
  '18cbafe5', // swapExactTokensForETH
  '7ff36ab5', // swapExactETHForTokens
  '4a25d94a', // swapTokensForExactTokens
  '8803dbee', // swapTokensForExactETH
  '5c11d795', // swapExactTokensForETHSupportingFeeOnTransferTokens
  '791ac947', // swapExactTokensForTokensSupportingFeeOnTransferTokens
  // Uniswap V3
  '414bf389', // exactInputSingle
  'b858183f', // exactOutputSingle
  '472b43f3', // exactInput
  '09b81346', // exactOutput
  'ac9650d8', // multicall(bytes[])
  '5ae401dc', // multicall(uint256,bytes[])
  '04e45aaf', // multicall variant
  // ERC20
  'a9059cbb', // transfer(address,uint256)
]);

function loadRouterAddressSet(): Set<string> {
  const addrs = new Set<string>();
  try {
    const p1 = path.join(process.cwd(), 'src/server/catalog/router_registry.json');
    if (fs.existsSync(p1)) {
      const j = JSON.parse(fs.readFileSync(p1, 'utf8'));
      const routers = j?.routers || {};
      for (const a of Object.keys(routers)) addrs.add(a.toLowerCase());
    }
    const p2 = path.join(process.cwd(), 'src/server/catalog/router_registry.ext.json');
    if (fs.existsSync(p2)) {
      const j = JSON.parse(fs.readFileSync(p2, 'utf8'));
      const routers = j?.routers || {};
      for (const a of Object.keys(routers)) addrs.add(a.toLowerCase());
    }
  } catch {}
  return addrs;
}

const ROUTER_SET = loadRouterAddressSet();

export type FilterResult = { keep: boolean; usdValue?: number };

// Main mempool filter pipeline
export async function shouldKeepMempoolTx(tx: Transaction): Promise<FilterResult> {
  try {
    const to = (tx.to || '').toLowerCase();
    const sel = selector(tx.input || '') || '';

    // Stage 1: Pre-filter by destination (DEX router) OR whitelisted token contract for ERC20 transfer
    const isRouter = to && ROUTER_SET.has(to);
    const isTokenTransfer = sel === 'a9059cbb' && TOKEN_WHITELIST[to] != null;
    if (!isRouter && !isTokenTransfer) {
      return { keep: false };
    }

    // Stage 2: Function allowlist (if router)
    if (isRouter && !ALLOWED_SELECTORS.has(sel)) {
      return { keep: false };
    }

    // Stage 3: Token whitelist + minUSD
    // Compute USD value cheaply
    let usd: number | null = null;

    if (isTokenTransfer) {
      // ERC20 transfer: amount is arg1 (uint256)
      try {
        const amount = hexToNumber(wordAt(tx.input, 2));
        const info = TOKEN_WHITELIST[to];
        const meta: any = (tokensCatalog as any)[to] || { decimals: 18 };
        if (info) {
          const price = await getUsdPriceForToken(to);
          if (price != null) {
            const qty = amount / Math.pow(10, meta.decimals || 18);
            usd = qty * price;
          }
          if (usd != null && usd >= info.minUSD) return { keep: true, usdValue: usd };
          return { keep: false };
        }
      } catch {}
      return { keep: false };
    }

    // Router swap: try decode swap details for amount/token
    try {
      const decoder = getCoreDecoder();
      const details = decoder.decodeSwapDetails(tx);
      // Prefer amount_in and token_in; fallback to ETH value when swapping exact ETH
      let amount = details.amount_in || null;
      let token = details.token_in || null;

      if (!amount && sel === '7ff36ab5') { // swapExactETHForTokens
        try {
          const ethVal = Number(BigInt(tx.value || '0x0')) / 1e18;
          const ethUsd = getEthUsdPrice();
          if (ethUsd != null) usd = ethVal * ethUsd;
        } catch {}
      } else if (amount && token) {
        const t = token.toLowerCase();
        const info = TOKEN_WHITELIST[t];
        const price = await getUsdPriceForToken(t);
        const meta: any = (tokensCatalog as any)[t] || { decimals: 18 };
        if (price != null) {
          const qty = amount / Math.pow(10, meta.decimals || 18);
          usd = qty * price;
        }
        if (info) {
          if (usd != null && usd >= info.minUSD) return { keep: true, usdValue: usd };
          return { keep: false };
        }
      }
    } catch {}

    // If we reached here and USD is computed, apply a sane default threshold
    if (usd != null) {
      if (usd >= 1000) return { keep: true, usdValue: usd };
      return { keep: false };
    }

    // Unknown amount/price: drop
    return { keep: false };
  } catch {
    return { keep: false };
  }
}


