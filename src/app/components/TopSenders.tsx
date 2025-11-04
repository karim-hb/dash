'use client';

import { useMemo } from 'react';
import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';
import Table from './Table';

interface SenderStats {
  address: string;
  totalVolume: bigint;
  totalTx: number;
  totalGas: bigint;
  avgGas: string;
  lastSeen: number;
  protocols: Set<string>;
}

export default function TopSenders() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();

  const senderStats = useMemo(() => {
    const stats: Record<string, SenderStats> = {};

    // Process both live and included transactions
    const allTxs = [
      ...(snapshot?.live || []),
      ...(snapshot?.included || [])
    ].filter(tx => filters.applyFilters([tx]).length > 0);

    for (const tx of allTxs) {
      const sender = tx.from?.toLowerCase();
      if (!sender || sender === '0x0000000000000000000000000000000000000000') continue;

      if (!stats[sender]) {
        stats[sender] = {
          address: sender,
          totalVolume: BigInt(0),
          totalTx: 0,
          totalGas: BigInt(0),
          avgGas: '0',
          lastSeen: tx._first_seen_ts || 0,
          protocols: new Set()
        };
      }

      // Add volume (ETH transfers)
      const valueWei = BigInt(tx.value || '0x0');
      stats[sender].totalVolume = stats[sender].totalVolume + valueWei;

      // Count transaction
      stats[sender].totalTx += 1;

      // Add gas used (for included txs)
      if (tx._receipt?.gasUsed) {
        const gasUsed = BigInt(tx._receipt.gasUsed);
        stats[sender].totalGas = stats[sender].totalGas + gasUsed;
      }

      // Track protocols
      const protocol = getProtocolDisplay(tx.category_key);
      if (protocol !== '-') {
        stats[sender].protocols.add(protocol);
      }

      // Update last seen
      const txTime = tx._inclusion_ts || tx._first_seen_ts || 0;
      if (txTime > stats[sender].lastSeen) {
        stats[sender].lastSeen = txTime;
      }
    }

    // Calculate averages and format
    const result = Object.values(stats)
      .map(stat => ({
        ...stat,
        totalVolumeEth: Number(stat.totalVolume) / 1e18,
        avgGas: stat.totalTx > 0 ? (Number(stat.totalGas) / stat.totalTx).toFixed(0) : '0',
        protocolsList: Array.from(stat.protocols).slice(0, 3).join(', ')
      }))
      .sort((a, b) => b.totalVolumeEth - a.totalVolumeEth)
      .slice(0, 100); // Top 100

    return result;
  }, [snapshot, filters]);

  const columns = [
    {
      key: 'rank',
      header: '#',
      render: (_: any, __: any, index: number) => {
        const rank = index + 1;
        const rankStr = rank.toString().padStart(2, '0');
        let colorClass = 'text-gray-600';
        if (rank === 1) colorClass = 'text-yellow-400';
        else if (rank === 2) colorClass = 'text-gray-400';
        else if (rank === 3) colorClass = 'text-orange-500';
        else if (rank <= 5) colorClass = 'text-emerald-400';
        else if (rank <= 10) colorClass = 'text-sky-400';
        return <span className={`${colorClass} font-mono font-bold`}>{rankStr}</span>;
      },
      className: 'font-mono'
    },
    {
      key: 'address',
      header: 'Address',
      render: (value: string) => (
        <span className="font-mono text-cyan-400 hover:text-cyan-300 cursor-pointer">
          {value.slice(0, 6)}...{value.slice(-4)}
        </span>
      ),
      className: 'font-mono'
    },
    {
      key: 'totalVolumeEth',
      header: 'Volume (ETH)',
      render: (value: number) => {
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        if (value >= 1) return value.toFixed(3);
        if (value >= 0.001) return `${(value * 1000).toFixed(0)}m`;
        return `${(value * 1e6).toFixed(0)}μ`;
      },
      className: 'text-green-400 font-medium font-mono'
    },
    {
      key: 'totalTx',
      header: 'Tx Count',
      render: (value: number) => value.toLocaleString(),
      className: 'text-blue-400 font-mono'
    },
    {
      key: 'avgGas',
      header: 'Avg Gas',
      render: (value: string) => `${value}K`,
      className: 'text-yellow-400 font-mono'
    },
    {
      key: 'protocolsList',
      header: 'Protocols',
      render: (value: string) => value || '-',
      className: 'text-purple-400'
    },
    {
      key: 'lastSeen',
      header: 'Last Seen',
      render: (value: number) => value ? new Date(value * 1000).toLocaleTimeString() : '--:--:--',
      className: 'text-gray-500 font-mono'
    }
  ];

  return (
    <div className="h-full">
      {/* Top Senders Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 text-[9px]">📊</span>
            <h2 className="font-mono text-[9px] uppercase tracking-widest text-gray-300">
              TOP SENDERS BY VOLUME
            </h2>
            <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[7px] font-mono border border-emerald-700">
              {senderStats.length} ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-1.5">
        <Table
          data={senderStats}
          columns={columns}
          emptyMessage="[NO SENDER DATA AVAILABLE...]"
          density="compact"
        />
      </div>
    </div>
  );
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
