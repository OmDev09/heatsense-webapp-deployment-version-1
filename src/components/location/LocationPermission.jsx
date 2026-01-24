// c:\Users\anush\Documents\trae_projects\HeatSenseAI Demo\heatwave-app\src\components\location\LocationPermission.jsx
import { useEffect, useState, useRef } from 'react'
import { MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import { getUserSettings, updateUserSettings, getUserProfile, logUserLocation, upsertProfile } from '../../services/databaseService.js'
import { supabase } from '../../config/supabase.js'

export default function LocationPermission() {
  const auth = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const devMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
  const hasLoggedLocation = useRef(false) // Track if location has been logged in this session

  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Wait for auth to finish loading
    if (!auth || auth.loading) {
      console.log('📍 LocationPermission: Waiting for auth to load...')
      return
    }
    
    const { user } = auth
    console.log('📍 LocationPermission: Auth loaded, user:', user ? user.id : 'null')
    
    // Only redirect to login if we're absolutely sure there's no user
    // Add a small delay to allow auth state to stabilize after navigation
    if (!user) {
      console.warn('⚠️ LocationPermission: No user in auth context, checking Supabase session directly...')
      // Check Supabase session directly as a fallback
      supabase.auth.getUser().then(({ data: sessionData, error: sessionError }) => {
        if (sessionError || !sessionData?.user) {
          console.error('❌ LocationPermission: No user in Supabase session either, redirecting to login')
          // Wait a bit more before redirecting to ensure auth context has time to update
          setTimeout(() => {
            navigate('/login', { replace: true })
          }, 1000)
        } else {
          console.log('✅ LocationPermission: Found user in Supabase session:', sessionData.user.id)
          // User exists in Supabase, auth context should update soon
          // Don't redirect, just wait
        }
      }).catch(() => {
        // If Supabase check fails, wait a bit then redirect
        setTimeout(() => {
          if (!auth?.user) {
            console.error('❌ LocationPermission: Supabase check failed and no user in context, redirecting to login')
            navigate('/login', { replace: true })
          }
        }, 1000)
      })
      return
    }
    
    // User exists, proceed with loading settings and profile
    console.log('✅ LocationPermission: User found, loading settings and profile...')
    getUserSettings(user.id).catch(() => {})
    getUserProfile(user.id).then(({ data }) => { 
      if (!data) {
        console.warn('⚠️ LocationPermission: No profile found, redirecting to profile')
        navigate('/profile', { replace: true })
      }
    }).catch(() => {})
  }, [auth, navigate])
  
  // CRITICAL FIX: Prevent crash if auth is still initializing
  // Check after all hooks are called
  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading location screen...</p>
        </div>
      </div>
    )
  }
  
  const { user } = auth
  
  // If no user after auth has loaded, show loading state instead of immediately redirecting
  // (The useEffect will handle the redirect with a delay to allow auth state to stabilize)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  const reverseGeocodeCity = async (lat, lon) => {
    const key = import.meta.env.VITE_OPENWEATHER_API_KEY
    if (key) {
      try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`)
        const data = await res.json()
        if (res.ok && Array.isArray(data) && data.length > 0) return data[0].name || 'Unknown'
        if (data && data.message) throw new Error(data.message)
      } catch {}
    }
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, { headers: { Accept: 'application/json' } })
    const j = await r.json()
    const a = j.address || {}
    return a.city || a.town || a.village || a.state || 'Unknown'
  }

  const onAllow = async () => {
    setError('')
    setLoading(true)
    try {
      // Check if geolocation is available
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser. Please use a modern browser or enable location services.')
        setLoading(false)
        return
      }

      // Request location permission
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            // Handle specific geolocation errors
            switch (err.code) {
              case err.PERMISSION_DENIED:
                reject(new Error('Location permission denied. Please allow location access in your browser settings and try again.'))
                break
              case err.POSITION_UNAVAILABLE:
                reject(new Error('Location information is unavailable. Please check your device location settings.'))
                break
              case err.TIMEOUT:
                reject(new Error('Location request timed out. Please try again.'))
                break
              default:
                reject(new Error('Unable to retrieve your location. Please try again.'))
            }
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, // Increased timeout to 15 seconds
            maximumAge: 0 // Don't use cached position
          }
        )
      })

      const { latitude, longitude } = pos.coords
      
      // Log location to employee_risk_logs ONCE (for B2B tracking)
      // Risk score and label can be null initially - just logging location
      // This will be updated with risk score when user reaches dashboard
      if (!hasLoggedLocation.current) {
        hasLoggedLocation.current = true
        try {
          const result = await logUserLocation(user.id, latitude, longitude, null, null)
          if (result.error) {
            console.error('❌ Failed to log location:', result.error)
            hasLoggedLocation.current = false // Reset on error to allow retry
          } else {
            console.log('✅ Location logged successfully (once from location screen)')
          }
        } catch (logError) {
          console.error('❌ Exception logging location:', logError)
          hasLoggedLocation.current = false // Reset on error to allow retry
          // Continue even if logging fails - don't block user flow
        }
      } else {
        console.log('⚠️ Location already logged, skipping duplicate log')
      }
      
      // Reverse geocode to get city name
      let city
      try {
        city = await reverseGeocodeCity(latitude, longitude)
      } catch (geocodeError) {
        console.error('Reverse geocoding error:', geocodeError)
        // Continue even if geocoding fails - use coordinates
        city = 'Unknown'
      }

      // Update user profile with city (using new schema)
      try {
        await upsertProfile(user.id, { home_city: city })
      } catch (profileError) {
        console.error('Profile update error:', profileError)
        // Continue even if profile update fails
      }

      // Update settings
      const payload = devMode ? { location_permission: true, lat: latitude, lon: longitude } : { location_permission: true }
      await updateUserSettings(user.id, payload)
      
      navigate('/dashboard')
    } catch (error) {
      // Show specific error message
      const errorMessage = error.message || 'Location permission denied or unavailable'
      setError(errorMessage)
      console.error('Location permission error:', error)
    } finally {
      setLoading(false)
    }
  }

  const onSkip = async () => {
    setMessage('You can enable location later in Settings')
    await updateUserSettings(user.id, { location_permission: false })
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-orange-100 to-red-200 flex items-center justify-center px-6">
      <div className="rounded-3xl p-8 bg-white border shadow-lg max-w-xl w-full text-center">
        <div className="flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary animate-pulse" />
          </div>
        </div>
        <div className="mt-4 text-3xl font-bold">Enable Location Access</div>
        <div className="mt-2 text-sm text-neutral-700">We need your location to provide accurate heat risk predictions for your area</div>
        <div className="mt-6 text-left space-y-2">
          <div className="flex items-center gap-2"><span>✓</span><span>Real-time weather updates for your exact location</span></div>
          <div className="flex items-center gap-2"><span>✓</span><span>More accurate heat risk calculations</span></div>
          <div className="flex items-center gap-2"><span>✓</span><span>Location-specific health advisories</span></div>
          <div className="flex items-center gap-2"><span>✓</span><span>Automatic city detection</span></div>
        </div>
        {error && <div className="mt-4 text-primary text-sm">{error}</div>}
        {message && <div className="mt-2 text-secondary text-sm">{message}</div>}
        <div className="mt-6">
          <button onClick={onAllow} disabled={loading} className="btn-primary px-6 py-3 rounded-2xl min-h-[44px] w-full">
            {loading ? 'Requesting permission...' : 'Allow Location Access'}
          </button>
          <button onClick={onSkip} className="mt-3 text-sm text-neutral-700 hover:underline">Skip for Now</button>
        </div>
      </div>
    </div>
  )
}