'use client'
import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import EthAbi from './ethAbi.json'
import BtcEthAbi from './btcEth.json'
import BtcUsdAbi from './btcAbi.json'
import EthBtcAbi from './ethBtc.json'
import UsdtEthAbi from './usdtEth.json'
import UsdtUsdAbi from './usdtUsd.json'
import TimeSeriesChart from '@/app/components/charts/TimeSeriesChart'

const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545')

const tokens = [
  {
    name: 'ETH / USD',
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    abi: EthAbi,
  },
  {
    name: 'BTC / USD',
    address: '0xF4030086522a5bEEa4988F8cA5B36dbC97BeE88c',
    abi: BtcUsdAbi,
  },
  {
    name: 'BTC / ETH',
    address: '0xdeb288F737066589598e9214E782fa5A8eD689e8',
    abi: BtcEthAbi,
  },
  {
    name: 'ETH / BTC',
    address: '0xAc559F25B1619171CbC396a50854A3240b6A4e99',
    abi: EthBtcAbi,
  },
  {
    name: 'USDT / ETH',
    address: '0xEe9F2375b4bdF6387aa8265dD4FB8F16512A1d46',
    abi: UsdtEthAbi,
  },
  {
    name: 'USDT / USD',
    address: '0x3E7d1eAB13ad0104d2750B8863b489D65364e32D',
    abi: UsdtUsdAbi,
  },
]

interface TokenData {
  name: string
  address: string
  price?: string
  updatedAt?: string
  heartbeat?: string
  deviationThreshold: string
  lastUpdateTimestamp?: number
  historicalData?: Array<{ time: string; price: number }>
  loading?: boolean
  error?: string
}

