'use client';

import useSWR from 'swr';
import { useState, useEffect, useCallback } from 'react';

export interface AmmStats {
  totalPools: number;
  activePools: number;
  totalVolume24h: number;
  totalLiquidity: number;
  totalSwaps24h: number;
}

export interface AmmPool {
  address: string;
  token0: string;
  token1: string;
  feeTier?: number;
  volume24hUSD: number;
  liquidityUSD: number;
  lastActivity?: string;
}

export interface PoolMetadata {
  poolAddress: string;
  chainId: number;
  protocol: string;
  factoryAddress: string;
  token0Address: string;
  token1Address: string;
  feeTier?: number;
  creationBlock: number;
  creationTimestamp: Date;
  status: string;
  lastActivityBlock?: number;
  lastActivityTimestamp?: Date;
  liquidityUSD?: number;
  volume24hUSD?: number;
}

export interface PoolEvent {
  poolAddress: string;
  eventType: string;
  blockNumber: number;
  logIndex: number;
  timestamp: Date;
  amount0: string;
  amount1: string;
  volumeUSD?: number;
  feeUSD?: number;
}

export interface PoolDetails {
  metadata: PoolMetadata;
  recentEvents: PoolEvent[];
  totalEvents: number;
}

export interface AmmHealth {
  latestBlock: number;
  lastIndexedBlock: number;
  lag: number;
  totalPools: number;
  activePools: number;
  totalEvents: number;
}

// Resolve API base (Node tracker HTTP server)
const API_BASE =
  (typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_TRACKER_HTTP_URL) ||
  (typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:${(typeof process !== 'undefined' && (process as any).env?.NEXT_PUBLIC_TRACKER_HTTP_PORT) || '3005'}`
    : 'http://127.0.0.1:3005');

function toApi(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

// SWR fetcher function
const fetcher = (url: string) => fetch(toApi(url)).then(res => {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
});

// Hook for AMM statistics with SWR
export function useAmmStats() {
  const { data: stats, error, isLoading, mutate } = useSWR<AmmStats>(
    '/api/amm/stats',
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    stats,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

// Hook for top AMM pools with SWR
export function useAmmPools(limit: number = 50) {
  const { data, error, isLoading, mutate } = useSWR<AmmPool[]>(
    `/api/amm/pools?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: false, // Don't refetch on focus for large datasets
      revalidateOnReconnect: true,
      dedupingInterval: 15000,
      errorRetryCount: 3,
      errorRetryInterval: 5000
    }
  );

  return {
    pools: Array.isArray(data) ? data : [],
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

// Hook for pool details with SWR
export function usePoolDetails(poolAddress: string | null) {
  const { data: details, error, isLoading, mutate } = useSWR<PoolDetails>(
    poolAddress ? `/api/amm/pool/${poolAddress}` : null,
    fetcher,
    {
      refreshInterval: 120000, // Refresh every 2 minutes for pool details
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 30000,
      errorRetryCount: 2,
      errorRetryInterval: 10000
    }
  );

  return {
    details,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}

// Hook for AMM health metrics with SWR
export function useAmmHealth() {
  const { data: health, error, isLoading, mutate } = useSWR<AmmHealth>(
    '/api/amm/health',
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds for health metrics
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
      errorRetryCount: 3,
      errorRetryInterval: 2000
    }
  );

  return {
    health,
    loading: isLoading,
    error: error?.message || null,
    refetch: mutate
  };
}
