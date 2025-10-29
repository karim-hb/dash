'use client';

import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Opportunities from './components/Opportunities';
import Live from './components/Live';
import Included from './components/Included';
import FilterPanel from './components/FilterPanel';

type TabType = 'dashboard' | 'opportunities' | 'live' | 'included';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const tabs = [
    { id: 'dashboard', label: '📊 ANALYTICS TERMINAL', component: Dashboard },
    { id: 'opportunities', label: '💎 OPPORTUNITIES', component: Opportunities },
    { id: 'live', label: '🔴 LIVE FEED', component: Live },
    { id: 'included', label: '✅ INCLUDED', component: Included },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Dashboard;

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="container mx-auto max-w-[1600px] xl:max-w-[1920px] 2xl:max-w-[2200px]">
      {/* Bloomberg Terminal Header */}
      <header className="bloomberg-card m-4 mb-0 bloomberg-header relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-cyan-500/5 to-blue-600/5 animate-pulse"></div>
        <div className="relative z-10 flex items-center justify-between p-6">
          <div className="flex items-center gap-6">
            {/* Terminal-style logo */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full opacity-80 animate-pulse"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-80"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full opacity-80 shadow-lg shadow-green-500/50"></div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border-2 border-cyan-500/50 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-cyan-400 font-bold text-2xl">Ξ</span>
              </div>
              <div>
                <h1 className="terminal-title text-3xl bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent font-black tracking-tight">
                  ETHEREUM ANALYTICS TERMINAL
                </h1>
                <div className="terminal-subtitle text-sm flex items-center gap-3 mt-1">
                  <span className="text-cyan-400">[v3.0.0]</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-blue-400">Bloomberg-Style Analytics</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-purple-400">Real-time Intelligence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <span className="terminal-label text-green-400 font-bold">LIVE</span>
            </div>
            <div className="terminal-label text-cyan-400 font-mono text-lg">
              {new Date().toLocaleTimeString('en-US', { hour12: false })}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="mx-4 mt-4">
        <div className="bloomberg-section p-3 bg-gradient-to-r from-slate-900/50 via-slate-800/50 to-slate-900/50">
          <div className="flex overflow-x-auto gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-6 py-3 terminal-label font-bold rounded-lg whitespace-nowrap border-2 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border-cyan-500/70 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-slate-400 border-slate-600/30 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-slate-600/50 hover:border-slate-500/50 hover:scale-102'
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
      <main className="flex-1 mx-4 mb-4 mt-4">
        <div className="bloomberg-card overflow-hidden border-2 border-blue-500/20">
          <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)', minHeight: '600px' }}>
            <ActiveComponent />
          </div>
        </div>
      </main>

      {/* Bloomberg Footer */}
      <footer className="mx-4 mb-4 bloomberg-card border-t-2 border-cyan-500/20">
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900/30 via-blue-900/10 to-slate-900/30">
          <div className="flex items-center gap-6 terminal-subtitle text-sm">
            <span className="text-cyan-400 font-semibold">⚡ Powered by Next.js + WebSocket</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400">Real-time Analytics Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-purple-400">Bloomberg-Style Terminal</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
              <span className="terminal-label text-green-400 font-bold">CONNECTED</span>
            </div>
            <div className="terminal-label text-slate-500 font-mono">
              [ESC] Help • [F1] Config • [F12] Debug
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}