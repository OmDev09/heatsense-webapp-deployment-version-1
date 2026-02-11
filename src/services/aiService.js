const groqApiKey = import.meta.env.VITE_GROQ_API_KEY
let groq = null

// Lazy initialization function
async function initializeGroq() {
  if (groq) {
    return groq
  }

  try {
    // Try standard import first
    let GroqClass
    try {
      const groqModule = await import('groq-sdk')
      // Handle different export patterns
      GroqClass = groqModule.default || groqModule.Groq || groqModule
      
      // If it's still an object, try to get the constructor
      if (typeof GroqClass !== 'function' && GroqClass) {
        GroqClass = GroqClass.default || GroqClass.Groq || GroqClass
      }
      
      console.log('📦 Groq SDK imported:', typeof GroqClass !== 'undefined', 'Type:', typeof GroqClass)
    } catch (importError) {
      console.error('❌ Failed to import groq-sdk:', importError)
      return null
    }

    if (!groqApiKey || groqApiKey === 'gsk_your_api_key_here') {
      console.error('❌ AI Service: Invalid API key provided')
      return null
    }

    if (typeof GroqClass === 'function') {
      // WARNING: Using dangerouslyAllowBrowser exposes the API key in the browser.
      // In production, this should be done via a backend API endpoint.
      groq = new GroqClass({ 
        apiKey: groqApiKey,
        dangerouslyAllowBrowser: true 
      })
      console.log('✅ Groq client initialized successfully')
      console.log('✅ Groq client type:', typeof groq, 'Has chat?', !!groq?.chat)
      return groq
    } else {
      console.error('❌ AI Service: Groq constructor not a function. Type:', typeof GroqClass)
      console.error('❌ Groq module structure:', Object.keys(GroqClass || {}))
      return null
    }
  } catch (error) {
    console.error('❌ Failed to initialize Groq client:', error)
    console.error('❌ Error details:', error.message, error.stack)
    return null
  }
}

// Try to initialize immediately (non-blocking)
initializeGroq().catch(err => {
  console.warn('⚠️ Initial Groq initialization failed, will retry on first use:', err)
})

// Request deduplication: Track in-flight API requests to prevent parallel calls
let inFlightRequest = null

// Cache key prefix for sessionStorage
const CACHE_KEY_PREFIX = 'heatwave_advisory_'

