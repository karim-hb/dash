'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Table from './Table';

function ago(ts?: number | null) {
  if (!ts) return '-';
  const d = Math.max(0, (Date.now() - ts) / 1000);
  return `${d.toFixed(0)}s`;
}

export default function Oracles() {
  const { snapshot } = useWsSnapshot();
  const rows = snapshot?.oracles || [];

  const columns = [
    { key: 'provider', header: 'Provider', className: 'font-mono text-emerald-400' },
    { key: 'pair', header: 'Pair' },
    { key: 'price_usd', header: 'Price', render: (v: number) => v != null ? `$${v.toFixed(4)}` : '-' },
    { key: 'last_updated', header: 'Last Update', render: (v: number) => ago(v) },
    { key: 'heartbeat_sec', header: 'Heartbeat', render: (v: number) => v ? `${v}s` : '-' },
    { key: 'status', header: 'Status', render: (v: string) => (
      <span className={v === 'healthy' ? 'text-emerald-400' : v === 'stale' ? 'text-amber-400' : 'text-red-400'}>{v || '-'}</span>
    )},
    { key: 'deviation_vs_spot_pct', header: 'Dev vs DEX', render: (v: number) => v != null ? `${v.toFixed(2)}%` : '-' },
  ];

  return (
    <div className="h-full">
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center gap-1">
          <span className="text-amber-400 text-[8px]">🛰️</span>
          <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">ORACLES</h2>
          <div className="px-1 py-0.5 bg-amber-900 text-amber-300 text-[7px] font-mono border border-amber-700">{rows.length} FEEDS</div>
        </div>
      </div>
      <div className="p-1.5">
        <Table data={rows} columns={columns} emptyMessage="[NO ORACLE DATA]" density="compact" />
      </div>
    </div>
  );
}


