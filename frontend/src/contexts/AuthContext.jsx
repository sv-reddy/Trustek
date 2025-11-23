import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ Auth loading timeout - continuing without session')
        setLoading(false)
      }
    }, 5000) // 5 second timeout
    
    // Check active session
    const initAuth = async () => {
      try {
        console.log('🔍 Checking for existing session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Session check error:', error)
          setUser(null)
          setLoading(false)
          return
        }
        
        if (session?.user) {
          console.log('✅ Session found for user:', session.user.email)
          setUser(session.user)
          // Create profile if needed (non-blocking)
          ensureUserProfile(session.user).catch(err => 
            console.warn('Profile check failed:', err)
          )
        } else {
          console.log('ℹ️ No active session found')
          setUser(null)
        }
        
        if (mounted) {
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      } catch (error) {
        console.error('💥 Auth initialization error:', error)
        if (mounted) {
          setUser(null)
          setLoading(false)
          clearTimeout(loadingTimeout)
        }
      }
    }
    
    initAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔄 Auth state changed:', _event)
      if (mounted) {
        setUser(session?.user ?? null)
        
        // Create profile on sign in if it doesn't exist
        if (session?.user && _event === 'SIGNED_IN') {
          await ensureUserProfile(session.user).catch(err =>
            console.warn('Profile creation failed:', err)
          )
        }
      }
    })

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [])

  // Helper function to ensure user profile exists
  const ensureUserProfile = async (user) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('📝 Creating missing user profile for:', user.id)
        
        const phoneNumber = user.user_metadata?.phone_number || null
        
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: user.id,
              phone_number: phoneNumber,
            },
          ])
        
        if (insertError) {
          console.error('❌ Failed to create profile:', insertError)
        } else {
          console.log('✅ User profile created successfully')
        }
      } else if (existingProfile) {
        console.log('✅ User profile already exists')
      }
    } catch (error) {
      console.error('⚠️ Error ensuring user profile:', error)
    }
  }

  const signUp = async (email, password, phoneNumber) => {
    try {
      console.log('🔐 Starting signup process...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            phone_number: phoneNumber, // Store in user metadata as fallback
          }
        }
      })
      
      if (error) {
        console.error('❌ Signup auth error:', error)
        throw error
      }

      console.log('✅ User created in auth.users:', data.user?.id)

      // Create user profile immediately (email confirmation disabled)
      if (data.user) {
        console.log('📝 Creating user profile...')
        try {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([
              {
                user_id: data.user.id,
                phone_number: phoneNumber,
              },
            ])
          
          if (profileError) {
            console.warn('⚠️ Profile creation error:', profileError.message)
            // Don't throw - profile will be created on login
          } else {
            console.log('✅ User profile created successfully')
          }
        } catch (profileErr) {
          console.warn('⚠️ Profile creation failed (will retry on login):', profileErr)
        }
      }

      return data
    } catch (error) {
      console.error('💥 Signup error:', error)
      throw error
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔑 Attempting login for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.error('❌ Login failed:', error.message)
        throw error
      }
      
      console.log('✅ Login successful!')
      console.log('User ID:', data.user?.id)
      console.log('Session:', data.session ? 'Active' : 'None')
      
      return data
    } catch (error) {
      console.error('💥 Signin error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      console.log('🔓 Starting complete sign out...')
      
      // Sign out from Supabase (this invalidates the session on the server)
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      
      if (error) {
        console.error('❌ Supabase signout error:', error)
        // Continue anyway - we'll force clear everything
      }
      
      // Clear user state immediately
      setUser(null)
      
      console.log('🧹 Clearing all browser storage...')
      
      // Clear ALL localStorage
      localStorage.clear()
      
      // Clear ALL sessionStorage
      sessionStorage.clear()
      
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
      })
      
      // Clear IndexedDB if Supabase uses it
      if (window.indexedDB) {
        const dbs = await window.indexedDB.databases()
        dbs.forEach(db => {
          if (db.name && db.name.includes('supabase')) {
            window.indexedDB.deleteDatabase(db.name)
            console.log('  ✓ Deleted IndexedDB:', db.name)
          }
        })
      }
      
      console.log('✅ Complete sign out successful - all browser data cleared')
      
      return { error: null }
    } catch (error) {
      console.error('💥 SignOut error:', error)
      // Even on error, force clear everything
      setUser(null)
      localStorage.clear()
      sessionStorage.clear()
      return { error }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
