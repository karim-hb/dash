// Ethers-based amount decoding and formatting utilities
import { ethers } from 'ethers';

export interface AmountInfo {
  amount: string;
  unit: string;
  unifiedEth?: string;
}

// Minimal well-known tokens to handle non-18 decimals without heavy registries
const KNOWN_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', decimals: 6 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', decimals: 6 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI', decimals: 18 },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC', decimals: 8 },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', decimals: 18 },
};

function getKnownToken(address?: string): { symbol: string; decimals: number } | undefined {
  if (!address) return undefined;
  return KNOWN_TOKENS[(address || '').toLowerCase()];
}

const MAX_UINT256 = ethers.MaxUint256;
function toBigIntSafe(v: any): bigint { try { if (typeof v === 'bigint') return v; return BigInt(v); } catch { return BigInt(0); } }
function isUnlimitedUsdt(value: any): boolean {
  try {
    const bi = toBigIntSafe(value);
    // Treat near-maximum approvals as unlimited
    return bi >= (MAX_UINT256 - BigInt(1000));
  } catch {
    return false;
  }
}

function isHexNonZero(value?: string): boolean {
  if (!value) return false;
  try { return BigInt(value) > BigInt(0); } catch { return false; }
}

function safeFormatUnits(value: any, decimals: number): string {
  try { return ethers.formatUnits(value, decimals); } catch { return '-'; }
}

export function extractAmountInfo(tx: any): AmountInfo {
  try {
    if (!tx) return { amount: '-', unit: 'ETH', unifiedEth: '-' };

    // Native ETH
    if (isHexNonZero(tx.value)) {
      const eth = ethers.formatEther(tx.value);
      return { amount: eth, unit: 'ETH', unifiedEth: eth };
    }

    // Function-based (ERC-20 transfer/approve)
    const decoded = tx?._decoded_fn;
    if (decoded && decoded.function) {
      const fn = String(decoded.function).toLowerCase();
      if (fn.includes('transfer') || fn.includes('approve') || fn.includes('permit') || fn.includes('increaseallowance')) {
        const arg = (decoded.args || []).find((a: any) => ['value', '_value', 'amount', 'wad', 'amountIn', 'amountOutMin'].includes(a?.name));
        if (arg && arg.value != null) {
          const tokenMeta = getKnownToken(tx?.to) || { symbol: 'ERC20', decimals: 18 };
          // Special handling for USDT unlimited approvals
          if (tokenMeta.symbol === 'USDT' && (fn.includes('approve') || fn.includes('permit') || fn.includes('increaseallowance')) && isUnlimitedUsdt(arg.value)) {
            return { amount: '∞', unit: 'USDT', unifiedEth: '-' };
          }
          return { amount: safeFormatUnits(arg.value, tokenMeta.decimals), unit: tokenMeta.symbol, unifiedEth: '-' };
        }
      }
    }

    // Event-based (ERC-20 Transfer/Approval)
    const events = tx?._decoded_events;
    if (Array.isArray(events)) {
      for (const ev of events) {
        if ((ev?.event || '').toLowerCase() === 'transfer' && Array.isArray(ev?.args)) {
          const valArg = ev.args.find((a: any) => ['value', 'amount', 'wad'].includes(a?.name));
          if (valArg && valArg.value != null) {
            const tokenMeta = getKnownToken(ev?.address) || { symbol: 'ERC20', decimals: 18 };
            return { amount: safeFormatUnits(valArg.value, tokenMeta.decimals), unit: tokenMeta.symbol, unifiedEth: '-' };
          }
        }
        if ((ev?.event || '').toLowerCase() === 'approval' && Array.isArray(ev?.args)) {
          const valArg = ev.args.find((a: any) => ['value', 'amount'].includes(a?.name));
          if (valArg && valArg.value != null) {
            const tokenMeta = getKnownToken(ev?.address) || { symbol: 'ERC20', decimals: 18 };
            if (tokenMeta.symbol === 'USDT' && isUnlimitedUsdt(valArg.value)) {
              return { amount: '∞', unit: 'USDT', unifiedEth: '-' };
            }
            return { amount: safeFormatUnits(valArg.value, tokenMeta.decimals), unit: tokenMeta.symbol, unifiedEth: '-' };
          }
        }
      }
    }

    return { amount: '-', unit: 'ETH', unifiedEth: '-' };
  } catch {
    return { amount: '-', unit: 'ETH', unifiedEth: '-' };
  }
}

export function formatTokenAmount(amount: bigint | number | string, decimals: number = 18): string {
  return safeFormatUnits(amount, decimals);
}

export function calculateAmount(tx: any): string {
  const info = extractAmountInfo(tx);
  return info.amount === '-' ? '-' : `${info.amount} ${info.unit}`;
}

export function calculateUnifiedEth(tx: any): string {
  try {
    return isHexNonZero(tx?.value) ? ethers.formatEther(tx.value) : '-';
  } catch { return '-'; }
}


