'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';

export default function Status() {
  const { snapshot, connected } = useWsSnapshot();
  const st = snapshot?.status;

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-400">SYSTEM STATUS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-200">
          <div className="p-3 bg-gray-900 rounded">WS Connected: {connected ? 'Yes' : 'No'}</div>
          <div className="p-3 bg-gray-900 rounded">RPC Latency: {st?.rpc_latency_ms ?? '-'} ms</div>
          <div className="p-3 bg-gray-900 rounded">Subscriptions: {(st?.subscriptions_active || []).join(', ')}</div>
          <div className="p-3 bg-gray-900 rounded">Errors: {(st?.errors || []).length}</div>
        </div>
      </div>
    </div>
  );
}
