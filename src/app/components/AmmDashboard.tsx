'use client';

import React, { useState, useEffect } from 'react';
import { useAmmStats, useAmmHealth, useAmmPools } from '../hooks/useAmmData';
import Card from './Card';
import Table from './Table';
import { VolumeChart, LiquidityHeatmap, PoolEfficiencyChart, VolumeHeatmapChart, CorrelationPlot } from './charts/AmmCharts';
import { AmmMath, AmmDataUtils } from '../../lib/ammUtils';
import _ from 'lodash';

function fmtUsd(v?: number | null) { return v ? `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-'; }
function fmtNumber(v?: number | null) { return v ? v.toLocaleString() : '-'; }
function short(addr?: string) { return addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-'; }

export default function AmmDashboard() {
  const { stats, loading: statsLoading, refetch: mutateStats } = useAmmStats();
  const { health, loading: healthLoading, refetch: mutateHealth } = useAmmHealth();
  const { pools, loading: poolsLoading, refetch: mutatePools } = useAmmPools(100);
  const [activeTab, setActiveTab] = useState<'overview' | 'pools' | 'analytics'>('overview');

  // Live updating statistics
  const [liveStats, setLiveStats] = useState({
    totalVolume24h: 0,
    totalLiquidity: 0,
    activePools: 0,
    lastUpdate: Date.now()
  });

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      mutateStats();
      mutateHealth();
      mutatePools();

      // Update live stats with new calculations
      if (pools) {
        const totalVolume24h = _.sumBy(pools, 'volume24hUSD') || 0;
        const totalLiquidity = _.sumBy(pools, 'liquidityUSD') || 0;
        const activePools = pools.length; // Total pools as active pools

        setLiveStats({
          totalVolume24h,
          totalLiquidity,
          activePools,
          lastUpdate: Date.now()
        });
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [mutateStats, mutateHealth, mutatePools, pools]);

  // Real-time stats animation
  const [animatedStats, setAnimatedStats] = useState(liveStats);
  useEffect(() => {
    const startValue = animatedStats;
    const endValue = liveStats;
    const duration = 1000; // 1 second animation
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setAnimatedStats({
        totalVolume24h: startValue.totalVolume24h + (endValue.totalVolume24h - startValue.totalVolume24h) * progress,
        totalLiquidity: startValue.totalLiquidity + (endValue.totalLiquidity - startValue.totalLiquidity) * progress,
        activePools: Math.round(startValue.activePools + (endValue.activePools - startValue.activePools) * progress),
        lastUpdate: endValue.lastUpdate
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    if (startValue.totalVolume24h !== endValue.totalVolume24h ||
        startValue.totalLiquidity !== endValue.totalLiquidity ||
        startValue.activePools !== endValue.activePools) {
      animate();
    }
  }, [liveStats]);

  // Calculate pool efficiency metrics
  const poolEfficiency = React.useMemo(() => {
    if (!pools.length) return [];
    return pools.slice(0, 50).map(pool => {
      const efficiency = AmmDataUtils.calculatePoolEfficiency({
        volume24hUSD: pool.volume24hUSD,
        liquidityUSD: pool.liquidityUSD,
        feeTier: pool.feeTier
      });
      return {
        poolAddress: pool.address,
        utilization: parseFloat(efficiency.utilization),
        annualFeeYield: parseFloat(efficiency.annualFeeYield),
        volume24hUSD: pool.volume24hUSD
      };
    });
  }, [pools]);

  const poolColumns = [
    {
      key: 'protocol',
      header: 'DEX',
      render: (v: string) => v || 'Uniswap',
      className: 'text-[7px]'
    },
    {
      key: 'version',
      header: 'Ver',
      render: (v: string) => v || 'V2',
      className: 'text-[7px] text-center'
    },
    {
      key: 'address',
      header: 'Pool',
      render: (v: string) => (
        <span className="font-mono text-gray-400 text-[7px]" title={v}>
          {short(v)}
        </span>
      ),
      className: 'font-mono'
    },
    {
      key: 'token0',
      header: 'T0',
      render: (v: string, row: any) => {
        const token = row.token0?.slice(0, 6) || '-';
        return <span className="font-mono text-gray-300 text-[7px]" title={v}>{token}</span>;
      }
    },
    {
      key: 'token1',
      header: 'T1',
      render: (v: string, row: any) => {
        const token = row.token1?.slice(0, 6) || '-';
        return <span className="font-mono text-gray-300 text-[7px]" title={v}>{token}</span>;
      }
    },
    {
      key: 'feeTier',
      header: 'Fee',
      render: (v?: number) => {
        if (!v) return '-';
        // V3 fees are in basis points (e.g., 3000 = 0.30%), V2 fees are typically 30 bps
        const feeBps = v >= 10000 ? v / 100 : v; // Handle both formats
        return `${(feeBps / 100).toFixed(2)}%`;
      },
      className: 'text-center text-[7px]'
    },
    {
      key: 'liquidityUSD',
      header: 'TVL',
      render: (v: number) => fmtUsd(v),
      className: 'text-right text-[7px]'
    },
    {
      key: 'volume24hUSD',
      header: 'Volume (24H)',
      render: (v: number) => fmtUsd(v),
      className: 'text-right text-[7px]'
    },
    {
      key: 'fees24hUSD',
      header: 'Fees (24H)',
      render: (v: number) => fmtUsd(v),
      className: 'text-right text-[7px]'
    },
    {
      key: 'utilization',
      header: 'Util',
      render: (v?: number | null) => v != null ? `${v.toFixed(1)}%` : '-',
      className: 'text-right text-[7px]'
    },
    {
      key: 'pool0Pct',
      header: 'T0 %',
      render: (v?: number | null) => v != null ? `${v.toFixed(1)}%` : '-',
      className: 'text-right text-[7px]'
    },
    {
      key: 'pool1Pct',
      header: 'T1 %',
      render: (v?: number | null) => v != null ? `${v.toFixed(1)}%` : '-',
      className: 'text-right text-[7px]'
    },
    {
      key: 'reserveRatio',
      header: 'Ratio',
      render: (v?: number | null) => v != null ? v.toFixed(2) : '-',
      className: 'text-right text-[7px]'
    }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
        <Card title="TOTAL POOLS">
          <div className="text-[12px] font-mono font-bold text-emerald-400">
            {statsLoading ? '...' : fmtNumber(stats?.totalPools)}
          </div>
        </Card>
        <Card title="ACTIVE POOLS">
          <div className="text-[12px] font-mono font-bold text-blue-400">
            {statsLoading ? '...' : fmtNumber(stats?.activePools)}
          </div>
        </Card>
        <Card title="24H VOLUME">
          <div className="text-[12px] font-mono font-bold text-green-400">
            {statsLoading ? '...' : fmtUsd(stats?.totalVolume24h)}
          </div>
        </Card>
        <Card title="TOTAL LIQUIDITY">
          <div className="text-[12px] font-mono font-bold text-purple-400">
            {statsLoading ? '...' : fmtUsd(stats?.totalLiquidity)}
          </div>
        </Card>
      </div>

      {/* Health Metrics */}
      <div className="bg-black border border-gray-800 rounded p-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[7px] font-mono">
          <div className="text-gray-400">
            <span className="text-gray-500">INDEXED:</span>
            <div className="text-white font-bold">{fmtNumber(health?.lastIndexedBlock)}/{fmtNumber(health?.latestBlock)}</div>
          </div>
          <div className="text-gray-400">
            <span className="text-gray-500">EVENTS:</span>
            <div className="text-white font-bold">{fmtNumber(health?.totalEvents)}</div>
          </div>
          <div className="text-gray-400">
            <span className="text-gray-500">SWAPS 24H:</span>
            <div className="text-white font-bold">{fmtNumber(stats?.totalSwaps24h)}</div>
          </div>
          <div className="text-gray-400">
            <span className="text-gray-500">INDEXING LAG:</span>
            <div className={`font-bold ${
              health?.lag && health.lag < 10 ? 'text-green-400' :
              health?.lag && health.lag < 50 ? 'text-yellow-400' :
              'text-red-400'
            }`}>
              {healthLoading ? '...' : `${health?.lag || 0} blocks`}
            </div>
          </div>
        </div>
      </div>

      {/* Volume Chart */}
      <VolumeChart
        data={pools.slice(0, 20).map(pool => ({
          timestamp: new Date(),
          volume: pool.volume24hUSD,
          protocol: 'Uniswap' // You can enhance this to include actual protocol data
        }))}
        title="Top Pool Volume Distribution (24h)"
        height={250}
      />
    </div>
  );

  const renderPoolsTab = () => (
    <div className="h-full overflow-y-auto">
      <Table
        data={pools}
        columns={poolColumns}
        emptyMessage="[NO AMM POOL DATA]"
        density="compact"
      />
      {poolsLoading && (
        <div className="text-center py-2 text-[6px] text-gray-500 font-mono">
          LOADING POOLS...
        </div>
      )}
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-2">
      {/* Volume Heatmap */}
      <VolumeHeatmapChart
        data={pools || []}
        title="Volume & Liquidity Heatmap (Top 20 Pools)"
        height={250}
      />

      {/* Correlation Plot */}
      <CorrelationPlot
        data={pools || []}
        title="Volume vs Liquidity Correlation (Top 50 Pools)"
        height={300}
      />

      {/* Pool Efficiency Chart */}
      <PoolEfficiencyChart
        data={poolEfficiency}
        title="Pool Efficiency Analysis (Top 50 Pools)"
        height={350}
      />

      {/* Liquidity Heatmap */}
      <LiquidityHeatmap
        data={pools.slice(0, 20).map(pool => ({
          poolAddress: pool.address,
          token0Symbol: pool.token0 || 'UNK',
          token1Symbol: pool.token1 || 'UNK',
          liquidityUSD: pool.liquidityUSD,
          volume24hUSD: pool.volume24hUSD
        }))}
        title="Liquidity vs Volume Heatmap"
        height={300}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 text-[8px]">📊</span>
            <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">AMM DASHBOARD</h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700">
              LIVE UPDATES
            </div>
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_3px_rgba(52,211,153,0.5)]"></div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-1.5 py-1 bg-black border-b border-gray-800">
        <div className="flex items-center gap-1">
          <span className="text-emerald-400 text-[7px] font-mono">VIEW:</span>
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-2 py-0.5 text-[6px] font-mono border ${
              activeTab === 'overview'
                ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            OVERVIEW
          </button>
          <button
            onClick={() => setActiveTab('pools')}
            className={`px-2 py-0.5 text-[6px] font-mono border ${
              activeTab === 'pools'
                ? 'bg-blue-900 text-blue-300 border-blue-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            POOLS ({pools.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-2 py-0.5 text-[6px] font-mono border ${
              activeTab === 'analytics'
                ? 'bg-purple-900 text-purple-300 border-purple-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
            }`}
          >
            ANALYTICS
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-1.5 overflow-y-auto">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'pools' && renderPoolsTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </div>
    </div>
  );
}
