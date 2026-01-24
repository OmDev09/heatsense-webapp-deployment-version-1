import { useState, useMemo, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp, MapPin, Search, Loader2, Navigation, Phone, Globe, Clock, Map } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { findNearbyCoolingCenters, searchCoolingCentersByCity, openGoogleMapsDirections } from '../../services/coolingCenterService.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getUserProfile } from '../../services/databaseService.js'
import CommunitySupport from '../CommunitySupport.jsx'
import heatstrokeVideo from './How to Spot and Treat Heatstroke Step-by-Step Safety Guide.mp4'

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icon for cooling centers
const coolingCenterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Custom icon for user location
const userLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to center map on user location
function MapCenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom)
    }
  }, [map, center, zoom])
  return null
}

export default function SafetyGuide() {
  const { t } = useTranslation()
  const auth = useAuth()
  const { user } = auth || {}
  
  // Map and cooling centers state
  const [userLocation, setUserLocation] = useState(null)
  const [coolingCenters, setCoolingCenters] = useState([])
  const [loadingCenters, setLoadingCenters] = useState(false)
  const [mapCenter, setMapCenter] = useState([28.6139, 77.2090]) // Default to Delhi
  const [mapZoom, setMapZoom] = useState(13)
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [locationError, setLocationError] = useState(null)
  
  const heatIllnesses = useMemo(() => [
    {
      id: 'exhaustion',
      title: t('safetyGuide.heatExhaustion.title'),
      symptoms: t('safetyGuide.heatExhaustion.symptoms'),
      whatToDo: t('safetyGuide.heatExhaustion.whatToDo'),
      expanded: true
    },
    {
      id: 'cramps',
      title: t('safetyGuide.heatCramps.title'),
      symptoms: t('safetyGuide.heatCramps.symptoms'),
      whatToDo: t('safetyGuide.heatCramps.whatToDo'),
      expanded: false
    },
    {
      id: 'sunburn',
      title: t('safetyGuide.sunburn.title'),
      symptoms: t('safetyGuide.sunburn.symptoms'),
      whatToDo: t('safetyGuide.sunburn.whatToDo'),
      expanded: false
    },
    {
      id: 'rash',
      title: t('safetyGuide.heatRash.title'),
      symptoms: t('safetyGuide.heatRash.symptoms'),
      whatToDo: t('safetyGuide.heatRash.whatToDo'),
      expanded: false
    }
  ], [t])
  const [expandedItems, setExpandedItems] = useState({
    exhaustion: true,
    cramps: false,
    sunburn: false,
    rash: false
  })
  const [searchQuery, setSearchQuery] = useState('')

  const toggleItem = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  // Get user's location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser')
        return
      }

      // Try to get location from user profile first
      if (user) {
        try {
          const { data: profile } = await getUserProfile(user.id)
          if (profile?.home_city) {
            // Try to get coordinates from settings or use geolocation
            const settings = JSON.parse(localStorage.getItem(`dev_settings_${user.id}`) || '{}')
            if (settings.lat && settings.lon) {
              const location = { lat: settings.lat, lon: settings.lon }
              setUserLocation(location)
              setMapCenter([location.lat, location.lon])
              loadCoolingCenters(location.lat, location.lon)
              return
            }
          }
        } catch (err) {
          console.warn('Could not get profile:', err)
        }
      }

      // Fallback to browser geolocation
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          }
          setUserLocation(location)
          setMapCenter([location.lat, location.lon])
          loadCoolingCenters(location.lat, location.lon)
          setLocationError(null)
        },
        (error) => {
          console.error('Geolocation error:', error)
          let errorMessage = 'Unable to get your location'
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access in your browser settings.'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out.'
              break
          }
          setLocationError(errorMessage)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }

    getUserLocation()
  }, [user])

  const loadCoolingCenters = async (lat, lon) => {
    if (!lat || !lon) return
    
    setLoadingCenters(true)
    try {
      const centers = await findNearbyCoolingCenters(lat, lon, 5000)
      setCoolingCenters(centers)
    } catch (error) {
      console.error('Error loading cooling centers:', error)
      setLocationError('Failed to load cooling centers. Please try again.')
    } finally {
      setLoadingCenters(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setLoadingCenters(true)
    setLocationError(null)
    
    try {
      const centers = await searchCoolingCentersByCity(searchQuery.trim())
      if (centers.length > 0) {
        setCoolingCenters(centers)
        // Center map on first result
        setMapCenter([centers[0].lat, centers[0].lon])
        setMapZoom(13)
      } else {
        setLocationError(`No cooling centers found near "${searchQuery}"`)
        setCoolingCenters([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setLocationError('Failed to search for cooling centers. Please try again.')
    } finally {
      setLoadingCenters(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        }
        setUserLocation(location)
        setMapCenter([location.lat, location.lon])
        setMapZoom(13)
        loadCoolingCenters(location.lat, location.lon)
        setLocationError(null)
      },
      (error) => {
        let errorMessage = 'Unable to get your location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.'
            break
        }
        setLocationError(errorMessage)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // Handle get directions
  const handleGetDirections = (center) => {
    openGoogleMapsDirections(
      center.lat,
      center.lon,
      userLocation?.lat || null,
      userLocation?.lon || null,
      center.name
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Heatstroke: A Medical Emergency */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {t('safetyGuide.heatstroke.title')}
          </h2>
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
            <video
              width="100%"
              height="100%"
              controls
              className="w-full h-full object-contain"
              preload="metadata"
              poster=""
            >
              <source
                src={heatstrokeVideo}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="mt-4 text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-2">{t('safetyGuide.heatstroke.description')}</p>
            <p className="text-sm">{t('safetyGuide.heatstroke.symptoms')}</p>
            <p className="text-sm mt-2 font-semibold text-red-600 dark:text-red-400">{t('safetyGuide.heatstroke.emergency')}</p>
          </div>
        </section>

        {/* Recognizing Other Heat-Related Illnesses */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('safetyGuide.recognizing.title')}
          </h2>
          <div className="space-y-3">
            {heatIllnesses.map((illness) => {
              const isExpanded = expandedItems[illness.id]
              return (
                <div
                  key={illness.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleItem(illness.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {illness.title}
                    </h3>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3 transition-all duration-300 ease-in-out">
                      <div>
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {t('safetyGuide.symptoms')}:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {illness.symptoms}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-1">
                          {t('safetyGuide.whatToDo')}:
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {illness.whatToDo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Community Support & Resources */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <CommunitySupport />
        </section>

        {/* Find a Cooling Center Near You */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {t('safetyGuide.coolingCenter.title')}
          </h2>
          
          {/* Interactive Map */}
          <div className="w-full aspect-video rounded-lg mb-6 overflow-hidden border border-gray-200 dark:border-gray-700 relative">
            {loadingCenters && (
              <div className="absolute inset-0 bg-black/20 dark:bg-black/40 z-[1000] flex items-center justify-center">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center gap-3 shadow-lg">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Loading cooling centers...
                  </span>
                </div>
              </div>
            )}
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapCenter center={mapCenter} zoom={mapZoom} />
              
              {/* User location marker */}
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lon]} icon={userLocationIcon}>
                  <Popup>
                    <div className="text-sm font-semibold">Your Location</div>
                  </Popup>
                </Marker>
              )}
              
              {/* Cooling center markers */}
              {coolingCenters.map((center) => (
                <Marker
                  key={center.id}
                  position={[center.lat, center.lon]}
                  icon={coolingCenterIcon}
                  eventHandlers={{
                    click: () => setSelectedCenter(center),
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900 mb-1">{center.name}</div>
                      <div className="text-gray-600 text-xs mb-1">{center.type}</div>
                      <div className="text-gray-500 text-xs mb-2 flex items-center justify-between">
                        <span>
                          {center.distance < 1000
                            ? `${center.distance}m away`
                            : `${(center.distance / 1000).toFixed(1)}km away`}
                        </span>
                        <button
                          onClick={() => handleGetDirections(center)}
                          className="px-2 py-1 bg-primary hover:bg-red-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                        >
                          <Map className="h-3 w-3" />
                          Directions
                        </button>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('safetyGuide.coolingCenter.searchPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loadingCenters}
              className="px-6 py-3 bg-primary hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all min-w-[140px] flex items-center justify-center gap-2"
            >
              {loadingCenters ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                t('safetyGuide.coolingCenter.findButton')
              )}
            </button>
            <button
              type="button"
              onClick={handleUseMyLocation}
              disabled={loadingCenters}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-all"
              title="Use my current location"
            >
              <Navigation className="h-5 w-5" />
            </button>
          </form>

          {/* Error message */}
          {locationError && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{locationError}</p>
            </div>
          )}

          {/* Cooling Centers List */}
          {coolingCenters.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Found {coolingCenters.length} Cooling Center{coolingCenters.length !== 1 ? 's' : ''}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {coolingCenters.map((center) => (
                  <div
                    key={center.id}
                    onClick={() => {
                      setSelectedCenter(center)
                      setMapCenter([center.lat, center.lon])
                      setMapZoom(15)
                    }}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedCenter?.id === center.id
                        ? 'border-primary bg-primary/5 dark:bg-primary/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {center.name}
                            </h4>
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                              {center.type}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleGetDirections(center)
                            }}
                            className="px-2 py-1 bg-primary hover:bg-red-600 text-white text-xs font-medium rounded transition-colors flex items-center gap-1"
                          >
                            <Map className="h-3 w-3" />
                            Directions
                          </button>
                        </div>
                        {center.address && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {center.address}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Navigation className="h-3 w-3" />
                            {center.distance < 1000
                              ? `${center.distance}m away`
                              : `${(center.distance / 1000).toFixed(1)}km away`}
                          </span>
                          {center.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {center.phone}
                            </span>
                          )}
                          {center.openingHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {center.openingHours}
                            </span>
                          )}
                        </div>
                      </div>
                      {center.website && (
                        <a
                          href={center.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Visit website"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {!loadingCenters && searchQuery && coolingCenters.length === 0 && !locationError && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No cooling centers found near "{searchQuery}". Try searching for a different location.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