/**
 * Generate comprehensive health advisory using Llama 3.3-70B via Groq
 * @param {Object} profile - User profile object { id, age, gender, occupation, health_conditions }
 * @param {Object} weather - Weather object { temp, feels_like, humidity }
 * @param {Object} riskScore - Risk score object { score, level, label }
 * @param {string} language - Language code (e.g., 'en', 'hi', 'ta', 'mr'). Defaults to 'en'
 * @param {boolean} forceRefresh - If true, bypass cache and force a new API call
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function getHeatAdvisory(profile, weather, riskScore, language = 'en', forceRefresh = false) {
  try {
    // Validate inputs
    if (!profile || !weather || !riskScore) {
      return {
        data: null,
        error: new Error('Missing required parameters: profile, weather, or riskScore')
      }
    }

    // Generate cache key based on profile, risk score, housing type, and language
    const profileId = profile.id || profile.user_id || 'anonymous'
    const riskKey = `${riskScore.score}_${riskScore.level}`
    const housingType = profile.housing_type || 'none'
    const lang = language || 'en'
    const cacheKey = `advisory_cache_${profileId}_${riskKey}_${housingType}_${lang}`
    const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

    // Step A: Check cache first (unless forceRefresh is true)
    if (!forceRefresh && typeof sessionStorage !== 'undefined') {
      try {
        const cachedData = sessionStorage.getItem(cacheKey)
        if (cachedData) {
          const cached = JSON.parse(cachedData)
          const cacheAge = Date.now() - cached.timestamp
          
          // If cache is less than 1 hour old, return it
          if (cacheAge < CACHE_DURATION) {
            console.log('⚡ AI Service: Serving from session cache (No API Call)')
            return {
              data: cached.data,
              error: null
            }
          } else {
            // Cache expired, remove it
            sessionStorage.removeItem(cacheKey)
            console.log('⏰ AI Service: Cache expired, fetching fresh data')
          }
        }
      } catch (cacheError) {
        console.warn('⚠️ AI Service: Error reading from cache:', cacheError)
        // Continue to API call if cache read fails
      }
    }

    // Step B: Request Deduplication - If a request is already in flight, reuse it
    if (inFlightRequest) {
      console.log('🛡️ AI Service: Reusing in-flight request (Deduplication)')
      return await inFlightRequest
    }

    // Step C: Create the API call promise and assign it to inFlightRequest
    console.log('🚀 AI Service: Starting NEW API Call')
    
    // Create the API call promise
    inFlightRequest = (async () => {
      try {
        // Ensure Groq client is initialized
        const groqClient = await initializeGroq()
        if (!groqClient) {
          console.warn('⚠️ AI Service: Groq client not initialized. Using fallback advisory.')
          const fallbackData = getFallbackAdvisory(profile, weather, riskScore)
          // Save fallback to cache too (with timestamp)
          if (typeof sessionStorage !== 'undefined') {
            try {
              const cacheData = {
                data: fallbackData,
                timestamp: Date.now()
              }
              sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
            } catch (cacheError) {
              console.warn('⚠️ AI Service: Error saving fallback to cache:', cacheError)
            }
          }
          return {
            data: fallbackData,
            error: null
          }
        }

        // Determine context and tone based on temperature and risk
        let contextInstruction = ''
        let toneInstruction = ''
        
        if (weather.temp < 30) {
          contextInstruction = 'The current temperature is relatively safe. Be informative but calm. Do not create unnecessary alarm. Focus on general heat safety awareness.'
          toneInstruction = 'Informative but calm'
        } else if (weather.temp > 35 || riskScore.label === 'High' || riskScore.label === 'Critical') {
          contextInstruction = 'The current temperature is dangerously high or the user is at high/critical risk. Be urgent and strict in your recommendations. Emphasize immediate action and safety measures.'
          toneInstruction = 'Urgent and strict'
        } else {
          contextInstruction = 'The current temperature is moderate. Provide balanced, practical advice.'
          toneInstruction = 'Balanced and practical'
        }

        // Get current time for peak heat awareness
        const currentHour = new Date().getHours()
        const isPeakHeat = currentHour >= 12 && currentHour <= 16
        const timeContext = isPeakHeat 
          ? `CURRENT TIME: ${currentHour}:00 - This is PEAK HEAT HOURS (12PM-4PM). Extreme caution required.`
          : `CURRENT TIME: ${currentHour}:00`

        // Extract housing type and build housing context
        const housingType = profile.housing_type || null
        let housingContext = ''
        if (housingType) {
          const normalizedHousing = String(housingType).trim().toLowerCase()
          if (normalizedHousing === 'tin_sheet' || normalizedHousing === 'asbestos') {
            housingContext = `HOUSING: User lives in a temporary structure (${normalizedHousing === 'tin_sheet' ? 'Metal/Tin Sheet Roof' : 'Asbestos Sheet'}) with high heat retention. Indoor temperatures can be 3-5°C hotter than outside.`
          } else if (normalizedHousing === 'concrete') {
            housingContext = `HOUSING: User lives in a standard concrete home.`
          } else if (normalizedHousing === 'hut' || normalizedHousing === 'thatched') {
            housingContext = `HOUSING: User lives in a thatched/hut structure.`
          } else if (normalizedHousing === 'tiled') {
            housingContext = `HOUSING: User lives in a tiled roof home.`
          }
        }

        // Build user prompt
        const healthConditionsText = Array.isArray(profile.health_conditions) 
          ? profile.health_conditions.join(', ') || 'None'
          : (profile.health_conditions || 'None')

        const userPrompt = `User: ${profile.age || 'Unknown'}yo ${profile.gender || 'Unknown'}, Occupation: ${profile.occupation || 'Unknown'}.

Health Conditions: ${healthConditionsText}.

Current Weather: ${weather.temp}°C, Humidity ${weather.humidity}%, Feels Like ${weather.feels_like}°C.

${housingContext ? `${housingContext}\n\n` : ''}${timeContext}

Risk Level: ${riskScore.label || riskScore.level || 'Medium'} (${riskScore.score || 0}/100).`

        // Get language name for instructions (lang is already defined in outer scope)
        let langName = 'English'
        let langScript = 'English'
        if (lang === 'ta') {
          langName = 'Tamil'
          langScript = 'Tamil script'
        } else if (lang === 'hi') {
          langName = 'Hindi'
          langScript = 'Hindi script (Devanagari)'
        } else if (lang === 'mr') {
          langName = 'Marathi'
          langScript = 'Marathi script (Devanagari)'
        }

        // Build housing-specific instructions for system prompt
        let housingInstruction = ''
        if (housingType) {
          const normalizedHousing = String(housingType).trim().toLowerCase()
          if (normalizedHousing === 'tin_sheet' || normalizedHousing === 'asbestos') {
            housingInstruction = `HOUSING CONTEXT: User lives in a temporary structure with high heat retention (${normalizedHousing === 'tin_sheet' ? 'Metal/Tin Sheet Roof' : 'Asbestos Sheet'}). Indoor temperatures can be 3-5°C hotter than outside. MANDATORY: Include at least 1 specific cooling tip for their roof type in the "dos" array in the '${lang}' language (${langScript}). Examples in ${langName}: "Cover roof with wet gunny bags during peak hours" or "Ensure cross-ventilation by opening windows on opposite sides" or "Use reflective sheets on roof to reduce heat absorption". Tone: Urgent but practical.`
          } else if (normalizedHousing === 'concrete') {
            housingInstruction = `HOUSING CONTEXT: User lives in a standard concrete home. Suggest generic indoor cooling tips in the "dos" array in the '${lang}' language (${langScript}). Examples in ${langName}: "Keep curtains closed during peak heat hours", "Use fans or air circulation", "Stay in the coolest room of the house".`
          } else {
            housingInstruction = `HOUSING CONTEXT: User lives in a ${normalizedHousing} structure. Provide appropriate indoor cooling advice based on their housing type in the '${lang}' language (${langScript}).`
          }
        }
        let languageInstruction = ''
        if (lang === 'ta') {
          languageInstruction = 'OUTPUT RULE: The entire JSON content (summary, dos, donts, hydration message, activity_management, clothing, warning_signs, housing_tips) MUST be in Tamil script. Translate all advice, tips, and messages into Tamil. Do not translate JSON keys, only translate the values. Use proper Tamil script for all text content.'
        } else if (lang === 'hi') {
          languageInstruction = 'OUTPUT RULE: The entire JSON content (summary, dos, donts, hydration message, activity_management, clothing, warning_signs, housing_tips) MUST be in Hindi script (Devanagari). Translate all advice, tips, and messages into Hindi. Do not translate JSON keys, only translate the values. Use proper Hindi script for all text content.'
        } else if (lang === 'mr') {
          languageInstruction = 'OUTPUT RULE: The entire JSON content (summary, dos, donts, hydration message, activity_management, clothing, warning_signs, housing_tips) MUST be in Marathi script (Devanagari). Translate all advice, tips, and messages into Marathi. Do not translate JSON keys, only translate the values. Use proper Marathi script for all text content.'
        } else {
          languageInstruction = 'OUTPUT RULE: The entire JSON content (summary, dos, donts, hydration message, activity_management, clothing, warning_signs, housing_tips) MUST be in English. Do not translate JSON keys, only provide English values.'
        }

        // System prompt
        const systemPrompt = `You are an expert Occupational Health & Safety Officer specializing in India's heatwaves and occupational heat stress management. Your role is to analyze the user's specific context and return a comprehensive, actionable safety plan in JSON format.

CRITICAL RULES:
1. Do NOT hallucinate dangers if the temperature is safe (< 30°C). Be accurate and factual.
2. ${contextInstruction}
3. Tone: ${toneInstruction}
4. Provide specific, actionable advice tailored to the user's occupation, health conditions, and current weather.
5. Consider India's climate, infrastructure, and common occupational hazards.
6. Use metric units (Celsius, milliliters, meters).
7. Return ONLY valid JSON - no markdown, no code blocks, no explanations outside the JSON structure.
8. ${languageInstruction}
${housingInstruction ? `9. ${housingInstruction}` : ''}

Your response must be a valid JSON object with this exact structure:
{
  "summary": "One sentence urgent alert or informative message",
  "dos": ["Action 1", "Action 2", "Action 3"],
  "donts": ["Avoid 1", "Avoid 2", "Avoid 3"],
  "hydration": {
    "amount": "e.g., 250ml",
    "frequency": "e.g., every 20 mins",
    "message": "Short explanation"
  },
  "activity_management": ["Tip 1", "Tip 2"],
  "clothing": ["Tip 1", "Tip 2"],
  "warning_signs": ["Symptom 1", "Symptom 2", "Symptom 3"],
  "housing_tips": ["Home cooling tip 1", "Home cooling tip 2", "Home cooling tip 3"]
}

MANDATORY: Based on the user's housing type ('tin_sheet', 'concrete', 'asbestos', 'tiled', 'hut', etc.), provide 2-3 specific, low-cost structural cooling tips in the "housing_tips" array in the '${lang}' language (${langScript}). Examples in ${langName}:
- For tin_sheet: "Cover roof with wet sacks during peak hours", "Cross-ventilation timing", "Sprinkle water on roof at 2 PM and 6 PM"
- For asbestos: "Hang wet bedsheets inside windows", "Do not wet asbestos sheets directly when hot"
- For concrete: "Keep curtains closed during peak hours", "Use fans for air circulation", "Stay in the coolest room"

${housingType && (String(housingType).trim().toLowerCase() === 'tin_sheet' || String(housingType).trim().toLowerCase() === 'asbestos') ? `CRITICAL: For users with tin_sheet or asbestos roofs, provide urgent, practical cooling tips that are low-cost and immediately actionable. All tips MUST be in the '${lang}' language (${langScript}).` : ''}

CRITICAL OUTPUT RULE: The ENTIRE JSON response, including ALL values in "summary", "dos", "donts", "hydration.message", "activity_management", "clothing", "warning_signs", and "housing_tips" arrays, MUST be written in the '${lang}' language (${langScript}). Do NOT return any English text for the values. Translate everything into ${langName}. Only JSON keys should remain in English.`

        console.log('🤖 AI Service: Generating heat advisory...')
        console.log('📋 Context:', { temp: weather.temp, riskLevel: riskScore.label, isPeakHeat, housingType, language: lang })

        // Call Groq API
        const completion = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userPrompt
            }
          ],
          temperature: 0.7, // Balance between creativity and consistency
          max_tokens: 1000,
          response_format: { type: 'json_object' } // Force JSON output
        })

        // Extract and parse JSON response
        const responseText = completion.choices[0]?.message?.content
        if (!responseText) {
          throw new Error('No response from AI model')
        }

        // Parse JSON response
        let advisoryData
        try {
          advisoryData = JSON.parse(responseText)
        } catch (parseError) {
          console.error('❌ AI Service: Failed to parse JSON response:', parseError)
          console.error('Raw response:', responseText)
          throw new Error('Invalid JSON response from AI model')
        }

        // Validate response structure
        if (!advisoryData.summary || !advisoryData.dos || !advisoryData.donts) {
          console.warn('⚠️ AI Service: Response missing required fields, using defaults')
          // Get fallback housing tips based on housing type
          const housingType = profile.housing_type || null
          const fallbackHousingTips = getHousingTipsFallback(housingType)
          
          // Return a safe default structure
          advisoryData = {
            summary: advisoryData.summary || 'Stay hydrated and avoid prolonged sun exposure.',
            dos: advisoryData.dos || ['Drink water regularly', 'Take breaks in shade', 'Wear light clothing'],
            donts: advisoryData.donts || ['Avoid peak sun hours', 'Don\'t skip meals', 'Avoid alcohol'],
            hydration: advisoryData.hydration || {
              amount: '250ml',
              frequency: 'every 30 minutes',
              message: 'Drink water regularly to prevent dehydration'
            },
            activity_management: advisoryData.activity_management || ['Take frequent breaks', 'Avoid strenuous activity during peak hours'],
            clothing: advisoryData.clothing || ['Wear light-colored, loose-fitting clothes', 'Use a hat or cap'],
            warning_signs: advisoryData.warning_signs || ['Dizziness', 'Nausea', 'Excessive sweating'],
            housing_tips: advisoryData.housing_tips || fallbackHousingTips
          }
        } else {
          // Ensure housing_tips exists even if AI didn't provide it
          if (!advisoryData.housing_tips) {
            const housingType = profile.housing_type || null
            advisoryData.housing_tips = getHousingTipsFallback(housingType)
          }
        }

        console.log('✅ AI Service: Advisory generated successfully')
        
        // Save to cache for future use (with timestamp)
        if (typeof sessionStorage !== 'undefined') {
          try {
            const cacheData = {
              data: advisoryData,
              timestamp: Date.now()
            }
            sessionStorage.setItem(cacheKey, JSON.stringify(cacheData))
            console.log('💾 AI Service: Advisory saved to session cache')
          } catch (cacheError) {
            console.warn('⚠️ AI Service: Error saving to cache:', cacheError)
            // Don't fail the request if cache save fails
          }
        }
        
        // Clear in-flight request on success
        inFlightRequest = null
        
        return {
          data: advisoryData,
          error: null
        }
      } catch (apiError) {
        // Clear in-flight request on failure
        inFlightRequest = null
        
        console.error('❌ AI Service: Error generating advisory:', apiError)
        
        // Return a safe fallback advisory
        return {
          data: getFallbackAdvisory(profile, weather, riskScore),
          error: apiError instanceof Error ? apiError : new Error('Failed to generate AI advisory')
        }
      }
    })()

    // Return the promise (which will be reused by other concurrent calls)
    return await inFlightRequest

  } catch (error) {
    // This catch block handles validation errors before API call
    console.error('❌ AI Service: Validation error:', error)
    
    // Clear in-flight request if it was set
    inFlightRequest = null
    
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to generate AI advisory')
    }
  }
}

/**
 * Get fallback housing tips based on housing type
 * @param {string|null} housingType - Housing type
 * @returns {Array<string>} Array of housing tips
 */
