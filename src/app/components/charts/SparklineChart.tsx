'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color?: string;
  width?: string | number;
  height?: number;
  className?: string;
}

export default function SparklineChart({
  data,
  color = '#06b6d4',
  width = '100%',
  height = 40,
  className = ''
}: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <div className={`${className}`} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
