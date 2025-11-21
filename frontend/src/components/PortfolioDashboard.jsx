import { useQuery } from '@tanstack/react-query'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import api from '../lib/api'

export default function PortfolioDashboard() {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      const response = await api.get('/api/portfolio')
      return response.data
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">Loading portfolio...</p>
      </div>
    )
  }

  const { total_value = 0, current_pool = 'N/A', risk_score = 0, positions = [] } = portfolio || {}

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-3xl font-bold mt-1">${total_value.toLocaleString()}</p>
            </div>
            <DollarSign className="h-12 w-12 text-primary-500" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Current Pool</p>
              <p className="text-xl font-semibold mt-1">{current_pool}</p>
            </div>
            {total_value > 10000 ? (
              <TrendingUp className="h-12 w-12 text-green-500" />
            ) : (
              <TrendingDown className="h-12 w-12 text-red-500" />
            )}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Risk Score</p>
              <p className="text-3xl font-bold mt-1">{risk_score}/10</p>
            </div>
            <AlertCircle
              className={`h-12 w-12 ${
                risk_score > 7 ? 'text-red-500' : risk_score > 4 ? 'text-yellow-500' : 'text-green-500'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Active Positions</h3>
        {positions.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No active positions</p>
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
    </div>
  )
}
