'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Table from '../components/Table';

interface PriceUpdate {
  pair: string;
  price: number;
  previousPrice: number;
  change: number;
  changeDirection: 'up' | 'down';
  timestamp: number;
  lastUpdate: number;
}

interface PriceFilters {
  pairs?: string[];
  minChange?: number;
}

const PRICES_CHANNEL = '/prices/live';

export default function PricesPage() {
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const [filters, setFilters] = useState<PriceFilters>({
    pairs: [],
    minChange: 0.1
  });

  const [showFilters, setShowFilters] = useState(false);

  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      setError('');
      const ws = new WebSocket('ws://127.0.0.1:8081');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        reconnectAttempts.current = 0;

        // Start heartbeat
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'PING' }));
          }
        }, 30000);

        // Auto-subscribe if we were previously subscribed
        if (isSubscribed) {
          subscribeToChannel();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'PRICE_UPDATE') {
            setPriceUpdates(prev => [message.data, ...prev.slice(0, 99)]); // Keep last 100
          } else if (message.type === 'SUBSCRIBE_CONFIRMED') {
            setIsSubscribed(true);
            console.log('Subscribed to prices channel');
          } else if (message.type === 'UNSUBSCRIBE_CONFIRMED') {
            setIsSubscribed(false);
            console.log('Unsubscribed from prices channel');
          } else if (message.type === 'PONG') {
            // Heartbeat response
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setIsSubscribed(false);

        // Clear heartbeat
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        // Auto-reconnect with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            console.log(`Reconnecting... attempt ${reconnectAttempts.current}`);
            connectWebSocket();
          }, delay);
        } else {
          setError('Failed to reconnect after multiple attempts');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

    } catch (err) {
      setError('Failed to connect to WebSocket');
      console.error('WebSocket connection error:', err);
    }
  }, [isSubscribed]);

  const subscribeToChannel = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'SUBSCRIBE',
        channel: PRICES_CHANNEL,
        filters: {
          ...(filters.pairs && filters.pairs.length > 0 && { pairs: filters.pairs }),
          ...(filters.minChange && { minChange: filters.minChange })
        }
      };
      wsRef.current.send(JSON.stringify(subscribeMessage));
    }
  };

  const unsubscribeFromChannel = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        channel: PRICES_CHANNEL
      }));
    }
    setIsSubscribed(false);
  };

  const handleSubscribe = () => {
    if (!isConnected) {
      connectWebSocket();
    } else {
      subscribeToChannel();
    }
  };

  const handleUnsubscribe = () => {
    unsubscribeFromChannel();
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Update subscription when filters change
  useEffect(() => {
    if (isSubscribed) {
      unsubscribeFromChannel();
      setTimeout(() => {
        if (isConnected) {
          subscribeToChannel();
        }
      }, 100);
    }
  }, [filters]);

  const columns = [
    {
      key: 'pair',
      header: 'Trading Pair',
      render: (v: string) => (
        <span className="font-mono text-blue-400 text-xs font-bold">
          {v}
        </span>
      )
    },
    {
      key: 'price',
      header: 'Current Price',
      render: (v: number) => (
        <span className="font-mono text-white text-xs font-bold">
          ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'change',
      header: 'Change %',
      render: (v: number, row: PriceUpdate) => (
        <span className={`font-bold text-xs ${
          row.changeDirection === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {row.changeDirection === 'up' ? '+' : ''}{v.toFixed(2)}%
        </span>
      )
    },
    {
      key: 'previousPrice',
      header: 'Previous Price',
      render: (v: number) => (
        <span className="font-mono text-gray-400 text-xs">
          ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      )
    },
    {
      key: 'changeDirection',
      header: 'Direction',
      render: (v: string) => (
        <span className={`font-bold text-xs px-1 py-0.5 rounded ${
          v === 'up' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
        }`}>
          {v.toUpperCase()}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Updated',
      render: (v: number) => (
        <span className="font-mono text-gray-400 text-xs">
          {new Date(v).toLocaleTimeString()}
        </span>
      )
    },
    {
      key: 'lastUpdate',
      header: 'Last Update',
      render: (v: number) => {
        const now = Date.now();
        const diff = now - v;
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return <span className="text-green-400 text-xs">{seconds}s ago</span>;
        const minutes = Math.floor(seconds / 60);
        return <span className="text-yellow-400 text-xs">{minutes}m ago</span>;
      }
    }
  ];

  return (
    <div className="min-h-screen">
      <div className="max-w-full px-4 py-3">
        <div className="bg-[#0D1117] border border-[#21262D] shadow-xl">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <div className="h-full">
              {/* Header */}
              <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-green-400 text-[8px]">💰</span>
                    <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">PRICE UPDATES</h2>
                    <div className="px-1 py-0.5 bg-green-900 text-green-300 text-[7px] font-mono border border-green-700">
                      {priceUpdates.length} UPDATES
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="font-mono text-[7px] text-gray-400">
                      {isConnected ? (isSubscribed ? 'SUBSCRIBED' : 'CONNECTED') : 'DISCONNECTED'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="px-1.5 py-2 bg-black border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubscribe}
                    disabled={isSubscribed}
                    className={`px-3 py-1 text-[7px] font-mono border ${
                      isSubscribed
                        ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                        : 'bg-green-900 text-green-300 border-green-700 hover:bg-green-800'
                    }`}
                  >
                    SUBSCRIBE
                  </button>
                  <button
                    onClick={handleUnsubscribe}
                    disabled={!isSubscribed}
                    className={`px-3 py-1 text-[7px] font-mono border ${
                      !isSubscribed
                        ? 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                        : 'bg-red-900 text-red-300 border-red-700 hover:bg-red-800'
                    }`}
                  >
                    UNSUBSCRIBE
                  </button>
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-3 py-1 text-[7px] font-mono border bg-blue-900 text-blue-300 border-blue-700 hover:bg-blue-800"
                  >
                    FILTERS {showFilters ? '▼' : '▶'}
                  </button>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-2 p-2 bg-gray-900 border border-gray-700 rounded">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[7px]">
                      <div>
                        <label className="text-gray-400 block mb-1">Trading Pairs (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="WETH/USDC, WBTC/USDC"
                          value={filters.pairs?.join(', ') || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            pairs: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : undefined
                          }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Min Change %</label>
                        <input
                          type="number"
                          step="0.01"
                          value={filters.minChange || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minChange: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded">
                    <div className="text-red-400 font-mono text-[7px]">{error}</div>
                  </div>
                )}
              </div>

              {/* Data Table */}
              <div className="p-1.5">
                <Table
                  data={priceUpdates}
                  columns={columns}
                  emptyMessage={isSubscribed ? "[WAITING FOR PRICE UPDATES...]" : "[SUBSCRIBE TO START MONITORING]"}
                  density="compact"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
