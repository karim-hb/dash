'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';

export default function Gas() {
  const { snapshot } = useWsSnapshot();
  const gas = snapshot?.gas;
  const buckets = snapshot?.summary?.gas_buckets || { gte_100: 0, gte_150: 0, gte_200: 0, gte_300: 0 };
  const baseFee = gas?.base_fee ? (gas.base_fee / 1e9).toFixed(2) : '—';

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">GAS ANALYTICS</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-gray-900 rounded">
            <div className="text-gray-400 text-xs">Base Fee</div>
            <div className="text-2xl font-bold text-white">{baseFee} gwei</div>
          </div>
          <div className="p-4 bg-gray-900 rounded">
            <div className="text-gray-400 text-xs">Tip (1 block)</div>
            <div className="text-2xl font-bold text-white">{gas?.tips?.['1_block'] || 0}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded">
            <div className="text-gray-400 text-xs">Tip (3 blocks)</div>
            <div className="text-2xl font-bold text-white">{gas?.tips?.['3_blocks'] || 0}</div>
          </div>
          <div className="p-4 bg-gray-900 rounded">
            <div className="text-gray-400 text-xs">Tip (5 blocks)</div>
            <div className="text-2xl font-bold text-white">{gas?.tips?.['5_blocks'] || 0}</div>
          </div>
        </div>

        <div className="bg-gray-900 rounded p-4">
          <div className="text-gray-400 mb-2">Current Gas Distribution (tx counts)</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-yellow-400 text-lg">≥100g: {buckets.gte_100}</div>
            <div className="text-yellow-400 text-lg">≥150g: {buckets.gte_150}</div>
            <div className="text-yellow-400 text-lg">≥200g: {buckets.gte_200}</div>
            <div className="text-yellow-400 text-lg">≥300g: {buckets.gte_300}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
