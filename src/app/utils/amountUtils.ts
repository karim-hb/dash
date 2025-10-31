// Shared amount decoding utilities for transaction amount extraction

export interface AmountInfo {
  amount: string;
  unit: string;
  unifiedEth?: string;
}

// Comprehensive token registry with major DeFi tokens
const TOKEN_REGISTRY: Record<string, { symbol: string; decimals: number }> = {
  // Native ETH
  '0x0000000000000000000000000000000000000000': { symbol: 'ETH', decimals: 18 },
  '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee': { symbol: 'ETH', decimals: 18 },

  // Wrapped ETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', decimals: 18 },

  // Stablecoins
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', decimals: 6 },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', decimals: 6 },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI', decimals: 18 },
  '0x4fabb145d64652a948d72533023f6e7a623c7c53': { symbol: 'BUSD', decimals: 18 },
  '0x8e870d67f660d95d5be530380d0ec0bd388289e1': { symbol: 'USDP', decimals: 18 },
  '0xa693b19d2931d498c5b318df961919bb4aee87a5': { symbol: 'UST', decimals: 6 },
  '0x1456688345527be1f37e9e627da0837d6f08c925': { symbol: 'USDD', decimals: 18 },

  // Major cryptocurrencies
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC', decimals: 8 },
  '0x321162cd933e2be498cd2267a90534a804051b46': { symbol: 'BTCB', decimals: 18 },
  '0x75231f58b43240c9718dd58b4967c5114342a86c': { symbol: 'OKB', decimals: 18 },
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': { symbol: 'SHIB', decimals: 18 },
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': { symbol: 'MATIC', decimals: 18 },

  // DeFi tokens
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': { symbol: 'UNI', decimals: 18 },
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': { symbol: 'AAVE', decimals: 18 },
  '0xc00e94cb662c3520282e6f5717214004a7f26888': { symbol: 'COMP', decimals: 18 },
  '0x514910771af9ca656af840dff83e8264ecf986ca': { symbol: 'LINK', decimals: 18 },
  '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e': { symbol: 'YFI', decimals: 18 },
  '0xba100000625a3754423978a60c9317c58a424e3d': { symbol: 'BAL', decimals: 18 },
  '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44': { symbol: 'KP3R', decimals: 18 },
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f': { symbol: 'SNX', decimals: 18 },
  '0x408e41876cccdc0f92210600ef50372656052a38': { symbol: 'REN', decimals: 18 },
  '0x4e15361fd6b4bb609fa63c81d99d0ce2bcb7c04': { symbol: 'FTM', decimals: 18 },
  '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2': { symbol: 'SUSHI', decimals: 18 },
  '0xd533a949740bb3306d119cc777fa900ba034cd52': { symbol: 'CRV', decimals: 18 },
  '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b': { symbol: 'CVX', decimals: 18 },
  '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0': { symbol: 'FXS', decimals: 18 },
  '0xd46ba6d942050d489dbd938a2c909a5d5039a161': { symbol: 'AMPL', decimals: 9 },

  // Layer 2 tokens
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': { symbol: 'LDO', decimals: 18 },
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': { symbol: 'wstETH', decimals: 18 },
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { symbol: 'stETH', decimals: 18 },
  '0x5e74c9036fb86bd7ecdcb084a0673efc32ea31cb': { symbol: 'sETH', decimals: 18 },

  // Gaming tokens
  '0x0f5d2fb29fb7d3cfee444a200298f468908cc942': { symbol: 'MANA', decimals: 18 },
  '0x3845badade8e6dff049820680d1f14bd3903a5d0': { symbol: 'SAND', decimals: 18 },
  '0xf57e7e7c23978c3caec3c3548a3d29cbfcfae9': { symbol: 'IMX', decimals: 18 },

  // Privacy tokens
  '0x1776e1f26f98b1a5df9cd347953a26dd3cb46671': { symbol: 'NMR', decimals: 18 },
  '0x8290333cef9e6d528dd5618fb97a76f07': { symbol: 'ANKR', decimals: 18 },

  // Oracle tokens
  '0x0f9ffb58ae4ba5a879ed3c7d7b3f8e3e3b3c7d3': { symbol: 'MKR', decimals: 18 },
  '0x8290333cef9e6d528dd5618fb97a76f07': { symbol: 'REP', decimals: 18 },
};

// Get token info from address
function getTokenInfo(address: string): { symbol: string; decimals: number } {
  const normalizedAddr = (address || '').toLowerCase();
  return TOKEN_REGISTRY[normalizedAddr] || { symbol: 'TOKEN', decimals: 18 };
}

