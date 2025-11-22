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
  const [address, setAddress] = useState(() => localStorage.getItem('starknet_address') || '')
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
        dappName: 'TrusTek Fusion',
        chainId: 'KATANA',
      })

      if (wallet?.isConnected) {
        setConnection(wallet)
        setAccount(wallet.account)
        setAddress(wallet.selectedAddress)
        
        // Persist to localStorage
        localStorage.setItem('starknet_address', wallet.selectedAddress)
        localStorage.setItem('wallet_connected', 'true')

        console.log('✅ Wallet connected:', wallet.selectedAddress)

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
      localStorage.removeItem('wallet_connected')
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
      localStorage.removeItem('starknet_address')
      localStorage.removeItem('wallet_connected')
      console.log('✅ Wallet disconnected')
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
      
      // Persist to localStorage
      localStorage.setItem('metamask_address', account)

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
    localStorage.removeItem('metamask_address')
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

  // Auto-connect wallet on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const savedAddress = localStorage.getItem('starknet_address')
      const wasConnected = localStorage.getItem('wallet_connected')
      const savedMetamask = localStorage.getItem('metamask_address')
      
      if (savedAddress && wasConnected === 'true' && !address && !isConnecting) {
        try {
          console.log('🔄 Attempting auto-connect for Starknet wallet...')
          const { wallet } = await connect({
            modalMode: 'neverAsk',
            modalTheme: 'dark',
            dappName: 'TrusTek Fusion',
            chainId: 'KATANA',
          })

          if (wallet?.isConnected) {
            setConnection(wallet)
            setAccount(wallet.account)
            setAddress(wallet.selectedAddress)
            console.log('✅ Auto-connected to:', wallet.selectedAddress)
          } else {
            console.log('⚠️ Auto-connect failed - wallet not connected')
            localStorage.removeItem('starknet_address')
            localStorage.removeItem('wallet_connected')
          }
        } catch (error) {
          console.log('❌ Auto-connect failed:', error.message)
          localStorage.removeItem('starknet_address')
          localStorage.removeItem('wallet_connected')
        }
      }
      
      if (savedMetamask && !metamaskAddress && !isMetamaskConnecting) {
        try {
          if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            if (accounts.length > 0) {
              setMetamaskAccount(accounts[0])
              setMetamaskAddress(accounts[0])
              console.log('✅ Auto-connected to MetaMask:', accounts[0])
            } else {
              localStorage.removeItem('metamask_address')
            }
          }
        } catch (error) {
          console.log('❌ MetaMask auto-connect failed:', error)
          localStorage.removeItem('metamask_address')
        }
      }
    }
    
    autoConnect()
  }, [])

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
