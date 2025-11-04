'use client'
import React, { useEffect, useState } from 'react'
import { ethers } from "ethers";
import pairAbi from './abi.json';

// ERC20 ABI for token symbol calls
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

interface PairData {
  pairName: string;
  token0: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  token1: {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  reserves: {
    reserve0: string;
    reserve1: string;
    blockTimestampLast: number;
  };
  prices: {
    price0: string; // token0 in terms of token1
    price1: string; // token1 in terms of token0
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

const Pair = () => {
    const [pairData, setPairData] = useState<PairData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
      getPairData()
    }, [])

    async function getPairData() {
      try {
        setLoading(true);
        const pairContract = new ethers.Contract('0x9C051B45eC8783BDd372681FcE23c03421c41af5', pairAbi, provider);

        // Get token addresses
        const [token0Address, token1Address] = await Promise.all([
          pairContract.token0(),
          pairContract.token1()
        ]);

        // Create ERC20 contract instances
        const token0Contract = new ethers.Contract(token0Address, ERC20_ABI, provider);
        const token1Contract = new ethers.Contract(token1Address, ERC20_ABI, provider);

        // Get all token data in parallel
        const [token0Data, token1Data] = await Promise.all([
          Promise.all([
            token0Contract.symbol(),
            token0Contract.name(),
            token0Contract.decimals()
          ]),
          Promise.all([
            token1Contract.symbol(),
            token1Contract.name(),
            token1Contract.decimals()
          ])
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

        // Calculate prices (reserve1/reserve0 and reserve0/reserve1)
        const reserve0 = ethers.formatUnits(reserves[0], token0Data[2]);
        const reserve1 = ethers.formatUnits(reserves[1], token1Data[2]);

        const price0 = parseFloat(reserve1) / parseFloat(reserve0); // token0 price in token1
        const price1 = parseFloat(reserve0) / parseFloat(reserve1); // token1 price in token0

        const data: PairData = {
          pairName: `Uniswap V2: ${token0Data[0]}-${token1Data[0]}`,
          token0: {
            address: token0Address,
            symbol: token0Data[0],
            name: token0Data[1],
            decimals: Number(token0Data[2])
          },
          token1: {
            address: token1Address,
            symbol: token1Data[0],
            name: token1Data[1],
            decimals: Number(token1Data[2])
          },
          reserves: {
            reserve0: ethers.formatUnits(reserves[0], token0Data[2]),
            reserve1: ethers.formatUnits(reserves[1], token1Data[2]),
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
            factory: factory,
            kLast: kLast.toString()
          }
        };

        setPairData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching pair data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    }
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] p-8 font-mono">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-[#0066FF]">Uniswap V2 Pair Data</h1>
            <div className="text-center py-8">
              <div className="text-gray-400">Loading pair data...</div>
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] p-8 font-mono">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-[#0066FF]">Uniswap V2 Pair Data</h1>
            <div className="text-center py-8">
              <div className="text-red-400">Error: {error}</div>
            </div>
          </div>
        </div>
      );
    }

    if (!pairData) return null;

    return (
      <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] p-8 font-mono">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#0066FF]">Uniswap V2 Pair Data</h1>

          {/* Pair Info */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-emerald-400">Pair Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Pair Name</div>
                <div className="text-white font-bold text-lg">{pairData.pairName}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Factory Address</div>
                <div className="text-blue-400 font-mono text-sm">{pairData.pair.factory}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Last Block Timestamp</div>
                <div className="text-white">{new Date(pairData.reserves.blockTimestampLast * 1000).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">K Last (√k)</div>
                <div className="text-purple-400 font-mono text-sm">{pairData.pair.kLast}</div>
              </div>
            </div>
          </div>

          {/* Token Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Token 0 */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-blue-400">Token 0 ({pairData.token0.symbol})</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-gray-400 text-sm">Address</div>
                  <div className="text-blue-400 font-mono text-sm break-all">{pairData.token0.address}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Name</div>
                  <div className="text-white">{pairData.token0.name}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Symbol</div>
                  <div className="text-green-400 font-bold">{pairData.token0.symbol}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Decimals</div>
                  <div className="text-yellow-400">{pairData.token0.decimals}</div>
                </div>
              </div>
            </div>

            {/* Token 1 */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-red-400">Token 1 ({pairData.token1.symbol})</h3>
              <div className="space-y-2">
                <div>
                  <div className="text-gray-400 text-sm">Address</div>
                  <div className="text-blue-400 font-mono text-sm break-all">{pairData.token1.address}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Name</div>
                  <div className="text-white">{pairData.token1.name}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Symbol</div>
                  <div className="text-green-400 font-bold">{pairData.token1.symbol}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm">Decimals</div>
                  <div className="text-yellow-400">{pairData.token1.decimals}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Reserves & Prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Reserves */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-purple-400">Reserves</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">{pairData.token0.symbol} Reserve:</span>
                  <span className="text-blue-400 font-bold">{parseFloat(pairData.reserves.reserve0).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{pairData.token1.symbol} Reserve:</span>
                  <span className="text-red-400 font-bold">{parseFloat(pairData.reserves.reserve1).toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ratio ({pairData.token0.symbol}:{pairData.token1.symbol}):</span>
                  <span className="text-green-400 font-bold">{(parseFloat(pairData.reserves.reserve0) / parseFloat(pairData.reserves.reserve1)).toFixed(6)}</span>
                </div>
              </div>
            </div>

            {/* Prices */}
            <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
              <h3 className="text-lg font-bold mb-4 text-emerald-400">Prices</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">1 {pairData.token0.symbol} =</span>
                  <span className="text-emerald-400 font-bold">{pairData.prices.price0} {pairData.token1.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">1 {pairData.token1.symbol} =</span>
                  <span className="text-emerald-400 font-bold">{pairData.prices.price1} {pairData.token0.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Price Ratio:</span>
                  <span className="text-yellow-400 font-bold">{(parseFloat(pairData.prices.price0) / parseFloat(pairData.prices.price1)).toFixed(6)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Liquidity */}
          <div className="bg-[#161B22] border border-[#21262D] rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-cyan-400">Liquidity Pool</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Total Liquidity Tokens</div>
                <div className="text-cyan-400 font-bold text-lg">{parseFloat(pairData.liquidity.totalSupply).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Liquidity Token Decimals</div>
                <div className="text-yellow-400 font-bold">{pairData.liquidity.decimals}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Pool Value</div>
                <div className="text-green-400 font-bold text-lg">
                  ${(parseFloat(pairData.reserves.reserve0) * 2).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

export default Pair