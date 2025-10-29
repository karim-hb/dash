'use client';

import { AreaChart as RechartsAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AreaChartProps {
  data: Array<{ name: string; [key: string]: string | number }>;
  dataKeys: Array<{ key: string; color: string; name: string }>;
  height?: number;
  showGrid?: boolean;
  className?: string;
}

export default function AreaChart({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  className = ''
}: AreaChartProps) {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
          )}
          <XAxis
            dataKey="name"
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
          {dataKeys.map((item) => (
            <Area
              key={item.key}
              type="monotone"
              dataKey={item.key}
              stroke={item.color}
              fill={`${item.color}40`}
              strokeWidth={2}
              name={item.name}
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
