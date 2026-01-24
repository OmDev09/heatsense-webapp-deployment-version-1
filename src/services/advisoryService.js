function norm(x) {
  return String(x || '').trim().toLowerCase()
}

export function getAdvisories(riskLevel) {
  const lvl = norm(riskLevel)
  if (lvl === 'critical') {
    return {
      hydration: ['Drink water every 15-20 minutes'],
      activity: ['Avoid all outdoor activities'],
      location: ['Stay in air-conditioned spaces'],
      warning: ['Seek medical help if dizzy or nauseous'],
      safety: ['Inform family/colleagues of whereabouts']
    }
  }
  if (lvl === 'high') {
    return {
      hydration: ['Increase water intake significantly'],
      activity: ['Limit outdoor activities to morning/evening'],
      clothing: ['Wear light-colored, loose-fitting clothes'],
      breaks: ['Take frequent breaks in shade'],
      timing: ['Avoid peak sun hours (11 AM - 4 PM)']
    }
  }
  if (lvl === 'medium') {
    return {
      activity: ['Be cautious during outdoor activities'],
      hydration: ['Stay hydrated throughout the day'],
      clothing: ['Wear breathable clothing'],
      protection: ['Use sunscreen and hat'],
      planning: ['Plan outdoor work during cooler hours']
    }
  }
  return {
    normal: ['Normal activities are safe'],
    hydration: ['Maintain regular hydration'],
    monitoring: ['Monitor weather updates'],
    preparation: ['Dress appropriately for weather']
  }
}

export function getEmergencyContacts() {
  return [
    { name: 'National Emergency', number: '112' },
    { name: 'Ambulance', number: '108' },
    { name: 'Fire', number: '101' },
    { name: 'Police', number: '100' }
  ]
}

export function getHealthTips(occupation, healthConditions = []) {
  const occ = norm(occupation)
  const conds = Array.isArray(healthConditions) ? healthConditions.map(norm) : []
  const tips = []

  if (occ.includes('outdoor') || occ.includes('delivery') || occ.includes('construction')) {
    tips.push('Carry water and ORS; sip regularly')
    tips.push('Take shade breaks every 30 minutes')
    tips.push('Avoid peak sun (11 AM - 4 PM)')
  } else if (occ.includes('indoor') || occ.includes('office')) {
    tips.push('Ensure good ventilation and fans')
    tips.push('Drink water at regular intervals')
  } else if (occ.includes('student')) {
    tips.push('Schedule sports in early morning or evening')
    tips.push('Use cap and sunscreen for outdoor activities')
  }

  if (conds.some(c => c.includes('heart'))) tips.push('Avoid strenuous activity; monitor symptoms')
  if (conds.some(c => c.includes('diabetes'))) tips.push('Keep glucose monitored; hydrate frequently')
  if (conds.some(c => c.includes('respiratory'))) tips.push('Avoid polluted, hot air; carry inhaler')
  if (conds.some(c => c.includes('bp') || c.includes('hypertension'))) tips.push('Limit heat exposure; take medication on time')

  return tips
}

export function advisoriesFor(level) {
  const adv = getAdvisories(level)
  return Object.values(adv).flat()
}

/**
 * Get housing-specific cooling tips based on housing type
 * @param {string|null} housingType - Housing type (tin_sheet, asbestos, concrete, tiled, hut, etc.)
 * @returns {Array<string>} Array of housing cooling tips
 */
export function getHousingTips(housingType) {
  if (!housingType) {
    return ['Keep curtains and windows closed during peak afternoon hours (12 PM - 4 PM) to trap cool air inside.']
  }
  
  const normalized = String(housingType).trim().toLowerCase()
  
  if (normalized === 'tin_sheet') {
    return [
      'Cover your roof with wet gunny bags or coir mats during peak hours',
      'Sprinkle water on the roof at 2 PM and 6 PM to reduce indoor heat',
      'Ensure cross-ventilation by opening windows on opposite sides'
    ]
  }
  
  if (normalized === 'asbestos') {
    return [
      'Hang wet bedsheets inside windows to cool incoming air',
      'Do not wet asbestos sheets directly when hot to avoid damage',
      'Use fans to circulate air and create a cooling effect'
    ]
  }
  
  // Default for concrete, tiled, hut, etc.
  return [
    'Keep curtains and windows closed during peak afternoon hours (12 PM - 4 PM) to trap cool air inside.',
    'Use fans or air circulation to maintain airflow',
    'Stay in the coolest room of the house during peak heat hours'
  ]
}