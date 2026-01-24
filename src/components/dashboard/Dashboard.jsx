import { useEffect, useMemo, useState, useRef } from 'react'
import { Thermometer, Sun, Droplets, Wind, AlertTriangle, Search, Bell, ChevronLeft, ChevronRight, Image as ImageIcon, Flame, Cloud, ArrowRight } from 'lucide-react'
import { getDashboardWeather } from '../../services/weatherService.js'
import { calculateRisk } from '../../services/riskCalculator.js'
import { getUserProfile, logUserLocation } from '../../services/databaseService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { formatTemp } from '../../utils/helpers.js'
import { useNavigate } from 'react-router-dom'
import { getAdvisories } from '../../services/advisoryService.js'
import { useTranslation } from 'react-i18next'
import WeatherGraph from './WeatherGraph.jsx'
import { getHeatAdvisory } from '../../services/aiService.js'
import slide1 from '../../assets/slide1.png'
import slide2 from '../../assets/slide2.png'
import slide3 from '../../assets/slide3.png'
import slide4 from '../../assets/slide4.png'
import HeatMap from './HeatMap.jsx'
import { fetchBulkHeatMapData, getCachedHeatMapData, cacheHeatMapData } from '../../services/heatmapService.js'
import { Loader2 } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const auth = useAuth()
  const { t, i18n } = useTranslation()
  const [profile, setProfile] = useState(null)
  const [weather, setWeather] = useState(null) // Keep for backward compatibility
  const [weatherData, setWeatherData] = useState(null) // New rich weather data structure
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null }) // Store user's location
  const [didYouKnowIndex, setDidYouKnowIndex] = useState(0)
  const hasLoggedRiskLocation = useRef(false) // Track if we've already logged risk location
  const [advisory, setAdvisory] = useState(null) // AI-generated advisory
  const [advisoryLoading, setAdvisoryLoading] = useState(false) // Loading state for advisory
  const sliderIntervalRef = useRef(null) // Ref for slider auto-play interval
  const advisoryFetchKeyRef = useRef(null) // Track the "signature" of the last advisory fetch to prevent duplicate calls
  const [heatMapCities, setHeatMapCities] = useState([]) // Heatmap city data
  const [heatMapLoading, setHeatMapLoading] = useState(false) // Loading state for heatmap
  
  // CRITICAL FIX: Prevent crash if auth is still initializing
  // Check after all hooks are called
  if (!auth || auth.loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  const { user } = auth

  // Use correct schema field names: home_city and full_name
  const city = useMemo(() => profile?.home_city || 'Delhi', [profile])
  const name = useMemo(() => profile?.full_name || 'User', [profile])

  const didYouKnowSlides = [
    { image: slide1},
    { image: slide2},
    { image: slide3},
    { image: slide4}
  ]

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    let mounted = true
    setLoading(true)
    setError('')
    console.log('📊 Dashboard: Fetching profile for user:', user.id)
    getUserProfile(user.id)
      .then(({ data, error: profileError }) => {
        if (!mounted) return
        if (profileError) {
          console.error('❌ Dashboard: Failed to load profile:', profileError)
          setError('Failed to load profile')
          // If profile doesn't exist, redirect to profile creation
          if (profileError.message?.includes('not found') || profileError.code === 'PGRST116') {
            navigate('/profile')
            return
          }
        } else if (!data) {
          console.warn('⚠️ Dashboard: No profile data found, redirecting to profile creation')
          navigate('/profile')
          return
        } else {
          console.log('✅ Dashboard: Profile loaded successfully:', data)
          setProfile(data)
        }
      })
      .catch((err) => {
        console.error('❌ Dashboard: Exception loading profile:', err)
        setError('Failed to load profile')
      })
      .finally(() => {
        if (mounted) {
          setLoading(false)
        }
      })
    return () => {
      mounted = false
    }
  }, [user, navigate])

  const loadWeather = async (c, lat, lon) => {
    setWeatherLoading(true)
    setWeatherError('')
    try {
      // Use getDashboardWeather with lat/lon if available, otherwise use city
      // Pass current language for localized weather descriptions
      const { data, error: err } = await getDashboardWeather({ lat, lon, city: c, language: i18n.language || 'en' })
      if (err) {
        setWeather(null)
        setWeatherData(null)
        setWeatherError('Failed to load weather')
      } else if (data) {
        // Store rich weather data
        setWeatherData(data)
        // Also set legacy weather structure for backward compatibility
        setWeather({
          temperature: data.current.temp,
          feels_like: data.current.feels_like,
          humidity: data.current.humidity,
          wind_speed: data.current.wind_speed
        })
      }
    } catch (error) {
      console.error('Error loading weather:', error)
      setWeather(null)
      setWeatherData(null)
      setWeatherError('Network error')
    } finally {
      setWeatherLoading(false)
    }
  }

  // Get user's location from settings or geolocation
  useEffect(() => {
    if (!user) return
    
    // Try to get location from user settings first
    const getUserLocation = async () => {
      try {
        // Check if we have location in settings (would need to import getUserSettings)
        // For now, try geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude
              })
            },
            () => {
              // Geolocation failed, will use city name
              setUserLocation({ lat: null, lon: null })
            },
            { timeout: 5000 }
          )
        }
      } catch (error) {
        console.warn('Could not get user location:', error)
      }
    }
    
    getUserLocation()
  }, [user])

  useEffect(() => {
    if (!city) return
    // Load weather with location if available
    loadWeather(city, userLocation.lat, userLocation.lon)
    const id = setInterval(() => loadWeather(city, userLocation.lat, userLocation.lon), 600000)
    return () => clearInterval(id)
  }, [city, userLocation.lat, userLocation.lon, i18n.language])

  // Load heatmap data for all cities
  const loadHeatMapData = async () => {
    // Check cache first
    const cached = getCachedHeatMapData()
    if (cached) {
      setHeatMapCities(cached)
      return
    }

    setHeatMapLoading(true)
    try {
      const { data, error } = await fetchBulkHeatMapData()
      if (error) {
        console.error('Error loading heatmap:', error)
        setHeatMapCities([])
      } else {
        setHeatMapCities(data || [])
        // Cache the result
        if (data && data.length > 0) {
          cacheHeatMapData(data)
        }
      }
    } catch (error) {
      console.error('Error loading heatmap:', error)
      setHeatMapCities([])
    } finally {
      setHeatMapLoading(false)
    }
  }

  // Load heatmap data on mount and refresh every 10 minutes
  useEffect(() => {
    loadHeatMapData()
    const interval = setInterval(loadHeatMapData, 10 * 60 * 1000) // 10 minutes
    return () => clearInterval(interval)
  }, [])

  const risk = useMemo(() => {
    if (!profile || !weatherData) return null
    // Use real profile data: age, occupation, and health_conditions from Supabase
    // health_conditions is stored as TEXT[] array in Supabase
    // Use weatherData.current for risk calculation
    return calculateRisk(
      { 
        age: profile.age || null, 
        occupation: profile.occupation || '', 
        housing_type: profile.housing_type || null,
        conditions: Array.isArray(profile.health_conditions) ? profile.health_conditions : [] 
      },
      { feels_like: weatherData.current.feels_like, humidity: weatherData.current.humidity }
    )
  }, [profile, weatherData])

  // Log location with risk score to employee_risk_logs ONCE when dashboard loads and risk is calculated
  useEffect(() => {
    // Only log once per dashboard session
    if (hasLoggedRiskLocation.current) return
    if (!risk || !user || !weatherData) return
    
    // Mark as logged to prevent duplicate logs
    hasLoggedRiskLocation.current = true
    
    // Get user's current location from weather data or geolocation
    const logRiskLocation = async () => {
      try {
        // Guard: Only log if risk score is valid
        if (risk === null || risk.score === null || risk.score === undefined) {
          console.warn("⚠️ Skipping location log: Risk data not ready yet")
          return
        }
        
        // Try to get current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords
              const result = await logUserLocation(
                user.id,
                latitude,
                longitude,
                risk.score,
                risk.level
              )
              if (result.error) {
                console.error('❌ Failed to log risk location:', result.error)
                // Reset flag on error so user can retry
                hasLoggedRiskLocation.current = false
              } else {
                console.log('✅ Risk location logged successfully (once per dashboard load)')
              }
            },
            (err) => {
              console.warn('⚠️ Could not get location for risk logging:', err.message)
              // Reset flag on error so user can retry
              hasLoggedRiskLocation.current = false
            },
            { timeout: 5000 }
          )
        }
      } catch (error) {
        console.error('❌ Exception logging risk location:', error)
        // Reset flag on error so user can retry
        hasLoggedRiskLocation.current = false
      }
    }
    
    logRiskLocation()
  }, [risk, user, weatherData])

  // Create a stable key for advisory fetching based on relevant data (including language)
  const advisoryKey = useMemo(() => {
    if (!profile || !weatherData || !risk) return null
    const lang = i18n.language || 'en'
    // Create a unique key based on the data that affects the advisory (including language)
    return `${profile.id}-${profile.age}-${profile.occupation}-${JSON.stringify(profile.health_conditions || [])}-${weatherData.current.temp}-${weatherData.current.feels_like}-${weatherData.current.humidity}-${risk.score}-${risk.level}-${lang}`
  }, [profile?.id, profile?.age, profile?.occupation, profile?.health_conditions, weatherData?.current?.temp, weatherData?.current?.feels_like, weatherData?.current?.humidity, risk?.score, risk?.level, i18n.language])

  // Fetch AI advisory when profile, weather, and risk are ready
  useEffect(() => {
    if (!profile || !weatherData || !risk || !advisoryKey) {
      console.log('⏳ Dashboard: Waiting for data to fetch advisory', {
        hasProfile: !!profile,
        hasWeatherData: !!weatherData,
        hasRisk: !!risk,
        hasAdvisoryKey: !!advisoryKey
      })
      return
    }
    
    // Prevent duplicate fetches - only fetch if the key has changed
    if (advisoryFetchKeyRef.current === advisoryKey) {
      console.log('🛡️ Dashboard: Advisory already fetched for this key, skipping duplicate call')
      return
    }
    
    const fetchAdvisory = async () => {
      // Mark this key as being fetched to prevent concurrent calls
      advisoryFetchKeyRef.current = advisoryKey
      setAdvisoryLoading(true)
      console.log('🚀 Dashboard: Starting AI advisory fetch with key:', advisoryKey)
      
      try {
        const { data, error } = await getHeatAdvisory(
          {
            id: profile.id || user?.id || null,
            age: profile.age || null,
            gender: profile.gender || null,
            occupation: profile.occupation || '',
            housing_type: profile.housing_type || null,
            health_conditions: Array.isArray(profile.health_conditions) ? profile.health_conditions : []
          },
          {
            temp: weatherData.current.temp,
            feels_like: weatherData.current.feels_like,
            humidity: weatherData.current.humidity
          },
          {
            score: risk.score,
            level: risk.level,
            label: risk.level
          },
          i18n.language || 'en',
          false // forceRefresh = false (use cache if available)
        )
        
        if (error) {
          console.error('❌ Dashboard: Failed to fetch AI advisory:', error)
          // Keep the fallback advisory from the service (don't set to null)
          // The service returns a fallback advisory even on error
          if (data) {
            console.log('⚠️ Dashboard: Using fallback advisory due to error')
            setAdvisory(data)
          } else {
            setAdvisory(null)
          }
          // Reset ref on error so it can retry
          advisoryFetchKeyRef.current = null
        } else if (data) {
          console.log('✅ Dashboard: AI advisory fetched successfully:', data)
          setAdvisory(data)
        } else {
          console.warn('⚠️ Dashboard: No data and no error returned from getHeatAdvisory')
          setAdvisory(null)
          advisoryFetchKeyRef.current = null
        }
      } catch (err) {
        console.error('❌ Dashboard: Exception fetching AI advisory:', err)
        setAdvisory(null)
        // Reset ref on error so it can retry
        advisoryFetchKeyRef.current = null
      } finally {
        setAdvisoryLoading(false)
      }
    }
    
    fetchAdvisory()
  }, [advisoryKey, profile, weatherData, risk, user?.id, i18n.language])

  // Auto-play slider for Did You Know section
  useEffect(() => {
    // Clear any existing interval
    if (sliderIntervalRef.current) {
      clearInterval(sliderIntervalRef.current)
    }
    
    // Set up auto-play interval (change slide every 5 seconds)
    sliderIntervalRef.current = setInterval(() => {
      setDidYouKnowIndex((prev) => (prev + 1) % didYouKnowSlides.length)
    }, 5000)
    
    // Cleanup interval on unmount
    return () => {
      if (sliderIntervalRef.current) {
        clearInterval(sliderIntervalRef.current)
      }
    }
  }, [didYouKnowSlides.length])

  // Fallback to old advisory system if AI advisory is not available
  const advisories = useMemo(() => {
    // Use AI advisory if available
    if (advisory) {
      return {
        dos: advisory.dos || [],
        donts: advisory.donts || [],
        hydration: advisory.hydration || null,
        activity_management: advisory.activity_management || [],
        clothing: advisory.clothing || [],
        warning_signs: advisory.warning_signs || []
      }
    }
    
    // Fallback to old system
    if (!risk) return { dos: [], donts: [], hydration: null, activity_management: [], clothing: [], warning_signs: [] }
    const adv = getAdvisories(risk.level)
    const dos = []
    const donts = []
    
    if (adv.hydration) dos.push(...adv.hydration)
    if (adv.activity && risk.level !== 'Critical') dos.push(...adv.activity)
    if (adv.clothing) dos.push(...adv.clothing)
    if (adv.breaks) dos.push(...adv.breaks)
    
    if (adv.activity && risk.level === 'Critical') donts.push(...adv.activity)
    if (adv.timing) donts.push(t('dashboard.avoidPeakSun'))
    if (adv.warning) donts.push(t('dashboard.ignoreHeatstroke'))
    
    return { 
      dos: dos.slice(0, 3), 
      donts: donts.slice(0, 3),
      hydration: null,
      activity_management: [],
      clothing: [],
      warning_signs: []
    }
  }, [advisory, risk, t])

  const emergencyContacts = useMemo(() => [
    { name: 'Emergency', number: '112' },
    { name: 'Ambulance ', number: '108' },
    { name: 'Disaster Helpline', number: '1077' },
    { name: 'Health Helpline', number: '104' }
  ], [])

  const today = useMemo(
    () => {
      const locale = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
      return new Date().toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
    [i18n.language]
  )

  // Use weatherData.daily_forecast if available, otherwise generate placeholder
  const forecastDays = useMemo(() => {
    if (weatherData?.daily_forecast && weatherData.daily_forecast.length > 0) {
      return weatherData.daily_forecast.map((day) => ({
        day: day.day,
        temp: day.temp,
        icon: day.icon,
        condition: day.condition,
        isHot: day.temp >= 37
      }))
    }
    // Fallback to placeholder if no forecast data
    const locale = i18n.language === 'hi' ? 'hi-IN' : i18n.language === 'mr' ? 'mr-IN' : 'en-IN'
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(Date.now() + (i + 1) * 86400000)
      const temp = weather ? Math.round(weather.temperature + (Math.random() * 4 - 2)) : 33
      const isHot = temp >= 37
      return {
        day: d.toLocaleDateString(locale, { weekday: 'short' }),
        temp,
        isHot
      }
    })
  }, [weatherData, weather, i18n.language])

  const riskColorClasses = risk?.level === 'Critical'
    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
    : risk?.level === 'High'
      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200'
      : risk?.level === 'Medium'
        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200'
        : 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'

  const riskGradient = risk?.level === 'Critical'
    ? 'from-red-400 to-red-500'
    : risk?.level === 'High'
      ? 'from-orange-400 to-orange-500'
      : risk?.level === 'Medium'
        ? 'from-yellow-400 to-yellow-500'
        : 'from-green-400 to-green-500'

  if (loading) {
    return (
      <div className="px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="card p-6 rounded-3xl" role="status" aria-label="Loading dashboard">
          <div className="text-center">
            <div className="animate-pulse h-6 bg-neutral-200 dark:bg-neutral-700 rounded w-48 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">{t('dashboard.loading') || 'Loading Dashboard...'}</p>
            <div className="mt-4 animate-pulse h-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="card p-6 rounded-3xl max-w-md" role="alert">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen">
      <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 gap-8">
        {/* AI Advisory Summary Alert */}
        {advisory?.summary && (
          <div className={`p-4 rounded-xl shadow-md border-l-4 ${
            risk?.level === 'Critical' || risk?.level === 'High'
              ? 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200'
              : risk?.level === 'Medium'
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200'
              : 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                risk?.level === 'Critical' || risk?.level === 'High'
                  ? 'text-red-600 dark:text-red-400'
                  : risk?.level === 'Medium'
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              }`} />
              <p className="font-semibold text-sm leading-relaxed">{advisory.summary}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
          {/* Left Column */}
          <div className="flex flex-col gap-6 h-full">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('dashboard.greeting', { name })}</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{city} • {today}</p>
            </div>

            {/* Temperature Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex items-center justify-between flex-1">
              <div>
                {weatherLoading ? (
                  <div className="animate-pulse h-16 bg-gray-200 dark:bg-gray-700 rounded w-32" />
                ) : (
                  <>
                    <p className="text-6xl font-bold text-gray-900 dark:text-white">
                      {weatherData?.current ? formatTemp(weatherData.current.temp) : (weather ? formatTemp(weather.temperature) : '--')}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {t('advisory.feelsLike')} {weatherData?.current ? formatTemp(weatherData.current.feels_like) : (weather ? formatTemp(weather.feels_like) : '--')}
                    </p>
                  </>
                )}
              </div>
              {weatherData?.current?.icon ? (
                <img 
                  src={`https://openweathermap.org/img/wn/${weatherData.current.icon}@2x.png`}
                  alt={weatherData.current.condition}
                  className="h-16 w-16"
                />
              ) : (
                <Sun className="h-16 w-16 text-yellow-500 fill-yellow-500" />
              )}
            </div>

            {/* Humidity and Wind */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex justify-around flex-1">
              <div className="text-center flex flex-col justify-center">
                <Droplets className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-bold text-base mb-1">{t('dashboard.humidity')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  {weatherLoading ? '--' : `${weatherData?.current?.humidity ?? weather?.humidity ?? '--'}%`}
                </p>
              </div>
              <div className="text-center flex flex-col justify-center">
                <Wind className="h-10 w-10 text-primary mx-auto mb-3" />
                <p className="font-bold text-base mb-1">{t('dashboard.wind')}</p>
                <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
                  {weatherLoading ? '--' : `${weatherData?.current?.wind_speed ?? weather?.wind_speed ?? '--'} m/s`}
                </p>
              </div>
            </div>

            {/* Hydration Card - AI Advisory */}
            {advisories.hydration && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 p-6 rounded-xl shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <Droplets className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">{t('advisory.hydration') || 'Hydration Guide'}</h3>
                </div>
                <div className="space-y-2">
                  {advisories.hydration.amount && (
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">Amount:</span> {advisories.hydration.amount}
                    </p>
                  )}
                  {advisories.hydration.frequency && (
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">Frequency:</span> {advisories.hydration.frequency}
                    </p>
                  )}
                  {advisories.hydration.message && (
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 leading-relaxed">
                      {advisories.hydration.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 12-Hour Weather Graph */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col mt-auto" style={{ minHeight: '312px', height: '312px' }}>
              <h3 className="font-bold text-lg mb-4 flex-shrink-0 text-gray-900 dark:text-white">{t('dashboard.weatherGraph')}</h3>
              {weatherLoading ? (
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center min-h-0">
                  <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading...</div>
                </div>
              ) : weatherData?.graph_data && weatherData.graph_data.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0" style={{ minHeight: '200px' }}>
                  {/* Interactive Weather Chart - Fixed container with explicit dimensions */}
                  <div className="flex-1 min-h-0" style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                    <WeatherGraph data={weatherData.graph_data} />
                  </div>
                  <a 
                    href="#forecast" 
                    onClick={(e) => { e.preventDefault(); document.getElementById('forecast')?.scrollIntoView({ behavior: 'smooth' }) }}
                    className="mt-4 text-sm font-medium text-primary hover:underline flex-shrink-0"
                  >
                    {t('dashboard.seeForecast')}
                  </a>
                </div>
              ) : (
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center min-h-0">
                  <p className="text-gray-500 dark:text-gray-400">No forecast data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Middle Column */}
          <div className="flex flex-col gap-6 h-full">
            {/* Risk Level Card */}
            {risk && (
              <div className={`${riskColorClasses} border-4 p-6 rounded-xl shadow-md text-center flex flex-col justify-center flex-1`} style={{ borderColor: risk.level === 'Critical' ? '#DC2626' : risk.level === 'High' ? '#F97316' : risk.level === 'Medium' ? '#EAB308' : '#22C55E' }}>
                <p className="font-bold text-lg mb-4">{t('dashboard.yourRiskLevel')}</p>
                <div className="flex items-center justify-center gap-4 my-4">
                  <AlertTriangle className="h-16 w-16" />
                  <p className="text-5xl font-bold">{risk.level} {t('dashboard.risk')}</p>
                </div>
                
                {/* Circular Progress Bar */}
                <div className="flex items-center justify-center my-6">
                  <div className="relative w-40 h-40">
                    <svg className="transform -rotate-90 w-40 h-40">
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - risk.score / 100)}`}
                        className={`${risk.level === 'Critical' ? 'text-red-500' : risk.level === 'High' ? 'text-orange-500' : risk.level === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                      />
                    </svg>
                    {/* Score in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">{risk.score}</p>
                      <p className="text-base text-gray-600 dark:text-gray-400">/100</p>
                    </div>
                  </div>
                </div>

                {/* View Recommendations Button */}
                <button
                  onClick={() => navigate('/advisory', { state: { advisory } })}
                  className="mt-4 w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-base py-3 px-4 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-[1.02]"
                >
                  <span>{t('dashboard.viewRecommendations')}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Advisories Card - Aligned with 12-Hour Weather Graph */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col overflow-hidden" style={{ minHeight: '312px', height: '312px' }}>
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('dashboard.todaysAdvisories')}</h3>
              {advisoryLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generating personalized advisories...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto">
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Do's</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 flex-grow">
                      {advisories.dos && advisories.dos.length > 0 ? (
                        advisories.dos.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>Drink water regularly</span></li>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>Wear light fabrics</span></li>
                          <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span><span>Take frequent breaks</span></li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Don'ts</h4>
                    <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 flex-grow">
                      {advisories.donts && advisories.donts.length > 0 ? (
                        advisories.donts.map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">✗</span>
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>Avoid peak sun hours</span></li>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>Strenuous outdoor activity</span></li>
                          <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span><span>Ignore signs of heatstroke</span></li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6 h-full">
            {/* Did You Know Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col relative flex-1 min-h-0">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('dashboard.didYouKnow')}</h3>
              <div className="relative flex-1 min-h-0">
                <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 p-4 rounded-lg overflow-hidden">
                  <div className="h-full w-full rounded-md overflow-hidden relative">
                    {/* Image Slider */}
                    <div className="relative h-full w-full">
                      {didYouKnowSlides.map((slide, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                            index === didYouKnowIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                          }`}
                        >
                          <img
                            src={slide.image}
                            alt={`Safety tip ${index + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Navigation Buttons */}
                <button 
                  onClick={() => setDidYouKnowIndex((prev) => (prev - 1 + didYouKnowSlides.length) % didYouKnowSlides.length)}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 z-20 transition-all hover:scale-110"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setDidYouKnowIndex((prev) => (prev + 1) % didYouKnowSlides.length)}
                  className="absolute -right-3 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 z-20 transition-all hover:scale-110"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                {/* Slide Indicators */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                  {didYouKnowSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setDidYouKnowIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === didYouKnowIndex
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">{t('advisory.emergencyContacts')}</h3>
              <div className="flex flex-col gap-3">
                {emergencyContacts.map((contact, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{contact.name}:</span>
                    <a href={`tel:${contact.number}`} className="text-primary font-semibold text-sm hover:underline">
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 5-Day Forecast */}
        <div className="flex flex-col gap-8 pt-8" id="forecast">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('dashboard.fiveDayForecast')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 text-center">
              {forecastDays.map((day, i) => (
                <div key={i} className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="font-semibold text-gray-900 dark:text-white">{day.day}</p>
                  {day.icon ? (
                    <img 
                      src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                      alt={day.condition || 'weather'}
                      className="h-12 w-12 mx-auto my-2"
                    />
                  ) : day.isHot ? (
                    <Flame className="h-10 w-10 text-orange-400 mx-auto my-1" />
                  ) : day.temp > 35 ? (
                    <Sun className="h-10 w-10 text-yellow-500 mx-auto my-1 fill-yellow-500" />
                  ) : (
                    <Cloud className="h-10 w-10 text-gray-400 mx-auto my-1" />
                  )}
                  {day.condition && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{day.condition}</p>
                  )}
                  <p className="font-bold text-lg text-gray-900 dark:text-white">{day.temp}°C</p>
                </div>
              ))}
            </div>
          </div>

          {/* Heat Affected Regions */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-xl mb-4 text-gray-900 dark:text-white">{t('dashboard.heatAffectedRegions')}</h3>
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
              <HeatMap cityData={heatMapCities} loading={heatMapLoading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
