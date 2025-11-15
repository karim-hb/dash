import { Transaction, DecodedCall, DecodedEvent, SwapDetails } from '@/lib/types';
import { selector, wordAt, hexToBigInt, decodeAddressArray } from '@/lib/util/hex';
import { getAbiRegistry } from './abiRegistry';
import { getAbiCache } from './abiCache';
import { decodeEventLogs, getProtocolFromAddress } from './eventDecoder';
import { Interface, getAddress, toBigInt } from 'ethers';
import { logErrorWithConsole, logWarningWithConsole } from '../utils/errorLogger';

const SWAP_FUNCTION_SIGNATURES = [
  // Uniswap V2/V3 and similar
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)',
  'function swapExactETHForTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapETHForExactTokens(uint256 amountOut, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForETH(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapTokensForExactETH(uint256 amountOut, uint256 amountInMax, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactTokensForETHSupportingFeeOnTransferTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function swapExactETHForTokensSupportingFeeOnTransferTokens(uint256 amountOutMin, address[] path, address to, uint256 deadline)',
  'function exactInputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 sqrtPriceLimitX96) params)',
  'function exactOutputSingle((address tokenIn,address tokenOut,uint24 fee,address recipient,uint256 deadline,uint256 amountOut,uint256 amountInMaximum,uint160 sqrtPriceLimitX96) params)',
  'function exactInput((bytes path,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum) params)',
  'function exactOutput((bytes path,address recipient,uint256 deadline,uint256 amountOut,uint256 amountInMaximum) params)',
  // Uniswap V1
  'function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)',
  'function tokenToEthSwapInput(uint256 tokens_sold, uint256 min_eth, uint256 deadline)',
  'function ethToTokenSwapOutput(uint256 tokens_bought, uint256 max_eth, uint256 deadline)',
  'function tokenToEthSwapOutput(uint256 eth_bought, uint256 max_tokens, uint256 deadline)',
  'function tokenToTokenSwapInput(uint256 tokens_sold, uint256 min_tokens_bought, uint256 min_eth_bought, uint256 deadline, address token_addr)',
  'function tokenToTokenSwapOutput(uint256 tokens_bought, uint256 max_tokens_sold, uint256 max_eth_sold, uint256 deadline, address token_addr)',
  // Curve V1 Old
  'function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy)',
  'function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy)',
  // Custom AMM
  'function swap(uint256 amount0Out, uint256 amount1Out, address to)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, uint24[] fees, address to, uint256 deadline)',
  'function swapTokensForExactTokens(uint256 amountOut, uint256 amountInMax, address[] path, uint24[] fees, address to, uint256 deadline)'
];

const SWAP_INTERFACE = new Interface(SWAP_FUNCTION_SIGNATURES);

const V2_FUNCTION_NAMES = new Set([
  'swapExactTokensForTokens',
  'swapTokensForExactTokens',
  'swapExactETHForTokens',
  'swapETHForExactTokens',
  'swapExactTokensForETH',
  'swapTokensForExactETH',
  'swapExactTokensForTokensSupportingFeeOnTransferTokens',
  'swapExactTokensForETHSupportingFeeOnTransferTokens',
  'swapExactETHForTokensSupportingFeeOnTransferTokens'
]);

const V3_FUNCTION_NAMES = new Set([
  'exactInputSingle',
  'exactOutputSingle',
  'exactInput',
  'exactOutput'
]);

const V1_FUNCTION_NAMES = new Set([
  'ethToTokenSwapInput',
  'tokenToEthSwapInput',
  'ethToTokenSwapOutput',
  'tokenToEthSwapOutput',
  'tokenToTokenSwapInput',
  'tokenToTokenSwapOutput'
]);

const CURVE_V1_OLD_FUNCTION_NAMES = new Set([
  'exchange',
  'exchange_underlying'
]);

const CUSTOM_AMM_FUNCTION_NAMES = new Set([
  'swap',
  'swapExactTokensForTokens',
  'swapTokensForExactTokens'
]);

function normalizeAddressLower(value: any): string | null {
  if (!value) return null;
  try {
    return getAddress(value).toLowerCase();
  } catch {
    try {
      if (typeof value === 'string') {
        return `0x${value.replace(/^0x/, '')}`.toLowerCase();
      }
    } catch (e) { logErrorWithConsole(e, 'Failed to normalize address'); }
    return null;
  }
}

function normalizeAddressArray(values: any): string[] {
  if (!values) return [];
  const arr = Array.isArray(values) ? values : Array.from(values);
  const out: string[] = [];
  for (const value of arr) {
    const addr = normalizeAddressLower(value);
    if (addr) out.push(addr);
  }
  return out;
}

function decodeUniswapV3Path(path: string): string[] {
  if (!path) return [];
  const hex = path.startsWith('0x') ? path.slice(2) : path;
  const ADDR_LEN = 40; // 20 bytes in hex
  const FEE_LEN = 6;   // 3 bytes in hex
  const tokens: string[] = [];
  let offset = 0;

  while (offset + ADDR_LEN <= hex.length) {
    const tokenHex = hex.slice(offset, offset + ADDR_LEN);
    const addr = normalizeAddressLower(`0x${tokenHex}`);
    if (addr) tokens.push(addr);
    offset += ADDR_LEN;
    if (offset + FEE_LEN > hex.length) break;
    offset += FEE_LEN;
  }

  return tokens;
}

function toBigIntOrNull(value: any): bigint | null {
  if (value === undefined || value === null) return null;
  try {
    return toBigInt(value);
  } catch {
    try {
      return toBigInt(value.toString());
    } catch (e) { logErrorWithConsole(e, 'Failed to convert value to bigint'); }  
    return null;
  }
}

// Decoded call result
export interface DecodeResult {
  decoded: boolean;
  function?: DecodedCall;
  events?: DecodedEvent[];
  error?: string;
}

// Core decoder with heuristics and ABI support
export class CoreDecoder {
  private registry = getAbiRegistry();

