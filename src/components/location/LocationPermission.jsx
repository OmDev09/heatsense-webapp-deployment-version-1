import { useEffect, useState } from 'react'
import { MapPin } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { updateUserSettings, upsertProfile } from '../../services/databaseService.js'

function reverseGeocodeCity(lat, lon) {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  if (key) {
    return fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`)
      .then(r => r.json())
      .then(data => (Array.isArray(data) && data.length > 0 ? data[0].name : null))
      .catch(() => null)
  }
  return fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
    headers: { Accept: 'application/json' }
  })
    .then(r => r.json())
    .then(j => {
      const a = j.address || {}
      return a.city || a.town || a.village || a.state || 'Unknown'
    })
    .catch(() => 'Unknown')
}

export default function LocationPermission() {
  const auth = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth || auth.loading) return
    if (!auth.user) {
      window.location.href = '/login'
    }
  }, [auth])

  if (!auth || auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!auth.user) return null

  const user = auth.user

  const onAllow = async () => {
    setError('')
    setLoading(true)
    try {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported.')
        setLoading(false)
        return
      }
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        })
      })
      const { latitude, longitude } = position.coords
      let city = 'Unknown'
      try {
        const c = await reverseGeocodeCity(latitude, longitude)
        if (c) city = c
      } catch {}
      await upsertProfile(user.id, { home_city: city })
      await updateUserSettings(user.id, { location_permission: true })
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message || 'Location permission denied or unavailable.')
    } finally {
      setLoading(false)
    }
  }

  const onSkip = async () => {
    setError('')
    setLoading(true)
    try {
      await updateUserSettings(user.id, { location_permission: false })
      window.location.href = '/dashboard'
    } catch {
      setError('Failed to save preference.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-100 via-orange-100 to-red-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center px-6">
      <div className="rounded-3xl p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg max-w-xl w-full text-center">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Enable Location Access</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          We use your location for accurate heat risk and weather for your area.
        </p>
        
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={onAllow}
            disabled={loading}
            className="btn-primary px-6 py-3 rounded-2xl min-h-[44px] w-full disabled:opacity-70 font-medium"
          >
            {loading ? 'Requesting...' : 'Allow Location Access'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={loading}
            className="px-6 py-3 rounded-2xl min-h-[44px] w-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-70 text-sm font-medium"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  )
}
