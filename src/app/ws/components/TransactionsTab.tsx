'use client';

import Link from 'next/link';

import Table from '../../components/Table';
import { TransactionEntry } from '../types';

interface TransactionsTabProps {
  transactions: TransactionEntry[];
  title?: string;
  emptyMessage?: string;
}

export default function TransactionsTab({ transactions, title = 'Live Transactions', emptyMessage }: TransactionsTabProps) {
  const columns = [
    {
      key: 'hash',
      header: 'Tx Hash',
      render: (value: string) => (
        <Link
          href={`https://etherscan.io/tx/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300"
        >
          {value.slice(0, 8)}…{value.slice(-6)}
        </Link>
      ),
      className: 'font-mono text-[10px] text-emerald-400',
    },
    {
      key: 'from',
      header: 'From',
      render: (value: string) => <span className="text-[#8B949E]">{value.slice(0, 8)}…{value.slice(-4)}</span>,
      className: 'font-mono text-[10px]',
    },
    {
      key: 'to',
      header: 'To',
      render: (value: string | null) => (value ? <span className="text-[#8B949E]">{value.slice(0, 8)}…{value.slice(-4)}</span> : <span className="text-amber-300">Contract Creation</span>),
      className: 'font-mono text-[10px]',
    },
    {
      key: 'valueUsd',
      header: 'Value',
      render: (_: string, row: TransactionEntry) => (
        <div className="flex flex-col text-right">
          <span className="text-[#C9D1D9] font-semibold">{row.valueUsd !== 'N/A' ? row.valueUsd : row.valueEth}</span>
          <span className="text-[10px] text-[#8B949E]">{row.valueSource.toUpperCase()}</span>
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'gasEth',
      header: 'Gas',
      render: (_: string, row: TransactionEntry) => (
        <div className="flex flex-col text-right">
          <span className="text-[#C9D1D9] font-semibold">{row.gasEth}</span>
          <span className="text-[10px] text-[#8B949E]">{row.gasUsd}</span>
        </div>
      ),
      className: 'text-right',
    },
    {
      key: 'functionName',
      header: 'Function',
      render: (value: string | null) => (
        <span className="inline-flex items-center gap-1 text-[#8B949E]">
          <span className="text-[12px]">⚙️</span>
          {value ?? '—'}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Seen',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleTimeString(undefined, { hour12: false }),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-[0.3em] text-[#8B949E] uppercase">{title}</h3>
        <span className="text-xs text-[#8B949E]">{transactions.length} entries</span>
      </div>
      <Table
        data={transactions}
        columns={columns}
        emptyMessage={emptyMessage ?? '[No recent transactions captured]'}
        density="compact"
      />
    </div>
  );
}

