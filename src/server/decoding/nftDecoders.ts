import { DecodedCall } from '@/lib/types';
import { Interface } from 'ethers';

// NFT Marketplace decoders for OpenSea Seaport, Blur, LooksRare, X2Y2

// OpenSea Seaport decoder
export class SeaportDecoder {
  private iface: Interface;

  constructor() {
    // Seaport 1.5 functions
    const seaportAbi = [
      'function fulfillOrder((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems) parameters, bytes signature)',
      'function fulfillBasicOrder((address considerationToken, uint256 considerationIdentifier, uint256 considerationAmount, address offerer, address zone, address offerToken, uint256 offerIdentifier, uint256 offerAmount, uint8 basicOrderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 offererConduitKey, bytes32 fulfillerConduitKey, uint256 totalOriginalAdditionalRecipients, (uint256 amount, address recipient)[] additionalRecipients, bytes signature) parameters)',
      'function fulfillAdvancedOrder((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems) parameters, (uint256 numerator, uint256 denominator, bytes signature) criteriaResolvers, bytes32 fulfillerConduitKey, address recipient)',
      'function fulfillAvailableOrders(((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems) parameters, bytes signature)[] orders, (uint256[][] offerFulfillments, uint256[][] considerationFulfillments, bytes32 fulfillerConduitKey, address recipient, uint256 maximumFulfilled) offerFulfillments)',
      'function matchOrders(((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems) parameters, bytes signature)[] orders, (uint256 orderIndex, uint256 itemIndex)[][] fulfillments)',
      'function cancel((address offerer, address zone, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount)[] offer, (uint8 itemType, address token, uint256 identifierOrCriteria, uint256 startAmount, uint256 endAmount, address recipient)[] consideration, uint8 orderType, uint256 startTime, uint256 endTime, bytes32 zoneHash, uint256 salt, bytes32 conduitKey, uint256 totalOriginalConsiderationItems)[] orders)',
    ];
    this.iface = new Interface(seaportAbi);
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
      let convertedValue = this.convertValue(value);

      return {
        name: inputs[index]?.name || `arg${index}`,
        type: inputs[index]?.type || 'unknown',
        value: convertedValue
      };
    });
  }

  private convertValue(value: any): any {
    if (typeof value === 'bigint') {
      return value.toString();
    } else if (Array.isArray(value)) {
      return value.map(v => this.convertValue(v));
    } else if (value && typeof value === 'object') {
      // Handle structs - extract key fields
      if (value.token && value.identifierOrCriteria) {
        return {
          token: value.token,
          identifier: value.identifierOrCriteria?.toString(),
          amount: value.startAmount?.toString() || value.amount?.toString()
        };
      }
      return JSON.stringify(value);
    }
    return value;
  }
}

// Blur marketplace decoder
export class BlurDecoder {
  private iface: Interface;

