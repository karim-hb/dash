'use client';

import { InclusionEntry, InclusionMapping, MempoolStats } from '../types';

interface InclusionTabProps {
  inclusion: InclusionMapping | undefined;
  mempool: MempoolStats | undefined;
}

const bucketLabels: Record<string, string> = {
  nextBlock: 'Next Block',
  next2Blocks: 'Next 2 Blocks',
  unlikely: 'Unlikely',
  insufficientFee: 'Insufficient Fee',
  nonceBlocked: 'Nonce Blocked',
};

export default function InclusionTab({ inclusion, mempool }: InclusionTabProps) {
  console.log("inclusion => " ,inclusion);
  const buckets = Object.entries(bucketLabels).map(([key, label]) => ({
    key,
    label,
    items: (inclusion as Record<string, InclusionEntry[] | undefined>)?.[key] ?? [],
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 space-y-4">
        {buckets.map(({ key, label, items }) => (
          <BucketCard key={key} label={label} items={items} summary={inclusion?.summary?.[key] ?? items.length} />
        ))}
      </div>

      <div className="space-y-4">
        <MempoolStatsCard mempool={mempool} />
        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117]">
          <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-3">Bucket Summary</h4>
          {Object.entries(inclusion?.summary ?? {}).length === 0 && (
            <div className="text-sm text-[#8B949E]">Awaiting inclusion data…</div>
          )}
          <div className="space-y-2 text-sm">
            {Object.entries(inclusion?.summary ?? {}).map(([name, value]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-[#8B949E]">{bucketLabels[name] ?? name}</span>
                <span className="text-[#C9D1D9] font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BucketCard({ label, items, summary }: { label: string; items: InclusionEntry[]; summary: number }) {
  return (
    <div className="p-4 rounded border border-[#21262D] bg-[#0D1117] shadow-sm shadow-black/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E]">{label}</h4>
        <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-semibold rounded bg-sky-500/10 text-sky-200 border border-sky-500/30">
          {summary}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="text-sm text-[#8B949E]">No transactions in this bucket.</div>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scroll">
          {items.slice(0, 10).map((item) => (
            <div key={item.hash} className="p-2 rounded bg-[#111C2B] border border-[#1F2A3A]">
              <div className="flex items-center justify-between text-xs text-[#C9D1D9]">
                <span className="font-mono">{item.hash.slice(0, 8)}…{item.hash.slice(-6)}</span>
                <span className="text-[#8B949E]">{item.status ?? label}</span>
              </div>
              <TokenChipRow item={item} />
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#8B949E]">
                <div>
                  <span className="font-semibold text-[#C9D1D9]">Probability:</span>{' '}
                  {item.inclusionProbability != null ? `${Math.round(item.inclusionProbability * 100)}%` : '—'}
                </div>
                <div>
                  <span className="font-semibold text-[#C9D1D9]">Effective:</span>{' '}
                  {item.effectiveGasPriceGwei != null ? `${item.effectiveGasPriceGwei.toFixed(2)} gwei` : '—'}
                </div>
                <div>
                  <span className="font-semibold text-[#C9D1D9]">Value:</span>{' '}
                  {item.value != null ? formatValue(item.value) : '—'}
                </div>
                <div>
                  <span className="font-semibold text-[#C9D1D9]">Gas USD:</span>{' '}
                  {item.estimatedGasCostUSD != null ? `$${item.estimatedGasCostUSD.toFixed(2)}` : '—'}
                </div>
              </div>
            </div>
          ))}
          {items.length > 10 && (
            <div className="text-[11px] text-[#8B949E] text-center">+ {items.length - 10} more…</div>
          )}
        </div>
      )}
    </div>
  );
}

function MempoolStatsCard({ mempool }: { mempool: MempoolStats | undefined }) {
  return (
    <div className="p-4 rounded border border-[#21262D] bg-[#0D1117]">
      <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-3">Mempool Stats</h4>
      {!mempool ? (
        <div className="text-sm text-[#8B949E]">Awaiting stats…</div>
      ) : (
        <div className="space-y-3 text-sm text-[#C9D1D9]">
          <div className="flex items-center justify-between">
            <span className="text-[#8B949E]">Total Pending</span>
            <span className="font-semibold">{mempool.totalPending.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[#8B949E] text-xs uppercase tracking-[0.3em]">Priority Percentiles</span>
            <div className="mt-2 space-y-1">
              {renderPercentiles(mempool.percentiles)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderPercentiles(percentiles?: Record<string, number>) {
  if (!percentiles) return <div className="text-sm text-[#8B949E]">No percentile data.</div>;
  const entries = Object.entries(percentiles).filter(([key]) => key.startsWith('p'));
  if (!entries.length) return <div className="text-sm text-[#8B949E]">No percentile data.</div>;
  return entries
    .sort(([a], [b]) => Number(a.slice(1)) - Number(b.slice(1)))
    .map(([key, value]) => (
      <div key={key} className="flex items-center justify-between text-xs">
        <span className="text-[#8B949E]">{key.toUpperCase()}</span>
        <span className="font-semibold text-[#C9D1D9]">{value.toFixed(2)} gwei</span>
      </div>
    ));
}

function formatValue(value: number | string) {
  if (typeof value === 'number') return value.toFixed(4);
  return value;
}

function TokenChipRow({ item }: { item: InclusionEntry }) {
  const tokenSymbol = item.token?.symbol ?? item.tokenSymbol ?? undefined;
  const tokenName = item.token?.name ?? item.tokenName ?? undefined;
  const tokenAmount = item.token?.amount ?? item.tokenAmount ?? undefined;
  const rawTokenUsd = item.token?.usdValue ?? item.tokenValueUsd ?? undefined;
  const tokenUsd = formatUsd(rawTokenUsd);

  if (!tokenSymbol && !tokenAmount && !tokenUsd) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#8B949E]">
      <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#111C2B] border border-[#1F2A3A]">
        {tokenSymbol && <span className="text-[#C9D1D9] font-semibold">{tokenSymbol}</span>}
        {tokenName && tokenName !== tokenSymbol && <span className="text-[#8B949E]">{tokenName}</span>}
        {tokenAmount != null && tokenAmount !== '' && <span className="text-[#C9D1D9]">{formatTokenAmount(tokenAmount)}</span>}
        {tokenUsd && <span className="text-[#6EE7B7]">{tokenUsd}</span>}
      </div>
    </div>
  );
}

function formatTokenAmount(value: number | string | null | undefined) {
  if (value == null) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    if (Math.abs(value) >= 1) {
      return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    return value.toFixed(6);
  }
  return value;
}

function formatUsd(value: number | string | null | undefined) {
  if (value == null) return '';
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return '';
  if (numeric === 0) return '$0.00';
  if (Math.abs(numeric) < 0.01) {
    return `$${numeric.toFixed(4)}`;
  }
  if (Math.abs(numeric) < 1) {
    return `$${numeric.toFixed(4)}`;
  }
  return `$${numeric.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

