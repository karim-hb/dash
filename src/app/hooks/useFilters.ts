'use client';

import { create } from 'zustand';

export type FilterPreset = {
  name: string;
  state: FiltersState;
};

export type FiltersState = {
  minEth?: number;
  maxEth?: number;
  minGasGwei?: number;
  maxGasGwei?: number;
  protocols: string[]; // e.g., ['DEX','NFT','DeFi','Bridge','ERC-20','ETH']
  tokenQuery?: string; // token address or symbol substring
  searchText?: string; // generic search across hash/from/to
  whitelist: string[]; // addresses
  blacklist: string[]; // addresses
  timeRangeMin?: number; // minutes
  decodedOnly: boolean;
};

const defaultState: FiltersState = {
  protocols: [],
  whitelist: [],
  blacklist: [],
  decodedOnly: false,
  searchText: '',
};

export type FiltersStore = FiltersState & {
  set: (s: Partial<FiltersState>) => void;
  reset: () => void;
  presets: FilterPreset[];
  savePreset: (name: string) => void;
  loadPreset: (name: string) => void;
  deletePreset: (name: string) => void;
  applyFilters: (rows: any[]) => any[];
};

function loadPresets(): FilterPreset[] {
  try {
    const raw = localStorage.getItem('filters.presets');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function savePresets(presets: FilterPreset[]) {
  try { localStorage.setItem('filters.presets', JSON.stringify(presets)); } catch {}
}

function toEth(hex?: string): number {
  try { return hex ? parseInt(hex, 16) / 1e18 : 0; } catch { return 0; }
}
function toGwei(hex?: string): number {
  try { return hex ? parseInt(hex, 16) / 1e9 : 0; } catch { return 0; }
}

function protocolLabelFromCategory(categoryKey: string): string {
  if (!categoryKey) return 'Other';
  if (categoryKey.startsWith('dex:')) return 'DEX';
  if (categoryKey.startsWith('nft_market:') || categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
  if (categoryKey.startsWith('bridge:')) return 'Bridge';
  if (categoryKey.startsWith('defi:')) return 'DeFi';
  if (categoryKey.startsWith('erc20:')) return 'ERC-20';
  if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
  return 'Other';
}

export const useFilters = create<FiltersStore>((set, get) => ({
  ...defaultState,
  presets: [],
  set: (s) => set({ ...get(), ...s }),
  reset: () => set({ ...defaultState }),
  savePreset: (name) => {
    const presets = loadPresets();
    const state: FiltersState = { ...get() };
    delete (state as any).presets;
    const idx = presets.findIndex(p => p.name === name);
    const preset = { name, state };
    if (idx >= 0) presets[idx] = preset; else presets.push(preset);
    savePresets(presets);
    set({ presets });
  },
  loadPreset: (name) => {
    const presets = loadPresets();
    const found = presets.find(p => p.name === name);
    if (found) set({ ...found.state });
    set({ presets });
  },
  deletePreset: (name) => {
    const presets = loadPresets().filter(p => p.name !== name);
    savePresets(presets);
    set({ presets });
  },
  applyFilters: (rows: any[]) => {
    const f = get();
    const nowSec = Date.now() / 1000;
    return rows.filter(tx => {
      // decoded only
      if (f.decodedOnly && !tx._decoded_fn) return false;

      // time range
      if (f.timeRangeMin) {
        const baseTs = tx._inclusion_ts || tx._first_seen_ts;
        if (!baseTs || (nowSec - baseTs) > (f.timeRangeMin * 60)) return false;
      }

      // value range
      const eth = toEth(tx.value);
      if (f.minEth !== undefined && eth < f.minEth) return false;
      if (f.maxEth !== undefined && eth > f.maxEth) return false;

      // gas range
      const gasGwei = toGwei(tx.maxFeePerGas || tx.gasPrice);
      if (f.minGasGwei !== undefined && gasGwei < f.minGasGwei) return false;
      if (f.maxGasGwei !== undefined && gasGwei > f.maxGasGwei) return false;

      // protocol multi-select
      if (f.protocols && f.protocols.length > 0) {
        const label = protocolLabelFromCategory(tx.category_key);
        if (!f.protocols.includes(label)) return false;
      }

      if (f.searchText && f.searchText.trim()) {
        const q = f.searchText.trim().toLowerCase();
        const matches =
          (tx.hash || '').toLowerCase().includes(q) ||
          (tx.from || '').toLowerCase().includes(q) ||
          (tx.to || '').toLowerCase().includes(q) ||
          (tx.category_key || '').toLowerCase().includes(q) ||
          (tx._decoded_fn?.function || '').toLowerCase().includes(q) ||
          (tx._decoded_events || []).some((evt: any) => (evt.event || '').toLowerCase().includes(q));
        if (!matches) return false;
      }

      // token query in input or decoded args
      if (f.tokenQuery && f.tokenQuery.trim()) {
        const q = f.tokenQuery.trim().toLowerCase();
        const inInput = (tx.input || '').toLowerCase().includes(q);
        const inArgs = (tx._decoded_fn?.args || []).some((a: any) => String(a.value || '').toLowerCase().includes(q));
        if (!inInput && !inArgs) return false;
      }

      // whitelist/blacklist
      const from = (tx.from || '').toLowerCase();
      const to = (tx.to || '').toLowerCase();
      if (f.whitelist.length > 0) {
        const ok = f.whitelist.map(a => a.toLowerCase()).some(a => a === from || a === to);
        if (!ok) return false;
      }
      if (f.blacklist.length > 0) {
        const bad = f.blacklist.map(a => a.toLowerCase()).some(a => a === from || a === to);
        if (bad) return false;
      }

      return true;
    });
  }
}));
