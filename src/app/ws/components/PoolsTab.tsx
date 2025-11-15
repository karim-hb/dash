'use client';

import { useEffect, useMemo, useState } from 'react';

import Table from '../../components/Table';

const API_BASE = 'http://127.0.0.1:3000';

interface PairEntry {
  address?: string;
  token0?: string;
  token1?: string;
  volume24hUsd?: number;
  liquidityUsd?: number;
  fee?: number;
  protocol?: string;
}

interface PoolEntry {
  address?: string;
  token0?: string;
  token1?: string;
  tvlUsd?: number;
  apr?: number;
  volume24hUsd?: number;
  protocol?: string;
}

interface VolumeEntry {
  address?: string;
  window?: string;
  volumeUsd?: number;
  protocol?: string;
}

interface TvlEntry {
  protocol?: string;
  tvlUsd?: number;
  change24h?: number;
}

type FetchStatus<T> = {
  data: T;
  loading: boolean;
  error: string | null;
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

function short(address?: string) {
  if (!address) return '—';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatUsd(value?: number | null) {
  if (value == null) return '—';
  if (!Number.isFinite(value)) return '—';
  if (Math.abs(value) < 1) return `$${value.toFixed(4)}`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPercent(value?: number | null) {
  if (value == null) return '—';
  if (!Number.isFinite(value)) return '—';
  return `${value.toFixed(2)}%`;
}

export default function PoolsTab() {
  const [pairs, setPairs] = useState<FetchStatus<PairEntry[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [pools, setPools] = useState<FetchStatus<PoolEntry[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [volumes, setVolumes] = useState<FetchStatus<VolumeEntry[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [tvl, setTvl] = useState<FetchStatus<TvlEntry[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [pairsData, poolsData, volumesData, tvlData] = await Promise.all([
          fetchJson<PairEntry[]>('/pairs'),
          fetchJson<PoolEntry[]>('/pools'),
          fetchJson<VolumeEntry[]>('/volumes?window=day'),
          fetchJson<TvlEntry[]>('/tvl'),
        ]);
        if (cancelled) return;
        console.log('PoolsTab payloads', {
          pairCount: pairsData?.length ?? 0,
          poolCount: poolsData?.length ?? 0,
          volumeSamples: volumesData?.length ?? 0,
          tvlProtocols: tvlData?.length ?? 0,
          samplePair: pairsData?.[0] ?? null,
        });
        setPairs({ data: pairsData ?? [], loading: false, error: null });
        setPools({ data: poolsData ?? [], loading: false, error: null });
        setVolumes({ data: volumesData ?? [], loading: false, error: null });
        setTvl({ data: tvlData ?? [], loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unknown error';
        setPairs((prev) => ({ ...prev, loading: false, error: message }));
        setPools((prev) => ({ ...prev, loading: false, error: message }));
        setVolumes((prev) => ({ ...prev, loading: false, error: message }));
        setTvl((prev) => ({ ...prev, loading: false, error: message }));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const topProtocols = useMemo(() => {
    if (tvl.loading || tvl.error || !tvl.data.length) return [];
    return [...tvl.data]
      .sort((a, b) => (b.tvlUsd ?? 0) - (a.tvlUsd ?? 0))
      .slice(0, 6);
  }, [tvl]);

  const pairColumns = useMemo(
    () => [
      {
        key: 'pair',
        header: 'Pair',
        render: (_: unknown, row: PairEntry) => (
          <div className="flex flex-col">
            <span className="text-[#C9D1D9] font-semibold">
              {row.token0 ?? '—'}/{row.token1 ?? '—'}
            </span>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-[0.3em]">{row.protocol ?? 'unknown'}</span>
          </div>
        ),
      },
      {
        key: 'address',
        header: 'Address',
        render: (value: string | undefined) => (
          <span className="font-mono text-[#58A6FF]">{short(value)}</span>
        ),
      },
      {
        key: 'volume24hUsd',
        header: 'Volume 24h',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'liquidityUsd',
        header: 'Liquidity',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'fee',
        header: 'Fee',
        render: (value: number | undefined) => (value != null ? `${value.toFixed(2)} bps` : '—'),
        className: 'text-right',
      },
    ],
    []
  );

  const poolColumns = useMemo(
    () => [
      {
        key: 'pool',
        header: 'Pool',
        render: (_: unknown, row: PoolEntry) => (
          <div className="flex flex-col">
            <span className="text-[#C9D1D9] font-semibold">
              {row.token0 ?? '—'}/{row.token1 ?? '—'}
            </span>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-[0.3em]">{row.protocol ?? 'unknown'}</span>
          </div>
        ),
      },
      {
        key: 'address',
        header: 'Address',
        render: (value: string | undefined) => (
          <span className="font-mono text-[#58A6FF]">{short(value)}</span>
        ),
      },
      {
        key: 'tvlUsd',
        header: 'TVL',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'apr',
        header: 'APR',
        render: (value: number | undefined) => formatPercent(value),
        className: 'text-right',
      },
      {
        key: 'volume24hUsd',
        header: 'Volume 24h',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
    ],
    []
  );

  const volumeColumns = useMemo(
    () => [
      {
        key: 'protocol',
        header: 'Protocol',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'address',
        header: 'Pool',
        render: (value: string | undefined) => (value ? short(value) : '—'),
        className: 'font-mono text-[#58A6FF]',
      },
      {
        key: 'volumeUsd',
        header: 'Volume',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'window',
        header: 'Window',
        render: (value: string | undefined) => value ?? '—',
        className: 'text-right',
      },
    ],
    []
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          label="Tracked pairs"
          value={pairs.data.length}
          loading={pairs.loading}
          error={pairs.error}
        />
        <MetricCard
          label="Tracked pools"
          value={pools.data.length}
          loading={pools.loading}
          error={pools.error}
        />
        <MetricCard
          label="Volume samples"
          value={volumes.data.length}
          loading={volumes.loading}
          error={volumes.error}
        />
        <MetricCard
          label="Protocols w/ TVL"
          value={tvl.data.length}
          loading={tvl.loading}
          error={tvl.error}
        />
      </div>

      <SectionCard
        title="DEX Liquidity Leaders"
        description="Top protocols by total value locked."
        status={tvl}
      >
        {tvl.loading && <Placeholder text="Loading TVL snapshots…" />}
        {tvl.error && <ErrorBanner message={tvl.error} />}
        {!tvl.loading && !tvl.error && topProtocols.length === 0 && (
          <Placeholder text="No TVL data available." />
        )}
        {!tvl.loading && !tvl.error && topProtocols.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {topProtocols.map((entry) => (
              <div key={entry.protocol} className="p-3 rounded border border-[#1F2A3A] bg-[#111C2B]">
                <div className="text-xs uppercase tracking-[0.3em] text-[#8B949E]">{entry.protocol ?? 'unknown'}</div>
                <div className="text-2xl font-bold text-[#C9D1D9] mt-2">{formatUsd(entry.tvlUsd ?? 0)}</div>
                <div className="text-[11px] text-[#8B949E] mt-2">
                  24h: <span className={entry.change24h && entry.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {formatPercent(entry.change24h ?? 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Top Pairs"
        description="High impact trading pairs across supported DEXs."
        status={pairs}
      >
        <Table
          data={pairs.data.slice(0, 20)}
          columns={pairColumns}
          density="compact"
          emptyMessage={pairs.loading ? '[LOADING PAIRS…]' : '[NO PAIRS AVAILABLE]'}
        />
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard
          title="Yield Pools"
          description="Tracked AMM pools with yield signal."
          status={pools}
        >
          <Table
            data={pools.data.slice(0, 20)}
            columns={poolColumns}
            density="compact"
            emptyMessage={pools.loading ? '[LOADING POOLS…]' : '[NO POOLS AVAILABLE]'}
          />
        </SectionCard>

        <SectionCard
          title="Volume Highlights"
          description="Recent liquidity usage across the network."
          status={volumes}
        >
          <Table
            data={volumes.data.slice(0, 20)}
            columns={volumeColumns}
            density="compact"
            emptyMessage={volumes.loading ? '[LOADING VOLUMES…]' : '[NO VOLUME DATA]'}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: number;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="p-4 rounded border border-[#21262D] bg-[#0D1117] shadow-sm shadow-black/10">
      <div className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-2">{label}</div>
      {loading ? (
        <div className="text-sm text-[#8B949E]">Loading…</div>
      ) : error ? (
        <div className="text-sm text-rose-400">{error}</div>
      ) : (
        <div className="text-3xl font-bold text-[#C9D1D9]">{value}</div>
      )}
    </div>
  );
}

function SectionCard<T>({
  title,
  description,
  status,
  children,
}: {
  title: string;
  description: string;
  status: FetchStatus<T>;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded border border-[#21262D] bg-[#0D1117] shadow-lg shadow-black/15">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-1">{title}</h3>
          <p className="text-[11px] text-[#8B949E]">{description}</p>
        </div>
        {status.loading && <span className="text-[10px] text-[#58A6FF]">Loading…</span>}
        {status.error && !status.loading && <span className="text-[10px] text-rose-400">{status.error}</span>}
      </div>
      {children}
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return <div className="text-sm text-[#8B949E]">{text}</div>;
}

function ErrorBanner({ message }: { message: string }) {
  return <div className="text-sm text-rose-400">Error: {message}</div>;
}

