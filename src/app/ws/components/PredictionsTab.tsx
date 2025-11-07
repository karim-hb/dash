'use client';

import { Fragment } from 'react';

import { GasPredictionRow, GasPredictionState } from '../types';

interface PredictionsTabProps {
  predictions: GasPredictionState | null;
}

export default function PredictionsTab({ predictions }: PredictionsTabProps) {
  const rows = predictions?.gasPredictions ?? [];
  const meta = predictions?.meta ?? null;
  const averagePriorityFee = predictions?.mempoolStats?.averagePriorityFee ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-[0.3em] text-[#8B949E] uppercase">Gas Predictions Timeline</h3>
        <div className="flex flex-wrap gap-3 text-xs text-[#8B949E]">
          <span>Fallback: {meta?.fallback ?? 'none'}</span>
          <span>Samples: {meta?.sampleSize ?? '—'}</span>
          <span>Alpha: {meta?.smoothingAlpha != null ? meta.smoothingAlpha.toFixed(2) : '—'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rows.length === 0 && (
          <div className="col-span-full p-6 rounded border border-[#21262D] bg-[#0D1117] text-center text-sm text-[#8B949E]">
            Awaiting prediction stream…
          </div>
        )}
        {rows.slice(0, 9).map((row, index) => (
          <PredictionCard key={row.blockNumber} row={row} index={index} />
        ))}
      </div>

      {meta && (
        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117]">
          <div className="text-xs uppercase tracking-[0.3em] text-[#8B949E] mb-3">Meta</div>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[#C9D1D9]">
            <MetaItem label="Estimated Priority" value={formatNumber(meta.estimatedPriorityFeeGwei)} suffix="gwei" />
            <MetaItem label="Base Fee Volatility" value={meta.baseFeeVolatility != null ? (meta.baseFeeVolatility * 100).toFixed(2) : '—'} suffix="%" />
            <MetaItem label="Current Block" value={predictions?.lastUpdateBlock ?? '—'} />
            <MetaItem label="Mempool Avg Priority" value={averagePriorityFee != null ? averagePriorityFee.toFixed(2) : '—'} suffix="gwei" />
          </dl>
        </div>
      )}
    </div>
  );
}

function PredictionCard({ row, index }: { row: GasPredictionRow; index: number }) {
  const palette = gradientPalette[index % gradientPalette.length];
  return (
    <div
      className={`rounded border bg-linear-to-br ${palette.gradient} p-4 shadow-lg shadow-black/15`}
      style={{ borderColor: palette.border }}
    >
      <div className="flex items-center justify-between mb-2" style={{ color: palette.text }}>
        <div className="text-xs uppercase tracking-[0.3em]">Block {row.blockNumber}</div>
        <div className="text-xs">{Math.round(row.confidence * 100)}% confidence</div>
      </div>
      <div className="text-2xl font-semibold text-white mb-3">{row.baseFeeGwei.toFixed(2)} gwei</div>
      <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: palette.text }}>
        <InfoLine label="Priority" value={`${row.estimatedPriorityFeeGwei.toFixed(2)} gwei`} />
        <InfoLine label="Effective" value={`${row.effectiveGasPriceGwei.toFixed(2)} gwei`} />
        <InfoLine label="Cost (ETH)" value={row.gasCostETH.toFixed(4)} />
        <InfoLine label="Cost (USD)" value={`$${row.gasCostUSD.toFixed(2)}`} />
      </div>
    </div>
  );
}

function MetaItem({ label, value, suffix }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.3em] text-[#8B949E] mb-1">{label}</dt>
      <dd className="text-lg font-semibold">{value}{suffix ? <Fragment> {suffix}</Fragment> : null}</dd>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="uppercase tracking-[0.3em] text-[10px] opacity-70">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function formatNumber(value?: number | null) {
  if (value == null) return '—';
  return value.toFixed(2);
}

const gradientPalette = [
  { gradient: 'from-sky-500/20 via-indigo-500/10 to-transparent', border: 'rgba(29,78,216,0.4)', text: '#C7D2FE' },
  { gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent', border: 'rgba(16,185,129,0.4)', text: '#BBF7D0' },
  { gradient: 'from-amber-500/20 via-orange-500/10 to-transparent', border: 'rgba(245,158,11,0.4)', text: '#FCD34D' },
];

