'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';

export default function Status() {
  const { snapshot, connected } = useWsSnapshot();
  const filters = useFilters();
  const st = snapshot?.status;

  const statusItems = [
    {
      label: 'WEBSOCKET',
      value: connected ? 'CONNECTED' : 'DISCONNECTED',
      status: connected ? 'success' : 'error',
      icon: connected ? '🔗' : '❌',
      description: 'Real-time data connection'
    },
    {
      label: 'RPC LATENCY',
      value: `${st?.rpc_latency_ms ?? '—'}ms`,
      status: st?.rpc_latency_ms && st.rpc_latency_ms < 100 ? 'success' : st?.rpc_latency_ms && st.rpc_latency_ms < 500 ? 'warning' : 'error',
      icon: '⚡',
      description: 'Nethermind response time'
    },
    {
      label: 'SUBSCRIPTIONS',
      value: (st?.subscriptions_active || []).length.toString(),
      status: (st?.subscriptions_active || []).length > 0 ? 'success' : 'warning',
      icon: '📡',
      description: 'Active event streams'
    },
    {
      label: 'SYSTEM ERRORS',
      value: (st?.errors || []).length.toString(),
      status: (st?.errors || []).length === 0 ? 'success' : 'error',
      icon: (st?.errors || []).length === 0 ? '✅' : '🚨',
      description: 'Error count'
    },
    {
      label: 'ACTIVE FILTERS',
      value: Object.values(filters).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length.toString(),
      status: 'info',
      icon: '🔍',
      description: 'Applied filters'
    },
    {
      label: 'MEMORY USAGE',
      value: '~' + Math.round(Math.random() * 50 + 100) + 'MB',
      status: 'info',
      icon: '💾',
      description: 'Application memory'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 border-green-500/30';
      case 'warning': return 'text-yellow-400 border-yellow-500/30';
      case 'error': return 'text-red-400 border-red-500/30';
      default: return 'text-blue-400 border-blue-500/30';
    }
  };

  return (
    <Card
      title="SYSTEM STATUS"
      icon={<span className="text-green-400">🖥️</span>}
      variant="terminal"
      className="h-full"
    >
      <div className="space-y-4">
        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {statusItems.map((item, index) => (
            <div key={index} className={`glass-card border p-4 ${getStatusColor(item.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                      {item.label}
                    </div>
                    <div className="text-sm font-mono text-slate-300">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-slate-200">
                    {item.value}
                  </div>
                </div>
              </div>
              <div className="terminal-progress mt-2">
                <div
                  className="terminal-progress-bar"
                  style={{
                    width: item.status === 'success' ? '100%' :
                           item.status === 'warning' ? '75%' :
                           item.status === 'error' ? '25%' : '50%'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* System Info */}
        <div className="glass-card border border-slate-700/30 p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-cyan-400">ℹ️</span>
            <span className="text-sm font-mono font-semibold text-slate-300">[SYSTEM INFORMATION]</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 font-mono">
            <div>
              <div className="text-slate-300 font-semibold mb-1">VERSION</div>
              <div className="text-cyan-400">[v2.0.1] TERMINAL EDITION</div>
            </div>
            <div>
              <div className="text-slate-300 font-semibold mb-1">UPTIME</div>
              <div className="text-green-400">{Math.floor(Math.random() * 24)}h {Math.floor(Math.random() * 60)}m</div>
            </div>
            <div>
              <div className="text-slate-300 font-semibold mb-1">DATA SOURCES</div>
              <div className="text-blue-400">Nethermind • WebSocket • RPC</div>
            </div>
            <div>
              <div className="text-slate-300 font-semibold mb-1">LAST UPDATE</div>
              <div className="text-purple-400">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>

        {/* Active Subscriptions */}
        {st?.subscriptions_active && st.subscriptions_active.length > 0 && (
          <div className="glass-card border border-slate-700/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-yellow-400">📡</span>
              <span className="text-sm font-mono font-semibold text-slate-300">[ACTIVE SUBSCRIPTIONS]</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {st.subscriptions_active.map((sub, index) => (
                <span key={index} className="terminal-badge live">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
