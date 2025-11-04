'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AmmMath, AmmDataUtils } from '../../../lib/ammUtils';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-900 flex items-center justify-center text-gray-500">Loading Chart...</div>
});

interface PriceChartProps {
  data: Array<{
    timestamp: string | Date;
    price?: number;
    volume?: number;
    high?: number;
    low?: number;
    open?: number;
    close?: number;
  }>;
  title?: string;
  height?: number;
}

export function PriceChart({ data, title = "Price Chart", height = 400 }: PriceChartProps) {
  // Transform data for candlestick chart if OHLC data available
  const hasOHLC = data.some(d => d.high && d.low && d.open && d.close);

  if (hasOHLC) {
    const ohlcData = data.filter(d => d.high && d.low && d.open && d.close);
    const volumeData = data.filter(d => d.volume);

    const traces = [
      {
        x: ohlcData.map(d => new Date(d.timestamp)),
        open: ohlcData.map(d => d.open!),
        high: ohlcData.map(d => d.high!),
        low: ohlcData.map(d => d.low!),
        close: ohlcData.map(d => d.close!),
        type: 'candlestick' as const,
        name: 'Price',
        xaxis: 'x',
        yaxis: 'y'
      }
    ];

    if (volumeData.length > 0) {
      traces.push({
        x: volumeData.map(d => new Date(d.timestamp)),
        y: volumeData.map(d => d.volume!),
        type: 'bar' as const,
        name: 'Volume',
        xaxis: 'x',
        yaxis: 'y2',
        marker: { color: 'rgba(0, 255, 0, 0.3)' }
      });
    }

    return (
      <div className="bg-gray-900 border border-gray-800 rounded p-4">
        <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
        <Plot
          data={traces}
          layout={{
            width: undefined,
            height,
            margin: { t: 20, r: 50, b: 40, l: 50 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#d1d5db', size: 8 },
            xaxis: {
              type: 'date',
              gridcolor: '#374151',
              linecolor: '#4b5563'
            },
            yaxis: {
              title: 'Price',
              gridcolor: '#374151',
              linecolor: '#4b5563'
            },
            yaxis2: {
              title: 'Volume',
              overlaying: 'y',
              side: 'right',
              gridcolor: '#374151',
              linecolor: '#4b5563'
            },
            showlegend: true,
            legend: { x: 0, y: 1 }
          }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
    );
  }

  // Simple line chart for price data
  const priceData = data.filter(d => d.price).map(d => ({
    x: new Date(d.timestamp),
    y: d.price!
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-4">
      <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
      <Plot
        data={[{
          x: priceData.map(d => d.x),
          y: priceData.map(d => d.y),
          type: 'scatter',
          mode: 'lines',
          name: 'Price',
          line: { color: '#10b981', width: 2 }
        }]}
        layout={{
          width: undefined,
          height,
          margin: { t: 20, r: 20, b: 40, l: 50 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#d1d5db', size: 8 },
          xaxis: {
            type: 'date',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          },
          yaxis: {
            title: 'Price',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}

interface VolumeChartProps {
  data: Array<{
    timestamp: string | Date;
    volume: number;
    protocol?: string;
  }>;
  title?: string;
  height?: number;
  groupByProtocol?: boolean;
}

export function VolumeChart({ data, title = "Volume Chart", height = 300, groupByProtocol = false }: VolumeChartProps) {
  if (groupByProtocol) {
    // Group by protocol
    const groupedData = AmmDataUtils.groupEventsByInterval(
      data.map(d => ({ timestamp: d.timestamp, volume: d.volume, protocol: d.protocol })),
      60 // 1 hour intervals
    );

    const protocols = [...new Set(data.map(d => d.protocol).filter(Boolean))];

    const traces = protocols.map(protocol => {
      const protocolData = groupedData.map(interval => ({
        x: interval.timestamp,
        y: interval.events
          .filter(e => e.protocol === protocol)
          .reduce((sum, e) => sum + (e.volume || 0), 0)
      }));

      return {
        x: protocolData.map(d => d.x),
        y: protocolData.map(d => d.y),
        type: 'bar' as const,
        name: protocol || 'Unknown',
        stackgroup: 'one'
      };
    });

    return (
      <div className="bg-gray-900 border border-gray-800 rounded p-4">
        <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
        <Plot
          data={traces}
          layout={{
            width: undefined,
            height,
            margin: { t: 20, r: 20, b: 40, l: 50 },
            paper_bgcolor: 'transparent',
            plot_bgcolor: 'transparent',
            font: { color: '#d1d5db', size: 8 },
            barmode: 'stack',
            xaxis: {
              type: 'date',
              gridcolor: '#374151',
              linecolor: '#4b5563'
            },
            yaxis: {
              title: 'Volume',
              gridcolor: '#374151',
              linecolor: '#4b5563'
            },
            showlegend: true,
            legend: { x: 0, y: 1 }
          }}
          config={{ responsive: true, displayModeBar: false }}
        />
      </div>
    );
  }

  // Simple volume chart
  const volumeData = data.map(d => ({
    x: new Date(d.timestamp),
    y: d.volume
  }));

  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-4">
      <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
      <Plot
        data={[{
          x: volumeData.map(d => d.x),
          y: volumeData.map(d => d.y),
          type: 'bar',
          name: 'Volume',
          marker: { color: '#3b82f6' }
        }]}
        layout={{
          width: undefined,
          height,
          margin: { t: 20, r: 20, b: 40, l: 50 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#d1d5db', size: 8 },
          xaxis: {
            type: 'date',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          },
          yaxis: {
            title: 'Volume',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}

interface LiquidityHeatmapProps {
  data: Array<{
    poolAddress: string;
    token0Symbol: string;
    token1Symbol: string;
    liquidityUSD: number;
    volume24hUSD: number;
  }>;
  title?: string;
  height?: number;
}

export function LiquidityHeatmap({ data, title = "Liquidity Heatmap", height = 400 }: LiquidityHeatmapProps) {
  // Create a matrix for the heatmap
  const tokenPairs = [...new Set(data.map(d => `${d.token0Symbol}/${d.token1Symbol}`))];
  const pools = [...new Set(data.map(d => d.poolAddress))];

  const zValues: number[][] = [];
  const xLabels = pools;
  const yLabels = tokenPairs;

  for (const pair of tokenPairs) {
    const row: number[] = [];
    for (const pool of pools) {
      const entry = data.find(d =>
        d.poolAddress === pool &&
        `${d.token0Symbol}/${d.token1Symbol}` === pair
      );
      row.push(entry ? Math.log10(entry.liquidityUSD + 1) : 0);
    }
    zValues.push(row);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-4">
      <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
      <Plot
        data={[{
          z: zValues,
          x: xLabels,
          y: yLabels,
          type: 'heatmap',
          colorscale: [
            [0, '#1f2937'], // Dark gray for low liquidity
            [0.5, '#f59e0b'], // Orange for medium
            [1, '#10b981'] // Green for high liquidity
          ],
          showscale: true
        }]}
        layout={{
          width: undefined,
          height,
          margin: { t: 20, r: 80, b: 60, l: 80 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#d1d5db', size: 6 },
          xaxis: {
            tickangle: -45,
            tickfont: { size: 6 }
          },
          yaxis: {
            tickfont: { size: 6 }
          }
        }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}

interface PoolEfficiencyChartProps {
  data: Array<{
    poolAddress: string;
    utilization: number;
    annualFeeYield: number;
    volume24hUSD: number;
  }>;
  title?: string;
  height?: number;
}

export function PoolEfficiencyChart({ data, title = "Pool Efficiency", height = 400 }: PoolEfficiencyChartProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded p-4">
      <h3 className="text-[8px] font-mono text-gray-300 mb-2">{title}</h3>
      <Plot
        data={[
          {
            x: data.map(d => d.utilization),
            y: data.map(d => d.annualFeeYield),
            mode: 'markers',
            type: 'scatter',
            name: 'Pools',
            text: data.map(d => `Pool: ${d.poolAddress.slice(0, 6)}...<br>Utilization: ${d.utilization.toFixed(1)}%<br>Yield: ${d.annualFeeYield.toFixed(2)}%`),
            marker: {
              size: data.map(d => Math.max(5, Math.min(20, Math.log10(d.volume24hUSD + 1) * 2))),
              color: data.map(d => d.annualFeeYield),
              colorscale: 'Viridis',
              showscale: true,
              colorbar: {
                title: 'Annual Yield %',
                titleside: 'right'
              }
            }
          }
        ]}
        layout={{
          width: undefined,
          height,
          margin: { t: 20, r: 80, b: 60, l: 60 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent',
          font: { color: '#d1d5db', size: 8 },
          xaxis: {
            title: 'Utilization %',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          },
          yaxis: {
            title: 'Annual Fee Yield %',
            gridcolor: '#374151',
            linecolor: '#4b5563'
          },
          hovermode: 'closest'
        }}
        config={{ responsive: true, displayModeBar: false }}
      />
    </div>
  );
}

// Volume Heatmap Chart - Shows trading volume intensity over time
export function VolumeHeatmapChart({ data, title, height }: { data: any[]; title: string; height: number }) {
  // Transform data for heatmap
  const heatmapData = data.slice(0, 20).map((pool, poolIndex) => {
    const volume = pool.volume24hUSD || 0;
    const liquidity = pool.liquidityUSD || 0;
    const efficiency = liquidity > 0 ? (volume / liquidity) * 100 : 0;

    return {
      pool: pool.poolAddress ? pool.poolAddress.slice(0, 6) + "..." : `Pool ${poolIndex + 1}`,
      volume: Math.log10(volume + 1), // Log scale for better visualization
      liquidity: Math.log10(liquidity + 1),
      efficiency: Math.min(efficiency, 100), // Cap at 100%
      color: efficiency < 10 ? "#F85149" : efficiency < 50 ? "#FFA657" : "#00FF66"
    };
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-mono text-sm mb-2">{title}</h3>
      <div style={{ height: height - 40, width: "100%" }}>
        <Plot
          data={[{
            x: heatmapData.map(d => d.pool),
            y: ["Volume (log)", "Liquidity (log)", "Efficiency %"],
            z: [
              heatmapData.map(d => d.volume),
              heatmapData.map(d => d.liquidity),
              heatmapData.map(d => d.efficiency)
            ],
            type: "heatmap",
            colorscale: "Viridis",
            showscale: true,
            hoverongaps: false
          }]}
          layout={{
            width: undefined,
            height: height - 40,
            margin: { t: 20, r: 20, b: 40, l: 60 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "#1F2937",
            font: { color: "#D1D5DB", size: 8 },
            xaxis: {
              tickangle: -45,
              tickfont: { size: 6 },
              gridcolor: "#374151"
            },
            yaxis: {
              tickfont: { size: 6 },
              gridcolor: "#374151"
            }
          }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
        />
      </div>
    </div>
  );
}

// Correlation Plot - Shows relationships between different metrics
export function CorrelationPlot({ data, title, height }: { data: any[]; title: string; height: number }) {
  // Calculate correlations between volume, liquidity, and efficiency
  const correlationData = data.slice(0, 50).map((pool, index) => {
    const volume = pool.volume24hUSD || 0;
    const liquidity = pool.liquidityUSD || 0;
    const efficiency = liquidity > 0 ? (volume / liquidity) * 100 : 0;

    return {
      x: volume,
      y: liquidity,
      z: efficiency,
      name: pool.poolAddress ? pool.poolAddress.slice(0, 8) + "..." : `Pool ${index + 1}`,
      size: Math.sqrt(volume + liquidity) / 100, // Size based on combined metrics
    };
  });

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h3 className="text-white font-mono text-sm mb-2">{title}</h3>
      <div style={{ height: height - 40, width: "100%" }}>
        <Plot
          data={[{
            x: correlationData.map(d => d.x),
            y: correlationData.map(d => d.y),
            mode: "markers",
            type: "scatter",
            name: "Volume vs Liquidity",
            text: correlationData.map(d => d.name),
            marker: {
              size: correlationData.map(d => Math.max(d.size, 2)),
              color: correlationData.map(d => d.z),
              colorscale: "Viridis",
              showscale: true,
              colorbar: {
                title: "Efficiency %",
                titleside: "right",
                tickfont: { size: 8, color: "#D1D5DB" }
              }
            },
            hovertemplate:
              "<b>%{text}</b><br>" +
              "Volume: $%{x:,.0f}<br>" +
              "Liquidity: $%{y:,.0f}<br>" +
              "Efficiency: %{marker.color:.1f}%<extra></extra>"
          }]}
          layout={{
            width: undefined,
            height: height - 40,
            margin: { t: 20, r: 80, b: 40, l: 60 },
            paper_bgcolor: "transparent",
            plot_bgcolor: "#1F2937",
            font: { color: "#D1D5DB", size: 8 },
            xaxis: {
              title: "24h Volume (USD)",
              tickfont: { size: 7 },
              gridcolor: "#374151",
              type: "log"
            },
            yaxis: {
              title: "Liquidity (USD)",
              tickfont: { size: 7 },
              gridcolor: "#374151",
              type: "log"
            },
            showlegend: false
          }}
          config={{
            displayModeBar: false,
            responsive: true
          }}
        />
      </div>
    </div>
  );
}
