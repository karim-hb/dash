import { Transaction, DecodedCall, SwapDetails } from '@/lib/types';
import { selector, wordAt, hexToNumber, decodeAddressArray } from '@/lib/util/hex';
import { getAbiRegistry } from './abiRegistry';
import { Interface, FunctionFragment, Result } from 'ethers';
import { getDexDecoderRegistry } from './dexDecoders';
import { getNftDecoderRegistry } from './nftDecoders';
import { getDefiDecoderRegistry } from './defiDecoders';
import { getBridgeDecoderRegistry } from './bridgeDecoders';
import { getAbiCache } from './abiCache';

// Decoded call result
export interface DecodeResult {
  decoded: boolean;
  function?: DecodedCall;
  error?: string;
}

// Core decoder with heuristics and ABI support
export class CoreDecoder {
  private registry = getAbiRegistry();
  private dexDecoders = getDexDecoderRegistry();
  private nftDecoders = getNftDecoderRegistry();
  private defiDecoders = getDefiDecoderRegistry();
  private bridgeDecoders = getBridgeDecoderRegistry();
  private abiCache = getAbiCache();

  // Main decode function
  async decodeTransaction(tx: Transaction): Promise<DecodeResult> {
    try {
      const input = tx.input;
      if (!input || input === '0x') {
        return { decoded: false };
      }

      // Try protocol-specific decoders first (highest accuracy)
      const protocolResult = await this.decodeWithProtocolDecoders(input, tx.to || undefined);
      if (protocolResult) {
        return { decoded: true, function: protocolResult };
      }

      // Try Etherscan ABI cache
      if (tx.to) {
        const etherscanResult = await this.decodeWithEtherscanAbi(input, tx.to);
        if (etherscanResult) {
          return { decoded: true, function: etherscanResult };
        }
      }

      // Try ABI-based decoding from registry
      const abiResult = await this.decodeWithAbi(input, tx.to || undefined);
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

  // Decode using protocol-specific decoders
  private async decodeWithProtocolDecoders(input: string, toAddress?: string): Promise<DecodedCall | null> {
    // Try DEX decoders
    const dexResult = this.dexDecoders.decode(input, toAddress);
    if (dexResult) return dexResult;

    // Try NFT marketplace decoders
    const nftResult = this.nftDecoders.decode(input, toAddress);
    if (nftResult) return nftResult;

    // Try DeFi protocol decoders
    const defiResult = this.defiDecoders.decode(input, toAddress);
    if (defiResult) return defiResult;

    // Try bridge decoders
    const bridgeResult = this.bridgeDecoders.decode(input, toAddress);
    if (bridgeResult) return bridgeResult;

    return null;
  }

  // Decode using Etherscan ABI cache
  private async decodeWithEtherscanAbi(input: string, toAddress: string): Promise<DecodedCall | null> {
    try {
      const result = await this.abiCache.decodeFunctionCall(toAddress, input);
      if (!result) return null;

      // Convert to our DecodedCall format
      const args = result.args.map((value, index) => {
        let convertedValue = value;
        
        if (typeof value === 'bigint') {
          convertedValue = value.toString();
        } else if (Array.isArray(value)) {
          convertedValue = value.map(v => typeof v === 'bigint' ? v.toString() : v);
        } else if (value && typeof value === 'object') {
          convertedValue = JSON.stringify(value, (key, val) => 
            typeof val === 'bigint' ? val.toString() : val
          );
        }

        return {
          name: `arg${index}`,
          type: 'unknown',
          value: convertedValue
        };
      });

      return {
        function: result.name,
        args,
        confidence: 0.92,
        decoded: true
      };
    } catch (error) {
      return null;
    }
  }

  // Decode using ABI registry with ethers.Interface
  private async decodeWithAbi(input: string, toAddress?: string): Promise<DecodedCall | null> {
    const sel = selector(input);
    if (!sel) return null;

    const signature = this.registry.resolveSignature(sel);
    if (!signature) return null;

    try {
      // Create a minimal ABI fragment for this function
      const abiFragment = `function ${signature}`;
      const iface = new Interface([abiFragment]);
      
      // Parse the transaction data
      const fragment = iface.getFunction(signature);
      if (!fragment) return null;

      // Decode the function data
      const decoded = iface.decodeFunctionData(fragment, input);
      
      // Convert Result to our DecodedCall format
      const args = this.convertDecodedArgs(decoded, fragment);

      return {
        function: fragment.name,
        args,
        confidence: 0.9,
        decoded: true
      };

    } catch (error) {
      // If ethers fails, signature might be wrong or complex types not supported
      // Fall back to heuristics
      return null;
    }
  }

  // Convert ethers decoded result to our format
  private convertDecodedArgs(result: Result, fragment: FunctionFragment): Array<{name: string, type: string, value: any}> {
    const args: Array<{name: string, type: string, value: any}> = [];

    for (let i = 0; i < fragment.inputs.length; i++) {
      const input = fragment.inputs[i];
      const value = result[i];
      
      // Convert BigInt to string for JSON serialization
      let convertedValue = value;
      if (typeof value === 'bigint') {
        convertedValue = value.toString();
      } else if (Array.isArray(value)) {
        // Handle arrays recursively
        convertedValue = value.map(v => typeof v === 'bigint' ? v.toString() : v);
      } else if (value && typeof value === 'object' && value._isBigNumber) {
        // Handle ethers BigNumber
        convertedValue = value.toString();
      }

      args.push({
        name: input.name || `arg${i}`,
        type: input.type,
        value: convertedValue
      });
    }

    return args;
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
