import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useWallet } from '../contexts/WalletContext'
import { supabase } from '../lib/supabase'
import { 
  Key, Wallet, Phone, Mail, Shield, User, Bell, Clock, AlertCircle, 
  CheckCircle, XCircle, Edit2, Save, X, Copy, Download, Trash2, 
  Pause, Play, Lock, Unlock, Globe, Smartphone, Moon, Sun,
  TrendingUp, DollarSign, Activity, Settings, Eye, EyeOff, RefreshCw
} from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const { address, connectWallet, createSessionKey, isConnecting } = useWallet()
  const [profile, setProfile] = useState(null)
  const [sessionKeys, setSessionKeys] = useState([])
  const [loading, setLoading] = useState(true)
  const [creatingKey, setCreatingKey] = useState(false)
  const [editMode, setEditMode] = useState({})
  const [editValues, setEditValues] = useState({})
  const [agentPaused, setAgentPaused] = useState(false)
  const [portfolioData, setPortfolioData] = useState(null)

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchSessionKeys()
      fetchPortfolioData()
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
      
      // Initialize edit values with current profile data
      setEditValues({
        display_name: data?.display_name || '',
        phone_number: data?.phone_number || '',
        risk_profile: data?.risk_profile || 'Balanced',
        max_volatility: data?.max_volatility || 20,
        max_rebalance_size: data?.max_rebalance_size || 10,
        rebalance_frequency: data?.rebalance_frequency || 'Only on signal',
        min_price_move: data?.min_price_move || 2,
        voice_language: data?.voice_language || 'English',
        theme: data?.theme || 'dark',
        tts_enabled: data?.tts_enabled || false,
        sms_notifications: data?.sms_notifications || false,
        daily_summary: data?.daily_summary || false,
        trading_pairs: data?.trading_pairs || ['ETH/USDC', 'STRK/ETH']
      })
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
        .order('created_at', { ascending: false })

      if (error) throw error
      setSessionKeys(data || [])
    } catch (error) {
      console.error('Error fetching session keys:', error)
    }
  }

  const fetchPortfolioData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/portfolio?user_id=${user.id}`)
      const result = await response.json()
      if (result.success) {
        setPortfolioData(result.data)
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error)
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

  const handleRevokeSessionKey = async (keyId) => {
    if (!confirm('Are you sure you want to revoke this session key?')) return
    
    try {
      const { error } = await supabase
        .from('session_keys')
        .update({ status: 'revoked', revoked_at: new Date().toISOString() })
        .eq('id', keyId)
      
      if (error) throw error
      await fetchSessionKeys()
      alert('Session key revoked successfully')
    } catch (error) {
      console.error('Error revoking session key:', error)
      alert('Failed to revoke session key')
    }
  }

  const toggleEdit = (field) => {
    setEditMode(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleEditChange = (field, value) => {
    setEditValues(prev => ({ ...prev, [field]: value }))
  }

  const saveField = async (field) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ [field]: editValues[field], updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
      
      if (error) throw error
      
      setProfile(prev => ({ ...prev, [field]: editValues[field] }))
      setEditMode(prev => ({ ...prev, [field]: false }))
      alert('Updated successfully')
    } catch (error) {
      console.error('Error updating field:', error)
      alert('Failed to update')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const exportProfileData = () => {
    const data = {
      user_id: user.id,
      profile: profile,
      session_keys: sessionKeys,
      portfolio: portfolioData,
      exported_at: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trustek-profile-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  const toggleAgentPause = async () => {
    try {
      const newStatus = !agentPaused
      const { error } = await supabase
        .from('user_profiles')
        .update({ agent_paused: newStatus, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
      
      if (error) throw error
      setAgentPaused(newStatus)
      alert(newStatus ? 'Agent paused' : 'Agent resumed')
    } catch (error) {
      console.error('Error toggling agent:', error)
      alert('Failed to toggle agent status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-primary-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  const EditableField = ({ label, field, value, type = 'text', options = null, icon: Icon }) => (
    <div className="flex items-center gap-3 p-4 bg-dark-700/50 rounded-lg">
      {Icon && <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />}
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        {editMode[field] ? (
          <div className="flex items-center gap-2">
            {options ? (
              <select
                value={editValues[field]}
                onChange={(e) => handleEditChange(field, e.target.value)}
                className="bg-dark-600 text-white px-3 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none flex-1"
              >
                {options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : type === 'number' ? (
              <input
                type="number"
                value={editValues[field]}
                onChange={(e) => handleEditChange(field, parseFloat(e.target.value))}
                className="bg-dark-600 text-white px-3 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none flex-1"
              />
            ) : (
              <input
                type={type}
                value={editValues[field]}
                onChange={(e) => handleEditChange(field, e.target.value)}
                className="bg-dark-600 text-white px-3 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none flex-1"
              />
            )}
            <button onClick={() => saveField(field)} className="p-1 text-green-500 hover:bg-green-500/20 rounded">
              <Save className="h-4 w-4" />
            </button>
            <button onClick={() => toggleEdit(field)} className="p-1 text-red-500 hover:bg-red-500/20 rounded">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-white">{value || 'Not set'}</p>
            <button onClick={() => toggleEdit(field)} className="p-1 text-primary-500 hover:bg-primary-500/20 rounded">
              <Edit2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const InfoField = ({ label, value, icon: Icon, copyable = false }) => (
    <div className="flex items-center gap-3 p-4 bg-dark-700/50 rounded-lg">
      {Icon && <Icon className="h-5 w-5 text-gray-400 flex-shrink-0" />}
      <div className="flex-1">
        <p className="text-sm text-gray-400 mb-1">{label}</p>
        <p className="text-white break-all">{value || 'N/A'}</p>
      </div>
      {copyable && value && (
        <button onClick={() => copyToClipboard(value)} className="p-2 text-primary-500 hover:bg-primary-500/20 rounded">
          <Copy className="h-4 w-4" />
        </button>
      )}
    </div>
  )

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-gray-400 mt-1">Manage your identity, security, and agent preferences</p>
        </div>
        <button onClick={exportProfileData} className="btn-secondary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Core Identity & Verification */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <User className="h-6 w-6 text-primary-500" />
            Core Identity & Verification
          </h2>
          <div className="space-y-3">
            <InfoField label="User ID" value={user?.id} icon={Shield} copyable />
            <InfoField label="Starknet Wallet Address" value={address || profile?.starknet_address} icon={Wallet} copyable />
            <EditableField label="Registered Phone Number" field="phone_number" value={editValues.phone_number} type="tel" icon={Phone} />
            <InfoField 
              label="Phone Verification Status" 
              value={profile?.phone_verified ? `✓ Verified on ${new Date(profile.phone_verified_at).toLocaleDateString()}` : '✗ Not Verified'}
              icon={profile?.phone_verified ? CheckCircle : XCircle}
            />
            <EditableField label="Email Address" field="email" value={user?.email} type="email" icon={Mail} />
            <InfoField label="Account Created" value={new Date(user?.created_at).toLocaleDateString()} icon={Clock} />
          </div>
        </div>

        {/* 2. Agent Authorization & Session Keys */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="h-6 w-6 text-primary-500" />
              Agent Authorization
            </h2>
            <button
              onClick={handleCreateSessionKey}
              disabled={!address || creatingKey}
              className="btn-primary text-sm disabled:opacity-50"
            >
              {creatingKey ? 'Creating...' : '+ New Session Key'}
            </button>
          </div>
          
          {sessionKeys.length === 0 ? (
            <div className="text-center py-8 bg-dark-700/30 rounded-lg">
              <Key className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No active session keys</p>
              <p className="text-sm text-gray-500 mt-1">Create one to enable AI agent trading</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionKeys.slice(0, 1).map((key) => (
                <div key={key.id} className="p-4 bg-dark-700/50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      key.status === 'active' ? 'bg-green-500/20 text-green-500' :
                      key.status === 'expired' ? 'bg-orange-500/20 text-orange-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                      {key.status?.toUpperCase() || 'ACTIVE'}
                    </span>
                    <button
                      onClick={() => handleRevokeSessionKey(key.id)}
                      className="text-red-500 hover:bg-red-500/20 px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Revoke
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-400">Created</p>
                      <p className="text-white">{new Date(key.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="text-white">{new Date(key.expiry_timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Permissions</p>
                    <p className="text-white text-sm">Max {profile?.max_rebalance_size || 10}% position shift, {editValues.trading_pairs?.join(', ')}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Permission Hash</p>
                    <p className="text-white text-xs font-mono break-all">{key.permission_hash || 'N/A'}</p>
                  </div>
                </div>
              ))}
              
              {sessionKeys.slice(1, 4).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-400 mb-2">Revocation History (Last 3)</p>
                  <div className="space-y-2">
                    {sessionKeys.filter(k => k.status === 'revoked').slice(0, 3).map((key) => (
                      <div key={key.id} className="text-xs text-gray-500 flex justify-between">
                        <span>Revoked on {new Date(key.revoked_at).toLocaleDateString()}</span>
                        <span className="text-red-500">●</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Security & Recovery Controls */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            Security & Recovery Controls
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                {agentPaused ? <Pause className="h-5 w-5 text-orange-500" /> : <Play className="h-5 w-5 text-green-500" />}
                <div>
                  <p className="text-white font-medium">Agent Status</p>
                  <p className="text-sm text-gray-400">{agentPaused ? 'Paused' : 'Active'}</p>
                </div>
              </div>
              <button
                onClick={toggleAgentPause}
                className={`px-4 py-2 rounded font-medium ${
                  agentPaused 
                    ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' 
                    : 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30'
                }`}
              >
                {agentPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            <button className="w-full p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 hover:bg-red-500/20 flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Disable Agent Permanently
            </button>

            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Two-Factor Authentication</p>
              <div className="flex items-center justify-between">
                <span className="text-white">Not Enabled</span>
                <button className="text-primary-500 text-sm hover:underline">Enable 2FA</button>
              </div>
            </div>

            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Active Sessions</p>
              <div className="flex items-center justify-between">
                <span className="text-white">2 devices</span>
                <button className="text-red-500 text-sm hover:underline">Sign Out All</button>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Portfolio & Activity Overview */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Wallet className="h-6 w-6 text-primary-500" />
            Portfolio & Activity Overview
          </h2>
          <div className="space-y-3">
            <InfoField 
              label="Total Value Locked (TVL)" 
              value={portfolioData ? `$${portfolioData.vault_balance_usd?.toFixed(2)}` : 'Loading...'} 
              icon={DollarSign}
            />
            <InfoField 
              label="Current Positions" 
              value={portfolioData?.positions?.length || 0} 
              icon={Activity}
            />
            <InfoField 
              label="Agent Performance (P&L)" 
              value={portfolioData ? `${portfolioData.pnl_percentage >= 0 ? '+' : ''}${portfolioData.pnl_percentage?.toFixed(2)}%` : 'N/A'} 
              icon={TrendingUp}
            />
            <InfoField 
              label="Total Rebalances" 
              value="47" 
              icon={RefreshCw}
            />
            <InfoField 
              label="Last Agent Action" 
              value="2 hours ago" 
              icon={Clock}
            />
            <button className="w-full p-3 bg-primary-500/20 text-primary-500 rounded-lg hover:bg-primary-500/30 flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />
              View Full Transaction Log
            </button>
          </div>
        </div>

        {/* 6. Voice & Notification Preferences */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary-500" />
            Voice & Notification Preferences
          </h2>
          <div className="space-y-3">
            <EditableField 
              label="Voice Language" 
              field="voice_language" 
              value={editValues.voice_language} 
              options={['English', 'Spanish', 'French', 'German', 'Chinese']}
              icon={Globe}
            />
            
            <div className="p-4 bg-dark-700/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <span className="text-white text-sm">SMS Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editValues.sms_notifications} onChange={(e) => handleEditChange('sms_notifications', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-white text-sm">Daily Voice Summary</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={editValues.daily_summary} onChange={(e) => handleEditChange('daily_summary', e.target.checked)} className="sr-only peer" />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-white text-sm">Confirm High-Impact Actions</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Personalization & Display */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary-500" />
            Personalization & Display
          </h2>
          <div className="space-y-3">
            <EditableField 
              label="Display Name" 
              field="display_name" 
              value={editValues.display_name} 
              icon={User}
            />
            
            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Profile Picture</p>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-500" />
                </div>
                <button className="text-primary-500 text-sm hover:underline">Upload New</button>
              </div>
            </div>

            <EditableField 
              label="Theme Preference" 
              field="theme" 
              value={editValues.theme} 
              options={['Dark', 'Light']}
              icon={editValues.theme === 'Dark' ? Moon : Sun}
            />

            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Dashboard Layout</p>
              <div className="flex gap-2">
                <button className="flex-1 p-2 bg-primary-500/20 text-primary-500 rounded border border-primary-500 text-sm">Compact</button>
                <button className="flex-1 p-2 bg-dark-600 text-gray-400 rounded text-sm">Detailed</button>
              </div>
            </div>
          </div>
        </div>

        {/* 8. Advanced / Developer */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary-500" />
            Advanced / Developer Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoField 
              label="Raw Starknet Account Address" 
              value={address || profile?.starknet_address} 
              icon={Wallet}
              copyable
            />
            <InfoField 
              label="Session Key Public Key" 
              value={sessionKeys[0]?.public_key ? `${sessionKeys[0].public_key.slice(0, 20)}...` : 'N/A'} 
              icon={Key}
              copyable
            />
            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">API Access</p>
              <span className="px-3 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">Coming Soon</span>
            </div>
            <div className="p-4 bg-dark-700/50 rounded-lg">
              <p className="text-sm text-gray-400 mb-2">Contract Version</p>
              <span className="text-white text-sm">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Security Notice</p>
            <p className="text-blue-300 text-sm mt-1">
              Session keys enable automated trading within predefined limits. They can be revoked at any time. 
              Your wallet signature is required for all permission changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
