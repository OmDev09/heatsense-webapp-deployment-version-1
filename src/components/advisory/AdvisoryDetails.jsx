import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle, X, Sun, Droplets, Wind, Droplet, Activity, Shirt, ChevronRight, Home } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserProfile } from '../../services/databaseService.js'
import { getAdvisories, getHealthTips, getEmergencyContacts } from '../../services/advisoryService.js'
import { getDashboardWeather } from '../../services/weatherService.js'
import { calculateRisk } from '../../services/riskCalculator.js'
import { formatTemp } from '../../utils/helpers.js'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getHeatAdvisory } from '../../services/aiService.js'

export default function AdvisoryDetails({ level, occupation, healthConditions }) {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [weather, setWeather] = useState(null) // Keep for backward compatibility
  const [weatherData, setWeatherData] = useState(null) // New rich weather data structure
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [userLocation, setUserLocation] = useState({ lat: null, lon: null })
  const [advisory, setAdvisory] = useState(null) // AI advisory state
  const [advisoryLoading, setAdvisoryLoading] = useState(false)
  
  // Get AI advisory from navigation state (passed from Dashboard)
  const advisoryFromState = location.state?.advisory || null
  
  // Debug: Log advisory from state and set it
  useEffect(() => {
    if (advisoryFromState) {
      console.log('✅ AdvisoryDetails: Received advisory from navigation state:', advisoryFromState)
      console.log('📋 AdvisoryDetails: Advisory structure:', {
        hasSummary: !!advisoryFromState.summary,
        hasDos: !!advisoryFromState.dos,
        hasDonts: !!advisoryFromState.donts,
        hasHydration: !!advisoryFromState.hydration,
        hydrationKeys: advisoryFromState.hydration ? Object.keys(advisoryFromState.hydration) : [],
        hasActivity: !!advisoryFromState.activity_management,
        hasClothing: !!advisoryFromState.clothing,
        hasWarnings: !!advisoryFromState.warning_signs
      })
      setAdvisory(advisoryFromState)
    } else {
      console.log('⚠️ AdvisoryDetails: No advisory in navigation state, will fetch directly')
    }
  }, [advisoryFromState])

  useEffect(() => {
    let mounted = true
    if (!occupation || !healthConditions) {
      if (!user) return
      getUserProfile(user.id).then(({ data }) => {
        if (!mounted) return
        setProfile(data)
      })
    }
    return () => {
      mounted = false
    }
  }, [user, occupation, healthConditions])

  const occ = useMemo(() => occupation || profile?.occupation || '', [occupation, profile])
  const conds = useMemo(() => {
    const conditions = healthConditions || profile?.health_conditions || []
    return Array.isArray(conditions) ? conditions : []
  }, [healthConditions, profile])
  const city = useMemo(() => profile?.home_city || profile?.city || 'Delhi', [profile])

  // Get user's location for more accurate weather
  useEffect(() => {
    if (!user) return
    
    const getUserLocation = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude
              })
            },
            () => {
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
    setWeatherLoading(true)
    getDashboardWeather({ lat: userLocation.lat, lon: userLocation.lon, city, language: i18n.language || 'en' })
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching weather:', error)
          setWeather(null)
          setWeatherData(null)
        } else if (data) {
          setWeatherData(data)
          // Also set legacy weather structure for backward compatibility
          setWeather({
            temperature: data.current.temp,
            feels_like: data.current.feels_like,
            humidity: data.current.humidity,
            wind_speed: data.current.wind_speed
          })
        }
      })
      .catch((error) => {
        console.error('Exception fetching weather:', error)
        setWeather(null)
        setWeatherData(null)
      })
      .finally(() => setWeatherLoading(false))
  }, [city, userLocation.lat, userLocation.lon, i18n.language])

  const risk = useMemo(() => {
    if (!profile || !weatherData) return null
    // Use weatherData.current for risk calculation
    return calculateRisk(
      { 
        age: profile.age || null, 
        occupation: occ || '', 
        housing_type: profile.housing_type || null,
        conditions: conds || [] 
      },
      { 
        feels_like: weatherData.current.feels_like, 
        humidity: weatherData.current.humidity 
      }
    )
  }, [profile, weatherData, occ, conds])

  const lvl = useMemo(() => level || risk?.level || 'Medium', [level, risk])
  const adv = getAdvisories(lvl)
  const tips = getHealthTips(occ, conds)

  // Fetch AI advisory if not provided via navigation state
  useEffect(() => {
    // If we already have advisory from state, don't fetch again
    if (advisoryFromState) {
      console.log('✅ AdvisoryDetails: Using advisory from navigation state, skipping fetch')
      return
    }
    
    // Only fetch if we have all required data
    if (!profile || !weatherData || !risk) {
      console.log('⏳ AdvisoryDetails: Waiting for profile, weatherData, or risk...', {
        hasProfile: !!profile,
        hasWeatherData: !!weatherData,
        hasRisk: !!risk
      })
      return
    }
    
    const fetchAdvisory = async () => {
      setAdvisoryLoading(true)
      try {
        console.log('📡 AdvisoryDetails: Fetching AI advisory directly...')
        const { data, error } = await getHeatAdvisory(
          {
            id: profile.id || user?.id || null,
            age: profile.age || null,
            gender: profile.gender || null,
            occupation: occ || '',
            housing_type: profile.housing_type || null,
            health_conditions: conds || []
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
          i18n.language || 'en'
        )
        
        if (error) {
          console.error('❌ AdvisoryDetails: Failed to fetch AI advisory:', error)
        } else if (data) {
          console.log('✅ AdvisoryDetails: AI advisory fetched successfully:', data)
          setAdvisory(data)
        }
      } catch (err) {
        console.error('❌ AdvisoryDetails: Exception fetching AI advisory:', err)
      } finally {
        setAdvisoryLoading(false)
      }
    }
    
    fetchAdvisory()
  }, [profile, weatherData, risk, occ, conds, advisoryFromState, i18n.language])

  // Use AI advisory if available (from state or fetched), otherwise fall back to old system
  const currentAdvisory = advisory || advisoryFromState
  
  // Debug: Log current advisory state
  useEffect(() => {
    if (currentAdvisory) {
      console.log('✅ AdvisoryDetails: currentAdvisory is set:', {
        hasSummary: !!currentAdvisory.summary,
        hasDos: !!currentAdvisory.dos,
        hasDonts: !!currentAdvisory.donts,
        hasHydration: !!currentAdvisory.hydration,
        hasActivity: !!currentAdvisory.activity_management,
        hasClothing: !!currentAdvisory.clothing,
        hasWarnings: !!currentAdvisory.warning_signs
      })
    } else {
      console.log('⚠️ AdvisoryDetails: currentAdvisory is null/undefined')
    }
  }, [currentAdvisory])
  
  const hydrate = useMemo(() => {
    if (currentAdvisory?.hydration?.message) {
      return currentAdvisory.hydration.message
    }
    return t('advisory.bullets.hydration1')
  }, [currentAdvisory, t])

  const activityList = useMemo(() => {
    if (currentAdvisory?.activity_management && currentAdvisory.activity_management.length > 0) {
      return currentAdvisory.activity_management
    }
    return [
      t('advisory.activityList.cautious'),
      t('advisory.activityList.drinkWater'),
      t('advisory.activityList.ventilation'),
      t('advisory.activityList.avoidPolluted')
    ]
  }, [currentAdvisory, t])

  const clothingList = useMemo(() => {
    if (currentAdvisory?.clothing && currentAdvisory.clothing.length > 0) {
      return currentAdvisory.clothing
    }
    return [
      t('advisory.bullets.clothing2'),
      t('advisory.bullets.clothing4')
    ]
  }, [currentAdvisory, t])

  const warnings = useMemo(() => {
    if (currentAdvisory?.warning_signs && currentAdvisory.warning_signs.length > 0) {
      return currentAdvisory.warning_signs
    }
    return adv.warning || [
      t('advisory.bullets.warning1'),
      t('advisory.bullets.warning2'),
      t('advisory.bullets.warning3'),
      t('advisory.bullets.warning4')
    ]
  }, [currentAdvisory, adv.warning, t])
  const contacts = useMemo(() => [
    { name: t('advisory.contacts.nationalEmergency'), number: '112' },
    { name: t('advisory.contacts.ambulance'), number: '108' },
    { name: t('advisory.contacts.fire'), number: '101' },
    { name: t('advisory.contacts.police'), number: '100' }
  ], [t])

  const riskColor = risk?.color || (lvl === 'High' ? '#EF4444' : lvl === 'Critical' ? '#DC2626' : '#F59E0B')

  return (
    <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen">
      <main className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 gap-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              <Link to="/dashboard" className="hover:text-primary transition-colors">{t('advisory.breadcrumbDashboard')}</Link>
              <span className="mx-2">›</span>
              <span>{t('advisory.breadcrumbTitle')}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('advisory.pageTitle')}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('advisory.currentRisk')}:</span>
            <span 
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: riskColor }}
            >
              {lvl}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Health Advisories */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hydration Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Droplet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('advisory.hydration')}</h2>
              </div>
              {advisoryLoading && !currentAdvisory ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading AI advisory...</span>
                </div>
              ) : currentAdvisory?.hydration ? (
                <div className="space-y-3">
                  {currentAdvisory.hydration.amount && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Amount:</span> {currentAdvisory.hydration.amount}
                      </span>
                    </div>
                  )}
                  {currentAdvisory.hydration.frequency && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Frequency:</span> {currentAdvisory.hydration.frequency}
                      </span>
                    </div>
                  )}
                  {currentAdvisory.hydration.message && (
                    <div className="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{currentAdvisory.hydration.message}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">{hydrate}</span>
                </div>
              )}
            </div>

            {/* Activity Management Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('advisory.activity')}</h2>
              </div>
              <ul className="space-y-3">
                {activityList.map((item, i) => {
                  const isWarning = i === 0 || i === 3
                  return (
                    <li key={i} className="flex items-start gap-2">
                      {isWarning ? (
                        <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Clothing Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Shirt className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('advisory.clothing')}</h2>
              </div>
              <ul className="space-y-3">
                {clothingList.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Home Cooling Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Home className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('advisory.homeCooling')}</h2>
              </div>
              {advisoryLoading && !currentAdvisory ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">{t('advisory.loading')}</span>
                </div>
              ) : currentAdvisory?.housing_tips ? (
                <div className="space-y-3">
                  {Array.isArray(currentAdvisory.housing_tips) ? (
                    currentAdvisory.housing_tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{currentAdvisory.housing_tips}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {profile?.housing_type === 'tin_sheet' 
                      ? 'Cover your roof with wet gunny bags or coir mats. Sprinkle water on the roof at 2 PM and 6 PM to reduce indoor heat.'
                      : profile?.housing_type === 'asbestos'
                      ? 'Hang wet bedsheets inside windows to cool incoming air. Do not wet asbestos sheets directly when hot.'
                      : 'Keep curtains and windows closed during peak afternoon hours (12 PM - 4 PM) to trap cool air inside.'}
                  </span>
                </div>
              )}
            </div>

            {/* Warning Signs Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('advisory.warningSigns')}</h2>
              </div>
              <ul className="space-y-3 mb-4">
                {warnings.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-red-600 dark:text-red-400 font-semibold">{t('advisory.seekHelp')}</p>
            </div>
          </div>

          {/* Right Column - Summary Information */}
          <div className="space-y-6">
            {/* Current Weather Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('advisory.currentWeather')}</h3>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-5xl font-bold text-gray-900 dark:text-white">
                    {weatherLoading ? '--' : weatherData?.current ? formatTemp(weatherData.current.temp) : (weather ? formatTemp(weather.temperature) : '--')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('advisory.feelsLike')} {weatherLoading ? '--' : weatherData?.current ? formatTemp(weatherData.current.feels_like) : (weather ? formatTemp(weather.feels_like) : '--')}
                  </p>
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
              <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-primary" />
                  <span>{t('dashboard.humidity')} {weatherData?.current?.humidity ?? weather?.humidity ?? '--'}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4 text-primary" />
                  <span>{t('dashboard.wind')} {weatherData?.current?.wind_speed ?? weather?.wind_speed ?? '--'} m/s</span>
                </div>
              </div>
            </div>

            {/* Current Risk Level Card */}
            {risk && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('advisory.currentRiskLevel')}</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <AlertTriangle className="h-8 w-8" style={{ color: riskColor }} />
                  <span className="text-2xl font-bold" style={{ color: riskColor }}>{risk.level} {t('dashboard.risk')}</span>
                </div>
                {/* Circular Progress Bar similar to Dashboard */}
                <div className="flex items-center justify-center my-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      {/* Background circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-gray-200 dark:text-gray-700"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - risk.score / 100)}`}
                        style={{ color: riskColor }}
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Score in center */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{risk.score}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">/100</p>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-700 dark:text-gray-300 mt-2">
                  {t('advisory.scoreLabel')}: <span className="font-bold">{risk.score}</span>/100
                </p>
              </div>
            )}

            {/* Emergency Contacts Card */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('advisory.emergencyContacts')}</h3>
              <div className="space-y-3">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{contact.name}</span>
                    <a 
                      href={`tel:${contact.number}`} 
                      className="text-primary font-semibold text-sm hover:underline"
                    >
                      {contact.number}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
