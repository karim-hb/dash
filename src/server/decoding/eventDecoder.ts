import { Transaction, DecodedEvent } from '@/lib/types';
import { selector, wordAt, hexToNumber, decodeAddressArray } from '@/lib/util/hex';
import { getAbiRegistry } from './abiRegistry';
import { getConfig } from '@/lib/config';
import { Interface } from 'ethers';

// Common event signatures for DeFi protocols
const EVENT_SIGNATURES: Record<string, { name: string; signature: string; args: any[] }> = {
  // ERC-20 Transfer
  'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef': {
    name: 'Transfer',
    signature: 'Transfer(address,address,uint256)',
    args: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  },

  // ERC-721 Transfer (same signature as ERC-20 Transfer)
  // Handled by the same Transfer signature above

  // ERC-1155 TransferSingle
  'c3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62': {
    name: 'TransferSingle',
    signature: 'TransferSingle(address,address,address,uint256,uint256)',
    args: [
      { name: 'operator', type: 'address', indexed: true },
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'id', type: 'uint256', indexed: false },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  },

  // ERC-1155 TransferBatch
  '4a39dc06d4c0dbc64b70c59a3edabcbbd3c2b0d1c4ea5d7b6d3c6e0d06c3fdc9': {
    name: 'TransferBatch',
    signature: 'TransferBatch(address,address,address,uint256[],uint256[])',
    args: [
      { name: 'operator', type: 'address', indexed: true },
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'ids', type: 'uint256[]', indexed: false },
      { name: 'values', type: 'uint256[]', indexed: false }
    ]
  },

  // ERC-721/1155 ApprovalForAll
  '17307eab39ab6107e8899845ad3d59bd9653f200d4d9d3f4d88a1a5f2b5f3c6e': {
    name: 'ApprovalForAll',
    signature: 'ApprovalForAll(address,address,bool)',
    args: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'operator', type: 'address', indexed: true },
      { name: 'approved', type: 'bool', indexed: false }
    ]
  },

  // ERC-20 Approval
  '8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925': {
    name: 'Approval',
    signature: 'Approval(address,address,uint256)',
    args: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false }
    ]
  },

  // Uniswap V2/V3 Swap
  '1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1': {
    name: 'Swap',
    signature: 'Swap(address,uint256,uint256,uint256,uint256,address)',
    args: [
      { name: 'sender', type: 'address', indexed: true },
      { name: 'amount0In', type: 'uint256', indexed: false },
      { name: 'amount1In', type: 'uint256', indexed: false },
      { name: 'amount0Out', type: 'uint256', indexed: false },
      { name: 'amount1Out', type: 'uint256', indexed: false },
      { name: 'to', type: 'address', indexed: true }
    ]
  },

  // Uniswap V3 Swap
  'c42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67': {
    name: 'Swap',
    signature: 'Swap(address,address,int256,int256,uint160,uint128,int24)',
    args: [
      { name: 'sender', type: 'address', indexed: true },
      { name: 'recipient', type: 'address', indexed: true },
      { name: 'amount0', type: 'int256', indexed: false },
      { name: 'amount1', type: 'int256', indexed: false },
      { name: 'sqrtPriceX96', type: 'uint160', indexed: false },
      { name: 'liquidity', type: 'uint128', indexed: false },
      { name: 'tick', type: 'int24', indexed: false }
    ]
  },

  // GMX Position Increase
  '540798df468d57811d66dbb2c0c3792977a064b6bf2c1f6a9bbcc2367ce363bef': {
    name: 'IncreasePosition',
    signature: 'IncreasePosition(bytes32,address,address,address,bool,uint256,uint256,uint256,uint256,uint256)',
    args: [
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'account', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'indexToken', type: 'address', indexed: false },
      { name: 'isLong', type: 'bool', indexed: false },
      { name: 'collateralDelta', type: 'uint256', indexed: false },
      { name: 'sizeDelta', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'indexPrice', type: 'uint256', indexed: false },
      { name: 'collateralPrice', type: 'uint256', indexed: false }
    ]
  },

  // GMX Position Decrease
  '2e1ff156c4c53c6a27a3ed6f1e5b47c6b0c8f0c9e0c3e8f6e8f6e8f6e8f6e8f6': {
    name: 'DecreasePosition',
    signature: 'DecreasePosition(bytes32,address,address,address,bool,uint256,uint256,uint256,uint256,uint256,bool)',
    args: [
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'account', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'indexToken', type: 'address', indexed: false },
      { name: 'isLong', type: 'bool', indexed: false },
      { name: 'collateralDelta', type: 'uint256', indexed: false },
      { name: 'sizeDelta', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'indexPrice', type: 'uint256', indexed: false },
      { name: 'collateralPrice', type: 'uint256', indexed: false },
      { name: 'wasLiquidated', type: 'bool', indexed: false }
    ]
  },

  // Synthetix Exchange
  '65b6972c94204c0da49b68a98532278b0d81bce066e3d4e7f2ad587e74e4b9a7': {
    name: 'SynthExchange',
    signature: 'SynthExchange(address,bytes32,uint256,bytes32,uint256,address)',
    args: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'fromCurrencyKey', type: 'bytes32', indexed: true },
      { name: 'fromAmount', type: 'uint256', indexed: false },
      { name: 'toCurrencyKey', type: 'bytes32', indexed: true },
      { name: 'toAmount', type: 'uint256', indexed: false },
      { name: 'toAddress', type: 'address', indexed: false }
    ]
  },

  // Aave Deposit
  'de6857219544bb5b7746f48ed30be63843806fd3c41a15537163bffa1c6c100211': {
    name: 'Deposit',
    signature: 'Deposit(address,address,address,uint256,uint16)',
    args: [
      { name: 'reserve', type: 'address', indexed: true },
      { name: 'user', type: 'address', indexed: false },
      { name: 'onBehalfOf', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'referral', type: 'uint16', indexed: false }
    ]
  },

  // Aave Withdraw
  '3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9ecc': {
    name: 'Withdraw',
    signature: 'Withdraw(address,address,address,uint256)',
    args: [
      { name: 'reserve', type: 'address', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },

  // Compound Supply
  '2e1a7d4d7925515c2b6b3b9b6b3b9b6b3b9b6b3b9b6b3b9b6b3b9b6b3b9b6b3': {
    name: 'Supply',
    signature: 'Supply(address,address,uint256,uint256,uint256)',
    args: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'dst', type: 'address', indexed: true },
      { name: 'asset', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'supplyIndex', type: 'uint256', indexed: false }
    ]
  },

  // MakerDAO Vault Interaction
  '1a2a22cb034d26d1854bdc6666a5b91fe25efbbb5dcad3b505e25b56be4ad3c4af': {
    name: 'VaultModified',
    signature: 'VaultModified(uint256)',
    args: [
      { name: 'vaultId', type: 'uint256', indexed: true }
    ]
  },

  // GMX Events
  '540798df468d57811d66dbb2c0c3792977a064b6bf2c1f6a9bbcc2367ce363bef': {
    name: 'IncreasePosition',
    signature: 'IncreasePosition(bytes32,address,address,address,bool,uint256,uint256,uint256,uint256,uint256)',
    args: [
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'account', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'indexToken', type: 'address', indexed: false },
      { name: 'isLong', type: 'bool', indexed: false },
      { name: 'collateralDelta', type: 'uint256', indexed: false },
      { name: 'sizeDelta', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'indexPrice', type: 'uint256', indexed: false },
      { name: 'collateralPrice', type: 'uint256', indexed: false }
    ]
  },

  '2e1ff156c4c53c6a27a3ed6f1e5b47c6b0c8f0c9e0c3e8f6e8f6e8f6e8f6e8f6': {
    name: 'DecreasePosition',
    signature: 'DecreasePosition(bytes32,address,address,address,bool,uint256,uint256,uint256,uint256,uint256,bool)',
    args: [
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'account', type: 'address', indexed: true },
      { name: 'collateralToken', type: 'address', indexed: false },
      { name: 'indexToken', type: 'address', indexed: false },
      { name: 'isLong', type: 'bool', indexed: false },
      { name: 'collateralDelta', type: 'uint256', indexed: false },
      { name: 'sizeDelta', type: 'uint256', indexed: false },
      { name: 'fee', type: 'uint256', indexed: false },
      { name: 'indexPrice', type: 'uint256', indexed: false },
      { name: 'collateralPrice', type: 'uint256', indexed: false },
      { name: 'wasLiquidated', type: 'bool', indexed: false }
    ]
  },

  // Synthetix Events
  '65b6972c94204c0da49b68a98532278b0d81bce066e3d4e7f2ad587e74e4b9a7': {
    name: 'SynthExchange',
    signature: 'SynthExchange(address,bytes32,uint256,bytes32,uint256,address)',
    args: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'fromCurrencyKey', type: 'bytes32', indexed: true },
      { name: 'fromAmount', type: 'uint256', indexed: false },
      { name: 'toCurrencyKey', type: 'bytes32', indexed: true },
      { name: 'toAmount', type: 'uint256', indexed: false },
      { name: 'toAddress', type: 'address', indexed: false }
    ]
  },

  // Aave Events
  'de6857219544bb5b7746f48ed30be63843806fd3c41a15537163bffa1c6c100211': {
    name: 'Deposit',
    signature: 'Deposit(address,address,address,uint256,uint16)',
    args: [
      { name: 'reserve', type: 'address', indexed: true },
      { name: 'user', type: 'address', indexed: false },
      { name: 'onBehalfOf', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'referral', type: 'uint16', indexed: false }
    ]
  },

  '3115d1449a7b732c986cba18244e897a450f61e1bb8d589cd2e69e6c8924f9ecc': {
    name: 'Withdraw',
    signature: 'Withdraw(address,address,address,uint256)',
    args: [
      { name: 'reserve', type: 'address', indexed: true },
      { name: 'user', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false }
    ]
  },

  // Compound Events
  '4c209b5fc8ad50758f13e2e1088ba56a560dff869554dc1b03bcdad122eb10a8ba': {
    name: 'Supply',
    signature: 'Supply(address,address,uint256,uint256,uint256)',
    args: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'dst', type: 'address', indexed: true },
      { name: 'asset', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'supplyIndex', type: 'uint256', indexed: false }
    ]
  },

  // Uniswap V3 Events
  '7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde': {
    name: 'IncreaseLiquidity',
    signature: 'IncreaseLiquidity(uint256,uint128,uint256,uint256)',
    args: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'liquidity', type: 'uint128', indexed: false },
      { name: 'amount0', type: 'uint256', indexed: false },
      { name: 'amount1', type: 'uint256', indexed: false }
    ]
  },

  '26f6a048ee9138f2fe57323ae41419498ef2d945a3c0d1bc9054313a52e8caae': {
    name: 'DecreaseLiquidity',
    signature: 'DecreaseLiquidity(uint256,uint128,uint256,uint256)',
    args: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'liquidity', type: 'uint128', indexed: false },
      { name: 'amount0', type: 'uint256', indexed: false },
      { name: 'amount1', type: 'uint256', indexed: false }
    ]
  }
};

