'use client';
import React, { useEffect, useState, useRef } from 'react';
import { ethers } from 'ethers';
import tokenList from './swap.json';

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const wallet = '0x2e173417e35EE73600E515a3c662422760FB8aB9'; // replace with your wallet
const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

// CoinGecko API allows up to 300 IDs per request, but we'll use chunks of 250 to be safe
const COINGECKO_BATCH_SIZE = 250;
const PRICE_REFRESH_INTERVAL_MS = 60000; // 1 minute

// Helper function to get CoinGecko ID from token
function getCoinGeckoId(token: any): string {
  // Try explicit ID first, then symbol-based mapping
  if (token.id) return token.id;
  
  // Common symbol-to-id mappings for CoinGecko
  const symbolMap: Record<string, string> = {
    '1inch': '1inch',
    'aave': 'aave',
    'usdc': 'usd-coin',
    'usdt': 'tether',
    'weth': 'weth',
    'wbtc': 'wrapped-bitcoin',
    'dai': 'dai',
    'link': 'chainlink',
    'uni': 'uniswap',
    'sushi': 'sushi',
    'crv': 'curve-dao-token',
    'matic': 'matic-network',
    'shib': 'shiba-inu',
  };
  
  const symbolLower = token.symbol.toLowerCase();
  return symbolMap[symbolLower] || symbolLower;
}

export default function TokenDashboard() {
  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc = highest price first
  const priceCacheRef = useRef<Map<string, number>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch prices from CoinGecko in batches
  async function fetchPricesBatch(tokenIds: string[]): Promise<Record<string, { usd: number }>> {
    const prices: Record<string, { usd: number }> = {};
    
    // Split into chunks if needed
    for (let i = 0; i < tokenIds.length; i += COINGECKO_BATCH_SIZE) {
      const chunk = tokenIds.slice(i, i + COINGECKO_BATCH_SIZE);
      const idsParam = chunk.join(',');
      
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`
        );
        
        if (!res.ok) {
          if (res.status === 429) {
            console.warn('Rate limit hit, waiting before retry...');
            await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
            continue;
          }
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json() as Record<string, { usd: number }>;
        Object.assign(prices, data);
      } catch (err) {
        console.error('Error fetching prices batch:', err);
      }
    }
    
    return prices;
  }

  // Fetch all prices once per minute
  async function fetchAllPrices() {
    const ethereumTokens = tokenList.tokens.filter((t: any) => t.chainId === 1 && !t.wontUse);
    const tokenIds = ethereumTokens.map(token => getCoinGeckoId(token));
    
    console.log(`Fetching prices for ${tokenIds.length} tokens...`);
    const prices = await fetchPricesBatch(tokenIds);
    
    // Update cache
    const cache = new Map<string, number>();
    ethereumTokens.forEach(token => {
      const id = getCoinGeckoId(token);
      const price = prices[id]?.usd ?? 0;
      cache.set(token.address.toLowerCase(), price);
    });
    
    priceCacheRef.current = cache;
    setLastPriceUpdate(new Date());
    
    // Update existing tokens with new prices
    setTokens(prevTokens => 
      prevTokens.map(token => ({
        ...token,
        price: cache.get(token.address.toLowerCase()) ?? token.price
      }))
    );
  }

  // Fetch wallet balances (doesn't hit rate limits)
  async function fetchBalances() {
    const ethereumTokens = tokenList.tokens.filter((t: any) => t.chainId === 1 && !t.wontUse);
    const results: any[] = [];
    const cache = priceCacheRef.current;

    for (const token of ethereumTokens) {
      try {
        // Get wallet balance from your node
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const raw = await contract.balanceOf(wallet);
        const balance = Number(raw) / 10 ** token.decimals;
        console.log(balance ,raw, "balance");
        // Get price from cache (or 0 if not cached yet)
        const price = cache.get(token.address.toLowerCase()) ?? 0;

        results.push({
          ...token,
          balance,
          price
        });
      } catch (err) {
        console.log('Error fetching token balance', token.symbol, err);
        // Still add token with 0 balance/price
        results.push({
          ...token,
          balance: 0,
          price: cache.get(token.address.toLowerCase()) ?? 0
        });
      }
    }

    setTokens(results);
    setLoading(false);
  }

  useEffect(() => {
    // Initial fetch: prices first, then balances
    async function initialFetch() {
      await fetchAllPrices();
      await fetchBalances();
    }
    
    initialFetch();

    // Set up interval to refresh prices every minute
    intervalRef.current = setInterval(() => {
      fetchAllPrices();
    }, PRICE_REFRESH_INTERVAL_MS);

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) return <div className="text-center p-10 text-gray-500">Loading token data...</div>;

  const totalValue = tokens.reduce((sum, token) => sum + (token.balance * token.price), 0);

  // Sort tokens by price
  const sortedTokens = [...tokens].sort((a, b) => {
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
  });

  // Toggle sort order
  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Ethereum Wallet Token Dashboard</h1>
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {lastPriceUpdate ? (
              <>Prices updated: {lastPriceUpdate.toLocaleTimeString()}</>
            ) : (
              <>Fetching prices...</>
            )}
          </div>
          <div className="text-lg font-semibold text-green-600">
            Total Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-black border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Logo</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Symbol</th>
              <th className="px-4 py-2 text-left">Balance</th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={toggleSort}
              >
                Price (USD) {sortOrder === 'desc' ? '↓' : '↑'}
              </th>
              <th className="px-4 py-2 text-left">Value (USD)</th>
              <th className="px-4 py-2 text-left">Bridge Info</th>
            </tr>
          </thead>
          <tbody>
            {sortedTokens.map((token, idx) => (
              <tr key={token.address} className={idx % 2 === 0 ? 'bg-black' : 'bg-gray-900'}>
                <td className="px-4 py-2">{idx + 1}</td>
                <td className="px-4 py-2">
                  <img src={token.logoURI} alt={token.symbol} className="w-6 h-6 rounded-full" />
                </td>
                <td className="px-4 py-2 font-medium">{token.name}</td>
                <td className="px-4 py-2">{token.symbol}</td>
                <td className="px-4 py-2">{token.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}</td>
                <td className="px-4 py-2">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                <td className="px-4 py-2 font-medium">
                  ${(token.balance * token.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-2">
                  {token.extensions?.bridgeInfo
                    ? Object.entries(token.extensions.bridgeInfo)
                        .map(([chainId, info]: [string, any]) => `${chainId}: ${info.tokenAddress}`)
                        .join(', ')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
