'use client';

interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

interface HeatmapChartProps {
  data: HeatmapCell[];
  width?: number;
  height?: number;
  colorScale?: { min: string; max: string };
  className?: string;
}

export default function HeatmapChart({
  data,
  width = 600,
  height = 300,
  colorScale = { min: '#1e293b', max: '#06b6d4' },
  className = ''
}: HeatmapChartProps) {
  // Get unique x and y values
  const xValues = Array.from(new Set(data.map(d => d.x))).sort();
  const yValues = Array.from(new Set(data.map(d => d.y))).sort();

  // Find min and max values for color scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  const getCellColor = (value: number) => {
    if (maxValue === minValue) return colorScale.max;
    const ratio = (value - minValue) / (maxValue - minValue);
    
    // Simple color interpolation between min and max
    const minRGB = hexToRgb(colorScale.min);
    const maxRGB = hexToRgb(colorScale.max);
    
    const r = Math.round(minRGB.r + ratio * (maxRGB.r - minRGB.r));
    const g = Math.round(minRGB.g + ratio * (maxRGB.g - minRGB.g));
    const b = Math.round(minRGB.b + ratio * (maxRGB.b - minRGB.b));
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const cellWidth = width / xValues.length;
  const cellHeight = height / yValues.length;

  return (
    <div className={`${className} overflow-x-auto`}>
      <div className="inline-block min-w-full">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${xValues.length}, minmax(0, 1fr))` }}>
          {yValues.map((y) => (
            xValues.map((x) => {
              const cell = data.find(d => d.x === x && d.y === y);
              const value = cell?.value || 0;
              const color = getCellColor(value);
              
              return (
                <div
                  key={`${x}-${y}`}
                  className="relative group"
                  style={{
                    minWidth: `${Math.max(cellWidth, 40)}px`,
                    minHeight: `${Math.max(cellHeight, 30)}px`,
                    backgroundColor: color,
                    border: '1px solid rgba(71, 85, 105, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-mono text-white opacity-70 group-hover:opacity-100">
                      {value.toFixed(0)}
                    </span>
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none z-10 whitespace-nowrap">
                    {x} / {y}: {value.toFixed(2)}
                  </div>
                </div>
              );
            })
          ))}
        </div>
        
        {/* Axis labels */}
        <div className="mt-2 flex justify-around">
          {xValues.map((x) => (
            <span key={x} className="text-xs font-mono text-slate-400">{x}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : { r: 0, g: 0, b: 0 };
}