  // Main decode function
  async decodeTransaction(tx: Transaction): Promise<DecodeResult> {
    try {
      const input = tx.input;
      const to = tx.to || 'unknown';
      const hash = tx.hash || 'unknown';

      if (!input || input === '0x') {
        console.log(`🔍 TX ${hash.slice(0,8)}: No input data`);
        return { decoded: false };
      }

      console.log(`🔍 TX ${hash.slice(0,8)}: Decoding ${to.slice(0,10)}...${input.slice(0,10)}...`);

      let decodedFunction: DecodedCall | undefined;
      let decodedEvents: DecodedEvent[] | undefined;

      // Offline-only decoding (no external API, no heuristics)
      // 1) Protocol-specific contract decoding (offline ABIs)
      const offlineAbiResult = await this.decodeWithOfflineAbiRegistry(tx);
      if (offlineAbiResult) {
        console.log(`✅ TX ${hash.slice(0,8)}: Offline ABI decoded - ${offlineAbiResult.function}`);
        decodedFunction = offlineAbiResult;
      }

      // 2) Local signature database decoding
      if (!decodedFunction) {
        const signatureResult = await this.decodeWithEnhancedSignatures(input, to);
        if (signatureResult) {
          console.log(`✅ TX ${hash.slice(0,8)}: Signature decoded - ${signatureResult.function}`);
          decodedFunction = signatureResult;
        }
      }

      // Multicall subcall decoding (enrich when applicable)
      if (decodedFunction && decodedFunction.function && decodedFunction.function.toLowerCase().includes('multicall')) {
        try {
          const enriched = await this.decodeMulticallSubcalls(tx, decodedFunction);
          if (enriched) {
            decodedFunction = enriched;
          }
        } catch (e: any) {
          logWarningWithConsole(e, `Multicall sub-decode failed for ${hash.slice(0,8)}`);
        }
      }

      // Final classification (no heuristics)
      if (!decodedFunction) {
        console.log(`❌ TX ${hash.slice(0,8)}: Unable to decode with offline ABIs or local signatures`);
        decodedFunction = {
          function: 'unknown_contract_call',
          args: [{ name: 'input_data', type: 'bytes', value: input }],
          confidence: 0,
          decoded: false
        };
      }

      // Try to decode events from receipt (for included transactions)
      if (tx._receipt && tx._state === 'INCLUDED') {
        try {
          decodedEvents = await decodeEventLogs(tx);
          if (decodedEvents.length > 0) {
            console.log(`✅ TX ${hash.slice(0,8)}: Decoded ${decodedEvents.length} events`);
          }
        } catch (error) {
          logErrorWithConsole(error, `TX ${hash.slice(0,8)}: Event decoding failed`);
        }
      }

      return {
        decoded: true,
        function: decodedFunction,
        events: decodedEvents
      };

    } catch (error) {
      logErrorWithConsole(error, 'TX decode error');
      return {
        decoded: false,
        error: `Decode error: ${error instanceof Error ? error.message : 'Unknown'}`
      };
    }
  }

  // Decode using ABI registry
  private async decodeWithAbi(input: string): Promise<DecodedCall | null> {
    const sel = selector(input);
    if (!sel) return null;

    let signature = this.registry.resolveSignature(sel);
    if (!signature) {
      signature = await this.registry.resolveSignatureRemote(sel) || null;
      if (!signature) return null;
    }
    return this.decodeWithSignature(input, signature) ?? null;
  }

  // Decode using on-chain contract ABI via Etherscan + ethers Interface
  private async decodeWithContractAbi(tx: Transaction): Promise<DecodedCall | null> {
    const to = tx.to?.toLowerCase();
    const data = tx.input;
    if (!to || !data || data === '0x') return null;
    try {
      const abi = await (async () => {
        const cache = getAbiCache();
        const fromCache = cache.get(to);
        if (fromCache) return fromCache;
        return await cache.fetchFromEtherscan(to);
      })();
      if (!abi) return null;
      const iface = new Interface(abi as any);
      const parsed = iface.parseTransaction({ data });
      if (!parsed) return null;
      const args = parsed.fragment.inputs.map((inp: any, idx: number) => ({
        name: inp.name || `arg${idx}`,
        type: inp.format(),
        value: parsed.args?.[idx]
      }));
      return {
        function: parsed.name,
        args,
        confidence: 0.98,
        decoded: true
      };
    } catch (err) {
      logErrorWithConsole(err, 'Failed to decode with contract ABI');
      return null;
    }
  }

  // Decode using heuristics
  private decodeWithHeuristics(input: string): DecodedCall | null {
    const data = input.startsWith('0x') ? input.slice(2) : input;
    const dataLen = data.length;
    const sel = data.slice(0, 8).toLowerCase();

    // ERC-20 transfer(address,uint256)
    if (sel === 'a9059cbb' && dataLen >= 8 + 64 * 2) {
      try {
        const to = `0x${data.slice(8 + 24, 8 + 64)}`;
        const amount = hexToBigInt(`0x${data.slice(8 + 64, 8 + 128)}`);
        return {
          function: 'transfer',
          args: [
            { name: 'to', type: 'address', value: to.toLowerCase() },
            { name: 'amount', type: 'uint256', value: amount }
          ],
          confidence: 0.8
        };
      } catch (e) {
        logErrorWithConsole(e, 'Failed to decode with ERC-20 transfer');
        return null;
      }
    }

    // ERC-20 approve(address,uint256)
    if (sel === '095ea7b3' && dataLen >= 8 + 64 * 2) {
      try {
        const spender = `0x${data.slice(8 + 24, 8 + 64)}`;
        const amount = hexToBigInt(`0x${data.slice(8 + 64, 8 + 128)}`);
        this.registry.cacheDiscoveredSignature(sel, 'approve(address,uint256)');
        return {
          function: 'approve',
          args: [
            { name: 'spender', type: 'address', value: spender.toLowerCase() },
            { name: 'amount', type: 'uint256', value: amount }
          ],
          confidence: 0.7
        };
      } catch (e) {
        logErrorWithConsole(e, 'Failed to decode with ERC-20 approve');
        return null;
      }
    }

    // ERC-20 transferFrom(address,address,uint256)
    if (sel === '23b872dd' && dataLen >= 8 + 64 * 3) {
      try {
        const from = `0x${data.slice(8 + 24, 8 + 64)}`;
        const to = `0x${data.slice(8 + 64 + 24, 8 + 64 * 2)}`;
        const amount = hexToBigInt(`0x${data.slice(8 + 64 * 2, 8 + 64 * 3)}`);
        this.registry.cacheDiscoveredSignature(sel, 'transferFrom(address,address,uint256)');
        return {
          function: 'transferFrom',
          args: [
            { name: 'from', type: 'address', value: from.toLowerCase() },
            { name: 'to', type: 'address', value: to.toLowerCase() },
            { name: 'amount', type: 'uint256', value: amount }
          ],
          confidence: 0.7
        };
      } catch (e) {
        logErrorWithConsole(e, 'Failed to decode with ERC-20 transferFrom');
        return null;
      }
    }

    // Multicall detection (dynamic bytes array)
    if (dataLen >= 8 + 64 * 2) {
      try {
        const offsetWord = data.slice(8, 8 + 64);
        if (offsetWord === '0000000000000000000000000000000000000000000000000000000000000020') {
          const lengthWord = data.slice(8 + 64, 8 + 128);
          const arrayLen = Number(hexToBigInt(`0x${lengthWord}`));
          if (1 <= arrayLen && arrayLen <= 50) {
            this.registry.cacheDiscoveredSignature(sel, 'multicall(bytes[])');
            return {
              function: 'multicall',
              args: [
                { name: 'calls', type: 'bytes[]', value: `${arrayLen} calls` }
              ],
              confidence: 0.6
            };
          }
        }
      } catch (e) {
        logErrorWithConsole(e, 'Failed to decode with multicall');
        return null;
      }
    }

    // DEX Swap patterns - common Uniswap V2/V3 patterns
    if (dataLen >= 8 + 64 * 4) { // minimum 4 params for basic swap
      try {
        // Check for common DEX patterns by analyzing parameter structure
        const param1 = data.slice(8, 8 + 64);
        const param2 = data.slice(8 + 64, 8 + 128);
        const param3 = data.slice(8 + 128, 8 + 192);

        // Uniswap V2 style: amountIn, amountOutMin, path[], deadline
        if (param1.match(/^[0-9a-f]{64}$/) && param2.match(/^[0-9a-f]{64}$/)) {
          const amountIn = hexToBigInt(`0x${param1}`);
          const amountOutMin = hexToBigInt(`0x${param2}`);

          if (amountIn > BigInt(0) && amountOutMin > BigInt(0)) {
            // Look for path array (common in DEX swaps)
            if (dataLen >= 8 + 64 * 6) {
              const pathOffset = data.slice(8 + 192, 8 + 256);
              if (pathOffset === '00000000000000000000000000000000000000000000000000000000000000a0') {
                this.registry.cacheDiscoveredSignature(sel, 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)');
                return {
                  function: 'swapExactTokensForTokens',
                  args: [
                    { name: 'amountIn', type: 'uint256', value: amountIn },
                    { name: 'amountOutMin', type: 'uint256', value: amountOutMin },
                    { name: 'path', type: 'address[]', value: 'token path' },
                    { name: 'to', type: 'address', value: 'recipient' },
                    { name: 'deadline', type: 'uint256', value: 'timestamp' }
                  ],
                  confidence: 0.5
                };
              }
            }
          }
        }
      } catch {
        // Ignore DEX pattern detection errors
      }
    }

    // Generic amount extraction for common patterns
    if (dataLen >= 8 + 64) {
      try {
        // Look for large uint256 values that might be amounts
        const params: any[] = [];
        for (let i = 0; i < Math.min(4, Math.floor((dataLen - 8) / 64)); i++) {
          const paramData = data.slice(8 + i * 64, 8 + (i + 1) * 64);
          const value = hexToBigInt(`0x${paramData}`);

          // If we find a large value (> 1 ETH in wei), assume it's an amount
          if (value > BigInt('1000000000000000000')) {
            params.push({ name: `amount${i}`, type: 'uint256', value });
          } else if (paramData.match(/^000000000000000000000000[0-9a-f]{40}$/)) {
            // Looks like an address
            params.push({ name: `address${i}`, type: 'address', value: `0x${paramData.slice(24).toLowerCase()}` });
          }
        }

        if (params.length > 0) {
          this.registry.cacheDiscoveredSignature(sel, `unknown_${sel}(${params.map(p => p.type).join(',')})`);
          return {
            function: `unknown_${sel}`,
            args: params,
            confidence: 0.3
          };
        }
      } catch {
        // Ignore generic parameter extraction errors
      }
    }

    // Fallback: try to identify function family by selector prefix
    const prefix = sel.slice(0, 4);
    if (prefix === 'a905') { // transfer
      return {
        function: 'transfer',
        args: [
          { name: 'to', type: 'address', value: 'unknown' },
          { name: 'amount', type: 'uint256', value: 'unknown' }
        ],
        confidence: 0.2
      };
    } else if (prefix === '095e') { // approve
      return {
        function: 'approve',
        args: [
          { name: 'spender', type: 'address', value: 'unknown' },
          { name: 'amount', type: 'uint256', value: 'unknown' }
        ],
        confidence: 0.2
      };
    } else if (prefix === '022c' || prefix === '7ff3' || prefix === '18cb') { // swap
      return {
        function: 'swap',
        args: [
          { name: 'amountIn', type: 'uint256', value: 'unknown' },
          { name: 'amountOutMin', type: 'uint256', value: 'unknown' },
          { name: 'path', type: 'address[]', value: 'unknown' },
          { name: 'to', type: 'address', value: 'unknown' },
          { name: 'deadline', type: 'uint256', value: 'unknown' }
        ],
        confidence: 0.2
      };
    }

    // ERC-721/1155 transfer patterns
    if (dataLen >= 8 + 64 * 4) {
      try {
        const addr1 = `0x${data.slice(8 + 24, 8 + 64)}`;
        const addr2 = `0x${data.slice(8 + 64 + 24, 8 + 128)}`;

        if (addr1.startsWith('0x') && addr1.length === 42 &&
            addr2.startsWith('0x') && addr2.length === 42) {

          if (dataLen >= 8 + 64 * 4) {
            const tokenId = hexToBigInt(`0x${data.slice(8 + 192, 8 + 256)}`);
            return {
              function: 'transferFrom',
              args: [
                { name: 'from', type: 'address', value: addr1.toLowerCase() },
                { name: 'to', type: 'address', value: addr2.toLowerCase() },
                { name: 'tokenId', type: 'uint256', value: tokenId }
              ],
              confidence: 0.7
            };
          }
        }
      } catch {
        return null;
      }
    }

    return null;
  }