// BigInt helpers to safely handle 256-bit values
function toBigInt(value: any): bigint {
  try {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.trunc(value));
    if (typeof value === 'string') {
      return (value.startsWith('0x') || value.startsWith('0X')) ? BigInt(value) : BigInt(value);
    }
    if (value && typeof value === 'object' && 'toString' in value) {
      return toBigInt((value as any).toString());
    }
  } catch {}
  return 0n;
}

function formatUnitsBigInt(amount: bigint, decimals: number, precision = 6): string {
  if (decimals < 0) decimals = 0;
  const base = 10n ** BigInt(decimals);
  const neg = amount < 0n;
  const abs = neg ? -amount : amount;
  const whole = abs / base;
  const frac = abs % base;

  const fracScaled = (frac * 10n ** BigInt(precision)) / base;
  let fracStr = fracScaled.toString().padStart(precision, '0');
  fracStr = fracStr.replace(/0+$/g, '');

  let out = whole.toString();
  if (fracStr.length > 0) out += `.${fracStr}`;
  if (neg) out = `-${out}`;

  const len = whole.toString().length;
  if (len > 12) return `${whole.toString().slice(0, len - 12)}.${whole.toString().slice(len - 12, len - 10)}T`;
  if (len > 9) return `${whole.toString().slice(0, len - 9)}.${whole.toString().slice(len - 9, len - 7)}B`;
  if (len > 6) return `${whole.toString().slice(0, len - 6)}.${whole.toString().slice(len - 6, len - 4)}M`;
  if (len > 3 && fracStr.length === 0) return `${whole.toString().slice(0, len - 3)}.${whole.toString().slice(len - 3, len - 1)}K`;

  if (whole === 0n && frac > 0n) return formatUnitsBigInt(amount, decimals, Math.max(precision, 8));
  return out;
}

