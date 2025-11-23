import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // Don't persist session - user must login each time
    autoRefreshToken: false, // Don't auto-refresh tokens
    detectSessionInUrl: true,
    storage: undefined, // Don't use any storage
  }
})
