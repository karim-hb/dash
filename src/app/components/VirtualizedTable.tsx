'use client';

import React, { useMemo } from 'react';
import { FixedSizeList } from 'react-window';
import { Column } from './Table';

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
}

export default function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  itemHeight = 24,
  className = "",
  onRowClick
}: VirtualizedTableProps<T>) {
  const containerStyle = useMemo(() => ({
    height: `${height}px`,
    width: '100%'
  }), [height]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = data[index];
    if (!row) return null;

    return (
      <div
        style={style}
        className={`flex border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer ${
          onRowClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onRowClick?.(row, index)}
      >
        {columns.map((column, colIndex) => {
          const value = column.key === 'index' ? index + 1 :
                       column.key in row ? row[column.key] : '';

          let displayValue = value;
          if (column.render) {
            displayValue = column.render(value, row, index);
          }

          const cellClass = column.className || '';
          const isFirst = colIndex === 0;
          const isLast = colIndex === columns.length - 1;

          return (
            <div
              key={column.key}
              className={`px-1 py-0.5 text-[7px] font-mono text-gray-300 truncate ${cellClass} ${
                isFirst ? 'pl-2' : ''
              } ${isLast ? 'pr-2' : ''}`}
              style={{
                flex: column.key === 'index' ? '0 0 40px' :
                      column.key === 'address' ? '0 0 120px' :
                      column.key === 'volume24hUSD' || column.key === 'liquidityUSD' ? '0 0 100px' :
                      '1'
              }}
              title={typeof value === 'string' ? value : String(value)}
            >
              {displayValue}
            </div>
          );
        })}
      </div>
    );
  };

  const Header = () => (
    <div className="flex border-b-2 border-gray-700 bg-gray-900 sticky top-0 z-10">
      {columns.map((column, index) => {
        const isFirst = index === 0;
        const isLast = index === columns.length - 1;

        return (
          <div
            key={column.key}
            className={`px-1 py-1 text-[6px] font-mono text-gray-400 uppercase font-bold ${column.className || ''} ${
              isFirst ? 'pl-2' : ''
            } ${isLast ? 'pr-2' : ''}`}
            style={{
              flex: column.key === 'index' ? '0 0 40px' :
                    column.key === 'address' ? '0 0 120px' :
                    column.key === 'volume24hUSD' || column.key === 'liquidityUSD' ? '0 0 100px' :
                    '1'
            }}
          >
            {column.header}
          </div>
        );
      })}
    </div>
  );

  if (data.length === 0) {
    return (
      <div className={`bg-gray-900 border border-gray-800 rounded ${className}`}>
        <Header />
        <div className="flex items-center justify-center py-8 text-[8px] font-mono text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded overflow-hidden ${className}`}>
      <Header />
      <FixedSizeList
        height={height - 28} // Subtract header height
        itemCount={data.length}
        itemSize={itemHeight}
        style={containerStyle}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
