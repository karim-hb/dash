'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import { useState, useEffect } from 'react';
import Table from './Table';
import SparklineChart from './charts/SparklineChart';
import BarChart from './charts/BarChart';
import TimeSeriesChart from './charts/TimeSeriesChart';
import PieChart from './charts/PieChart';

export default function Dashboard() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();

  // Real-time data tracking
  const [gasPriceHistory, setGasPriceHistory] = useState<number[]>([]);
  const [ingressHistory, setIngressHistory] = useState<Array<{ time: string; ingress: number; egress: number }>>([]);

  useEffect(() => {
    if (snapshot?.gas?.base_fee) {
      const gasPrice = snapshot.gas.base_fee / 1e9;
      setGasPriceHistory(prev => {
        const newHistory = [...prev, gasPrice];
        return newHistory.slice(-60);
      });
    }

    // Always update ingress/egress data, even if summary exists
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    const ingressValue = snapshot?.summary?.ingress_per_sec || 0;
    const egressValue = snapshot?.summary?.egress_per_sec || 0;

    setIngressHistory(prev => {
      const newHistory = [...prev, {
        time: timeStr,
        ingress: ingressValue,
        egress: egressValue
      }];
      return newHistory.slice(-20);
    });

  }, [snapshot]);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-600 font-mono text-[10px]">CONNECTING TO MEMPOOL TERMINAL...</div>
      </div>
    );
  }

  const { summary, status, gas } = snapshot;
  const filteredTxs = filters.applyFilters(snapshot.live || []);

  // Contract analysis
  const contractCounts = new Map<string, number>();
  for (const tx of filteredTxs) {
    const key = (tx.to || '').toLowerCase();
    if (key) contractCounts.set(key, (contractCounts.get(key) || 0) + 1);
  }
  const topContracts = Array.from(contractCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Sender analysis for Top Senders by Volume
  const senderCounts = new Map<string, number>();
  const senderVolumes = new Map<string, bigint>();
  for (const tx of filteredTxs) {
    const key = (tx.from || '').toLowerCase();
    if (key) {
      senderCounts.set(key, (senderCounts.get(key) || 0) + 1);
      const currentVolume = senderVolumes.get(key) || BigInt(0);
      const txValue = tx.value ? BigInt(tx.value) : BigInt(0);
      senderVolumes.set(key, currentVolume + txValue);
    }
  }

  const topSenders = Array.from(senderCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const topSendersByVolume = Array.from(senderVolumes.entries())
    .sort((a, b) => Number(b[1] - a[1]))
    .slice(0, 10)
    .map(([address, volume]) => ({
      address,
      volume: Number(volume) / 1e18,
      count: senderCounts.get(address) || 0
    }));

  // Protocol usage
  const protocolData = Object.entries(summary.by_type || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      value: value as number
    }));

  // Gas distribution
  const gasBuckets = summary.gas_buckets || {};
  const gasDistribution = [
    { name: '≥100G', value: gasBuckets.gte_100 || 0 },
    { name: '≥150G', value: gasBuckets.gte_150 || 0 },
    { name: '≥200G', value: gasBuckets.gte_200 || 0 },
    { name: '≥300G', value: gasBuckets.gte_300 || 0 }
  ];

  // Gas oracle data
  const baseFee = gas?.base_fee ? (gas.base_fee / 1e9).toFixed(2) : '—';
  const priorityFees = {
    rapid: gas?.tips?.['1_block'] || 0,
    fast: gas?.tips?.['3_blocks'] || 0,
    standard: gas?.tips?.['5_blocks'] || 0
  };

  // Mempool health indicators
  const congestionLevel = summary.total_pending > 150 ? 'HIGH' :
                          summary.total_pending > 75 ? 'MEDIUM' : 'LOW';
  const congestionColor = congestionLevel === 'HIGH' ? 'text-red-400' :
                          congestionLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';
  const avgWaitTime = summary.age_p50?.toFixed(1) || '—';

  // Top Senders by Volume columns with ranking colors
  const volumeColumns = [
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
      key: 'volume',
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
      key: 'count',
      header: 'Tx Count',
      render: (value: number) => value.toLocaleString(),
      className: 'text-blue-400 font-mono'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
          <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">PENDING</div>
          <div className="text-emerald-400 font-mono text-[10px] font-bold">{summary.total_pending || 0}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
          <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">BASE FEE</div>
          <div className="text-amber-400 font-mono text-[10px] font-bold">{baseFee}G</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
          <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">CONGESTION</div>
          <div className={`font-mono text-[10px] font-bold ${congestionColor}`}>{congestionLevel}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
          <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">SUCCESS</div>
          <div className="text-sky-400 font-mono text-[10px] font-bold">
            {summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—'}%
          </div>
        </div>
      </div>

      {/* Gas Oracle & Mempool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Gas Oracle */}
        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">⛽</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                GAS ORACLE
              </h2>
            </div>
          </div>
          <div className="p-1.5">
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
                <div className="text-gray-600 font-mono text-[7px] tracking-widest mb-0.5">RAPID</div>
                <div className="text-red-400 font-mono text-[9px] font-bold">{priorityFees.rapid}</div>
                <div className="text-gray-700 font-mono text-[6px]">~15s</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
                <div className="text-gray-600 font-mono text-[7px] tracking-widest mb-0.5">FAST</div>
                <div className="text-yellow-400 font-mono text-[9px] font-bold">{priorityFees.fast}</div>
                <div className="text-gray-700 font-mono text-[6px]">~45s</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-1.5 py-1">
                <div className="text-gray-600 font-mono text-[7px] tracking-widest mb-0.5">STANDARD</div>
                <div className="text-green-400 font-mono text-[9px] font-bold">{priorityFees.standard}</div>
                <div className="text-gray-700 font-mono text-[6px]">~75s</div>
              </div>
            </div>

            <div className="mt-1.5 bg-gray-900 border border-gray-800 px-1.5 py-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-gray-400 font-mono text-[6px] tracking-widest">TREND (60s)</span>
                <span className="text-cyan-400 font-mono text-[6px]">{baseFee}G</span>
              </div>
              {gasPriceHistory.length > 0 && (
                <SparklineChart data={gasPriceHistory} color="#06b6d4" height={30} />
              )}
            </div>
          </div>
        </div>

        {/* Mempool Health */}
        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">🏥</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                MEMPOOL HEALTH
              </h2>
            </div>
          </div>
          <div className="p-1.5">
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-gray-900 border border-gray-800 px-1 py-0.5">
                <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">CONGESTION</div>
                <div className={`font-mono text-[8px] font-bold ${congestionColor}`}>{congestionLevel}</div>
                <div className="text-gray-700 font-mono text-[5px]">{summary.total_pending} pending</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-1 py-0.5">
                <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">AVG WAIT</div>
                <div className="text-blue-400 font-mono text-[8px] font-bold">{avgWaitTime}s</div>
                <div className="text-gray-700 font-mono text-[5px]">P50 latency</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-1 py-0.5">
                <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">SUCCESS</div>
                <div className="text-green-400 font-mono text-[8px] font-bold">
                  {summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—'}%
                </div>
                <div className="text-gray-700 font-mono text-[5px]">Inclusion</div>
              </div>
              <div className="bg-gray-900 border border-gray-800 px-1 py-0.5">
                <div className="text-gray-600 font-mono text-[6px] tracking-widest mb-0.5">RPC</div>
                <div className="text-purple-400 font-mono text-[8px] font-bold">
                  {status?.rpc_latency_ms || '—'}ms
                </div>
                <div className="text-gray-700 font-mono text-[5px]">Response</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Gas Distribution & Ingress/Egress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">📊</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                GAS PRICE DISTRIBUTION
              </h2>
            </div>
          </div>
          <div className="p-2">
            <div className="space-y-2">
              {gasDistribution.map((item, index) => {
                const maxValue = Math.max(...gasDistribution.map(d => d.value));
                const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

                return (
                  <div key={index} className="flex items-center gap-2">
                    <div className="text-gray-400 font-mono text-[6px] w-10 truncate">
                      {item.name}
                    </div>
                    <div className="flex-1 bg-gray-800 rounded-sm h-3 relative">
                      <div
                        className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-sm transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <div className="text-cyan-400 font-mono text-[6px] w-10 text-right">
                      {item.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
            {gasDistribution.length === 0 && (
              <div className="text-gray-600 font-mono text-[7px] text-center py-4">
                [NO GAS DATA]
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">📈</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                INGRESS/EGRESS RATES
              </h2>
            </div>
          </div>
          <div className="p-2">
            {ingressHistory.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <TimeSeriesChart
                    data={ingressHistory.slice(-10)}
                    lines={[
                      { dataKey: 'ingress', color: '#10b981', name: 'Ingress' },
                      { dataKey: 'egress', color: '#ef4444', name: 'Egress' }
                    ]}
                    height={100}
                  />
                </div>

                {/* Current Values */}
                <div className="flex justify-between items-center text-[6px] font-mono">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">IN:</span>
                    <span className="text-gray-300">{ingressHistory[ingressHistory.length - 1]?.ingress || 0}/s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="text-red-400">OUT:</span>
                    <span className="text-gray-300">{ingressHistory[ingressHistory.length - 1]?.egress || 0}/s</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600 font-mono text-[7px] text-center py-6">
                [NO FLOW DATA]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2: Transaction Types & Protocol Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">🏷️</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                TX TYPE DISTRIBUTION
              </h2>
            </div>
          </div>
          <div className="p-2">
            {/* Custom TX Type Visualization - Vertical Bars (different from gas distribution) */}
            <div className="flex flex-col items-center">
              <div className="grid grid-cols-3 gap-1 w-full max-h-24 overflow-y-auto">
                {protocolData.map((item, index) => {
                  const percentage = protocolData.length > 0 ? (item.value / protocolData.reduce((sum, d) => sum + d.value, 0)) * 100 : 0;
                  const barHeight = Math.max(percentage * 0.8, 4); // Minimum 4px height

                  return (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div className="text-gray-400 font-mono text-[6px] text-center w-full truncate" title={item.name}>
                        {item.name.length > 8 ? `${item.name.substring(0, 8)}...` : item.name}
                      </div>
                      <div className="bg-gray-800 rounded-sm w-4 h-12 relative flex items-end">
                        <div
                          className="bg-gradient-to-t from-sky-600 to-sky-400 w-full rounded-sm transition-all duration-300"
                          style={{ height: `${barHeight}%` }}
                        />
                      </div>
                      <div className="text-sky-400 font-mono text-[6px] text-center">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {protocolData.length === 0 && (
              <div className="text-gray-600 font-mono text-[7px] text-center py-4">
                [NO TX TYPE DATA]
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">🔮</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                PROTOCOL USAGE
              </h2>
            </div>
          </div>
          <div className="p-2">
            {protocolData.length > 0 ? (
              <div className="space-y-2">
                {/* Mini Pie Chart */}
                <div className="flex justify-center">
                  <PieChart data={protocolData.slice(0, 5)} height={120} innerRadius={25} />
                </div>

                {/* Protocol Legend */}
                <div className="grid grid-cols-1 gap-1 max-h-20 overflow-y-auto">
                  {protocolData.slice(0, 6).map((item, index) => {
                    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-gray-400 font-mono text-[6px] truncate flex-1">
                          {item.name}
                        </span>
                        <span className="text-gray-500 font-mono text-[6px] w-8 text-right">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-gray-600 font-mono text-[7px] text-center py-6">
                [NO PROTOCOL DATA]
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Contracts & Top Senders by Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">🏛️</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                TOP CONTRACTS
              </h2>
              <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700">
                {topContracts.length} ACTIVE
              </div>
            </div>
          </div>
          <div className="p-1.5">
            <Table
              data={topContracts.map(([address, count]) => ({ address, count }))}
              columns={[
                {
                  key: 'rank',
                  header: '#',
                  render: (_: any, __: any, index: number) => (index + 1).toString(),
                  className: 'text-cyan-400 font-mono font-bold'
                },
                {
                  key: 'address',
                  header: 'Address',
                  render: (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`,
                  className: 'font-mono text-cyan-400'
                },
                {
                  key: 'count',
                  header: 'Txs',
                  render: (value: number) => value.toString(),
                  className: 'text-cyan-400 font-mono'
                }
              ]}
              emptyMessage="[NO CONTRACT ACTIVITY]"
              density="compact"
            />
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800">
          <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
            <div className="flex items-center gap-1">
              <span className="text-emerald-400 text-[8px]">👤</span>
              <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
                TOP SENDERS BY ACTIVITY
              </h2>
              <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700">
                {topSenders.length} ACTIVE
              </div>
            </div>
          </div>
          <div className="p-1.5">
            <Table
              data={topSenders.map(([address, count]) => ({ address, count }))}
              columns={[
                {
                  key: 'rank',
                  header: '#',
                  render: (_: any, __: any, index: number) => (index + 1).toString(),
                  className: 'text-purple-400 font-mono font-bold'
                },
                {
                  key: 'address',
                  header: 'Address',
                  render: (value: string) => `${value.slice(0, 6)}...${value.slice(-4)}`,
                  className: 'font-mono text-purple-400'
                },
                {
                  key: 'count',
                  header: 'Txs',
                  render: (value: number) => value.toString(),
                  className: 'text-purple-400 font-mono'
                }
              ]}
              emptyMessage="[NO SENDER ACTIVITY]"
              density="compact"
            />
          </div>
        </div>
      </div>

      {/* Top Senders by Volume */}
      <div className="bg-gray-900 border border-gray-800">
        <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
          <div className="flex items-center gap-1">
            <span className="text-emerald-400 text-[8px]">💎</span>
            <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">
              TOP SENDERS BY VOLUME
            </h2>
            <div className="px-1 py-0.5 bg-emerald-900 text-emerald-300 text-[6px] font-mono border border-emerald-700">
              {topSendersByVolume.length} HIGH VALUE
            </div>
          </div>
        </div>
        <div className="p-1.5">
          <Table
            data={topSendersByVolume}
            columns={volumeColumns}
            emptyMessage="[NO VOLUME DATA...]"
            density="compact"
          />
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="bg-gray-900 border border-gray-800 px-2 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-green-400 text-[8px]">🔗</span>
            <span className="text-gray-400 font-mono text-[7px] tracking-widest">WEBSOCKET</span>
          </div>
          <div className="text-green-400 font-mono text-[8px] font-bold">CONNECTED</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-2 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-blue-400 text-[8px]">📡</span>
            <span className="text-gray-400 font-mono text-[7px] tracking-widest">SUBSCRIPTIONS</span>
          </div>
          <div className="text-blue-400 font-mono text-[8px] font-bold">{(status?.subscriptions_active || []).length}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 px-2 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`${(status?.errors || []).length ? 'text-red-400' : 'text-green-400'} text-[8px]`}>
              {(status?.errors || []).length ? '🚨' : '✅'}
            </span>
            <span className="text-gray-400 font-mono text-[7px] tracking-widest">ERRORS</span>
          </div>
          <div className={`font-mono text-[8px] font-bold ${(status?.errors || []).length ? 'text-red-400' : 'text-green-400'}`}>
            {(status?.errors || []).length}
          </div>
        </div>
      </div>
    </div>
  );
}
