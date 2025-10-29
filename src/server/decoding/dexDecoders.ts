import { DecodedCall } from '@/lib/types';
import { Interface } from 'ethers';

// DEX protocol decoders for Curve, Balancer V2, 1inch, 0x, Paraswap, Cowswap

// Curve Finance decoder
export class CurveDecoder {
  private iface: Interface;

  constructor() {
    // Common Curve pool functions
    const curveAbi = [
      'function exchange(int128 i, int128 j, uint256 dx, uint256 min_dy)',
      'function exchange_underlying(int128 i, int128 j, uint256 dx, uint256 min_dy)',
      'function add_liquidity(uint256[2] amounts, uint256 min_mint_amount)',
      'function add_liquidity(uint256[3] amounts, uint256 min_mint_amount)',
      'function add_liquidity(uint256[4] amounts, uint256 min_mint_amount)',
      'function remove_liquidity(uint256 _amount, uint256[2] min_amounts)',
      'function remove_liquidity(uint256 _amount, uint256[3] min_amounts)',
      'function remove_liquidity_one_coin(uint256 _token_amount, int128 i, uint256 min_amount)',
      'function remove_liquidity_imbalance(uint256[2] amounts, uint256 max_burn_amount)',
      'function remove_liquidity_imbalance(uint256[3] amounts, uint256 max_burn_amount)',
      'function get_dy(int128 i, int128 j, uint256 dx) view returns (uint256)',
      'function get_dy_underlying(int128 i, int128 j, uint256 dx) view returns (uint256)',
    ];
    this.iface = new Interface(curveAbi);
  }

