'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeSeriesData {
  time: string;
  [key: string]: string | number;
}

interface TimeSeriesChartProps {
  data: TimeSeriesData[];
  lines: Array<{ dataKey: string; color: string; name: string }>;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

export default function TimeSeriesChart({
  data,
  lines,
  height = 300,
  showGrid = true,
  className = ''
}: TimeSeriesChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
          )}
          <XAxis
            dataKey="time"
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            stroke="rgba(71, 85, 105, 0.5)"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
            stroke="rgba(71, 85, 105, 0.5)"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(71, 85, 105, 0.5)',
              borderRadius: '8px',
              color: '#f1f5f9',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#94a3b8'
            }}
          />
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              dot={false}
              name={line.name}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
