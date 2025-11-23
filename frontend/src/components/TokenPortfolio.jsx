import { useState, useEffect } from 'react'
import { Wallet, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

export default function TokenPortfolio() {
  const { address, account, connectWallet, isConnecting, disconnectWallet } = useWallet()
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [marketPrices, setMarketPrices] = useState({})
  const [walletError, setWalletError] = useState(null)
  const [lastPriceFetch, setLastPriceFetch] = useState(0)

  useEffect(() => {
    // Always fetch tokens, even without wallet connected (for demo purposes)
    fetchTokens()
    
    // Refresh every 5 minutes (300000ms)
    const interval = setInterval(fetchTokens, 300000)
    return () => clearInterval(interval)
  }, [address])

  const fetchTokens = async (forceRefresh = false) => {
    try {
      setLoading(true)
      
      // Fetch from backend API
      const backendUrl = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000'
      
      // Fetch tokens
      const tokensResponse = await fetch(`${backendUrl}/api/tokens/`)
      if (!tokensResponse.ok) {
        throw new Error('Failed to fetch tokens')
      }
      const tokensData = await tokensResponse.json()
      
      // Only fetch prices if 5 minutes have passed or forced refresh
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000 // 5 minutes in milliseconds
      let pricesData = marketPrices
      
      if (forceRefresh || now - lastPriceFetch >= fiveMinutes || Object.keys(marketPrices).length === 0) {
        // Fetch real-time prices from Yahoo Finance via backend
        const symbols = tokensData.map(t => t.symbol).join(',')
        const pricesResponse = await fetch(`${backendUrl}/api/market/prices?symbols=${symbols}`)
        if (!pricesResponse.ok) {
          throw new Error('Failed to fetch prices')
        }
        const pricesResult = await pricesResponse.json()
        
        // Extract price data from response (API returns {success: true, data: {...}})
        pricesData = pricesResult.data || pricesResult
        
        // Update market prices state and last fetch time
        setMarketPrices(pricesData)
        setLastPriceFetch(now)
        console.log('✅ Prices fetched from Yahoo Finance at:', new Date(now).toLocaleTimeString())
      } else {
        const timeUntilNext = Math.ceil((fiveMinutes - (now - lastPriceFetch)) / 1000 / 60)
        console.log(`⏱️ Using cached prices. Next refresh in ${timeUntilNext} minute(s)`)
      }
      
      // Calculate values with real-time prices
      const tokensWithValues = tokensData.map(token => {
        const priceData = pricesData[token.symbol] || {}
        const price = priceData.price || 0
        const value = token.balance * price
        const change24h = priceData.change24h !== undefined ? priceData.change24h : null
        return {
          ...token,
          price,
          value,
          change24h
        }
      })

      const total = tokensWithValues.reduce((sum, token) => sum + token.value, 0)
      
      setTokens(tokensWithValues.sort((a, b) => b.value - a.value))
      setTotalValue(total)
    } catch (error) {
      console.error('Failed to fetch tokens:', error)
      // Set default tokens if fetch fails
      setTokens([])
      setTotalValue(0)
    } finally {
      setLoading(false)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 2000)
  }

  const handleConnectWallet = async () => {
    try {
      setWalletError(null)
      await connectWallet()
    } catch (error) {
      setWalletError(error.message || 'Failed to connect wallet')
    }
  }

  const handleDisconnectWallet = async () => {
    try {
      await disconnectWallet()
    } catch (error) {
      console.error('Disconnect error:', error)
    }
  }

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Token List */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Token Holdings</h3>
          <div className="flex items-center gap-3">
            {totalValue > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-xl font-bold text-white">{formatCurrency(totalValue)}</p>
              </div>
            )}
            {address && (
              <button
                onClick={() => fetchTokens(true)}
                disabled={loading}
                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors disabled:opacity-50"
                title="Force refresh prices (ignores 5-minute cache)"
              >
                <RefreshCw className={`w-5 h-5 text-blue-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {walletError && (
          <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{walletError}</p>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 text-gray-500 animate-spin" />
            <p className="text-gray-400">Loading portfolio from backend...</p>
          </div>
        ) : tokens.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No tokens found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 text-xs text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">Asset</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">24h Change</th>
                  <th className="px-4 py-3 text-right">Balance</th>
                  <th className="px-4 py-3 text-right">Value</th>
                  <th className="px-4 py-3 text-left">Contract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {tokens.map((token) => (
                  <tr
                    key={token.address}
                    className="hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">{token.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{token.symbol}</p>
                          <p className="text-xs text-gray-400">{token.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-white font-medium text-sm">{formatCurrency(token.price)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {token.change24h !== null && token.change24h !== undefined ? (
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${token.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {token.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-white text-sm">{token.balance.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{token.symbol}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-white font-semibold">{formatCurrency(token.value)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-gray-400 font-mono bg-gray-900/50 px-2 py-1 rounded">
                          {formatAddress(token.address)}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(token.address)
                          }}
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                          title="Copy contract address"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                        <a
                          href={`https://voyager.online/contract/${token.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-700/50 rounded transition-colors"
                          title="View on Voyager"
                        >
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </a>
                      </div>
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