// Protocol-specific routers and contracts for better detection
const PROTOCOL_CONTRACTS: Record<string, string[]> = {
  'uniswap_v2': [
    '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
  ],
  'uniswap_v3': [
    '0xe592427a0aece92de3edee1f18e0157c05861564',
    '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // WETH
  ],
  'gmx': [
    '0x489ee077994b6658eafa855c308275ead8097c4a',
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH on Arbitrum
    '0x2f2a2543b76a4166549f7aab2e75bef0aef2b0f'
  ],
  'synthetix': [
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
    '0x5e61a079a178f0e5784107a4963baae0c5a680c6'
  ],
  'aave': [
    '0x7d2768de32b0b80b7a34652c059e9e3bd095f668',
    '0x2f39d218133afab8f2b819b1066c7e434ad94e9e'
  ],
  'compound': [
    '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
    '0xc00e94cb662c3520282e6f5717214004a7f26888' // COMP
  ]
};

// Decode event logs from transaction receipt
export async function decodeEventLogs(tx: Transaction): Promise<DecodedEvent[]> {
  if (!tx._receipt || !tx._receipt.logs || !Array.isArray(tx._receipt.logs)) {
    return [];
  }

  const decodedEvents: DecodedEvent[] = [];

  for (const log of tx._receipt.logs) {
    try {
      const decoded = await decodeSingleEvent(log, tx);
      if (decoded) {
        decodedEvents.push(decoded);
      }
    } catch (error) {
      console.error(`Failed to decode event log:`, error);
    }
  }

  return decodedEvents;
}

