/**
 * Address Decoder Utility
 * Provides contract and address identification and labeling
 */

export interface DecodedAddress {
  address: string;
  label?: string;
  type?: 'contract' | 'eoa' | 'known';
  category?: string;
  description?: string;
}

// Known contract addresses and their labels
const KNOWN_CONTRACTS: Record<string, { label: string; category: string; description?: string }> = {
  // DEXs
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': {
    label: 'Uniswap V2 Router',
    category: 'DEX',
    description: 'Decentralized exchange router'
  },
  '0xe592427a0aece92de3edee1f18e0157c05861564': {
    label: 'Uniswap V3 Router',
    category: 'DEX',
    description: 'Uniswap V3 swap router'
  },
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': {
    label: 'Uniswap Universal Router',
    category: 'DEX',
    description: 'Universal router for Uniswap'
  },
  '0xef1c6e67703c7bd7107eed8303fbe6ec2554bf6b': {
    label: 'Uniswap Universal Router 2',
    category: 'DEX'
  },
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': {
    label: 'SushiSwap Router',
    category: 'DEX',
    description: 'SushiSwap exchange router'
  },
  '0x1111111254eeb25477b68fb85ed929f73a960582': {
    label: '1inch V5 Router',
    category: 'DEX Aggregator',
    description: 'DEX aggregator router'
  },
  '0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad': {
    label: 'Uniswap Universal Router 3',
    category: 'DEX'
  },
  
  // Tokens
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    label: 'USDT',
    category: 'Stablecoin',
    description: 'Tether USD stablecoin'
  },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    label: 'USDC',
    category: 'Stablecoin',
    description: 'USD Coin stablecoin'
  },
  '0x6b175474e89094c44da98b954eedeac495271d0f': {
    label: 'DAI',
    category: 'Stablecoin',
    description: 'DAI stablecoin'
  },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
    label: 'WBTC',
    category: 'Wrapped Asset',
    description: 'Wrapped Bitcoin'
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    label: 'WETH',
    category: 'Wrapped Asset',
    description: 'Wrapped Ether'
  },
  
  // NFT Marketplaces
  '0x00000000000000adc04c56bf30ac9d3c0aaf14dc': {
    label: 'Seaport 1.5',
    category: 'NFT Marketplace',
    description: 'OpenSea Seaport protocol'
  },
  '0x00000000006c3852cbef3e08e8df289169ede581': {
    label: 'Seaport 1.1',
    category: 'NFT Marketplace'
  },
  '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b': {
    label: 'OpenSea Registry',
    category: 'NFT Marketplace'
  },
  '0x59728544b08ab483533076417fbbb2fd0b17ce3a': {
    label: 'LooksRare',
    category: 'NFT Marketplace'
  },
  '0x74312363e45dcaba76c59ec49a7aa8a65a67eed3': {
    label: 'X2Y2',
    category: 'NFT Marketplace'
  },
  
  // Bridges
  '0x8484ef722627bf18ca5ae6bcf031c23e6e922b30': {
    label: 'Wormhole Bridge',
    category: 'Bridge',
    description: 'Cross-chain bridge'
  },
  '0x3ee18b2214aff97000d974cf647e7c347e8fa585': {
    label: 'Wormhole Token Bridge',
    category: 'Bridge'
  },
  '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf': {
    label: 'Polygon Bridge',
    category: 'Bridge'
  },
  
  // MEV/Flashbots
  '0xa57bd00134b2850b2a1c55860c9e9ea100fdd6cf': {
    label: 'MEV Bot',
    category: 'MEV',
    description: 'Maximal extractable value bot'
  },
  '0x000000000000084e91743124a982076c59f10084': {
    label: 'Flashbots Builder',
    category: 'MEV'
  },
  
  // Lending Protocols
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': {
    label: 'Aave V2 Pool',
    category: 'Lending',
    description: 'Aave lending pool'
  },
  '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2': {
    label: 'Aave V3 Pool',
    category: 'Lending'
  },
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': {
    label: 'Compound Comptroller',
    category: 'Lending'
  },
  
  // Other DeFi
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    label: 'WETH',
    category: 'Token'
  },
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
    label: 'UNI Token',
    category: 'Token'
  }
};