function getHousingTipsFallback(housingType) {
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

/**
 * Generate fallback advisory when AI service is unavailable
 * @param {Object} profile - User profile
 * @param {Object} weather - Weather data
 * @param {Object} riskScore - Risk score
 * @returns {Object} Fallback advisory object
 */
function getFallbackAdvisory(profile, weather, riskScore) {
  const isHighRisk = riskScore.label === 'High' || riskScore.label === 'Critical' || (weather.temp > 35)
  const housingType = profile?.housing_type || null
  const housingTips = getHousingTipsFallback(housingType)

  return {
    summary: isHighRisk 
      ? 'High heat risk detected. Take immediate precautions and stay hydrated.'
      : 'Stay safe in the heat. Monitor your health and stay hydrated.',
    dos: [
      'Drink water regularly throughout the day',
      'Take breaks in shaded or air-conditioned areas',
      'Wear light-colored, loose-fitting clothing'
    ],
    donts: [
      'Avoid prolonged sun exposure during peak hours (12PM-4PM)',
      'Don\'t skip meals or hydration',
      'Avoid alcohol and caffeinated beverages'
    ],
    hydration: {
      amount: isHighRisk ? '500ml' : '250-500ml',
      frequency: isHighRisk ? 'every 15-20 minutes' : 'every 20-30 minutes',
      message: 'Drink water regularly to prevent dehydration, especially during physical activity'
    },
    activity_management: [
      'Take frequent breaks in shaded areas',
      'Avoid strenuous activity during peak heat hours',
      'Plan outdoor work for early morning or evening'
    ],
    clothing: [
      'Wear light-colored, breathable fabrics',
      'Use a wide-brimmed hat or cap',
      'Wear sunglasses to protect eyes'
    ],
    warning_signs: [
      'Dizziness or lightheadedness',
      'Nausea or vomiting',
      'Excessive sweating or lack of sweating',
      'Rapid heartbeat',
      'Confusion or disorientation'
    ],
    housing_tips: housingTips
  }
}

/**
 * Check if Groq API is configured and available
 * @returns {Promise<boolean>}
 */
export async function isAIServiceAvailable() {
  const client = await initializeGroq()
  return !!client && !!groqApiKey
}

