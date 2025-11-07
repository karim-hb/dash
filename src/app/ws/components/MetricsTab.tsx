'use client';

import { useMemo, useState } from 'react';

import { SnapshotMetrics, SnapshotPayload, WsEventLogEntry } from '../types';

interface MetricsTabProps {
  metrics: SnapshotMetrics | null;
  snapshot: SnapshotPayload | null;
  events: WsEventLogEntry[];
}

export default function MetricsTab({ metrics, snapshot, events }: MetricsTabProps) {
  const [showRaw, setShowRaw] = useState(false);

  const decoderEntries = useMemo(() => {
    return Object.entries(metrics?.decodedCounts ?? {}).sort(([, a], [, b]) => (b ?? 0) - (a ?? 0));
  }, [metrics]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      <div className="xl:col-span-1 space-y-4">
        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117]">
          <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E] mb-3">Decoder Counts</h4>
          {decoderEntries.length === 0 ? (
            <div className="text-sm text-[#8B949E]">No decoder metrics yet.</div>
          ) : (
            <div className="space-y-2">
              {decoderEntries.map(([label, value]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#C9D1D9]">{label}</span>
                      <span className="text-[#8B949E]">{value}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#1F2937] rounded overflow-hidden mt-1">
                      <div className="h-full bg-linear-to-r from-emerald-500 to-cyan-500" style={{ width: `${Math.min(100, (Number(value) / (decoderEntries[0]?.[1] || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 rounded border border-[#21262D] bg-[#0D1117]">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E]">Raw Snapshot</h4>
            <button
              onClick={() => setShowRaw((prev) => !prev)}
              className="text-xs text-sky-300 hover:text-sky-200"
            >
              {showRaw ? 'Hide' : 'Show'}
            </button>
          </div>
          {showRaw && (
            <pre className="mt-3 max-h-64 overflow-y-auto text-[10px] leading-5 text-[#C9D1D9] bg-[#111B29] p-3 rounded border border-[#1F2A3A]">
{JSON.stringify(snapshot, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="xl:col-span-2 p-4 rounded border border-[#21262D] bg-[#0D1117]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs uppercase tracking-[0.35em] text-[#8B949E]">Event Stream</h4>
          <span className="text-xs text-[#8B949E]">{events.length} events</span>
        </div>
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-3 custom-scroll">
          {events.map((event) => (
            <div key={event.id} className="p-3 rounded border border-[#1F2A3A] bg-[#111C2B]">
              <div className="flex items-center justify-between text-xs text-[#8B949E]">
                <span className="uppercase tracking-[0.3em]">{event.type}</span>
                <span>{new Date(event.timestamp).toLocaleTimeString(undefined, { hour12: false })}</span>
              </div>
              <div className="mt-2 text-sm text-[#C9D1D9]">{event.summary}</div>
            </div>
          ))}
          {events.length === 0 && <div className="text-sm text-[#8B949E]">Waiting for events…</div>}
        </div>
      </div>
    </div>
  );
}

