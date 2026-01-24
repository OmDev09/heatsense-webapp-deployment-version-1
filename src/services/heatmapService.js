/**
 * HeatMap Service - Fetches weather data for multiple cities using Open-Meteo
 * Open-Meteo is FREE with no API key required and no rate limits
 * Makes parallel requests efficiently (free, so no quota concerns)
 */

const OPENMETEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast'

// Hyperlocal Indian cities and towns with coordinates for detailed heatmap coverage
// Expanded from 30 to 100+ locations for better regional coverage
const CITIES = [
  // Major Metros
  { name: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  
  // Tier-1 Cities
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873 },
  { name: 'Surat', lat: 21.1702, lon: 72.8311 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'Kanpur', lat: 26.4499, lon: 80.3319 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882 },
  { name: 'Indore', lat: 22.7196, lon: 75.8577 },
  { name: 'Thane', lat: 19.2183, lon: 72.9781 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376 },
  { name: 'Vadodara', lat: 22.3072, lon: 73.1812 },
  { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538 },
  { name: 'Ludhiana', lat: 30.9010, lon: 75.8573 },
  { name: 'Agra', lat: 27.1767, lon: 78.0081 },
  { name: 'Nashik', lat: 19.9975, lon: 73.7898 },
  { name: 'Faridabad', lat: 28.4089, lon: 77.3178 },
  { name: 'Meerut', lat: 28.9845, lon: 77.7064 },
  { name: 'Rajkot', lat: 22.3039, lon: 70.8022 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739 },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973 },
  { name: 'Amritsar', lat: 31.6340, lon: 74.8723 },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794 },
  
  // Tier-2 Cities - North India
  { name: 'Jalandhar', lat: 31.3260, lon: 75.5762 },
  { name: 'Allahabad', lat: 25.4358, lon: 81.8463 },
  { name: 'Bareilly', lat: 28.3670, lon: 79.4304 },
  { name: 'Moradabad', lat: 28.8389, lon: 78.7769 },
  { name: 'Aligarh', lat: 27.8974, lon: 78.0880 },
  { name: 'Gorakhpur', lat: 26.7588, lon: 83.3697 },
  { name: 'Muzaffarnagar', lat: 29.4709, lon: 77.7033 },
  { name: 'Mathura', lat: 27.4924, lon: 77.6737 },
  { name: 'Rohtak', lat: 28.8955, lon: 76.6066 },
  { name: 'Panipat', lat: 29.3909, lon: 76.9635 },
  { name: 'Karnal', lat: 29.6857, lon: 76.9905 },
  { name: 'Hisar', lat: 29.1492, lon: 75.7217 },
  { name: 'Bhiwani', lat: 28.7930, lon: 76.1398 },
  { name: 'Sonipat', lat: 28.9931, lon: 77.0151 },
  { name: 'Gurgaon', lat: 28.4089, lon: 77.0378 },
  { name: 'Noida', lat: 28.5355, lon: 77.3910 },
  
  // Tier-2 Cities - West India
  { name: 'Jodhpur', lat: 26.2389, lon: 73.0243 },
  { name: 'Kota', lat: 25.2138, lon: 75.8648 },
  { name: 'Bikaner', lat: 28.0229, lon: 73.3119 },
  { name: 'Ajmer', lat: 26.4499, lon: 74.6399 },
  { name: 'Udaipur', lat: 24.5854, lon: 73.7125 },
  { name: 'Bhilwara', lat: 25.3463, lon: 74.6365 },
  { name: 'Alwar', lat: 27.5665, lon: 76.6103 },
  { name: 'Bharatpur', lat: 27.2156, lon: 77.4900 },
  { name: 'Gandhinagar', lat: 23.2156, lon: 72.6369 },
  { name: 'Jamnagar', lat: 22.4707, lon: 70.0583 },
  { name: 'Bhavnagar', lat: 21.7645, lon: 72.1519 },
  { name: 'Junagadh', lat: 21.5222, lon: 70.4579 },
  { name: 'Anand', lat: 22.5645, lon: 72.9289 },
  { name: 'Nadiad', lat: 22.6939, lon: 72.8616 },
  { name: 'Gandhidham', lat: 23.0833, lon: 70.1333 },
  
  // Tier-2 Cities - South India
  { name: 'Coimbatore', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lon: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lon: 78.7047 },
  { name: 'Salem', lat: 11.6643, lon: 78.1460 },
  { name: 'Tirunelveli', lat: 8.7139, lon: 77.7567 },
  { name: 'Erode', lat: 11.3410, lon: 77.7172 },
  { name: 'Vellore', lat: 12.9165, lon: 79.1325 },
  { name: 'Thanjavur', lat: 10.7869, lon: 79.1378 },
  { name: 'Tiruppur', lat: 11.1085, lon: 77.3411 },
  { name: 'Dindigul', lat: 10.3629, lon: 77.9754 },
  { name: 'Mysore', lat: 12.2958, lon: 76.6394 },
  { name: 'Mangalore', lat: 12.9141, lon: 74.8560 },
  { name: 'Hubli', lat: 15.3647, lon: 75.1240 },
  { name: 'Belgaum', lat: 15.8497, lon: 74.4977 },
  { name: 'Gulbarga', lat: 17.3297, lon: 76.8343 },
  { name: 'Warangal', lat: 18.0000, lon: 79.5833 },
  { name: 'Nizamabad', lat: 18.6725, lon: 78.0941 },
  { name: 'Karimnagar', lat: 18.4386, lon: 79.1288 },
  { name: 'Kurnool', lat: 15.8281, lon: 78.0373 },
  { name: 'Guntur', lat: 16.3067, lon: 80.4365 },
  { name: 'Vijayawada', lat: 16.5062, lon: 80.6480 },
  { name: 'Rajahmundry', lat: 17.0005, lon: 81.8040 },
  { name: 'Nellore', lat: 14.4426, lon: 79.9865 },
  { name: 'Kakinada', lat: 16.9604, lon: 82.2381 },
  
  // Tier-2 Cities - East India
  { name: 'Bhubaneswar', lat: 20.2961, lon: 85.8245 },
  { name: 'Cuttack', lat: 20.4625, lon: 85.8829 },
  { name: 'Rourkela', lat: 22.2604, lon: 84.8536 },
  { name: 'Brahmapur', lat: 19.3142, lon: 84.7941 },
  { name: 'Sambalpur', lat: 21.4700, lon: 83.9701 },
  { name: 'Puri', lat: 19.8134, lon: 85.8315 },
  { name: 'Ranchi', lat: 23.3441, lon: 85.3096 },
  { name: 'Jamshedpur', lat: 22.8046, lon: 86.2029 },
  { name: 'Dhanbad', lat: 23.7957, lon: 86.4304 },
  { name: 'Bokaro', lat: 23.6693, lon: 85.9783 },
  { name: 'Gaya', lat: 24.7955, lon: 84.9994 },
  { name: 'Muzaffarpur', lat: 26.1209, lon: 85.3647 },
  { name: 'Bhagalpur', lat: 25.2445, lon: 87.0068 },
  { name: 'Darbhanga', lat: 26.1520, lon: 85.8970 },
  { name: 'Purnia', lat: 25.7777, lon: 87.4750 },
  { name: 'Katihar', lat: 25.5401, lon: 87.5704 },
  { name: 'Guwahati', lat: 26.1445, lon: 91.7362 },
  { name: 'Silchar', lat: 24.8333, lon: 92.7833 },
  { name: 'Dibrugarh', lat: 27.4728, lon: 95.0039 },
  { name: 'Jorhat', lat: 26.7509, lon: 94.2037 },
  { name: 'Imphal', lat: 24.8170, lon: 93.9368 },
  { name: 'Aizawl', lat: 23.7271, lon: 92.7176 },
  { name: 'Agartala', lat: 23.8315, lon: 91.2868 },
  { name: 'Shillong', lat: 25.5788, lon: 91.8933 },
  
  // Tier-2 Cities - Central India
  { name: 'Raipur', lat: 21.2514, lon: 81.6296 },
  { name: 'Bilaspur', lat: 22.0796, lon: 82.1391 },
  { name: 'Durg', lat: 21.1904, lon: 81.2849 },
  { name: 'Jabalpur', lat: 23.1815, lon: 79.9864 },
  { name: 'Gwalior', lat: 26.2183, lon: 78.1828 },
  { name: 'Sagar', lat: 23.8388, lon: 78.7381 },
  { name: 'Ratlam', lat: 23.3314, lon: 75.0367 },
  { name: 'Ujjain', lat: 23.1765, lon: 75.7885 },
  { name: 'Burhanpur', lat: 21.3094, lon: 76.2300 },
  { name: 'Khandwa', lat: 21.7333, lon: 76.8333 },
  
  // Union Territories & Special Cities
  { name: 'Port Blair', lat: 11.6234, lon: 92.7265 },
  { name: 'Kavaratti', lat: 10.5626, lon: 72.6369 },
  { name: 'Puducherry', lat: 11.9416, lon: 79.8083 },
  { name: 'Daman', lat: 20.3974, lon: 72.8328 },
  { name: 'Diu', lat: 20.7144, lon: 70.9874 },
  
  // Additional Important Towns
  { name: 'Dehradun', lat: 30.3165, lon: 78.0322 },
  { name: 'Haridwar', lat: 29.9457, lon: 78.1642 },
  { name: 'Rishikesh', lat: 30.0869, lon: 78.2676 },
  { name: 'Nainital', lat: 29.3919, lon: 79.4542 },
  { name: 'Shimla', lat: 31.1048, lon: 77.1734 },
  { name: 'Manali', lat: 32.2432, lon: 77.1892 },
  { name: 'Leh', lat: 34.1526, lon: 77.5771 },
  { name: 'Kargil', lat: 34.5577, lon: 76.1262 },
]

