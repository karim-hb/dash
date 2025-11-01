
'use client';

import React from 'react';
import Table from './Table';
import { ethers } from 'ethers';
import { useWsSnapshot } from '../hooks/useWsSnapshot';

function fmt(num?: number | null, digits = 2): string {
  if (num === null || num === undefined || !Number.isFinite(num)) return '-';
  // At this point, num is guaranteed to be a finite number
  const validNum: number = num;
  if (Math.abs(validNum) >= 1000) return `${(validNum / 1_000).toFixed(digits)}k`;
  return validNum.toFixed(digits);
}

export default function Tokens() {
  const { snapshot, connected } = useWsSnapshot();
  const [selected, setSelected] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [tokenTab, setTokenTab] = React.useState<'all' | 'v1' | 'v2' | 'v3' | 'v4'>('all');
  const itemsPerPage = 50;
  const [isPending, startTransition] = React.useTransition();
  const searchInputId = React.useId();
  const deferredSearch = React.useDeferredValue(searchTerm);
  const apiBase = (process.env.NEXT_PUBLIC_UI_HTTP_URL as string) || 'http://localhost:3005';
  const tokens = snapshot?.tokens ?? [];
  const pools = snapshot?.pools ?? [];
  const deferredTokens = React.useDeferredValue(tokens);
  const deferredPools = React.useDeferredValue(pools);

  // Sorting configuration
  const FREEZE_MS = Number(process.env.NEXT_PUBLIC_SORT_FREEZE_MS || '3600000'); // default 1h
  const pinTokens = (process.env.NEXT_PUBLIC_PIN_TOKENS || 'ETH,USDT,USDC')
    .split(',')
    .map(s => s.trim().toUpperCase())
    .filter(Boolean);
  const freezeUntilRef = React.useRef<number>(0);
  const orderRef = React.useRef<string[]>([]);

  const derived = React.useMemo(() => {
    const countsByVersion: Record<'V1' | 'V2' | 'V3' | 'V4', number> = { V1: 0, V2: 0, V3: 0, V4: 0 };
    const versionMap = new Map<string, Set<string>>();

    for (const pool of deferredPools) {
      if (!pool) continue;
      const version = (pool.version || '').toUpperCase();
      if (!version) continue;
      const token0 = (pool.token0 || '').toLowerCase();
      const token1 = (pool.token1 || '').toLowerCase();
      if (token0) {
        const set = versionMap.get(token0) ?? new Set<string>();
        set.add(version);
        versionMap.set(token0, set);
      }
      if (token1) {
        const set = versionMap.get(token1) ?? new Set<string>();
        set.add(version);
        versionMap.set(token1, set);
      }
    }

    const enriched = deferredTokens.map(token => {
      const addrLower = (token.address || '').toLowerCase();
      const versionSet = versionMap.get(addrLower) ?? new Set<string>();
      const versionKeys = Array.from(versionSet).map(v => v.toUpperCase());
      const uniqueVersionKeys = Array.from(new Set(versionKeys));
      uniqueVersionKeys.forEach(key => {
        if (key === 'V1' || key === 'V2' || key === 'V3' || key === 'V4') countsByVersion[key] += 1;
      });

      const versionLabel = uniqueVersionKeys.length ? uniqueVersionKeys.join('/') : '—';
      const liq = token.liquidity_usd ?? 0;
      const vol = token.volume_24h_usd ?? 0;
      const mcap = token.mcap_onchain_usd ?? 0;
      const score = liq * 0.6 + vol * 0.3 + mcap * 0.1;

      return {
        ...token,
        score,
        versionKeys: uniqueVersionKeys,
        versionLabel,
        active: Boolean((token as any).active || token.heartbeat?.status === 'healthy'),
      };
    });

    const pricedCount = enriched.reduce((acc, row) => {
      const price = row.price_usd;
      return acc + (price !== null && price !== undefined && Number.isFinite(price) ? 1 : 0);
    }, 0);

    const totalTokens = deferredTokens.length;
    const searchLower = deferredSearch.trim().toLowerCase();

    let filtered = enriched;
    if (searchLower) {
      filtered = filtered.filter(row => {
        const symbol = (row.symbol || '').toLowerCase();
        const address = (row.address || '').toLowerCase();
        const version = (row.versionLabel || '').toLowerCase();
        const primaryPool = (row.primary_pool || '').toLowerCase();
        const heartbeatProvider = (row.heartbeat?.provider || '').toLowerCase();
        return (
          symbol.includes(searchLower) ||
          address.includes(searchLower) ||
          version.includes(searchLower) ||
          primaryPool.includes(searchLower) ||
          heartbeatProvider.includes(searchLower)
        );
      });
    }

    if (tokenTab !== 'all') {
      const key = tokenTab.toUpperCase();
      filtered = filtered.filter(row => row.versionKeys.includes(key));
    }

    const now = Date.now();
    const pinRank = (row: any) => {
      const sym = (row.symbol || '').toUpperCase();
      const idx = pinTokens.indexOf(sym);
      return idx === -1 ? Number.POSITIVE_INFINITY : idx;
    };

    let sorted: any[];
    if (orderRef.current.length && now < freezeUntilRef.current) {
      const byAddr = new Map<string, any>(filtered.map(r => [String(r.address).toLowerCase(), r]));
      const preserved = orderRef.current
        .map(addr => byAddr.get(String(addr).toLowerCase()))
        .filter(Boolean) as any[];
      const rest = filtered.filter(r => !orderRef.current.includes(r.address as string));
      rest.sort((a, b) => {
        const pa = pinRank(a), pb = pinRank(b);
        if (pa !== pb) return pa - pb;
        return (b.score ?? 0) - (a.score ?? 0);
      });
      sorted = preserved.concat(rest);
    } else {
      sorted = filtered.slice().sort((a, b) => {
        const pa = pinRank(a), pb = pinRank(b);
        if (pa !== pb) return pa - pb;
        return (b.score ?? 0) - (a.score ?? 0);
      });
      orderRef.current = sorted.map(r => r.address as string);
      freezeUntilRef.current = now + FREEZE_MS;
    }
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const safePage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (safePage - 1) * itemsPerPage;
    const rows = sorted.slice(start, start + itemsPerPage);

    return {
      rows,
      total,
      totalPages,
      pricedCount,
      countsByVersion,
      totalTokens,
      sortedRows: sorted,
    };
  }, [deferredPools, deferredTokens, deferredSearch, tokenTab, currentPage, itemsPerPage]);

  React.useEffect(() => {
    startTransition(() => setCurrentPage(1));
  }, [deferredSearch, tokenTab, deferredTokens.length]);

  React.useEffect(() => {
    if (currentPage > derived.totalPages) {
      startTransition(() => setCurrentPage(derived.totalPages));
    }
  }, [currentPage, derived.totalPages]);

  React.useEffect(() => {
    if (!selected) return;
    const stillExists = derived.sortedRows.some(row => row.address === selected);
    if (!stillExists) {
      setSelected(null);
    }
  }, [selected, derived.sortedRows]);

  const selectedRow = React.useMemo(
    () => (selected ? derived.sortedRows.find(row => row.address === selected) ?? null : null),
    [derived.sortedRows, selected]
  );

  const totalPages = derived.totalPages;
  const loading = !snapshot;
  const lastUpdatedLabel = React.useMemo(() => (snapshot ? new Date(snapshot.timestamp).toLocaleTimeString() : null), [snapshot?.timestamp]);

  const columns = [
    { key: 'symbol', header: 'TOKEN', render: (_: any, row: any) => {
      const addr = row.address;
      let short = '';
      try {
        if (addr && ethers.isAddress(addr)) {
          const c = ethers.getAddress(addr);
          short = `${c.slice(0,6)}…${c.slice(-4)}`;
        }
      } catch {}
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-white">{row.symbol || '-'}</span>
          <span className="font-mono text-[8px] text-gray-500">{short}</span>
        </div>
      );
    }, className: 'font-mono' },
    // Show version column only in ALL tab
    ...(tokenTab === 'all' ? [{
      key: 'versions', header: 'VER', render: (_: any, row: any) => (
        <span className="font-mono text-[9px] text-yellow-400">{row.versionLabel || '-'}</span>
      )
    }] : []),
    { key: 'active', header: 'STS', render: (v: boolean) => (
      <span className={`inline-flex items-center justify-center w-3 h-3 rounded-full ${
        v ? 'bg-[#00FF66] shadow-[0_0_4px_rgba(0,255,102,0.5)]' : 'bg-[#F85149]'
      }`}>
        {v && <span className="text-[10px] text-[#0D1117] font-bold">●</span>}
      </span>
    ), className: 'text-center' },
    { key: 'price_usd', header: 'PRICE', render: (v: number) => `$${fmt(v, 4)}`, className: 'text-[#00FF66] font-mono font-semibold' },
    { key: 'change_24h', header: 'CHG %', render: (v: number) => (
      <span className={`font-mono text-[10px] font-semibold ${v >= 0 ? 'text-[#00FF66]' : 'text-[#F85149]'}`}>
        {v ? `${v >= 0 ? '+' : ''}${v.toFixed(2)}%` : '-'}
      </span>
    )},
    { key: 'volume_24h_usd', header: 'VOL 24H', render: (v: number) => (
      <span className="font-mono text-[10px] text-[#58A6FF]">{v ? fmt(v) : '-'}</span>
    ) },
    { key: 'mcap_circ_usd', header: 'MCAP', render: (v: number) => (
      <span className="font-mono text-[10px] text-[#A371F7]">{v ? fmt(v) : '-'}</span>
    ) },
    { key: 'holders_est', header: 'HLDRS', render: (v: number) => (
      <span className="font-mono text-[9px] text-[#FFA657]">{v ? v.toLocaleString() : '-'}</span>
    ) },
    {
      key: 'heartbeat',
      header: 'SRC',
      render: (_: any, row: any) => {
        const heartbeat = row.heartbeat;
        if (!heartbeat) {
          return <span className="font-mono text-[8px] text-gray-600">—</span>;
        }

        const isHealthy = heartbeat.status === 'healthy';
        const isStale = heartbeat.status === 'stale';

        return (
          <div className="flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${
              isHealthy ? 'bg-[#00FF66] shadow-[0_0_4px_rgba(0,255,102,0.5)]' :
              isStale ? 'bg-[#FFA657]' : 'bg-[#F85149]'
            }`} />
            <span className="font-mono text-[8px] text-[#8B949E]">
              {heartbeat.provider?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="h-full bg-[#0D1117]">
      <div className="bg-[#161B22] border-b-2 border-[#0066FF] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#0066FF] shadow-[0_0_6px_rgba(0,102,255,0.5)]"></div>
            <h2 className="font-mono text-[13px] font-bold uppercase tracking-widest text-[#0066FF]">TOKENS</h2>
            <div className="px-3 py-1.5 bg-[#21262D] text-[#C9D1D9] text-[9px] font-mono border border-[#30363D] rounded">
              {derived.total} LISTED ({derived.pricedCount} PRICED)
            </div>
            <div className={`px-3 py-1.5 text-[9px] font-mono border rounded ${
              connected 
                ? 'bg-[#0066FF]/20 text-[#00FF66] border-[#0066FF] shadow-[0_0_4px_rgba(0,102,255,0.3)]' 
                : 'bg-[#F85149]/20 text-[#F85149] border-[#F85149]'
            }`}>
              {connected ? '●' : '○'} WS {connected ? 'LIVE' : 'OFFLINE'}
            </div>
            {lastUpdatedLabel && (
              <div className="px-3 py-1.5 bg-[#21262D] text-[#8B949E] text-[9px] font-mono border border-[#30363D] rounded">
                {lastUpdatedLabel}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => startTransition(() => setCurrentPage(1))}
              disabled={isPending}
              className="px-2 py-1 bg-[#21262D] text-[#C9D1D9] text-[9px] font-mono border border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              title="Reset to first page"
            >⟳</button>
            <label htmlFor={searchInputId} className="sr-only">Search tokens</label>
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              id={searchInputId}
              className="px-3 py-1.5 bg-[#0D1117] text-[#C9D1D9] text-[9px] font-mono border border-[#30363D] focus:border-[#0066FF] focus:outline-none focus:ring-1 focus:ring-[#0066FF]/50 rounded transition-all"
            />
          </div>
        </div>
      </div>

      {/* Token Filter Tabs */}
      <div className="px-4 py-2.5 bg-[#161B22] border-b border-[#21262D]">
        <div className="flex items-center gap-2">
          <span className="text-[#0066FF] text-[10px] font-mono font-bold">FLT:</span>
          <button
            onClick={() => startTransition(() => setTokenTab('all'))}
            disabled={isPending}
            className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
              tokenTab === 'all'
                ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            ALL ({derived.totalTokens})
          </button>
          <button
            onClick={() => startTransition(() => setTokenTab('v1'))}
            disabled={isPending}
            className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
              tokenTab === 'v1'
                ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            V1 ({derived.countsByVersion.V1})
          </button>
          <button
            onClick={() => startTransition(() => setTokenTab('v2'))}
            disabled={isPending}
            className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
              tokenTab === 'v2'
                ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            V2 ({derived.countsByVersion.V2})
          </button>
          <button
            onClick={() => startTransition(() => setTokenTab('v3'))}
            disabled={isPending}
            className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
              tokenTab === 'v3'
                ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            V3 ({derived.countsByVersion.V3})
          </button>
          <button
            onClick={() => startTransition(() => setTokenTab('v4'))}
            disabled={isPending}
            className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
              tokenTab === 'v4'
                ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            V4 ({derived.countsByVersion.V4})
          </button>
        </div>
      </div>
      <div className="p-1.5">
        <Table
          data={derived.rows}
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
                disabled={currentPage === 1 || isPending}
                className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                ‹
              </button>
              <span className="text-gray-400 text-[7px] font-mono px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => startTransition(() => setCurrentPage(Math.min(totalPages, currentPage + 1)))}
                disabled={currentPage === totalPages || isPending}
                className="px-2 py-0.5 bg-gray-800 text-gray-300 text-[7px] font-mono border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
              >
                ›
              </button>
            </div>
            <div className="text-gray-500 text-[7px] font-mono">
              {(derived.total === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1)}-{Math.min(currentPage * itemsPerPage, derived.total)} of {derived.total}
            </div>
          </div>
        )}

        {selected && (
          <div className="mt-2 border border-gray-800 bg-black">
            <div className="px-2 py-1 bg-gray-900 border-b border-gray-800 flex items-center gap-2">
              <span className="text-[8px] font-mono text-sky-400">POOLS FOR</span>
              <span className="text-[8px] font-mono text-emerald-400">{selectedRow?.symbol}</span>
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
