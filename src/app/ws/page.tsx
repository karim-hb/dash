'use client';

import { useMemo, useState } from 'react';

import OverviewTab from './components/OverviewTab';
import InclusionTab from './components/InclusionTab';
import MetricsTab from './components/MetricsTab';
import PredictionsTab from './components/PredictionsTab';
import DeFiTab from './components/DeFiTab';
import PoolsTab from './components/PoolsTab';
import TransactionsTab from './components/TransactionsTab';
import TrackedTab from './components/TrackedTab';
import { useWebSocketDashboard } from './hooks';

type DashboardView =
  | 'overview'
  | 'transactions'
  | 'tracked'
  | 'predictions'
  | 'inclusion'
  | 'defi'
  | 'pools'
  | 'metrics';

const tabs: Array<{ id: DashboardView; label: string; sublabel: string; icon: string }> = [
  { id: 'overview', label: 'Overview', sublabel: 'Network pulse', icon: '🛰️' },
  { id: 'transactions', label: 'Transactions', sublabel: 'Live stream', icon: '🚀' },
  { id: 'tracked', label: 'Tracked', sublabel: 'Smart monitoring', icon: '🎯' },
  { id: 'predictions', label: 'Predictions', sublabel: 'Gas forecast', icon: '🔮' },
  { id: 'inclusion', label: 'Inclusion', sublabel: 'In-flight analysis', icon: '📊' },
  { id: 'defi', label: 'DeFi', sublabel: 'Credit & farming', icon: '🏦' },
  { id: 'pools', label: 'Pools', sublabel: 'AMM landscape', icon: '🌊' },
  { id: 'metrics', label: 'Metrics', sublabel: 'Decoders & events', icon: '📈' },
];

export default function WebSocketDashboardPage() {
  const { state, overviewMetrics } = useWebSocketDashboard();
  const [activeTab, setActiveTab] = useState<DashboardView>('overview');

  const subtitle = useMemo(() => {
    switch (activeTab) {
      case 'overview':
        return 'Real-time performance intelligence';
      case 'transactions':
        return 'Live mempool transactions curated for value';
      case 'tracked':
        return 'High-value flows monitored for inclusion timing';
      case 'predictions':
        return 'Gas market trajectory for the next blocks';
      case 'inclusion':
        return 'Inclusion likelihood across mempool segments';
      case 'defi':
        return 'Protocol credit, leverage, and yield signals';
      case 'pools':
        return 'AMM liquidity heatmap & flow diagnostics';
      case 'metrics':
        return 'Decoder coverage & WebSocket activity log';
      default:
        return '';
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-[20px]">🌐</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#C9D1D9] tracking-[0.2em] uppercase">WebSocket Overview</h1>
              <p className="text-sm text-[#8B949E] tracking-widest">{subtitle}</p>
            </div>
          </div>
        </header>

        <nav className="flex flex-wrap gap-3 bg-[#111827] border border-[#1F2937] rounded-xl px-3 py-2 shadow-inner shadow-black/40">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-start px-4 py-2 rounded-lg border transition-all duration-150 ${
                  isActive
                    ? 'border-[#0066FF]/60 bg-[#1f2937] text-[#C9D1D9] shadow-lg shadow-black/30'
                    : 'border-transparent text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#162036]'
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.25em] uppercase">
                  <span>{tab.icon}</span>
                  {tab.label}
                </span>
                <span className="text-[11px] text-[#8B949E] tracking-widest">{tab.sublabel}</span>
              </button>
            );
          })}
        </nav>

        <section className="space-y-4">
          {activeTab === 'overview' && (
            <OverviewTab
              snapshot={state.snapshot}
              price={state.price}
              pool={state.pool}
              accuracy={state.accuracy}
              predictions={state.predictions}
              connected={state.connected}
              reconnecting={state.reconnecting}
              lastUpdated={state.lastUpdated}
              baseFeeSeries={overviewMetrics.baseFeeSeries}
              confidenceSeries={overviewMetrics.confidenceSeries}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={state.transactions}
              emptyMessage="[No live transactions streamed yet]"
            />
          )}

          {activeTab === 'tracked' && <TrackedTab tracked={state.tracked} />}

          {activeTab === 'predictions' && <PredictionsTab predictions={state.predictions} />}

          {activeTab === 'inclusion' && (
            <InclusionTab
              inclusion={state.predictions?.inclusionMapping}
              mempool={state.predictions?.mempoolStats}
            />
          )}

          {activeTab === 'defi' && <DeFiTab />}

          {activeTab === 'pools' && <PoolsTab />}

          {activeTab === 'metrics' && (
            <MetricsTab metrics={state.metrics} snapshot={state.snapshot} events={state.events} />
          )}
        </section>
      </div>
    </div>
  );
}

