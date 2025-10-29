'use client';

import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BarChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  colors?: string[];
  showGrid?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

export default function BarChart({
  data,
  height = 300,
  colors = DEFAULT_COLORS,
  showGrid = true,
  className = ''
}: BarChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
          )}
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
            stroke="rgba(71, 85, 105, 0.5)"
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12, fontFamily: 'monospace' }}
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
            cursor={{ fill: 'rgba(56, 189, 248, 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}
