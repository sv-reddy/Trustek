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
  const [network, setNetwork] = useState(null)

  // Devnet configuration
  const DEVNET_CONFIG = {
    chainId: '0x534e5f5345504f4c4941', // SN_SEPOLIA
    chainName: 'Starknet Devnet',
    rpcUrl: 'http://192.168.137.128:5050'
  }

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (window?.starknet_braavos) {
          const wallet = window.starknet_braavos
          if (wallet.isConnected && wallet.selectedAddress) {
            setConnection(wallet)
            setAccount(wallet.account)
            setAddress(wallet.selectedAddress)
            
            // Get current network
            try {
              const currentNetwork = await wallet.request({ type: 'wallet_getCurrentNetwork' })
              setNetwork(currentNetwork)
            } catch (e) {
              console.log('Could not get current network')
            }
            
            // Update database
            if (user) {
              await supabase
                .from('user_profiles')
                .update({ starknet_address: wallet.selectedAddress })
                .eq('user_id', user.id)
            }
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
      }
    }

    checkConnection()

    // Listen for account and network changes
    const handleAccountChange = (accounts) => {
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
      } else {
        setAddress('')
        setConnection(null)
        setAccount(null)
      }
    }

    const handleNetworkChange = (networkData) => {
      setNetwork(networkData)
      console.log('Network changed:', networkData)
    }

    if (window?.starknet_braavos) {
      window.starknet_braavos.on('accountsChanged', handleAccountChange)
      window.starknet_braavos.on('networkChanged', handleNetworkChange)
    }

    return () => {
      if (window?.starknet_braavos) {
        window.starknet_braavos.off('accountsChanged', handleAccountChange)
        window.starknet_braavos.off('networkChanged', handleNetworkChange)
      }
    }
  }, [user])

  const connectWallet = async () => {
    try {
      setIsConnecting(true)
      
      // Check if Braavos extension is installed
      const isBraavosInstalled = window?.starknet_braavos !== undefined
      
      if (!isBraavosInstalled) {
        // Show installation prompt
        const shouldInstall = window.confirm(
          'Braavos wallet extension is not installed.\n\nClick OK to go to the Chrome Web Store and install Braavos.'
        )
        
        if (shouldInstall) {
          window.open('https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma', '_blank')
        }
        setIsConnecting(false)
        return
      }

      // Enable Braavos wallet
      await window.starknet_braavos.enable({ starknetVersion: 'v5' })
      
      // Get the wallet instance
      const wallet = window.starknet_braavos
      
      if (wallet.isConnected && wallet.selectedAddress) {
        setConnection(wallet)
        setAccount(wallet.account)
        setAddress(wallet.selectedAddress)

        // Get current network
        try {
          const currentNetwork = await wallet.request({ type: 'wallet_getCurrentNetwork' })
          setNetwork(currentNetwork)
          
          // Check if on devnet, if not, prompt to switch
          if (currentNetwork?.chainId !== DEVNET_CONFIG.chainId) {
            await switchToDevnet()
          }
        } catch (e) {
          console.log('Could not check network')
        }

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
      alert('Failed to connect to Braavos wallet. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const switchToDevnet = async () => {
    try {
      if (!window.starknet_braavos) return

      // Request network switch
      await window.starknet_braavos.request({
        type: 'wallet_addStarknetChain',
        params: {
          id: DEVNET_CONFIG.chainId,
          chainId: DEVNET_CONFIG.chainId,
          chainName: DEVNET_CONFIG.chainName,
          rpcUrls: [DEVNET_CONFIG.rpcUrl],
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          }
        }
      })

      console.log('Switched to devnet')
    } catch (error) {
      console.error('Failed to switch network:', error)
      alert('Please manually switch to the Devnet network in Braavos wallet.')
    }
  }

  const executeTransaction = async (contractAddress, entrypoint, calldata) => {
    if (!account || !window.starknet_braavos) {
      throw new Error('Wallet not connected')
    }

    try {
      // Execute transaction through Braavos
      const result = await account.execute({
        contractAddress,
        entrypoint,
        calldata
      })

      return {
        success: true,
        transaction_hash: result.transaction_hash
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      return {
        success: false,
        error: error.message
      }
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
    network,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToDevnet,
    executeTransaction,
    createSessionKey,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}
