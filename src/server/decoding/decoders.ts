import { Transaction, DecodedCall, SwapDetails } from '@/lib/types';
import { getCoreDecoder } from './coreDecoder';

// Public interface for decoding transactions and swap details

// Decode function call from transaction
export async function decodeFunctionAndArgs(tx: Transaction): Promise<DecodedCall | null> {
  const decoder = getCoreDecoder();
  const result = await decoder.decodeTransaction(tx);

  if (result.decoded && result.function) {
    return result.function;
  }

  return null;
}

// Decode swap details from transaction
export function decodeSwapDetails(tx: Transaction): SwapDetails {
  const decoder = getCoreDecoder();
  return decoder.decodeSwapDetails(tx);
}

// Check if transaction is decoded
export async function isDecoded(tx: Transaction): Promise<boolean> {
  const result = await decodeFunctionAndArgs(tx);
  return result !== null;
}

// Get decoded function name
export async function getFunctionName(tx: Transaction): Promise<string> {
  const decoded = await decodeFunctionAndArgs(tx);
  return decoded?.function || '-';
}

// Get decoded arguments
export async function getFunctionArgs(tx: Transaction): Promise<any[]> {
  const decoded = await decodeFunctionAndArgs(tx);
  return decoded?.args || [];
}
