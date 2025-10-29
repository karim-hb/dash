'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Table from './Table';

function short(addr?: string) { return addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-'; }
function fmtUsd(v?: number | null) { if (v === null || v === undefined) return '-'; return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }

export default function Pools() {
  const { snapshot } = useWsSnapshot();
  const rows = snapshot?.pools || [];

  const columns = [
    { key: 'dex', header: 'DEX', render: (v: string, r: any) => (
      <span className="font-mono text-emerald-400">{v}</span>
    ) },
    { key: 'version', header: 'Ver' },
    { key: 'address', header: 'Pool', render: (v: string) => short(v), className: 'font-mono text-gray-400' },
    { key: 'token0', header: 'Token0', render: (v: string) => short(v), className: 'font-mono text-gray-500' },
    { key: 'token1', header: 'Token1', render: (v: string) => short(v), className: 'font-mono text-gray-500' },
    { key: 'fee_bps', header: 'Fee', render: (v: number) => v ? `${(v/100).toFixed(2)}%` : '-' },
    { key: 'tvl_usd', header: 'TVL', render: (v: number) => fmtUsd(v) },
    { key: 'volume_24h_usd', header: 'Volume (24H)', render: (v: number) => fmtUsd(v) },
    { key: 'fees_24h_usd', header: 'Fees (24H)', render: (v: number) => fmtUsd(v) },
    { key: 'utilization', header: 'Util', render: (v: number) => v != null ? `${(v*100).toFixed(1)}%` : '-' },
  ];

  return (
    <div className="h-full">
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center gap-1">
          <span className="text-sky-400 text-[8px]">🏦</span>
          <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">AMM POOLS</h2>
          <div className="px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700">{rows.length} POOLS</div>
        </div>
      </div>
      <div className="p-1.5">
        <Table data={rows} columns={columns} emptyMessage="[NO POOL DATA]" density="compact" />
      </div>
    </div>
  );
}


