function norm(str) {
  return String(str || '').trim().toLowerCase()
}

/**
 * Get indoor temperature penalty based on housing/roof type
 * @param {string|null|undefined} housingType - Housing type (tin_sheet, asbestos, thatched, concrete, tiled, hut, etc.)
 * @returns {number} Temperature adjustment in degrees Celsius
 */
export function getIndoorTempPenalty(housingType) {
  if (!housingType) return 0
  
  const normalized = String(housingType).trim().toLowerCase()
  
  if (normalized === 'tin_sheet') return 4
  if (normalized === 'asbestos') return 2
  if (normalized === 'hut' || normalized === 'thatched') return -1
  // All others (concrete, tiled, etc.): 0
  return 0
}

export function calculateRiskScore(userData, weatherData) {
  const feels = weatherData?.feels_like ?? weatherData?.main?.feels_like ?? 0
  const hum = weatherData?.humidity ?? weatherData?.main?.humidity ?? 0
  const age = Number(userData?.age ?? 0)
  const occ = norm(userData?.occupation)
  const conds = Array.isArray(userData?.conditions) ? userData.conditions.map(norm) : []
  const housingType = userData?.housing_type || null

  // Calculate adjusted temperature based on housing type
  const tempPenalty = getIndoorTempPenalty(housingType)
  const adjustedTemp = feels + tempPenalty

  let score = 0

  // Use adjustedTemp for risk scoring instead of raw feels_like
  if (adjustedTemp > 45) score += 40
  else if (adjustedTemp >= 40) score += 30
  else if (adjustedTemp >= 35) score += 20
  else if (adjustedTemp >= 30) score += 10

  if (hum > 70) score += 10

  if (age < 5 || age > 60) score += 20
  else if ((age >= 5 && age <= 18) || (age >= 50 && age <= 60)) score += 10

  // Occupation-based risk scoring
  // High-risk occupations (outdoor workers)
  if (occ.includes('outdoor') || occ.includes('delivery') || occ.includes('construction')) {
    score += 20
  }
  // Vulnerable groups (high risk due to physiological factors)
  else if (occ.includes('pregnant')) {
    score += 25 // Pregnant women are highly vulnerable to heat stress
  }
  else if (occ.includes('senior')) {
    score += 20 // Seniors are highly vulnerable
  }
  // Moderate risk groups
  else if (occ.includes('student')) {
    score += 10 // Students/children are vulnerable, especially if under 18 (age already factored)
  }
  else if (occ.includes('homemaker')) {
    score += 5 // Homemakers may be indoors but still vulnerable depending on housing
  }
  // Low-risk occupations (indoor/office workers)
  else if (occ.includes('indoor') || occ.includes('office')) {
    score += 5
  }

  const chronicKeys = ['heart', 'diabetes', 'respiratory', 'bp', 'hypertension']
  const chronicCount = conds.reduce((acc, c) => acc + (chronicKeys.some(k => c.includes(k)) ? 1 : 0), 0)
  score += chronicCount * 15

  if (score < 0) score = 0
  if (score > 100) score = 100
  
  return { score, adjustedTemp }
}

export function getRiskLevel(score) {
  if (score <= 30) return 'Low'
  if (score <= 60) return 'Medium'
  if (score <= 80) return 'High'
  return 'Critical'
}

export function getRiskColor(level) {
  const l = norm(level)
  if (l === 'low') return '#10B981'
  if (l === 'medium') return '#F59E0B'
  if (l === 'high') return '#F97316'
  return '#EF4444'
}

export function calculateRisk(userData, weatherData) {
  const { score, adjustedTemp } = calculateRiskScore(userData, weatherData)
  const level = getRiskLevel(score)
  const color = getRiskColor(level)
  return { score, level, color, adjustedTemp }
}