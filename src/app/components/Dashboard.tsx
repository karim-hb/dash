'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import Table from './Table';
import SparklineChart from './charts/SparklineChart';
import BarChart from './charts/BarChart';
import TimeSeriesChart from './charts/TimeSeriesChart';
import HeatmapChart from './charts/HeatmapChart';
import PieChart from './charts/PieChart';
import AreaChart from './charts/AreaChart';
import ScatterPlot from './charts/ScatterPlot';
import { decodeAddress, getCategoryColor, getAddressLabel } from '../utils/addressDecoder';

export default function Dashboard() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  
  // Real-time data tracking (last 60 seconds)
  const [gasPriceHistory, setGasPriceHistory] = useState<number[]>([]);
  const [ingressHistory, setIngressHistory] = useState<Array<{ time: string; ingress: number; egress: number }>>([]);
  const [gasHeatmapData, setGasHeatmapData] = useState<Array<{ x: string; y: string; value: number }>>([]);

  useEffect(() => {
    if (snapshot?.gas?.base_fee) {
      const gasPrice = snapshot.gas.base_fee / 1e9;
      setGasPriceHistory(prev => {
        const newHistory = [...prev, gasPrice];
        return newHistory.slice(-60); // Keep last 60 data points
      });
    }

    if (snapshot?.summary) {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      setIngressHistory(prev => {
        const newHistory = [...prev, {
          time: timeStr,
          ingress: snapshot.summary.ingress_per_sec || 0,
          egress: snapshot.summary.egress_per_sec || 0
        }];
        return newHistory.slice(-20); // Keep last 20 data points (5 minutes at 15s intervals)
      });
    }
  }, [snapshot]);

  // Generate heatmap data for gas prices over time
  useEffect(() => {
    if (snapshot?.gas?.base_fee) {
      const now = new Date();
      const hour = now.getHours();
      const minute = Math.floor(now.getMinutes() / 10) * 10;
      const gasPrice = snapshot.gas.base_fee / 1e9;
      
      setGasHeatmapData(prev => {
        const key = `${hour}:${minute.toString().padStart(2, '0')}`;
        const existing = prev.find(d => d.x === key);
        
        if (existing) {
          return prev.map(d => d.x === key ? { ...d, value: gasPrice } : d);
        } else {
          const newData = [...prev, { x: key, y: 'Gas', value: gasPrice }];
          return newData.slice(-12); // Keep last 2 hours
        }
      });
    }
  }, [snapshot?.gas?.base_fee]);

  if (!snapshot) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-500 mx-auto mb-4"></div>
          <span className="text-slate-400 font-mono text-lg">CONNECTING TO MEMPOOL TERMINAL...</span>
          <div className="mt-4 text-slate-600 font-mono text-sm">Establishing WebSocket connection</div>
        </div>
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

  // Sender analysis
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

  // Protocol usage (transaction types)
  const protocolData = Object.entries(summary.by_type || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8)
    .map(([name, value]) => ({
      name: name.length > 15 ? name.slice(0, 15) + '...' : name,
      value: value as number,
      color: undefined
    }));

  // Transaction type distribution for bar chart
  const txTypeDistribution = Object.entries(summary.by_type || {})
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 6)
    .map(([name, value]) => ({
      name: name.length > 10 ? name.slice(0, 10) + '...' : name,
      value: value as number
    }));

  // Gas buckets for distribution
  const gasBuckets = summary.gas_buckets || {};
  const gasDistribution = [
    { name: '≥100G', value: gasBuckets.gte_100 || 0, color: '#10b981' },
    { name: '≥150G', value: gasBuckets.gte_150 || 0, color: '#f59e0b' },
    { name: '≥200G', value: gasBuckets.gte_200 || 0, color: '#f97316' },
    { name: '≥300G', value: gasBuckets.gte_300 || 0, color: '#ef4444' }
  ];

  // Mempool health indicators
  const congestionLevel = summary.total_pending > 150 ? 'HIGH' : 
                          summary.total_pending > 75 ? 'MEDIUM' : 'LOW';
  const congestionColor = congestionLevel === 'HIGH' ? 'text-red-400' :
                          congestionLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400';
  const avgWaitTime = summary.age_p50?.toFixed(1) || '—';
  
  // Gas oracle data
  const baseFee = gas?.base_fee ? (gas.base_fee / 1e9).toFixed(2) : '—';
  const priorityFees = {
    rapid: gas?.tips?.['1_block'] || 0,
    fast: gas?.tips?.['3_blocks'] || 0,
    standard: gas?.tips?.['5_blocks'] || 0
  };

  // Transaction value distribution (histogram data)
  const valueRanges = [
    { name: '0-0.01', min: 0, max: 0.01 },
    { name: '0.01-0.1', min: 0.01, max: 0.1 },
    { name: '0.1-1', min: 0.1, max: 1 },
    { name: '1-10', min: 1, max: 10 },
    { name: '>10', min: 10, max: Infinity }
  ];
  const valueDist = valueRanges.map(range => {
    const count = filteredTxs.filter(tx => {
      const value = tx.value ? Number(BigInt(tx.value)) / 1e18 : 0;
      return value >= range.min && value < range.max;
    }).length;
    return { name: range.name + ' ETH', value: count };
  });

  // State flow visualization data
  const stateFlowData = Object.entries(summary.state_counts || {}).map(([state, count]) => ({
    name: state.toUpperCase(),
    value: count as number
  }));

  const contractColumns = [
    {
      key: 'rank',
      header: 'RANK',
      render: (_: any, __: any, index: number) => (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold rounded-full font-mono shadow-lg">
          {index + 1}
        </span>
      ),
      className: 'w-16 text-center'
    },
    {
      key: 'address',
      header: 'CONTRACT',
      render: (value: string) => {
        const decoded = decodeAddress(value);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
              {decoded.label ? (
                <span className={`font-mono text-sm font-semibold ${getCategoryColor(decoded.category)}`}>
                  {decoded.label}
                </span>
              ) : (
                <span className="font-mono text-cyan-300 text-sm tracking-wider">
                  {value.slice(0, 8)}...{value.slice(-6)}
                </span>
              )}
            </div>
            {decoded.category && (
              <span className="text-xs text-slate-500 font-mono ml-4">
                {decoded.category}
              </span>
            )}
          </div>
        );
      },
      className: 'font-mono'
    },
    {
      key: 'count',
      header: 'TXS',
      render: (value: number) => (
        <span className="terminal-badge text-cyan-400 font-bold">{value}</span>
      ),
      className: 'text-center'
    }
  ];

  const senderColumns = [
    {
      key: 'rank',
      header: 'RANK',
      render: (_: any, __: any, index: number) => (
        <span className="inline-flex items-center justify-center w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold rounded-full font-mono shadow-lg">
          {index + 1}
        </span>
      ),
      className: 'w-16 text-center'
    },
    {
      key: 'address',
      header: 'SENDER',
      render: (value: string) => {
        const decoded = decodeAddress(value);
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              {decoded.label ? (
                <span className={`font-mono text-sm font-semibold ${getCategoryColor(decoded.category)}`}>
                  {decoded.label}
                </span>
              ) : (
                <span className="font-mono text-purple-300 text-sm tracking-wider">
                  {value.slice(0, 8)}...{value.slice(-6)}
                </span>
              )}
            </div>
            {decoded.category && (
              <span className="text-xs text-slate-500 font-mono ml-4">
                {decoded.category}
              </span>
            )}
          </div>
        );
      },
      className: 'font-mono'
    },
    {
      key: 'count',
      header: 'TXS',
      render: (value: number) => (
        <span className="terminal-badge text-purple-400 font-bold">{value}</span>
      ),
      className: 'text-center'
    }
  ];

  const volumeColumns = [
    ...senderColumns.slice(0, 2),
    {
      key: 'volume',
      header: 'VOLUME (ETH)',
      render: (value: number) => (
        <span className="terminal-badge text-emerald-400 font-bold">
          {value.toFixed(4)}
        </span>
      ),
      className: 'text-center'
    },
    {
      key: 'count',
      header: 'TXS',
      render: (value: number) => (
        <span className="terminal-badge text-blue-400 font-bold">{value}</span>
      ),
      className: 'text-center'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Stats - Bloomberg Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'PENDING TXS', 
            value: summary.total_pending || 0, 
            icon: '📥', 
            color: 'from-blue-500/20 to-cyan-500/20',
            textColor: 'text-cyan-400',
            trend: gasPriceHistory.length > 0 ? gasPriceHistory : []
          },
          { 
            label: 'QUEUED TXS', 
            value: summary.total_queued || 0, 
            icon: '⏳', 
            color: 'from-orange-500/20 to-yellow-500/20',
            textColor: 'text-yellow-400',
            trend: []
          },
          { 
            label: 'BASE FEE', 
            value: baseFee, 
            unit: 'GWEI',
            icon: '⛽', 
            color: 'from-purple-500/20 to-pink-500/20',
            textColor: 'text-pink-400',
            trend: gasPriceHistory
          },
          { 
            label: 'INGRESS/SEC', 
            value: summary.ingress_per_sec?.toFixed(1) || '0.0', 
            icon: '⬆️', 
            color: 'from-green-500/20 to-emerald-500/20',
            textColor: 'text-emerald-400',
            trend: ingressHistory.map(d => d.ingress)
          }
        ].map((stat, index) => (
          <div key={index} className={`glass-card border border-slate-700/50 p-5 bg-gradient-to-br ${stat.color} relative overflow-hidden group hover:scale-105 transition-transform duration-200`}>
            <div className="absolute top-0 right-0 text-6xl opacity-5 group-hover:opacity-10 transition-opacity">
              {stat.icon}
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg">{stat.icon}</span>
                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider border border-slate-600/50 px-2 py-1 rounded bg-black/20">
                  LIVE
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold mb-2">
                {stat.label}
              </div>
              <div className={`text-3xl font-bold font-mono ${stat.textColor} mb-2`}>
                {stat.value}
                {stat.unit && <span className="text-sm ml-1 text-slate-500">{stat.unit}</span>}
              </div>
              {stat.trend && stat.trend.length > 5 && (
                <SparklineChart data={stat.trend} color={stat.textColor.replace('text-', '#')} height={30} />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Gas Oracle & Mempool Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gas Oracle */}
        <Card title="⛽ GAS ORACLE" variant="terminal" className="border-2 border-cyan-500/30">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'RAPID', value: priorityFees.rapid, time: '~15s', color: 'from-red-500/20 to-orange-500/20', badge: 'text-red-400' },
                { label: 'FAST', value: priorityFees.fast, time: '~45s', color: 'from-yellow-500/20 to-orange-500/20', badge: 'text-yellow-400' },
                { label: 'STANDARD', value: priorityFees.standard, time: '~75s', color: 'from-green-500/20 to-blue-500/20', badge: 'text-green-400' }
              ].map((tier, idx) => (
                <div key={idx} className={`glass-card border border-slate-700/50 p-4 bg-gradient-to-br ${tier.color}`}>
                  <div className="text-xs text-slate-400 font-mono uppercase mb-2">{tier.label}</div>
                  <div className={`text-2xl font-bold font-mono ${tier.badge} mb-1`}>{tier.value}</div>
                  <div className="text-xs text-slate-500 font-mono">{tier.time}</div>
                </div>
              ))}
            </div>
            
            <div className="glass-card border border-slate-700/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono font-semibold text-slate-300">BASE FEE TREND (60s)</span>
                <span className="text-xs text-cyan-400 font-mono">{baseFee} GWEI</span>
              </div>
              {gasPriceHistory.length > 0 && (
                <SparklineChart data={gasPriceHistory} color="#06b6d4" height={60} />
              )}
            </div>
          </div>
        </Card>

        {/* Mempool Health */}
        <Card title="🏥 MEMPOOL HEALTH" variant="terminal" className="border-2 border-emerald-500/30">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card border border-slate-700/50 p-4">
                <div className="text-xs text-slate-400 font-mono uppercase mb-2">CONGESTION</div>
                <div className={`text-2xl font-bold font-mono ${congestionColor} mb-1`}>{congestionLevel}</div>
                <div className="text-xs text-slate-500 font-mono">{summary.total_pending} pending</div>
              </div>
              <div className="glass-card border border-slate-700/50 p-4">
                <div className="text-xs text-slate-400 font-mono uppercase mb-2">AVG WAIT</div>
                <div className="text-2xl font-bold font-mono text-blue-400 mb-1">{avgWaitTime}s</div>
                <div className="text-xs text-slate-500 font-mono">P50 latency</div>
              </div>
              <div className="glass-card border border-slate-700/50 p-4">
                <div className="text-xs text-slate-400 font-mono uppercase mb-2">SUCCESS RATE</div>
                <div className="text-2xl font-bold font-mono text-green-400 mb-1">
                  {summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—'}%
                </div>
                <div className="text-xs text-slate-500 font-mono">Inclusion rate</div>
              </div>
              <div className="glass-card border border-slate-700/50 p-4">
                <div className="text-xs text-slate-400 font-mono uppercase mb-2">RPC LATENCY</div>
                <div className="text-2xl font-bold font-mono text-purple-400 mb-1">
                  {status.rpc_latency_ms || '—'}ms
                </div>
                <div className="text-xs text-slate-500 font-mono">Response time</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1: Gas Distribution & Ingress/Egress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="📊 GAS PRICE DISTRIBUTION" variant="terminal">
          <BarChart data={gasDistribution} height={280} />
        </Card>
        
        <Card title="📈 INGRESS/EGRESS RATES (5min)" variant="terminal">
          {ingressHistory.length > 0 && (
            <TimeSeriesChart
              data={ingressHistory}
              lines={[
                { dataKey: 'ingress', color: '#10b981', name: 'Ingress' },
                { dataKey: 'egress', color: '#ef4444', name: 'Egress' }
              ]}
              height={280}
            />
          )}
        </Card>
      </div>

      {/* Charts Row 2: Transaction Types & Protocol Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🏷️ TX TYPE DISTRIBUTION" variant="terminal">
          <BarChart data={txTypeDistribution} height={280} />
        </Card>
        
        <Card title="🔮 PROTOCOL USAGE" variant="terminal">
          {protocolData.length > 0 && (
            <PieChart data={protocolData} height={280} innerRadius={50} />
          )}
        </Card>
      </div>

      {/* Charts Row 3: Transaction Value Distribution & State Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="💰 TX VALUE DISTRIBUTION" variant="terminal">
          <BarChart data={valueDist} height={280} />
        </Card>
        
        <Card title="🌊 TRANSACTION STATE FLOW" variant="terminal">
          {stateFlowData.length > 0 && (
            <PieChart data={stateFlowData} height={280} />
          )}
        </Card>
      </div>

      {/* Gas Price Heatmap */}
      {gasHeatmapData.length > 0 && (
        <Card title="🔥 GAS PRICE HEATMAP (2h)" variant="terminal">
          <div className="overflow-x-auto">
            <HeatmapChart
              data={gasHeatmapData}
              width={800}
              height={100}
              colorScale={{ min: '#1e293b', max: '#06b6d4' }}
            />
          </div>
        </Card>
      )}

      {/* Top Contracts & Top Senders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="🏛️ TOP CONTRACTS (Interactions)" variant="terminal" badge={`${topContracts.length} ACTIVE`}>
          <Table
            data={topContracts.map(([address, count]) => ({ address, count }))}
            columns={contractColumns}
            emptyMessage="[NO CONTRACT ACTIVITY]"
          />
        </Card>
        
        <Card title="👤 TOP SENDERS (Activity)" variant="terminal" badge={`${topSenders.length} ACTIVE`}>
          <Table
            data={topSenders.map(([address, count]) => ({ address, count }))}
            columns={senderColumns}
            emptyMessage="[NO SENDER ACTIVITY]"
          />
        </Card>
      </div>

      {/* Top Senders by Volume */}
      <Card title="💎 TOP SENDERS BY VOLUME (Last Hour)" variant="terminal" badge={`${topSendersByVolume.length} HIGH VALUE`}>
        <Table
          data={topSendersByVolume}
          columns={volumeColumns}
          emptyMessage="[NO VOLUME DATA]"
        />
      </Card>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'WEBSOCKET', value: 'CONNECTED', icon: '🔗', status: 'success' },
          { label: 'SUBSCRIPTIONS', value: (status.subscriptions_active || []).length, icon: '📡', status: 'success' },
          { label: 'ERRORS', value: (status.errors || []).length, icon: status.errors?.length ? '🚨' : '✅', status: status.errors?.length ? 'error' : 'success' }
        ].map((item, idx) => (
          <div key={idx} className={`glass-card border p-4 ${
            item.status === 'success' ? 'border-green-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-xs font-mono text-slate-400 uppercase">{item.label}</div>
                  <div className={`text-lg font-mono font-bold ${
                    item.status === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
