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

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      console.log('🔄 Connecting wallet...')
      
      // Check if starknetkit is available
      if (typeof connect !== 'function') {
        throw new Error('StarknetKit not loaded properly. Please refresh the page.')
      }

      const result = await connect({
        modalMode: 'alwaysAsk',
        modalTheme: 'dark',
        dappName: 'TrusTek Fusion',
        webWalletUrl: 'https://web.argent.xyz',
        argentMobileOptions: {
          dappName: 'TrusTek Fusion',
          url: window.location.hostname,
        },
      })

      console.log('📦 Connection result received')
      
      const { wallet } = result

      if (!wallet) {
        throw new Error('No wallet returned. Connection may have been cancelled.')
      }

      console.log('📦 Wallet object received')
      console.log('📦 Wallet keys:', Object.keys(wallet))
      console.log('📦 Wallet.id:', wallet.id)
      console.log('📦 Wallet.name:', wallet.name)
      console.log('📦 Wallet.icon:', wallet.icon)
      console.log('📦 Wallet.selectedAddress:', wallet.selectedAddress)
      console.log('📦 Wallet.account exists:', !!wallet.account)
      
      if (wallet.account) {
        console.log('📦 Account type:', typeof wallet.account)
        console.log('📦 Account keys:', Object.keys(wallet.account))
        console.log('📦 Account.address:', wallet.account.address)
      }

      // Try to get address from multiple possible locations
      let walletAddress = null
      
      // Method 1: selectedAddress
      if (wallet.selectedAddress) {
        walletAddress = wallet.selectedAddress
        console.log('✅ Found address via selectedAddress:', walletAddress)
      }
      // Method 2: account.address
      else if (wallet.account && wallet.account.address) {
        walletAddress = wallet.account.address
        console.log('✅ Found address via account.address:', walletAddress)
      }
      // Method 3: direct address property
      else if (wallet.address) {
        walletAddress = wallet.address
        console.log('✅ Found address via address:', walletAddress)
      }
      // Method 4: Check if account itself is a string (some wallets do this)
      else if (typeof wallet.account === 'string') {
        walletAddress = wallet.account
        console.log('✅ Found address via account string:', walletAddress)
      }
      // Method 5: Try calling getAddress if it's a function
      else if (wallet.account && typeof wallet.account.getAddress === 'function') {
        try {
          walletAddress = await wallet.account.getAddress()
          console.log('✅ Found address via getAddress():', walletAddress)
        } catch (e) {
          console.warn('⚠️ getAddress() failed:', e)
        }
      }
      // Method 6: Try the enable method to get accounts
      else if (typeof wallet.enable === 'function') {
        try {
          const accounts = await wallet.enable()
          if (accounts && accounts.length > 0) {
            walletAddress = accounts[0]
            console.log('✅ Found address via enable():', walletAddress)
          }
        } catch (e) {
          console.warn('⚠️ enable() failed:', e)
        }
      }
      
      if (!walletAddress) {
        console.error('❌ Could not find wallet address')
        console.error('Available wallet properties:', Object.keys(wallet))
        if (wallet.account) {
          console.error('Available account properties:', Object.keys(wallet.account))
          // Try to log account values without serializing BigInt
          for (const key of Object.keys(wallet.account)) {
            try {
              const value = wallet.account[key]
              if (typeof value !== 'function' && typeof value !== 'bigint') {
                console.error(`  ${key}:`, value)
              } else {
                console.error(`  ${key}: [${typeof value}]`)
              }
            } catch (e) {
              console.error(`  ${key}: [error reading]`)
            }
          }
        }
        throw new Error('Could not retrieve wallet address. Please ensure your wallet is unlocked and try again.')
      }
      
      // Normalize address (remove any whitespace, ensure it's a string)
      walletAddress = String(walletAddress).trim()
      
      console.log('📍 Final wallet address:', walletAddress)
      
      // Set wallet state
      setConnection(wallet)
      setAccount(wallet.account)
      setAddress(walletAddress)
      
      // Persist to localStorage
      localStorage.setItem('starknet_address', walletAddress)
      localStorage.setItem('wallet_connected', 'true')

      console.log('✅ Wallet connected successfully!')

      // Save wallet address to user profile (non-blocking)
      if (user) {
        setTimeout(async () => {
          try {
            await supabase
              .from('user_profiles')
              .update({ starknet_address: walletAddress })
              .eq('user_id', user.id)
            console.log('✅ Saved to database')
          } catch (dbError) {
            console.warn('⚠️ Failed to save to database:', dbError)
          }
        }, 100)
      }
      
      return wallet
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error)
      console.error('❌ Error message:', error.message)
      // Clean up on error
      setConnection(null)
      setAccount(null)
      setAddress('')
      localStorage.removeItem('wallet_connected')
      localStorage.removeItem('starknet_address')
      
      // Re-throw with more user-friendly message
      if (error.message?.includes('User rejected') || error.message?.includes('User abort')) {
        throw new Error('Connection cancelled by user')
      }
      if (error.message?.includes('BigInt')) {
        throw new Error('Wallet connection succeeded but there was an internal error. Please refresh the page and try again.')
      }
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



  // Auto-connect wallet on mount if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      const savedAddress = localStorage.getItem('starknet_address')
      const wasConnected = localStorage.getItem('wallet_connected')
      
      if (savedAddress && wasConnected === 'true' && !address && !isConnecting) {
        try {
          console.log('🔄 Attempting auto-connect for Starknet wallet...')
          const { wallet } = await connect({
            modalMode: 'neverAsk',
            modalTheme: 'dark',
            dappName: 'TrusTek Fusion',
          })

          if (wallet && wallet.isConnected) {
            setConnection(wallet)
            setAccount(wallet.account)
            const walletAddress = wallet.selectedAddress || wallet.account?.address
            if (walletAddress) {
              setAddress(walletAddress)
              console.log('✅ Auto-connected to:', walletAddress)
            }
          } else {
            console.log('⚠️ Auto-connect failed - wallet not connected')
            localStorage.removeItem('starknet_address')
            localStorage.removeItem('wallet_connected')
          }
        } catch (error) {
          console.log('❌ Auto-connect failed:', error.message)
          // Don't clear localStorage on auto-connect failure - user might need to manually connect
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
