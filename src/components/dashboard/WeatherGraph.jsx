import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

/**
 * Custom Tooltip component for the weather graph
 */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{data.time}</p>
        <p className="text-lg font-bold text-orange-500">{data.temp}°C</p>
      </div>
    )
  }
  return null
}

/**
 * WeatherGraph component - Displays 12-hour temperature forecast as an area chart
 * @param {Object} props
 * @param {Array} props.data - Array of { time, temp, icon } objects
 */
export default function WeatherGraph({ data = [] }) {
  // Transform data for recharts (ensure temp is a number)
  const chartData = data.map(item => ({
    time: item.time,
    temp: Number(item.temp) || 0,
    icon: item.icon
  }))

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>No forecast data available</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full" style={{ width: '100%', height: '100%', minWidth: 0, minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
          <XAxis
            dataKey="time"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            className="dark:stroke-gray-400 dark:text-gray-400"
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            className="dark:stroke-gray-400 dark:text-gray-400"
            domain={['dataMin - 2', 'dataMax + 2']}
            hide={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#f97316"
            strokeWidth={2}
            fill="url(#colorTemp)"
            dot={{ fill: '#f97316', r: 4 }}
            activeDot={{ r: 6, fill: '#f97316' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

