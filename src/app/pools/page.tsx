'use client';

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Table from '../components/Table';

// ERC20 ABI for token information
const ERC20_ABI = [
  { "type": "function", "name": "decimals", "stateMutability": "view", "inputs": [], "outputs": [ {"name":"","type":"uint8"} ] },
  { "type": "function", "name": "symbol", "stateMutability": "view", "inputs": [], "outputs": [ {"name":"","type":"string"} ] },
  { "type": "function", "name": "name", "stateMutability": "view", "inputs": [], "outputs": [ {"name":"","type":"string"} ] },
  { "type": "function", "name": "totalSupply", "stateMutability": "view", "inputs": [], "outputs": [ {"name":"","type":"uint256"} ] },
  { "type": "event", "name": "Transfer", "inputs": [
    {"name":"from","type":"address","indexed":true},
    {"name":"to","type":"address","indexed":true},
    {"name":"value","type":"uint256","indexed":false}
  ], "anonymous": false }
];

// Connect to your local Nethermind node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}

interface PairData {
  address: string;
  token0: string;
  token1: string;
  created_block: string;
  created_tx: string;
  token0Info?: TokenInfo;
  token1Info?: TokenInfo;
}

interface PoolData {
  address: string;
  token0: string;
  token1: string;
  fee: number;
  created_block: string;
  created_tx: string;
  token0Info?: TokenInfo;
  token1Info?: TokenInfo;
}

interface TvlData {
  address: string;
  token0: string;
  token1: string;
  reserve0: string;
  reserve1: string;
  token0Info?: TokenInfo;
  token1Info?: TokenInfo;
}

interface DetailedPairData {
  pairName: string;
  token0: TokenInfo;
  token1: TokenInfo;
  reserves: {
    reserve0: string;
    reserve1: string;
    blockTimestampLast: number;
  };
  prices: {
    price0: string;
    price1: string;
  };
  liquidity: {
    totalSupply: string;
    decimals: number;
  };
  pair: {
    factory: string;
    kLast: string;
  };
}

function short(addr?: string) { return addr ? `${addr.slice(0,6)}…${addr.slice(-4)}` : '-'; }

type TabType = 'pairs' | 'pools' | 'tvl';

