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
}

export default function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = "[NO DATA AVAILABLE]",
  onRowClick,
  className = "",
  variant = 'terminal'
}: TableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
      <div className={`bloomberg-card p-8 ${className}`}>
        <div className="flex items-center justify-center">
          <div className="text-slate-400 font-mono text-sm">[LOADING...]</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`terminal-table ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-950/90 border-b-2 border-slate-700/70">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key) + index}
                  className={`text-left font-mono text-xs font-bold text-slate-200 uppercase tracking-wider border-r border-slate-700/50 last:border-r-0 ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-900/60 select-none' : ''
                  } ${column.className || ''}`}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center justify-center gap-2 px-6 py-4 min-h-[3rem]">
                    <div className="text-center">
                      <div className="text-cyan-300 font-semibold mb-1">{column.header}</div>
                      {column.sortable && sortColumn === column.key && (
                        <span className={`terminal-table-sort-indicator ${sortDirection === 'desc' ? 'text-red-400' : 'text-green-400'}`}>
                          {sortDirection === 'desc' ? '▾' : '▴'}
                        </span>
                      )}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center text-slate-400 font-mono text-sm bg-slate-950/30 border-t border-slate-700/50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-slate-500 text-lg">—</div>
                    <div>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr
                  key={index}
                  className={`font-mono text-sm border-b border-slate-700/50 ${
                    index % 2 === 0
                      ? 'bg-slate-900/40 hover:bg-slate-800/60'
                      : 'bg-slate-950/60 hover:bg-slate-900/80'
                  } ${onRowClick ? 'cursor-pointer' : ''}`}
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
                        className={column.className || ''}
                      >
                        <div className="table-data-point">
                          {renderedValue}
                        </div>
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
        <div className="px-8 py-5 bg-slate-950/95 border-t-2 border-slate-700/80 bloomberg-table-accent">
          <div className="flex items-center justify-between text-sm text-slate-200 font-mono">
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-slate-800/80 rounded border border-slate-600/60 text-center min-w-[120px]">
                <div className="text-cyan-300 font-semibold">{sortedData.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">
                  {sortedData.length === 1 ? 'Entry' : 'Entries'}
                </div>
              </div>
            </div>
            {sortColumn && (
              <div className="flex items-center gap-4">
                <div className="px-4 py-2 bg-slate-800/80 rounded border border-slate-600/60">
                  <div className="text-slate-300 text-xs uppercase tracking-wider">Sorted By</div>
                  <div className="text-cyan-300 font-semibold">{columns.find(col => col.key === sortColumn)?.header}</div>
                </div>
                <button
                  onClick={() => setSortColumn(null)}
                  className="px-4 py-2 bg-slate-700/90 hover:bg-slate-600/90 border border-slate-600/60 rounded text-slate-200 hover:text-white font-mono uppercase tracking-wider text-xs"
                >
                  Clear Sort
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
