'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Card from './Card';
import Table from './Table';

function fmt(num?: number | null, digits = 2): string {
  if (num === null || num === undefined || Number.isNaN(num)) return '-';
  if (Math.abs(num) >= 1000) return `${(num / 1_000).toFixed(digits)}k`;
  return num.toFixed(digits);
}

export default function Tokens() {
  const { snapshot } = useWsSnapshot();
  const rows = snapshot?.tokens || [];

  const columns = [
    { key: 'symbol', header: 'Token', render: (_: any, row: any) => (
      <div className="flex items-center gap-1">
        <span className="font-mono text-emerald-400">{row.symbol || '-'}</span>
        <span className="font-mono text-[9px] text-gray-600">{row.address ? `${row.address.slice(0,6)}…${row.address.slice(-4)}` : ''}</span>
      </div>
    ) },
    { key: 'price_usd', header: 'Price', render: (v: number) => `$${fmt(v, 4)}`, className: 'text-sky-400' },
    { key: 'change_24h', header: 'Change (%)', render: (v: number) => (
      <span className={v >= 0 ? 'text-emerald-400' : 'text-red-400'}>{v ? v.toFixed(2) : '-'}</span>
    )},
    { key: 'volume_24h_usd', header: 'Volume (24H)', render: (v: number) => `$${fmt(v)}` },
    { key: 'mcap_circ_usd', header: 'Circ MCap', render: (v: number) => `$${fmt(v)}` },
    { key: 'mcap_onchain_usd', header: 'Onchain MCap', render: (v: number) => `$${fmt(v)}` },
    { key: 'holders_est', header: 'Holders', render: (v: number) => v ? v.toLocaleString() : '-' },
  ];

  return (
    <div className="h-full">
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 text-[8px]">💹</span>
          <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">TOKENS</h2>
          <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700">{rows.length} LISTED</div>
        </div>
      </div>
      <div className="p-1.5">
        <Table data={rows} columns={columns} emptyMessage="[NO TOKEN DATA]" density="compact" />
      </div>
    </div>
  );
}


