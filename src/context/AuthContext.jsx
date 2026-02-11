import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../config/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profileExists, setProfileExists] = useState(false)
  
  // TEMPORARY: Using hardcoded keys (matching supabase.js and databaseService.js)
  // TODO: Replace with environment variables after debugging
  const supabaseUrl = "https://rrlnkyzhxwsnlfemkzvy.supabase.co"
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJybG5reXpoeHdzbmxmZW1renZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTU1MDIsImV4cCI6MjA4MDc3MTUwMn0._XgghTRQAgRfxYjB3JAr2TWg2iHSzrsWC7qt8BkltYs"
  
  // Original environment variable approach (commented out for debugging):
  // const devAuth = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
  const devAuth = !supabaseUrl || !supabaseKey

  // Define checkProfileExists with useCallback to make it stable
  const checkProfileExists = useCallback(async (userId) => {
    if (devAuth) {
      const raw = localStorage.getItem(`dev_profile_${userId}`)
      const exists = !!raw
      setProfileExists(exists)
      return exists
    }
    console.log('[checkProfileExists] Querying profiles for user.id:', userId, typeof userId)
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()
    console.log('[checkProfileExists] Raw data:', data)
    console.log('[checkProfileExists] Raw error:', error ? { message: error.message, code: error.code, details: error.details } : null)
    if (error) {
      if (error.code === 'PGRST116') {
        console.warn('[checkProfileExists] PGRST116: No rows returned (profile row may not exist or RLS filtered all rows)')
      } else if (error.code === '42501') {
        console.warn('[checkProfileExists] 42501: Permission denied (RLS policy likely blocking SELECT)')
      }
      setProfileExists(false)
      return false
    }
    const exists = !!data
    setProfileExists(exists)
    return exists
  }, [devAuth])

  useEffect(() => {
    let authStateChangeResult = null
    
    try {
      if (devAuth) {
        const raw = localStorage.getItem('dev_user')
        const u = raw ? JSON.parse(raw) : null
        setUser(u)
        ;(async () => {
          if (u) {
            try {
              await checkProfileExists(u.id)
            } catch {
              setProfileExists(false)
            }
          } else {
            setProfileExists(false)
          }
          setLoading(false)
        })()
        return
      }
      
      // If Supabase is available, clear any dev user data
      const devUser = localStorage.getItem('dev_user')
      if (devUser) {
        try {
          const devUserData = JSON.parse(devUser)
          // If it's a dev user ID (starts with "dev-"), clear it
          if (devUserData?.id?.startsWith('dev-')) {
            console.log("🧹 Clearing dev user data - Supabase is now available")
            localStorage.removeItem('dev_user')
            localStorage.removeItem(`dev_profile_${devUserData.id}`)
            localStorage.removeItem(`dev_settings_${devUserData.id}`)
          }
        } catch (err) {
          console.warn('Error clearing dev user data:', err)
        }
      }
      
      supabase.auth.getUser()
        .then(async ({ data }) => {
          const u = data?.user || null
          setUser(u)
          if (u) {
            try {
              await checkProfileExists(u.id)
            } catch {
              setProfileExists(false)
            }
          } else {
            setProfileExists(false)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error('Error getting user:', err)
          setLoading(false)
        })
      
      authStateChangeResult = supabase.auth.onAuthStateChange((_event, session) => {
        const u = session?.user || null
        setUser(u)
        if (u) {
          checkProfileExists(u.id).then(v => setProfileExists(v)).catch(() => setProfileExists(false))
        }
      })
    } catch (err) {
      console.error('Error in AuthProvider useEffect:', err)
      setLoading(false)
    }
    
    return () => {
      // Safely unsubscribe from auth state changes
      if (authStateChangeResult?.data?.subscription) {
        try {
          authStateChangeResult.data.subscription.unsubscribe()
        } catch (err) {
          console.warn('Error unsubscribing from auth state:', err)
        }
      }
    }
  }, [devAuth, checkProfileExists])

  const login = async (email, password) => {
    if (devAuth) {
      const u = { id: `dev-${email}`, email }
      setUser(u)
      localStorage.setItem('dev_user', JSON.stringify(u))
      const exists = await checkProfileExists(u.id)
      setProfileExists(exists)
      return { data: { user: u }, error: null }
    }
    return supabase.auth.signInWithPassword({ email, password })
  }

  const signup = async (email, password) => {
    if (devAuth) {
      const u = { id: `dev-${email}`, email }
      // reset any previous dev profile/settings for same email to force onboarding
      try {
        localStorage.removeItem(`dev_profile_${u.id}`)
        localStorage.removeItem(`dev_settings_${u.id}`)
      } catch {}
      setUser(u)
      localStorage.setItem('dev_user', JSON.stringify(u))
      setProfileExists(false)
      return { data: { user: u }, error: null }
    }
    return supabase.auth.signUp({ email, password })
  }

  const logout = async () => {
    setUser(null)
    setProfileExists(null)
    try {
      localStorage.removeItem('last_path')
      localStorage.removeItem('signup_name')
    } catch {}
    if (devAuth) {
      const uid = user?.id
      try {
        localStorage.removeItem('dev_user')
        if (uid) {
          localStorage.removeItem(`dev_profile_${uid}`)
          localStorage.removeItem(`dev_settings_${uid}`)
        }
      } catch {}
      return { error: null }
    }
    return supabase.auth.signOut()
  }

  const loginWithGoogle = async () => {
    if (devAuth) {
      const u = { id: 'dev-google', email: 'google-user@example.com' }
      setUser(u)
      localStorage.setItem('dev_user', JSON.stringify(u))
      const exists = await checkProfileExists(u.id)
      setProfileExists(exists)
      return { data: { user: u }, error: null }
    }
    return supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  // Always provide a value object, even during initialization
  const value = { 
    user, 
    loading, 
    profileExists, 
    login, 
    signup, 
    logout, 
    loginWithGoogle, 
    checkProfileExists 
  }
  
  // Ensure value is never null
  if (!value) {
    console.error('AuthContext value is null - this should never happen')
  }
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}