// Decode a single event log
async function decodeSingleEvent(log: any, tx: Transaction): Promise<DecodedEvent | null> {
  const topics = log.topics || [];
  if (!topics.length) return null;

  const signature = topics[0];
  const sigHash = signature.startsWith('0x') ? signature.slice(2) : signature;

  // Check known event signatures
  const eventTemplate = EVENT_SIGNATURES[sigHash];
  if (eventTemplate) {
    return decodeKnownEvent(log, eventTemplate, tx);
  }

  // Try remote event signature lookup (4byte event-signatures) if enabled
  try {
    const { ENABLE_4BYTE } = getConfig();
    if (ENABLE_4BYTE) {
      const textSig = await resolveEventSignatureRemote(sigHash);
      if (textSig) {
        const decoded = await decodeWithEventSignature(log, textSig, tx);
        if (decoded) return { ...decoded, confidence: 0.85 };
      }
    }
  } catch (error) {
    console.error(`Remote event signature lookup failed for ${sigHash}:`, error);
  }

  // Fallback: try to identify common patterns
  const fallbackDecoded = decodeEventFallback(log, tx);
  if (fallbackDecoded) {
    return fallbackDecoded;
  }

  return null;
}

// Resolve event signature from 4byte.directory events API
async function resolveEventSignatureRemote(sigHash: string): Promise<string | null> {
  try {
    const hex = sigHash.startsWith('0x') ? sigHash : `0x${sigHash}`;
    const url = `https://www.4byte.directory/api/v1/event-signatures/?hex_signature=${hex}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = data?.results || [];
    if (Array.isArray(results) && results.length > 0) {
      return results[0]?.text_signature || null;
    }
    return null;
  } catch {
    return null;
  }
}

// Decode using a dynamically fetched event text signature
async function decodeWithEventSignature(log: any, textSignature: string, tx: Transaction): Promise<DecodedEvent | null> {
  try {
    const iface = new Interface([`event ${textSignature}`]);
    const parsed = iface.parseLog({ topics: log.topics, data: log.data });
    if (!parsed) return null;

    const args = parsed.eventFragment.inputs.map((input: any, index: number) => ({
      name: input.name || `arg${index}`,
      type: input.type,
      value: parsed.args[index],
      indexed: input.indexed || false
    }));

    return {
      event: parsed.name,
      signature: textSignature,
      args,
      address: log.address,
      topics: log.topics,
      data: log.data,
      decoded: true,
      confidence: 0.85
    };
  } catch {
    return null;
  }
}

// Decode using known event template
function decodeKnownEvent(log: any, template: any, tx: Transaction): DecodedEvent | null {
  try {
    const topics = log.topics || [];
    const data = log.data || '0x';

    // Extract indexed parameters from topics
    const args: any[] = [];
    let topicIndex = 1; // Skip signature topic
    let dataOffset = 2; // Skip '0x'

    for (const argTemplate of template.args) {
      if (argTemplate.indexed && topicIndex < topics.length) {
        // Indexed parameter from topics
        const topic = topics[topicIndex];
        if (argTemplate.type === 'address') {
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: `0x${topic.slice(-40)}`,
            indexed: true
          });
        } else if (argTemplate.type === 'uint256') {
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: hexToNumber(topic),
            indexed: true
          });
        } else if (argTemplate.type === 'bool') {
          const isTrue = BigInt(topic) !== 0n;
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: isTrue,
            indexed: true
          });
        } else {
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: topic,
            indexed: true
          });
        }
        topicIndex++;
      } else {
        // Non-indexed parameter from data
        if (argTemplate.type === 'uint256' && data.length >= dataOffset + 64) {
          const word = `0x${data.slice(dataOffset, dataOffset + 64)}`;
          const value = hexToNumber(word);
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: value,
            indexed: false
          });
          dataOffset += 64;
        } else if (argTemplate.type === 'address' && data.length >= dataOffset + 64) {
          const addr = `0x${data.slice(dataOffset + 24, dataOffset + 64)}`;
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: addr,
            indexed: false
          });
          dataOffset += 64;
        } else if (argTemplate.type === 'bool' && data.length >= dataOffset + 64) {
          const word = `0x${data.slice(dataOffset, dataOffset + 64)}`;
          const isTrue = BigInt(word) !== 0n;
          args.push({
            name: argTemplate.name,
            type: argTemplate.type,
            value: isTrue,
            indexed: false
          });
          dataOffset += 64;
        }
      }
    }

    return {
      event: template.name,
      signature: template.signature,
      args,
      address: log.address,
      topics,
      data,
      confidence: 0.95,
      decoded: true
    };
  } catch (error) {
    console.error(`Failed to decode known event ${template.name}:`, error);
    return null;
  }
}

// Decode event with signature string
async function decodeWithSignature(log: any, signature: string, tx: Transaction): Promise<DecodedEvent | null> {
  // This would require more complex ABI parsing - simplified for now
  return {
    event: 'Unknown',
    signature,
    args: [],
    address: log.address,
    topics: log.topics || [],
    data: log.data || '0x',
    confidence: 0.5,
    decoded: false
  };
}

// Fallback event decoding for common patterns
function decodeEventFallback(log: any, tx: Transaction): DecodedEvent | null {
  const topics = log.topics || [];
  const data = log.data || '0x';

  // ERC-20 Transfer pattern detection (even without full signature)
  if (topics.length >= 3 && data.length >= 66) {
    try {
      // Check if it looks like Transfer(address,address,uint256)
      const topic1 = topics[1]; // from
      const topic2 = topics[2]; // to

      if (topic1 && topic2 && topic1.length >= 40 && topic2.length >= 40) {
        const from = `0x${topic1.slice(-40)}`;
        const to = `0x${topic2.slice(-40)}`;
        const value = hexToNumber(`0x${data.slice(2, 66)}`);

        if (value > 0) {
          return {
            event: 'Transfer',
            signature: 'Transfer(address,address,uint256)',
            args: [
              { name: 'from', type: 'address', value: from, indexed: true },
              { name: 'to', type: 'address', value: to, indexed: true },
              { name: 'value', type: 'uint256', value: value, indexed: false }
            ],
            address: log.address,
            topics,
            data,
            confidence: 0.4,
            decoded: true
          };
        }
      }
    } catch (error) {
      // Ignore fallback decoding errors
    }
  }

  return null;
}

// Get protocol from contract address
export function getProtocolFromAddress(address: string): string {
  const addr = address.toLowerCase();

  for (const [protocol, contracts] of Object.entries(PROTOCOL_CONTRACTS)) {
    if (contracts.some(contract => contract.toLowerCase() === addr)) {
      return protocol;
    }
  }

  return 'unknown';
}
