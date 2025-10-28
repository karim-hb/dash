'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';

export default function Senders() {
  const { snapshot } = useWsSnapshot();
  const txs = snapshot?.live || [];
  const counts = new Map<string, number>();
  for (const tx of txs) {
    const key = (tx.from || '').toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  const top = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-pink-400">TOP SENDERS</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-300">
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-left">#</th>
                <th className="py-2 pr-4 text-left">Address</th>
                <th className="py-2 pr-4 text-left">Count</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {top.length === 0 && (
                <tr><td colSpan={3} className="py-8 text-center text-gray-400">No sender activity yet</td></tr>
              )}
              {top.map(([addr, count], i) => (
                <tr key={addr} className="border-b border-gray-800 hover:bg-gray-700/30">
                  <td className="py-2 pr-4">{i + 1}</td>
                  <td className="py-2 pr-4 font-mono">{addr}</td>
                  <td className="py-2 pr-4">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
