'use client'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

interface Tx {
  hash: string
  from: string
  to: string | null
  value: string
  gasPrice: string
  method: string
  timestamp: number
}

const LiveMempoolPage = () => {
  const [txs, setTxs] = useState<Tx[]>([])
  const [connected, setConnected] = useState(false)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const provider = new ethers.WebSocketProvider('ws://127.0.0.1:8545')
    setConnected(true)

    provider.on('pending', async (txHash: string) => {
      try {
        const tx = await provider.getTransaction(txHash)
        if (!tx) return
        console.log(tx)
        const method = tx.data?.slice(0, 10) || '0x'
        const valueEth = ethers.formatEther(tx.value || BigInt(0))
        const gasPriceGwei = tx.gasPrice ? (Number(tx.gasPrice) / 1e9).toFixed(2) : '0'

        const entry: Tx = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to || 'Contract Creation',
          value: `${valueEth} ETH`,
          gasPrice: `${gasPriceGwei} Gwei`,
          method,
          timestamp: Date.now(),
        }

        setTxs((prev) => [entry, ...prev].slice(0, 50)) // keep last 50
        setCount((prev) => prev + 1)
      } catch {
        /* ignore failed fetch */
      }
    })

    // Listen for WebSocket close events
    provider.on('error', () => setConnected(false))
    provider.on('close', () => setConnected(false))
    return () => {
      provider.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-emerald-400 mb-4">Live Mempool Stream</h1>
        <div className="flex items-center space-x-4 mb-6">
          <div
            className={`h-3 w-3 rounded-full ${
              connected ? 'bg-emerald-400' : 'bg-red-500'
            }`}
          ></div>
          <span className="text-gray-300">
            {connected ? 'Connected to Nethermind WS' : 'Disconnected'}
          </span>
          <div className="ml-auto text-gray-400 text-sm">
            Total captured: <span className="text-emerald-400">{count}</span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-900 border-b border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-emerald-400">Tx Hash</th>
                <th className="px-4 py-3 text-left text-emerald-400">From</th>
                <th className="px-4 py-3 text-left text-emerald-400">To</th>
                <th className="px-4 py-3 text-left text-emerald-400">Value</th>
                <th className="px-4 py-3 text-left text-emerald-400">Gas</th>
                <th className="px-4 py-3 text-left text-emerald-400">Method</th>
                <th className="px-4 py-3 text-left text-emerald-400">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {txs.map((tx) => (
                <tr key={tx.hash} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">
                    {tx.hash.slice(0, 10)}...
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">
                    {tx.from.slice(0, 10)}...
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-300">
                    {tx.to ? tx.to.slice(0, 10) + '...' : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-200">{tx.value}</td>
                  <td className="px-4 py-3 text-gray-400">{tx.gasPrice}</td>
                  <td className="px-4 py-3 text-gray-500">{tx.method}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default LiveMempoolPage
