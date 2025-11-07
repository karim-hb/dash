'use client';

import { useEffect, useState } from 'react';

interface StatusDetail {
  connected: boolean;
  reconnecting: boolean;
  lastUpdated: number | null;
  lastEventType: string | null;
}

interface ConnectionIndicatorProps {
  connectedLabel?: string;
  reconnectingLabel?: string;
  disconnectedLabel?: string;
  showTimestamp?: boolean;
  className?: string;
}

export default function ConnectionIndicator({
  connectedLabel = 'WS CONNECTED',
  reconnectingLabel = 'WS RECONNECTING',
  disconnectedLabel = 'WS OFFLINE',
  showTimestamp = false,
  className = '',
}: ConnectionIndicatorProps) {
  const [status, setStatus] = useState<StatusDetail>({
    connected: false,
    reconnecting: false,
    lastUpdated: null,
    lastEventType: null,
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<StatusDetail>).detail;
      if (detail) {
        setStatus(detail);
      }
    };

    window.addEventListener('ws-dashboard-status', handler as EventListener);
    return () => {
      window.removeEventListener('ws-dashboard-status', handler as EventListener);
    };
  }, []);

  const badge = computeBadge(status, { connectedLabel, reconnectingLabel, disconnectedLabel });

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wide px-2 py-1 rounded ${badge.classes}`}>
        <span className={`w-2.5 h-2.5 rounded-full ${badge.dot}`} />
        {badge.label}
      </span>
      {showTimestamp && status.lastUpdated && (
        <span className="text-[10px] text-[#8B949E] font-mono">
          {new Date(status.lastUpdated).toLocaleTimeString(undefined, { hour12: false })}
        </span>
      )}
    </div>
  );
}

function computeBadge(
  status: StatusDetail,
  labels: { connectedLabel: string; reconnectingLabel: string; disconnectedLabel: string }
) {
  if (status.connected) {
    return {
      label: labels.connectedLabel,
      classes: 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.35)]',
      dot: 'bg-[#00FF66] shadow-[0_0_6px_rgba(0,255,102,0.6)]',
    };
  }
  if (status.reconnecting) {
    return {
      label: labels.reconnectingLabel,
      classes: 'bg-amber-500/10 border border-amber-500/30 text-amber-200 shadow-[0_0_6px_rgba(245,158,11,0.35)]',
      dot: 'bg-[#F59E0B] shadow-[0_0_6px_rgba(245,158,11,0.6)] animate-pulse',
    };
  }
  return {
    label: labels.disconnectedLabel,
    classes: 'bg-rose-500/10 border border-rose-500/30 text-rose-200',
    dot: 'bg-[#F87171] shadow-[0_0_4px_rgba(248,113,113,0.6)]',
  };
}

