import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

export default function PortfolioDashboard() {
  const { user } = useAuth()
  
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const response = await api.get(`/api/portfolio?user_id=${user.id}`)
      return response.data
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time data
  })

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">Loading portfolio from Starknet...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-center text-red-400">Failed to load portfolio data</p>
        <p className="text-center text-xs text-gray-500 mt-2">{error.message}</p>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">No portfolio data available</p>
      </div>
    )
  }

  const {
    vault_balance_usd = 0,
    vault_balance_eth = 0,
    total_value_usd = 0,
    pnl_usd = 0,
    pnl_percentage = 0,
    market_prices = {},
    current_pool = 'N/A',
    risk_score = 0,
    positions = [],
    total_deposits_usd = 0,
    total_withdrawals_usd = 0,
    wallet_address = ''
  } = portfolio

  const ethPrice = market_prices.ETH?.price || 0
  const ethChange24h = market_prices.ETH?.change24h || 0

  return (
    <div className="space-y-6">
      {/* Wallet Address Display */}
      {wallet_address && (
        <div className="card bg-dark-700">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-primary-500" />
            <p className="text-xs text-gray-400">Connected Wallet:</p>
            <p className="text-sm font-mono text-white">
              {wallet_address.substring(0, 10)}...{wallet_address.substring(wallet_address.length - 8)}
            </p>
          </div>
        </div>
      )}

      {/* Summary Cards - Real-time data from Starknet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vault Balance (from Starknet)</p>
              <p className="text-3xl font-bold mt-1">${vault_balance_usd.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
              <p className="text-sm text-gray-500 mt-1">{vault_balance_eth.toFixed(6)} ETH</p>
            </div>
            <DollarSign className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Profit/Loss</p>
              <p className={`text-3xl font-bold mt-1 ${pnl_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pnl_usd >= 0 ? '+' : ''}${pnl_usd.toLocaleString(undefined, {maximumFractionDigits: 2})}
              </p>
              <p className={`text-sm mt-1 ${pnl_percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {pnl_percentage >= 0 ? '+' : ''}{pnl_percentage.toFixed(2)}%
              </p>
            </div>
            {pnl_usd >= 0 ? (
              <TrendingUp className="h-12 w-12 text-green-500" />
            ) : (
              <TrendingDown className="h-12 w-12 text-red-500" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">ETH Price (Live)</p>
              <p className="text-3xl font-bold mt-1">${ethPrice.toLocaleString()}</p>
              <p className={`text-sm mt-1 ${ethChange24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {ethChange24h >= 0 ? '+' : ''}{ethChange24h.toFixed(2)}% 24h
              </p>
            </div>
            <AlertCircle
              className={`h-12 w-12 ${
                risk_score > 7 ? 'text-red-500' : risk_score > 4 ? 'text-yellow-500' : 'text-green-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Deposits & Withdrawals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Deposits</p>
              <p className="text-2xl font-bold mt-1 text-green-500">${total_deposits_usd.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
            <ArrowUpCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Withdrawals</p>
              <p className="text-2xl font-bold mt-1 text-red-500">${total_withdrawals_usd.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
            </div>
            <ArrowDownCircle className="h-10 w-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Active Positions (from Starknet)</h3>
        {positions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-2">No active positions</p>
            <p className="text-xs text-gray-500">Positions will be fetched from PositionManager contract</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Pool</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Value</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Range</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">APY</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position, index) => (
                  <tr key={index} className="border-b border-dark-700">
                    <td className="py-3 px-4 font-medium">{position.pool}</td>
                    <td className="py-3 px-4">${position.value?.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{position.range}</td>
                    <td className="py-3 px-4 text-green-500">{position.apy}%</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          position.status === 'active'
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}
                      >
                        {position.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Data Source Info */}
      <div className="card bg-dark-700 border-primary-500/30">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-primary-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-400">
            <p className="font-semibold text-primary-500 mb-1">Real-time Data Sources:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Vault Balance: Starknet VaultManager Contract</li>
              <li>Market Prices: Yahoo Finance API (updates every 30s)</li>
              <li>Transactions: Supabase Database</li>
              <li>Positions: Starknet PositionManager Contract (when deployed)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
