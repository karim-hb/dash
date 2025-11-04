'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';
import Table from './Table';

export default function Senders() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const filteredTxs = filters.applyFilters(snapshot?.live || []);
  const counts = new Map<string, number>();

  for (const tx of filteredTxs) {
    const key = (tx.from || '').toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const topSenders = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const columns = [
    {
      key: 'rank',
      header: 'RANK',
      render: (_: any, __: any, index: number) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-pink-500 text-white text-xs font-bold rounded-full font-mono">
          {index + 1}
        </span>
      ),
      className: 'w-16'
    },
    {
      key: 'address',
      header: 'SENDER ADDRESS',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
          <span className="font-mono text-cyan-400 text-sm">
            {value.slice(0, 6)}...{value.slice(-4)}
          </span>
        </div>
      ),
      className: 'font-mono'
    },
    {
      key: 'count',
      header: 'TRANSACTIONS',
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span className="terminal-badge text-purple-400">
            {value}
          </span>
          <div className="terminal-progress w-16">
            <div
              className="terminal-progress-bar"
              style={{ width: `${Math.min((value / 50) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      ),
      className: 'text-right'
    },
    {
      key: 'percentage',
      header: 'ACTIVITY SHARE',
      render: (_: any, row: any, index: number) => {
        const total = topSenders.reduce((sum, [, count]) => sum + count, 0);
        const percentage = total > 0 ? (row.count / total) * 100 : 0;
        return (
          <div className="text-right">
            <div className="text-sm font-mono text-slate-300">
              {percentage.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-500 font-mono">
              {index === 0 ? 'MOST ACTIVE' : index < 3 ? 'HIGH VOLUME' : 'ACTIVE'}
            </div>
          </div>
        );
      },
      className: 'text-right'
    }
  ];

  return (
    <Card
      title="TOP SENDERS"
      icon={<span className="text-pink-400">👤</span>}
      badge={topSenders.length > 0 ? `${topSenders.length} ACTIVE` : undefined}
      variant="terminal"
      className="h-full"
    >
      <div className="mb-4 p-3 glass-card border border-slate-700/30">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-emerald-400">📊</span>
          <span className="text-sm font-mono font-semibold text-slate-300">[ANALYTICS]</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 font-mono">
          <div>
            <div className="text-slate-300 font-semibold">TOTAL SENDERS</div>
            <div className="text-cyan-400">{counts.size}</div>
          </div>
          <div>
            <div className="text-slate-300 font-semibold">FILTERED TXS</div>
            <div className="text-purple-400">{filteredTxs.length}</div>
          </div>
        </div>
      </div>

      <Table
        data={topSenders.map(([address, count]) => ({ address, count }))}
        columns={columns}
        emptyMessage="[NO SENDER ACTIVITY DETECTED • WAITING FOR TRANSACTIONS]"
      />
    </Card>
  );
}
