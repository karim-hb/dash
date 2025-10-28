import { z } from 'zod';

// Gas bucket schema
export const GasBucketsSchema = z.object({
  gte_100: z.number(),
  gte_150: z.number(),
  gte_200: z.number(),
  gte_300: z.number(),
});

export type GasBuckets = z.infer<typeof GasBucketsSchema>;

// State counts schema
export const StateCountsSchema = z.record(z.string(), z.number()); // TxState -> count

// Flow metrics schema
export const FlowMetricsSchema = z.object({
  flow_ingress_per_window: z.number(),
  flow_included_per_window: z.number(),
  flow_dropped_per_window: z.number(),
  flow_stuck_per_window: z.number(),
});

// State metrics summary
export const StateMetricsSchema = z.object({
  state_counts: StateCountsSchema,
  success_rate: z.number().nullable(),
  avg_inclusion_time: z.number().nullable(),
  congestion: z.number().nullable(),
  flow_ingress_per_window: z.number(),
  flow_included_per_window: z.number(),
  flow_dropped_per_window: z.number(),
  flow_stuck_per_window: z.number(),
});

export type StateMetrics = z.infer<typeof StateMetricsSchema>;

// Metrics aggregator result
export const MetricsResultSchema = z.object({
  total_pending: z.number(),
  total_queued: z.number(),
  by_type: z.record(z.string(), z.number()), // category -> count
  large_eth_count: z.number(),
  gas_buckets: GasBucketsSchema,
  ingress_per_sec: z.number(),
  egress_per_sec: z.number(),
  age_p50: z.number().nullable(),
  age_p90: z.number().nullable(),
  age_max: z.number().nullable(),
});

export type MetricsResult = z.infer<typeof MetricsResultSchema>;

// Gas fee history percentile
export const FeeHistoryPercentileSchema = z.object({
  base_fee: z.number().nullable(),
  suggested_gas_price: z.number().nullable(),
  suggested_max_fee: z.number().nullable(),
  suggested_priority_fee: z.number().nullable(),
  percentiles: z.record(z.string(), z.number()),
});

export type FeeHistoryPercentile = z.infer<typeof FeeHistoryPercentileSchema>;

// Gas suggestions
export const GasSuggestionsSchema = z.object({
  base_fee: z.number().nullable(),
  tips: z.record(z.string(), z.number()), // "1_block", "3_blocks", "5_blocks" -> gwei
});

export type GasSuggestions = z.infer<typeof GasSuggestionsSchema>;

// UI snapshot for WS broadcasting
export const UiSnapshotSchema = z.object({
  timestamp: z.number(),
  summary: MetricsResultSchema.extend({
    state_counts: StateCountsSchema.optional(),
    success_rate: z.number().nullable().optional(),
    avg_inclusion_time: z.number().nullable().optional(),
    congestion: z.number().nullable().optional(),
    flow_spark: z.record(z.string(), z.string()).optional(), // sparkline strings
  }),
  opportunities: z.array(z.object({
    hash: z.string(),
    rank: z.number(),
    score: z.number(),
    category_key: z.string(),
    decoded_fn: z.any().optional(),
  })).optional(),
  live: z.array(z.any()).optional(), // Recent transactions
  included: z.array(z.any()).optional(), // Included transactions
  gas: GasSuggestionsSchema.optional(),
  contracts: z.array(z.object({
    address: z.string(),
    name: z.string(),
    tx_count: z.number(),
    category: z.string(),
  })).optional(),
  senders: z.array(z.object({
    address: z.string(),
    tx_count: z.number(),
    success_rate: z.number(),
    total_value: z.string(),
  })).optional(),
  status: z.object({
    ws_connected: z.boolean(),
    rpc_latency_ms: z.number().nullable(),
    subscriptions_active: z.array(z.string()),
    errors: z.array(z.string()),
  }).optional(),
});

export type UiSnapshot = z.infer<typeof UiSnapshotSchema>;

// Watchlist entry
export const WatchlistEntrySchema = z.object({
  address: z.string(),
  label: z.string().optional(),
  category: z.string().optional(),
});

export type WatchlistEntry = z.infer<typeof WatchlistEntrySchema>;

// Filter state
export const FilterStateSchema = z.object({
  decoded_only: z.boolean(),
  protocol_filter: z.string(), // "ALL" or specific protocol
  min_value: z.string().optional(),
  max_value: z.string().optional(),
  search_term: z.string().optional(),
});

export type FilterState = z.infer<typeof FilterStateSchema>;
