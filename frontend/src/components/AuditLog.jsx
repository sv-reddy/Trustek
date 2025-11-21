import { useQuery } from '@tanstack/react-query'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import api from '../lib/api'

export default function AuditLog() {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const response = await api.get('/api/transactions')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="card">
        <p className="text-center text-gray-400">Loading transaction history...</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Transaction History</h3>
      
      {!transactions || transactions.length === 0 ? (
        <p className="text-center text-gray-400 py-8">No transactions yet</p>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.tx_hash}
              className="p-4 bg-dark-700 rounded-lg hover:bg-dark-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {tx.status === 'confirmed' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : tx.status === 'failed' ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <Clock className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-semibold">{tx.action}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {tx.ai_reasoning_log && (
                    <div className="mt-2 p-3 bg-dark-800 rounded border-l-4 border-primary-500">
                      <p className="text-sm text-gray-300">
                        <span className="font-medium text-primary-500">AI Reasoning: </span>
                        {tx.ai_reasoning_log}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500 font-mono">
                    TX: {tx.tx_hash}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