  // Comprehensive contract analysis for 100% decoding
  private async decodeWithComprehensiveAnalysis(tx: Transaction): Promise<DecodedCall | null> {
    const to = tx.to?.toLowerCase();
    const input = tx.input;

    if (!to || !input || input === '0x') return null;

    // Strategy 1: Check if it's a known protocol contract and try specific decoding
    const protocolResult = await this.decodeKnownProtocol(tx);
    if (protocolResult) return protocolResult;

    // Strategy 2: Try offline ABI registry for known contracts
    const abiResult = await this.decodeWithOfflineAbiRegistry(tx);
    if (abiResult) return abiResult;

    // Strategy 3: Analyze input data structure for known patterns
    const patternResult = this.decodeWithPatternAnalysis(input, to);
    if (patternResult) return patternResult;

    // Strategy 4: Try to identify function type by analyzing the first few bytes
    const functionTypeResult = this.decodeByFunctionType(input, to);
    if (functionTypeResult) return functionTypeResult;

    return null;
  }

  // Decode known protocol contracts
  private async decodeKnownProtocol(tx: Transaction): Promise<DecodedCall | null> {
    const to = tx.to?.toLowerCase();
    if (!to) return null;

    // Check against known protocol contracts
    const knownProtocols: Record<string, { name: string, decoder: (tx: Transaction) => Promise<DecodedCall | null> }> = {
      // Uniswap V2 Router
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
        name: 'UniswapV2',
        decoder: this.decodeUniswapV2.bind(this)
      },
      // Uniswap V3 Router
      '0xe592427a0aece92de3edee1f18e0157c05861564': {
        name: 'UniswapV3',
        decoder: this.decodeUniswapV3.bind(this)
      },
      // 1inch Router
      '0x1111111254eeb25477b68fb85ed929f73a960582': {
        name: '1inchV5',
        decoder: this.decodeOneInch.bind(this)
      },
      // GMX Router
      '0x489ee077994b6658eafa855c308275ead8097c4a': {
        name: 'GMX',
        decoder: this.decodeGMX.bind(this)
      }
    };

    const protocol = knownProtocols[to];
    if (protocol) {
      console.log(`🎯 Detected ${protocol.name} contract: ${to}`);
      return await protocol.decoder(tx);
    }

