'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useWsSnapshot } from '../hooks/useWsSnapshot';
import Table from './Table';
import BigNumber from 'bignumber.js';
import _ from 'lodash';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="text-center py-4 text-gray-500">Loading chart...</div>
});

function ago(ts?: number | null) {
  if (!ts) return '-';
  const d = Math.max(0, (Date.now() - ts) / 1000);
  if (d < 60) return `${d.toFixed(0)}s`;
  if (d < 3600) return `${Math.floor(d / 60)}m`;
  return `${Math.floor(d / 3600)}h`;
}

function formatTime(ts?: number | null) {
  if (!ts) return '-';
  return new Date(ts).toLocaleTimeString();
}

export default function Oracles() {
  const { snapshot } = useWsSnapshot();
  const rows = snapshot?.oracles || [];
  // Build feedsByPair from oracle rows
  const feedsByPair = React.useMemo(() => {
    const byPair = new Map<string, typeof rows>();
    for (const feed of rows) {
      const pair = feed.pair || 'UNKNOWN';
      const existing = byPair.get(pair) || [];
      existing.push(feed);
      byPair.set(pair, existing);
    }
    return Array.from(byPair.entries()).map(([pair, feeds]) => ({ pair, feeds }));
  }, [rows]);
  const [viewMode, setViewMode] = React.useState<'list' | 'comparison'>('comparison');

  // Provider order for consistent display
  const providerOrder = ['Chainlink', 'Band', 'Tellor', 'API3', 'Pyth', 'DEX_TWAP'];
  const providerColors: Record<string, string> = {
    Chainlink: 'text-[#0066FF]',
    Band: 'text-[#A371F7]',
    Tellor: 'text-[#FFA657]',
    API3: 'text-[#FF7B72]',
    Pyth: 'text-[#00FF66]',
    DEX_TWAP: 'text-[#58A6FF]',
  };

  // Build comparison table
  const comparisonRows = feedsByPair.map((pairGroup: any) => {
    const row: any = {
      pair: pairGroup.pair,
      time: formatTime(pairGroup.feeds?.[0]?.last_updated),
      _feeds: pairGroup.feeds, // Include feeds for authenticity calculation
    };
    
    // Add columns for each provider
    providerOrder.forEach(provider => {
      const feed = pairGroup.feeds?.find((f: any) => f.provider === provider);
      if (feed) {
        row[`${provider}_price`] = feed.price_usd;
        row[`${provider}_status`] = feed.status;
        row[`${provider}_updated`] = feed.last_updated;
        row[`${provider}_heartbeat`] = feed.heartbeat_sec;
      } else {
        row[`${provider}_price`] = null;
        row[`${provider}_status`] = null;
        row[`${provider}_updated`] = null;
        row[`${provider}_heartbeat`] = null;
      }
    });

    // Calculate heartbeat summary
    const heartbeats = pairGroup.feeds
      ?.map((f: any) => f.heartbeat_sec)
      .filter(Boolean)
      .sort((a: number, b: number) => a - b);
    row.heartbeat_summary = heartbeats?.length 
      ? heartbeats.map((h: number) => `${h}s`).join(' / ') 
      : '-';

    // Status: Active if any feed is healthy
    const hasHealthy = pairGroup.feeds?.some((f: any) => f.status === 'healthy');
    row.status = hasHealthy ? 'Active' : 'Inactive';

    return row;
  });

  const listColumns = [
    { key: 'provider', header: 'Provider', className: 'font-mono text-[#0066FF]' },
    { key: 'pair', header: 'Pair' },
    { key: 'price_usd', header: 'Price', render: (v: number) => v != null ? `$${v.toFixed(4)}` : '-', className: 'text-[#00FF66] font-semibold' },
    { key: 'last_updated', header: 'Last Update', render: (v: number) => {
      const secondsAgo = v ? Math.floor((Date.now() - v) / 1000) : null;
      return secondsAgo !== null ? `${secondsAgo}s ago` : '-';
    }, className: 'text-[#8B949E]' },
    { key: 'heartbeat_sec', header: 'Heartbeat', render: (v: number) => v ? `${v}s` : '-', className: 'text-[#58A6FF]' },
    { key: 'status', header: 'Status', render: (v: string, row: any) => {
      const lastUpdate = row.last_updated;
      const secondsAgo = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : null;
      return (
        <div className="flex items-center gap-1">
          <span className={`inline-block w-2 h-2 rounded-full opacity-60 ${
            v === 'healthy' ? 'bg-[#00FF66] animate-pulse shadow-[0_0_4px_rgba(0,255,102,0.5)]' :
            v === 'stale' ? 'bg-[#FFA657]' : 'bg-[#F85149]'
          }`} style={{ animationDuration: '3s' }} />
          <span className={v === 'healthy' ? 'text-[#00FF66]' : v === 'stale' ? 'text-[#FFA657]' : 'text-[#F85149]'}>
            {v || '-'}
          </span>
          {secondsAgo !== null && (
            <span className="text-xs text-[#8B949E] ml-1">
              ({secondsAgo}s)
            </span>
          )}
        </div>
      );
    }},
    { key: 'deviation_vs_spot_pct', header: 'Dev vs DEX', render: (v: number) => v != null ? `${v.toFixed(2)}%` : '-', className: 'text-[#58A6FF]' },
    { key: 'authenticity_score', header: 'Authenticity', render: (v: number) => v != null ? `${v}%` : '-', className: 'text-[#00FF66] font-mono' },
    { key: 'oracle_count', header: 'Oracles', render: (v: number) => v != null ? `${v}` : '-', className: 'text-[#58A6FF]' },
    { key: 'round_id', header: 'Round', render: (v: number) => v != null ? `#${v}` : '-', className: 'text-[#C9D1D9] font-mono' },
  ];

  const comparisonColumns = [
    { key: 'pair', header: 'Pair', className: 'font-mono text-[#0066FF]' },
    { key: 'time', header: 'Time', className: 'text-[#8B949E]' },
    ...providerOrder.map(provider => ({
      key: `${provider}_price`,
      header: provider,
      render: (v: number, row: any) => {
        const status = row[`${provider}_status`];
        const lastUpdate = row[`${provider}_updated`];
        const secondsAgo = lastUpdate ? Math.floor((Date.now() - lastUpdate) / 1000) : null;
        const feed = row._feeds?.find((f: any) => f.provider === provider);
        const authenticityScore = feed?.authenticity_score;
        const oracleCount = feed?.oracle_count;

        if (v == null || !Number.isFinite(v)) return '-';
        return (
          <div className="flex flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <span className={`inline-block w-1.5 h-1.5 rounded-full opacity-60 ${
                status === 'healthy' ? 'bg-[#00FF66] animate-pulse shadow-[0_0_4px_rgba(0,255,102,0.5)]' :
                status === 'stale' ? 'bg-[#FFA657]' : 'bg-[#F85149]'
              }`} style={{ animationDuration: '3s' }} />
              <span className={`${providerColors[provider] || 'text-[#C9D1D9]'} font-semibold`}>${v.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {authenticityScore != null && (
                <span className="text-[#00FF66] font-mono">{authenticityScore}%</span>
              )}
              {oracleCount && (
                <span className="text-[#58A6FF]">{oracleCount}o</span>
              )}
              {secondsAgo !== null && (
                <span className="text-[#8B949E]">{secondsAgo}s</span>
              )}
            </div>
          </div>
        );
      },
      className: 'text-right',
    })),
    { key: 'heartbeat_summary', header: 'Heartbeat', render: (v: string, row: any) => {
      // Calculate average seconds ago from all providers in this pair
      const updates = providerOrder
        .map(p => row[`${p}_updated`])
        .filter(u => u != null);
      const avgSeconds = updates.length > 0
        ? Math.floor(updates.reduce((sum, u) => sum + Math.floor((Date.now() - u) / 1000), 0) / updates.length)
        : null;

      return (
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs text-[#8B949E]">{v}</span>
          {avgSeconds !== null && (
            <span className="text-xs text-[#8B949E]">
              {avgSeconds}s ago
            </span>
          )}
        </div>
      );
    }},
    { key: 'status', header: 'Status', render: (v: string, row: any) => {
      // Calculate average authenticity for the pair
      const feeds = row._feeds || [];
      const avgAuthenticity = feeds.length > 0
        ? feeds.reduce((sum: number, f: any) => sum + (f.authenticity_score || 0), 0) / feeds.length
        : 0;
      return (
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full opacity-60 ${
              v === 'Active' ? 'bg-[#00FF66] animate-pulse shadow-[0_0_4px_rgba(0,255,102,0.5)]' : 'bg-[#F85149]'
            }`} style={{ animationDuration: '3s' }} />
            <span className={v === 'Active' ? 'text-[#00FF66]' : 'text-[#F85149]'}>{v}</span>
          </div>
          {avgAuthenticity > 0 && (
            <span className="text-xs text-[#8B949E] font-mono">{avgAuthenticity.toFixed(0)}% auth</span>
          )}
        </div>
      );
    }},
  ];

  return (
    <div className="h-full flex flex-col bg-[#0D1117]">
      <div className="bg-[#161B22] border-b-2 border-[#0066FF] px-4 py-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-[#0066FF] shadow-[0_0_6px_rgba(0,102,255,0.5)]"></div>
            <h2 className="font-mono text-[13px] font-bold uppercase tracking-widest text-[#0066FF]">ORACLES</h2>
            <div className="px-3 py-1.5 bg-[#21262D] text-[#C9D1D9] text-[9px] font-mono border border-[#30363D] rounded">
              {rows.length} FEEDS ({feedsByPair.length} PAIRS)
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
                viewMode === 'comparison'
                  ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                  : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
              }`}
            >
              COMPARISON
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-5 py-2 text-[9px] font-mono border rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-[#0066FF] text-[#0D1117] border-[#0066FF] shadow-[0_2px_8px_rgba(0,102,255,0.4)]'
                  : 'bg-[#21262D] text-[#C9D1D9] border-[#30363D] hover:bg-[#30363D] hover:border-[#0066FF]/50'
              }`}
            >
              LIST
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {viewMode === 'comparison' ? (
          <Table 
            data={comparisonRows} 
            columns={comparisonColumns} 
            emptyMessage="[NO ORACLE DATA]" 
            density="compact" 
          />
        ) : (
          <Table
            data={rows}
            columns={listColumns}
            emptyMessage="[NO ORACLE DATA]"
            density="compact"
          />
        )}

        {/* Price Comparison Chart */}
        {viewMode === 'comparison' && feedsByPair.length > 0 && (
          <div className="mt-4 bg-[#161B22] border border-[#30363D] rounded-lg p-4">
            <h3 className="text-[#C9D1D9] font-mono text-[11px] font-bold uppercase tracking-wider mb-3">
              📊 PRICE COMPARISON MATRIX
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedsByPair.slice(0, 6).map((pairGroup, index) => {
                const providerData = providerOrder.map(provider => {
                  const feed = pairGroup.feeds.find((f: any) => f.provider === provider);
                  return {
                    provider,
                    price: feed?.price_usd || null,
                    color: providerColors[provider] || '#8B949E'
                  };
                }).filter(d => d.price !== null);

                if (providerData.length < 2) return null;

                // Calculate price differences and volatility
                const prices = providerData.map(d => d.price).filter(p => p !== null);
                const avgPrice = _.mean(prices);
                const maxPrice = _.max(prices);
                const minPrice = _.min(prices);
                const volatility = maxPrice && minPrice ? ((maxPrice - minPrice) / avgPrice) * 100 : 0;

                return (
                  <div key={index} className="bg-[#0D1117] border border-[#30363D] rounded p-3">
                    <h4 className="text-[#58A6FF] font-mono text-[10px] font-bold mb-2">
                      {pairGroup.pair}
                    </h4>
                    <div className="text-[9px] text-[#8B949E] mb-2">
                      Volatility: {volatility.toFixed(2)}%
                    </div>
                    <div className="space-y-1">
                      {providerData.map((data, idx) => {
                        const deviation = ((data.price! - avgPrice) / avgPrice) * 100;
                        return (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-[8px] font-mono" style={{ color: data.color }}>
                              {data.provider}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] font-mono text-[#C9D1D9]">
                                ${data.price!.toFixed(4)}
                              </span>
                              <span className={`text-[7px] font-mono ${
                                Math.abs(deviation) < 0.1 ? 'text-[#00FF66]' :
                                Math.abs(deviation) < 1 ? 'text-[#FFA657]' :
                                'text-[#F85149]'
                              }`}>
                                {deviation > 0 ? '+' : ''}{deviation.toFixed(2)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Spread Chart */}
            <div className="mt-4">
              <h4 className="text-[#C9D1D9] font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
                📈 PRICE SPREAD ANALYSIS
              </h4>
              <div style={{ height: '300px', width: '100%' }}>
                <Plot
                  data={feedsByPair.slice(0, 8).map((pairGroup, index) => {
                    const prices = providerOrder.map(provider => {
                      const feed = pairGroup.feeds.find((f: any) => f.provider === provider);
                      return feed?.price_usd || null;
                    }).filter(p => p !== null);

                    if (prices.length < 2) return null;

                    const avgPrice = _.mean(prices);
                    const spread = _.max(prices)! - _.min(prices)!;
                    const spreadPercent = (spread / avgPrice) * 100;

                    return {
                      x: [pairGroup.pair],
                      y: [spreadPercent],
                      type: 'bar' as const,
                      name: pairGroup.pair,
                      marker: {
                        color: spreadPercent < 1 ? '#00FF66' :
                               spreadPercent < 5 ? '#FFA657' : '#F85149'
                      },
                      showlegend: false
                    };
                  }).filter(Boolean)}
                  layout={{
                    width: undefined,
                    height: 300,
                    margin: { t: 20, r: 20, b: 60, l: 60 },
                    paper_bgcolor: 'transparent',
                    plot_bgcolor: '#0D1117',
                    font: { color: '#C9D1D9', size: 8 },
                    xaxis: {
                      tickangle: -45,
                      tickfont: { size: 7 },
                      gridcolor: '#30363D'
                    },
                    yaxis: {
                      title: 'Price Spread %',
                      tickfont: { size: 7 },
                      gridcolor: '#30363D'
                    },
                    title: {
                      text: 'Oracle Price Spread by Pair',
                      font: { size: 10, color: '#C9D1D9' }
                    }
                  }}
                  config={{
                    displayModeBar: false,
                    responsive: true
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}