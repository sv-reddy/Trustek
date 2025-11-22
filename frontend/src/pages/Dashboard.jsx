import { useState, useEffect } from 'react'
import { 
  TrendingUp, TrendingDown, Activity, AlertCircle, Zap, PieChart, Wallet,
  Lock, Shield, CheckCircle, Eye, BarChart3, TrendingUp as TrendingUpIcon, 
  DollarSign, Gauge, Flame, Wind, User, Bell, Smartphone, Mail, Search
} from 'lucide-react'
import PortfolioDashboard from '../components/PortfolioDashboard'
import { useWallet } from '../contexts/WalletContext'

export default function Dashboard() {
  const { address, connectWallet, isConnecting } = useWallet()
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshTime, setRefreshTime] = useState(new Date())
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Portfolio Overview State
  const [portfolioData, setPortfolioData] = useState({
    tvl: 2450750.50,
    netWorthChange24h: { percent: 2.5, amount: 61268.76 },
    netWorthChange7d: { percent: 8.3, amount: 203450.25 },
    netWorthChange30d: { percent: 15.6, amount: 383000.00 },
    totalFeesAllTime: 45250.30,
    impermanentLossAllTime: { usd: -8450.25, percent: -0.34 },
    impermanentLoss24h: { usd: -125.50, percent: -0.005 },
    riskScore: 42
  })

  // Live Positions State
  const [positions, setPositions] = useState([
    {
      id: 1,
      poolName: 'ETH-USDC',
      feeTier: '0.05%',
      exchange: 'Ekubo',
      value: 850000.00,
      rangeMin: 1950.00,
      rangeMax: 2050.00,
      currentPrice: 2005.50,
      inRange: 95,
      apy7d: 12.5,
      projectedWeeklyYield: 2450.30,
      ilEstimate: { usd: -450.25, percent: -0.053 }
    },
    {
      id: 2,
      poolName: 'STRK-USDC',
      feeTier: '0.30%',
      exchange: 'JediSwap',
      value: 625000.00,
      rangeMin: 1.20,
      rangeMax: 1.80,
      currentPrice: 1.52,
      inRange: 88,
      apy7d: 18.3,
      projectedWeeklyYield: 2205.50,
      ilEstimate: { usd: -220.15, percent: -0.035 }
    },
    {
      id: 3,
      poolName: 'ETH-STRK',
      feeTier: '0.30%',
      exchange: 'MySwap',
      value: 975750.50,
      rangeMin: 1300,
      rangeMax: 2600,
      currentPrice: 1952.50,
      inRange: 92,
      apy7d: 14.8,
      projectedWeeklyYield: 2960.75,
      ilEstimate: { usd: -350.10, percent: -0.036 }
    }
  ])

  // Performance State
  const [performance, setPerformance] = useState({
    realizedPnLAllTime: { fees: 45250.30, gas: -3120.50, il: -8450.25, net: 33679.55 },
    realizedPnL30d: { fees: 12340.80, gas: -850.25, il: -2100.15, net: 9390.40 },
    annualizedROI: 21.3,
    sharpeRatio30d: 2.34,
    portfolioVolatility30d: 18.5,
    volatilityTrend: -0.5
  })

  // Network & Costs State
  const [networkData, setNetworkData] = useState({
    gasPrice: { fast: 0.000025, standard: 0.000018 },
    gasPriceUSD: { fast: 0.085, standard: 0.061 },
    estimatedGasRebalance: { wei: 250000, usd: 8.50 },
    avgGasPerAction30d: { wei: 42000, usd: 1.43 }
  })

  // Market Context State
  const [marketData, setMarketData] = useState({
    prices: {
      eth: { price: 0, change24h: 0, sparkline: [] },
      btc: { price: 0, change24h: 0, sparkline: [] },
      usdc: { price: 0, change24h: 0, sparkline: [] }
    },
    poolStats: [
      { pool: 'ETH-USDC', tvl: 125000000, tvl7dChange: 8.5, volume24h: 45000000, yourShare: 0.68 },
      { pool: 'BTC-USDC', tvl: 85000000, tvl7dChange: 12.3, volume24h: 32000000, yourShare: 0.73 },
      { pool: 'ETH-BTC', tvl: 92000000, tvl7dChange: -2.1, volume24h: 28000000, yourShare: 1.06 }
    ],
    sentiment: {
      cexDexRatio: 0.87,
      fundingRate: 0.045,
      fearGreedIndex: 68,
      trigger: false
    }
  })

  // Security & Compliance State
  const [securityData, setSecurityData] = useState({
    kycStatus: 'Verified',
    twoFaEnabled: true,
    biometricsEnabled: true,
    activeSessions: 2,
    lastSessionKey: '2 hours ago',
    notificationPrefs: {
      push: true,
      email: true,
      voice: true
    }
  })

  // Fetch real-time crypto prices from Yahoo Finance API
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/market/prices?symbols=ETH,BTC,USDC`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setMarketData(prev => ({
            ...prev,
            prices: {
              eth: {
                price: result.data.ETH?.price || 0,
                change24h: result.data.ETH?.change24h || 0,
                sparkline: prev.prices.eth.sparkline
              },
              btc: {
                price: result.data.BTC?.price || 0,
                change24h: result.data.BTC?.change24h || 0,
                sparkline: prev.prices.btc.sparkline
              },
              usdc: {
                price: result.data.USDC?.price || 1.00,
                change24h: result.data.USDC?.change24h || 0,
                sparkline: prev.prices.usdc.sparkline
              }
            }
          }))
        }
      } catch (error) {
        console.error('Error fetching crypto prices:', error)
      }
    }

    // Fetch immediately
    fetchPrices()

    // Fetch every 30 seconds
    const priceInterval = setInterval(fetchPrices, 30000)

    return () => clearInterval(priceInterval)
  }, [])

  // Simulate real-time updates with different frequencies
  useEffect(() => {
    const realTimeInterval = setInterval(() => {
      setPortfolioData(prev => ({
        ...prev,
        tvl: prev.tvl + (Math.random() - 0.5) * 5000,
        netWorthChange24h: {
          percent: prev.netWorthChange24h.percent + (Math.random() - 0.5) * 0.2,
          amount: prev.netWorthChange24h.amount + (Math.random() - 0.5) * 500
        }
      }))
      
      setPositions(prev => prev.map(pos => ({
        ...pos,
        value: pos.value + (Math.random() - 0.5) * 2000,
        currentPrice: pos.currentPrice * (1 + (Math.random() - 0.5) * 0.001),
        apy7d: pos.apy7d + (Math.random() - 0.5) * 0.5,
        projectedWeeklyYield: pos.projectedWeeklyYield + (Math.random() - 0.5) * 50
      })))

      setPerformance(prev => ({
        ...prev,
        realizedPnLAllTime: {
          ...prev.realizedPnLAllTime,
          net: prev.realizedPnLAllTime.net + (Math.random() - 0.5) * 100
        }
      }))

      setMarketData(prev => ({
        ...prev,
        sentiment: {
          ...prev.sentiment,
          cexDexRatio: 0.85 + Math.random() * 0.1,
          fundingRate: 0.04 + (Math.random() - 0.5) * 0.02,
          fearGreedIndex: Math.floor(50 + Math.random() * 40),
          trigger: Math.random() > 0.8
        }
      }))

      setRefreshTime(new Date())
    }, 1000)

    // Every 5 minutes update
    const fiveMinInterval = setInterval(() => {
      setPerformance(prev => ({
        ...prev,
        portfolioVolatility30d: Math.max(10, Math.min(40, prev.portfolioVolatility30d + (Math.random() - 0.5) * 2))
      }))
    }, 300000)

    // Every 15 minutes update market sentiment
    const fifteenMinInterval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        sentiment: {
          cexDexRatio: 0.85 + Math.random() * 0.1,
          fundingRate: 0.04 + (Math.random() - 0.5) * 0.02,
          fearGreedIndex: Math.floor(50 + Math.random() * 40),
          trigger: Math.random() > 0.8
        }
      }))
    }, 900000)

    return () => {
      clearInterval(realTimeInterval)
      clearInterval(fiveMinInterval)
      clearInterval(fifteenMinInterval)
    }
  }, [])

  // Handle crypto search with Yahoo Finance API
  const handleSearch = async (query) => {
    setSearchQuery(query)
    
    if (query.length < 2) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/market/search?q=${encodeURIComponent(query)}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setSearchResults(result.data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Utility Components
  const MetricCard = ({ 
    icon: Icon, 
    label, 
    value, 
    change, 
    unit = '', 
    trend = 'up',
    color = 'primary',
    size = 'default'
  }) => {
    const isPositive = change >= 0
    const sizeClasses = {
      default: 'p-4',
      sm: 'p-3',
      lg: 'p-6'
    }
    const iconSizes = {
      default: 'h-6 w-6',
      sm: 'h-5 w-5',
      lg: 'h-8 w-8'
    }
    
    return (
      <div className={`card ${sizeClasses[size]} flex items-start gap-4 hover:border-${color}-500 transition-colors`}>
        <div className={`bg-${color}-600/20 p-3 rounded-lg`}>
          <Icon className={`${iconSizes[size]} text-${color}-500`} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className={`text-xl font-bold ${size === 'lg' ? 'text-2xl' : ''} text-white`}>
            {value} {unit}
          </p>
          {change !== null && (
            <div className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(change).toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    )
  }

  const RangeVisualization = ({ min, max, current, unit = '' }) => {
    const range = max - min
    const position = ((current - min) / range) * 100
    const inRange = current >= min && current <= max
    
    return (
      <div className="space-y-2">
        <div className="relative h-8 bg-dark-700 rounded-lg overflow-hidden border border-dark-600">
          {/* Range background */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-green-500/30" />
          {/* Current position indicator */}
          <div 
            className={`absolute top-0 h-full w-0.5 ${inRange ? 'bg-green-500' : 'bg-red-500'}`}
            style={{ left: `${position}%` }}
          />
          {/* Labels */}
          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs text-gray-300">
            <span>{min.toFixed(2)}{unit}</span>
            <span>{max.toFixed(2)}{unit}</span>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Current: {current.toFixed(2)}{unit}</span>
          <span className={`${inRange ? 'text-green-500' : 'text-red-500'}`}>
            {inRange ? '✓ In Range' : '✗ Out of Range'}
          </span>
        </div>
      </div>
    )
  }

  const PositionCard = (position) => (
    <div key={position.id} className="card p-6 hover:border-primary-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{position.poolName}</h3>
          <p className="text-sm text-gray-400">{position.exchange} • {position.feeTier}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-primary-500">${(position.value / 1000).toFixed(1)}K</p>
          <p className="text-xs text-gray-500">{position.inRange}% in range</p>
        </div>
      </div>

      {/* Price Range Visualization */}
      <div className="mb-4">
        <RangeVisualization 
          min={position.rangeMin}
          max={position.rangeMax}
          current={position.currentPrice}
        />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-dark-700 p-2 rounded">
          <p className="text-xs text-gray-400">APY (7d)</p>
          <p className="text-sm font-bold text-green-500">{position.apy7d.toFixed(1)}%</p>
        </div>
        <div className="bg-dark-700 p-2 rounded">
          <p className="text-xs text-gray-400">Weekly Yield</p>
          <p className="text-sm font-bold text-white">${(position.projectedWeeklyYield).toFixed(0)}</p>
        </div>
        <div className={`bg-dark-700 p-2 rounded ${position.ilEstimate.usd < 0 ? 'border border-red-500/30' : 'border border-green-500/30'}`}>
          <p className="text-xs text-gray-400">IL Est.</p>
          <p className={`text-sm font-bold ${position.ilEstimate.usd < 0 ? 'text-red-500' : 'text-green-500'}`}>
            ${Math.abs(position.ilEstimate.usd).toFixed(0)}
          </p>
        </div>
      </div>

      <button className="w-full btn-secondary text-sm py-2">Manage Position</button>
    </div>
  )

  // Tab Navigation
  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors w-full ${
        activeTab === id 
          ? 'bg-primary-600 text-white' 
          : 'text-gray-400 hover:text-white hover:bg-dark-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )

  // Top Banner Component
  const TopBanner = () => (
    <div className="card bg-gradient-to-r from-dark-800 to-dark-700 p-6 flex items-center justify-between">
      <div className="grid grid-cols-4 gap-8 flex-1">
        <div>
          <p className="text-gray-400 text-sm">Total TVL</p>
          <p className="text-2xl font-bold text-white">${(portfolioData.tvl / 1000000).toFixed(2)}M</p>
          <p className={`text-xs mt-1 ${portfolioData.netWorthChange24h.percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioData.netWorthChange24h.percent >= 0 ? '↑' : '↓'} 
            {Math.abs(portfolioData.netWorthChange24h.percent).toFixed(2)}% (24h)
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">24h P&L</p>
          <p className={`text-2xl font-bold ${portfolioData.netWorthChange24h.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${Math.abs(portfolioData.netWorthChange24h.amount).toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {portfolioData.netWorthChange24h.amount >= 0 ? 'Profit' : 'Loss'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Risk Score</p>
          <p className="text-2xl font-bold text-white">{portfolioData.riskScore}</p>
          <p className="text-xs text-gray-500 mt-1">
            {portfolioData.riskScore < 30 ? 'Low Risk' : portfolioData.riskScore < 70 ? 'Medium Risk' : 'High Risk'}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Last Action</p>
          <p className="text-sm font-bold text-primary-500">✓ Rebalance verified</p>
          <p className="text-xs text-gray-500 mt-1">ZK Proof confirmed</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Crypto Search Bar - Enlarged */}
          <div className="relative flex-1 max-w-4xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-dark-700 text-white pl-14 pr-6 py-4 text-lg rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none w-full"
            />
            
            {/* Search Results Dropdown */}
            {searchQuery && (searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full mt-2 w-full bg-dark-800 border border-dark-600 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-pulse">Searching...</div>
                  </div>
                ) : (
                  <>
                    {searchResults.map((crypto, idx) => (
                      <div
                        key={idx}
                        className="p-3 hover:bg-dark-700 cursor-pointer border-b border-dark-700 last:border-b-0"
                        onClick={() => {
                          setSearchQuery('')
                          setSearchResults([])
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-white">{crypto.symbol}</p>
                            <p className="text-xs text-gray-400">Current Price</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-white">${crypto.price?.toFixed(6)}</p>
                            <p className={`text-xs ${crypto.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Last Update</p>
          <p className="text-xs text-gray-500">{refreshTime.toLocaleTimeString()}</p>
        </div>
        {!address && (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="btn-primary disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        )}
      </div>

      {/* Top Banner */}
      <TopBanner />

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-2 border-b border-dark-700 pb-2">
        <TabButton id="overview" label="Overview" icon={Activity} />
        <TabButton id="market" label="Market" icon={TrendingUpIcon} />
        <TabButton id="security" label="Security" icon={Shield} />
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Portfolio Overview Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-primary-500" />
              Portfolio Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard
                icon={Wallet}
                label="Total Portfolio Value"
                value={`$${(portfolioData.tvl / 1000000).toFixed(2)}M`}
                change={portfolioData.netWorthChange24h.percent}
                color="primary"
              />
              <MetricCard
                icon={TrendingUp}
                label="Net Worth Change (24h)"
                value={`$${Math.abs(portfolioData.netWorthChange24h.amount / 1000).toFixed(1)}K`}
                change={portfolioData.netWorthChange24h.percent}
                color={portfolioData.netWorthChange24h.amount >= 0 ? 'green' : 'red'}
              />
              <MetricCard
                icon={TrendingUp}
                label="Net Worth Change (7d)"
                value={`$${(portfolioData.netWorthChange7d.amount / 1000).toFixed(1)}K`}
                change={portfolioData.netWorthChange7d.percent}
                color="green"
              />
              <MetricCard
                icon={DollarSign}
                label="Total Fees Earned (All-time)"
                value={`$${(portfolioData.totalFeesAllTime / 1000).toFixed(1)}K`}
                change={5.2}
                color="primary"
              />
              <MetricCard
                icon={Flame}
                label="Impermanent Loss (All-time)"
                value={`$${Math.abs(portfolioData.impermanentLossAllTime.usd / 1000).toFixed(1)}K`}
                change={portfolioData.impermanentLossAllTime.percent}
                color="red"
              />
              <MetricCard
                icon={Gauge}
                label="Current Risk Score"
                value={portfolioData.riskScore}
                change={null}
                color="orange"
              />
            </div>
          </div>

          {/* 30 Day Period Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">30-Day Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card p-6">
                <p className="text-gray-400 text-sm mb-2">Net Worth Change</p>
                <p className={`text-3xl font-bold mb-3 ${portfolioData.netWorthChange30d.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolioData.netWorthChange30d.amount >= 0 ? '+' : '-'}${Math.abs(portfolioData.netWorthChange30d.amount / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-gray-500">{portfolioData.netWorthChange30d.percent.toFixed(1)}% change</p>
              </div>
              <div className="card p-6">
                <p className="text-gray-400 text-sm mb-2">Total Fees vs Costs</p>
                <p className="text-3xl font-bold text-primary-500 mb-3">${(performance.realizedPnL30d.fees / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-500">Collected in fees this month</p>
              </div>
              <div className="card p-6">
                <p className="text-gray-400 text-sm mb-2">IL This Period</p>
                <p className="text-3xl font-bold text-red-500 mb-3">${Math.abs(performance.realizedPnL30d.il / 1000).toFixed(1)}K</p>
                <p className="text-xs text-gray-500">Impermanent Loss</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERFORMANCE TAB */}
      {activeTab === 'market' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUpIcon className="h-6 w-6 text-primary-500" />
              Market Prices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(marketData.prices).map(([key, data]) => (
                <div key={key} className="card p-6">
                  <p className="text-gray-400 text-sm mb-2 uppercase">{key}</p>
                  <p className="text-3xl font-bold text-white mb-2">${data.price.toFixed(4)}</p>
                  <p className={`text-sm ${data.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {data.change24h >= 0 ? '↑' : '↓'} {Math.abs(data.change24h).toFixed(2)}% (24h)
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Pool Stats */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Liquidity Pool Stats</h3>
            <div className="space-y-3">
              {marketData.poolStats.map((pool, idx) => (
                <div key={idx} className="card p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-white">{pool.pool}</p>
                      <p className="text-sm text-gray-400">
                        TVL: ${(pool.tvl / 1000000).toFixed(1)}M 
                        <span className={pool.tvl7dChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {' '}({pool.tvl7dChange >= 0 ? '+' : ''}{pool.tvl7dChange.toFixed(1)}% 7d)
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">24h Vol: ${(pool.volume24h / 1000000).toFixed(1)}M</p>
                      <p className="font-bold text-primary-500">Your Share: {pool.yourShare.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Sentiment */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Market Sentiment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card p-4">
                <p className="text-gray-400 text-sm mb-2">CEX/DEX Ratio</p>
                <p className="text-2xl font-bold text-white">{marketData.sentiment.cexDexRatio.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Lower = more DEX activity</p>
              </div>
              <div className="card p-4">
                <p className="text-gray-400 text-sm mb-2">Funding Rate</p>
                <p className={`text-2xl font-bold ${marketData.sentiment.fundingRate > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {(marketData.sentiment.fundingRate * 100).toFixed(3)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Leverage market state</p>
              </div>
              <div className={`card p-4 ${marketData.sentiment.fearGreedIndex > 70 ? 'border-red-500' : 'border-green-500'}`}>
                <p className="text-gray-400 text-sm mb-2">Fear & Greed Index</p>
                <p className="text-2xl font-bold text-white">{marketData.sentiment.fearGreedIndex}</p>
                <p className={`text-xs mt-1 ${marketData.sentiment.fearGreedIndex > 70 ? 'text-red-500' : marketData.sentiment.fearGreedIndex < 30 ? 'text-green-500' : 'text-yellow-500'}`}>
                  {marketData.sentiment.fearGreedIndex > 70 ? 'Greed' : marketData.sentiment.fearGreedIndex < 30 ? 'Fear' : 'Neutral'}
                </p>
              </div>
              {marketData.sentiment.trigger && (
                <div className="card p-4 border-orange-500 bg-orange-500/10">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-orange-500 font-bold">Market Alert</p>
                      <p className="text-xs text-gray-300">Sentiment threshold triggered</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SECURITY & COMPLIANCE TAB */}
      {activeTab === 'security' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-500" />
              Security & Compliance
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* KYC Status */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm mb-1">KYC Status</p>
                    <p className="text-lg font-bold text-white">{securityData.kycStatus}</p>
                  </div>
                </div>
              </div>

              {/* 2FA Status */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${securityData.twoFaEnabled ? 'bg-green-500/20' : 'bg-gray-700/20'}`}>
                    <Lock className={`h-5 w-5 ${securityData.twoFaEnabled ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">2FA Authentication</p>
                    <p className={`text-lg font-bold ${securityData.twoFaEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                      {securityData.twoFaEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Biometrics */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${securityData.biometricsEnabled ? 'bg-green-500/20' : 'bg-gray-700/20'}`}>
                    <User className={`h-5 w-5 ${securityData.biometricsEnabled ? 'text-green-500' : 'text-gray-500'}`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Biometric Auth</p>
                    <p className={`text-lg font-bold ${securityData.biometricsEnabled ? 'text-green-500' : 'text-gray-500'}`}>
                      {securityData.biometricsEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <Smartphone className="h-8 w-8 text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active Sessions</p>
                    <p className="text-lg font-bold text-white">{securityData.activeSessions}</p>
                    <p className="text-xs text-gray-500 mt-1">Last key: {securityData.lastSessionKey}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-300">Push Notifications</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${securityData.notificationPrefs.push ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/20 text-gray-500'}`}>
                    {securityData.notificationPrefs.push ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-300">Email Alerts</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${securityData.notificationPrefs.email ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/20 text-gray-500'}`}>
                    {securityData.notificationPrefs.email ? 'ON' : 'OFF'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary-500" />
                    <span className="text-gray-300">Voice Alerts</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${securityData.notificationPrefs.voice ? 'bg-green-500/20 text-green-500' : 'bg-gray-700/20 text-gray-500'}`}>
                    {securityData.notificationPrefs.voice ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Overview Component */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <PortfolioDashboard />
        </div>
      )}
    </div>
  )
}