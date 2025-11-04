'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import { useFilters } from '../hooks/useFilters';
import Card from './Card';
import Table from './Table';

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

// Import shared amount decoding utilities
import { calculateUnifiedEth } from '../utils/amountUtilsEthers';

export default function Opportunities() {
  const { snapshot } = useWsSnapshot();
  const filters = useFilters();

  const scoreClass = (score?: number | null) => {
    if (score == null || !Number.isFinite(score)) return 'text-slate-500';
    if (score >= 75) return 'text-emerald-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  const formatScore = (score?: number | null) => {
    if (score == null || !Number.isFinite(score)) return '—';
    return score.toFixed(1);
  };

  const renderScoreChip = (label: string, score?: number | null) => (
    <span className={`px-1 py-[1px] border border-slate-700 rounded ${scoreClass(score)} text-[8px] font-mono`}> 
      {label} {score == null || !Number.isFinite(score) ? '—' : Math.round(score)}
    </span>
  );

  const renderStateChip = (state?: string) => {
    if (!state) return null;
    const base = 'px-1 py-[1px] text-[8px] font-mono border rounded';
    const mapping: Record<string, string> = {
      PENDING: 'text-yellow-400 border-yellow-500',
      REPLACED: 'text-orange-400 border-orange-500',
      RESUBMITTED: 'text-sky-400 border-sky-500',
      INCLUDED: 'text-emerald-400 border-emerald-500',
      CONFIRMED: 'text-green-300 border-green-400',
      FINALIZED: 'text-blue-300 border-blue-400',
      DROPPED: 'text-red-400 border-red-500',
    };
    const cls = mapping[state] || 'text-slate-400 border-slate-600';
    return <span className={`${base} ${cls}`}>{state}</span>;
  };

  // Get opportunities and enrich with full transaction data from live
  const liveTxs = snapshot?.live || [];
  const enrichedOpportunities = snapshot?.opportunities?.map(opp => {
    const fullTx = liveTxs.find(tx => tx.hash === opp.hash);
    return { ...opp, ...fullTx };
  }) || [];

  const rows = filters.applyFilters(enrichedOpportunities);

  const tableRows = React.useMemo(() => {
    const now = Date.now() / 1000;
    return rows
      .map((row, index) => {
        const composite = row.composite_score ?? row._score ?? 0;
        const nonceValue = row.nonce
          ? parseInt(row.nonce, row.nonce.toString().startsWith('0x') ? 16 : 10)
          : 0;
        return {
          ...row,
          displayRank: index + 1,
          score_sort: composite,
          value_sort: row.value_score ?? 0,
          gas_sort: row.gas_score ?? 0,
          mev_sort: row.mev_score ?? 0,
          smart_sort: row.smart_money_score ?? (row.smart_money_flag ? 100 : 0),
          urgency_sort: row.urgency_score ?? 0,
          age_sort: now - (row._first_seen_ts ?? now),
          nonce_sort: Number.isFinite(nonceValue) ? nonceValue : 0,
        };
      })
      .sort((a, b) => (b.score_sort - a.score_sort));
  }, [rows]);

  const columns = [
    {
      key: 'displayRank',
      header: '#',
      sortable: true,
      className: 'text-center w-10',
      render: (_: any, __: any, index: number) => (
        <span className={`font-mono text-[9px] ${index === 0 ? 'text-yellow-300' : 'text-slate-500'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
      ),
    },
    {
      key: 'score_sort',
      header: 'Score',
      sortable: true,
      className: 'min-w-[110px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-1">
          <span className={`text-[11px] font-bold ${scoreClass(row.composite_score ?? row._score)}`}>
            {formatScore(row.composite_score ?? row._score)}
          </span>
          <div className="flex flex-wrap gap-1">
            {renderScoreChip('V', row.value_score)}
            {renderScoreChip('G', row.gas_score)}
            {renderScoreChip('M', row.mev_score)}
            {renderScoreChip('S', row.smart_money_score)}
            {renderScoreChip('U', row.urgency_score)}
          </div>
        </div>
      ),
    },
    {
      key: 'hash',
      header: 'Transaction',
      className: 'min-w-[190px]',
      render: (value: string, row: any) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            {row.smart_money_flag && <span className="text-yellow-400" title="Smart money address">⭐</span>}
            {row.replacement_tx && <span className="text-sky-400" title={`Replaces ${short(row.replacement_tx, 8)}`}>🔄</span>}
            {row.replaced_by && <span className="text-orange-400" title={`Replaced by ${short(row.replaced_by, 8)}`}>↩</span>}
            <span className="text-emerald-400 font-mono">{short(value || '', 12)}</span>
            {renderStateChip(row._state)}
          </div>
          <div className="text-[8px] text-slate-500 font-mono">
            {getProtocolDisplay(row.category_key)} • {row._decoded_fn?.function || 'unknown'}
          </div>
        </div>
      ),
    },
    {
      key: 'from',
      header: 'From → To',
      className: 'min-w-[160px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-300 font-mono">{short(row.from || '', 12)}</span>
          <span className="text-[8px] text-slate-500 font-mono">→ {short(row.to || '', 12)}</span>
        </div>
      ),
    },
    {
      key: 'value_sort',
      header: 'Value (ETH)',
      sortable: true,
      className: 'min-w-[95px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-emerald-300 font-mono">{calculateUnifiedEth(row)}</span>
          {renderScoreChip('V', row.value_score)}
        </div>
      ),
    },
    {
      key: 'gas_sort',
      header: 'Gas (gwei)',
      sortable: true,
      className: 'min-w-[90px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-yellow-400 font-mono">{fmtGwei(row.maxFeePerGas || row.gasPrice)}g</span>
          {renderScoreChip('G', row.gas_score)}
        </div>
      ),
    },
    {
      key: 'mev_sort',
      header: 'MEV',
      sortable: true,
      className: 'min-w-[70px]',
      render: (_: any, row: any) => renderScoreChip('MEV', row.mev_score),
    },
    {
      key: 'smart_sort',
      header: 'Smart',
      sortable: true,
      className: 'min-w-[70px]',
      render: (_: any, row: any) => renderScoreChip(row.smart_money_flag ? 'SMART⭐' : 'SMART', row.smart_money_score),
    },
    {
      key: 'urgency_sort',
      header: 'Urgency',
      sortable: true,
      className: 'min-w-[70px]',
      render: (_: any, row: any) => renderScoreChip('URG', row.urgency_score),
    },
    {
      key: 'age_sort',
      header: 'Age',
      sortable: true,
      className: 'min-w-[80px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-purple-400 font-mono">{fmtAge(row._first_seen_ts)}</span>
          {row.state_history?.length ? (
            <span className="text-[8px] text-slate-500 font-mono">
              {row.state_history[row.state_history.length - 1]?.state} @ {new Date((row.state_history[row.state_history.length - 1]?.timestamp ?? 0) * 1000).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: 'nonce_sort',
      header: 'Nonce',
      sortable: true,
      className: 'min-w-[70px]',
      render: (_: any, row: any) => (
        <div className="flex flex-col gap-0.5 font-mono text-slate-300">
          <span>{Number.isFinite(row.nonce_sort) ? row.nonce_sort : '—'}</span>
          {row.nonce_gap ? (
            <span className="text-[8px] text-red-400">gap +{row.nonce_gap}</span>
          ) : (
            <span className="text-[8px] text-slate-500">gap 0</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="h-full">
      {/* Opportunities Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 text-[9px]">🏆</span>
            <h2 className="font-mono text-[9px] uppercase tracking-widest text-gray-300">
              OPPORTUNITIES
            </h2>
            {rows.length > 0 && (
              <div className="px-1 py-0.5 bg-amber-900 text-amber-300 text-[7px] font-mono border border-amber-700">
                {rows.length} FOUND
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="p-1.5">
        <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mb-2">
          <div>
            [{tableRows.length} entries • {tableRows.filter(row => row.smart_money_flag).length} smart money • {tableRows.filter(row => row.replacement_tx || row.replaced_by).length} replacements]
          </div>
          <div className="text-slate-600">click column headers to sort</div>
        </div>

        <Table
          data={tableRows}
          columns={columns}
          emptyMessage="[NO OPPORTUNITIES DETECTED • TRANSACTIONS NEED HIGH VALUE OR GAS TO QUALIFY]"
          density="compact"
        />
      </div>
    </div>
  );
}
