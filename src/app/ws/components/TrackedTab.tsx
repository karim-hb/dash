'use client';

import Link from 'next/link';

import Table from '../../components/Table';
import { TrackedTx } from '../types';

interface TrackedTabProps {
  tracked: TrackedTx[];
}

export default function TrackedTab({ tracked }: TrackedTabProps) {
  const columns = [
    {
      key: 'hash',
      header: 'Hash',
      render: (value: string) => (
        <Link
          href={`https://etherscan.io/tx/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-400 hover:text-sky-300"
        >
          {value.slice(0, 8)}…{value.slice(-6)}
        </Link>
      ),
      className: 'font-mono text-[10px] text-sky-400',
    },
    {
      key: 'poolStatus',
      header: 'Status',
      render: (value: string | undefined) => (
        <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded ${statusChip(value)}`}>
          {value ? value.toUpperCase() : 'UNKNOWN'}
        </span>
      ),
      className: 'text-center',
    },
    {
      key: 'effectiveGasPriceGwei',
      header: 'Gas (gwei)',
      render: (value: number | null | undefined) => (value != null ? value.toFixed(2) : '—'),
      className: 'text-right',
    },
    {
      key: 'inclusionProbability',
      header: 'Probability',
      render: (value: number | null | undefined) => (
        <div className="text-right">
          <span className="text-[#C9D1D9] font-semibold">{value != null ? `${Math.round(value * 100)}%` : '—'}</span>
          <div className="w-full h-1.5 bg-[#1F2937] rounded mt-1 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-emerald-500 to-cyan-500"
              style={{ width: `${Math.min(100, Math.max(0, (value ?? 0) * 100))}%` }}
            />
          </div>
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'predictedInclusionBlock',
      header: 'Predicted Block',
      render: (value: number | null | undefined) => (value != null ? `#${value}` : '—'),
      className: 'text-right',
    },
    {
      key: 'timeToConfirm',
      header: 'Latency (s)',
      render: (value: number | null | undefined) => (value != null ? value.toFixed(1) : '—'),
      className: 'text-right',
    },
    {
      key: 'firstSeenInPool',
      header: 'First Seen',
      sortable: true,
      render: (value: number | undefined) => (value ? new Date(value).toLocaleTimeString(undefined, { hour12: false }) : '—'),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-[0.3em] text-[#8B949E] uppercase">Tracked Transactions</h3>
        <span className="text-xs text-[#8B949E]">{tracked.length} monitored</span>
      </div>
      <Table
        data={tracked}
        columns={columns}
        emptyMessage="[No tracked transactions currently monitored]"
        density="compact"
      />
    </div>
  );
}

function statusChip(status?: string) {
  switch ((status ?? '').toLowerCase()) {
    case 'pending':
      return 'bg-amber-500/10 text-amber-200 border border-amber-500/40';
    case 'queued':
      return 'bg-blue-500/10 text-blue-200 border border-blue-500/40';
    case 'confirmed':
      return 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/40';
    case 'failed':
      return 'bg-rose-500/10 text-rose-200 border border-rose-500/40';
    case 'dropped':
      return 'bg-slate-500/10 text-slate-300 border border-slate-500/30';
    default:
      return 'bg-gray-500/10 text-gray-300 border border-gray-500/30';
  }
}

