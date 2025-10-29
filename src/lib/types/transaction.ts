import { z } from 'zod';

// Transaction states enum
export enum TxState {
  PENDING = 'PENDING',
  REPLACED = 'REPLACED',
  INCLUDED = 'INCLUDED',
  CONFIRMED = 'CONFIRMED',
  FINALIZED = 'FINALIZED',
  DROPPED = 'DROPPED',
  RESUBMITTED = 'RESUBMITTED',
}

// Transaction category schema
export const CategoryKeySchema = z.string(); // e.g., "erc20:transfer", "dex:swap"

// Decoded function call schema
export const DecodedCallSchema = z.object({
  function: z.string(),
  args: z.array(z.object({
    name: z.string(),
    type: z.string(),
    value: z.any(),
  })),
  confidence: z.number().optional(),
  decoded: z.boolean().optional(),
});

// Decoded event log schema
export const DecodedEventSchema = z.object({
  event: z.string(),
  signature: z.string(),
  args: z.array(z.object({
    name: z.string(),
    type: z.string(),
    value: z.any(),
    indexed: z.boolean().optional(),
  })),
  address: z.string(),
  topics: z.array(z.string()),
  data: z.string(),
  confidence: z.number().optional(),
  decoded: z.boolean().optional(),
});

export type DecodedCall = z.infer<typeof DecodedCallSchema>;

// Decoded event type
export type DecodedEvent = z.infer<typeof DecodedEventSchema>;

// State transition schema (state change log)
export const StateTransitionSchema = z.object({
  state: z.nativeEnum(TxState),
  timestamp: z.number(),
  reason: z.string().optional(),
});

export type StateTransition = z.infer<typeof StateTransitionSchema>;

// Swap details schema
export const SwapDetailsSchema = z.object({
  is_swap: z.boolean(),
  dex_version: z.string(),
  swap_type: z.string(),
  amount_in: z.number().nullable(),
  amount_out: z.number().nullable(),
  token_in: z.string().nullable(),
  token_out: z.string().nullable(),
  path: z.array(z.string()),
});

export type SwapDetails = z.infer<typeof SwapDetailsSchema>;

// Transaction schema
export const TransactionSchema = z.object({
  type: z.string(),
  nonce: z.string(),
  to: z.string().nullable(),
  from: z.string(),
  value: z.string(),
  input: z.string(),
  gasPrice: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
  v: z.string().optional(),
  r: z.string().optional(),
  s: z.string().optional(),
  hash: z.string(),
  transactionIndex: z.number().nullable(),
  blockHash: z.string().nullable(),
  blockNumber: z.string().nullable(),
  gas: z.string(),

  // Extended fields
  category_key: CategoryKeySchema,
  _decoded_fn: DecodedCallSchema.optional(),
  _decoded_events: z.array(DecodedEventSchema).optional(),
  _swap_details: SwapDetailsSchema.optional(),
  _first_seen_ts: z.number(),
  _last_seen_ts: z.number(),
  _score: z.number(),
  _state: z.nativeEnum(TxState),
  _confirmation_depth: z.number(),
  _inclusion_block: z.string().nullable(),
  _inclusion_ts: z.number().nullable(),
  // Extended lifecycle tracking
  state_history: z.array(StateTransitionSchema).optional(),
  replacement_tx: z.string().nullable().optional(),
  replaced_by: z.string().nullable().optional(),
  drop_reason: z.string().nullable().optional(),
  // Optional duplicate fields for convenience (numeric block/confirmation)
  inclusion_block: z.number().nullable().optional(),
  confirmation_depth: z.number().optional(),
  _receipt: z.any().optional(), // Receipt data
});

export type Transaction = z.infer<typeof TransactionSchema>;

// Raw Ethereum transaction schema
export const RawTransactionSchema = z.object({
  type: z.string().optional(),
  nonce: z.string(),
  to: z.string().nullable(),
  from: z.string().optional(),
  value: z.string(),
  input: z.string(),
  gasPrice: z.string().optional(),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
  gas: z.string(),
  v: z.string().optional(),
  r: z.string().optional(),
  s: z.string().optional(),
  hash: z.string().optional(),
  transactionIndex: z.number().nullable(),
  blockHash: z.string().nullable(),
  blockNumber: z.string().nullable(),
});

export type RawTransaction = z.infer<typeof RawTransactionSchema>;

// Block header schema
export const BlockHeaderSchema = z.object({
  hash: z.string(),
  number: z.string(),
  timestamp: z.string(),
  transactions: z.array(RawTransactionSchema),
});

export type BlockHeader = z.infer<typeof BlockHeaderSchema>;

// Receipt schema
export const ReceiptSchema = z.object({
  transactionHash: z.string(),
  transactionIndex: z.string(),
  blockHash: z.string(),
  blockNumber: z.string(),
  from: z.string(),
  to: z.string().nullable(),
  cumulativeGasUsed: z.string(),
  effectiveGasPrice: z.string(),
  gasUsed: z.string(),
  status: z.string(),
  logs: z.array(z.any()), // Log entries
  logsBloom: z.string(),
  type: z.string(),
});

export type Receipt = z.infer<typeof ReceiptSchema>;

// Token metadata schema
export const TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  decimals: z.number(),
  _last_updated: z.number().optional(),
});

export type Token = z.infer<typeof TokenSchema>;

// Router registry entry
export const RouterEntrySchema = z.object({
  address: z.string(),
  name: z.string(),
  version: z.string(),
  factory: z.string().optional(),
});

export type RouterEntry = z.infer<typeof RouterEntrySchema>;

// Protocol entry
export const ProtocolEntrySchema = z.object({
  name: z.string(),
  addresses: z.array(z.string()),
  type: z.string(), // bridge, aggregator, nft_market, etc.
});

export type ProtocolEntry = z.infer<typeof ProtocolEntrySchema>;
