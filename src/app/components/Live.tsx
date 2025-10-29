'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';
import Table from './Table';

function short(s: string, n = 10) { return s && s.length > n ? `${s.slice(0, n)}…` : (s || ''); }
function fmtGwei(hex?: string) { try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; } }
function fmtAge(firstSeen?: number) { if (!firstSeen) return '-'; const age = Date.now() / 1000 - firstSeen; return `${age.toFixed(1)}s`; }

// Get protocol display name (same as app.py)
function getProtocolDisplay(categoryKey: string): string {
  if (!categoryKey) return '-';
  if (categoryKey.startsWith('dex:')) {
    const parts = categoryKey.split(':');
    if (parts.length >= 3) {
      const protocol = parts[2];
      const version = parts[3] || '';
      return version ? `${protocol}:${version}` : protocol;
    }
    return 'DEX';
  }
  if (categoryKey.startsWith('erc20:')) return 'ERC-20';
  if (categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
  if (categoryKey.startsWith('bridge:')) return categoryKey.split(':')[1] || 'Bridge';
  if (categoryKey.startsWith('nft_market:')) return categoryKey.split(':')[1] || 'NFT Market';
  if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
  if (categoryKey.startsWith('deploy:')) return 'Deploy';
  if (categoryKey.startsWith('utility:')) return 'Utility';
  return 'Contract';
}

// Import shared amount decoding utilities
import { calculateAmount } from '../utils/amountUtils';

function summarizeEvents(row: any): string {
  try {
    const events = row?._decoded_events;
    if (!Array.isArray(events) || events.length === 0) return '-';
    const counts: Record<string, number> = {};
    for (const e of events) {
      const name = e?.event || 'Event';
      counts[name] = (counts[name] || 0) + 1;
    }
    const parts = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, c]) => (c > 1 ? `${name}×${c}` : name));
    return parts.join(', ');
  } catch {
    return '-';
  }
}

export default function Live() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const rows = filters.applyFilters(snapshot?.live || []);

  // Calculate pending transactions (not yet included)
  const pendingCount = rows.length;
  const gasGaugedCount = rows.filter(tx => tx._decoded_fn?.confidence > 0).length;
  const columns = [
    {
      key: '_first_seen_ts',
      header: 'Time',
      render: (value: number) => value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
      className: 'text-gray-500'
    },
    {
      key: 'hash',
      header: 'Hash',
      render: (value: string) => (
        <span className="font-mono text-green-400 hover:text-green-300 cursor-pointer">
          {short(value, 12)}
        </span>
      ),
      className: 'font-mono'
    },
    {
      key: 'from',
      header: 'From',
      render: (value: string) => short(value || '', 10),
      className: 'font-mono text-gray-500'
    },
    {
      key: 'to',
      header: 'To',
      render: (value: string) => short(value || '', 10),
      className: 'font-mono text-gray-500'
    },
    {
      key: 'category_key',
      header: 'Type',
      render: (value: string) => value || '-'
    },
    {
      key: 'category_key',
      header: 'Protocol',
      render: (value: string) => getProtocolDisplay(value)
    },
    {
      key: '_decoded_fn',
      header: 'Function',
      render: (value: any) => value?.function || '-',
      className: 'text-cyan-400'
    },
    {
      key: '_decoded_events',
      header: 'Events',
      render: (_: any, row: any) => summarizeEvents(row),
      className: 'text-blue-400'
    },
    {
      key: 'value',
      header: 'Amount',
      render: (_: any, row: any) => calculateAmount(row),
      className: 'text-green-400 font-medium'
    },
    {
      key: 'maxFeePerGas',
      header: 'Gas',
      render: (value: string, row: any) => `${fmtGwei(value || row.gasPrice)}g`,
      className: 'text-yellow-400'
    },
    {
      key: '_first_seen_ts',
      header: 'Age',
      render: (value: number) => fmtAge(value),
      className: 'text-purple-400'
    }
  ];

  return (
    <div className="h-full">
      {/* Live Transactions Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 text-[9px]">⚡</span>
            <h2 className="font-mono text-[9px] uppercase tracking-widest text-gray-300">
              LIVE TRANSACTIONS
            </h2>
            <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700">
              {pendingCount} PENDING
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <div className={`w-0.5 h-0.5 rounded-full ${gasGaugedCount > 0 ? 'bg-sky-500' : 'bg-gray-700'}`}></div>
              <span className={`font-mono text-[7px] tracking-widest ${gasGaugedCount > 0 ? 'text-sky-400' : 'text-gray-600'}`}>
                {gasGaugedCount}/{pendingCount} GASSED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-1.5">
        <Table
          data={rows}
          columns={columns}
          emptyMessage="[WAITING FOR LIVE TRANSACTION DATA...]"
          density="compact"
        />
      </div>
    </div>
  );
}
