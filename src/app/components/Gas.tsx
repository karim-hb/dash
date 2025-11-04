'use client';

import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Card from './Card';

export default function Gas() {
  const { snapshot } = useWsSnapshot();
  const gasData = snapshot?.gas;
  const oracle = gasData?.oracle;
  const rawSuggestions = gasData?.suggestions;
  const buckets = snapshot?.summary?.gas_buckets || { gte_100: 0, gte_150: 0, gte_200: 0, gte_300: 0 };

  const formatGwei = (value?: number | null, digits = 2) =>
    value != null && Number.isFinite(value) ? value.toFixed(digits) : '—';

  const baseFeeGwei = oracle?.baseFeeGwei ?? (rawSuggestions?.base_fee ? rawSuggestions.base_fee / 1e9 : null);
  const predictedBaseFeeGwei = oracle?.predictedBaseFeeGwei ?? null;
  const predictedPriorityGwei = oracle?.predictedPriorityFeeGwei ?? null;

  const oracleSuggestions = oracle?.suggestions ?? { slow: null, average: null, fast: null };

  const baseFee = formatGwei(baseFeeGwei);
  const predictedBase = formatGwei(predictedBaseFeeGwei);
  const predictedPriority = formatGwei(predictedPriorityGwei);
  const slowTarget = formatGwei(oracleSuggestions.slow);
  const averageTarget = formatGwei(oracleSuggestions.average);
  const fastTarget = formatGwei(oracleSuggestions.fast);

  const latestHistory = oracle?.blockHistory ?? [];
  const previousBase = latestHistory.length > 1 ? latestHistory[latestHistory.length - 2].baseFeeGwei : null;
  const baseTrend = baseFeeGwei != null && previousBase != null
    ? (baseFeeGwei > previousBase ? 'RISING' : baseFeeGwei < previousBase ? 'FALLING' : 'STABLE')
    : 'UNKNOWN';

  const gasMetrics = [
    {
      label: 'BASE FEE',
      value: baseFee,
      unit: 'GWEI',
      icon: '⛽',
      color: 'text-cyan-400',
      description: 'Current network base fee'
    },
    {
      label: 'PREDICTED BASE',
      value: predictedBase,
      unit: 'GWEI',
      icon: '🔮',
      color: 'text-green-400',
      description: 'Forward-looking base fee estimate'
    },
    {
      label: 'PRIORITY (FAST)',
      value: predictedPriority,
      unit: 'GWEI',
      icon: '⚡',
      color: 'text-yellow-400',
      description: 'Estimated priority fee for next block'
    },
    {
      label: 'FAST TARGET',
      value: fastTarget,
      unit: 'GWEI',
      icon: '🚀',
      color: 'text-purple-400',
      description: 'High priority inclusion target'
    },
  ];

  const mempoolCount = oracle?.mempoolCount ?? 0;
  const congestionLevel = mempoolCount > 1500 ? 'HIGH' : mempoolCount > 800 ? 'MODERATE' : 'LOW';
  const congestionColor = mempoolCount > 1500 ? 'text-red-400' : mempoolCount > 800 ? 'text-yellow-400' : 'text-green-400';
  const confidencePct = oracle ? Math.round((oracle.confidence ?? 0) * 100) : 0;
  const priorityP50 = formatGwei(oracle?.priorityPercentiles?.p50);
  const priorityP90 = formatGwei(oracle?.priorityPercentiles?.p90);

  // Calculate total for percentages
  const totalBuckets = Object.values(buckets).reduce((sum, val) => sum + (val as number), 0) || 1;

  const bucketData = [
    {
      threshold: '≥100G',
      count: buckets.gte_100,
      percentage: ((buckets.gte_100 / totalBuckets) * 100).toFixed(1),
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500',
      height: Math.max((buckets.gte_100 / totalBuckets) * 80, 4)
    },
    {
      threshold: '≥150G',
      count: buckets.gte_150,
      percentage: ((buckets.gte_150 / totalBuckets) * 100).toFixed(1),
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500',
      height: Math.max((buckets.gte_150 / totalBuckets) * 80, 4)
    },
    {
      threshold: '≥200G',
      count: buckets.gte_200,
      percentage: ((buckets.gte_200 / totalBuckets) * 100).toFixed(1),
      color: 'text-orange-400',
      bgColor: 'bg-orange-500',
      height: Math.max((buckets.gte_200 / totalBuckets) * 80, 4)
    },
    {
      threshold: '≥300G',
      count: buckets.gte_300,
      percentage: ((buckets.gte_300 / totalBuckets) * 100).toFixed(1),
      color: 'text-red-400',
      bgColor: 'bg-red-500',
      height: Math.max((buckets.gte_300 / totalBuckets) * 80, 4)
    }
  ];

  return (
    <div className="space-y-8">
      {/* Bloomberg Paper-style Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-200 font-mono tracking-wider mb-2">
          GAS MARKET ANALYSIS
        </h2>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto"></div>
        <p className="text-sm text-slate-500 font-mono mt-3 tracking-wide">
          Real-time Ethereum gas pricing & transaction distribution
        </p>
      </div>

      {/* Gas Metrics - Bloomberg Terminal Cards */}
      <div className="terminal-grid terminal-grid-4">
        {gasMetrics.map((metric, index) => (
          <div key={index} className="glass-card border border-slate-700/50 p-6 bg-slate-950/30">
            <div className="flex items-start justify-between mb-4">
              <span className="text-2xl">{metric.icon}</span>
              <span className="text-xs text-slate-500 font-mono uppercase tracking-wider border border-slate-600 px-2 py-1 rounded">
                {metric.unit}
              </span>
            </div>
            <div className="space-y-3">
              <div className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">
                {metric.label}
              </div>
              <div className={`text-3xl font-bold font-mono ${metric.color}`}>
                {metric.value}
              </div>
              <div className="text-xs text-slate-500 font-mono leading-relaxed">
                {metric.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gas Distribution - Bloomberg Chart Style */}
      <Card
        title="TRANSACTION DISTRIBUTION BY GAS PRICE"
        icon={<span className="text-orange-400">📊</span>}
        variant="terminal"
      >
        <div className="space-y-6">
          {/* Chart Visualization */}
          <div className="glass-card border border-slate-700/30 p-6">
            <div className="flex items-center justify-center gap-8 mb-6">
              {bucketData.map((bucket, index) => (
                <div key={index} className="flex flex-col items-center gap-3">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-xs text-slate-400 font-mono uppercase tracking-wider font-semibold">
                      {bucket.threshold}
                    </div>
                    <div className={`w-4 ${bucket.bgColor} rounded-t-sm`} style={{ height: `${bucket.height}px` }}></div>
                    <div className={`text-sm font-mono font-bold ${bucket.color}`}>
                      {bucket.percentage}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={`terminal-badge ${bucket.color.replace('text-', '')} text-xs px-2 py-1`}>
                      {bucket.count}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center text-xs text-slate-500 font-mono mt-4">
              Transaction count by gas price threshold
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="glass-card border border-slate-700/30 overflow-hidden">
            <div className="p-4 border-b border-slate-700/30">
              <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                Detailed Distribution Analysis
              </h3>
            </div>
            <div className="divide-y divide-slate-700/20">
              {bucketData.map((bucket, index) => (
                <div key={index} className="p-4 flex items-center justify-between hover:bg-slate-900/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${bucket.bgColor}`}></div>
                    <div className="text-sm font-mono font-semibold text-slate-300">
                      {bucket.threshold}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {bucket.count} transactions
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-lg font-mono font-bold ${bucket.color}`}>
                      {bucket.percentage}%
                    </div>
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`${bucket.bgColor} h-full rounded-full`}
                        style={{ width: `${bucket.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Intelligence */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card border border-slate-700/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-cyan-400 text-xl">📈</span>
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Market Intelligence
                </h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Pending Transactions:</span>
                  <span className="text-slate-300 font-mono font-semibold">{mempoolCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Congestion Level:</span>
                  <span className={`${congestionColor} font-mono font-semibold`}>{congestionLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Oracle Confidence:</span>
                  <span className="text-slate-300 font-mono font-semibold">{confidencePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Median Priority:</span>
                  <span className="text-blue-400 font-mono font-semibold">{priorityP50} gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">90th Percentile:</span>
                  <span className="text-purple-400 font-mono font-semibold">{priorityP90} gwei</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-mono">Base Fee Trend:</span>
                  <span className="text-slate-300 font-mono font-semibold">{baseTrend}</span>
                </div>
              </div>
            </div>

            <div className="glass-card border border-slate-700/30 p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-blue-400 text-xl">💡</span>
                <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider">
                  Trading Recommendations
                </h3>
              </div>
              <div className="space-y-3 text-sm font-mono">
                <div className="text-blue-400">
                  • Target <span className="font-semibold">{averageTarget} gwei</span> for balanced inclusion.
                </div>
                <div className="text-cyan-400">
                  • Slow lane: bids near <span className="font-semibold">{slowTarget} gwei</span> while network is {congestionLevel.toLowerCase()}.
                </div>
                <div className="text-purple-400">
                  • Fast lane: bids above <span className="font-semibold">{fastTarget} gwei</span> for immediate confirmation.
                </div>
                <div className="text-green-400">
                  • Base fee trend is <span className="font-semibold">{baseTrend}</span>; adjust automation accordingly.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
