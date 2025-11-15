'use client';

import { useEffect, useState } from 'react';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Card from './Card';

const API_BASE = 'http://127.0.0.1:3000';

type ApiSummary = {
  loading: boolean;
  error: string | null;
  flashloans: number;
  lendingMarkets: number;
  farmingPools: number;
  dexPairs: number;
  dexPools: number;
  dexProtocols: number;
};

async function fetchCount(path: string): Promise<number> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache',
    },
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  const json = await res.json();
  if (Array.isArray(json)) return json.length;
  if (json && typeof json === 'object') return Object.keys(json).length;
  return 0;
}

export default function Summary() {
  const { snapshot } = useWsSnapshot();
  const [apiSummary, setApiSummary] = useState<ApiSummary>({
    loading: true,
    error: null,
    flashloans: 0,
    lendingMarkets: 0,
    farmingPools: 0,
    dexPairs: 0,
    dexPools: 0,
    dexProtocols: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [flashloanCount, lendingCount, farmingCount, pairCount, poolCount, tvlCount] = await Promise.all([
          fetchCount('/flashloans'),
          fetchCount('/lending/markets'),
          fetchCount('/farming/pools'),
          fetchCount('/pairs'),
          fetchCount('/pools'),
          fetchCount('/tvl'),
        ]);
        if (cancelled) return;
        setApiSummary({
          loading: false,
          error: null,
          flashloans: flashloanCount,
          lendingMarkets: lendingCount,
          farmingPools: farmingCount,
          dexPairs: pairCount,
          dexPools: poolCount,
          dexProtocols: tvlCount,
        });
      } catch (error) {
        if (cancelled) return;
        setApiSummary((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to reach API',
        }));
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!snapshot) {
    return (
      <Card
        title="SUMMARY"
        icon={<span className="text-green-400">📊</span>}
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <span className="ml-3 text-gray-400">Connecting to WebSocket...</span>
        </div>
      </Card>
    );
  }

  const { summary, status: snapshotStatus } = snapshot;
  const rpcLatency = snapshotStatus?.rpc_latency_ms ?? 'N/A';

  const stats = [
    {
      label: 'Pending',
      value: summary.total_pending || 0,
      icon: '📥',
      colorClass: 'text-blue-400',
      description: 'Transactions waiting'
    },
    {
      label: 'Queued',
      value: summary.total_queued || 0,
      icon: '⏳',
      colorClass: 'text-orange-400',
      description: 'In queue'
    },
    {
      label: 'Ingress/sec',
      value: summary.ingress_per_sec?.toFixed(1) || '0.0',
      icon: '⬆️',
      colorClass: 'text-green-400',
      description: 'Transactions per second'
    },
    {
      label: 'Egress/sec',
      value: summary.egress_per_sec?.toFixed(1) || '0.0',
      icon: '⬇️',
      colorClass: 'text-red-400',
      description: 'Processed per second'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Key Metrics Grid - Compact Bloomberg Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="glass-card border border-slate-700/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{stat.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-400 font-mono uppercase tracking-wider leading-tight">{stat.label}</p>
                <p className={`text-lg font-bold font-mono ${stat.colorClass} leading-tight`}>
                  {stat.value}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-mono leading-tight">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Gas & Network Analysis */}
      <div className="terminal-grid terminal-grid-2">
        <Card
          title="GAS ANALYSIS"
          icon={<span className="text-blue-400">⛽</span>}
          variant="terminal"
        >
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-mono font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                [GAS BUCKETS]
              </h4>
              <div className="space-y-3">
                {summary.gas_buckets && Object.entries(summary.gas_buckets).map(([bucket, count]) => (
                  <div key={bucket} className="flex justify-between items-center text-sm font-mono">
                    <span className="text-slate-400">≥{bucket.replace('gte_', '')}G</span>
                    <span className="terminal-badge">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-mono font-semibold text-orange-300 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                [NETWORK HEALTH]
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-slate-400">P50 AGE</span>
                  <span className="text-slate-200">{summary.age_p50?.toFixed(1) || 'N/A'}s</span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-slate-400">P90 AGE</span>
                  <span className="text-slate-200">{summary.age_p90?.toFixed(1) || 'N/A'}s</span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-slate-400">SUCCESS RATE</span>
                  <span className="text-slate-200">{summary.success_rate ? (summary.success_rate * 100).toFixed(1) : 'N/A'}%</span>
                </div>
                <div className="flex justify-between items-center text-sm font-mono">
                  <span className="text-slate-400">WS LATENCY</span>
                  <span className="text-slate-200">{rpcLatency}{typeof rpcLatency === 'number' ? 'ms' : ''}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="FLOW ANALYSIS"
          icon={<span className="text-purple-400">🌊</span>}
          variant="terminal"
        >
          <div className="space-y-3">
            {/* Flow Metrics Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { type: 'ingress', label: 'INGRESS', icon: '⬆️', color: 'text-green-400', value: summary.ingress_per_sec || 0 },
                { type: 'egress', label: 'EGRESS', icon: '⬇️', color: 'text-blue-400', value: summary.egress_per_sec || 0 },
                { type: 'pending', label: 'PENDING', icon: '⏳', color: 'text-yellow-400', value: summary.total_pending || 0 },
                { type: 'queued', label: 'QUEUED', icon: '📋', color: 'text-orange-400', value: summary.total_queued || 0 }
              ].map((item) => (
                <div key={item.type} className="glass-card border border-slate-700/30 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400 uppercase">
                      {item.label}
                    </span>
                    <span className="text-sm">{item.icon}</span>
                  </div>
                  <div className={`text-lg font-bold font-mono ${item.color}`}>
                    {typeof item.value === 'number' && item.value < 10 ? item.value.toFixed(1) : item.value}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">
                    {item.type === 'ingress' || item.type === 'egress' ? '/sec' : 'total'}
                  </div>
                </div>
              ))}
            </div>

            {/* Network Health Summary */}
            <div className="glass-card border border-slate-700/30 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-cyan-400">📊</span>
                <span className="text-sm font-mono font-semibold text-slate-300">[NETWORK HEALTH]</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">SUCCESS RATE</div>
                  <div className="text-green-400 font-mono font-semibold">
                    {summary.success_rate ? (summary.success_rate * 100).toFixed(0) : '—'}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">P50 LATENCY</div>
                  <div className="text-blue-400 font-mono font-semibold">
                    {summary.age_p50?.toFixed(1) || '—'}s
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">P90 LATENCY</div>
                  <div className="text-orange-400 font-mono font-semibold">
                    {summary.age_p90?.toFixed(1) || '—'}s
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">CONGESTION</div>
                  <div className={`font-mono font-semibold ${
                    summary.total_pending > 100 ? 'text-red-400' :
                    summary.total_pending > 50 ? 'text-yellow-400' : 'text-green-400'
                  }`}>
                    {summary.total_pending > 100 ? 'HIGH' :
                     summary.total_pending > 50 ? 'MEDIUM' : 'LOW'}
                  </div>
                </div>
              </div>
          </div> </div>
        </Card>
      </div>

      {/* State Distribution - Compact */}
      {summary.state_counts && Object.keys(summary.state_counts).length > 0 && (
        <div className="glass-card border border-slate-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-cyan-400">📊</span>
            <span className="text-sm font-mono font-semibold text-slate-300">[TRANSACTION STATES]</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(summary.state_counts).map(([state, count]) => {
              const stateCounts = summary.state_counts ?? {};
              const total = Object.values(stateCounts).reduce((acc, value) => acc + Number(value ?? 0), 0);
              const percentage = total > 0 ? ((count as number) / total * 100) : 0;
              return (
                <div key={state} className="text-center p-2 glass-card border border-slate-700/20">
                  <div className="text-lg font-bold font-mono text-white">{count as number}</div>
                  <div className="text-xs text-slate-400 font-mono uppercase">{state.toLowerCase()}</div>
                  <div className="text-xs text-cyan-400 font-mono">{percentage.toFixed(0)}%</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Types - Compact */}
      {summary.by_type && Object.keys(summary.by_type).length > 0 && (
        <div className="glass-card border border-slate-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-yellow-400">🏷️</span>
            <span className="text-sm font-mono font-semibold text-slate-300">[TRANSACTION TYPES]</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Object.entries(summary.by_type)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 8)
              .map(([type, count]) => (
                <div key={type} className="flex items-center justify-between p-2 glass-card border border-slate-700/20">
                  <span className="text-slate-300 font-mono text-xs truncate mr-2">{type}</span>
                  <span className="terminal-badge text-xs">{count as number}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="glass-card border border-slate-700/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sky-400 text-sm">🛰️</span>
            <span className="text-sm font-mono font-semibold text-slate-300 uppercase tracking-widest">
              API COVERAGE
            </span>
          </div>
          {apiSummary.loading && <span className="text-[10px] text-[#58A6FF]">Fetching…</span>}
          {apiSummary.error && !apiSummary.loading && (
            <span className="text-[10px] text-rose-400">{apiSummary.error}</span>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs text-slate-400 font-mono">
          <ApiMetric label="Flashloans" value={apiSummary.flashloans} loading={apiSummary.loading} />
          <ApiMetric label="Lending markets" value={apiSummary.lendingMarkets} loading={apiSummary.loading} />
          <ApiMetric label="Farming pools" value={apiSummary.farmingPools} loading={apiSummary.loading} />
          <ApiMetric label="Tracked pairs" value={apiSummary.dexPairs} loading={apiSummary.loading} />
          <ApiMetric label="AMM pools" value={apiSummary.dexPools} loading={apiSummary.loading} />
          <ApiMetric label="DEX protocols" value={apiSummary.dexProtocols} loading={apiSummary.loading} />
        </div>
        <div className="mt-3 text-[10px] text-slate-500 font-mono">
          Explore <span className="text-sky-400">DeFi</span> and <span className="text-sky-400">Pools</span> tabs for deeper analytics powered by the core API.
        </div>
      </div>
    </div>
  );
}

function ApiMetric({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <div className="glass-card border border-slate-700/30 p-3">
      <div className="text-[9px] uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className="text-lg font-bold text-slate-200">
        {loading ? <span className="text-slate-500">…</span> : value.toLocaleString()}
      </div>
    </div>
  );
}