const Page = () => {
  const [tokensData, setTokensData] = useState<TokenData[]>(
    tokens.map((token) => ({
      name: token.name,
      address: token.address,
      deviationThreshold: '0.1%',
      loading: true,
    }))
  )
  const [nextRefresh, setNextRefresh] = useState(10)

  const calculateHeartbeat = (timestamp: number) => {
    const now = Date.now()
    const timeSinceUpdate = now - timestamp

    // Calculate heartbeat in HH:MM:SS format
    const hours = Math.floor(timeSinceUpdate / (1000 * 60 * 60))
    const minutes = Math.floor((timeSinceUpdate % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((timeSinceUpdate % (1000 * 60)) / 1000)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const fetchHistoricalData = async (contract: ethers.Contract, decimals: number, hours: number = 1) => {
    try {
      const latestRound = await contract.latestRound()
      const latestRoundNum = Number(latestRound)
      
      // Get rounds for the last hour
      const historicalData: Array<{ time: string; price: number }> = []
      const oneHourAgo = Date.now() - hours * 60 * 60 * 1000
      
      // Fetch rounds backwards from latest - sample every 5th round to avoid too many calls
      const maxRounds = 100
      const sampleInterval = 5 // Sample every 5th round for better performance
      let fetchedLatest = false
      
      for (let i = 0; i < maxRounds; i += sampleInterval) {
        const roundId = latestRoundNum - i
        if (roundId < 1) break
        
        try {
          const roundData = await contract.getRoundData(roundId)
          const updatedAt = Number(roundData.updatedAt) * 1000
          
          // Stop if we've gone past 1 hour
          if (updatedAt < oneHourAgo) break
          
          const price = Number(roundData.answer) / Math.pow(10, decimals)
          historicalData.push({
            time: new Date(updatedAt).toLocaleTimeString(),
            price: price,
          })
          
          if (i === 0) {
            fetchedLatest = true
          }
        } catch (error) {
          // If round doesn't exist or error, skip it
          continue
        }
      }
      
      // Ensure we have at least the latest round
      if (!fetchedLatest || historicalData.length === 0) {
        try {
          const latestData = await contract.latestRoundData()
          const updatedAt = Number(latestData.updatedAt) * 1000
          const price = Number(latestData.answer) / Math.pow(10, decimals)
          const latestEntry = {
            time: new Date(updatedAt).toLocaleTimeString(),
            price: price,
          }
          // Only add if not already present
          const exists = historicalData.some(d => d.time === latestEntry.time)
          if (!exists) {
            historicalData.push(latestEntry)
          }
        } catch (error) {
          // Ignore error
        }
      }
      
      // Sort by time to get chronological order
      historicalData.sort((a, b) => {
        const timeA = new Date(a.time).getTime()
        const timeB = new Date(b.time).getTime()
        return timeA - timeB
      })
      
      return historicalData
    } catch (error) {
      console.error('Error fetching historical data:', error)
      return []
    }
  }

  const getTokenData = async (token: typeof tokens[0]) => {
    try {
      const contract = new ethers.Contract(token.address, token.abi, provider)
      
      // Get decimals
      let decimals = 8 // Default for Chainlink
      try {
        decimals = Number(await contract.decimals())
      } catch {
        decimals = 8
      }

      // Get latest round data
      const result = await contract.latestRoundData()
      const price = Number(result.answer) / Math.pow(10, decimals)
      const updatedAt = new Date(Number(result.updatedAt) * 1000).toLocaleString()
      const updatedAtTimestamp = Number(result.updatedAt) * 1000

      // Fetch historical data
      const historicalData = await fetchHistoricalData(contract, decimals, 1)

      return {
        name: token.name,
        address: token.address,
        price: price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        updatedAt,
        lastUpdateTimestamp: updatedAtTimestamp,
        heartbeat: calculateHeartbeat(updatedAtTimestamp),
        deviationThreshold: '0.1%',
        historicalData,
        loading: false,
      }
    } catch (error: any) {
      console.error(`Error fetching data for ${token.name}:`, error)
      return {
        name: token.name,
        address: token.address,
        deviationThreshold: '0.1%',
        loading: false,
        error: error?.message || 'Failed to fetch data',
      }
    }
  }

  const fetchAllData = async (resetCountdown: boolean = true) => {
    const updatedData = await Promise.all(
      tokens.map((token) => getTokenData(token))
    )
    setTokensData(updatedData)
    if (resetCountdown) {
      setNextRefresh(10) // Reset countdown when manually refreshing
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Update heartbeat and countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTokensData((prevData) =>
        prevData.map((token) => {
          if (token.lastUpdateTimestamp) {
            return {
              ...token,
              heartbeat: calculateHeartbeat(token.lastUpdateTimestamp),
            }
          }
          return token
        })
      )

      // Update countdown
      setNextRefresh((prev) => {
        if (prev <= 1) {
          // Auto refresh when countdown reaches 0
          fetchAllData(false) // Don't reset countdown
          return 10
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Prepare chart data
  const chartData = tokensData
    .filter((token) => token.historicalData && token.historicalData.length > 0)
    .map((token) => ({
      name: token.name,
      data: token.historicalData!.map((item) => ({
        time: item.time,
        [token.name]: item.price,
      })),
    }))

  // Combine all chart data into single array
  const combinedChartData: Array<{ time: string; [key: string]: string | number }> = []
  if (chartData.length > 0) {
    const allTimes = new Set<string>()
    chartData.forEach((chart) => {
      chart.data.forEach((item) => {
        allTimes.add(item.time)
      })
    })
    
    const sortedTimes = Array.from(allTimes).sort()
    sortedTimes.forEach((time) => {
      const entry: { time: string; [key: string]: string | number } = { time }
      chartData.forEach((chart) => {
        const dataPoint = chart.data.find((d) => d.time === time)
        if (dataPoint) {
          entry[chart.name] = dataPoint[chart.name]
        }
      })
      combinedChartData.push(entry)
    })
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full px-4 py-3">
        <div className="bg-[#0D1117] border border-[#21262D] shadow-xl">
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)', minHeight: '600px' }}>
            <div className="h-full">
              <div className="bg-gray-900 border-b border-gray-800 px-1.5 py-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-sky-400 text-[8px]">🛰️</span>
                    <h2 className="font-mono text-[8px] uppercase tracking-widest text-gray-300">CHAINLINK ORACLES</h2>
                    <div className="px-1 py-0.5 bg-sky-900 text-sky-300 text-[7px] font-mono border border-sky-700">
                      {tokensData.length} ORACLES
                    </div>
                  </div>
                  <div className="text-emerald-400 font-mono text-[7px]">
                    NEXT REFRESH: {nextRefresh}s
                  </div>
                </div>
              </div>

              <div className="p-1.5">
                <div className="mb-4">
                  <button
                    onClick={() => fetchAllData(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-mono text-[8px] font-bold border border-emerald-500 transition-colors"
                  >
                    REFRESH ALL DATA
                  </button>
                </div>

                {/* Charts Section */}
                {combinedChartData.length > 0 && (
                  <div className="mb-4 bg-gray-900 border border-gray-800 p-2">
                    <h3 className="text-emerald-400 font-mono text-[8px] uppercase tracking-widest mb-2">
                      Historical Price Data (Last Hour)
                    </h3>
                    <div className="h-64">
                      <TimeSeriesChart
                        data={combinedChartData}
                        lines={chartData.map((chart, index) => {
                          const colors = [
                            '#10b981', // emerald
                            '#3b82f6', // blue
                            '#8b5cf6', // purple
                            '#ec4899', // pink
                            '#f59e0b', // amber
                            '#06b6d4', // cyan
                          ]
                          return {
                            dataKey: chart.name,
                            color: colors[index % colors.length],
                            name: chart.name,
                          }
                        })}
                        height={256}
                        showGrid={true}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-gray-900 border border-gray-800 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-800 border-b border-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Oracle Pair</th>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Price</th>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Threshold</th>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Heartbeat</th>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Last Update</th>
                          <th className="px-3 py-2 text-left text-[7px] font-semibold text-emerald-400 font-mono uppercase tracking-widest">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {tokensData.map((token, index) => (
                          <tr
                            key={token.address}
                            className="hover:bg-gray-800 transition-colors"
                          >
                            <td className="px-3 py-2">
                              <div className="font-medium text-white font-mono text-[7px]">{token.name}</div>
                              <div className="text-[6px] text-gray-500 font-mono mt-1">
                                {token.address.slice(0, 6)}...{token.address.slice(-4)}
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              {token.loading ? (
                                <div className="text-gray-400 font-mono text-[7px]">Loading...</div>
                              ) : token.error ? (
                                <div className="text-red-400 font-mono text-[7px]">Error</div>
                              ) : (
                                <div className="text-white font-mono text-[8px] font-bold">
                                  ${token.price}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-300 font-mono text-[7px]">{token.deviationThreshold}</td>
                            <td className="px-3 py-2">
                              {token.heartbeat ? (
                                <div className="text-emerald-400 font-mono font-semibold text-[7px]">
                                  {token.heartbeat}
                                </div>
                              ) : (
                                <div className="text-gray-500 font-mono text-[7px]">-</div>
                              )}
                            </td>
                            <td className="px-3 py-2 text-gray-300 font-mono text-[6px]">
                              {token.updatedAt || '-'}
                            </td>
                            <td className="px-3 py-2">
                              {token.loading ? (
                                <span className="px-1 py-0.5 text-[6px] rounded bg-gray-700 text-gray-400 font-mono">
                                  Loading
                                </span>
                              ) : token.error ? (
                                <span className="px-1 py-0.5 text-[6px] rounded bg-red-900/30 text-red-400 font-mono">
                                  Error
                                </span>
                              ) : (
                                <span className="px-1 py-0.5 text-[6px] rounded bg-emerald-900/30 text-emerald-400 font-mono">
                                  Active
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
