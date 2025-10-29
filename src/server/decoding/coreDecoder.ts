import { Transaction, DecodedCall, SwapDetails } from '@/lib/types';
import { selector, wordAt, hexToNumber, decodeAddressArray } from '@/lib/util/hex';
import { getAbiRegistry } from './abiRegistry';
import { getAbiCache } from './abiCache';
import { Interface } from 'ethers';

// Decoded call result
export interface DecodeResult {
  decoded: boolean;
  function?: DecodedCall;
  error?: string;
}

// Core decoder with heuristics and ABI support
export class CoreDecoder {
  private registry = getAbiRegistry();

  // Main decode function
  async decodeTransaction(tx: Transaction): Promise<DecodeResult> {
    try {
      const input = tx.input;
      if (!input || input === '0x') {
        return { decoded: false };
      }

      // Try full contract ABI decoding via etherscan
      const contractAbiResult = await this.decodeWithContractAbi(tx);
      if (contractAbiResult) {
        return { decoded: true, function: contractAbiResult };
      }

      // Try ABI-based decoding first
      const abiResult = await this.decodeWithAbi(input);
      if (abiResult) {
        return { decoded: true, function: abiResult };
      }

      // Fall back to heuristics
      const heuristicResult = this.decodeWithHeuristics(input);
      if (heuristicResult) {
        return { decoded: true, function: heuristicResult };
      }

      // Generic contract call
      const genericResult = this.decodeGeneric(input);
      return { decoded: true, function: genericResult };

    } catch (error) {
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

    try {
      // Parse signature to extract function name and parameter types
      const sigMatch = signature.match(/^([^(]+)\(([^)]*)\)$/);
      if (!sigMatch) return null;

      const functionName = sigMatch[1];
      const paramTypes = sigMatch[2].split(',').filter(p => p.trim());

      // Decode parameters (simplified - would need full ABI decoder for complex types)
      const args: any[] = [];
      const data = input.startsWith('0x') ? input.slice(2) : input;

      for (let i = 0; i < paramTypes.length; i++) {
        const paramType = paramTypes[i].trim();

        if (paramType === 'address') {
          const word = wordAt(`0x${data}`, i + 1);
          if (word.length >= 40) {
            args.push(`0x${word.slice(-40).toLowerCase()}`);
          } else {
            args.push('0x0000000000000000000000000000000000000000');
          }
        } else if (paramType.startsWith('uint') || paramType.startsWith('int')) {
          const word = wordAt(`0x${data}`, i + 1);
          const num = hexToNumber(word);
          args.push(num);
        } else if (paramType === 'bool') {
          const word = wordAt(`0x${data}`, i + 1);
          const num = hexToNumber(word);
          args.push(num !== 0);
        } else {
          // Unknown type - include raw data
          const word = wordAt(`0x${data}`, i + 1);
          args.push(word || '0x0');
        }
      }

      return {
        function: functionName,
        args: args.map((value, index) => ({
          name: `arg${index}`,
          type: paramTypes[index] || 'unknown',
          value
        })),
        confidence: 0.9
      };

    } catch (error) {
      console.error('ABI decode error:', error);
      return null;
    }
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
      const args = parsed.functionFragment.inputs.map((inp, idx) => ({
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
        const amount = hexToNumber(`0x${data.slice(8 + 64, 8 + 128)}`);
        return {
          function: 'transfer',
          args: [
            { name: 'to', type: 'address', value: to.toLowerCase() },
            { name: 'amount', type: 'uint256', value: amount }
          ],
          confidence: 0.8
        };
      } catch {
        return null;
      }
    }

    // ERC-20 approve(address,uint256)
    if (sel === '095ea7b3' && dataLen >= 8 + 64 * 2) {
      try {
        const spender = `0x${data.slice(8 + 24, 8 + 64)}`;
        const amount = hexToNumber(`0x${data.slice(8 + 64, 8 + 128)}`);
        this.registry.cacheDiscoveredSignature(sel, 'approve(address,uint256)');
        return {
          function: 'approve',
          args: [
            { name: 'spender', type: 'address', value: spender.toLowerCase() },
            { name: 'amount', type: 'uint256', value: amount }
          ],
          confidence: 0.7
        };
      } catch {
        return null;
      }
    }

    // ERC-20 transferFrom(address,address,uint256)
    if (sel === '23b872dd' && dataLen >= 8 + 64 * 3) {
      try {
        const from = `0x${data.slice(8 + 24, 8 + 64)}`;
        const to = `0x${data.slice(8 + 64 + 24, 8 + 64 * 2)}`;
        const amount = hexToNumber(`0x${data.slice(8 + 64 * 2, 8 + 64 * 3)}`);
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
      } catch {
        return null;
      }
    }

    // Multicall detection (dynamic bytes array)
    if (dataLen >= 8 + 64 * 2) {
      try {
        const offsetWord = data.slice(8, 8 + 64);
        if (offsetWord === '0000000000000000000000000000000000000000000000000000000000000020') {
          const lengthWord = data.slice(8 + 64, 8 + 128);
          const arrayLen = hexToNumber(`0x${lengthWord}`);
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
      } catch {
        // Ignore multicall detection errors
      }
    }

    // ERC-721/1155 transfer patterns
    if (dataLen >= 8 + 64 * 4) {
      try {
        const addr1 = `0x${data.slice(8 + 24, 8 + 64)}`;
        const addr2 = `0x${data.slice(8 + 64 + 24, 8 + 128)}`;

        if (addr1.startsWith('0x') && addr1.length === 42 &&
            addr2.startsWith('0x') && addr2.length === 42) {

          if (dataLen >= 8 + 64 * 4) {
            const tokenId = hexToNumber(`0x${data.slice(8 + 192, 8 + 256)}`);
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

  // Generic contract call fallback
  private decodeGeneric(input: string): DecodedCall {
    const sel = selector(input);
    const dataHex = input.startsWith('0x') ? input.slice(2) : input;
    const dataLen = dataHex.length;

    // Create a generic signature for caching
    const genericSig = 'contract_call(bytes)';

    // Cache this pattern
    if (sel) {
      this.registry.cacheDiscoveredSignature(sel, genericSig).catch(() => {});
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
    const result: SwapDetails = {
      is_swap: false,
      dex_version: '-',
      swap_type: '-',
      amount_in: null,
      amount_out: null,
      token_in: null,
      token_out: null,
      path: []
    };

    const toAddr = tx.to?.toLowerCase();
    const sel = selector(tx.input);

    if (!sel || !toAddr) return result;

    // Check router registries (simplified)
    // In real implementation, load from router_registry.json

    // DEX selector detection
    const dexSelectors = [
      '38ed1739', '18cbafe5', '7ff36ab5', '5c11d795', '8803dbee', '4a25d94a', '791ac947', '022c0d9f',
      '414bf389', 'db3e2198', 'c04b8d59', '04e45aaf',
      'e449022e', '5ae401dc', '4bb278f3', '252dba42'
    ];

    if (dexSelectors.includes(sel)) {
      result.is_swap = true;

      // DEX version detection
      if (['38ed1739', '18cbafe5', '7ff36ab5', '5c11d795', '8803dbee', '4a25d94a', '791ac947'].includes(sel)) {
        result.dex_version = 'v2';
      } else if (['414bf389', 'db3e2198', 'c04b8d59', '04e45aaf'].includes(sel)) {
        result.dex_version = 'v3';
      } else {
        result.dex_version = 'agg';
      }

      // Decode amounts and tokens based on selector
      const input = tx.input.startsWith('0x') ? tx.input.slice(2) : tx.input;

      try {
        switch (sel) {
          case '38ed1739': // exactTokensForTokens
            result.swap_type = 'exactTokensForTokens';
            result.amount_in = hexToNumber(wordAt(tx.input, 1));
            result.amount_out = hexToNumber(wordAt(tx.input, 2));
            result.path = decodeAddressArray(input, 3);
            if (result.path.length >= 2) {
              result.token_in = result.path[0];
              result.token_out = result.path[result.path.length - 1];
            }
            break;

          case '414bf389': // exactInputSingle
            result.swap_type = 'exactInputSingle';
            result.amount_in = hexToNumber(wordAt(tx.input, 4));
            result.amount_out = hexToNumber(wordAt(tx.input, 5));
            // Token addresses from input data
            const tokenInWord = wordAt(tx.input, 2);
            const tokenOutWord = wordAt(tx.input, 3);
            if (tokenInWord.length >= 40) {
              result.token_in = `0x${tokenInWord.slice(-40)}`.toLowerCase();
            }
            if (tokenOutWord.length >= 40) {
              result.token_out = `0x${tokenOutWord.slice(-40)}`.toLowerCase();
            }
            break;

          // Add more cases as needed...
        }
      } catch (error) {
        console.error('Swap decode error:', error);
      }
    }

    return result;
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