    return null;
  }

  // Comprehensive offline ABI registry for major DeFi protocols
  private async decodeWithOfflineAbiRegistry(tx: Transaction): Promise<DecodedCall | null> {
    const to = tx.to?.toLowerCase();
    if (!to) return null;

    // Comprehensive offline ABI registry for major protocols
    const offlineAbis: Record<string, any[]> = {
      // Uniswap V2 Router
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': [
        {"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"amountInMax","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapTokensForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapETHForExactTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactETHForTokensSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETHSupportingFeeOnTransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"amountADesired","type":"uint256"},{"internalType":"uint256","name":"amountBDesired","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountAMin","type":"uint256"},{"internalType":"uint256","name":"amountBMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidity","outputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"tokenA","type":"address"},{"internalType":"address","name":"tokenB","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"pair","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amountTokenDesired","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"addLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"},{"internalType":"uint256","name":"liquidity","type":"uint256"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"removeLiquidityETH","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"liquidity","type":"uint256"},{"internalType":"uint256","name":"amountTokenMin","type":"uint256"},{"internalType":"uint256","name":"amountETHMin","type":"uint256"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bool","name":"approveMax","type":"bool"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"removeLiquidityETHWithPermit","outputs":[{"internalType":"uint256","name":"amountToken","type":"uint256"},{"internalType":"uint256","name":"amountETH","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsOut","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"}],"name":"getAmountsIn","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"reserveA","type":"uint256"},{"internalType":"uint256","name":"reserveB","type":"uint256"}],"name":"quote","outputs":[{"internalType":"uint256","name":"amountB","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountOut","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"},{"internalType":"uint256","name":"reserveIn","type":"uint256"},{"internalType":"uint256","name":"reserveOut","type":"uint256"}],"name":"getAmountIn","outputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"}],"stateMutability":"pure","type":"function"},
        {"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"WETH","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
      ],

      // Uniswap V3 SwapRouter (0xE592...)
      '0xe592427a0aece92de3edee1f18e0157c05861564': [
        {"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct ISwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"components":[{"internalType":"bytes","name":"path","type":"bytes"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"}],"internalType":"struct ISwapRouter.ExactInputParams","name":"params","type":"tuple"}],"name":"exactInput","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"}
      ],

      // Uniswap V3 SwapRouter02 (0x68b3...)
      '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': [
        {"inputs":[{"internalType":"bytes","name":"data","type":"bytes"}],"name":"multicall","outputs":[{"internalType":"bytes","name":"result","type":"bytes"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"components":[{"internalType":"address","name":"tokenIn","type":"address"},{"internalType":"address","name":"tokenOut","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMinimum","type":"uint256"},{"internalType":"uint160","name":"sqrtPriceLimitX96","type":"uint160"}],"internalType":"struct IV3SwapRouter.ExactInputSingleParams","name":"params","type":"tuple"}],"name":"exactInputSingle","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"}
      ],

      // 1inch Aggregation Router V5 (0x1111...)
      '0x1111111254eeb25477b68fb85ed929f73a960582': [
        {"inputs":[{"internalType":"address","name":"srcToken","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"minReturn","type":"uint256"},{"internalType":"bytes32[]","name":"pools","type":"bytes32[]"}],"name":"unoswap","outputs":[{"internalType":"uint256","name":"returnAmount","type":"uint256"}],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"results","type":"bytes[]"}],"stateMutability":"payable","type":"function"}
      ],

      // GMX Vault
      '0x489ee077994b6658eafa855c308275ead8097c4a': [
        {"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"address","name":"_spender","type":"address"}],"name":"approve","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_collateralToken","type":"address"},{"internalType":"address","name":"_indexToken","type":"address"},{"internalType":"uint256","name":"_collateralDelta","type":"uint256"},{"internalType":"uint256","name":"_sizeDelta","type":"uint256"},{"internalType":"bool","name":"_isLong","type":"bool"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"decreasePosition","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_collateralToken","type":"address"},{"internalType":"address","name":"_indexToken","type":"address"},{"internalType":"uint256","name":"_collateralDelta","type":"uint256"},{"internalType":"uint256","name":"_sizeDelta","type":"uint256"},{"internalType":"bool","name":"_isLong","type":"bool"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"increasePosition","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_collateralToken","type":"address"},{"internalType":"address","name":"_indexToken","type":"address"},{"internalType":"bool","name":"_isLong","type":"bool"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"liquidatePosition","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_collateralToken","type":"address"},{"internalType":"address","name":"_indexToken","type":"address"},{"internalType":"uint256","name":"_collateralDelta","type":"uint256"},{"internalType":"uint256","name":"_sizeDelta","type":"uint256"},{"internalType":"bool","name":"_isLong","type":"bool"},{"internalType":"uint256","name":"_markPrice","type":"uint256"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"decreasePosition","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_account","type":"address"},{"internalType":"address","name":"_collateralToken","type":"address"},{"internalType":"address","name":"_indexToken","type":"address"},{"internalType":"uint256","name":"_collateralDelta","type":"uint256"},{"internalType":"uint256","name":"_sizeDelta","type":"uint256"},{"internalType":"bool","name":"_isLong","type":"bool"},{"internalType":"uint256","name":"_markPrice","type":"uint256"},{"internalType":"address","name":"_receiver","type":"address"}],"name":"increasePosition","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ],

      // Aave V3 Pool
      '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': [
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"onBehalfOf","type":"address"},{"internalType":"uint16","name":"referralCode","type":"uint16"}],"name":"supply","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"to","type":"address"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"onBehalfOf","type":"address"},{"internalType":"uint16","name":"referralCode","type":"uint16"}],"name":"borrow","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"address","name":"onBehalfOf","type":"address"}],"name":"repay","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"asset","type":"address"}],"name":"getReserveData","outputs":[{"components":[{"internalType":"uint256","name":"configuration","type":"uint256"},{"internalType":"uint128","name":"liquidityIndex","type":"uint128"},{"internalType":"uint128","name":"currentLiquidityRate","type":"uint128"},{"internalType":"uint128","name":"variableBorrowIndex","type":"uint128"},{"internalType":"uint128","name":"currentVariableBorrowRate","type":"uint128"},{"internalType":"uint128","name":"currentStableBorrowRate","type":"uint128"},{"internalType":"uint40","name":"lastUpdateTimestamp","type":"uint40"},{"internalType":"uint16","name":"id","type":"uint16"},{"internalType":"address","name":"aTokenAddress","type":"address"},{"internalType":"address","name":"stableDebtTokenAddress","type":"address"},{"internalType":"address","name":"variableDebtTokenAddress","type":"address"},{"internalType":"address","name":"interestRateStrategyAddress","type":"address"},{"internalType":"uint128","name":"accruedToTreasury","type":"uint128"},{"internalType":"uint128","name":"unbacked","type":"uint128"},{"internalType":"uint128","name":"isolationModeTotalDebt","type":"uint128"}],"internalType":"struct DataTypes.ReserveData","name":"","type":"ReserveData"}],"stateMutability":"view","type":"function"}
      ],

      // Curve 3Pool
      '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7': [
        {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"add_liquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"int128","name":"i","type":"int128"}],"name":"remove_liquidity_one_coin","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"remove_liquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"int128","name":"i","type":"int128"},{"internalType":"int128","name":"j","type":"int128"},{"internalType":"uint256","name":"dx","type":"uint256"},{"internalType":"uint256","name":"min_dy","type":"uint256"}],"name":"exchange","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"int128","name":"i","type":"int128"},{"internalType":"int128","name":"j","type":"int128"},{"internalType":"uint256","name":"dx","type":"uint256"}],"name":"get_dy","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"calc_token_amount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"calc_withdraw_one_coin","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
      ],

      // Compound V3 USDC
      '0xc3d688b66703497daa19211eedff47f25384cdc3': [
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"supply","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"asset","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"borrow","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"repayBorrow","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"redeem","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"redeemUnderlying","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"borrowBalanceStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"supplyBalanceStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"claimComp","outputs":[],"stateMutability":"nonpayable","type":"function"}
      ],

      // MakerDAO DAI
      '0x6b175474e89094c44da98b954eedeac495271d0f': [
        {"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"usr","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"usr","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"name","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"symbol","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
      ],

      // WETH
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': [
        {"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},
        {"inputs":[{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"guy","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"src","type":"address"},{"internalType":"address","name":"dst","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"guy","type":"address"},{"internalType":"uint256","name":"wad","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"guy","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"name","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"symbol","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
      ],

      // USDC
      '0xa0b86a33e6c906d0085f7e3b3f4b4b2e8a2d4d8': [
        {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
      ],

      // USDT (Tether)
      '0xdac17f958d2ee523a2206206994597c13d831ec7': [
        {"inputs":[{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_from","type":"address"},{"internalType":"address","name":"_to","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_spender","type":"address"},{"internalType":"uint256","name":"_value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}
      ],

      // Synthetix Proxy
      '0x57ab1ec28d129707052df4df418d58a2d46d5f51': [
        {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"fromCurrencyKey","type":"bytes32"},{"internalType":"uint256","name":"fromAmount","type":"uint256"},{"internalType":"bytes32","name":"toCurrencyKey","type":"bytes32"},{"internalType":"uint256","name":"toAmount","type":"uint256"},{"internalType":"address","name":"toAddress","type":"address"}],"name":"synthExchange","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"currencyKey","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"issueSynths","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"currencyKey","type":"bytes32"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"burnSynths","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"bytes32","name":"currencyKey","type":"bytes32"}],"name":"synths","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"bytes32","name":"currencyKey","type":"bytes32"}],"name":"synthBalanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
      ]
    };

    const abi = offlineAbis[to];
    if (abi) {
      console.log(`🎯 Using offline ABI for known contract: ${to}`);
      return await this.decodeWithSpecificAbi(tx, abi);
    }

    return null;
  }

  // Pattern analysis for unknown contracts
  private decodeWithPatternAnalysis(input: string, contractAddress: string): DecodedCall | null {
    if (input.length < 10) return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;
    const selector = data.slice(0, 8);

    // Common DeFi patterns by selector prefix
    const patterns: Record<string, { function: string, argCount: number }> = {
      'a9059c': { function: 'transfer', argCount: 2 }, // ERC-20 transfer
      '095ea7': { function: 'approve', argCount: 2 },  // ERC-20 approve
      '23b872': { function: 'transferFrom', argCount: 3 }, // ERC-20 transferFrom
      '70a082': { function: 'balanceOf', argCount: 1 }, // ERC-20 balanceOf
      '18160d': { function: 'totalSupply', argCount: 0 }, // ERC-20 totalSupply
      'dd62ed': { function: 'allowance', argCount: 2 }, // ERC-20 allowance
      // '095ea7' already mapped above for approve
      '022c0d': { function: 'swap', argCount: 4 }, // Generic swap
      '7ff36a': { function: 'swapExactETHForTokens', argCount: 4 }, // Uniswap style
      '18cbafe': { function: 'swapExactETHForTokensSupportingFeeOnTransfer', argCount: 4 },
      '414bf38': { function: 'exactInputSingle', argCount: 1 }, // Uniswap V3
      'db3e219': { function: 'exactOutput', argCount: 1 }, // Uniswap V3
      '861153d': { function: 'addLiquidity', argCount: 6 }, // Liquidity operations
      'e8e3370': { function: 'addLiquidityETH', argCount: 5 },
      'baa2ab': { function: 'removeLiquidity', argCount: 5 },
      '02751ce': { function: 'removeLiquidityETHWithPermit', argCount: 7 },
      'd0e30d': { function: 'deposit', argCount: 0 }, // Deposit/withdraw patterns
      '2e1a7d4': { function: 'withdraw', argCount: 1 },
      'a694fc3': { function: 'stake', argCount: 1 }, // Staking patterns
      '2e17de7': { function: 'unstake', argCount: 1 },
      'be29184': { function: 'claim', argCount: 0 }, // Reward claiming
      '4e71d92': { function: 'claimRewards', argCount: 0 },
      'c9567bf': { function: 'permit2', argCount: 4 }, // Permit2 operations
      '2f80bb': { function: 'batchTransfer', argCount: 2 }, // Batch operations
      '362a0ce': { function: 'multicall', argCount: 1 }
    };

    const pattern = patterns[selector];
    if (pattern) {
      const args = [];
      for (let i = 0; i < pattern.argCount; i++) {
        const start = 8 + i * 64;
        const end = start + 64;
        if (end <= data.length) {
          const argValue = `0x${data.slice(start, end)}`;
          args.push({
            name: `arg${i}`,
            type: i === 0 ? 'address' : 'uint256',
            value: argValue
          });
        }
      }

      return {
        function: pattern.function,
        args,
        confidence: 0.7,
        decoded: true
      };
    }

    return null;
  }

  // Function type identification
  private decodeByFunctionType(input: string, contractAddress: string): DecodedCall | null {
    if (input.length < 10) return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;

    // Analyze parameter structure to identify function type
    if (data.length >= 8 + 64) { // At least selector + 1 parameter
      const param1 = data.slice(8, 8 + 64);

      // Check if first parameter looks like an address (starts with many zeros then non-zero)
      const isAddressParam = param1.match(/^0{24}[1-9a-f][0-9a-f]{39}$/);

      // Check if first parameter looks like a large number (amount)
      const isAmountParam = param1.match(/^[1-9a-f][0-9a-f]{63}$/);

      if (isAddressParam && data.length >= 8 + 128) { // address + something
        const param2 = data.slice(8 + 64, 8 + 128);
        const isSecondAddress = param2.match(/^0{24}[1-9a-f][0-9a-f]{39}$/);
        const isSecondAmount = param2.match(/^[1-9a-f][0-9a-f]{63}$/);

        if (isSecondAddress) {
          return {
            function: 'transfer_from_to',
            args: [
              { name: 'from', type: 'address', value: `0x${param1.slice(24)}` },
              { name: 'to', type: 'address', value: `0x${param2.slice(24)}` }
            ],
            confidence: 0.4,
            decoded: true
          };
        } else if (isSecondAmount) {
          return {
            function: 'transfer_to_amount',
            args: [
              { name: 'to', type: 'address', value: `0x${param1.slice(24)}` },
              { name: 'amount', type: 'uint256', value: param2 }
            ],
            confidence: 0.5,
            decoded: true
          };
        }
      } else if (isAmountParam) {
        return {
          function: 'amount_operation',
          args: [
            { name: 'amount', type: 'uint256', value: param1 }
          ],
          confidence: 0.3,
          decoded: true
        };
      }
    }

    // Default: unknown function with raw data
    return {
      function: 'contract_interaction',
      args: [
        { name: 'data', type: 'bytes', value: input }
      ],
      confidence: 0.1,
      decoded: false
    };
  }

  // Specific protocol decoders
  private async decodeUniswapV2(tx: Transaction): Promise<DecodedCall | null> {
    const input = tx.input;
    if (!input || input === '0x') return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;
    const selector = data.slice(0, 8);

    // Uniswap V2 specific function signatures
    const uniswapFunctions: Record<string, { name: string, params: string[] }> = {
      '7ff36ab5': { name: 'swapExactETHForTokens', params: ['uint256', 'address[]', 'address', 'uint256'] },
      '18cbafe5': { name: 'swapExactTokensForETH', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      '38ed1739': { name: 'swapExactTokensForTokens', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      '4a25d94a': { name: 'swapTokensForExactTokens', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      '8803dbee': { name: 'swapTokensForExactETH', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      '791ac947': { name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      '5c11d795': { name: 'swapExactTokensForETHSupportingFeeOnTransferTokens', params: ['uint256', 'uint256', 'address[]', 'address', 'uint256'] },
      'fb3bdb41': { name: 'swapETHForExactTokens', params: ['uint256', 'address[]', 'address', 'uint256'] },
      'e8e33700': { name: 'addLiquidityETH', params: ['address', 'uint256', 'uint256', 'uint256', 'address', 'uint256'] },
      'f305d719': { name: 'addLiquidity', params: ['address', 'address', 'uint256', 'uint256', 'uint256', 'uint256', 'address', 'uint256'] },
      'baa2abde': { name: 'removeLiquidity', params: ['address', 'address', 'uint256', 'uint256', 'uint256', 'address', 'uint256'] },
      '02751cec': { name: 'removeLiquidityETHWithPermit', params: ['address', 'uint256', 'uint256', 'uint256', 'address', 'uint256', 'bool', 'uint8', 'bytes32', 'bytes32'] },
      'c9567bf9': { name: 'permit', params: ['address', 'address', 'uint256', 'uint256', 'uint8', 'bytes32', 'bytes32'] }
    };

    const func = uniswapFunctions[selector];
    if (func) {
      const args = [];
      for (let i = 0; i < func.params.length; i++) {
        const start = 8 + i * 64;
        const end = start + 64;
        if (end <= data.length) {
          const value = `0x${data.slice(start, end)}`;
          args.push({
            name: func.params[i].split(' ')[1] || `arg${i}`,
            type: func.params[i],
            value
          });
        }
      }

      return {
        function: `UniswapV2.${func.name}`,
        args,
        confidence: 0.95,
        decoded: true
      };
    }

    return null;
  }

  private async decodeUniswapV3(tx: Transaction): Promise<DecodedCall | null> {
    const input = tx.input;
    if (!input || input === '0x') return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;
    const selector = data.slice(0, 8);

    // Uniswap V3 specific function signatures
    const uniswapV3Functions: Record<string, { name: string, params: string[] }> = {
      '414bf389': { name: 'exactInputSingle', params: ['tuple'] },
      '04e45aaf': { name: 'multicall', params: ['uint256', 'bytes[]'] },
      '12210e8a': { name: 'increaseLiquidity', params: ['tuple'] },
      'c45a0155': { name: 'createAndInitializePoolIfNecessary', params: ['address', 'address', 'uint24', 'uint160'] },
      '13ead562': { name: 'mint', params: ['tuple'] },
      '219f5d17': { name: 'positions', params: ['uint256'] },
      'd9627aa4': { name: 'decreaseLiquidity', params: ['tuple'] },
      '0c49ccbe': { name: 'collect', params: ['tuple'] },
      'fc6f7865': { name: 'mint', params: ['tuple'] },
      'c2e3140f': { name: 'burn', params: ['uint256', 'uint128', 'uint256', 'uint256'] }
    };

    const func = uniswapV3Functions[selector];
    if (func) {
      const args = [];
      for (let i = 0; i < func.params.length; i++) {
        const start = 8 + i * 64;
        const end = start + 64;
        if (end <= data.length) {
          const value = `0x${data.slice(start, end)}`;
          args.push({
            name: func.params[i].split(' ')[1] || `arg${i}`,
            type: func.params[i],
            value
          });
        }
      }

      return {
        function: `UniswapV3.${func.name}`,
        args,
        confidence: 0.95,
        decoded: true
      };
    }

    return null;
  }

  private async decodeOneInch(tx: Transaction): Promise<DecodedCall | null> {
    const input = tx.input;
    if (!input || input === '0x') return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;
    const selector = data.slice(0, 8);

    // 1inch specific function signatures
    const oneInchFunctions: Record<string, { name: string, params: string[] }> = {
      'e2a7515e': { name: 'clipperSwap', params: ['address', 'address', 'uint256', 'uint256', 'bytes'] },
      '12aa3caf': { name: 'unoswap', params: ['address', 'uint256', 'uint256', 'bytes32[]'] },
      '0502b1c5': { name: 'uniswapV3Swap', params: ['uint256', 'uint256', 'uint256[]', 'bytes'] },
      'f78dc253': { name: 'fillOrderRFQ', params: ['tuple', 'bytes', 'uint256', 'uint256'] },
      'c2e0c8d7': { name: 'settleOrders', params: ['tuple', 'bytes'] }
    };

    const func = oneInchFunctions[selector];
    if (func) {
      const args = [];
      for (let i = 0; i < func.params.length; i++) {
        const start = 8 + i * 64;
        const end = start + 64;
        if (end <= data.length) {
          const value = `0x${data.slice(start, end)}`;
          args.push({
            name: func.params[i].split(' ')[1] || `arg${i}`,
            type: func.params[i],
            value
          });
        }
      }

      return {
        function: `1inch.${func.name}`,
        args,
        confidence: 0.95,
        decoded: true
      };
    }

    return null;
  }

  private async decodeGMX(tx: Transaction): Promise<DecodedCall | null> {
    const input = tx.input;
    if (!input || input === '0x') return null;

    const data = input.startsWith('0x') ? input.slice(2) : input;
    const selector = data.slice(0, 8);

    // GMX specific function signatures
    const gmxFunctions: Record<string, { name: string, params: string[] }> = {
      '540798df': { name: 'increasePosition', params: ['address[]', 'address', 'address', 'bool', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256'] },
      'de5c28b8': { name: 'decreasePosition', params: ['address', 'address', 'address', 'bool', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256', 'bool'] },
      'd4a86f51': { name: 'liquidatePosition', params: ['address', 'address', 'address', 'bool', 'address'] },
      '5dc0c4b2': { name: 'createIncreaseOrder', params: ['address', 'uint256', 'address', 'uint256', 'bool', 'uint256', 'bool'] },
      '3f885dcf': { name: 'createDecreaseOrder', params: ['address', 'uint256', 'address', 'uint256', 'bool', 'uint256', 'bool'] },
      '6528b3f1': { name: 'cancelIncreaseOrder', params: ['bytes32'] },
      '3b6c6e6f': { name: 'cancelDecreaseOrder', params: ['bytes32'] },
      '7b5a9b4a': { name: 'executeIncreaseOrder', params: ['address', 'uint256', 'address', 'uint256', 'bool', 'uint256', 'uint256'] },
      '8a7c7b8d': { name: 'executeDecreaseOrder', params: ['address', 'uint256', 'address', 'uint256', 'bool', 'uint256', 'uint256'] }
    };

    const func = gmxFunctions[selector];
    if (func) {
      const args = [];
      for (let i = 0; i < func.params.length; i++) {
        const start = 8 + i * 64;
        const end = start + 64;
        if (end <= data.length) {
          const value = `0x${data.slice(start, end)}`;
          args.push({
            name: func.params[i].split(' ')[1] || `arg${i}`,
            type: func.params[i],
            value
          });
        }
      }

      return {
        function: `GMX.${func.name}`,
        args,
        confidence: 0.95,
        decoded: true
      };
    }

    return null;
  }

  // Offline ABI decoding using pre-built contract ABIs
  private async decodeWithSpecificAbi(tx: Transaction, abi: any[]): Promise<DecodedCall | null> {
    try {
      const to = tx.to?.toLowerCase();
      const input = tx.input;
      if (!to || !input || input === '0x') return null;

      const iface = new Interface(abi);
      const parsed = iface.parseTransaction({ data: input });

      if (!parsed) return null;

      const args = parsed.fragment.inputs.map((input, idx) => ({
        name: input.name || `arg${idx}`,
        type: input.format(),
        value: parsed.args?.[idx]
      }));

      return {
        function: parsed.name,
        args,
        confidence: 0.98,
        decoded: true
      };
    } catch {
      return null;
    }
  }

  // Decode multicall(bytes[]) or multicall(uint256,bytes[]) and enrich with subcalls
  private async decodeMulticallSubcalls(tx: Transaction, decodedCall: DecodedCall): Promise<DecodedCall | null> {
    try {
      // Find the bytes[] argument in the decoded call
      const multicallArg = decodedCall.args.find(arg => arg.type === 'bytes[]');
      if (!multicallArg || !Array.isArray(multicallArg.value)) return null;

      const calls: string[] = multicallArg.value as string[];

      if (!calls.length) return null;

      const subcalls: any[] = [];
      for (let i = 0; i < calls.length; i++) {
        const callData = calls[i];
        try {
          // Try enhanced signatures first
          const decoded = await this.decodeWithEnhancedSignatures(callData, tx.to || '');
          if (decoded) {
            subcalls.push({ index: i, function: decoded.function, args: decoded.args, confidence: decoded.confidence || 0.8 });
            continue;
          }

          // Try advanced patterns
          const patternDecoded = await this.decodeWithAdvancedPatterns({ ...tx, input: callData } as Transaction);
          if (patternDecoded) {
            subcalls.push({ index: i, function: patternDecoded.function, args: patternDecoded.args, confidence: patternDecoded.confidence || 0.7 });
            continue;
          }

          // Unknown subcall
          subcalls.push({ index: i, function: 'unknown_subcall', args: [{ name: 'data', type: 'bytes', value: callData }], confidence: 0.0 });
        } catch (e) {
          subcalls.push({ index: i, function: 'subcall_decode_error', args: [{ name: 'data', type: 'bytes', value: callData }], confidence: 0.0 });
        }
      }

      // Build enriched decoded function
      return {
        function: `multicall (${calls.length} subcalls)`,
        args: [
          ...decodedCall.args, // Keep original args
          { name: 'subcalls', type: 'DecodedCall[]', value: subcalls }
        ],
        confidence: (decodedCall.confidence || 0) + 0.1, // Slightly higher confidence
        decoded: true
      };
    } catch {
      return null;
    }
  }

  // Decode transaction data using a specific function signature
  private decodeWithSignature(input: string, signature: string): DecodedCall | null {
    try {
      // Create an Interface with the single function signature
      const iface = new Interface([`function ${signature}`]);

      // Parse the transaction data
      const parsed = iface.parseTransaction({ data: input });

      if (!parsed) return null;

      // Convert arguments to our format
      const args = parsed.args.map((arg: any, index: number) => {
        const fragment = parsed.fragment.inputs[index];
        return {
          name: fragment.name || `arg${index}`,
          type: fragment.type,
          value: arg
        };
      });

      return {
        function: parsed.name,
        args: args,
        confidence: 0.9,
        decoded: true
      };
    } catch (error) {
      // Signature might not match or parsing failed
      return null;
    }
  }

  // Stage 1: Enhanced signature database lookup with more comprehensive matching
  private async decodeWithEnhancedSignatures(input: string, to: string): Promise<DecodedCall | null> {
    try {
      const selectorHex = selector(input);
      if (!selectorHex) return null;

      // Try exact signature match first (local)
      const exactMatch = this.registry.resolveSignature(selectorHex);
      if (exactMatch) {
        const decoded = this.decodeWithSignature(input, exactMatch);
        if (decoded) {
          return {
            function: decoded.function,
            args: decoded.args,
            confidence: 0.95,
            decoded: true
          };
        }
      }

      // If allowed, try remote 4byte lookup for a missing exact match
      const remoteSig = await this.registry.resolveSignatureRemote(selectorHex);
      if (remoteSig) {
        const decoded = this.decodeWithSignature(input, remoteSig);
        if (decoded) {
          return {
            function: decoded.function,
            args: decoded.args,
            confidence: 0.9,
            decoded: true
          };
        }
      }

      // Try partial signature matching for common patterns
      const partialMatches = await this.findPartialSignatureMatches(selectorHex, input);
      if (partialMatches.length > 0) {
        const bestMatch = partialMatches[0]; // Take the first/best match
        const decoded = this.decodeWithSignature(input, bestMatch.signature);
        if (decoded) {
          return {
            function: `${decoded.function}(estimated)`,
            args: decoded.args,
            confidence: 0.8,
            decoded: true
          };
        }
      }

      return null;
    } catch (error) {
      logErrorWithConsole(error, 'Enhanced signature decoding failed');
      return null;
    }
  }

  // Find partial signature matches for more comprehensive decoding
  private async findPartialSignatureMatches(selector: string, input: string): Promise<any[]> {
    try {
      // Common DeFi function selector patterns
      const commonPatterns: Record<string, { prefix: string, functions: string[] }> = {
        'a9059c': { prefix: 'transfer', functions: ['transfer(address,uint256)', 'transferFrom(address,address,uint256)'] },
        '095ea7': { prefix: 'approve', functions: ['approve(address,uint256)', 'permit(address,address,uint256,uint256,uint8,bytes32,bytes32)'] },
        '23b872': { prefix: 'transferFrom', functions: ['transferFrom(address,address,uint256)'] },
        '7ff36a': { prefix: 'swap', functions: ['swapExactETHForTokens(uint256,address[],address,uint256)', 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)'] },
        '38ed17': { prefix: 'swapTokens', functions: ['swapExactTokensForTokens(uint256,uint256,address[],address,uint256)'] },
        'd0e30d': { prefix: 'deposit', functions: ['deposit()', 'deposit(uint256)'] },
        '2e1a7d': { prefix: 'withdraw', functions: ['withdraw(uint256)', 'withdraw()'] },
        'a694fc': { prefix: 'stake', functions: ['stake(uint256)', 'stake(uint256,address)'] },
        'be2918': { prefix: 'claim', functions: ['claim()', 'claimRewards()'] },
        'f305d7': { prefix: 'addLiquidity', functions: ['addLiquidity(address,address,uint256,uint256,uint256,uint256,address,uint256)'] },
        'baa2ab': { prefix: 'removeLiquidity', functions: ['removeLiquidity(address,address,uint256,uint256,uint256,address,uint256)'] }
      };

      const matches = [];
      for (const [pattern, data] of Object.entries(commonPatterns)) {
        if (selector.startsWith(pattern)) {
          for (const func of data.functions) {
            matches.push({ signature: func, confidence: 0.7 });
          }
        }
      }

      return matches;
    } catch {
      return [];
    }
  }

  // Stage 3: Aggressive pattern matching for common DeFi functions
  private async decodeWithAdvancedPatterns(tx: Transaction): Promise<DecodedCall | null> {
    // Disabled to honor "no fallback" requirement
    return null;
  }

  // Stage 4: Function type identification by parameter analysis
  private decodeByFunctionTypeAnalysis(input: string, to: string): DecodedCall | null {
    // Disabled to honor "no fallback" requirement
    return null;
  }

  // Stage 5: Contract type inference from transaction context
  private decodeByTransactionContext(tx: Transaction): DecodedCall | null {
    // Disabled to honor "no fallback" requirement
    return null;
  }

  // helper removed (no heuristic classification)

  // Generic contract call fallback
  private decodeGeneric(input: string): DecodedCall {
    const sel = selector(input);
    const dataHex = input.startsWith('0x') ? input.slice(2) : input;
    const dataLen = dataHex.length;

    // Create a generic signature for caching
    const genericSig = 'contract_call(bytes)';

    // Cache this pattern
    if (sel) {
      this.registry.cacheDiscoveredSignature(sel, genericSig).catch((err) => {
        logWarningWithConsole(err, 'Signature cache');
      });
    }

    return {
      function: 'contract_call',
      args: [
        { name: 'selector', type: 'bytes4', value: sel ? `0x${sel}` : '0x00000000' },
        { name: 'data', type: 'bytes', value: dataLen > 136 ? `0x${dataHex.slice(8, 136)}...` : `0x${dataHex.slice(8)}` }
      ],
      confidence: 0.3
    };
  }

  // Decode swap details for DEX transactions
  decodeSwapDetails(tx: Transaction): SwapDetails {
    const base: SwapDetails = {
      is_swap: false,
      dex_version: '-',
      swap_type: '-',
      amount_in: null,
      amount_out: null,
      token_in: null,
      token_out: null,
      path: []
    };

    if (!tx.input || tx.input === '0x') {
      return base;
    }

    try {
      const parsed = SWAP_INTERFACE.parseTransaction({ data: tx.input });
      if (!parsed) {
        return base;
      }
      
      const path: string[] = [];
      let amountIn: bigint | null = null;
      let amountOut: bigint | null = null;
      let tokenIn: string | null = null;
      let tokenOut: string | null = null;
      const txValue = toBigIntOrNull(tx.value);

      switch (parsed.name) {
        case 'swapExactTokensForTokens':
        case 'swapExactTokensForTokensSupportingFeeOnTransferTokens':
          amountIn = toBigIntOrNull(parsed.args.amountIn);
          amountOut = toBigIntOrNull(parsed.args.amountOutMin);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'swapTokensForExactTokens':
          amountIn = toBigIntOrNull(parsed.args.amountInMax);
          amountOut = toBigIntOrNull(parsed.args.amountOut);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'swapExactETHForTokens':
        case 'swapExactETHForTokensSupportingFeeOnTransferTokens':
          amountIn = txValue;
          amountOut = toBigIntOrNull(parsed.args.amountOutMin);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'swapETHForExactTokens':
          amountIn = txValue;
          amountOut = toBigIntOrNull(parsed.args.amountOut);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'swapExactTokensForETH':
        case 'swapExactTokensForETHSupportingFeeOnTransferTokens':
          amountIn = toBigIntOrNull(parsed.args.amountIn);
          amountOut = toBigIntOrNull(parsed.args.amountOutMin);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'swapTokensForExactETH':
          amountIn = toBigIntOrNull(parsed.args.amountInMax);
          amountOut = toBigIntOrNull(parsed.args.amountOut);
          path.push(...normalizeAddressArray(parsed.args.path));
          break;
        case 'exactInputSingle': {
          const params = parsed.args[0];
          amountIn = toBigIntOrNull(params.amountIn);
          amountOut = toBigIntOrNull(params.amountOutMinimum);
          tokenIn = normalizeAddressLower(params.tokenIn);
          tokenOut = normalizeAddressLower(params.tokenOut);
          if (tokenIn) path.push(tokenIn);
          if (tokenOut) path.push(tokenOut);
          break;
        }
        case 'exactOutputSingle': {
          const params = parsed.args[0];
          amountIn = toBigIntOrNull(params.amountInMaximum);
          amountOut = toBigIntOrNull(params.amountOut);
          tokenIn = normalizeAddressLower(params.tokenIn);
          tokenOut = normalizeAddressLower(params.tokenOut);
          if (tokenIn) path.push(tokenIn);
          if (tokenOut) path.push(tokenOut);
          break;
        }
        case 'exactInput': {
          const params = parsed.args[0];
          amountIn = toBigIntOrNull(params.amountIn);
          amountOut = toBigIntOrNull(params.amountOutMinimum);
          const v3Path = decodeUniswapV3Path(params.path);
          if (v3Path.length) path.push(...v3Path);
          break;
        }
        case 'exactOutput': {
          const params = parsed.args[0];
          amountIn = toBigIntOrNull(params.amountInMaximum);
          amountOut = toBigIntOrNull(params.amountOut);
          const v3Path = decodeUniswapV3Path(params.path);
          if (v3Path.length) path.push(...v3Path);
          break;
        }
      }

      if (!tokenIn && path.length >= 1) tokenIn = path[0];
      if (!tokenOut && path.length >= 2) tokenOut = path[path.length - 1];

      return {
        is_swap: true,
        dex_version: V3_FUNCTION_NAMES.has(parsed.name) ? 'V3' : (V2_FUNCTION_NAMES.has(parsed.name) ? 'V2' : 'agg'),
        swap_type: parsed.name,
        amount_in: amountIn ? amountIn.toString() : null,
        amount_out: amountOut ? amountOut.toString() : null,
        token_in: tokenIn,
        token_out: tokenOut,
        path: path.length ? path : base.path,
      };
    } catch (error) {
      // Fall back to legacy heuristic decoding for unknown selectors
    }

    const sel = selector(tx.input);
    if (!sel) {
      return base;
    }

    const fallback = { ...base };
    const input = tx.input.startsWith('0x') ? tx.input.slice(2) : tx.input;

    try {
      switch (sel) {
        case '38ed1739': {
          const amountIn = hexToBigInt(wordAt(tx.input, 1));
          const amountOut = hexToBigInt(wordAt(tx.input, 2));
          const path = decodeAddressArray(input, 3);
          fallback.is_swap = true;
          fallback.dex_version = 'V2';
          fallback.swap_type = 'swapExactTokensForTokens';
          fallback.amount_in = amountIn ? amountIn.toString() : null;
          fallback.amount_out = amountOut ? amountOut.toString() : null;
          fallback.path = path;
          if (path.length >= 2) {
            fallback.token_in = path[0];
            fallback.token_out = path[path.length - 1];
          }
          break;
        }
        case '414bf389': {
          const amountIn = hexToBigInt(wordAt(tx.input, 4));
          const amountOut = hexToBigInt(wordAt(tx.input, 5));
          const tokenInWord = wordAt(tx.input, 2);
          const tokenOutWord = wordAt(tx.input, 3);
          fallback.is_swap = true;
          fallback.dex_version = 'V3';
          fallback.swap_type = 'exactInputSingle';
          fallback.amount_in = amountIn ? amountIn.toString() : null;
          fallback.amount_out = amountOut ? amountOut.toString() : null;
          if (tokenInWord.length >= 40) {
            fallback.token_in = normalizeAddressLower(`0x${tokenInWord.slice(-40)}`);
            if (fallback.token_in) fallback.path.push(fallback.token_in);
          }
          if (tokenOutWord.length >= 40) {
            fallback.token_out = normalizeAddressLower(`0x${tokenOutWord.slice(-40)}`);
            if (fallback.token_out) fallback.path.push(fallback.token_out);
          }
          break;
        }
      }
    } catch (err) {
      logErrorWithConsole(err, 'Swap decode fallback error');
    }

    return fallback;
  }
}

// Global decoder instance
let decoder: CoreDecoder | null = null;

export function getCoreDecoder(): CoreDecoder {
  if (!decoder) {
    decoder = new CoreDecoder();
  }
  return decoder;
}