// Extract amount and token info from decoded transaction with comprehensive DeFi support
export function extractAmountInfo(tx: any): AmountInfo {
  try {
    if (!tx) return { amount: '-', unit: 'ETH', unifiedEth: '-' };

    // 1. NATIVE ETH TRANSFERS - Always check first
    const valueWei = toBigInt(tx.value || '0x0');
    if (valueWei > 0n) {
      const amount = formatUnitsBigInt(valueWei, 18, 6);
      const unifiedEth = formatUnitsBigInt(valueWei, 18, 4);
      return { amount, unit: 'ETH', unifiedEth };
    }

    const decoded = tx._decoded_fn;
    const decodedEvents = tx._decoded_events;

    // 2. EVENT-BASED AMOUNT EXTRACTION (Most reliable)
    if (decodedEvents && decodedEvents.length > 0) {
      for (const event of decodedEvents) {
        if (event.confidence >= 0.7) { // Lower threshold for events

          // ERC-20 Transfer Events
          if (event.event === 'Transfer' && event.args) {
            const valueArg = event.args.find((arg: any) =>
              arg.name === 'value' || arg.name === 'wad' || arg.name === 'amount'
            );
            if (valueArg && valueArg.value) {
              try {
                const amountValue = toBigInt(valueArg.value);
                if (amountValue > 0n) {
                  const tokenInfo = getTokenInfo(event.address);
                  return {
                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                    unit: tokenInfo.symbol,
                    unifiedEth: '-'
                  };
                }
              } catch (e) { continue; }
            }
          }

          // DEX Swap Events (Uniswap V2/V3, SushiSwap, etc.)
          if (event.event === 'Swap' && event.args) {
            // Attempt to infer token0/token1 from Transfer events where pair is sender/recipient
            const pairAddr = (event.address || '').toLowerCase();
            const transferEvents = (decodedEvents || []).filter((e: any) => e.event === 'Transfer' && e.args && e.address && e.address !== pairAddr);

            const tokensByInvolvement: string[] = [];
            for (const te of transferEvents) {
              const fromArg = te.args.find((a: any) => a.name === 'from');
              const toArg = te.args.find((a: any) => a.name === 'to');
              const involved = (fromArg && typeof fromArg.value === 'string' && fromArg.value.toLowerCase() === pairAddr) ||
                              (toArg && typeof toArg.value === 'string' && toArg.value.toLowerCase() === pairAddr);
              if (involved) {
                tokensByInvolvement.push((te.address || '').toLowerCase());
              }
              if (tokensByInvolvement.length >= 2) break;
            }

            const token0Addr = tokensByInvolvement[0];
            const token1Addr = tokensByInvolvement[1];
            const token0Info = token0Addr ? getTokenInfo(token0Addr) : { symbol: 'TOKEN0', decimals: 18 };
            const token1Info = token1Addr ? getTokenInfo(token1Addr) : { symbol: 'TOKEN1', decimals: 18 };

            // Check all amount fields
            const amountFields = ['amount0In', 'amount1In', 'amount0Out', 'amount1Out', 'amountIn', 'amountOut'];
            for (const field of amountFields) {
              const arg = event.args.find((a: any) => a.name === field);
              if (arg && arg.value) {
                try {
                  const amountValue = toBigInt(arg.value);
                  if (amountValue > 0n) {
                    // Map amount0* to token0, amount1* to token1
                    const isZero = field.toLowerCase().includes('0');
                    const tokenInfo = isZero ? token0Info : token1Info;
                    const direction = field.includes('In') ? 'IN' : 'OUT';
                    return {
                      amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                      unit: direction === 'IN' ? `${tokenInfo.symbol} in` : `${tokenInfo.symbol} out`,
                      unifiedEth: '-'
                    };
                  }
                } catch (e) { continue; }
              }
            }
          }

          // Perp/Leverage Position Events (GMX, Synthetix)
          if ((event.event === 'IncreasePosition' || event.event === 'DecreasePosition' ||
               event.event === 'UpdatePosition' || event.event === 'ClosePosition') && event.args) {
            const positionFields = ['collateralDelta', 'sizeDelta', 'collateral', 'size', 'margin', 'leverage'];
            for (const field of positionFields) {
              const arg = event.args.find((a: any) => a.name === field);
              if (arg && arg.value) {
                try {
                  const amountValue = toBigInt(arg.value);
                  if (amountValue > 0n) {
                    // Perp protocols typically use 6 decimals for USD values
                    return {
                      amount: formatTokenAmount(amountValue, 6),
                      unit: field.toUpperCase(),
                      unifiedEth: '-'
                    };
                  }
                } catch (e) { continue; }
              }
            }
          }

          // Lending Events (Aave, Compound)
          if ((event.event === 'Supply' || event.event === 'Withdraw' ||
               event.event === 'Borrow' || event.event === 'Repay') && event.args) {
            const lendingFields = ['amount', 'value', 'principal', 'interest'];
            for (const field of lendingFields) {
              const arg = event.args.find((a: any) => a.name === field);
              if (arg && arg.value) {
                try {
                  const amountValue = toBigInt(arg.value);
                  if (amountValue > 0n) {
                    const tokenInfo = getTokenInfo(event.address);
                    return {
                      amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                      unit: tokenInfo.symbol,
                      unifiedEth: '-'
                    };
                  }
                } catch (e) { continue; }
              }
            }
          }

          // Staking Events (Lido, Rocket Pool)
          if ((event.event === 'Staked' || event.event === 'Unstaked' ||
               event.event === 'Submitted' || event.event === 'Unsubmitted') && event.args) {
            const stakingFields = ['amount', 'value', 'ethAmount'];
            for (const field of stakingFields) {
              const arg = event.args.find((a: any) => a.name === field);
              if (arg && arg.value) {
                try {
                  const amountValue = toBigInt(arg.value);
                  if (amountValue > 0n) {
                    const tokenInfo = getTokenInfo(event.address);
                    return {
                      amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                      unit: tokenInfo.symbol,
                      unifiedEth: '-'
                    };
                  }
                } catch (e) { continue; }
              }
            }
          }
        }
      }
    }

    // 3. FUNCTION-BASED AMOUNT EXTRACTION (High confidence required)
    if (decoded && decoded.decoded && decoded.confidence >= 0.8) {
      const functionName = (decoded.function || '').toLowerCase();

      // DEX Swap Functions
      if (functionName.includes('swap') || functionName.includes('exchange') ||
          functionName.includes('trade') || decoded.confidence >= 0.9) {
        const swapFields = ['amountIn', 'amountOut', 'amountInMax', 'amountOutMin', 'amount'];
        for (const field of swapFields) {
          const arg = decoded.args.find((a: any) => a.name === field);
          if (arg && arg.value) {
            try {
              const amountValue = toBigInt(arg.value);
              if (amountValue > 0n) {
                const tokenInfo = getTokenInfo(tx.to || '');
                const direction = field.includes('In') ? 'IN' : 'OUT';
                return {
                  amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                  unit: `${tokenInfo.symbol}(${direction})`,
                  unifiedEth: '-'
                };
              }
            } catch (e) { continue; }
          }
        }
      }

      // ERC-20 Transfer/Approve Functions
      if (functionName.includes('transfer') || functionName.includes('approve') ||
          functionName.includes('permit')) {
        const transferFields = ['amount', 'value', 'wad'];
        for (const field of transferFields) {
          const arg = decoded.args.find((a: any) => a.name === field);
          if (arg && arg.value) {
            try {
              const amountValue = toBigInt(arg.value);
              if (amountValue > 0n) {
                const tokenInfo = getTokenInfo(tx.to || '');
                return {
                  amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                  unit: tokenInfo.symbol,
                  unifiedEth: '-'
                };
              }
            } catch (e) { continue; }
          }
        }
      }

      // Lending Functions
      if (functionName.includes('supply') || functionName.includes('withdraw') ||
          functionName.includes('borrow') || functionName.includes('repay') ||
          functionName.includes('deposit') || functionName.includes('redeem')) {
        const lendingFields = ['amount', 'value', 'principal'];
        for (const field of lendingFields) {
          const arg = decoded.args.find((a: any) => a.name === field);
          if (arg && arg.value) {
            try {
              const amountValue = toBigInt(arg.value);
              if (amountValue > 0n) {
                const tokenInfo = getTokenInfo(tx.to || '');
                return {
                  amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                  unit: tokenInfo.symbol,
                  unifiedEth: '-'
                };
              }
            } catch (e) { continue; }
          }
        }
      }

      // Staking Functions
      if (functionName.includes('stake') || functionName.includes('unstake') ||
          functionName.includes('submit') || functionName.includes('withdraw')) {
        const stakingFields = ['amount', 'value', '_amount'];
        for (const field of stakingFields) {
          const arg = decoded.args.find((a: any) => a.name === field);
          if (arg && arg.value) {
            try {
              const amountValue = toBigInt(arg.value);
              if (amountValue > 0n) {
                const tokenInfo = getTokenInfo(tx.to || '');
                return {
                  amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                  unit: tokenInfo.symbol,
                  unifiedEth: '-'
                };
              }
            } catch (e) { continue; }
          }
        }
      }

      // Liquidity Functions
      if (functionName.includes('addliquidity') || functionName.includes('removeliquidity')) {
        const liquidityFields = ['amountADesired', 'amountBDesired', 'amountAMin', 'amountBMin', 'liquidity'];
        for (const field of liquidityFields) {
          const arg = decoded.args.find((a: any) => a.name === field);
          if (arg && arg.value) {
            try {
              const amountValue = toBigInt(arg.value);
              if (amountValue > 0n) {
                const tokenInfo = getTokenInfo(tx.to || '');
                return {
                  amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                  unit: tokenInfo.symbol,
                  unifiedEth: '-'
                };
              }
            } catch (e) { continue; }
          }
        }
      }

      // Generic amount fields for any function
      const genericFields = ['amount', 'value', 'wad', '_amount', '_value'];
      for (const field of genericFields) {
        const arg = decoded.args.find((a: any) => a.name === field && a.type === 'uint256');
        if (arg && arg.value) {
          try {
            const amountValue = toBigInt(arg.value);
            if (amountValue > 1000000000000n) { // > 1e12
              const tokenInfo = getTokenInfo(tx.to || '');
              return {
                amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                unit: tokenInfo.symbol,
                unifiedEth: '-'
              };
            }
          } catch (e) { continue; }
        }
      }
    }

    // 4. FALLBACK: Check for any large uint256 values in events (lower confidence)
    if (decodedEvents && decodedEvents.length > 0) {
      for (const event of decodedEvents) {
        if (event.args) {
          for (const arg of event.args) {
            if (arg.type === 'uint256' && arg.value) {
              try {
                const amountValue = toBigInt(arg.value);
                if (amountValue > 1000000000000000n) { // > 1e15
                  const tokenInfo = getTokenInfo(event.address);
                  return {
                    amount: formatTokenAmount(amountValue, tokenInfo.decimals),
                    unit: tokenInfo.symbol,
                    unifiedEth: '-'
                  };
                }
              } catch (e) { continue; }
            }
          }
        }
      }
    }

    return { amount: '-', unit: 'ETH', unifiedEth: '-' };
  } catch {
    return { amount: '-', unit: 'ETH', unifiedEth: '-' };
  }
}

// Simple token amount formatter with proper decimal handling
export function formatTokenAmount(amount: bigint | number | string, decimals: number = 18): string {
  try {
    const bi = toBigInt(amount);
    return formatUnitsBigInt(bi, decimals, 6);
  } catch {
    try { return (amount as any).toString(); } catch { return '-'; }
  }
}

// Legacy function for backward compatibility
export function calculateAmount(tx: any): string {
  const info = extractAmountInfo(tx);
  return info.amount === '-' ? '-' : `${info.amount} ${info.unit}`;
}

// Legacy function for unified ETH calculation
export function calculateUnifiedEth(tx: any): string {
  const info = extractAmountInfo(tx);
  return info.unifiedEth || '-';
}
