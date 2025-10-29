'use client';

import { useState } from 'react';
import Summary from './components/Summary';
import Opportunities from './components/Opportunities';
import Live from './components/Live';
import Included from './components/Included';
import Gas from './components/Gas';
import Contracts from './components/Contracts';
import Senders from './components/Senders';
import Status from './components/Status';
import FilterPanel from './components/FilterPanel';

type TabType = 'summary' | 'opportunities' | 'live' | 'included' | 'gas' | 'contracts' | 'senders' | 'status';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs = [
    { id: 'summary', label: 'SUMMARY', component: Summary },
    { id: 'opportunities', label: 'OPPORTUNITIES', component: Opportunities },
    { id: 'live', label: 'LIVE', component: Live },
    { id: 'included', label: 'INCLUDED', component: Included },
    { id: 'gas', label: 'GAS', component: Gas },
    { id: 'contracts', label: 'CONTRACTS', component: Contracts },
    { id: 'senders', label: 'SENDERS', component: Senders },
    { id: 'status', label: 'STATUS', component: Status },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Summary;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-[1600px] xl:max-w-[1920px] 2xl:max-w-[2200px]">
      {/* Bloomberg Terminal Header */}
      <header className="bloomberg-card m-4 mb-0 bloomberg-header">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            {/* Terminal-style logo */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-80"></div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 rounded-lg flex items-center justify-center">
                <span className="text-cyan-400 font-bold text-xl">Ξ</span>
              </div>
              <div>
                <h1 className="terminal-title text-2xl bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                  ETHEREUM MEMPOOL TERMINAL
                </h1>
                <div className="terminal-subtitle text-sm">
                  [v2.0.1] • Real-time Transaction Monitoring System
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="status-indicator live"></div>
              <span className="terminal-label text-green-400">LIVE</span>
            </div>
            <div className="terminal-label text-slate-400">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="mx-4 mt-4">
        <div className="bloomberg-section p-3">
          <div className="flex overflow-x-auto gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-5 py-2.5 terminal-label font-semibold rounded whitespace-nowrap border ${
                  activeTab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'text-slate-400 border-slate-600/30 hover:text-white hover:bg-slate-800/30 hover:border-slate-500/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Filters Panel */}
      <div className="mx-4 mt-4">
        <FilterPanel />
      </div>

      {/* Main Content Area - Bloomberg Terminal */}
      <main className="flex-1 mx-4 mb-4 mt-4 min-h-[600px]">
        <div className="bloomberg-card overflow-hidden">
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <ActiveComponent />
          </div>
        </div>
      </main>

      {/* Bloomberg Footer */}
      <footer className="mx-4 mb-4 bloomberg-card">
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-6 terminal-subtitle text-sm">
            <span>Web3 Terminal Interface</span>
            <span className="text-slate-600">•</span>
            <span>Next.js + WebSocket</span>
            <span className="text-slate-600">•</span>
            <span>Real-time Data Pipeline</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="terminal-label text-green-400">CONNECTED</span>
            </div>
            <div className="terminal-label text-slate-500">
              [ESC] Help • [F1] Settings • [F12] Dev
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}