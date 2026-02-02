import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserProfile, getUserSettings, updateUserSettings, upsertProfile, deleteUserAccount } from '../../services/databaseService.js'
import { Mail, User, Lock, ChevronRight, Moon, Globe, MapPin, Bell, ShieldAlert, CalendarDays, HeartPulse, HelpCircle, Phone, BookOpen, FileText, Scroll, LogOut } from 'lucide-react'
import { supabase } from '../../config/supabase.js'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']

export default function Settings() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [active, setActive] = useState('account')
  const [changingLocation, setChangingLocation] = useState(false)
  const [locationMethod, setLocationMethod] = useState(null) // 'gps' or 'manual'
  const [selectedCity, setSelectedCity] = useState('')
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })
  
  // 1. Get the source of truth synchronously - ALWAYS prioritize localStorage
  const getStoredLang = () => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem('i18nextLng') || i18n.language || 'en'
  }
  
  // 2. Initialize state ONLY from localStorage (never reset on remount)
  const [language, setLanguage] = useState(() => {
    if (typeof window === 'undefined') return 'en'
    return localStorage.getItem('i18nextLng') || 'en'
  })

  // 3. Sync ONLY when i18n.language changes externally (not on remount)
  // This ensures if language is changed elsewhere, we update the dropdown
  useEffect(() => {
    const stored = localStorage.getItem('i18nextLng')
    // Only sync if i18n changed AND it matches localStorage (user changed it)
    // Don't sync if i18n is different from localStorage (i18n might be stale)
    if (stored && i18n.language === stored && language !== stored) {
      setLanguage(stored)
    }
  }, [i18n.language]) // Removed 'language' from deps to prevent circular updates

  // 4. Handle Selection
  const handleLanguageChange = (e) => {
    const newLang = e.target.value
    setLanguage(newLang) // Update UI
    i18n.changeLanguage(newLang) // Update App
    localStorage.setItem('i18nextLng', newLang) // Force Persist
    // Save to Supabase if user is logged in
    if (user) {
      saveSetting('language', newLang)
    }
  }
  
  const push = useMemo(() => !!settings?.push_notifications, [settings])
  const highRisk = useMemo(() => !!settings?.high_risk_alerts, [settings])
  const daily = useMemo(() => !!settings?.daily_forecast, [settings])
  const tips = useMemo(() => !!settings?.health_tips, [settings])

  useEffect(() => {
    if (!user) {
      window.location.assign('/login')
      return
    }
    let mounted = true
    Promise.all([getUserProfile(user.id), getUserSettings(user.id)])
      .then(([p, s]) => {
        if (!mounted) return
        setProfile(p.data || null)
        setSettings(s.data || {})
        setLoading(false)
        const stored = localStorage.getItem('theme')
        const theme = stored === 'dark' ? 'dark' : 'light'
        const root = document.documentElement
        if (theme === 'dark') root.classList.add('dark')
        else root.classList.remove('dark')
        setDarkMode(theme === 'dark')
        
        // Language handling: NEVER reset language state on settings load
        // The language state is initialized from localStorage and should remain unchanged
        // Only sync from Supabase if localStorage is completely empty (first time user)
        const localStorageLang = localStorage.getItem('i18nextLng')
        const supabaseLang = s.data?.language
        
        // Only sync from Supabase if localStorage is empty (first time setup)
        if (!localStorageLang && supabaseLang) {
          i18n.changeLanguage(supabaseLang)
          localStorage.setItem('i18nextLng', supabaseLang)
          setLanguage(supabaseLang)
        }
        // Otherwise, do NOTHING - language state is already correct from initialization
      })
      .catch(() => {
        if (!mounted) return
        setError(t('settings.errors.loadFailed'))
        setLoading(false)
      })
    return () => { mounted = false }
  }, [user])


  useEffect(() => {
    if (!user) return
    // Only subscribe to realtime updates if the table exists
    // If table doesn't exist, settings will be managed via localStorage
    try {
      const channel = supabase.channel('user_settings_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings', filter: `id=eq.${user.id}` }, payload => {
          if (payload?.new) {
            setSettings(payload.new)
            // Only sync language from Supabase if localStorage is empty (first time setup)
            // Otherwise, localStorage is the source of truth (user's current choice)
            const localStorageLang = localStorage.getItem('i18nextLng')
            if (!localStorageLang && payload.new.language && payload.new.language !== i18n.language) {
              i18n.changeLanguage(payload.new.language)
              localStorage.setItem('i18nextLng', payload.new.language)
              setLanguage(payload.new.language)
            }
          }
        })
        .subscribe()
      return () => { 
        try {
          supabase.removeChannel(channel)
        } catch (err) {
          // Ignore errors when removing channel (table might not exist)
        }
      }
    } catch (err) {
      // If subscription fails (table doesn't exist), that's okay - we'll use localStorage
      console.warn('⚠️ Could not subscribe to user_settings changes. Using localStorage fallback.')
      return () => {}
    }
  }, [user])

  const setTheme = async enabled => {
    setSaving(true)
    const theme = enabled ? 'dark' : 'light'
    localStorage.setItem('theme', theme)
    const root = document.documentElement
    if (enabled) root.classList.add('dark')
    else root.classList.remove('dark')
    const { data } = await updateUserSettings(user.id, { dark_mode: enabled })
    setSettings(data)
    setDarkMode(enabled)
    setSaving(false)
  }

  const saveSetting = async (key, value) => {
    setSaving(true)
    const { data } = await updateUserSettings(user.id, { [key]: value })
    setSettings(data)
    setSaving(false)
  }

  const onLogout = async () => {
    await logout()
    window.location.assign('/login')
  }

  const onDeleteAccount = async () => {
    const ok = window.confirm(t('settings.errors.deleteConfirm'))
    if (!ok) return
    setSaving(true)
    await deleteUserAccount(user.id)
    await logout()
    setSaving(false)
    window.location.assign('/')
  }

  const onChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setError(t('settings.errors.passwordMin'))
      return
    }
    setError('')
    setSaving(true)
    const { error: err } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    if (err) {
      setError(err.message || t('settings.errors.passwordError'))
    } else {
      setChangingPassword(false)
      setNewPassword('')
    }
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

  const onChangeLocationGPS = async () => {
    setError('')
    setSaving(true)
    try {
      if (!navigator.geolocation) {
        setError(t('settings.errors.geolocationUnsupported'))
        setSaving(false)
        return
      }

      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          (err) => {
            let errorMessage = t('settings.errors.locationDenied')
            switch (err.code) {
              case err.PERMISSION_DENIED:
                errorMessage = t('settings.errors.locationDenied')
                break
              case err.POSITION_UNAVAILABLE:
                errorMessage = t('settings.errors.locationUnavailable')
                break
              case err.TIMEOUT:
                errorMessage = t('settings.errors.locationTimeout')
                break
              default:
                errorMessage = `Geolocation error: ${err.message}`
            }
            reject(new Error(errorMessage))
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        )
      })

      const { latitude, longitude } = pos.coords
      let city = 'Unknown'
      try {
        city = await reverseGeocodeCity(latitude, longitude)
      } catch (geocodeError) {
        console.warn('Reverse geocoding failed:', geocodeError)
      }

      await upsertProfile(user.id, { home_city: city })
      const devMode = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY
      const payload = devMode ? { location_permission: true, lat: latitude, lon: longitude } : { location_permission: true }
      await updateUserSettings(user.id, payload)
      
      // Reload profile to show updated city
      const { data } = await getUserProfile(user.id)
      setProfile(data || null)
      
      setChangingLocation(false)
      setLocationMethod(null)
    } catch (err) {
      setError(err.message || t('settings.errors.locationError'))
    } finally {
      setSaving(false)
    }
  }

  const onChangeLocationManual = async () => {
    if (!selectedCity) {
      setError(t('settings.errors.selectCity'))
      return
    }
    setError('')
    setSaving(true)
    try {
      await upsertProfile(user.id, { home_city: selectedCity })
      // Reload profile to show updated city
      const { data } = await getUserProfile(user.id)
      setProfile(data || null)
      setChangingLocation(false)
      setLocationMethod(null)
      setSelectedCity('')
    } catch (err) {
      setError(err.message || t('settings.errors.locationError'))
    } finally {
      setSaving(false)
    }
  }

  const onSubmitContact = async (e) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setError(t('settings.errors.fillAllFields'))
      return
    }
    setError('')
    setContactSubmitting(true)
    setContactSuccess(false)
    
    // Simulate form submission (in production, this would send to a backend)
    try {
      // Here you would typically send the form data to your backend API
      // For now, we'll just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Log to console for development (remove in production)
      console.log('Contact form submission:', contactForm)
      
      setContactSuccess(true)
      setContactForm({ name: '', email: '', message: '' })
      
      // Clear success message after 5 seconds
      setTimeout(() => setContactSuccess(false), 5000)
    } catch (err) {
      setError(t('settings.errors.contactError'))
    } finally {
      setContactSubmitting(false)
    }
  }

  if (loading) return <div className="px-4 py-8"><div className="card rounded-3xl p-6 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700"><div className="animate-pulse h-6 bg-neutral-200 dark:bg-gray-700 rounded w-48" /><div className="mt-4 animate-pulse h-32 bg-neutral-200 dark:bg-gray-700 rounded" /></div></div>

  return (
    <div className="grid grid-cols-12 gap-10 text-neutral-900 dark:text-gray-100 px-4 md:px-8">
      <aside className="col-span-3">
        <div className="sticky top-[90px] space-y-4">
          <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
            <div className="text-xl font-semibold dark:text-white">{t('settings.title')}</div>
          </div>
          <nav className="rounded-2xl p-2 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
            <button className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 ${active==='account'?'bg-neutral-100 dark:bg-gray-800':'hover:bg-neutral-50 dark:hover:bg-gray-800'}`} onClick={() => setActive('account')}><User className="h-5 w-5" /><span>{t('settings.tabs.account')}</span></button>
            <button className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 ${active==='preferences'?'bg-neutral-100 dark:bg-gray-800':'hover:bg-neutral-50 dark:hover:bg-gray-800'}`} onClick={() => setActive('preferences')}><Moon className="h-5 w-5" /><span>{t('settings.tabs.preferences')}</span></button>
            <button className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 ${active==='notifications'?'bg-neutral-100 dark:bg-gray-800':'hover:bg-neutral-50 dark:hover:bg-gray-800'}`} onClick={() => setActive('notifications')}><Bell className="h-5 w-5" /><span>{t('settings.tabs.notifications')}</span></button>
            <button className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 ${active==='help'?'bg-neutral-100 dark:bg-gray-800':'hover:bg-neutral-50 dark:hover:bg-gray-800'}`} onClick={() => setActive('help')}><HelpCircle className="h-5 w-5" /><span>{t('settings.tabs.help')}</span></button>
          </nav>
        </div>
      </aside>

      <section className="col-span-9 space-y-6">
        {active === 'account' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl font-semibold dark:text-white">{t('settings.tabs.account')}</div>
              <div className="mt-4 space-y-3">
                <Link to="/profile?edit=true" className="rounded-xl p-4 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 flex items-center justify-between min-h-[70px]">
                  <div className="flex items-center gap-3"><User className="h-5 w-5" /><div><div className="font-medium">{t('settings.account.editProfile')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.account.editProfileDesc')}</div></div></div>
                  <ChevronRight className="h-5 w-5" />
                </Link>
                <div className="rounded-xl p-4 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex items-center justify-between min-h-[70px]">
                  <div className="flex items-center gap-3"><Lock className="h-5 w-5" /><div><div className="font-medium">{t('settings.account.changePassword')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.account.changePasswordDesc')}</div></div></div>
                  <button className="rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800" onClick={() => setChangingPassword(true)}>{t('settings.account.change')}</button>
                </div>
                {changingPassword && (
                  <div className="mt-3 flex items-center gap-2">
                    <input className="border border-neutral-200 dark:border-gray-700 rounded-2xl px-3 py-2 flex-1 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500" type="password" placeholder={t('settings.account.newPassword')} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    <button className="btn-primary rounded-2xl px-4 py-2" onClick={onChangePassword} disabled={saving}>{t('settings.account.save')}</button>
                    <button className="rounded-2xl px-4 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800" onClick={() => setChangingPassword(false)} disabled={saving}>{t('settings.account.cancel')}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {active === 'preferences' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl font-semibold dark:text-white">{t('settings.tabs.preferences')}</div>
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><Moon className="h-5 w-5" /><div><div className="font-medium">{t('settings.preferences.darkMode')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.preferences.darkModeDesc')}</div></div></div>
                  <div className="flex justify-end"><input type="checkbox" checked={darkMode} onChange={e => setTheme(e.target.checked)} aria-label="Toggle dark mode" /></div>
                </div>
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><Globe className="h-5 w-5" /><div><div className="font-medium">{t('settings.preferences.language')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.preferences.languageDesc')}</div></div></div>
                  <div className="flex justify-end">
                    <select
                      className="border border-neutral-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100"
                      value={language}
                      onChange={handleLanguageChange}
                    >
                      <option value="en">🇬🇧 English</option>
                      <option value="hi">🇮🇳 हिंदी</option>
                      <option value="mr">🇮🇳 मराठी</option>
                      <option value="ta">🇮🇳 தமிழ்</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><MapPin className="h-5 w-5" /><div><div className="font-medium">{t('settings.preferences.location')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{profile?.city || 'Unknown'}</div></div></div>
                  <div className="flex justify-end">
                    {!changingLocation ? (
                      <button 
                        className="rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800"
                        onClick={() => setChangingLocation(true)}
                        disabled={saving}
                      >
                        {t('settings.preferences.change')}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2 w-full">
                        {!locationMethod ? (
                          <div className="flex gap-2">
                            <button
                              className="flex-1 rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800 text-sm"
                              onClick={() => setLocationMethod('gps')}
                            >
                              {t('settings.preferences.useGps')}
                            </button>
                            <button
                              className="flex-1 rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800 text-sm"
                              onClick={() => setLocationMethod('manual')}
                            >
                              {t('settings.preferences.selectCity')}
                            </button>
                            <button
                              className="rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800 text-sm"
                              onClick={() => {
                                setChangingLocation(false)
                                setLocationMethod(null)
                                setSelectedCity('')
                                setError('')
                              }}
                            >
                              {t('settings.preferences.cancel')}
                            </button>
                          </div>
                        ) : locationMethod === 'gps' ? (
                          <div className="flex flex-col gap-2">
                            <button
                              className="w-full rounded-xl px-3 py-2 bg-primary text-white hover:bg-red-600 text-sm"
                              onClick={onChangeLocationGPS}
                              disabled={saving}
                            >
                              {saving ? t('settings.preferences.gettingLocation') : t('settings.preferences.getCurrentLocation')}
                            </button>
                            <button
                              className="w-full rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800 text-sm"
                              onClick={() => {
                                setLocationMethod(null)
                                setError('')
                              }}
                              disabled={saving}
                            >
                              {t('settings.preferences.back')}
                            </button>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <select
                              className="w-full border border-neutral-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 text-sm"
                              value={selectedCity}
                              onChange={(e) => setSelectedCity(e.target.value)}
                            >
                              <option value="">{t('settings.preferences.selectCityPlaceholder')}</option>
                              {CITIES.map(city => (
                                <option key={city} value={city}>{city}</option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button
                                className="flex-1 rounded-xl px-3 py-2 bg-primary text-white hover:bg-red-600 text-sm"
                                onClick={onChangeLocationManual}
                                disabled={saving || !selectedCity}
                              >
                                {saving ? t('settings.preferences.saving') : t('settings.account.save')}
                              </button>
                              <button
                                className="rounded-xl px-3 py-2 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-neutral-800 dark:text-gray-100 hover:bg-neutral-50 dark:hover:bg-gray-800 text-sm"
                                onClick={() => {
                                  setLocationMethod(null)
                                  setSelectedCity('')
                                  setError('')
                                }}
                                disabled={saving}
                              >
                                {t('settings.preferences.cancel')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'notifications' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl font-semibold dark:text-white">{t('settings.tabs.notifications')}</div>
              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><Bell className="h-5 w-5" /><div><div className="font-medium">{t('settings.notifications.push')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.notifications.pushDesc')}</div></div></div>
                  <div className="flex justify-end"><input type="checkbox" checked={push} onChange={e => saveSetting('push_notifications', e.target.checked)} aria-label="Toggle push notifications" /></div>
                </div>
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5" /><div><div className="font-medium">{t('settings.notifications.highRisk')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.notifications.highRiskDesc')}</div></div></div>
                  <div className="flex justify-end"><input type="checkbox" checked={highRisk} onChange={e => saveSetting('high_risk_alerts', e.target.checked)} aria-label="Toggle high risk alerts" /></div>
                </div>
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5" /><div><div className="font-medium">{t('settings.notifications.daily')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.notifications.dailyDesc')}</div></div></div>
                  <div className="flex justify-end"><input type="checkbox" checked={daily} onChange={e => saveSetting('daily_forecast', e.target.checked)} aria-label="Toggle daily forecast" /></div>
                </div>
                <div className="grid grid-cols-2 items-center rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 min-h-[70px]">
                  <div className="flex items-center gap-3"><HeartPulse className="h-5 w-5" /><div><div className="font-medium">{t('settings.notifications.healthTips')}</div><div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.notifications.healthTipsDesc')}</div></div></div>
                  <div className="flex justify-end"><input type="checkbox" checked={tips} onChange={e => saveSetting('health_tips', e.target.checked)} aria-label="Toggle health tips" /></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {active === 'help' && (
          <div className="space-y-6">
            <div className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-neutral-200 dark:border-gray-700 shadow-sm">
              <div className="text-xl font-semibold dark:text-white">{t('settings.tabs.help')}</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link to="/help/faq" className="flex items-center justify-between rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 min-h-[70px]"><div className="flex items-center gap-3"><HelpCircle className="h-5 w-5" /><span>{t('settings.help.faqs')}</span></div><ChevronRight className="h-5 w-5" /></Link>
                <Link to="/help/contact" className="flex items-center justify-between rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 min-h-[70px]"><div className="flex items-center gap-3"><Phone className="h-5 w-5" /><span>{t('settings.help.contactSupport')}</span></div><ChevronRight className="h-5 w-5" /></Link>
                <Link to="/help/tutorial" className="flex items-center justify-between rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 min-h-[70px]"><div className="flex items-center gap-3"><BookOpen className="h-5 w-5" /><span>{t('settings.help.tutorial')}</span></div><ChevronRight className="h-5 w-5" /></Link>
                <Link to="/help/privacy" className="flex items-center justify-between rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 min-h-[70px]"><div className="flex items-center gap-3"><FileText className="h-5 w-5" /><span>{t('settings.help.privacyPolicy')}</span></div><ChevronRight className="h-5 w-5" /></Link>
                <Link to="/help/terms" className="flex items-center justify-between rounded-xl p-3 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-neutral-50 dark:hover:bg-gray-800 min-h-[70px]"><div className="flex items-center gap-3"><Scroll className="h-5 w-5" /><span>{t('settings.help.termsOfService')}</span></div><ChevronRight className="h-5 w-5" /></Link>
              </div>

              <div className="mt-6 rounded-xl p-4 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                <div className="text-lg font-semibold mb-3 dark:text-white">{t('settings.help.contactUs')}</div>
                {contactSuccess && (
                  <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <p className="text-green-800 dark:text-green-200 text-sm">{t('settings.help.thankYouMessage')}</p>
                  </div>
                )}
                <form className="grid grid-cols-2 gap-4" onSubmit={onSubmitContact}>
                  <input 
                    className="border border-neutral-200 dark:border-gray-700 rounded-2xl px-3 py-2 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500" 
                    placeholder={t('settings.help.contactName')} 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    required
                  />
                  <input 
                    className="border border-neutral-200 dark:border-gray-700 rounded-2xl px-3 py-2 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500" 
                    placeholder={t('settings.help.contactEmail')} 
                    type="email" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    required
                  />
                  <textarea 
                    className="col-span-2 border border-neutral-200 dark:border-gray-700 rounded-2xl px-3 py-2 bg-white dark:bg-gray-900 text-neutral-900 dark:text-gray-100 placeholder-neutral-400 dark:placeholder-gray-500" 
                    rows="4" 
                    placeholder={t('settings.help.contactMessage')} 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                  />
                  <div className="col-span-2 flex justify-end">
                    <button 
                      type="submit"
                      className="btn-primary rounded-2xl px-4 py-3"
                      disabled={contactSubmitting}
                    >
                      {contactSubmitting ? t('settings.help.sending') : t('settings.help.send')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl p-4 border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-gray-400">{t('settings.footer.about')} • Version 1.0.0</div>
            <button className="flex items-center gap-2 text-primary" onClick={onDeleteAccount} disabled={saving}>{t('settings.footer.deleteAccount')}</button>
          </div>
          {error && <div className="mt-2 text-primary text-sm">{error}</div>}
          <button className="mt-4 w-full btn-primary rounded-2xl px-4 py-3 flex items-center justify-center gap-2" onClick={onLogout} disabled={saving}>
            <LogOut className="h-5 w-5" />
            <span>{t('settings.footer.logout')}</span>
          </button>
        </div>
      </section>
    </div>
  )
}