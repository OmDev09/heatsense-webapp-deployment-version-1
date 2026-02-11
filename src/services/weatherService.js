import { OPENWEATHER_BASE_URL } from '../config/constants.js'

const SUPPORTED_CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
const memoryCache = {}

function cap(city) {
  if (!city) return ''
  const s = city.trim()
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function cacheKey(city) {
  return `owm:${city.toLowerCase()},IN`
}

function getCached(key) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = localStorage.getItem(key)
      if (!raw) return null
      const obj = JSON.parse(raw)
      if (Date.now() - obj.ts < 600000) return obj.data
      localStorage.removeItem(key)
      return null
    }
    const obj = memoryCache[key]
    if (!obj) return null
    if (Date.now() - obj.ts < 600000) return obj.data
    delete memoryCache[key]
    return null
  } catch {
    return null
  }
}

function setCached(key, data) {
  try {
    const payload = { ts: Date.now(), data }
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, JSON.stringify(payload))
    } else {
      memoryCache[key] = payload
    }
  } catch {}
}

export function isSupportedCity(city) {
  return SUPPORTED_CITIES.includes(cap(city))
}

export async function fetchCurrentWeather(city, language = 'en') {
  const c = cap(city || 'Delhi')
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  const k = cacheKey(c)
  const cached = getCached(k)
  if (cached) return { data: cached, error: null }
  if (!key) {
    const data = { temperature: 35, feels_like: 38, humidity: 55, wind_speed: 3.2 }
    setCached(k, data)
    return { data, error: null }
  }
  const owmLang = mapLanguageToOWM(language)
  const url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(c)},IN&units=metric&lang=${owmLang}&appid=${key}`
  try {
    const res = await fetch(url)
    const json = await res.json()
    if (!res.ok) {
      const message = json?.message || 'Failed to fetch weather'
      return { data: null, error: new Error(message) }
    }
    const data = {
      temperature: json?.main?.temp ?? null,
      feels_like: json?.main?.feels_like ?? null,
      humidity: json?.main?.humidity ?? null,
      wind_speed: json?.wind?.speed ?? null
    }
    setCached(k, data)
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function fetchWeatherByCity(city, language = 'en') {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  const owmLang = mapLanguageToOWM(language)
  const url = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)},IN&units=metric&lang=${owmLang}&appid=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch weather')
  return res.json()
}

/**
 * Map language code to OpenWeatherMap supported language
 * OpenWeatherMap supports: en, hi, ta, and others
 * @param {string} language - Language code (e.g., 'en', 'hi', 'ta', 'mr')
 * @returns {string} - OpenWeatherMap language code
 */
function mapLanguageToOWM(language) {
  const lang = (language || 'en').toLowerCase()
  // OpenWeatherMap supports: hi (Hindi), ta (Tamil), en (English)
  // If Marathi (mr) is requested, fallback to Hindi (hi) since OWM doesn't support Marathi
  if (lang === 'mr') {
    return 'hi'
  }
  // Check if language is supported by OWM, otherwise default to 'en'
  const supportedLanguages = ['en', 'hi', 'ta']
  return supportedLanguages.includes(lang) ? lang : 'en'
}

/**
 * Fetch rich weather data for dashboard with current weather and forecast
 * Makes two parallel API calls for efficiency
 * @param {Object} params - { lat, lon, city, language }
 * @param {string} params.language - Language code (e.g., 'en', 'hi', 'ta', 'mr'). Defaults to 'en'
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getDashboardWeather({ lat, lon, city, language = 'en' }) {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY
  
  if (!key) {
    return {
      data: null,
      error: new Error('OpenWeatherMap API key is missing')
    }
  }

  try {
    // Build cache key based on location and language
    const locationKey = lat && lon ? `${lat}_${lon}` : (city || 'Delhi')
    const lang = language || 'en'
    const cacheKey = `weather_cache_${locationKey}_${lang}`
    const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes in milliseconds

    // Check sessionStorage cache first
    if (typeof sessionStorage !== 'undefined') {
      try {
        const cachedData = sessionStorage.getItem(cacheKey)
        if (cachedData) {
          const cached = JSON.parse(cachedData)
          const cacheAge = Date.now() - cached.timestamp
          
          // If cache is less than 10 minutes old, return it
          if (cacheAge < CACHE_DURATION) {
            console.log('⚡ Weather Service: Serving from session cache (No API Call)')
            return {
              data: cached.data,
              error: null
            }
          } else {
            // Cache expired, remove it
            sessionStorage.removeItem(cacheKey)
          }
        }
      } catch (cacheError) {
        console.warn('⚠️ Weather Service: Error reading from cache:', cacheError)
        // Continue to API call if cache read fails
      }
    }

    // Build query parameters - prefer lat/lon if available, otherwise use city
    let currentQuery = ''
    let forecastQuery = ''
    
    if (lat && lon) {
      currentQuery = `lat=${lat}&lon=${lon}`
      forecastQuery = `lat=${lat}&lon=${lon}`
    } else if (city) {
      const cityName = encodeURIComponent(cap(city || 'Delhi'))
      currentQuery = `q=${cityName},IN`
      forecastQuery = `q=${cityName},IN`
    } else {
      const cityName = encodeURIComponent('Delhi')
      currentQuery = `q=${cityName},IN`
      forecastQuery = `q=${cityName},IN`
    }

    // Map language to OpenWeatherMap supported language
    const owmLang = mapLanguageToOWM(language)
    
    console.log('🌤️ Weather Service: Fetching from API (Cache miss or expired)')
    
    // Make two parallel API calls with language parameter
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${OPENWEATHER_BASE_URL}/weather?${currentQuery}&units=metric&lang=${owmLang}&appid=${key}`),
      fetch(`${OPENWEATHER_BASE_URL}/forecast?${forecastQuery}&units=metric&lang=${owmLang}&appid=${key}`)
    ])

    // Check if requests were successful
    if (!currentRes.ok) {
      const currentError = await currentRes.json().catch(() => ({}))
      return {
        data: null,
        error: new Error(currentError.message || 'Failed to fetch current weather')
      }
    }

    if (!forecastRes.ok) {
      const forecastError = await forecastRes.json().catch(() => ({}))
      return {
        data: null,
        error: new Error(forecastError.message || 'Failed to fetch forecast')
      }
    }

    // Parse JSON responses
    const currentData = await currentRes.json()
    const forecastData = await forecastRes.json()

    // Process current weather data
    const current = {
      temp: Math.round(currentData?.main?.temp ?? 0),
      feels_like: Math.round(currentData?.main?.feels_like ?? 0),
      humidity: currentData?.main?.humidity ?? 0,
      wind_speed: currentData?.wind?.speed ?? 0,
      condition: currentData?.weather?.[0]?.main || 'Unknown',
      icon: currentData?.weather?.[0]?.icon || '01d'
    }

    // Process forecast data for graph (next 12 hours - first 4 items, 3-hour intervals)
    const graph_data = []
    if (forecastData?.list && Array.isArray(forecastData.list)) {
      const next12Hours = forecastData.list.slice(0, 4).map((item) => {
        const itemDate = new Date(item.dt * 1000)
        const hours = itemDate.getHours()
        let timeStr = ''
        
        // Format time (e.g., "2 PM", "11 PM")
        if (hours === 0) {
          timeStr = '12 AM'
        } else if (hours < 12) {
          timeStr = `${hours} AM`
        } else if (hours === 12) {
          timeStr = '12 PM'
        } else {
          timeStr = `${hours - 12} PM`
        }

        return {
          time: timeStr,
          temp: Math.round(item.main?.temp ?? 0),
          icon: item.weather?.[0]?.icon || '01d'
        }
      })
      graph_data.push(...next12Hours)
    }

    // Process forecast data for daily forecast (next 5 days - filter for ~12:00 PM entries)
    const daily_forecast = []
    if (forecastData?.list && Array.isArray(forecastData.list)) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayEntries = new Map() // Map of date string to best entry for that day
      
      // First pass: Find entries around 12:00 PM (11 AM - 2 PM) for each day
      for (const item of forecastData.list) {
        const itemDate = new Date(item.dt * 1000)
        const hours = itemDate.getHours()
        const dateKey = itemDate.toDateString()
        
        // Look for entries around 12:00 PM (between 11 AM and 2 PM)
        if (hours >= 11 && hours <= 14) {
          if (!dayEntries.has(dateKey)) {
            dayEntries.set(dateKey, item)
          } else {
            // If we already have an entry for this day, prefer the one closer to 12 PM
            const existing = dayEntries.get(dateKey)
            const existingDate = new Date(existing.dt * 1000)
            const existingHours = existingDate.getHours()
            // Prefer 12 PM (12) over 11 AM (11) or 2 PM (14)
            if (hours === 12 || (hours === 11 && existingHours !== 12) || (hours === 14 && existingHours !== 12 && existingHours !== 11)) {
              dayEntries.set(dateKey, item)
            }
          }
        }
      }

      // Second pass: If we don't have enough days, fill with closest entries to noon
      if (dayEntries.size < 5) {
        for (const item of forecastData.list) {
          if (dayEntries.size >= 5) break
          
          const itemDate = new Date(item.dt * 1000)
          const dateKey = itemDate.toDateString()
          
          if (!dayEntries.has(dateKey)) {
            dayEntries.set(dateKey, item)
          }
        }
      }

      // Convert map to array and sort by date
      const sortedEntries = Array.from(dayEntries.entries())
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(0, 5) // Take first 5 days

      // Format the daily forecast
      for (const [dateKey, item] of sortedEntries) {
        const itemDate = new Date(item.dt * 1000)
        const dayOfWeek = dayNames[itemDate.getDay()]
        
        daily_forecast.push({
          day: dayOfWeek,
          temp: Math.round(item.main?.temp ?? 0),
          icon: item.weather?.[0]?.icon || '01d',
          condition: item.weather?.[0]?.main || 'Unknown'
        })
      }
    }

    // Prepare processed data (include location name from API for live GPS display)
    const processedData = {
      current,
      graph_data,
      daily_forecast: daily_forecast.slice(0, 5),
      location: { name: currentData?.name || city || 'Unknown Location' }
    }

    // Save to sessionStorage cache
    if (typeof sessionStorage !== 'undefined') {
      try {
        const cacheData = {
          data: processedData,
          timestamp: Date.now()
        }
        sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
        console.log('💾 Weather Service: Data saved to session cache')
      } catch (cacheError) {
        console.warn('⚠️ Weather Service: Error saving to cache:', cacheError)
        // Don't fail the request if cache save fails
      }
    }

    // Return processed data
    return {
      data: processedData,
      error: null
    }
  } catch (error) {
    console.error('Error fetching dashboard weather:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch weather data')
    }
  }
}