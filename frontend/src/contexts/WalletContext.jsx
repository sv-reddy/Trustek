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
  // Starknet wallet state
  const [connection, setConnection] = useState(null)
  const [account, setAccount] = useState(null)
  const [address, setAddress] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  
  // MetaMask (Ethereum) wallet state
  const [metamaskAccount, setMetamaskAccount] = useState(null)
  const [metamaskAddress, setMetamaskAddress] = useState('')
  const [isMetamaskConnecting, setIsMetamaskConnecting] = useState(false)

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

  const connectMetaMask = async () => {
    try {
      setIsMetamaskConnecting(true)
      
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask extension.')
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      const account = accounts[0]
      setMetamaskAccount(account)
      setMetamaskAddress(account)

      // Get network info
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      console.log('Connected to chain:', chainId)

      // Save MetaMask address to user profile
      if (user) {
        await supabase
          .from('user_profiles')
          .update({ ethereum_address: account })
          .eq('user_id', user.id)
      }

      // Listen for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setMetamaskAccount(null)
          setMetamaskAddress('')
        } else {
          setMetamaskAccount(accounts[0])
          setMetamaskAddress(accounts[0])
        }
      })

      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })

      return account
    } catch (error) {
      console.error('Failed to connect MetaMask:', error)
      throw error
    } finally {
      setIsMetamaskConnecting(false)
    }
  }

  const disconnectMetaMask = () => {
    setMetamaskAccount(null)
    setMetamaskAddress('')
  }

  const switchEthereumNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      })
    } catch (error) {
      console.error('Failed to switch network:', error)
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
    // Starknet wallet
    connection,
    account,
    address,
    isConnecting,
    connectWallet,
    disconnectWallet,
    createSessionKey,
    
    // MetaMask (Ethereum) wallet
    metamaskAccount,
    metamaskAddress,
    isMetamaskConnecting,
    connectMetaMask,
    disconnectMetaMask,
    switchEthereumNetwork,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
