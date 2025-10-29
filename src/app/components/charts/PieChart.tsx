'use client';

import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  height?: number;
  colors?: string[];
  showLegend?: boolean;
  innerRadius?: number;
  className?: string;
}

const DEFAULT_COLORS = [
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#f43f5e', '#6366f1', '#14b8a6', '#eab308'
];

export default function PieChart({
  data,
  height = 300,
  colors = DEFAULT_COLORS,
  showLegend = true,
  innerRadius = 0,
  className = ''
}: PieChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={innerRadius > 0 ? innerRadius + 60 : 80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Pie>
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
          {showLegend && (
            <Legend
              wrapperStyle={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#94a3b8'
              }}
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}
