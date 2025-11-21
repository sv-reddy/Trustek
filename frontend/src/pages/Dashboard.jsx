import { useState } from 'react'
import VoiceInterface from '../components/VoiceInterface'
import PortfolioDashboard from '../components/PortfolioDashboard'
import AuditLog from '../components/AuditLog'
import { useWallet } from '../contexts/WalletContext'

export default function Dashboard() {
  const { address, connectWallet, isConnecting } = useWallet()
  const [lastCommand, setLastCommand] = useState(null)

  const handleTranscription = (data) => {
    setLastCommand(data)
    console.log('Voice command:', data)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your liquidity positions with voice commands</p>
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Voice Interface */}
        <div className="lg:col-span-1">
          <VoiceInterface onTranscription={handleTranscription} />
          
          {lastCommand && (
            <div className="mt-4 p-4 bg-dark-800 rounded-lg border border-primary-500">
              <p className="text-sm text-gray-400 mb-1">Detected Action:</p>
              <p className="text-white font-medium">{lastCommand.action || 'Processing...'}</p>
            </div>
          )}
        </div>

        {/* Right Column - Portfolio and Audit Log */}
        <div className="lg:col-span-2 space-y-8">
          <PortfolioDashboard />
          <AuditLog />
        </div>
      </div>

      {/* Wallet Not Connected Warning */}
      {!address && (
        <div className="card bg-yellow-500/10 border-yellow-500">
          <p className="text-yellow-500 text-center">
            Please connect your Starknet wallet to start using voice commands
          </p>
        </div>
      )}
    </div>
  )
}
