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

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-full">
      {/* Bloomberg Terminal Header */}
      <header className="bg-black border-b border-gray-800 px-2 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-emerald-400 font-mono text-[10px] font-bold tracking-wider">
              Ξ ETHEREUM TERMINAL v3.0.0
            </div>
            <div className="text-gray-700 font-mono text-[8px] tracking-wide">
              BLOOMBERG-STYLE ANALYTICS
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              <span className="text-emerald-400 font-mono text-[8px] tracking-wide">LIVE</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
              <span className="text-sky-400 font-mono text-[8px] tracking-wide">SYNC</span>
            </div>
            <div className="text-gray-600 font-mono text-[8px] tracking-wide">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-black border-b border-gray-800 px-2 py-0.5">
        <div className="flex gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`font-mono text-[9px] px-2 py-1 border-b transition-colors tracking-wider ${
                activeTab === tab.id
                  ? 'text-emerald-400 border-emerald-500 bg-gray-900'
                  : 'text-gray-600 border-transparent hover:text-gray-400 hover:border-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Filters Panel */}
      <div className="px-3 py-1 bg-black border-b border-gray-800">
        <FilterPanel />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 px-3 py-2">
        <div className="bg-black border border-gray-800">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <ActiveComponent />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 px-2 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-emerald-600 rounded-full"></div>
              <span className="text-emerald-400 font-mono text-[8px] tracking-widest">WS SUB</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-sky-600 rounded-full"></div>
              <span className="text-sky-400 font-mono text-[8px] tracking-widest">SYNC</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
              <span className="text-gray-600 font-mono text-[8px] tracking-widest">NO ERR</span>
            </div>
          </div>

          <div className="text-gray-700 font-mono text-[7px] tracking-widest">
            BLOOMBERG TERMINAL v3.0.0
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}