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

type TabType = 'summary' | 'opportunities' | 'live' | 'included' | 'gas' | 'contracts' | 'senders' | 'status';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs = [
    { id: 'summary', label: 'Summary', component: Summary },
    { id: 'opportunities', label: 'Opportunities', component: Opportunities },
    { id: 'live', label: 'Live', component: Live },
    { id: 'included', label: 'Included', component: Included },
    { id: 'gas', label: 'Gas', component: Gas },
    { id: 'contracts', label: 'Contracts', component: Contracts },
    { id: 'senders', label: 'Senders', component: Senders },
    { id: 'status', label: 'Status', component: Status },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Summary;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-green-400">
            🚀 ETHEREUM MEMPOOL TRACKER • LIVE
          </h1>
          <div className="text-sm text-gray-400">
            Real-time transaction monitoring
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="bg-gray-800 px-6 py-2">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-700 text-green-400 border-b-2 border-green-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="p-6">
        <ActiveComponent />
      </main>
    </div>
  );
}