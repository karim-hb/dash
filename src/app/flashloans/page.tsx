'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Table from '../components/Table';

interface FlashLoanOpportunity {
  protocol: string;
  asset: string;
  amount: string;
  fee: string;
  feePercent: number;
  premium: number;
  availableLiquidity: string;
  utilizationRate: number;
  timestamp: number;
  blockNumber: number;
  estimatedProfit: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface FlashLoanFilters {
  protocols?: string[];
  minSize?: string;
  maxFee?: number;
  assets?: string[];
}

const FLASHLOANS_CHANNEL = '/flashloans/live';

export default function FlashLoansPage() {
  const [flashLoans, setFlashLoans] = useState<FlashLoanOpportunity[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const [filters, setFilters] = useState<FlashLoanFilters>({
    protocols: [],
    minSize: "1000000000000000000", // 1 ETH in wei
    maxFee: 0.001, // 0.1%
    assets: []
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
          "channel": "/flashloans/live",
          "filters": {
            "protocols": ["aave", "uniswap-v3"],   // Flash loan providers (optional)
            "minSize": "1000000000000000000",     // Minimum size in wei (optional)
            "maxFee": 0.001,                      // Maximum fee rate (optional)
            "assets": ["WETH", "USDC"]             // Specific assets (optional)
          }
        }));
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

          if (message.type === 'FLASH_LOAN_OPPORTUNITY') {
            setFlashLoans(prev => [message.data, ...prev.slice(0, 49)]); // Keep last 50
          } else if (message.type === 'SUBSCRIBE_CONFIRMED') {
            setIsSubscribed(true);
            console.log('Subscribed to flash loans channel');
          } else if (message.type === 'UNSUBSCRIBE_CONFIRMED') {
            setIsSubscribed(false);
            console.log('Unsubscribed from flash loans channel');
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
        channel: FLASHLOANS_CHANNEL,
        filters: {
          ...(filters.protocols && filters.protocols.length > 0 && { protocols: filters.protocols }),
          ...(filters.minSize && { minSize: filters.minSize }),
          ...(filters.maxFee && { maxFee: filters.maxFee }),
          ...(filters.assets && filters.assets.length > 0 && { assets: filters.assets })
        }
      };
      wsRef.current.send(JSON.stringify(subscribeMessage));
    }
  };

  const unsubscribeFromChannel = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'UNSUBSCRIBE',
        channel: FLASHLOANS_CHANNEL
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

  const short = (addr?: string) => addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-';

  const formatETH = (wei: string) => {
    const eth = parseFloat(wei) / 1e18;
    return eth.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const columns = [
    {
      key: 'protocol',
      header: 'Protocol',
      render: (v: string) => (
        <span className="font-mono text-blue-400 text-xs font-bold">
          {v.toUpperCase()}
        </span>
      )
    },
    {
      key: 'asset',
      header: 'Asset',
      render: (v: string) => (
        <span className="font-mono text-green-400 text-xs" title={v}>
          {short(v)}
        </span>
      )
    },
    {
      key: 'amount',
      header: 'Amount (ETH)',
      render: (v: string) => (
        <span className="font-mono text-white text-xs font-bold">
          {formatETH(v)} ETH
        </span>
      )
    },
    {
      key: 'fee',
      header: 'Fee (ETH)',
      render: (v: string) => (
        <span className="font-mono text-yellow-400 text-xs">
          {formatETH(v)} ETH
        </span>
      )
    },
    {
      key: 'feePercent',
      header: 'Fee %',
      render: (v: number) => (
        <span className="font-mono text-orange-400 text-xs">
          {(v * 100).toFixed(3)}%
        </span>
      )
    },
    {
      key: 'availableLiquidity',
      header: 'Available (ETH)',
      render: (v: string) => (
        <span className="font-mono text-gray-400 text-xs">
          {formatETH(v)} ETH
        </span>
      )
    },
    {
      key: 'utilizationRate',
      header: 'Utilization',
      render: (v: number) => (
        <span className={`font-bold text-xs ${
          v >= 0.8 ? 'text-red-400' :
          v >= 0.6 ? 'text-yellow-400' :
          'text-green-400'
        }`}>
          {(v * 100).toFixed(1)}%
        </span>
      )
    },
    {
      key: 'estimatedProfit',
      header: 'Est. Profit ($)',
      render: (v: number) => (
        <span className={`font-bold text-xs ${
          v >= 50 ? 'text-green-400' :
          v >= 20 ? 'text-yellow-400' :
          'text-orange-400'
        }`}>
          ${v.toFixed(2)}
        </span>
      )
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      render: (v: string) => (
        <span className={`font-bold text-xs px-1 py-0.5 rounded ${
          v === 'LOW' ? 'bg-green-900/30 text-green-400' :
          v === 'MEDIUM' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-red-900/30 text-red-400'
        }`}>
          {v}
        </span>
      )
    },
    {
      key: 'timestamp',
      header: 'Time',
      render: (v: number) => (
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
                    <span className="text-cyan-400 text-[8px]">⚡</span>
                    <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">FLASH LOAN OPPORTUNITIES</h2>
                    <div className="px-1 py-0.5 bg-cyan-900 text-cyan-300 text-[7px] font-mono border border-cyan-700">
                      {flashLoans.length} OPPORTUNITIES
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
                        <label className="text-gray-400 block mb-1">Protocols (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="aave, uniswap-v3"
                          value={filters.protocols?.join(', ') || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            protocols: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : undefined
                          }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Min Size (wei)</label>
                        <input
                          type="text"
                          placeholder="1000000000000000000"
                          value={filters.minSize || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, minSize: e.target.value || undefined }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Max Fee Rate</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={filters.maxFee || ''}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxFee: e.target.value ? parseFloat(e.target.value) : undefined }))}
                          className="w-full px-2 py-1 bg-gray-800 border border-gray-600 text-white font-mono text-[7px] rounded"
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 block mb-1">Assets (comma-separated)</label>
                        <input
                          type="text"
                          placeholder="WETH, USDC"
                          value={filters.assets?.join(', ') || ''}
                          onChange={(e) => setFilters(prev => ({
                            ...prev,
                            assets: e.target.value ? e.target.value.split(',').map(s => s.trim()).filter(Boolean) : undefined
                          }))}
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
                  data={flashLoans}
                  columns={columns}
                  emptyMessage={isSubscribed ? "[WAITING FOR FLASH LOAN OPPORTUNITIES...]" : "[SUBSCRIBE TO START MONITORING]"}
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
