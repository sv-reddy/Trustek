import { Wallet, LogOut, Copy, Check, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useWallet } from '../contexts/WalletContext'

export default function WalletButton() {
  const { address, connectWallet, disconnectWallet, isConnecting } = useWallet()
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  if (!address) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/80 backdrop-blur-sm border border-gray-700 hover:border-blue-500 text-white rounded-lg font-semibold transition-all"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <code className="text-sm">{formatAddress(address)}</code>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
              <code className="text-sm text-white font-mono block">{address}</code>
            </div>

            <div className="p-2">
              <button
                onClick={copyAddress}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>

              <a
                href={`https://voyager.online/contract/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View on Voyager</span>
              </a>

              <div className="border-t border-gray-700 my-2" />

              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
