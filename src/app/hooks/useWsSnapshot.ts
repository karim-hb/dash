'use client';

import { useEffect, useSyncExternalStore } from 'react';
import type { UiSnapshot } from '@/lib/types';

type SnapshotState = {
  snapshot: UiSnapshot | null;
  connected: boolean;
};

let state: SnapshotState = { snapshot: null, connected: false };
const listeners = new Set<() => void>();
let started = false;
let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

function emit(partial: Partial<SnapshotState>) {
  state = { ...state, ...partial };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshotState(): SnapshotState {
  return state;
}

function scheduleReconnect() {
  if (typeof window === 'undefined') return;
  if (reconnectTimer !== null) return;
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, 2000);
}

function handleMessage(evt: MessageEvent<string>) {
  try {
    const data = JSON.parse(evt.data);
    if (data && typeof data === 'object' && (data.summary || data.tokens || data.pools || data.oracles)) {
      emit({ snapshot: data as UiSnapshot });
    }
  } catch (err) {
    console.warn('Failed to parse WS snapshot payload', err);
  }
}

function connect() {
  if (typeof window === 'undefined') return;
  if (ws) {
    try { ws.close(); } catch {}
  }
  const url = (process.env.NEXT_PUBLIC_UI_WS_URL as string) || 'ws://localhost:3006';
  try {
    ws = new WebSocket(url);
  } catch (err) {
    console.error('Failed to create WebSocket connection', err);
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    emit({ connected: true });
  };
  ws.onclose = () => {
    emit({ connected: false });
    scheduleReconnect();
  };
  ws.onerror = () => {
    emit({ connected: false });
  };
  ws.onmessage = handleMessage;
}

function ensureStarted() {
  if (started) return;
  started = true;
  if (typeof window !== 'undefined') {
    connect();
    window.addEventListener('beforeunload', () => {
      try { ws?.close(); } catch {}
    });
  }
}

export function useWsSnapshot() {
  useEffect(() => {
    ensureStarted();
  }, []);

  const store = useSyncExternalStore(subscribe, getSnapshotState, getSnapshotState);
  return store;
}


