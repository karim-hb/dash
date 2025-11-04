'use client';

import React from 'react';
import { usePoolDetails, PoolDetails as PoolDetailsType } from '../hooks/useAmmData';
import Card from './Card';
import Table from './Table';

function fmtUsd(v?: number | null) { return v ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'; }
function fmtNumber(v?: number | null) { return v ? v.toLocaleString() : '-'; }
function short(addr?: string) { return addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-'; }

interface PoolDetailsProps {
  poolAddress: string | null;
  onClose?: () => void;
}

export default function PoolDetails({ poolAddress, onClose }: PoolDetailsProps) {
  const { details, loading, error } = usePoolDetails(poolAddress);

  if (!poolAddress) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-[8px] font-mono text-gray-500">
          SELECT A POOL TO VIEW DETAILS
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-[8px] font-mono text-gray-500">
          LOADING POOL DETAILS...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-[8px] font-mono text-red-400">
          ERROR: {error}
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-[8px] font-mono text-gray-500">
          POOL NOT FOUND
        </div>
      </div>
    );
  }

  const { metadata, recentEvents, totalEvents } = details;

  const eventColumns = [
    {
      key: 'timestamp',
      header: 'Time',
      render: (v: string) => new Date(v).toLocaleTimeString(),
      className: 'text-[6px] text-gray-500'
    },
    {
      key: 'eventType',
      header: 'Type',
      render: (v: string) => (
        <span className={`px-1 py-0.5 text-[6px] font-mono border rounded ${
          v === 'Swap' ? 'bg-blue-900 text-blue-300 border-blue-700' :
          v === 'Mint' ? 'bg-green-900 text-green-300 border-green-700' :
          'bg-red-900 text-red-300 border-red-700'
        }`}>
          {v}
        </span>
      ),
      className: 'text-center'
    },
    {
      key: 'amount0',
      header: 'Amount 0',
      render: (v: string) => {
        const num = parseFloat(v);
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
      },
      className: 'text-right font-mono text-[6px]'
    },
    {
      key: 'amount1',
      header: 'Amount 1',
      render: (v: string) => {
        const num = parseFloat(v);
        return num.toLocaleString(undefined, { maximumFractionDigits: 4 });
      },
      className: 'text-right font-mono text-[6px]'
    },
    {
      key: 'volumeUSD',
      header: 'Volume',
      render: (v?: number) => fmtUsd(v),
      className: 'text-right'
    },
    {
      key: 'blockNumber',
      header: 'Block',
      render: (v: number) => fmtNumber(v),
      className: 'text-right font-mono text-[6px] text-gray-500'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-blue-400 text-[8px]">🏊</span>
            <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">POOL DETAILS</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-300 text-[8px]"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Pool Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 p-1.5">
        <Card title="ADDRESS">{short(metadata.poolAddress)}</Card>
        <Card title="PROTOCOL">{metadata.protocol}</Card>
        <Card title="FEE TIER">{metadata.feeTier ? `${(metadata.feeTier/10000).toFixed(2)}%` : '-'}</Card>
        <Card title="STATUS">{metadata.status.toUpperCase()}</Card>
      </div>

      {/* Token Info */}
      <div className="px-1.5 py-1 bg-black border-b border-gray-800">
        <div className="grid grid-cols-2 gap-2 text-[6px] font-mono">
          <div>
            <span className="text-gray-500">TOKEN 0:</span>
            <span className="text-gray-300 ml-1">{short(metadata.token0Address)}</span>
          </div>
          <div>
            <span className="text-gray-500">TOKEN 1:</span>
            <span className="text-gray-300 ml-1">{short(metadata.token1Address)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[6px] font-mono mt-1">
          <div>
            <span className="text-gray-500">CREATED:</span>
            <span className="text-gray-300 ml-1">{new Date(metadata.creationTimestamp).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-500">BLOCK:</span>
            <span className="text-gray-300 ml-1">{fmtNumber(metadata.creationBlock)}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-1 p-1.5">
        <Card title="24H VOLUME">{fmtUsd(metadata.volume24hUSD)}</Card>
        <Card title="LIQUIDITY">{fmtUsd(metadata.liquidityUSD)}</Card>
      </div>

      {/* Recent Events */}
      <div className="flex-1 p-1.5">
        <div className="bg-gray-900 border border-gray-800 rounded h-full flex flex-col">
          <div className="px-2 py-1 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-[7px] font-mono text-gray-300 uppercase tracking-wider">
                📈 RECENT EVENTS
              </h3>
              <div className="text-[6px] font-mono text-gray-500">
                {fmtNumber(totalEvents)} TOTAL
              </div>
            </div>
          </div>
          <div className="flex-1 p-1">
            <Table
              data={recentEvents}
              columns={eventColumns}
              emptyMessage="[NO RECENT EVENTS]"
              density="compact"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
