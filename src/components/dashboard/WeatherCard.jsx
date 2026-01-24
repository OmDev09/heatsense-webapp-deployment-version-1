import { formatTemp } from '../../utils/helpers.js'

export default function WeatherCard({ weather }) {
  if (!weather) return <div className="border rounded p-4">Enter a city to view weather</div>
  return (
    <div className="border rounded p-4">
      <div className="font-medium">{weather.name}</div>
      <div className="text-2xl font-black">{formatTemp(weather.main?.temp)}</div>
    </div>
  )
}