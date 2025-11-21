import { createContext, useContext, useEffect, useState } from 'react'
import { connect, disconnect } from 'starknetkit'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'
import api from '../lib/api'

const WalletContext = createContext({})

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const { user } = useAuth()
  const [connection, setConnection] = useState(null)
  const [account, setAccount] = useState(null)
  const [address, setAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      const { wallet } = await connect({
        modalMode: 'alwaysAsk',
        modalTheme: 'dark',
      })

      if (wallet?.isConnected) {
        setConnection(wallet)
        setAccount(wallet.account)
        setAddress(wallet.selectedAddress)

        // Save wallet address to user profile
        if (user) {
          await supabase
            .from('user_profiles')
            .update({ starknet_address: wallet.selectedAddress })
            .eq('user_id', user.id)
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      setConnection(null)
      setAccount(null)
      setAddress('')
    } catch (error) {
      console.error('Failed to disconnect wallet:', error)
      throw error
    }
  }

  const createSessionKey = async () => {
    if (!account) {
      throw new Error('No wallet connected')
    }

    try {
      // Request session key generation from backend
      const response = await api.post('/api/session-key/create', {
        user_id: user.id,
        wallet_address: address,
      })

      return response.data
    } catch (error) {
      console.error('Failed to create session key:', error)
      throw error
    }
  }

  const value = {
    connection,
    account,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    createSessionKey,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
