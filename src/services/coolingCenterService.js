/**
 * Service to find nearby cooling centers
 * Uses Overpass API (OpenStreetMap) to find public facilities that can serve as cooling centers
 * Enhanced with hyperlocal data including India-specific locations
 */

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter'

/**
 * Find nearby cooling centers using OpenStreetMap data
 * Enhanced search for hyperlocal coverage including India-specific facilities
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number} radius - Search radius in meters (default: 5000 = 5km)
 * @returns {Promise<Array>} Array of cooling center objects
 */
export async function findNearbyCoolingCenters(lat, lon, radius = 5000) {
  if (!lat || !lon) {
    throw new Error('Latitude and longitude are required')
  }

  try {
    // Enhanced Overpass QL query with more facility types for hyperlocal coverage
    const query = `
      [out:json][timeout:30];
      (
        // Community centers, community halls
        node["amenity"="community_centre"](around:${radius},${lat},${lon});
        way["amenity"="community_centre"](around:${radius},${lat},${lon});
        relation["amenity"="community_centre"](around:${radius},${lat},${lon});
        
        // Libraries
        node["amenity"="library"](around:${radius},${lat},${lon});
        way["amenity"="library"](around:${radius},${lat},${lon});
        relation["amenity"="library"](around:${radius},${lat},${lon});
        
        // Shopping malls
        node["shop"="mall"](around:${radius},${lat},${lon});
        way["shop"="mall"](around:${radius},${lat},${lon});
        relation["shop"="mall"](around:${radius},${lat},${lon});
        
        // Hospitals and clinics
        node["amenity"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
        way["amenity"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
        relation["amenity"~"^(hospital|clinic)$"](around:${radius},${lat},${lon});
        
        // Public buildings
        node["building"="public"](around:${radius},${lat},${lon});
        way["building"="public"](around:${radius},${lat},${lon});
        relation["building"="public"](around:${radius},${lat},${lon});
        
        // Public parks
        node["leisure"="park"](around:${radius},${lat},${lon});
        way["leisure"="park"](around:${radius},${lat},${lon});
        relation["leisure"="park"](around:${radius},${lat},${lon});
        
        // Gardens
        node["leisure"="garden"](around:${radius},${lat},${lon});
        way["leisure"="garden"](around:${radius},${lat},${lon});
        relation["leisure"="garden"](around:${radius},${lat},${lon});
        
        // Metro stations (India-specific)
        node["railway"="station"]["station"="subway"](around:${radius},${lat},${lon});
        way["railway"="station"]["station"="subway"](around:${radius},${lat},${lon});
        relation["railway"="station"]["station"="subway"](around:${radius},${lat},${lon});
        
        // Railway stations
        node["railway"="station"](around:${radius},${lat},${lon});
        way["railway"="station"](around:${radius},${lat},${lon});
        relation["railway"="station"](around:${radius},${lat},${lon});
        
        // Bus stations
        node["amenity"="bus_station"](around:${radius},${lat},${lon});
        way["amenity"="bus_station"](around:${radius},${lat},${lon});
        relation["amenity"="bus_station"](around:${radius},${lat},${lon});
        
        // Religious places (temples, mosques, churches - often have cooling areas)
        node["amenity"~"^(place_of_worship|temple|mosque|church)$"](around:${radius},${lat},${lon});
        way["amenity"~"^(place_of_worship|temple|mosque|church)$"](around:${radius},${lat},${lon});
        relation["amenity"~"^(place_of_worship|temple|mosque|church)$"](around:${radius},${lat},${lon});
        
        // Museums
        node["tourism"="museum"](around:${radius},${lat},${lon});
        way["tourism"="museum"](around:${radius},${lat},${lon});
        relation["tourism"="museum"](around:${radius},${lat},${lon});
        
        // Community halls
        node["amenity"="community_hall"](around:${radius},${lat},${lon});
        way["amenity"="community_hall"](around:${radius},${lat},${lon});
        relation["amenity"="community_hall"](around:${radius},${lat},${lon});
      );
      out center meta;
    `

    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.elements || data.elements.length === 0) {
      return []
    }

    // Process and format the results
    const centers = data.elements
      .filter(element => {
        // Filter out elements without coordinates
        return (element.lat && element.lon) || (element.center && element.center.lat && element.center.lon)
      })
      .map(element => {
        const coords = element.center || { lat: element.lat, lon: element.lon }
        const tags = element.tags || {}
        
        // Determine center type and name (enhanced with more types)
        let type = 'Public Facility'
        let name = tags.name || tags['name:en'] || tags['name:hi'] || tags['name:ta'] || null
        
        // Skip facilities without proper names
        if (!name || name.trim() === '') {
          return null
        }
        
        if (tags.amenity === 'community_centre' || tags.amenity === 'community_hall') {
          type = 'Community Center'
        } else if (tags.amenity === 'library') {
          type = 'Library'
        } else if (tags.shop === 'mall') {
          type = 'Shopping Mall'
        } else if (tags.amenity === 'hospital') {
          type = 'Hospital'
        } else if (tags.amenity === 'clinic') {
          type = 'Clinic'
        } else if (tags.leisure === 'park') {
          type = 'Public Park'
        } else if (tags.leisure === 'garden') {
          type = 'Garden'
        } else if (tags.railway === 'station' && tags.station === 'subway') {
          type = 'Metro Station'
        } else if (tags.railway === 'station') {
          type = 'Railway Station'
        } else if (tags.amenity === 'bus_station') {
          type = 'Bus Station'
        } else if (tags.amenity === 'place_of_worship' || tags.amenity === 'temple' || tags.amenity === 'mosque' || tags.amenity === 'church') {
          type = 'Place of Worship'
        } else if (tags.tourism === 'museum') {
          type = 'Museum'
        }

        // Calculate distance (simple haversine approximation)
        const distance = calculateDistance(lat, lon, coords.lat, coords.lon)

        return {
          id: element.id,
          name,
          type,
          lat: coords.lat,
          lon: coords.lon,
          distance: Math.round(distance), // in meters
          address: tags['addr:full'] || tags['addr:street'] || tags.address || null,
          phone: tags.phone || tags['contact:phone'] || null,
          website: tags.website || tags['contact:website'] || null,
          openingHours: tags['opening_hours'] || null,
          tags,
        }
      })
      .filter(center => center !== null) // Remove unnamed facilities
      .filter(center => center.distance < 5000) // Only show centers within 5km radius
      .sort((a, b) => a.distance - b.distance) // Sort by distance
      .slice(0, 50) // Increased limit to 50 for better hyperlocal coverage

    return centers
  } catch (error) {
    console.error('Error fetching cooling centers:', error)
    // Return mock data as fallback
    return getMockCoolingCenters(lat, lon)
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

/**
 * Get mock cooling centers for fallback or testing
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Array} Array of mock cooling center objects
 */
function getMockCoolingCenters(lat, lon) {
  // Generate mock centers around the user's location
  const mockCenters = [
    {
      id: 'mock-1',
      name: 'Community Center',
      type: 'Community Center',
      lat: lat + 0.01,
      lon: lon + 0.01,
      distance: 1200,
      address: '123 Main Street',
      phone: '+1-555-0101',
      website: null,
      openingHours: 'Mon-Fri 9:00-17:00',
    },
    {
      id: 'mock-2',
      name: 'Public Library',
      type: 'Library',
      lat: lat - 0.008,
      lon: lon + 0.012,
      distance: 1500,
      address: '456 Oak Avenue',
      phone: '+1-555-0102',
      website: null,
      openingHours: 'Mon-Sat 10:00-18:00',
    },
    {
      id: 'mock-3',
      name: 'City Mall',
      type: 'Shopping Mall',
      lat: lat + 0.015,
      lon: lon - 0.005,
      distance: 2000,
      address: '789 Commerce Boulevard',
      phone: '+1-555-0103',
      website: null,
      openingHours: 'Daily 10:00-21:00',
    },
    {
      id: 'mock-4',
      name: 'Regional Hospital',
      type: 'Hospital',
      lat: lat - 0.012,
      lon: lon - 0.008,
      distance: 2500,
      address: '321 Health Way',
      phone: '+1-555-0104',
      website: null,
      openingHours: '24/7',
    },
    {
      id: 'mock-5',
      name: 'Central Park',
      type: 'Public Park',
      lat: lat + 0.008,
      lon: lon - 0.01,
      distance: 1800,
      address: 'Park Avenue',
      phone: null,
      website: null,
      openingHours: 'Daily 6:00-22:00',
    },
    {
      id: 'mock-6',
      name: 'Botanical Garden',
      type: 'Garden',
      lat: lat - 0.015,
      lon: lon + 0.008,
      distance: 2200,
      address: 'Garden Street',
      phone: '+1-555-0105',
      website: null,
      openingHours: 'Daily 8:00-18:00',
    },
  ]

  return mockCenters
}

/**
 * Search for cooling centers by city name
 * @param {string} cityName - City name to search
 * @returns {Promise<Array>} Array of cooling center objects
 */
export async function searchCoolingCentersByCity(cityName) {
  if (!cityName || cityName.trim() === '') {
    return []
  }

  try {
    // First, geocode the city name to get coordinates
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1`
    const geocodeResponse = await fetch(geocodeUrl, {
      headers: {
        'User-Agent': 'HeatSense-AI/1.0',
      },
    })

    if (!geocodeResponse.ok) {
      throw new Error('Geocoding failed')
    }

    const geocodeData = await geocodeResponse.json()
    
    if (geocodeData.length === 0) {
      return []
    }

    const { lat, lon } = geocodeData[0]
    return await findNearbyCoolingCenters(parseFloat(lat), parseFloat(lon))
  } catch (error) {
    console.error('Error searching cooling centers by city:', error)
    return []
  }
}

/**
 * Generate Google Maps directions URL
 * Opens Google Maps with navigation to the cooling center
 * @param {number} destLat - Destination latitude
 * @param {number} destLon - Destination longitude
 * @param {number|null} userLat - User's current latitude (optional)
 * @param {number|null} userLon - User's current longitude (optional)
 * @param {string} destinationName - Name of the destination (optional)
 * @returns {string} Google Maps URL
 */
export function getGoogleMapsDirectionsUrl(destLat, destLon, userLat = null, userLon = null, destinationName = '') {
  // If user location is provided, use directions mode
  if (userLat && userLon) {
    const encodedName = encodeURIComponent(destinationName || 'Cooling Center')
    // Directions URL format: https://www.google.com/maps/dir/?api=1&origin=lat,lon&destination=lat,lon&destination_place_id=name
    return `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}&destination_place_id=${encodedName}`
  }
  
  // If no user location, just open the location
  return `https://www.google.com/maps/search/?api=1&query=${destLat},${destLon}`
}

/**
 * Open Google Maps directions in new tab
 * @param {number} destLat - Destination latitude
 * @param {number} destLon - Destination longitude
 * @param {number|null} userLat - User's current latitude (optional)
 * @param {number|null} userLon - User's current longitude (optional)
 * @param {string} destinationName - Name of the destination (optional)
 */
export function openGoogleMapsDirections(destLat, destLon, userLat = null, userLon = null, destinationName = '') {
  const url = getGoogleMapsDirectionsUrl(destLat, destLon, userLat, userLon, destinationName)
  window.open(url, '_blank', 'noopener,noreferrer')
}

