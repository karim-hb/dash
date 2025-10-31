'use client';

import { useEffect, useRef, useState } from 'react';
import type { UiSnapshot } from '@/lib/types';

export function useWsSnapshot() {
  const [snapshot, setSnapshot] = useState<UiSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function connect() {
      try {
        const url = (process.env.NEXT_PUBLIC_UI_WS_URL as string) || 'ws://localhost:3006';
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => {
          setConnected(false);
          setTimeout(connect, 2000);
        };
        ws.onerror = () => setConnected(false);
        ws.onmessage = (evt) => {
          try {
            const data = JSON.parse(evt.data);
            if (data && typeof data === 'object' && (data.summary || data.tokens || data.pools || data.oracles)) {
    
              setSnapshot(data as UiSnapshot);
            }
          } catch {
            // ignore
          }
        };
      } catch {
        setTimeout(connect, 2000);
      }
    }

    connect();
    return () => {
      try { wsRef.current?.close(); } catch {}
      wsRef.current = null;
    };
  }, []);

  return { snapshot, connected };
}


