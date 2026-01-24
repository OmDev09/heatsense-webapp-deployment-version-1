import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Loader2 } from 'lucide-react'

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Component to set map bounds to India
function MapBounds() {
  const map = useMap()
  useEffect(() => {
    // Set bounds to India
    map.fitBounds([
      [6.5, 68.0], // Southwest corner
      [37.0, 97.5]  // Northeast corner
    ], { padding: [20, 20] })
  }, [map])
  return null
}

/**
 * Get color based on temperature
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Hex color code
 */
function getTemperatureColor(temp) {
  if (temp >= 45) return '#8B0000' // Dark red - Extreme heat
  if (temp >= 40) return '#DC143C' // Crimson - Very high
  if (temp >= 35) return '#FF4500' // Orange red - High
  if (temp >= 30) return '#FFA500' // Orange - Moderate
  if (temp >= 25) return '#FFD700' // Gold - Warm
  return '#87CEEB' // Sky blue - Normal
}

/**
 * Get risk level based on temperature
 * @param {number} temp - Temperature in Celsius
 * @returns {string} Risk level
 */
function getRiskLevel(temp) {
  if (temp >= 45) return 'Extreme'
  if (temp >= 40) return 'Very High'
  if (temp >= 35) return 'High'
  if (temp >= 30) return 'Moderate'
  if (temp >= 25) return 'Warm'
  return 'Normal'
}

/**
 * Major Indian cities with approximate coordinates and mock temperature data
 * In production, this would be fetched from an API
 */
const indianCities = [
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, temp: 42 },
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, temp: 35 },
  { name: 'Bangalore', lat: 12.9716, lon: 77.5946, temp: 32 },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, temp: 38 },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, temp: 39 },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, temp: 40 },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, temp: 36 },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, temp: 41 },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, temp: 43 },
  { name: 'Surat', lat: 21.1702, lon: 72.8311, temp: 37 },
  { name: 'Lucknow', lat: 26.8467, lon: 80.9462, temp: 40 },
  { name: 'Kanpur', lat: 26.4499, lon: 80.3319, temp: 41 },
  { name: 'Nagpur', lat: 21.1458, lon: 79.0882, temp: 42 },
  { name: 'Indore', lat: 22.7196, lon: 75.8577, temp: 38 },
  { name: 'Thane', lat: 19.2183, lon: 72.9781, temp: 35 },
  { name: 'Bhopal', lat: 23.2599, lon: 77.4126, temp: 39 },
  { name: 'Visakhapatnam', lat: 17.6868, lon: 83.2185, temp: 36 },
  { name: 'Patna', lat: 25.5941, lon: 85.1376, temp: 38 },
  { name: 'Vadodara', lat: 22.3072, lon: 73.1812, temp: 37 },
  { name: 'Ghaziabad', lat: 28.6692, lon: 77.4538, temp: 41 },
  { name: 'Ludhiana', lat: 30.9010, lon: 75.8573, temp: 39 },
  { name: 'Agra', lat: 27.1767, lon: 78.0081, temp: 44 },
  { name: 'Nashik', lat: 19.9975, lon: 73.7898, temp: 36 },
  { name: 'Faridabad', lat: 28.4089, lon: 77.3178, temp: 42 },
  { name: 'Meerut', lat: 28.9845, lon: 77.7064, temp: 40 },
  { name: 'Rajkot', lat: 22.3039, lon: 70.8022, temp: 38 },
  { name: 'Varanasi', lat: 25.3176, lon: 82.9739, temp: 41 },
  { name: 'Srinagar', lat: 34.0837, lon: 74.7973, temp: 28 },
  { name: 'Amritsar', lat: 31.6340, lon: 74.8723, temp: 37 },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, temp: 38 },
]

export default function HeatMap({ cityData = null, loading = false }) {
  const [cities, setCities] = useState(indianCities)

  // Update city temperatures if real data is provided
  useEffect(() => {
    if (cityData && Array.isArray(cityData) && cityData.length > 0) {
      setCities(prevCities => {
        return prevCities.map(city => {
          const updated = cityData.find(c => 
            c.name?.toLowerCase() === city.name.toLowerCase() ||
            (Math.abs(c.lat - city.lat) < 0.5 && Math.abs(c.lon - city.lon) < 0.5)
          )
          return updated ? { ...city, temp: updated.temp || city.temp } : city
        })
      })
    }
  }, [cityData])

  return (
    <div className="w-full h-full relative">
      {loading && (
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-[1000] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Loading real-time weather data...
            </span>
          </div>
        </div>
      )}
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds />
        
        {/* Heat markers for each city */}
        {cities.map((city, index) => {
          const color = getTemperatureColor(city.temp)
          const riskLevel = getRiskLevel(city.temp)
          const radius = Math.max(8, Math.min(20, city.temp / 2)) // Scale radius based on temperature
          
          return (
            <CircleMarker
              key={`${city.name}-${index}`}
              center={[city.lat, city.lon]}
              radius={radius}
              pathOptions={{
                fillColor: color,
                color: color,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-gray-900 mb-1">{city.name}</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-600">Temperature:</span>
                    <span className="font-bold" style={{ color }}>
                      {city.temp}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Risk Level:</span>
                    <span className="font-semibold" style={{ color }}>
                      {riskLevel}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 z-[1000] border border-gray-200 dark:border-gray-700">
        <div className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Temperature Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#87CEEB' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">&lt; 25°C (Normal)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFD700' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">25-30°C (Warm)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FFA500' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">30-35°C (Moderate)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#FF4500' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">35-40°C (High)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#DC143C' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">40-45°C (Very High)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#8B0000' }}></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">≥ 45°C (Extreme)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

