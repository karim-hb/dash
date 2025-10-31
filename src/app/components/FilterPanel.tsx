'use client';

import { useEffect, useState } from 'react';
import { useFilters } from '../hooks/useFilters';

const protocols = ['DEX','NFT','DeFi','Bridge','ERC-20','ETH','Other'];

export default function FilterPanel() {
  const f = useFilters();
  const [presetName, setPresetName] = useState('');
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Load presets into store state
    f.loadPreset(''); // triggers preset refresh silently
  }, []);

  const hasActiveFilters = f.minEth || f.maxEth || f.minGasGwei || f.maxGasGwei ||
                          f.protocols.length > 0 || f.tokenQuery || f.searchText || f.whitelist.length > 0 ||
                          f.blacklist.length > 0 || f.timeRangeMin || f.decodedOnly;

  return (
    <div className="glass-card border border-slate-700/50">
      {/* Filter Toggle Header */}
      <div className="p-4 border-b border-slate-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors font-mono"
            >
              <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              [FILTERS] {hasActiveFilters && (
                <span className="terminal-badge live text-xs">
                  {Object.values(f).filter(v => v && (Array.isArray(v) ? v.length > 0 : true)).length} ACTIVE
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={() => f.reset()}
                className="terminal-btn text-xs px-3 py-1"
              >
                [CLEAR ALL]
              </button>
            )}
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <select
              className="terminal-input text-xs px-3 py-1 bg-slate-800/50"
              onChange={e => { if (e.target.value) f.loadPreset(e.target.value); e.target.value = ''; }}
            >
              <option value="">[LOAD PRESET]</option>
              {f.presets.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {expanded && (
        <div className="p-6">
          <div className="terminal-grid terminal-grid-4">

            {/* Value Range */}
            <div className="space-y-3">
              <h4 className="text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                [VALUE RANGE • ETH]
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono">MIN</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    className="terminal-input w-full"
                    value={f.minEth ?? ''}
                    onChange={e => f.set({ minEth: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono">MAX</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="∞"
                    className="terminal-input w-full"
                    value={f.maxEth ?? ''}
                    onChange={e => f.set({ maxEth: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Gas Range */}
            <div className="space-y-3">
              <h4 className="text-sm font-mono font-semibold text-blue-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                [GAS RANGE • GWEI]
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono">MIN</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="10"
                    className="terminal-input w-full"
                    value={f.minGasGwei ?? ''}
                    onChange={e => f.set({ minGasGwei: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1 font-mono">MAX</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="∞"
                    className="terminal-input w-full"
                    value={f.maxGasGwei ?? ''}
                    onChange={e => f.set({ maxGasGwei: e.target.value === '' ? undefined : Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Protocol Selection */}
            <div className="space-y-3">
              <h4 className="text-sm font-mono font-semibold text-purple-300 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                [PROTOCOLS]
              </h4>
              <div className="grid grid-cols-1 gap-1">
                {protocols.map(p => (
                  <label key={p} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono">
                    <input
                      type="checkbox"
                      checked={f.protocols.includes(p)}
                      onChange={e => {
                        const newProtocols = e.target.checked
                          ? [...f.protocols, p]
                          : f.protocols.filter(proto => proto !== p);
                        f.set({ protocols: newProtocols });
                      }}
                      className="rounded border-slate-600 text-purple-500 focus:ring-purple-500"
                    />
                    [{p}]
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-mono font-semibold text-orange-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  [TIME RANGE]
                </h4>
                <select
                  className="terminal-input w-full"
                  value={String(f.timeRangeMin ?? '')}
                  onChange={e => f.set({ timeRangeMin: e.target.value === '' ? undefined : Number(e.target.value) })}
                >
                  <option value="">[ALL TIME]</option>
                  <option value="1">[LAST 1 MINUTE]</option>
                  <option value="5">[LAST 5 MINUTES]</option>
                  <option value="15">[LAST 15 MINUTES]</option>
                  <option value="60">[LAST HOUR]</option>
                </select>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-mono font-semibold text-cyan-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
                  [TOKEN SEARCH]
                </h4>
                <input
                  type="text"
                  placeholder="Token symbol or address"
                  className="terminal-input w-full"
                  value={f.tokenQuery ?? ''}
                  onChange={e => f.set({ tokenQuery: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-mono font-semibold text-lime-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse"></span>
                  [ADDRESS / HASH SEARCH]
                </h4>
                <input
                  type="text"
                  placeholder="Search hash, from, to, function"
                  className="terminal-input w-full"
                  value={f.searchText ?? ''}
                  onChange={e => f.set({ searchText: e.target.value })}
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300 hover:text-white cursor-pointer font-mono">
                <input
                  type="checkbox"
                  checked={f.decodedOnly}
                  onChange={e => f.set({ decodedOnly: e.target.checked })}
                  className="rounded border-slate-600 text-green-500 focus:ring-green-500"
                />
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  [DECODED TRANSACTIONS ONLY]
                </span>
              </label>
            </div>

            {/* Address Lists */}
            <div className="space-y-4 terminal-grid-2">
              <div className="space-y-3">
                <h4 className="text-sm font-mono font-semibold text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  [WHITELIST • ADDRESSES]
                </h4>
                <textarea
                  placeholder="0xabc..., 0xdef..."
                  className="terminal-input w-full resize-none"
                  rows={2}
                  onChange={e => f.set({ whitelist: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-mono font-semibold text-red-300 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  [BLACKLIST • ADDRESSES]
                </h4>
                <textarea
                  placeholder="0xabc..., 0xdef..."
                  className="terminal-input w-full resize-none"
                  rows={2}
                  onChange={e => f.set({ blacklist: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                />
              </div>
            </div>

            {/* Preset Management */}
            <div className="terminal-grid-1">
              <div className="glass-card p-4 border border-slate-700/50">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-48">
                    <label className="block text-sm font-mono font-semibold text-yellow-300 mb-2">[PRESET MANAGEMENT]</label>
                    <input
                      type="text"
                      placeholder="Enter preset name"
                      className="terminal-input w-full"
                      value={presetName}
                      onChange={e => setPresetName(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="terminal-btn primary"
                      onClick={() => { if (presetName.trim()) f.savePreset(presetName.trim()); }}
                      disabled={!presetName.trim()}
                    >
                      [SAVE]
                    </button>
                    <button
                      className="terminal-btn"
                      onClick={() => { if (presetName.trim()) f.deletePreset(presetName.trim()); }}
                      disabled={!presetName.trim()}
                    >
                      [DELETE]
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
