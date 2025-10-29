'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Table from './Table';

function short(s: string, n = 10) { return s && s.length > n ? `${s.slice(0, n)}…` : (s || ''); }
function fmtGwei(hex?: string) { try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; } }
function fmtFeeEth(rcpt?: any) {
  try {
    if (!rcpt) return '-';
    const egp = parseInt(rcpt.effectiveGasPrice || '0x0', 16) / 1e9;
    const gu = parseInt(rcpt.gasUsed || '0x0', 16);
    return ((egp * gu) / 1e9).toFixed(4);
  } catch { return '-'; }
}
function fmtHexGwei(hex?: string) {
  try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; }
}
function fmtStatus(rcpt?: any) {
  try {
    const s = rcpt?.status;
    if (s === undefined || s === null) return '-';
    const ok = typeof s === 'string' ? parseInt(s, 16) === 1 : !!s;
    return ok ? 'Success' : 'Fail';
  } catch { return '-'; }
}
function fmtDelay(fs?: number, it?: number) {
  if (!fs || !it) return '-';
  return `${(it - fs).toFixed(1)}s`;
}

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

function hexToNum(val?: any): number | '-' {
  try {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      if (val.startsWith('0x') || val.startsWith('0X')) return parseInt(val, 16);
      const n = Number(val);
      return Number.isFinite(n) ? n : '-';
    }
    return '-';
  } catch { return '-'; }
}

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

export default function Included() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const rows = filters.applyFilters(snapshot?.included || []);

  const columns = [
    {
      key: '_inclusion_ts',
      header: 'Time',
      render: (value: number) => value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
      className: 'text-gray-500'
    },
    {
      key: 'hash',
      header: 'Hash',
      render: (value: string) => short(value, 16),
      className: 'font-mono text-green-400'
    },
    {
      key: 'from',
      header: 'From',
      render: (value: string) => short(value || '', 14),
      className: 'font-mono text-gray-500'
    },
    {
      key: 'to',
      header: 'To',
      render: (value: string) => short(value || '', 14),
      className: 'font-mono text-gray-500'
    },
    {
      key: 'value',
      header: 'Amount',
      render: (_: any, row: any) => calculateAmount(row),
      className: 'text-green-400 font-medium'
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
      key: 'blockNumber',
      header: 'Block',
      render: (_: any, row: any) => hexToNum(row.blockNumber) || hexToNum(row._receipt?.blockNumber) || hexToNum(row._inclusion_block) || '-'
    },
    {
      key: 'transactionIndex',
      header: 'TxIdx',
      render: (_: any, row: any) => hexToNum(row.transactionIndex) || hexToNum(row._receipt?.transactionIndex) || '-'
    },
    {
      key: 'nonce',
      header: 'Nonce',
      render: (value: any) => hexToNum(value) || '-'
    },
    {
      key: '_receipt',
      header: 'Status',
      render: (value: any) => fmtStatus(value)
    },
    {
      key: '_first_seen_ts',
      header: 'Delay',
      render: (_: any, row: any) => fmtDelay(row._first_seen_ts, row._inclusion_ts)
    },
    {
      key: '_confirmation_depth',
      header: 'Conf',
      render: (value: number) => value ?? 0
    },
    {
      key: '_receipt',
      header: 'GasUsed',
      render: (value: any) => hexToNum(value?.gasUsed) || '-'
    },
    {
      key: 'gas',
      header: 'GasLimit',
      render: (value: any) => hexToNum(value) || '-'
    },
    {
      key: 'gasPrice',
      header: 'GasPrice',
      render: (value: string) => fmtHexGwei(value)
    },
    {
      key: 'maxFeePerGas',
      header: 'MaxFee',
      render: (value: string) => fmtHexGwei(value)
    },
    {
      key: '_receipt',
      header: 'Fee(ETH)',
      render: (value: any) => fmtFeeEth(value)
    }
  ];

  return (
    <div className="h-full">
      {/* Included Transactions Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-sky-400 text-[9px]">✅</span>
            <h2 className="font-mono text-[9px] uppercase tracking-widest text-gray-300">
              INCLUDED TRANSACTIONS
            </h2>
            <div className="px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700">
              {rows.length} COMPLETED
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-1.5">
        <Table
          data={rows}
          columns={columns}
          emptyMessage="[NO INCLUDED TRANSACTIONS...]"
          density="compact"
        />
      </div>
    </div>
  );
}
