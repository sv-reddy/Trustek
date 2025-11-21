/**
 * Contract interaction utilities
 * Handles communication between frontend, backend, and Starknet contracts
 */
import api from './api'

/**
 * Get deployed contract addresses and network info
 */
export async function getContractInfo() {
  try {
    const response = await api.get('/api/contracts/info')
    return response.data
  } catch (error) {
    console.error('Failed to get contract info:', error)
    throw error
  }
}

/**
 * Get vault balance for a user address
 */
export async function getVaultBalance(userAddress) {
  try {
    const response = await api.post('/api/contracts/vault/balance', {
      user_address: userAddress
    })
    return response.data
  } catch (error) {
    console.error('Failed to get vault balance:', error)
    throw error
  }
}

/**
 * Deposit funds to vault
 * @param {string} userAddress - User's Starknet address
 * @param {string} amount - Amount in wei (as string)
 * @param {Function} executeTransaction - Function from WalletContext to execute transaction
 */
export async function depositToVault(userAddress, amount, executeTransaction) {
  try {
    // Get transaction data from backend
    const response = await api.post('/api/contracts/vault/deposit', {
      user_address: userAddress,
      amount: parseInt(amount)
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to prepare deposit')
    }

    const { transaction } = response.data

    // Execute transaction through wallet
    const result = await executeTransaction(
      transaction.contract_address,
      transaction.entrypoint,
      transaction.calldata
    )

    return result
  } catch (error) {
    console.error('Deposit failed:', error)
    throw error
  }
}

/**
 * Withdraw funds from vault
 */
export async function withdrawFromVault(userAddress, amount, executeTransaction) {
  try {
    const response = await api.post('/api/contracts/vault/withdraw', {
      user_address: userAddress,
      amount: parseInt(amount)
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to prepare withdrawal')
    }

    const { transaction } = response.data

    const result = await executeTransaction(
      transaction.contract_address,
      transaction.entrypoint,
      transaction.calldata
    )

    return result
  } catch (error) {
    console.error('Withdrawal failed:', error)
    throw error
  }
}

/**
 * Create session key
 */
export async function createSessionKey(userAddress, expiryDays, executeTransaction) {
  try {
    const response = await api.post('/api/contracts/session-key/create', {
      user_address: userAddress,
      expiry_days: expiryDays || 30
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to prepare session key creation')
    }

    const { transaction } = response.data

    const result = await executeTransaction(
      transaction.contract_address,
      transaction.entrypoint,
      transaction.calldata
    )

    return result
  } catch (error) {
    console.error('Session key creation failed:', error)
    throw error
  }
}

/**
 * Validate session key
 */
export async function validateSessionKey(sessionKey) {
  try {
    const response = await api.post('/api/contracts/session-key/validate', {
      session_key: sessionKey
    })
    return response.data
  } catch (error) {
    console.error('Session key validation failed:', error)
    throw error
  }
}

/**
 * Open trading position
 */
export async function openPosition(params, executeTransaction) {
  try {
    const response = await api.post('/api/contracts/position/open', {
      user_address: params.userAddress,
      pool_id: params.poolId,
      amount: params.amount,
      min_price: params.minPrice,
      max_price: params.maxPrice
    })

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to prepare position opening')
    }

    const { transaction } = response.data

    const result = await executeTransaction(
      transaction.contract_address,
      transaction.entrypoint,
      transaction.calldata
    )

    return result
  } catch (error) {
    console.error('Position opening failed:', error)
    throw error
  }
}

/**
 * Get position details
 */
export async function getPosition(positionId) {
  try {
    const response = await api.post('/api/contracts/position/get', {
      position_id: positionId
    })
    return response.data
  } catch (error) {
    console.error('Failed to get position:', error)
    throw error
  }
}

/**
 * Convert ETH amount to wei
 */
export function ethToWei(ethAmount) {
  return (BigInt(Math.floor(ethAmount * 1e18))).toString()
}

/**
 * Convert wei to ETH
 */
export function weiToEth(weiAmount) {
  return Number(BigInt(weiAmount)) / 1e18
}
