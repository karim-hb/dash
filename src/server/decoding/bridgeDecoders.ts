import { DecodedCall } from '@/lib/types';
import { Interface } from 'ethers';

// Bridge protocol decoders for Stargate, Across, Hop

// Stargate decoder
export class StargateDecoder {
  private iface: Interface;

  constructor() {
    // Stargate Router functions
    const stargateAbi = [
      'function swap(uint16 _dstChainId, uint256 _srcPoolId, uint256 _dstPoolId, address payable _refundAddress, uint256 _amountLD, uint256 _minAmountLD, (uint256 dstGasForCall, uint256 dstNativeAmount, bytes dstNativeAddr) _lzTxParams, bytes _to, bytes _payload)',
      'function addLiquidity(uint256 _poolId, uint256 _amountLD, address _to)',
      'function instantRedeemLocal(uint16 _srcPoolId, uint256 _amountLP, address _to)',
      'function redeemLocal(uint16 _dstChainId, uint256 _srcPoolId, uint256 _dstPoolId, address payable _refundAddress, uint256 _amountLP, bytes _to, (uint256 dstGasForCall, uint256 dstNativeAmount, bytes dstNativeAddr) _lzTxParams)',
      'function redeemRemote(uint16 _dstChainId, uint256 _srcPoolId, uint256 _dstPoolId, address payable _refundAddress, uint256 _amountLP, uint256 _minAmountLD, bytes _to, (uint256 dstGasForCall, uint256 dstNativeAmount, bytes dstNativeAddr) _lzTxParams)',
      'function sendCredits(uint16 _dstChainId, uint256 _srcPoolId, uint256 _dstPoolId, address payable _refundAddress)',
    ];
    this.iface = new Interface(stargateAbi);
  }

  decode(input: string): DecodedCall | null {
    try {
      const tx = this.iface.parseTransaction({ data: input });
      if (!tx) return null;

      const args = tx.args.map((value, index) => {
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
          name: tx.fragment.inputs[index]?.name || `arg${index}`,
          type: tx.fragment.inputs[index]?.type || 'unknown',
          value: convertedValue
        };
      });

      return {
        function: tx.name,
        args,
        confidence: 0.95,
        decoded: true
      };
    } catch {
      return null;
    }
  }
}

// Across decoder
export class AcrossDecoder {
  private iface: Interface;

  constructor() {
    // Across SpokePool functions
    const acrossAbi = [
      'function deposit(address recipient, address originToken, uint256 amount, uint256 destinationChainId, int64 relayerFeePct, uint32 quoteTimestamp, bytes message, uint256 maxCount)',
      'function depositV3(address depositor, address recipient, address inputToken, address outputToken, uint256 inputAmount, uint256 outputAmount, uint256 destinationChainId, address exclusiveRelayer, uint32 quoteTimestamp, uint32 fillDeadline, uint32 exclusivityDeadline, bytes message)',
      'function speedUpDeposit(address depositor, int64 newRelayerFeePct, uint32 depositId, address updatedRecipient, bytes updatedMessage)',
      'function fillRelay(address depositor, address recipient, address destinationToken, uint256 amount, uint256 maxTokensToSend, uint256 repaymentChainId, uint256 originChainId, int64 realizedLpFeePct, int64 relayerFeePct, uint32 depositId)',
      'function fillRelayV3(bytes relayData, uint256 repaymentChainId)',
    ];
    this.iface = new Interface(acrossAbi);
  }

  decode(input: string): DecodedCall | null {
    try {
      const tx = this.iface.parseTransaction({ data: input });
      if (!tx) return null;

      const args = tx.args.map((value, index) => {
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
          name: tx.fragment.inputs[index]?.name || `arg${index}`,
          type: tx.fragment.inputs[index]?.type || 'unknown',
          value: convertedValue
        };
      });

      return {
        function: tx.name,
        args,
        confidence: 0.95,
        decoded: true
      };
    } catch {
      return null;
    }
  }
}

// Hop decoder
export class HopDecoder {
  private iface: Interface;

