import { keccak256 } from 'ethers';

// Convert hex string to bytes32 selector
export function selector(input: string | null): string | null {
  if (!input || input === '0x') return null;

  try {
    const data = input.startsWith('0x') ? input.slice(2) : input;
    if (data.length < 8) return null;

    return data.slice(0, 8).toLowerCase();
  } catch {
    return null;
  }
}

// Get word at position in hex data
export function wordAt(input: string, position: number): string {
  const data = input.startsWith('0x') ? input.slice(2) : input;
  const start = position * 64;
  const end = start + 64;
  return data.slice(start, end);
}

// Convert hex to number safely
export function hexToNumber(hex: string | null): number {
  if (!hex) return 0;
  try {
    return parseInt(hex.startsWith('0x') ? hex : `0x${hex}`, 16);
  } catch {
    return 0;
  }
}

// Convert hex to big int safely
export function hexToBigInt(hex: string | null): bigint {
  if (!hex) return 0n;
  try {
    return BigInt(hex.startsWith('0x') ? hex : `0x${hex}`);
  } catch {
    return 0n;
  }
}

// Convert number to hex
export function numberToHex(num: number | bigint): string {
  return `0x${num.toString(16)}`;
}

// Check if address is valid
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Normalize address to lowercase
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) return address;
  return address.toLowerCase();
}

// Checksum address
export function checksumAddress(address: string): string {
  if (!isValidAddress(address)) return address;

  const addr = address.toLowerCase().replace('0x', '');
  const hash = keccak256(Buffer.from(addr, 'utf8')).replace('0x', '');

  let checksumAddress = '0x';
  for (let i = 0; i < addr.length; i++) {
    const char = addr[i];
    if (parseInt(hash[i], 16) >= 8) {
      checksumAddress += char.toUpperCase();
    } else {
      checksumAddress += char;
    }
  }

  return checksumAddress;
}

// Decode address array from hex data
export function decodeAddressArray(input: string, offsetWords: number): string[] {
  const addresses: string[] = [];
  const data = input.startsWith('0x') ? input.slice(2) : input;

  try {
    // Get array length at offset
    const lengthWord = wordAt(`0x${data}`, offsetWords);
    const length = hexToNumber(lengthWord);

    // Get addresses starting from offset + 1
    for (let i = 0; i < length && i < 20; i++) { // Limit to 20 addresses
      const addrWord = wordAt(`0x${data}`, offsetWords + 1 + i);
      if (addrWord.length >= 40) {
        const addr = `0x${addrWord.slice(-40)}`;
        if (isValidAddress(addr)) {
          addresses.push(normalizeAddress(addr));
        }
      }
    }
  } catch {
    // Ignore decode errors
  }

  return addresses;
}

// Truncate hash for display
export function truncateHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (!hash || hash.length <= startChars + endChars + 2) return hash;
  return `${hash.slice(0, startChars + 2)}...${hash.slice(-endChars)}`;
}

// Format ETH value for display
export function formatEthValue(wei: string | bigint, decimals: number = 4): string {
  try {
    const value = typeof wei === 'string' ? hexToBigInt(wei) : wei;
    const eth = Number(value) / 1e18;

    if (eth === 0) return '0';

    if (eth < 0.001) {
      return eth.toFixed(6);
    } else if (eth < 1) {
      return eth.toFixed(4);
    } else {
      return eth.toFixed(2);
    }
  } catch {
    return wei.toString();
  }
}

// Format gas value for display
export function formatGasValue(gas: number): string {
  if (gas >= 1e9) {
    return `${(gas / 1e9).toFixed(1)}B`;
  } else if (gas >= 1e6) {
    return `${(gas / 1e6).toFixed(1)}M`;
  } else if (gas >= 1e3) {
    return `${(gas / 1e3).toFixed(1)}K`;
  } else {
    return gas.toString();
  }
}
