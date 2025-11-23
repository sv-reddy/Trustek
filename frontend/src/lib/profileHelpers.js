import { supabase } from '../lib/supabase'

/**
 * Check if user has completed their profile
 * @param {string} userId - User ID to check
 * @returns {Promise<boolean>} - True if profile is complete, false otherwise
 */
export const isProfileComplete = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('display_name, phone_number, risk_profile, trading_pairs')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.warn('Profile check error:', error)
      return false
    }

    // Check if essential fields are filled
    const isComplete = !!(
      data &&
      data.display_name &&
      data.phone_number &&
      data.risk_profile &&
      data.trading_pairs &&
      data.trading_pairs.length > 0
    )

    console.log('Profile complete check:', isComplete, data)
    return isComplete
  } catch (error) {
    console.error('Error checking profile completion:', error)
    return false
  }
}

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} - User profile or null
 */
export const getUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}
