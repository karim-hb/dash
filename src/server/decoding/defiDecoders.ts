import { DecodedCall } from '@/lib/types';
import { Interface } from 'ethers';

// DeFi protocol decoders for Aave V3, Compound V3, MakerDAO, Uniswap V3 LP

// Aave V3 decoder
export class AaveV3Decoder {
  private iface: Interface;

  constructor() {
    // Aave V3 Pool functions
    const aaveAbi = [
      'function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode)',
      'function withdraw(address asset, uint256 amount, address to)',
      'function borrow(address asset, uint256 amount, uint256 interestRateMode, uint16 referralCode, address onBehalfOf)',
      'function repay(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf)',
      'function repayWithPermit(address asset, uint256 amount, uint256 interestRateMode, address onBehalfOf, uint256 deadline, uint8 permitV, bytes32 permitR, bytes32 permitS)',
      'function repayWithATokens(address asset, uint256 amount, uint256 interestRateMode)',
      'function swapBorrowRateMode(address asset, uint256 interestRateMode)',
      'function rebalanceStableBorrowRate(address asset, address user)',
      'function setUserUseReserveAsCollateral(address asset, bool useAsCollateral)',
      'function liquidationCall(address collateralAsset, address debtAsset, address user, uint256 debtToCover, bool receiveAToken)',
      'function flashLoan(address receiverAddress, address[] assets, uint256[] amounts, uint256[] interestRateModes, address onBehalfOf, bytes params, uint16 referralCode)',
      'function flashLoanSimple(address receiverAddress, address asset, uint256 amount, bytes params, uint16 referralCode)',
    ];
    this.iface = new Interface(aaveAbi);
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

// Compound V3 decoder
export class CompoundV3Decoder {
  private iface: Interface;

  constructor() {
    // Compound V3 Comet functions
    const compoundAbi = [
      'function supply(address asset, uint256 amount)',
      'function supplyTo(address dst, address asset, uint256 amount)',
      'function supplyFrom(address from, address dst, address asset, uint256 amount)',
      'function withdraw(address asset, uint256 amount)',
      'function withdrawTo(address to, address asset, uint256 amount)',
      'function withdrawFrom(address src, address to, address asset, uint256 amount)',
      'function transfer(address dst, uint256 amount)',
      'function transferFrom(address src, address dst, uint256 amount)',
      'function transferAsset(address dst, address asset, uint256 amount)',
      'function transferAssetFrom(address src, address dst, address asset, uint256 amount)',
      'function buyCollateral(address asset, uint256 minAmount, uint256 baseAmount, address recipient)',
      'function absorb(address absorber, address[] accounts)',
      'function accrueAccount(address account)',
    ];
    this.iface = new Interface(compoundAbi);
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

// MakerDAO decoder
export class MakerDAODecoder {
  private iface: Interface;

  constructor() {
    // MakerDAO CDP Manager and Vat functions
    const makerAbi = [
      'function open(bytes32 ilk, address usr)',
      'function give(uint256 cdp, address usr)',
      'function frob(uint256 cdp, int256 dink, int256 dart)',
      'function flux(uint256 cdp, address dst, uint256 wad)',
      'function move(uint256 cdp, address dst, uint256 rad)',
      'function quit(uint256 cdp, address dst)',
      'function enter(address src, uint256 cdp)',
      'function shift(uint256 cdpSrc, uint256 cdpDst)',
      // Vat functions
      'function hope(address usr)',
      'function nope(address usr)',
      'function wish(address bit, address usr)',
      'function frob(bytes32 i, address u, address v, address w, int256 dink, int256 dart)',
      'function fork(bytes32 ilk, address src, address dst, int256 dink, int256 dart)',
      // PSM functions
      'function sellGem(address usr, uint256 gemAmt)',
      'function buyGem(address usr, uint256 gemAmt)',
    ];
    this.iface = new Interface(makerAbi);
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

// Uniswap V3 LP (Liquidity Provider) decoder
export class UniswapV3LPDecoder {
  private iface: Interface;

  constructor() {
    // Uniswap V3 NonfungiblePositionManager functions
    const uniswapV3LPAbi = [
      'function mint((address token0, address token1, uint24 fee, int24 tickLower, int24 tickUpper, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, address recipient, uint256 deadline) params)',
      'function increaseLiquidity((uint256 tokenId, uint256 amount0Desired, uint256 amount1Desired, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params)',
      'function decreaseLiquidity((uint256 tokenId, uint128 liquidity, uint256 amount0Min, uint256 amount1Min, uint256 deadline) params)',
      'function collect((uint256 tokenId, address recipient, uint128 amount0Max, uint128 amount1Max) params)',
      'function burn(uint256 tokenId)',
      'function createAndInitializePoolIfNecessary(address token0, address token1, uint24 fee, uint160 sqrtPriceX96)',
    ];
    this.iface = new Interface(uniswapV3LPAbi);
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
          // Handle struct parameters
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

// DeFi decoder registry
export class DefiDecoderRegistry {
  private aaveDecoder = new AaveV3Decoder();
  private compoundDecoder = new CompoundV3Decoder();
  private makerDecoder = new MakerDAODecoder();
  private uniswapV3LPDecoder = new UniswapV3LPDecoder();

  // Protocol address mappings
  private protocolAddresses = {
    aave: [
      '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2', // Aave V3 Pool (Ethereum)
      '0x794a61358d6845594f94dc1db02a252b5b4814ad', // Aave V3 Pool (Arbitrum)
      '0x794a61358d6845594f94dc1db02a252b5b4814ad', // Aave V3 Pool (Optimism)
    ],
    compound: [
      '0xc3d688b66703497daa19211eedff47f25384cdc3', // Compound V3 cUSDCv3 (Ethereum)
      '0xa17581a9e3356d9a858b789d68b4d866e593ae94', // Compound V3 cWETHv3 (Ethereum)
      '0x9c4ec768c28520b50860ea7a15bd7213a9ff58bf', // Compound V3 cUSDCv3 (Arbitrum)
    ],
    maker: [
      '0x5ef30b9986345249bc32d8928b7ee64de9435e39', // MCD_CDP_MANAGER
      '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b', // MCD_VAT
      '0x89b78cfa322f6c5de0abceecab66aee45393cc5a', // PSM_USDC_A
    ],
    uniswapV3LP: [
      '0xc36442b4a4522e871399cd717abdd847ab11fe88', // Uniswap V3 NonfungiblePositionManager
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
      case 'aave':
        return this.aaveDecoder.decode(input);
      case 'compound':
        return this.compoundDecoder.decode(input);
      case 'maker':
        return this.makerDecoder.decode(input);
      case 'uniswapV3LP':
        return this.uniswapV3LPDecoder.decode(input);
      default:
        return null;
    }
  }

  private tryAllDecoders(input: string): DecodedCall | null {
    const decoders = [
      this.aaveDecoder,
      this.compoundDecoder,
      this.makerDecoder,
      this.uniswapV3LPDecoder,
    ];

    for (const decoder of decoders) {
      const result = decoder.decode(input);
      if (result) return result;
    }

    return null;
  }
}

// Global DeFi decoder instance
let defiDecoderRegistry: DefiDecoderRegistry | null = null;

export function getDefiDecoderRegistry(): DefiDecoderRegistry {
  if (!defiDecoderRegistry) {
    defiDecoderRegistry = new DefiDecoderRegistry();
  }
  return defiDecoderRegistry;
}