  constructor() {
    // Hop Bridge functions
    const hopAbi = [
      'function sendToL2(uint256 chainId, address recipient, uint256 amount, uint256 amountOutMin, uint256 deadline, address relayer, uint256 relayerFee)',
      'function swapAndSend(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee, uint256 amountOutMin, uint256 deadline, uint256 destinationAmountOutMin, uint256 destinationDeadline)',
      'function send(uint256 chainId, address recipient, uint256 amount, uint256 bonderFee, uint256 amountOutMin, uint256 deadline)',
      'function withdraw(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee, uint256 amountOutMin, uint256 deadline, bytes32 rootHash, uint256 transferRootTotalAmount, uint256 transferIdTreeIndex, bytes32[] siblings, uint256 totalLeaves)',
      'function bondWithdrawal(address recipient, uint256 amount, bytes32 transferNonce, uint256 bonderFee)',
      'function addLiquidity(uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline)',
      'function removeLiquidity(uint256 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline)',
    ];
    this.iface = new Interface(hopAbi);
  }

  decode(input: string): DecodedCall | null {
    try {
      const tx = this.iface.parseTransaction({ data: input });
      if (!tx) return null;

      const args = tx.args.map((value, index) => {
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
          name: tx.fragment.inputs[index]?.name || `arg${index}`,
          type: tx.fragment.inputs[index]?.type || 'unknown',
          value: convertedValue
        };
      });

      return {
        function: tx.name,
        args,
        confidence: 0.95,
        decoded: true
      };
    } catch {
      return null;
    }
  }
}

// Bridge decoder registry
export class BridgeDecoderRegistry {
  private stargateDecoder = new StargateDecoder();
  private acrossDecoder = new AcrossDecoder();
  private hopDecoder = new HopDecoder();

  // Protocol address mappings
  private protocolAddresses = {
    stargate: [
      '0x8731d54e9d02c286767d56ac03e8037c07e01e98', // Stargate Router (Ethereum)
      '0x45a01e4e04f14f7a4a6702c74187c5f6222033cd', // Stargate Router (Arbitrum)
      '0xb0d502e938ed5f4df2e681fe6e419ff29631d62b', // Stargate Router (Optimism)
    ],
    across: [
      '0x5c7bcd6e7de5423a257d81b442095a1a6ced35c5', // Across SpokePool (Ethereum)
      '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a', // Across SpokePool (Arbitrum)
      '0x6f26bf09b1c792e3228e5467807a900a503c0281', // Across SpokePool (Optimism)
    ],
    hop: [
      '0x3666f603cc164936c1b87e207f36beba4ac5f18a', // Hop Bridge USDC (Ethereum)
      '0x3e4a3a4796d16c0cd582c382691998f7c06420b6', // Hop Bridge ETH (Ethereum)
      '0x22d5f9b75c524fec1d6619787e582644cd4d7422', // Hop Bridge USDC (Arbitrum)
    ],
  };

  decode(input: string, toAddress?: string): DecodedCall | null {
    // Try to detect protocol from address
    const protocol = this.detectProtocol(toAddress);

    // Try protocol-specific decoder first
    if (protocol) {
      const result = this.decodeByProtocol(protocol, input);
      if (result) return result;
    }

    // Try all decoders
    return this.tryAllDecoders(input);
  }

  private detectProtocol(address?: string): string | null {
    if (!address) return null;
    
    const addr = address.toLowerCase();
    for (const [protocol, addresses] of Object.entries(this.protocolAddresses)) {
      if (addresses.includes(addr)) {
        return protocol;
      }
    }
    return null;
  }

  private decodeByProtocol(protocol: string, input: string): DecodedCall | null {
    switch (protocol) {
      case 'stargate':
        return this.stargateDecoder.decode(input);
      case 'across':
        return this.acrossDecoder.decode(input);
      case 'hop':
        return this.hopDecoder.decode(input);
      default:
        return null;
    }
  }

  private tryAllDecoders(input: string): DecodedCall | null {
    const decoders = [
      this.stargateDecoder,
      this.acrossDecoder,
      this.hopDecoder,
    ];

    for (const decoder of decoders) {
      const result = decoder.decode(input);
      if (result) return result;
    }

    return null;
  }
}

// Global bridge decoder instance
let bridgeDecoderRegistry: BridgeDecoderRegistry | null = null;

export function getBridgeDecoderRegistry(): BridgeDecoderRegistry {
  if (!bridgeDecoderRegistry) {
    bridgeDecoderRegistry = new BridgeDecoderRegistry();
  }
  return bridgeDecoderRegistry;
}