// Function signature database (common functions)
const FUNCTION_SIGNATURES: Record<string, string> = {
  '0x095ea7b3': 'approve(address,uint256)',
  '0xa9059cbb': 'transfer(address,uint256)',
  '0x23b872dd': 'transferFrom(address,address,uint256)',
  '0x70a08231': 'balanceOf(address)',
  '0x18160ddd': 'totalSupply()',
  '0xdd62ed3e': 'allowance(address,address)',
  
  // DEX functions
  '0x38ed1739': 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)',
  '0x7ff36ab5': 'swapExactETHForTokens(uint256,address[],address,uint256)',
  '0x18cbafe5': 'swapExactTokensForETH(uint256,uint256,address[],address,uint256)',
  '0xfb3bdb41': 'swapETHForExactTokens(uint256,address[],address,uint256)',
  '0x8803dbee': 'swapTokensForExactTokens(uint256,uint256,address[],address,uint256)',
  '0x4a25d94a': 'swapTokensForExactETH(uint256,uint256,address[],address,uint256)',
  '0x5c11d795': 'swapExactTokensForTokensSupportingFeeOnTransferTokens(uint256,uint256,address[],address,uint256)',
  '0xb6f9de95': 'swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)',
  
  // Uniswap V3
  '0x414bf389': 'exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))',
  '0xc04b8d59': 'exactInput((bytes,address,uint256,uint256,uint256))',
  '0xdb3e2198': 'exactOutputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))',
  '0xf28c0498': 'exactOutput((bytes,address,uint256,uint256,uint256))',
  
  // NFT
  '0x42842e0e': 'safeTransferFrom(address,address,uint256)',
  '0xb88d4fde': 'safeTransferFrom(address,address,uint256,bytes)',
  '0x6352211e': 'ownerOf(uint256)',
  '0x081812fc': 'getApproved(uint256)',
  '0xa22cb465': 'setApprovalForAll(address,bool)',
  '0xe985e9c5': 'isApprovedForAll(address,address)',
  
  // Multicall
  '0x5ae401dc': 'multicall(uint256,bytes[])',
  '0xac9650d8': 'multicall(bytes[])',
  
  // Execute
  '0x3593564c': 'execute(bytes,bytes[])',
  '0x24856bc3': 'execute(bytes,bytes[],uint256)',
};

/**
 * Decode an address to get its label and metadata
 */
export function decodeAddress(address: string): DecodedAddress {
  const normalized = address.toLowerCase();
  const known = KNOWN_CONTRACTS[normalized];
  
  if (known) {
    return {
      address,
      label: known.label,
      type: 'known',
      category: known.category,
      description: known.description
    };
  }
  
  return {
    address,
    type: 'contract'
  };
}

/**
 * Decode a function signature from transaction input data
 */
export function decodeFunctionSignature(input: string): string | null {
  if (!input || input.length < 10) return null;
  
  const signature = input.slice(0, 10).toLowerCase();
  return FUNCTION_SIGNATURES[signature] || null;
}

/**
 * Get a short label for an address (for display)
 */
export function getAddressLabel(address: string, maxLength: number = 20): string {
  const decoded = decodeAddress(address);
  
  if (decoded.label) {
    return decoded.label.length > maxLength 
      ? decoded.label.slice(0, maxLength - 3) + '...'
      : decoded.label;
  }
  
  // Return shortened address
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get category color for styling
 */
export function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    'DEX': 'text-cyan-400',
    'DEX Aggregator': 'text-blue-400',
    'Stablecoin': 'text-green-400',
    'Token': 'text-purple-400',
    'NFT Marketplace': 'text-pink-400',
    'Bridge': 'text-yellow-400',
    'MEV': 'text-red-400',
    'Lending': 'text-emerald-400',
    'Wrapped Asset': 'text-orange-400'
  };
  
  return category ? colors[category] || 'text-slate-400' : 'text-slate-400';
}

/**
 * Get all known addresses by category
 */
export function getKnownAddressesByCategory(): Record<string, Array<{ address: string; label: string }>> {
  const result: Record<string, Array<{ address: string; label: string }>> = {};
  
  Object.entries(KNOWN_CONTRACTS).forEach(([address, data]) => {
    if (!result[data.category]) {
      result[data.category] = [];
    }
    result[data.category].push({ address, label: data.label });
  });
  
  return result;
}

/**
 * Check if address is a known contract
 */
export function isKnownContract(address: string): boolean {
  return !!KNOWN_CONTRACTS[address.toLowerCase()];
}
