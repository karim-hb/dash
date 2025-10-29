'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';

function short(s: string, n = 10) { return s && s.length > n ? `${s.slice(0, n)}…` : (s || ''); }
function fmtGwei(hex?: string) { try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; } }
function fmtEth(hex?: string) { try { return hex ? (parseInt(hex, 16) / 1e18).toFixed(4) : '-'; } catch { return '-'; } }
function fmtAge(firstSeen?: number) { if (!firstSeen) return '-'; const age = Date.now() / 1000 - firstSeen; return `${age.toFixed(1)}s`; }

// Get protocol display name (same as app.py)
function getProtocolDisplay(categoryKey: string): string {
  if (!categoryKey) return '-';
  if (categoryKey.startsWith('dex:')) {
    const parts = categoryKey.split(':');
    if (parts.length >= 3) {
      const protocol = parts[2];
      const version = parts[3] || '';
      return version ? `${protocol}:${version}` : protocol;
    }
    return 'DEX';
  }
  if (categoryKey.startsWith('erc20:')) return 'ERC-20';
  if (categoryKey.startsWith('erc721:') || categoryKey.startsWith('erc1155:')) return 'NFT';
  if (categoryKey.startsWith('bridge:')) return categoryKey.split(':')[1] || 'Bridge';
  if (categoryKey.startsWith('nft_market:')) return categoryKey.split(':')[1] || 'NFT Market';
  if (categoryKey.startsWith('eth_transfer:')) return 'ETH';
  if (categoryKey.startsWith('deploy:')) return 'Deploy';
  if (categoryKey.startsWith('utility:')) return 'Utility';
  return 'Contract';
}

// Calculate unified ETH value (same as app.py)
function calculateUnifiedEth(tx: any): string {
  try {
    if (!tx) return '-';
    const valueWei = parseInt(tx.value || '0x0', 16);
    if (valueWei > 0) {
      const eth = valueWei / 1e18;
      return eth.toFixed(4);
    }
    return '-';
  } catch {
    return '-';
  }
}

// Calculate amount display (same as app.py)
function calculateAmount(tx: any): string {
  try {
    if (!tx) return '-';
    const valueWei = parseInt(tx.value || '0x0', 16);
    if (valueWei > 0) {
      const eth = valueWei / 1e18;
      if (eth < 0.001) {
        return (eth * 1e6).toFixed(2) + 'μ';
      } else if (eth < 1) {
        return eth.toFixed(4);
      } else {
        return eth.toFixed(2);
      }
    }
    return '-';
  } catch {
    return '-';
  }
}

export default function Opportunities() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();

  // Get opportunities and enrich with full transaction data from live
  const liveTxs = snapshot?.live || [];
  const enrichedOpportunities = snapshot?.opportunities?.map(opp => {
    const fullTx = liveTxs.find(tx => tx.hash === opp.hash);
    return { ...opp, ...fullTx };
  }) || [];

  const rows = filters.applyFilters(enrichedOpportunities);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">OPPORTUNITIES</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-gray-300">
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-left">Rank</th>
                <th className="py-2 pr-4 text-left">Hash</th>
                <th className="py-2 pr-4 text-left">From</th>
                <th className="py-2 pr-4 text-left">To</th>
                <th className="py-2 pr-4 text-left">Type</th>
                <th className="py-2 pr-4 text-left">Protocol</th>
                <th className="py-2 pr-4 text-left">Function</th>
                <th className="py-2 pr-4 text-left">Unified(ETH)</th>
                <th className="py-2 pr-4 text-left">Amount</th>
                <th className="py-2 pr-4 text-left">Gas</th>
                <th className="py-2 pr-4 text-left">Age</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {rows.length === 0 && (
                <tr><td colSpan={11} className="py-8 text-center text-gray-400">No opportunities yet</td></tr>
              )}
              {rows.map((r: any) => (
                <tr key={r.hash} className="border-b border-gray-800 hover:bg-gray-700/30">
                  <td className="py-2 pr-4">{r.rank}</td>
                  <td className="py-2 pr-4 font-mono">{short(r.hash, 16)}</td>
                  <td className="py-2 pr-4 font-mono">{short(r.from || '', 10)}</td>
                  <td className="py-2 pr-4 font-mono">{short(r.to || '', 10)}</td>
                  <td className="py-2 pr-4">{r.category_key || '-'}</td>
                  <td className="py-2 pr-4">{getProtocolDisplay(r.category_key)}</td>
                  <td className="py-2 pr-4">{r._decoded_fn?.function || '-'}</td>
                  <td className="py-2 pr-4">{calculateUnifiedEth(r)}</td>
                  <td className="py-2 pr-4">{calculateAmount(r)}</td>
                  <td className="py-2 pr-4">{fmtGwei(r.maxFeePerGas || r.gasPrice)}g</td>
                  <td className="py-2 pr-4">{fmtAge(r._first_seen_ts)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
