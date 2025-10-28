'use client';

import { useEffect, useState } from 'react';
import { useWsSnapshot } from '../hooks/useWsSnapshot';

interface SummaryData {
  total_pending: number;
  total_queued: number;
  ingress_per_sec: number;
  egress_per_sec: number;
  age_p50: number | null;
  age_p90: number | null;
  age_max: number | null;
  gas_buckets: {
    gte_100: number;
    gte_150: number;
    gte_200: number;
    gte_300: number;
  };
}

export default function Summary() {
  const { snapshot, connected } = useWsSnapshot();
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    if (snapshot?.summary) setData(snapshot.summary as any);
  }, [snapshot]);

  const formatTime = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
    return `${(seconds / 3600).toFixed(1)}h`;
  };

  const formatRate = (rate: number) => {
    return rate.toFixed(1);
  };
  
  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-sm">
          {connected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Pool Status */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-400">POOL STATUS</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {data?.total_pending?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Pending TXs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {data?.total_queued?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-400">Queued TXs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {formatRate(data?.ingress_per_sec || 0)}
            </div>
            <div className="text-sm text-gray-400">Ingress/sec</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {formatRate(data?.egress_per_sec || 0)}
            </div>
            <div className="text-sm text-gray-400">Egress/sec</div>
          </div>
        </div>
      </div>

      {/* State Distribution */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-orange-400">STATE DISTRIBUTION</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-300">
          {Object.entries((snapshot?.summary?.state_counts || {}) as Record<string, number>).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between bg-gray-900 rounded p-3">
              <div>{k}</div>
              <div className="text-white font-bold">{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Spark */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-cyan-400">FLOW</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-900 rounded p-3">Ingress: {snapshot?.summary?.flow_spark?.ingress || ''}</div>
          <div className="bg-gray-900 rounded p-3">Included: {snapshot?.summary?.flow_spark?.included || ''}</div>
          <div className="bg-gray-900 rounded p-3">Dropped: {snapshot?.summary?.flow_spark?.dropped || ''}</div>
          <div className="bg-gray-900 rounded p-3">Stuck: {snapshot?.summary?.flow_spark?.stuck || ''}</div>
        </div>
      </div>

      {/* Mempool Health */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-400">MEMPOOL HEALTH</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xl font-bold text-white">
              {formatTime(data?.age_p50 || null)}
            </div>
            <div className="text-sm text-gray-400">Age P50</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {formatTime(data?.age_p90 || null)}
            </div>
            <div className="text-sm text-gray-400">Age P90</div>
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {formatTime(data?.age_max || null)}
            </div>
            <div className="text-sm text-gray-400">Age Max</div>
          </div>
        </div>
      </div>

      {/* Gas Market */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">GAS MARKET</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xl font-bold text-red-400">
              {data?.gas_buckets?.gte_300 || 0}
            </div>
            <div className="text-sm text-gray-400">≥300g</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-400">
              {data?.gas_buckets?.gte_200 || 0}
            </div>
            <div className="text-sm text-gray-400">≥200g</div>
          </div>
          <div>
            <div className="text-xl font-bold text-yellow-400">
              {data?.gas_buckets?.gte_150 || 0}
            </div>
            <div className="text-sm text-gray-400">≥150g</div>
          </div>
          <div>
            <div className="text-xl font-bold text-green-400">
              {data?.gas_buckets?.gte_100 || 0}
            </div>
            <div className="text-sm text-gray-400">≥100g</div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {!data && (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading data...</div>
        </div>
      )}
    </div>
  );
}
