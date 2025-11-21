import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { supabase } from '../lib/supabase'
import { Key, Wallet, Phone, Mail } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { address, connectWallet, createSessionKey, isConnecting } = useWallet()
  const [profile, setProfile] = useState(null)
  const [sessionKeys, setSessionKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingKey, setCreatingKey] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchSessionKeys()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSessionKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('session_keys')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setSessionKeys(data || [])
    } catch (error) {
      console.error('Error fetching session keys:', error)
    }
  }

  const handleCreateSessionKey = async () => {
    if (!address) {
      alert('Please connect your wallet first')
      return
    }

    setCreatingKey(true)
    try {
      await createSessionKey()
      await fetchSessionKeys()
      alert('Session key created successfully!')
    } catch (error) {
      console.error('Error creating session key:', error)
      alert('Failed to create session key')
    } finally {
      setCreatingKey(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account and wallet connections</p>
      </div>

      {/* Profile Information */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Phone Number</p>
              <p className="text-white">{profile?.phone_number || 'Not set'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Starknet Wallet</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Wallet className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <p className="text-sm text-gray-400">Connected Wallet</p>
              <p className="text-white font-mono text-sm">
                {address || profile?.starknet_address || 'Not connected'}
              </p>
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
        </div>
      </div>

      {/* Session Keys */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Session Keys</h2>
          <button
            onClick={handleCreateSessionKey}
            disabled={!address || creatingKey}
            className="btn-primary disabled:opacity-50"
          >
            {creatingKey ? 'Creating...' : 'Create Session Key'}
          </button>
        </div>

        {sessionKeys.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No session keys. Create one to enable automated trading.
          </p>
        ) : (
          <div className="space-y-3">
            {sessionKeys.map((key) => (
              <div
                key={key.id}
                className="p-4 bg-dark-700 rounded-lg flex items-center gap-3"
              >
                <Key className="h-5 w-5 text-primary-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Expires: {new Date(key.expiry_timestamp).toLocaleDateString()}
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-500">
                  Active
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>Session Keys</strong> allow the AI agent to execute trades on your behalf within
          predefined limits. They are temporary and can be revoked at any time.
        </p>
      </div>
    </div>
  )
}
