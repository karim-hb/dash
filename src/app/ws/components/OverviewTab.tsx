'use client';

import SparklineChart from '../../components/charts/SparklineChart';
import {
  GasAccuracyStats,
  GasPredictionState,
  PoolPayload,
  SnapshotPayload,
} from '../types';

interface OverviewTabProps {
  snapshot: SnapshotPayload | null;
  price: number | null;
  pool: PoolPayload | null;
  accuracy: GasAccuracyStats | null;
  predictions: GasPredictionState | null;
  connected: boolean;
  reconnecting: boolean;
  lastUpdated: number | null;
  baseFeeSeries: number[];
  confidenceSeries: number[];
}

export default function OverviewTab({
  snapshot,
  price,
  pool,
  accuracy,
  predictions,
  connected,
  reconnecting,
  lastUpdated,
  baseFeeSeries,
  confidenceSeries,
}: OverviewTabProps) {
  const lastBlock = snapshot?.lastBlock ?? predictions?.currentBlock?.['number'];
  const primaryPrediction = predictions?.gasPredictions?.[0];

  const statusLabel = connected
    ? 'Connected'
    : reconnecting
      ? 'Reconnecting…'
      : 'Disconnected';
  const statusColor = connected
    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    : reconnecting
      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30';

  const accuracyRate = accuracy ? `${(accuracy.accuracyRate * 100).toFixed(1)}%` : '—';
  const poolPending = pool?.pending ?? snapshot?.tracked?.length ?? 0;
  const poolTracked = pool?.tracked ?? snapshot?.tracked?.length ?? 0;

  const formattedPrice = price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—';
  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString(undefined, { hour12: false })
    : '—';

  return (
    <div className="space-y-4">
      <div className={`flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4 rounded border border-[#21262D] bg-[#111827] ${statusColor}`}>
        <div>
          <div className="text-sm uppercase tracking-[0.25em]">WebSocket Status</div>
          <div className="text-2xl font-bold">{statusLabel}</div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-[#8B949E]">
          <div>
            <span className="text-[#C9D1D9] font-semibold">Last Update:</span> {formattedLastUpdated}
          </div>
          <div>
            <span className="text-[#C9D1D9] font-semibold">Last Event:</span> {predictions?.lastUpdateBlock ?? lastBlock ?? '—'}
          </div>
          <div>
            <span className="text-[#C9D1D9] font-semibold">Tracked:</span> {poolTracked}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="ETH Price" primary={formattedPrice} hint="Live oracle feed" accent="from-cyan-500/30 to-blue-500/10" />
        <StatCard
          title="Last Block"
          primary={lastBlock != null ? `#${lastBlock}` : '—'}
          hint="synchronized head"
          accent="from-indigo-500/30 to-purple-500/10"
        />
        <StatCard
          title="Pending"
          primary={poolPending.toLocaleString()}
          hint="txpool pending snapshot"
          accent="from-amber-500/30 to-orange-500/10"
        />
        <StatCard
          title="Prediction Accuracy"
          primary={accuracyRate}
          hint={`window ${accuracy?.total ?? 0} samples`}
          accent="from-emerald-500/20 to-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-[#8B949E]">Base Fee Forecast</div>
              <div className="text-xl font-semibold text-[#C9D1D9]">
                {primaryPrediction ? `${primaryPrediction.baseFeeGwei.toFixed(2)} gwei` : 'No data'}
              </div>
            </div>
            <div className="text-xs text-[#8B949E]">
              Confidence {primaryPrediction ? `${Math.round(primaryPrediction.confidence * 100)}%` : '—'}
            </div>
          </div>
          <SparklineChart data={baseFeeSeries.length ? baseFeeSeries : [0]} color="#3b82f6" height={64} />
          <div className="mt-3 text-xs text-[#8B949E] flex flex-wrap gap-3">
            <div>Estimated priority: {primaryPrediction ? `${primaryPrediction.estimatedPriorityFeeGwei.toFixed(2)} gwei` : '—'}</div>
            <div>Effective: {primaryPrediction ? `${primaryPrediction.effectiveGasPriceGwei.toFixed(2)} gwei` : '—'}</div>
          </div>
        </div>

        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117] shadow-lg shadow-black/20">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-[#8B949E]">Confidence Outlook</div>
              <div className="text-xl font-semibold text-[#C9D1D9]">
                {confidenceSeries.length ? `${Math.max(...confidenceSeries).toFixed(0)}% peak` : 'No data'}
              </div>
            </div>
            <div className="text-xs text-[#8B949E]">fallback: {predictions?.meta?.fallback ?? 'none'}</div>
          </div>
          <SparklineChart data={confidenceSeries.length ? confidenceSeries : [0]} color="#10b981" height={64} />
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-[#8B949E]">
            <div>
              Samples: {predictions?.meta?.sampleSize ?? '—'}
            </div>
            <div>
              Volatility: {predictions?.meta?.baseFeeVolatility != null ? `${(predictions.meta.baseFeeVolatility * 100).toFixed(1)}%` : '—'}
            </div>
            <div>
              Alpha: {predictions?.meta?.smoothingAlpha != null ? predictions.meta.smoothingAlpha.toFixed(2) : '—'}
            </div>
            <div>
              Last update block: {predictions?.lastUpdateBlock ?? '—'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  primary: string;
  hint: string;
  accent: string;
}

function StatCard({ title, primary, hint, accent }: StatCardProps) {
  return (
    <div className={`p-4 rounded border border-[#21262D] bg-linear-to-br ${accent} shadow-md shadow-black/10`}> 
      <div className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-2">{title}</div>
      <div className="text-3xl font-bold text-[#C9D1D9] mb-1">{primary}</div>
      <div className="text-[11px] text-[#8B949E]">{hint}</div>
    </div>
  );
}

