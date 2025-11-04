'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';
import Table from './Table';
import { ethers } from 'ethers';
import useSWR from 'swr';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

function short(s: string, n = 10) { return s && s.length > n ? `${s.slice(0, n)}…` : (s || ''); }

// Enhanced BigNumber-based formatting functions
function fmtGwei(hex?: string) {
  if (!hex) return '-';
  try {
    const wei = new BigNumber(hex, 16);
    const gwei = wei.div(new BigNumber(10).pow(9));
    return gwei.toFixed(1);
  } catch {
    return '-';
  }
}

function fmtValue(value?: string, decimals: number = 18) {
  if (!value) return '-';
  try {
    const val = new BigNumber(value, 16);
    const formatted = val.div(new BigNumber(10).pow(decimals));
    return formatted.toFixed(4);
  } catch {
    return '-';
  }
}

function fmtAge(firstSeen?: number) {
  if (!firstSeen) return '-';
  const age = Date.now() / 1000 - firstSeen;
  return `${age.toFixed(1)}s`;
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
import { calculateAmount } from '../utils/amountUtilsEthers';

// Optimized event summarization with lodash
function summarizeEvents(row: any): string {
  try {
    const events = row?._decoded_events;
    if (!Array.isArray(events) || events.length === 0) return '-';

    // Use lodash for efficient counting and sorting
    const counts = _.countBy(events, e => e?.event || 'Event');
    const topEvents = _.chain(counts)
      .toPairs()
      .sortBy(([_, count]) => -count)
      .take(3)
      .map(([name, count]) => count > 1 ? `${name}×${count}` : name)
      .value();

    return topEvents.join(', ');
  } catch {
    return '-';
  }
}


// SWR fetcher for additional live data
const swrFetcher = (url: string) => fetch(url).then(res => res.json());

export default function Live() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const rows = filters.applyFilters(snapshot?.live || []);

  // Add SWR caching for enhanced statistics
  const { data: cachedStats } = useSWR('/api/dashboard/stats', swrFetcher, {
    refreshInterval: 15000, // Refresh every 15 seconds
    revalidateOnFocus: true,
    dedupingInterval: 5000
  });

  const pendingCount = rows.length;
  const gasGaugedCount = rows.filter(tx => tx._decoded_fn?.confidence > 0).length;

  // Enhanced statistics with BigNumber precision
  const totalValueETH = _.sumBy(rows, tx => {
    try {
      if (!tx.value) return 0;
      const value = new BigNumber(tx.value, 16);
      return value.div(new BigNumber(10).pow(18)).toNumber();
    } catch {
      return 0;
    }
  });

  const avgGasPrice = _.meanBy(
    rows.filter(tx => tx.gasPrice),
    tx => {
      try {
        return new BigNumber(tx.gasPrice!, 16).div(new BigNumber(10).pow(9)).toNumber();
      } catch {
        return 0;
      }
    }
  );

  const highValueTxs = rows.filter(tx => {
    try {
      if (!tx.value) return false;
      const value = new BigNumber(tx.value, 16);
      return value.gte(new BigNumber(10).pow(18)); // >= 1 ETH
    } catch {
      return false;
    }
  }).length;
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
    <div className="h-full bg-black">
      {/* Live Transactions Header */}
      <div className="bg-gray-900 border-b-2 border-green-600 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-5 bg-green-500"></div>
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-widest text-green-400">
              LIVE TRANSACTIONS
            </h2>
            <div className="px-3 py-1 bg-gray-800 text-green-300 text-[9px] font-mono border border-gray-600 rounded">
              {pendingCount} PENDING
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${gasGaugedCount > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
              <span className={`font-mono text-[9px] font-bold tracking-wide ${gasGaugedCount > 0 ? 'text-green-400' : 'text-gray-500'}`}>
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
