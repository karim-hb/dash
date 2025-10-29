'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';

function short(s: string, n = 10) { return s && s.length > n ? `${s.slice(0, n)}…` : (s || ''); }
function fmtGwei(hex?: string) { try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; } }
function fmtFeeEth(rcpt?: any) {
  try {
    if (!rcpt) return '-';
    const egp = parseInt(rcpt.effectiveGasPrice || '0x0', 16) / 1e9;
    const gu = parseInt(rcpt.gasUsed || '0x0', 16);
    return ((egp * gu) / 1e9).toFixed(4);
  } catch { return '-'; }
}
function fmtHexGwei(hex?: string) {
  try { return hex ? (parseInt(hex, 16) / 1e9).toFixed(1) : '-'; } catch { return '-'; }
}
function fmtStatus(rcpt?: any) {
  try {
    const s = rcpt?.status;
    if (s === undefined || s === null) return '-';
    const ok = typeof s === 'string' ? parseInt(s, 16) === 1 : !!s;
    return ok ? 'Success' : 'Fail';
  } catch { return '-'; }
}
function fmtDelay(fs?: number, it?: number) {
  if (!fs || !it) return '-';
  return `${(it - fs).toFixed(1)}s`;
}

function hexToNum(val?: any): number | '-' {
  try {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      if (val.startsWith('0x') || val.startsWith('0X')) return parseInt(val, 16);
      const n = Number(val);
      return Number.isFinite(n) ? n : '-';
    }
    return '-';
  } catch { return '-'; }
}

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

// Import shared amount decoding utilities
import { calculateAmount } from '../utils/amountUtils';

export default function Included() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();
  const rows = filters.applyFilters(snapshot?.included || []);

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-green-400">INCLUDED TRANSACTIONS</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm whitespace-nowrap">
            <thead className="text-gray-300">
              <tr className="border-b border-gray-700">
                <th className="py-2 pr-4 text-left">Time</th>
                <th className="py-2 pr-4 text-left">Hash</th>
                <th className="py-2 pr-4 text-left">From</th>
                <th className="py-2 pr-4 text-left">To</th>
                <th className="py-2 pr-4 text-left">Amount</th>
                <th className="py-2 pr-4 text-left">Protocol</th>
                <th className="py-2 pr-4 text-left">Function</th>
                <th className="py-2 pr-4 text-left">Block</th>
                <th className="py-2 pr-4 text-left">TxIdx</th>
                <th className="py-2 pr-4 text-left">Nonce</th>
                <th className="py-2 pr-4 text-left">Status</th>
                <th className="py-2 pr-4 text-left">Delay</th>
                <th className="py-2 pr-4 text-left">Conf</th>
                <th className="py-2 pr-4 text-left">GasUsed</th>
                <th className="py-2 pr-4 text-left">GasLimit</th>
                <th className="py-2 pr-4 text-left">GasPrice(g)</th>
                <th className="py-2 pr-4 text-left">MaxPrio(g)</th>
                <th className="py-2 pr-4 text-left">MaxFee(g)</th>
                <th className="py-2 pr-4 text-left">Fee(ETH)</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              {rows.length === 0 && (
                <tr><td colSpan={19} className="py-8 text-center text-gray-400">No included transactions yet</td></tr>
              )}
              {rows.map((tx: any) => {
                const includeTime = tx._inclusion_ts ? new Date(tx._inclusion_ts * 1000).toLocaleTimeString() : '--:--:--';
                return (
                  <tr key={tx.hash} className="border-b border-gray-800 hover:bg-gray-700/30">
                    <td className="py-1.5 md:py-2 pr-4">{includeTime}</td>
                    <td className="py-1.5 md:py-2 pr-4 font-mono">{short(tx.hash, 16)}</td>
                    <td className="py-1.5 md:py-2 pr-4 font-mono">{short(tx.from || '', 14)}</td>
                    <td className="py-1.5 md:py-2 pr-4 font-mono">{short(tx.to || '', 14)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{calculateAmount(tx)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{getProtocolDisplay(tx.category_key)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{tx._decoded_fn?.function || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{hexToNum(tx.blockNumber) || hexToNum(tx._receipt?.blockNumber) || hexToNum(tx._inclusion_block) || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{hexToNum(tx.transactionIndex) || hexToNum(tx._receipt?.transactionIndex) || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{hexToNum(tx.nonce) || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtStatus(tx._receipt)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtDelay(tx._first_seen_ts, tx._inclusion_ts)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{tx._confirmation_depth ?? 0}</td>
                    <td className="py-1.5 md:py-2 pr-4">{hexToNum(tx._receipt?.gasUsed) || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{hexToNum(tx.gas) || '-'}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtHexGwei(tx.gasPrice)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtHexGwei(tx.maxPriorityFeePerGas)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtHexGwei(tx.maxFeePerGas)}</td>
                    <td className="py-1.5 md:py-2 pr-4">{fmtFeeEth(tx._receipt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
