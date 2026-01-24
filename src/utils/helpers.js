export function formatTemp(t) {
  if (t === undefined || t === null || Number.isNaN(Number(t))) return '--°C'
  return `${Math.round(Number(t))}°C`
}