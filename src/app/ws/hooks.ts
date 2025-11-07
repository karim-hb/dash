'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import {
  GasPredictionState,
  PoolPayload,
  PricePayload,
  SnapshotPayload,
  TransactionConfirmedPayload,
  TransactionEntry,
  TrackedTx,
  WebSocketDashboardState,
  WebSocketEnvelope,
  WsEventLogEntry,
} from './types';

const WS_ENDPOINT = 'ws://localhost:4050/ws';
const MAX_TRANSACTIONS = 120;
const MAX_TRACKED = 180;
const MAX_EVENTS = 120;

const initialState: WebSocketDashboardState = {
  connected: false,
  reconnecting: false,
  snapshot: null,
  transactions: [],
  tracked: [],
  predictions: null,
  accuracy: null,
  metrics: null,
  price: null,
  pool: null,
  events: [],
  lastEventType: null,
  lastUpdated: null,
};

function buildEvent(type: string, summary: string): WsEventLogEntry {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    timestamp: Date.now(),
    summary,
  };
}

function summariseTransaction(tx: TransactionEntry): string {
  const value = tx.valueUsd && tx.valueUsd !== 'N/A' ? tx.valueUsd : tx.valueEth;
  return `${tx.hash.slice(0, 10)} · ${value}`;
}

function summariseTracked(tx: TrackedTx): string {
  const status = tx.poolStatus ?? 'unknown';
  return `${tx.hash.slice(0, 10)} · ${status.toUpperCase()}`;
}

export function useWebSocketDashboard() {
  const [state, setState] = useState(initialState);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const updateEvents = (entry: WsEventLogEntry) => {
    setState((prev) => ({
      ...prev,
      events: [entry, ...prev.events].slice(0, MAX_EVENTS),
      lastEventType: entry.type,
      lastUpdated: entry.timestamp,
    }));
  };

  const applySnapshot = (payload: SnapshotPayload) => {
    setState((prev) => ({
      ...prev,
      snapshot: payload,
      transactions: payload.transactions?.slice(0, MAX_TRANSACTIONS) ?? [],
      tracked: payload.tracked?.slice(0, MAX_TRACKED) ?? [],
      predictions: payload.predictions ?? null,
      accuracy: payload.accuracy ?? null,
      metrics: payload.metrics ?? null,
      price: payload.ethPrice ?? prev.price,
    }));
  };

  const applyTransaction = (payload: TransactionEntry) => {
    setState((prev) => {
      const existingIndex = prev.transactions.findIndex((item) => item.hash === payload.hash);
      let nextTransactions: TransactionEntry[];
      if (existingIndex >= 0) {
        nextTransactions = [...prev.transactions];
        nextTransactions[existingIndex] = payload;
      } else {
        nextTransactions = [payload, ...prev.transactions].slice(0, MAX_TRANSACTIONS);
      }
      return {
        ...prev,
        transactions: nextTransactions,
      };
    });
  };

  const applyTracked = (payload: TrackedTx) => {
    setState((prev) => {
      const existingIndex = prev.tracked.findIndex((item) => item.hash === payload.hash);
      let nextTracked: TrackedTx[];
      if (existingIndex >= 0) {
        nextTracked = [...prev.tracked];
        nextTracked[existingIndex] = { ...nextTracked[existingIndex], ...payload };
      } else {
        nextTracked = [payload, ...prev.tracked].slice(0, MAX_TRACKED);
      }
      return {
        ...prev,
        tracked: nextTracked,
      };
    });
  };

  const applyPredictions = (payload: GasPredictionState) => {
    setState((prev) => ({
      ...prev,
      predictions: payload,
    }));
  };

  const applyPrice = (payload: PricePayload) => {
    setState((prev) => ({
      ...prev,
      price: payload.price,
    }));
  };

  const applyPool = (payload: PoolPayload) => {
    setState((prev) => ({
      ...prev,
      pool: payload,
    }));
  };

  const handleEnvelope = (envelope: WebSocketEnvelope) => {
    switch (envelope.type) {
      case 'snapshot':
        applySnapshot(envelope.payload);
        updateEvents(buildEvent('snapshot', `Snapshot received · ${envelope.payload.transactions?.length ?? 0} transactions`));
        break;
      case 'transaction':
        applyTransaction(envelope.payload);
        updateEvents(buildEvent('transaction', summariseTransaction(envelope.payload)));
        break;
      case 'transactionConfirmed':
        if (envelope.payload.tracked) {
          applyTracked(envelope.payload.tracked);
        }
        updateEvents(buildEvent('transactionConfirmed', envelope.payload.hash));
        break;
      case 'predictions':
        applyPredictions(envelope.payload);
        updateEvents(buildEvent('predictions', `Predictions updated · block ${envelope.payload.lastUpdateBlock ?? '—'}`));
        break;
      case 'price':
        applyPrice(envelope.payload);
        updateEvents(buildEvent('price', `ETH ${envelope.payload.price.toLocaleString()}`));
        break;
      case 'pool':
        applyPool(envelope.payload);
        updateEvents(buildEvent('pool', `Pending ${envelope.payload.pending}`));
        break;
      default:
        updateEvents(buildEvent('message', 'Unknown envelope type'));
    }
  };

  const connect = () => {
    if (typeof window === 'undefined') return;
    const ws = new WebSocket(WS_ENDPOINT);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      setState((prev) => ({ ...prev, connected: true, reconnecting: false }));
      updateEvents(buildEvent('status', 'Connected to WebSocket'));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketEnvelope;
        handleEnvelope(data);
      } catch (error) {
        updateEvents(buildEvent('error', 'Failed to parse message payload'));
      }
    };

    ws.onerror = () => {
      updateEvents(buildEvent('error', 'WebSocket error'));
    };

    ws.onclose = () => {
      setState((prev) => ({ ...prev, connected: false }));
      if (!reconnectTimeoutRef.current) {
        scheduleReconnect();
      }
      updateEvents(buildEvent('status', 'Disconnected from WebSocket'));
    };
  };

  const scheduleReconnect = () => {
    if (typeof window === 'undefined') return;
    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * 2 ** (reconnectAttemptsRef.current - 1), 30000);
    setState((prev) => ({ ...prev, reconnecting: true }));
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectTimeoutRef.current = null;
      connect();
    }, delay);
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const detail = {
      connected: state.connected,
      reconnecting: state.reconnecting,
      lastUpdated: state.lastUpdated,
      lastEventType: state.lastEventType,
    };
    window.dispatchEvent(new CustomEvent('ws-dashboard-status', { detail }));
  }, [state.connected, state.reconnecting, state.lastUpdated, state.lastEventType]);

  const overviewMetrics = useMemo(() => {
    const predictions = state.predictions?.gasPredictions ?? [];
    const baseFeeSeries = predictions.map((row) => row.baseFeeGwei);
    const confidenceSeries = predictions.map((row) => Math.round(row.confidence * 100));
    return {
      baseFeeSeries,
      confidenceSeries,
    };
  }, [state.predictions]);

  return {
    state,
    overviewMetrics,
  };
}