  decode(input: string): DecodedCall | null {
    try {
      const tx = this.iface.parseTransaction({ data: input });
      if (!tx) return null;

      const args = tx.args.map((value, index) => ({
        name: tx.fragment.inputs[index]?.name || `arg${index}`,
        type: tx.fragment.inputs[index]?.type || 'unknown',
        value: typeof value === 'bigint' ? value.toString() : value
      }));

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

// Balancer V2 decoder
export class BalancerV2Decoder {
  private iface: Interface;

  constructor() {
    // Balancer V2 Vault functions
    const balancerAbi = [
      'function swap((bytes32 poolId, uint8 kind, address assetIn, address assetOut, uint256 amount, bytes userData), (address sender, bool fromInternalBalance, address recipient, bool toInternalBalance), uint256 limit, uint256 deadline)',
      'function batchSwap(uint8 kind, (bytes32 poolId, uint256 assetInIndex, uint256 assetOutIndex, uint256 amount, bytes userData)[] swaps, address[] assets, (address sender, bool fromInternalBalance, address recipient, bool toInternalBalance) funds, int256[] limits, uint256 deadline)',
      'function joinPool(bytes32 poolId, address sender, address recipient, (address[] assets, uint256[] maxAmountsIn, bytes userData, bool fromInternalBalance) request)',
      'function exitPool(bytes32 poolId, address sender, address recipient, (address[] assets, uint256[] minAmountsOut, bytes userData, bool toInternalBalance) request)',
      'function flashLoan(address recipient, address[] tokens, uint256[] amounts, bytes userData)',
      'function manageUserBalance((uint8 kind, address asset, uint256 amount, address sender, address recipient)[] ops)',
    ];
    this.iface = new Interface(balancerAbi);
  }

  decode(input: string): DecodedCall | null {
    try {
      const tx = this.iface.parseTransaction({ data: input });
      if (!tx) return null;

      const args = this.convertArgs(tx.args, tx.fragment.inputs);

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

  private convertArgs(values: any[], inputs: any[]): any[] {
    return values.map((value, index) => {
      let convertedValue = value;
      
      if (typeof value === 'bigint') {
        convertedValue = value.toString();
      } else if (Array.isArray(value)) {
        convertedValue = value.map(v => typeof v === 'bigint' ? v.toString() : v);
      } else if (value && typeof value === 'object') {
        // Handle structs
        convertedValue = JSON.stringify(value);
      }

      return {
        name: inputs[index]?.name || `arg${index}`,
        type: inputs[index]?.type || 'unknown',
        value: convertedValue
      };
    });
  }
}

// 1inch Aggregation Router V5 decoder
export class OneInchDecoder {
  private iface: Interface;

  constructor() {
    // 1inch V5 functions
    const oneInchAbi = [
      'function swap(address executor, (address srcToken, address dstToken, address srcReceiver, address dstReceiver, uint256 amount, uint256 minReturnAmount, uint256 flags) desc, bytes permit, bytes data)',
      'function unoswap(address srcToken, uint256 amount, uint256 minReturn, uint256[] pools)',
      'function unoswapTo(address recipient, address srcToken, uint256 amount, uint256 minReturn, uint256[] pools)',
      'function uniswapV3Swap(uint256 amount, uint256 minReturn, uint256[] pools)',
      'function clipperSwap(address clipperExchange, address srcToken, address dstToken, uint256 inputAmount, uint256 outputAmount, uint256 goodUntil, bytes32 r, bytes32 vs)',
      'function fillOrderRFQ((uint256 info, address makerAsset, address takerAsset, address maker, address allowedSender, uint256 makingAmount, uint256 takingAmount) order, bytes signature, uint256 flagsAndAmount)',
    ];
    this.iface = new Interface(oneInchAbi);
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
          convertedValue = JSON.stringify(value);
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

// 0x Protocol decoder
export class ZeroExDecoder {
  private iface: Interface;

  constructor() {
    // 0x Exchange Proxy functions
    const zeroExAbi = [
      'function transformERC20(address inputToken, address outputToken, uint256 inputTokenAmount, uint256 minOutputTokenAmount, (uint32 deploymentNonce, bytes data)[] transformations)',
      'function sellToUniswap(address[] tokens, uint256 sellAmount, uint256 minBuyAmount, bool isSushi)',
      'function sellToPancakeSwap(address[] tokens, uint256 sellAmount, uint256 minBuyAmount, uint8 fork)',
      'function sellToLiquidityProvider(address inputToken, address outputToken, address provider, address recipient, uint256 sellAmount, uint256 minBuyAmount, bytes auxiliaryData)',
      'function multiplexBatchSellTokenForToken(address inputToken, address outputToken, (uint8 selector, uint256 sellAmount, bytes data)[] calls, uint256 sellAmount, uint256 minBuyAmount)',
      'function multiplexMultiHopSellTokenForToken(address[] tokens, (uint8 selector, bytes data)[] calls, uint256 sellAmount, uint256 minBuyAmount)',
    ];
    this.iface = new Interface(zeroExAbi);
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
          convertedValue = JSON.stringify(value);
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

// Paraswap Augustus decoder
export class ParaswapDecoder {
  private iface: Interface;

  constructor() {
    // Paraswap Augustus V5 functions
    const paraswapAbi = [
      'function multiSwap((address fromToken, uint256 fromAmount, uint256 toAmount, uint256 expectedAmount, address payable beneficiary, string referrer, bool useReduxToken, (address payable to, uint256 totalNetworkFee, (address adapter, uint256 percent, uint256 networkFee, (uint256 index, address targetExchange, uint256 percent, bytes payload, uint256 networkFee)[] route)[] routes)[] path) data)',
      'function megaSwap((address fromToken, uint256 fromAmount, uint256 toAmount, uint256 expectedAmount, address payable beneficiary, string referrer, bool useReduxToken, (address payable to, uint256 totalNetworkFee, (address adapter, uint256 percent, uint256 networkFee, (uint256 index, address targetExchange, uint256 percent, bytes payload, uint256 networkFee)[] route)[] routes)[] path) data)',
      'function simpleSwap((address fromToken, address toToken, uint256 fromAmount, uint256 toAmount, uint256 expectedAmount, address[] callees, bytes exchangeData, uint256[] startIndexes, uint256[] values, address payable beneficiary, string referrer, bool useReduxToken) data)',
      'function swapOnUniswap(uint256 amountIn, uint256 amountOutMin, address[] path)',
      'function swapOnUniswapFork(address factory, bytes32 initCode, uint256 amountIn, uint256 amountOutMin, address[] path)',
      'function buyOnUniswap(uint256 amountInMax, uint256 amountOut, address[] path)',
    ];
    this.iface = new Interface(paraswapAbi);
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
          convertedValue = JSON.stringify(value);
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

// Cowswap Settlement decoder
export class CowswapDecoder {
  private iface: Interface;

  constructor() {
    // Cowswap GPv2Settlement functions
    const cowswapAbi = [
      'function settle(address[] tokens, uint256[] clearingPrices, ((uint256 sellTokenIndex, uint256 buyTokenIndex, address receiver, uint256 sellAmount, uint256 buyAmount, uint32 validTo, bytes32 appData, uint256 feeAmount, uint256 flags, uint256 executedAmount, bytes signature) trade, uint8 scheme)[] trades, (address target, uint256 value, bytes callData)[] interactions)',
      'function swap(address[] tokens, (uint256 sellTokenIndex, uint256 buyTokenIndex, address receiver, uint256 sellAmount, uint256 buyAmount, uint32 validTo, bytes32 appData, uint256 feeAmount, uint256 flags, uint256 executedAmount, bytes signature)[] orders)',
      'function setPreSignature(bytes orderUid, bool signed)',
    ];
    this.iface = new Interface(cowswapAbi);
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
          convertedValue = JSON.stringify(value);
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

// DEX decoder registry
export class DexDecoderRegistry {
  private curveDecoder = new CurveDecoder();
  private balancerDecoder = new BalancerV2Decoder();
  private oneInchDecoder = new OneInchDecoder();
  private zeroExDecoder = new ZeroExDecoder();
  private paraswapDecoder = new ParaswapDecoder();
  private cowswapDecoder = new CowswapDecoder();

  // Protocol address mappings
  private protocolAddresses = {
    curve: [
      '0x8301ae4fc9c624d1d396cbdaa1ed877821d7c511', // CRV ETH/stETH
      '0xdc24316b9ae028f1497c275eb9192a3ea0f67022', // CRV ETH/stETH (old)
      '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7', // 3pool
      '0xa2b47e3d5c44877cca798226b7b8118f9bfb7a56', // Compound pool
    ],
    balancer: [
      '0xba12222222228d8ba445958a75a0704d566bf2c8', // Balancer V2 Vault
    ],
    oneInch: [
      '0x1111111254eeb25477b68fb85ed929f73a960582', // 1inch V5 Router
      '0x1111111254fb6c44bac0bed2854e76f90643097d', // 1inch V4 Router
    ],
    zeroEx: [
      '0xdef1c0ded9bec7f1a1670819833240f027b25eff', // 0x Exchange Proxy
    ],
    paraswap: [
      '0xdef171fe48cf0115b1d80b88dc8eab59176fee57', // Paraswap Augustus V5
    ],
    cowswap: [
      '0x9008d19f58aabd9ed0d60971565aa8510560ab41', // Cowswap GPv2Settlement
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
      case 'curve':
        return this.curveDecoder.decode(input);
      case 'balancer':
        return this.balancerDecoder.decode(input);
      case 'oneInch':
        return this.oneInchDecoder.decode(input);
      case 'zeroEx':
        return this.zeroExDecoder.decode(input);
      case 'paraswap':
        return this.paraswapDecoder.decode(input);
      case 'cowswap':
        return this.cowswapDecoder.decode(input);
      default:
        return null;
    }
  }

  private tryAllDecoders(input: string): DecodedCall | null {
    const decoders = [
      this.curveDecoder,
      this.balancerDecoder,
      this.oneInchDecoder,
      this.zeroExDecoder,
      this.paraswapDecoder,
      this.cowswapDecoder,
    ];

    for (const decoder of decoders) {
      const result = decoder.decode(input);
      if (result) return result;
    }

    return null;
  }
}

// Global DEX decoder instance
let dexDecoderRegistry: DexDecoderRegistry | null = null;

export function getDexDecoderRegistry(): DexDecoderRegistry {
  if (!dexDecoderRegistry) {
    dexDecoderRegistry = new DexDecoderRegistry();
  }
  return dexDecoderRegistry;
}