export default function PoolsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('pairs');
  const [pairs, setPairs] = useState<PairData[]>([]);
  const [pools, setPools] = useState<PoolData[]>([]);
  const [tvl, setTvl] = useState<TvlData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPair, setSelectedPair] = useState<DetailedPairData | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchTokenInfo = async (tokenAddress: string): Promise<TokenInfo> => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const [symbol, name, decimals] = await Promise.all([
        tokenContract.symbol().catch(() => 'UNK'),
        tokenContract.name().catch(() => 'Unknown Token'),
        tokenContract.decimals().catch(() => 18)
      ]);
      return {
        address: tokenAddress,
        symbol,
        name,
        decimals: Number(decimals)
      };
    } catch (err) {
      return {
        address: tokenAddress,
        symbol: 'UNK',
        name: 'Unknown Token',
        decimals: 18
      };
    }
  };

  const fetchData = async (endpoint: string, setter: (data: any[]) => void) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://127.0.0.1:3000${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rawData = await response.json();

      // Add token information for each item
      const enrichedData = await Promise.all(
        rawData.map(async (item: any) => {
          const [token0Info, token1Info] = await Promise.all([
            fetchTokenInfo(item.token0),
            fetchTokenInfo(item.token1)
          ]);
          return {
            ...item,
            token0Info,
            token1Info
          };
        })
      );

      setter(enrichedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedPairData = async (pairAddress: string): Promise<DetailedPairData | null> => {
    try {
      setModalLoading(true);
      const pairAbi = [
        {"inputs":[],"name":"token0","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"token1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"getReserves","outputs":[{"internalType":"uint112","name":"_reserve0","type":"uint112"},{"internalType":"uint112","name":"_reserve1","type":"uint112"},{"internalType":"uint32","name":"_blockTimestampLast","type":"uint32"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"factory","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
        {"inputs":[],"name":"kLast","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}
      ];

      const pairContract = new ethers.Contract(pairAddress, pairAbi, provider);

      // Get token addresses
      const [token0Address, token1Address] = await Promise.all([
        pairContract.token0(),
        pairContract.token1()
      ]);

      // Get token info
      const [token0Info, token1Info] = await Promise.all([
        fetchTokenInfo(token0Address),
        fetchTokenInfo(token1Address)
      ]);

      // Get pair data
      const [
        reserves,
        totalSupply,
        decimals,
        factory,
        kLast
      ] = await Promise.all([
        pairContract.getReserves(),
        pairContract.totalSupply(),
        pairContract.decimals(),
        pairContract.factory(),
        pairContract.kLast()
      ]);

      // Calculate prices
      const reserve0 = ethers.formatUnits(reserves[0], token0Info.decimals);
      const reserve1 = ethers.formatUnits(reserves[1], token1Info.decimals);

      const price0 = parseFloat(reserve1) / parseFloat(reserve0);
      const price1 = parseFloat(reserve0) / parseFloat(reserve1);

      return {
        pairName: `Uniswap V2: ${token0Info.symbol}-${token1Info.symbol}`,
        token0: token0Info,
        token1: token1Info,
        reserves: {
          reserve0,
          reserve1,
          blockTimestampLast: Number(reserves[2])
        },
        prices: {
          price0: price0.toFixed(6),
          price1: price1.toFixed(6)
        },
        liquidity: {
          totalSupply: ethers.formatUnits(totalSupply, decimals),
          decimals: Number(decimals)
        },
        pair: {
          factory,
          kLast: kLast.toString()
        }
      };
    } catch (err) {
      console.error('Error fetching detailed pair data:', err);
      return null;
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pairs') {
      fetchData('/pairs', setPairs);
    } else if (activeTab === 'pools') {
      fetchData('/pools', setPools);
    } else if (activeTab === 'tvl') {
      fetchData('/tvl', setTvl);
    }
  }, [activeTab]);

  const handleRowClick = async (row: any) => {
    const detailedData = await fetchDetailedPairData(row.address);
    if (detailedData) {
      setSelectedPair(detailedData);
    }
  };

  const getColumns = () => {
    if (activeTab === 'pairs') {
      return [
        {
          key: 'address',
          header: 'Pool Address',
          render: (v: string) => (
            <span className="font-mono text-blue-400 text-xs cursor-pointer hover:text-blue-300" title={v}>
              {short(v)}
            </span>
          ),
          className: 'font-mono'
        },
        {
          key: 'token0Info',
          header: 'Token 0',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token0">
              {short("token0")}
            </span>
          )
        },
        {
          key: 'token1Info',
          header: 'Token 1',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token1">
              {short("token1")}
            </span>
          )
        },
        {
          key: 'created_block',
          header: 'Created Block',
          render: (v: string) => (
            <span className="font-mono text-gray-400 text-xs">
              {v}
            </span>
          )
        },
        {
          key: 'created_tx',
          header: 'Created TX',
          render: (v: string) => (
            <span className="font-mono text-gray-400 text-xs" title={v}>
              {short(v)}
            </span>
          )
        },
      ];
    } else if (activeTab === 'pools') {
      return [
        {
          key: 'address',
          header: 'Pool Address',
          render: (v: string) => (
            <span className="font-mono text-blue-400 text-xs cursor-pointer hover:text-blue-300" title={v}>
              {short(v)}
            </span>
          ),
          className: 'font-mono'
        },
        {
          key: 'token0Info',
          header: 'Token 0',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token0">
              {short("token0")}
            </span>
          )
        },
        {
          key: 'token1Info',
          header: 'Token 1',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token1">
              {short("token1")}
            </span>
          )
        },
        {
          key: 'fee',
          header: 'Fee',
          render: (v: number) => (
            <span className="font-mono text-green-400 text-xs">
              {v ? `${(v/10000).toFixed(2)}%` : '-'}
            </span>
          )
        },
        {
          key: 'created_block',
          header: 'Created Block',
          render: (v: string) => (
            <span className="font-mono text-gray-400 text-xs">
              {v}
            </span>
          )
        },
        {
          key: 'created_tx',
          header: 'Created TX',
          render: (v: string) => (
            <span className="font-mono text-gray-400 text-xs" title={v}>
              {short(v)}
            </span>
          )
        },
      ];
    } else if (activeTab === 'tvl') {
      return [
        {
          key: 'address',
          header: 'Pool Address',
          render: (v: string) => (
            <span className="font-mono text-blue-400 text-xs cursor-pointer hover:text-blue-300" title={v}>
              {short(v)}
            </span>
          ),
          className: 'font-mono'
        },
        {
          key: 'token0Info',
          header: 'Token 0',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token0">
              {short("token0")}
            </span>
          )
        },
        {
          key: 'token1Info',
          header: 'Token 1',
          render: (v: TokenInfo) => v ? (
            <div className="text-xs">
              <div className="font-mono text-green-400 font-bold">{v.symbol}</div>
              <div className="font-mono text-gray-400 text-[10px]">{short(v.address)}</div>
            </div>
          ) : (
            <span className="font-mono text-gray-300 text-xs" title="token1">
              {short("token1")}
            </span>
          )
        },
        {
          key: 'reserve0',
          header: 'Reserve 0',
          render: (v: string) => (
            <span className="font-mono text-yellow-400 text-xs">
              {v}
            </span>
          )
        },
        {
          key: 'reserve1',
          header: 'Reserve 1',
          render: (v: string) => (
            <span className="font-mono text-yellow-400 text-xs">
              {v}
            </span>
          )
        },
      ];
    }
    return [];
  };

  const getDataAndTitle = () => {
    if (activeTab === 'pairs') {
      return { data: pairs, title: 'UNISWAP V2 PAIRS', count: pairs.length };
    } else if (activeTab === 'pools') {
      return { data: pools, title: 'UNISWAP V3 POOLS', count: pools.length };
    } else if (activeTab === 'tvl') {
      return { data: tvl, title: 'TVL DATA', count: tvl.length };
    }
    return { data: [], title: '', count: 0 };
  };

  const { data, title, count } = getDataAndTitle();

  return (
    <div className="min-h-screen">
      <div className="max-w-full px-4 py-3">
        <div className="bg-[#0D1117] border border-[#21262D] shadow-xl">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <div className="h-full">
              <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sky-400 text-[8px]">🏦</span>
                    <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">{title}</h2>
                    <div className="px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700">
                      {loading ? 'LOADING...' : `${count} ITEMS`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pool Version Tabs */}
              <div className="px-1.5 py-1 bg-black border-b border-gray-800">
                <div className="flex items-center gap-1">
                  <span className="text-sky-400 text-[8px] font-mono">DATA:</span>
                  <button
                    onClick={() => setActiveTab('pairs')}
                    className={`px-2 py-0.5 text-[7px] font-mono border ${
                      activeTab === 'pairs'
                        ? 'bg-emerald-900 text-emerald-300 border-emerald-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    V2 PAIRS ({pairs.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('pools')}
                    className={`px-2 py-0.5 text-[7px] font-mono border ${
                      activeTab === 'pools'
                        ? 'bg-blue-900 text-blue-300 border-blue-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    V3 POOLS ({pools.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('tvl')}
                    className={`px-2 py-0.5 text-[7px] font-mono border ${
                      activeTab === 'tvl'
                        ? 'bg-purple-900 text-purple-300 border-purple-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    TVL ({tvl.length})
                  </button>
                </div>
              </div>

              <div className="p-1.5">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 font-mono text-sm">Loading data...</div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <div className="text-red-400 font-mono text-sm">Error: {error}</div>
                  </div>
                ) : (
                  <Table
                    data={data as any[]}
                    columns={getColumns() as any[]}
                    emptyMessage={`[NO ${activeTab.toUpperCase()} DATA]`}
                    density="compact"
                    onRowClick={handleRowClick}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for detailed pair information */}
      {selectedPair && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8">
          <div className="bg-[#0D1117] border border-[#21262D] rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#0066FF]">Pair Details</h2>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="text-gray-400 hover:text-white text-xl font-bold"
                >
                  ×
                </button>
              </div>

              {modalLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 font-mono">Loading detailed data...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Pair Info */}
                  <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4 text-emerald-400">Pair Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm">Pair Name</div>
                        <div className="text-white font-bold text-lg">{selectedPair.pairName}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Factory Address</div>
                        <div className="text-blue-400 font-mono text-sm">{selectedPair.pair.factory}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Last Block Timestamp</div>
                        <div className="text-white">{new Date(selectedPair.reserves.blockTimestampLast * 1000).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">K Last (√k)</div>
                        <div className="text-purple-400 font-mono text-sm">{selectedPair.pair.kLast}</div>
                      </div>
                    </div>
                  </div>

                  {/* Token Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Token 0 */}
                    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                      <h4 className="text-lg font-bold mb-4 text-blue-400">Token 0 ({selectedPair.token0.symbol})</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-gray-400 text-sm">Address</div>
                          <div className="text-blue-400 font-mono text-sm break-all">{selectedPair.token0.address}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Name</div>
                          <div className="text-white">{selectedPair.token0.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Symbol</div>
                          <div className="text-green-400 font-bold">{selectedPair.token0.symbol}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Decimals</div>
                          <div className="text-yellow-400">{selectedPair.token0.decimals}</div>
                        </div>
                      </div>
                    </div>

                    {/* Token 1 */}
                    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                      <h4 className="text-lg font-bold mb-4 text-red-400">Token 1 ({selectedPair.token1.symbol})</h4>
                      <div className="space-y-2">
                        <div>
                          <div className="text-gray-400 text-sm">Address</div>
                          <div className="text-blue-400 font-mono text-sm break-all">{selectedPair.token1.address}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Name</div>
                          <div className="text-white">{selectedPair.token1.name}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Symbol</div>
                          <div className="text-green-400 font-bold">{selectedPair.token1.symbol}</div>
                        </div>
                        <div>
                          <div className="text-gray-400 text-sm">Decimals</div>
                          <div className="text-yellow-400">{selectedPair.token1.decimals}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reserves & Prices */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Reserves */}
                    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                      <h4 className="text-lg font-bold mb-4 text-purple-400">Reserves</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">{selectedPair.token0.symbol} Reserve:</span>
                          <span className="text-blue-400 font-bold">{parseFloat(selectedPair.reserves.reserve0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">{selectedPair.token1.symbol} Reserve:</span>
                          <span className="text-red-400 font-bold">{parseFloat(selectedPair.reserves.reserve1).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ratio ({selectedPair.token0.symbol}:{selectedPair.token1.symbol}):</span>
                          <span className="text-green-400 font-bold">{(parseFloat(selectedPair.reserves.reserve0) / parseFloat(selectedPair.reserves.reserve1)).toFixed(6)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Prices */}
                    <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                      <h4 className="text-lg font-bold mb-4 text-emerald-400">Prices</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">1 {selectedPair.token0.symbol} =</span>
                          <span className="text-emerald-400 font-bold">{selectedPair.prices.price0} {selectedPair.token1.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">1 {selectedPair.token1.symbol} =</span>
                          <span className="text-emerald-400 font-bold">{selectedPair.prices.price1} {selectedPair.token0.symbol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price Ratio:</span>
                          <span className="text-yellow-400 font-bold">{(parseFloat(selectedPair.prices.price0) / parseFloat(selectedPair.prices.price1)).toFixed(6)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Liquidity */}
                  <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4 text-cyan-400">Liquidity Pool</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-gray-400 text-sm">Total Liquidity Tokens</div>
                        <div className="text-cyan-400 font-bold text-lg">{parseFloat(selectedPair.liquidity.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Liquidity Token Decimals</div>
                        <div className="text-yellow-400 font-bold">{selectedPair.liquidity.decimals}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-sm">Pool Value</div>
                        <div className="text-green-400 font-bold text-lg">
                          ${(parseFloat(selectedPair.reserves.reserve0) * 2).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}