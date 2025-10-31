'use client';

import React from 'react';
import Table from './Table';
import { ethers } from 'ethers';

function fmt(num?: number | null, digits = 2): string {
  if (num === null || num === undefined || !Number.isFinite(num)) return '-';
  // At this point, num is guaranteed to be a finite number
  const validNum: number = num;
  if (Math.abs(validNum) >= 1000) return `${(validNum / 1_000).toFixed(digits)}k`;
  return validNum.toFixed(digits);
}

export default function Tokens() {
  const [selected, setSelected] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const deferredSearch = React.useDeferredValue(searchTerm);
  const [tokenTab, setTokenTab] = React.useState<'all' | 'v1' | 'v2' | 'v3'>('all');
  const itemsPerPage = 50;
  const [isPending, startTransition] = React.useTransition();

  const [data, setData] = React.useState<{ rows: any[]; total: number; pricedCount: number; countsByVersion: Record<'V1'|'V2'|'V3', number>; totalTokens: number }>({ rows: [], total: 0, pricedCount: 0, countsByVersion: { V1: 0, V2: 0, V3: 0 }, totalTokens: 0 });
  const [loading, setLoading] = React.useState(false);
  const apiBase = (process.env.NEXT_PUBLIC_UI_HTTP_URL as string) || 'http://localhost:3005';
  const abortRef = React.useRef<AbortController | null>(null);
  const [lastFetchTs, setLastFetchTs] = React.useState<number | null>(null);
  const [refreshTick, setRefreshTick] = React.useState(0);
  const AUTO_INTERVAL = 10; // seconds
  const [countdown, setCountdown] = React.useState(AUTO_INTERVAL);

  // Fetch server-side paginated tokens
  const refetch = React.useCallback(() => {
    setLoading(true);
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
    }
    const ac = new AbortController();
    abortRef.current = ac;
    const params = new URLSearchParams({ page: String(currentPage), limit: String(itemsPerPage), tab: tokenTab, q: deferredSearch, top: '1', sort: 'score' });
    fetch(`${apiBase}/api/tokens?${params.toString()}`, { signal: ac.signal })
      .then(r => r.json())
      .then(json => {
        setData({ rows: json.rows || [], total: json.total || 0, pricedCount: json.pricedCount || 0, countsByVersion: json.countsByVersion || { V1: 0, V2: 0, V3: 0 }, totalTokens: json.totalTokens || 0 });
        setLastFetchTs(Date.now());
        setCountdown(AUTO_INTERVAL);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [apiBase, currentPage, itemsPerPage, tokenTab, deferredSearch]);

  React.useEffect(() => { refetch(); }, [refetch]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          refetch();
          return AUTO_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [refetch]);

  // Reset to first page when search changes
  React.useEffect(() => {
    startTransition(() => setCurrentPage(1));
  }, [deferredSearch, tokenTab]);

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / itemsPerPage));

  console.log(data, "data")
  const columns = [
    { key: 'symbol', header: 'Token', render: (_: any, row: any) => {
      const addr = row.address;
      let short = '';
      try {
        if (addr && ethers.isAddress(addr)) {
          const c = ethers.getAddress(addr);
          short = `${c.slice(0,6)}…${c.slice(-4)}`;
        }
      } catch {}
      return (
        <div className="flex items-center gap-1">
          <span className="font-mono text-emerald-400">{row.symbol || '-'}</span>
          <span className="font-mono text-[9px] text-gray-600">{short}</span>
        </div>
      );
    } },
    // Show version column only in ALL tab
    ...(tokenTab === 'all' ? [{
      key: 'versions', header: 'Version', render: (_: any, row: any) => (
        <span className="font-mono text-[8px] text-sky-400">{row.versions || '-'}</span>
      )
    }] : []),
    { key: 'score', header: 'Score', render: (v: number, row: any) => (
      <span className="font-mono text-[9px] text-emerald-300">{fmt(v ?? 0, 0)}</span>
    )},
    { key: 'active', header: 'Active', render: (v: boolean) => (
      <span className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${
        v
          ? 'bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50'
          : 'bg-red-400'
      }`}>
        {v && <span className="text-xs text-black font-bold">●</span>}
      </span>
    ) },
    { key: 'price_usd', header: 'Price', render: (v: number) => `$${fmt(v, 4)}`, className: 'text-sky-400' },
    { key: 'change_24h', header: 'Change (%)', render: (v: number) => (
      <span className={v >= 0 ? 'text-emerald-400' : 'text-red-400'}>{v ? v.toFixed(2) : '-'}</span>
    )},
    { key: 'volume_24h_usd', header: 'Volume (24H)', render: (v: number) => `$${fmt(v)}` },
    { key: 'mcap_circ_usd', header: 'Circ MCap', render: (v: number) => `$${fmt(v)}` },
    { key: 'mcap_onchain_usd', header: 'Onchain MCap', render: (v: number) => `$${fmt(v)}` },
    { key: 'holders_est', header: 'Holders', render: (v: number) => v ? v.toLocaleString() : '-' },
    {
      key: 'heartbeat',
      header: 'Heartbeat',
      render: (_: any, row: any) => {
        const heartbeat = row.heartbeat;
        if (!heartbeat) {
          return <span className="text-gray-500">—</span>;
        }

        const isHealthy = heartbeat.status === 'healthy';
        const isStale = heartbeat.status === 'stale';

        return (
          <div className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isHealthy ? 'bg-green-400 animate-pulse' :
              isStale ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-xs text-gray-400">
              {heartbeat.provider?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="h-full">
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 text-[8px]">💹</span>
            <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">TOKENS</h2>
            <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700">
              {data.total} LISTED ({data.pricedCount} PRICED)
            </div>
            {lastFetchTs && (
              <div className="px-1 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700">
                last {new Date(lastFetchTs).toLocaleTimeString()} • auto {countdown}s
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="px-1 py-0.5 bg-gray-800 text-gray-300 text-[8px] font-mono border border-gray-700 hover:bg-gray-700"
              title="Refresh"
            >⟳</button>
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[8px] font-mono border border-gray-700 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Token Filter Tabs */}
      <div className="px-1.5 py-1 bg-black border-b border-gray-800">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 text-[8px] font-mono">🪙 TOKENS:</span>
          <button
            onClick={() => setTokenTab('all')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              tokenTab === 'all'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            ALL ({data.totalTokens})
          </button>
          <button
            onClick={() => setTokenTab('v1')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              tokenTab === 'v1'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            V1 ({data.countsByVersion.V1})
          </button>
          <button
            onClick={() => setTokenTab('v2')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              tokenTab === 'v2'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            V2 ({data.countsByVersion.V2})
          </button>
          <button
            onClick={() => setTokenTab('v3')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              tokenTab === 'v3'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            V3 ({data.countsByVersion.V3})
          </button>
        </div>
      </div>
      <div className="p-1.5">
        <Table
          data={data.rows}
          columns={columns}
          emptyMessage="[NO TOKEN DATA]"
          density="compact"
          onRowClick={(row: any) => setSelected(row.address)}
          loading={loading}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                onClick={() => startTransition(() => setCurrentPage(Math.max(1, currentPage - 1)))}
                disabled={currentPage === 1}
                className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                ‹
              </button>
              <span className="text-gray-400 text-[7px] font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => startTransition(() => setCurrentPage(Math.min(totalPages, currentPage + 1)))}
                disabled={currentPage === totalPages}
                className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                ›
              </button>
            </div>
            <div className="text-gray-500 text-[7px] font-mono">
              {(data.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, data.total)} of {data.total}
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-2 border border-gray-800 bg-black">
            <div className="px-2 py-1 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
              <span className="text-[8px] font-mono text-sky-400">POOLS FOR</span>
              <span className="text-[8px] font-mono text-emerald-400">{data.rows.find(r => r.address === selected)?.symbol}</span>
              <button className="ml-auto text-[8px] text-gray-500 hover:text-gray-300" onClick={() => setSelected(null)}>[close]</button>
            </div>
            <div className="p-1">
              <PoolsForToken token={selected} apiBase={apiBase} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



function PoolsForToken({ token, apiBase }: { token: string; apiBase: string }) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    if (!token) return;
    setLoading(true);
    if (abortRef.current) {
      try { abortRef.current.abort(); } catch {}
    }
    const ac = new AbortController();
    abortRef.current = ac;
    fetch(`${apiBase}/api/pools?token=${encodeURIComponent(token)}`, { signal: ac.signal })
      .then(r => r.json())
      .then(json => setRows(json.rows || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => { try { ac.abort(); } catch {} };
  }, [token, apiBase]);

  return (
    <Table
      data={rows}
      columns={[
        { key: 'dex', header: 'DEX' },
        { key: 'version', header: 'Ver' },
        { key: 'address', header: 'Pool', render: (v: string) => `${String(v).slice(0,6)}…${String(v).slice(-4)}` },
        { key: 'fee_bps', header: 'Fee (bps)', render: (v: number) => v ?? '-' },
        { key: 'tvl_usd', header: 'TVL', render: (v: number) => `$${fmt(v)}` },
        { key: 'volume_24h_usd', header: 'Vol 24H', render: (v: number) => `$${fmt(v)}` },
        { key: 'fees_24h_usd', header: 'Fees 24H', render: (v: number) => `$${fmt(v)}` },
        { key: 'utilization', header: 'Util', render: (v: number) => (v != null ? (v*100).toFixed(1)+'%' : '-') },
      ] as any}
      emptyMessage="[NO POOLS FOUND]"
      density="compact"
      loading={loading}
    />
  );
}
