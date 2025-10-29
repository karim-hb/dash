'use client';

import { ReactNode, useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (value: any, row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T, index: number) => void;
  className?: string;
  variant?: 'default' | 'terminal';
  density?: 'compact' | 'normal';
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "[NO DATA AVAILABLE]",
  onRowClick,
  className = "",
  variant = 'terminal',
  density = 'compact'
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isCompact = density === 'compact';
  const headerPad = isCompact ? 'px-1 py-1' : 'px-2 py-1.5';
  const cellPad = isCompact ? 'px-1 py-0.5' : 'px-2 py-1';
  const rowText = isCompact ? 'text-[9px]' : 'text-[10px]';
  const headText = isCompact ? 'text-[8px]' : 'text-[9px]';

  const handleSort = (columnKey: string) => {
    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;

    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
    if (bValue == null) return sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  if (loading) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-slate-400 font-mono text-sm">[LOADING...]</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="overflow-x-auto">
        <table className={`min-w-full ${rowText} border-collapse`}>
          <thead className="bg-gray-900 border-b border-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key) + index}
                  className={`text-left font-mono ${headText} text-gray-400 uppercase tracking-widest ${headerPad} border-r border-gray-800 last:border-r-0 ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-800 select-none' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-1">
                    <span>{column.header}</span>
                    {column.sortable && sortColumn === column.key && (
                      <span className={`${sortDirection === 'desc' ? 'text-red-400' : 'text-green-400'} text-[7px]`}>
                        {sortDirection === 'desc' ? '▼' : '▲'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={`px-4 py-6 text-center text-gray-600 font-mono ${rowText} bg-black`}>
                  <div>{emptyMessage}</div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`font-mono ${rowText} border-b border-gray-900 hover:bg-gray-900 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {columns.map((column, colIndex) => {
                    const value = row[column.key as keyof T];
                    const renderedValue = column.render
                      ? column.render(value, row, index)
                      : value;

                    return (
                      <td
                        key={String(column.key) + colIndex}
                        className={`${cellPad} ${column.className || ''}`}
                      >
                        {renderedValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {sortedData.length > 0 && (
        <div className={`border-t border-gray-800 px-2 py-1 bg-gray-900`}>
          <div className={`flex items-center justify-between text-gray-400 font-mono ${rowText}`}>
            <div className="flex items-center gap-3">
              <span className="text-gray-500">{sortedData.length} entries</span>
              {sortColumn && (
                <span className="text-green-400">
                  sorted by {columns.find(col => col.key === sortColumn)?.header}
                  <button
                    onClick={() => setSortColumn(null)}
                    className="ml-1 text-gray-600 hover:text-gray-400 text-[8px]"
                  >
                    [clear]
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