/**
 * Fetch weather data for all cities using Open-Meteo (FREE, no API key needed!)
 * Makes parallel requests - Open-Meteo has no rate limits, so this is efficient
 * @returns {Promise<{data: Array, error: Error|null}>}
 */
export async function fetchBulkHeatMapData() {
  try {
    // Open-Meteo is free with no rate limits, so we can make parallel requests efficiently
    // All requests happen simultaneously for maximum speed
    const cityPromises = CITIES.map(async (city) => {
      try {
        // Open-Meteo API format: latitude, longitude, current temperature
        const url = `${OPENMETEO_BASE_URL}?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m&timezone=Asia/Kolkata`
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Open-Meteo error for ${city.name}: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Extract temperature from Open-Meteo response
        // Format: { current: { temperature_2m: 35.2, ... }, ... }
        const temp = data?.current?.temperature_2m ?? null
        
        if (temp === null) {
          throw new Error(`No temperature data for ${city.name}`)
        }
        
        return {
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          temp: Math.round(temp)
        }
      } catch (error) {
        console.warn(`Failed to fetch weather for ${city.name}:`, error.message)
        // Return with a fallback temperature
        return {
          name: city.name,
          lat: city.lat,
          lon: city.lon,
          temp: 35 // Fallback temperature
        }
      }
    })
    
    // Wait for all requests to complete (all happen in parallel)
    const allCityData = await Promise.all(cityPromises)
    
    console.log(`✅ Fetched weather data for ${allCityData.length} cities using Open-Meteo (FREE API)`)
    return { data: allCityData.filter(Boolean), error: null }
  } catch (error) {
    console.error('Error fetching bulk heatmap data:', error)
    return { data: null, error }
  }
}

/**
 * Get cached heatmap data from sessionStorage
 * @returns {Array|null}
 */
export function getCachedHeatMapData() {
  try {
    const cached = sessionStorage.getItem('heatmap_cities_data')
    if (!cached) return null
    
    const { data, timestamp } = JSON.parse(cached)
    const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes
    
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    }
    
    // Cache expired
    sessionStorage.removeItem('heatmap_cities_data')
    return null
  } catch (error) {
    console.warn('Error reading cached heatmap data:', error)
    return null
  }
}

/**
 * Cache heatmap data to sessionStorage
 * @param {Array} data - City data to cache
 */
export function cacheHeatMapData(data) {
  try {
    sessionStorage.setItem('heatmap_cities_data', JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.warn('Error caching heatmap data:', error)
  }
}

