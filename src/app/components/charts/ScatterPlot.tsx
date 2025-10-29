'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';

interface ScatterPlotProps {
  data: Array<{ x: number; y: number; z?: number; [key: string]: any }>;
  height?: number;
  color?: string;
  showGrid?: boolean;
  xLabel?: string;
  yLabel?: string;
  className?: string;
}

export default function ScatterPlot({
  data,
  height = 300,
  color = '#06b6d4',
  showGrid = true,
  xLabel = 'X',
  yLabel = 'Y',
  className = ''
}: ScatterPlotProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
          )}
          <XAxis
            type="number"
            dataKey="x"
            name={xLabel}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            stroke="rgba(71, 85, 105, 0.5)"
            label={{ value: xLabel, position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={yLabel}
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            stroke="rgba(71, 85, 105, 0.5)"
            label={{ value: yLabel, angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter name="Data Points" data={data} fill={color} fillOpacity={0.6} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