  constructor() {
    // Blur marketplace functions
    const blurAbi = [
      'function execute((address trader, uint8 side, address matchingPolicy, address collection, uint256 tokenId, uint256 amount, address paymentToken, uint256 price, uint256 listingTime, uint256 expirationTime, (uint16 rate, address recipient)[] fees, uint256 salt, bytes extraParams, bytes extraSignature) sell, (address trader, uint8 side, address matchingPolicy, address collection, uint256 tokenId, uint256 amount, address paymentToken, uint256 price, uint256 listingTime, uint256 expirationTime, (uint16 rate, address recipient)[] fees, uint256 salt, bytes extraParams, bytes extraSignature) buy)',
      'function bulkExecute(((address trader, uint8 side, address matchingPolicy, address collection, uint256 tokenId, uint256 amount, address paymentToken, uint256 price, uint256 listingTime, uint256 expirationTime, (uint16 rate, address recipient)[] fees, uint256 salt, bytes extraParams, bytes extraSignature) sell, (address trader, uint8 side, address matchingPolicy, address collection, uint256 tokenId, uint256 amount, address paymentToken, uint256 price, uint256 listingTime, uint256 expirationTime, (uint16 rate, address recipient)[] fees, uint256 salt, bytes extraParams, bytes extraSignature) buy)[] executions)',
      'function cancelOrder((address trader, uint8 side, address matchingPolicy, address collection, uint256 tokenId, uint256 amount, address paymentToken, uint256 price, uint256 listingTime, uint256 expirationTime, (uint16 rate, address recipient)[] fees, uint256 salt, bytes extraParams) order)',
      'function incrementNonce()',
    ];
    this.iface = new Interface(blurAbi);
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
          // Extract key fields from order
          if (value.collection && value.tokenId) {
            convertedValue = {
              collection: value.collection,
              tokenId: value.tokenId?.toString(),
              price: value.price?.toString(),
              trader: value.trader
            };
          } else {
            convertedValue = JSON.stringify(value);
          }
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

// LooksRare decoder
export class LooksRareDecoder {
  private iface: Interface;

  constructor() {
    // LooksRare exchange functions
    const looksRareAbi = [
      'function matchAskWithTakerBid((bool isOrderAsk, address taker, uint256 price, uint256 tokenId, uint256 minPercentageToAsk, bytes params) takerBid, (bool isOrderAsk, address signer, address collection, uint256 price, uint256 tokenId, uint256 amount, address strategy, address currency, uint256 nonce, uint256 startTime, uint256 endTime, uint256 minPercentageToAsk, bytes params, uint8 v, bytes32 r, bytes32 s) makerAsk)',
      'function matchBidWithTakerAsk((bool isOrderAsk, address taker, uint256 price, uint256 tokenId, uint256 minPercentageToAsk, bytes params) takerAsk, (bool isOrderAsk, address signer, address collection, uint256 price, uint256 tokenId, uint256 amount, address strategy, address currency, uint256 nonce, uint256 startTime, uint256 endTime, uint256 minPercentageToAsk, bytes params, uint8 v, bytes32 r, bytes32 s) makerBid)',
      'function matchAskWithTakerBidUsingETHAndWETH((bool isOrderAsk, address taker, uint256 price, uint256 tokenId, uint256 minPercentageToAsk, bytes params) takerBid, (bool isOrderAsk, address signer, address collection, uint256 price, uint256 tokenId, uint256 amount, address strategy, address currency, uint256 nonce, uint256 startTime, uint256 endTime, uint256 minPercentageToAsk, bytes params, uint8 v, bytes32 r, bytes32 s) makerAsk)',
      'function cancelMultipleMakerOrders(uint256[] orderNonces)',
      'function cancelAllOrdersForSender(uint256 minNonce)',
    ];
    this.iface = new Interface(looksRareAbi);
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
          // Extract key fields
          if (value.collection && value.tokenId) {
            convertedValue = {
              collection: value.collection,
              tokenId: value.tokenId?.toString(),
              price: value.price?.toString(),
              signer: value.signer || value.taker
            };
          } else {
            convertedValue = JSON.stringify(value);
          }
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

// X2Y2 decoder
export class X2Y2Decoder {
  private iface: Interface;

  constructor() {
    // X2Y2 exchange functions
    const x2y2Abi = [
      'function run((bytes32[] proof, bool intent, uint256 delegateType, uint256 deadline, address currency, bytes dataMask, (uint256 salt, address op, uint256 orderIdx, uint256 itemIdx, uint256 price, bytes itemHash)[] items, bytes32 r, bytes32 s, uint8 v, uint8 signVersion) input)',
      'function cancel(uint256[] itemHashes)',
      'function cancelByNonce(uint256 minNonce)',
    ];
    this.iface = new Interface(x2y2Abi);
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

// NFT decoder registry
export class NftDecoderRegistry {
  private seaportDecoder = new SeaportDecoder();
  private blurDecoder = new BlurDecoder();
  private looksRareDecoder = new LooksRareDecoder();
  private x2y2Decoder = new X2Y2Decoder();

  // Protocol address mappings
  private protocolAddresses = {
    seaport: [
      '0x00000000006c3852cbef3e08e8df289169ede581', // Seaport 1.1
      '0x00000000000006c7676171937c444f6bde3d6282', // Seaport 1.5
    ],
    blur: [
      '0x000000000000ad05ccc4f10045630fb830b95127', // Blur Marketplace
      '0x39da41747a83aee658334415666f3ef92dd0d541', // Blur Exchange
    ],
    looksRare: [
      '0x59728544b08ab483533076417fbbb2fd0b17ce3a', // LooksRare Exchange
    ],
    x2y2: [
      '0x74312363e45dcaba76c59ec49a7aa8a65a67eed3', // X2Y2 Exchange
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
      case 'seaport':
        return this.seaportDecoder.decode(input);
      case 'blur':
        return this.blurDecoder.decode(input);
      case 'looksRare':
        return this.looksRareDecoder.decode(input);
      case 'x2y2':
        return this.x2y2Decoder.decode(input);
      default:
        return null;
    }
  }

  private tryAllDecoders(input: string): DecodedCall | null {
    const decoders = [
      this.seaportDecoder,
      this.blurDecoder,
      this.looksRareDecoder,
      this.x2y2Decoder,
    ];

    for (const decoder of decoders) {
      const result = decoder.decode(input);
      if (result) return result;
    }

    return null;
  }
}

// Global NFT decoder instance
let nftDecoderRegistry: NftDecoderRegistry | null = null;

export function getNftDecoderRegistry(): NftDecoderRegistry {
  if (!nftDecoderRegistry) {
    nftDecoderRegistry = new NftDecoderRegistry();
  }
  return nftDecoderRegistry;
}
