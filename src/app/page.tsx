'use client';

import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Opportunities from './components/Opportunities';
import Live from './components/Live';
import Included from './components/Included';
import Tokens from './components/Tokens';
import Pools from './components/Pools';
import Oracles from './components/Oracles';
import FilterPanel from './components/FilterPanel';

type TabType = 'dashboard' | 'opportunities' | 'live' | 'included' | 'tokens' | 'pools' | 'oracles';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 ANALYTICS TERMINAL', component: Dashboard },
    { id: 'opportunities', label: '💎 OPPORTUNITIES', component: Opportunities },
    { id: 'live', label: '🔴 LIVE FEED', component: Live },
    { id: 'included', label: '✅ INCLUDED', component: Included },
    { id: 'tokens', label: '💹 TOKENS', component: Tokens },
    { id: 'pools', label: '🏦 POOLS', component: Pools },
    { id: 'oracles', label: '🛰️ ORACLES', component: Oracles },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;
  console.log("render main component")
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <div className="max-w-full">
      {/* Bloomberg Terminal Header */}
      <header className="bg-[#0D1117] border-b-2 border-[#0066FF] px-5 py-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-1.5 h-8 bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.5)]"></div>
            <div className="text-[#0066FF] font-mono text-[15px] font-bold tracking-[0.15em]">
              Ξ BLOOMBERG TERMINAL v3.0.0
            </div>
            <div className="text-[#8B949E] font-mono text-[10px] tracking-wide border-l-2 border-[#21262D] pl-4">
              ETHEREUM ANALYTICS PLATFORM
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#00FF66] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.6)]"></div>
              <span className="text-[#00FF66] font-mono text-[10px] font-bold tracking-wide">LIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,102,255,0.6)]"></div>
              <span className="text-[#0066FF] font-mono text-[10px] font-bold tracking-wide">SYNC</span>
            </div>
            <div className="text-[#C9D1D9] font-mono text-[11px] font-bold tracking-wide border-l-2 border-[#21262D] pl-4">
              {new Date().toLocaleTimeString('en-US', { hour12: false, timeZone: 'America/New_York' })} EST
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#161B22] border-b border-[#21262D] px-5 py-2.5">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`font-mono text-[11px] px-6 py-3 border-b-2 transition-all tracking-wider font-bold rounded-t ${
                activeTab === tab.id
                  ? 'text-[#0D1117] bg-[#0066FF] border-[#0066FF] shadow-[0_4px_12px_rgba(0,102,255,0.4)]'
                  : 'text-[#8B949E] border-transparent hover:text-[#0066FF] hover:bg-[#21262D] hover:border-[#0066FF]/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Filters Panel */}
      <div className="px-4 py-2 bg-[#0D1117] border-b border-[#21262D]">
        <FilterPanel />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-4 py-3">
        <div className="bg-[#0D1117] border border-[#21262D] shadow-xl">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <ActiveComponent />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0D1117] border-t-2 border-[#0066FF] px-5 py-3.5 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#00FF66] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,255,102,0.6)]"></div>
              <span className="text-[#00FF66] font-mono text-[10px] font-bold tracking-wide">WS ACTIVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#0066FF] rounded-full animate-pulse shadow-[0_0_6px_rgba(0,102,255,0.6)]"></div>
              <span className="text-[#0066FF] font-mono text-[10px] font-bold tracking-wide">RPC SYNC</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 bg-[#8B949E] rounded-full"></div>
              <span className="text-[#8B949E] font-mono text-[10px] font-bold tracking-wide">NO ERRORS</span>
            </div>
            <div className="text-[#C9D1D9] font-mono text-[9px] border-l-2 border-[#21262D] pl-4">
              ETH/USD: $3,856.42 | BTC/USD: $69,420.15
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-[#0066FF] font-mono text-[10px] font-bold tracking-[0.15em]">
              BLOOMBERG TERMINAL v3.0.0
            </div>
            <div className="w-1.5 h-5 bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.5)]"></div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}