'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Table from '../components/Table';

interface ArbitrageOpportunity {
  id: string;
  tokenIn: string;
  tokenOut: string;
  profitPercent: number;
  routeIn: string;
  routeOut: string;
  dexPath: string;
  estimatedGas: number;
  expiresAt: number;
  detectedAt: string;
  blockNumber: number;
}

interface ArbitrageFilters {
  minProfit: number;
  maxOpportunities: number;
}

const ARBITRAGE_CHANNEL = '/arbitrage/live';

export default function ArbitragePage() {
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const [filters, setFilters] = useState<ArbitrageFilters>({
    minProfit: 0.000, // 0%
    maxOpportunities: 10
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
        ws.send(JSON.stringify({
            "type": "SUBSCRIBE",
            "channel": "/arbitrage/live",
            "filters": {
              "minProfit": 0.000,
              "maxOpportunities": 10
            }
          }));
      

        // Auto-subscribe if we were previously subscribed
        if (isSubscribed) {
          subscribeToChannel();
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'ARBITRAGE_OPPORTUNITY') {
            setOpportunities(prev => [message.data, ...prev.slice(0, 49)]); // Keep last 50
          } else if (message.type === 'SUBSCRIBE_CONFIRMED') {
            setIsSubscribed(true);
            console.log('Subscribed to arbitrage channel');
          } else if (message.type === 'UNSUBSCRIBE_CONFIRMED') {
            setIsSubscribed(false);
            console.log('Unsubscribed from arbitrage channel');
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
        channel: ARBITRAGE_CHANNEL,
        filters: {
          minProfit: filters.minProfit,
          maxOpportunities: filters.maxOpportunities
        }
      };
      wsRef.current.send(JSON.stringify(subscribeMessage));
    }
  };

  const unsubscribeFromChannel = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        channel: ARBITRAGE_CHANNEL
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

  // Limit opportunities when maxOpportunities changes
  useEffect(() => {
    setOpportunities(prev => prev.slice(0, filters.maxOpportunities));
  }, [filters.maxOpportunities]);

  const short = (addr?: string) => addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-';

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (v: string) => (
        <span className="font-mono text-gray-400 text-xs" title={v}>
          {v.split('_').pop()?.slice(0, 8) || '-'}
        </span>
      )
    },
    {
      key: 'tokenIn',
      header: 'Token In',
      render: (v: string) => (
        <span className="font-mono text-blue-400 text-xs" title={v}>
          {short(v)}
        </span>
      )
    },
    {
      key: 'tokenOut',
      header: 'Token Out',
      render: (v: string) => (
        <span className="font-mono text-red-400 text-xs" title={v}>
          {short(v)}
        </span>
      )
    },
    {
      key: 'profitPercent',
      header: 'Profit %',
      render: (v: number) => (
        <span className={`font-bold text-xs ${
          v >= 2 ? 'text-green-400' :
          v >= 1 ? 'text-yellow-400' :
          'text-orange-400'
        }`}>
          {v.toFixed(3)}%
        </span>
      )
    },
    {
      key: 'dexPath',
      header: 'DEX Path',
      render: (v: string) => (
        <span className="font-mono text-purple-400 text-xs">
          {v}
        </span>
      )
    },
    {
      key: 'estimatedGas',
      header: 'Est. Gas',
      render: (v: number) => (
        <span className="font-mono text-gray-400 text-xs">
          {v.toLocaleString()}
        </span>
      )
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (v: number) => {
        const expires = new Date(v);
        const now = new Date();
        const diffMs = expires.getTime() - now.getTime();
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 0) return <span className="text-red-400 text-xs">EXPIRED</span>;
        if (diffSec < 60) return <span className="text-yellow-400 text-xs">{diffSec}s</span>;
        return <span className="text-green-400 text-xs">{Math.floor(diffSec / 60)}m</span>;
      }
    },
    {
      key: 'detectedAt',
      header: 'Detected',
      render: (v: string) => (
        <span className="font-mono text-gray-400 text-xs">
          {new Date(v).toLocaleTimeString()}
        </span>
      )
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
                    <span className="text-yellow-400 text-[8px]">📡</span>
                    <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">ARBITRAGE OPPORTUNITIES</h2>
                    <div className="px-1 py-0.5 bg-yellow-900 text-yellow-300 text-[7px] font-mono border border-yellow-700">
                      {opportunities.length} OPPORTUNITIES
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
                        <label className="text-gray-400 block mb-1">Min Profit %</label>
                        <input
                          type="number"
                          step="0.001"
                          value={filters.minProfit}
                          onChange={(e) => setFilters(prev => ({ ...prev, minProfit: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Max Opportunities</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={filters.maxOpportunities}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxOpportunities: parseInt(e.target.value) || 10 }))}
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
                  data={opportunities}
                  columns={columns}
                  emptyMessage={isSubscribed ? "[WAITING FOR ARBITRAGE OPPORTUNITIES...]" : "[SUBSCRIBE TO START MONITORING]"}
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
