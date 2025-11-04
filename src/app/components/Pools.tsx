'use client';

import React from 'react';
import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useAmmPools } from '../hooks/useAmmData';
import Table from './Table';
import PoolDetails from './PoolDetails';

function short(addr?: string) { return addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-'; }
function fmtUsd(v?: number | null) { if (v === null || v === undefined) return '-'; return `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`; }
function pct(v?: number | null) { if (v === null || v === undefined) return '-'; return `${v.toFixed(1)}%`; }

export default function Pools() {
  const { snapshot } = useWsSnapshot();
  const { pools: ammPools } = useAmmPools(100);
  const rows = snapshot?.pools || [];
  const [poolTab, setPoolTab] = React.useState<'v2' | 'v3' | 'amm'>('amm');
  const [selectedPool, setSelectedPool] = React.useState<string | null>(null);
  console.log(rows, 'rows')
  const columns = [
    { key: 'dex', header: 'DEX', render: (v: string, r: any) => (
      <span className="font-mono text-emerald-400">{v}</span>
    ) },
    { key: 'version', header: 'Ver' },
    { key: 'address', header: 'Pool', render: (v: string) => short(v), className: 'font-mono text-gray-400' },
    { key: 'token0_symbol', header: 'T0', render: (v: string, r: any) => (
      <span title={r.token0} className="font-mono text-gray-300">{v || 'UNK'}</span>
    ) },
    { key: 'token1_symbol', header: 'T1', render: (v: string, r: any) => (
      <span title={r.token1} className="font-mono text-gray-300">{v || 'UNK'}</span>
    ) },
    { key: 'fee_bps', header: 'Fee', render: (v: number) => v ? `${(v/100).toFixed(2)}%` : '-' },
    { key: 'tvl_usd', header: 'TVL', render: (v: number) => fmtUsd(v) },
    { key: 'volume_24h_usd', header: 'Volume (24H)', render: (v: number) => fmtUsd(v) },
    { key: 'fees_24h_usd', header: 'Fees (24H)', render: (v: number) => fmtUsd(v) },
    { key: 'utilization', header: 'Util', render: (v: number) => v != null ? `${(v*100).toFixed(1)}%` : '-' },
    { key: 'pool0_pct', header: 'T0 %', render: (v: number) => pct(v) },
    { key: 'pool1_pct', header: 'T1 %', render: (v: number) => pct(v) },
    { key: 'reserve_ratio', header: 'Ratio', render: (v: number) => v != null ? v.toFixed(2) : '-' },
  ];

  const ammColumns = [
    {
      key: 'address',
      header: 'Pool',
      render: (v: string, r: any) => (
        <button
          onClick={() => setSelectedPool(v)}
          className="font-mono text-blue-400 hover:text-blue-300 underline text-[7px]"
          title={v}
        >
          {short(v)}
        </button>
      ),
      className: 'font-mono'
    },
    {
      key: 'token0',
      header: 'Token 0',
      render: (v: string) => (
        <span className="font-mono text-gray-300 text-[7px]" title={v}>
          {short(v)}
        </span>
      )
    },
    {
      key: 'token1',
      header: 'Token 1',
      render: (v: string) => (
        <span className="font-mono text-gray-300 text-[7px]" title={v}>
          {short(v)}
        </span>
      )
    },
    {
      key: 'feeTier',
      header: 'Fee',
      render: (v?: number) => v ? `${(v/10000).toFixed(2)}%` : '-',
      className: 'text-center'
    },
    {
      key: 'volume24hUSD',
      header: '24h Volume',
      render: (v: number) => fmtUsd(v),
      className: 'text-right'
    },
    {
      key: 'liquidityUSD',
      header: 'Liquidity',
      render: (v: number) => fmtUsd(v),
      className: 'text-right'
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (v?: string) => v ? new Date(v).toLocaleDateString() : '-',
      className: 'text-[6px] text-gray-500'
    }
  ];

  // Filter pools by selected version
  const filteredPools = rows.filter(p => {
    const versionMap = { v2: 'V2', v3: 'V3' };
    return p.version === versionMap[poolTab];
  });

  if (selectedPool) {
    return (
      <PoolDetails
        poolAddress={selectedPool}
        onClose={() => setSelectedPool(null)}
      />
    );
  }

  return (
    <div className="h-full">
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sky-400 text-[8px]">🏦</span>
            <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">AMM POOLS</h2>
            <div className="px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700">
              {poolTab === 'amm' ? `${ammPools.length} AMM` : `${rows.length} TOTAL`}
            </div>
          </div>
        </div>
      </div>

      {/* Pool Version Tabs */}
      <div className="px-1.5 py-1 bg-black border-b border-gray-800">
        <div className="flex items-center gap-1">
          <span className="text-sky-400 text-[8px] font-mono">🏊 POOLS:</span>
          <button
            onClick={() => setPoolTab('amm')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              poolTab === 'amm'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            AMM ({ammPools.length})
          </button>
          <button
            onClick={() => setPoolTab('v2')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              poolTab === 'v2'
                ? 'bg-sky-900 text-sky-300 border-sky-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            V2 ({rows.filter(p => p.version === 'V2').length})
          </button>
          <button
            onClick={() => setPoolTab('v3')}
            className={`px-2 py-0.5 text-[7px] font-mono border ${
              poolTab === 'v3'
                ? 'bg-sky-900 text-sky-300 border-sky-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            V3 ({rows.filter(p => p.version === 'V3').length})
          </button>
        </div>
      </div>

      <div className="p-1.5">
        {poolTab === 'amm' ? (
          <Table
            data={ammPools}
            columns={ammColumns}
            emptyMessage="[NO AMM POOL DATA]"
            density="compact"
          />
        ) : (
          <Table
            data={filteredPools}
            columns={columns}
            emptyMessage={`[NO ${poolTab.toUpperCase()} POOL DATA]`}
            density="compact"
          />
        )}
      </div>
    </div>
  );
}


