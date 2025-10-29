'use client';

import { useEffect, useState } from 'react';
import { useFilters } from '../hooks/useFilters';

const protocols = ['DEX','NFT','DeFi','Bridge','ERC-20','ETH','Other'];

export default function FilterPanel() {
  const f = useFilters();
  const [presetName, setPresetName] = useState('');

  useEffect(() => {
    // Load presets into store state
    f.loadPreset(''); // triggers preset refresh silently
  }, []);

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex flex-wrap gap-4 items-end">
        {/* Value range */}
        <div>
          <label className="block text-xs text-gray-400">Min ETH</label>
          <input type="number" step="0.001" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-28"
                 value={f.minEth ?? ''} onChange={e => f.set({ minEth: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Max ETH</label>
          <input type="number" step="0.001" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-28"
                 value={f.maxEth ?? ''} onChange={e => f.set({ maxEth: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>

        {/* Gas range */}
        <div>
          <label className="block text-xs text-gray-400">Min Gas (gwei)</label>
          <input type="number" step="0.1" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-28"
                 value={f.minGasGwei ?? ''} onChange={e => f.set({ minGasGwei: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Max Gas (gwei)</label>
          <input type="number" step="0.1" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-28"
                 value={f.maxGasGwei ?? ''} onChange={e => f.set({ maxGasGwei: e.target.value === '' ? undefined : Number(e.target.value) })} />
        </div>

        {/* Protocol multiselect */}
        <div>
          <label className="block text-xs text-gray-400">Protocols</label>
          <select multiple className="bg-gray-900 text-gray-200 px-2 py-1 rounded min-w-40 h-20"
                  value={f.protocols}
                  onChange={e => {
                    const vals = Array.from(e.target.selectedOptions).map(o => o.value);
                    f.set({ protocols: vals });
                  }}>
            {protocols.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Token search */}
        <div>
          <label className="block text-xs text-gray-400">Token search</label>
          <input type="text" placeholder="symbol or address" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-44"
                 value={f.tokenQuery ?? ''} onChange={e => f.set({ tokenQuery: e.target.value })} />
        </div>

        {/* Whitelist / Blacklist */}
        <div>
          <label className="block text-xs text-gray-400">Whitelist (comma)</label>
          <input type="text" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-64" placeholder="0xabc...,0xdef..."
                 onChange={e => f.set({ whitelist: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </div>
        <div>
          <label className="block text-xs text-gray-400">Blacklist (comma)</label>
          <input type="text" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-64" placeholder="0xabc...,0xdef..."
                 onChange={e => f.set({ blacklist: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        </div>

        {/* Time range */}
        <div>
          <label className="block text-xs text-gray-400">Time range</label>
          <select className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-36"
                  value={String(f.timeRangeMin ?? '')}
                  onChange={e => f.set({ timeRangeMin: e.target.value === '' ? undefined : Number(e.target.value) })}>
            <option value="">All</option>
            <option value="1">Last 1 min</option>
            <option value="5">Last 5 min</option>
            <option value="15">Last 15 min</option>
            <option value="60">Last 60 min</option>
          </select>
        </div>

        {/* Decoded only */}
        <label className="inline-flex items-center gap-2 text-sm text-gray-300">
          <input type="checkbox" checked={f.decodedOnly} onChange={e => f.set({ decodedOnly: e.target.checked })} />
          Decoded only
        </label>

        {/* Presets */}
        <div className="ml-auto flex items-end gap-2">
          <input type="text" placeholder="Preset name" className="bg-gray-900 text-gray-200 px-2 py-1 rounded w-40"
                 value={presetName} onChange={e => setPresetName(e.target.value)} />
          <button className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded"
                  onClick={() => { if (presetName) f.savePreset(presetName); }}>Save</button>
          <button className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-3 py-1 rounded"
                  onClick={() => { if (presetName) f.loadPreset(presetName); }}>Load</button>
          <button className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded"
                  onClick={() => { if (presetName) f.deletePreset(presetName); }}>Delete</button>
          <button className="bg-gray-600 hover:bg-gray-500 text-white text-sm px-3 py-1 rounded"
                  onClick={() => f.reset()}>Reset</button>
        </div>
      </div>
    </div>
  );
}
