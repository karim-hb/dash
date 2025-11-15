'use client';

import { useEffect, useMemo, useState } from 'react';

import Table from '../../components/Table';

const API_BASE = 'http://127.0.0.1:3000';

interface FlashloanRecord {
  protocol?: string;
  asset?: string;
  amount?: number | string;
  fee?: number | string;
  blockNumber?: number;
  txHash?: string;
  timestamp?: number | string;
}

interface LendingMarket {
  protocol?: string;
  market?: string;
  totalSupplyUsd?: number;
  totalBorrowUsd?: number;
  supplyApy?: number;
  borrowApy?: number;
}

interface LendingRate {
  protocol?: string;
  market?: string;
  supplyApy?: number;
  borrowApy?: number;
  updatedAt?: string | number;
}

interface FarmingPool {
  protocol?: string;
  pool?: string;
  tvlUsd?: number;
  rewardToken?: string;
  apr?: number;
}

interface FarmingEvent {
  protocol?: string;
  pool?: string;
  action?: string;
  user?: string;
  amountUsd?: number;
  timestamp?: number;
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

function formatUsd(value?: number | string | null) {
  if (value == null) return '—';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return '—';
  if (Math.abs(numeric) < 1) return `$${numeric.toFixed(4)}`;
  return `$${numeric.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function formatPercentage(value?: number | string | null) {
  if (value == null) return '—';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return '—';
  return `${numeric.toFixed(2)}%`;
}

export default function DeFiTab() {
  const [flashloans, setFlashloans] = useState<FetchStatus<FlashloanRecord[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [lendingMarkets, setLendingMarkets] = useState<FetchStatus<LendingMarket[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [lendingRates, setLendingRates] = useState<FetchStatus<LendingRate[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [farmingPools, setFarmingPools] = useState<FetchStatus<FarmingPool[]>>({
    data: [],
    loading: true,
    error: null,
  });
  const [farmingEvents, setFarmingEvents] = useState<FetchStatus<FarmingEvent[]>>({
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [
          flashloanData,
          marketsData,
          ratesData,
          poolsData,
          farmingEventsData,
        ] = await Promise.all([
          fetchJson<FlashloanRecord[]>('/flashloans'),
          fetchJson<LendingMarket[]>('/lending/markets'),
          fetchJson<LendingRate[]>('/lending/rates'),
          fetchJson<FarmingPool[]>('/farming/pools'),
          fetchJson<FarmingEvent[]>('/farming/events'),
        ]);
        if (cancelled) return;
        console.log('DeFiTab payloads', {
          flashloanCount: flashloanData?.length ?? 0,
          lendingMarketCount: marketsData?.length ?? 0,
          lendingRateCount: ratesData?.length ?? 0,
          farmingPoolCount: poolsData?.length ?? 0,
          farmingEventCount: farmingEventsData?.length ?? 0,
          sampleMarket: marketsData?.[0] ?? null,
        });

        setFlashloans({ data: flashloanData ?? [], loading: false, error: null });
        setLendingMarkets({ data: marketsData ?? [], loading: false, error: null });
        setLendingRates({ data: ratesData ?? [], loading: false, error: null });
        setFarmingPools({ data: poolsData ?? [], loading: false, error: null });
        setFarmingEvents({ data: farmingEventsData ?? [], loading: false, error: null });
      } catch (error) {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : 'Unknown error';
        setFlashloans((prev) => ({ ...prev, loading: false, error: message }));
        setLendingMarkets((prev) => ({ ...prev, loading: false, error: message }));
        setLendingRates((prev) => ({ ...prev, loading: false, error: message }));
        setFarmingPools((prev) => ({ ...prev, loading: false, error: message }));
        setFarmingEvents((prev) => ({ ...prev, loading: false, error: message }));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const flashloanColumns = useMemo(
    () => [
      {
        key: 'protocol',
        header: 'Protocol',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'asset',
        header: 'Asset',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (value: number | string | undefined) => {
          if (value == null) return '—';
          const numeric = typeof value === 'number' ? value : Number(value);
          if (!Number.isFinite(numeric)) return value;
          if (Math.abs(numeric) >= 1) return numeric.toLocaleString(undefined, { maximumFractionDigits: 2 });
          return numeric.toFixed(6);
        },
        className: 'text-right',
      },
      {
        key: 'fee',
        header: 'Fee',
        render: (value: number | string | undefined) => {
          if (value == null) return '—';
          const numeric = typeof value === 'number' ? value : Number(value);
          if (!Number.isFinite(numeric)) return value;
          return numeric.toFixed(4);
        },
        className: 'text-right',
      },
      {
        key: 'timestamp',
        header: 'Timestamp',
        render: (value: number | string | undefined) => {
          if (value == null) return '—';
          const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value);
          return date.toLocaleString(undefined, { hour12: false });
        },
      },
    ],
    []
  );

  const lendingColumns = useMemo(
    () => [
      {
        key: 'market',
        header: 'Market',
        render: (_: unknown, row: LendingMarket) => (
          <div className="flex flex-col">
            <span className="text-[#C9D1D9] font-semibold">{row.market ?? '—'}</span>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-[0.3em]">
              {row.protocol ?? 'unknown'}
            </span>
          </div>
        ),
      },
      {
        key: 'totalSupplyUsd',
        header: 'Supply',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'totalBorrowUsd',
        header: 'Borrow',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'supplyApy',
        header: 'Supply APY',
        render: (value: number | undefined) => formatPercentage(value),
        className: 'text-right',
      },
      {
        key: 'borrowApy',
        header: 'Borrow APY',
        render: (value: number | undefined) => formatPercentage(value),
        className: 'text-right',
      },
    ],
    []
  );

  const farmingColumns = useMemo(
    () => [
      {
        key: 'pool',
        header: 'Pool',
        render: (_: unknown, row: FarmingPool) => (
          <div className="flex flex-col">
            <span className="text-[#C9D1D9] font-semibold">{row.pool ?? '—'}</span>
            <span className="text-[10px] text-[#8B949E] uppercase tracking-[0.3em]">
              {row.protocol ?? 'unknown'}
            </span>
          </div>
        ),
      },
      {
        key: 'tvlUsd',
        header: 'TVL',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'rewardToken',
        header: 'Reward',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'apr',
        header: 'APR',
        render: (value: number | undefined) => formatPercentage(value),
        className: 'text-right',
      },
    ],
    []
  );

  const farmingEventColumns = useMemo(
    () => [
      {
        key: 'action',
        header: 'Action',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'protocol',
        header: 'Protocol',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'pool',
        header: 'Pool',
        render: (value: string | undefined) => value ?? '—',
      },
      {
        key: 'amountUsd',
        header: 'Amount',
        render: (value: number | undefined) => formatUsd(value),
        className: 'text-right',
      },
      {
        key: 'timestamp',
        header: 'Timestamp',
        render: (value: number | undefined) => (value ? new Date(value * 1000).toLocaleString(undefined, { hour12: false }) : '—'),
      },
    ],
    []
  );

  const flashloanProtocolCount = useMemo(() => {
    const unique = new Set<string>();
    flashloans.data.forEach((item) => {
      if (item.protocol) unique.add(item.protocol);
    });
    return unique.size;
  }, [flashloans.data]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <MetricCard
          label="Flashloan protocols"
          value={flashloanProtocolCount}
          loading={flashloans.loading}
          error={flashloans.error}
        />
        <MetricCard
          label="Lending markets"
          value={lendingMarkets.data.length}
          loading={lendingMarkets.loading}
          error={lendingMarkets.error}
        />
        <MetricCard
          label="Farming pools"
          value={farmingPools.data.length}
          loading={farmingPools.loading}
          error={farmingPools.error}
        />
      </div>

      <SectionCard
        title="Flashloan Activity"
        description="Recent aggregated flashloan executions across supported protocols."
        status={flashloans}
      >
        <Table
          data={flashloans.data.slice(0, 12)}
          columns={flashloanColumns}
          density="compact"
          emptyMessage={flashloans.loading ? '[LOADING FLASHLOANS…]' : '[NO FLASHLOANS FOUND]'}
        />
      </SectionCard>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard
          title="Lending Markets"
          description="Aggregated lending supply and borrow metrics."
          status={lendingMarkets}
        >
          <Table
            data={lendingMarkets.data.slice(0, 15)}
            columns={lendingColumns}
            density="compact"
            emptyMessage={lendingMarkets.loading ? '[LOADING MARKETS…]' : '[NO LENDING MARKETS FOUND]'}
          />
        </SectionCard>

        <SectionCard
          title="Lending Rates"
          description="Latest supply and borrow APYs from supported protocols."
          status={lendingRates}
        >
          <div className="space-y-3">
            {lendingRates.loading && <Placeholder text="Loading lending rates…" />}
            {lendingRates.error && <ErrorBanner message={lendingRates.error} />}
            {!lendingRates.loading && !lendingRates.error && lendingRates.data.length === 0 && (
              <Placeholder text="No lending rate data available." />
            )}
            {!lendingRates.loading && !lendingRates.error && lendingRates.data.length > 0 && (
              <div className="space-y-2 max-h-72 overflow-y-auto custom-scroll pr-1">
                {lendingRates.data.slice(0, 18).map((rate, index) => (
                  <div
                    key={`${rate.protocol}-${rate.market}-${index}`}
                    className="p-3 rounded border border-[#1F2A3A] bg-[#111C2B]"
                  >
                    <div className="flex items-center justify-between text-xs text-[#C9D1D9]">
                      <span className="font-semibold">{rate.market ?? '—'}</span>
                      <span className="text-[10px] text-[#8B949E] uppercase tracking-[0.3em]">
                        {rate.protocol ?? 'unknown'}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#8B949E]">
                      <div>
                        <span className="text-[#C9D1D9] font-semibold">Supply APY:</span>{' '}
                        {formatPercentage(rate.supplyApy)}
                      </div>
                      <div>
                        <span className="text-[#C9D1D9] font-semibold">Borrow APY:</span>{' '}
                        {formatPercentage(rate.borrowApy)}
                      </div>
                      <div className="col-span-2 text-[10px]">
                        Updated:{' '}
                        {rate.updatedAt
                          ? new Date(Number(rate.updatedAt) * (Number(rate.updatedAt) > 1e12 ? 1 : 1000)).toLocaleString(
                              undefined,
                              { hour12: false }
                            )
                          : '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard
          title="Yield Farming Pools"
          description="Tracked MasterChef and incentive programs."
          status={farmingPools}
        >
          <Table
            data={farmingPools.data.slice(0, 15)}
            columns={farmingColumns}
            density="compact"
            emptyMessage={farmingPools.loading ? '[LOADING FARMING POOLS…]' : '[NO FARMING POOLS FOUND]'}
          />
        </SectionCard>

        <SectionCard
          title="Farming Events"
          description="Latest deposits, harvests, and withdrawals."
          status={farmingEvents}
        >
          <Table
            data={farmingEvents.data.slice(0, 12)}
            columns={farmingEventColumns}
            density="compact"
            emptyMessage={farmingEvents.loading ? '[LOADING EVENTS…]' : '[NO FARMING EVENTS FOUND]'}
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

