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

export default function Live() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const rows = filters.applyFilters(snapshot?.live || []);
  const columns = [
    {
      key: '_first_seen_ts',
      header: 'Time',
      render: (value: number) => value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
      className: 'text-gray-400'
    },
    {
      key: 'hash',
      header: 'Hash',
      render: (value: string) => (
        <span className="font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer">
          {short(value, 12)}
        </span>
      ),
      className: 'font-mono'
    },
    {
      key: 'from',
      header: 'From',
      render: (value: string) => short(value || '', 10),
      className: 'font-mono text-gray-400'
    },
    {
      key: 'to',
      header: 'To',
      render: (value: string) => short(value || '', 10),
      className: 'font-mono text-gray-400'
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
      className: 'text-purple-400'
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
      className: 'text-orange-400'
    },
    {
      key: '_first_seen_ts',
      header: 'Age',
      render: (value: number) => fmtAge(value),
      className: 'text-blue-400'
    }
  ];

  return (
    <Card
      title="LIVE TRANSACTIONS"
      icon={<span className="text-blue-400">⚡</span>}
      badge={rows.length > 0 ? `${rows.length} ACTIVE` : undefined}
      variant="terminal"
      className="h-full"
    >
      <Table
        data={rows}
        columns={columns}
        emptyMessage="[WAITING FOR LIVE TRANSACTION DATA...]"
      />
    </Card>
  );
}
