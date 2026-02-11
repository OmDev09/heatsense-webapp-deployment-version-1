import { supabase } from '../config/supabase.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const devMode = !supabaseUrl || !supabaseKey

export async function getUserProfile(userId) {
  if (devMode) {
    const raw = localStorage.getItem(`dev_profile_${userId}`)
    const data = raw ? JSON.parse(raw) : null
    return { data, error: null }
  }
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (error) return { data: null, error }
    return { data: data || null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

/**
 * Upsert user profile to the new 'profiles' table
 * Combines formData with signup data from localStorage
 * @param {string} userId - User ID
 * @param {Object} formData - Profile form data (age, occupation, health_conditions, home_city, gender, housing_type)
 * @param {number} formData.age - User's age
 * @param {string} formData.gender - User's gender
 * @param {string} formData.home_city - User's home city
 * @param {string} formData.occupation - User's occupation
 * @param {string|null} formData.housing_type - Housing/roof type (concrete, tin_sheet, asbestos, tiled, hut)
 * @param {Array<string>} formData.health_conditions - Array of health conditions
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function upsertProfile(userId, formData) {
  // Check if userId is a dev user ID (starts with "dev-")
  // Dev user IDs are not valid UUIDs and cannot be saved to Supabase
  const isDevUserId = userId && userId.startsWith('dev-')
  
  if (isDevUserId && !devMode) {
    console.error("❌ CRITICAL: Cannot save dev user ID to Supabase. User ID must be a valid UUID.")
    console.error("   Dev User ID detected:", userId)
    console.error("   Please log out and sign up/login with real Supabase authentication.")
    return { 
      data: null, 
      error: { 
        message: 'Invalid user ID. Please log out and sign in again with Supabase authentication.',
        details: 'Dev user IDs cannot be saved to Supabase. You need to use real Supabase authentication.'
      } 
    }
  }
  
  // Retrieve signup data from localStorage (only if not already in formData)
  const storedPhone = localStorage.getItem('signup_phone')
  const storedName = localStorage.getItem('signup_name')
  
  const phone = formData?.phone || storedPhone || null
  const fullName = formData?.full_name || storedName || null
  
  // Get existing profile to merge with (only update provided fields)
  let existingProfile = null
  if (!devMode) {
    try {
      const { data } = await getUserProfile(userId)
      existingProfile = data
    } catch {
    }
  }

  // Map formData to new schema - merge with existing data
  // Only include fields that are provided in formData, or use existing values
  const payload = {
    id: userId,
    full_name: fullName || existingProfile?.full_name || null,
    occupation: formData?.occupation !== undefined ? formData.occupation : (existingProfile?.occupation || null),
    phone: phone || existingProfile?.phone || null,
    home_city: formData?.home_city || formData?.city || existingProfile?.home_city || null,
    age: formData?.age !== undefined ? (formData.age ? Number(formData.age) : null) : (existingProfile?.age || null),
    gender: formData?.gender !== undefined ? formData.gender : (existingProfile?.gender || null),
    housing_type: formData?.housing_type !== undefined ? formData.housing_type : (existingProfile?.housing_type || null),
    health_conditions: formData?.health_conditions !== undefined
      ? (Array.isArray(formData.health_conditions) 
          ? formData.health_conditions 
          : (formData.health_conditions ? [formData.health_conditions] : []))
      : (existingProfile?.health_conditions || [])
  }

  if (devMode) {
    console.warn("⚠️ Saving to LocalStorage (Not Supabase) because keys are missing.")
    localStorage.setItem(`dev_profile_${userId}`, JSON.stringify(payload))
    return { data: payload, error: null }
  }

  try {
    // Use upsert to insert or update - send all fields including nulls
    // Supabase will handle null values according to column defaults
    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .single()
    
    if (error) {
      console.error("Supabase profile upsert failed:", error.message)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    console.error("Profile save exception:", error.message)
    return { data: null, error }
  }
}

/**
 * Log user location to employee_risk_logs table for risk tracking
 * @param {string} userId - User ID
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {number|null} riskScore - Risk score (0-100) or null
 * @param {string|null} riskLabel - Risk label ('Low', 'Medium', 'High', 'Critical') or null
 * @returns {Promise<{data: Object|null, error: Error|null}>}
 */
export async function logUserLocation(userId, lat, lon, riskScore = null, riskLabel = null) {
  if (riskScore === null || riskScore === undefined) {
    return { data: null, error: null }
  }
  
  const payload = {
    user_id: userId,
    current_lat: lat,
    current_lon: lon,
    risk_score: riskScore,
    risk_label: riskLabel
  }

  if (devMode) {
    return { data: payload, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('employee_risk_logs')
      .insert([payload])
      .select('*')
      .single()
    
    if (error) {
      console.error('Location log failed:', error.message)
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    console.error('Location log exception:', error.message)
    return { data: null, error }
  }
}

export async function getUserSettings(userId) {
  if (devMode) {
    const raw = localStorage.getItem(`dev_settings_${userId}`)
    const data = raw ? JSON.parse(raw) : { id: userId }
    if (!raw) localStorage.setItem(`dev_settings_${userId}`, JSON.stringify(data))
    return { data, error: null }
  }
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    
    // If table doesn't exist (404) or no data found, return default settings
    if (error) {
      // Check if it's a 404 (table doesn't exist) or other error
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('⚠️ user_settings table does not exist. Using default settings.')
        const defaultSettings = { id: userId }
        return { data: defaultSettings, error: null }
      }
      return { data: null, error }
    }
    if (data) return { data, error: null }
    
    // Try to upsert default settings (will create if doesn't exist, update if exists)
    // This prevents 409 Conflict errors if a row already exists
    try {
      const { data: created, error: upsertError } = await supabase
        .from('user_settings')
        .upsert([{ id: userId }], { onConflict: 'id' })
        .select('*')
        .single()
      if (upsertError) {
        // If upsert fails (table doesn't exist), return default settings
        if (upsertError.code === 'PGRST116' || upsertError.message?.includes('relation') || upsertError.message?.includes('does not exist')) {
          console.warn('⚠️ user_settings table does not exist. Using default settings.')
          return { data: { id: userId }, error: null }
        }
        // Handle 409 Conflict - row already exists, try to fetch it
        if (upsertError.code === '23505' || upsertError.message?.includes('duplicate') || upsertError.message?.includes('Conflict')) {
          console.log('⚠️ Settings row already exists, fetching it...')
          const { data: existing, error: fetchError } = await supabase
            .from('user_settings')
            .select('*')
            .eq('id', userId)
            .single()
          if (fetchError) {
            return { data: { id: userId }, error: null }
          }
          return { data: existing, error: null }
        }
        return { data: null, error: upsertError }
      }
      return { data: created, error: null }
    } catch (insertErr) {
      // If table doesn't exist, return default settings
      console.warn('⚠️ user_settings table does not exist. Using default settings.')
      return { data: { id: userId }, error: null }
    }
  } catch (error) {
    // If any error occurs, return default settings
    console.warn('⚠️ Error fetching user_settings. Using default settings.', error)
    return { data: { id: userId }, error: null }
  }
}

export async function updateUserSettings(userId, settings) {
  const payload = { ...settings, updated_at: new Date().toISOString() }
  if (devMode) {
    const raw = localStorage.getItem(`dev_settings_${userId}`)
    const current = raw ? JSON.parse(raw) : { id: userId }
    const next = { ...current, ...payload }
    localStorage.setItem(`dev_settings_${userId}`, JSON.stringify(next))
    return { data: next, error: null }
  }
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .single()
    
    // If table doesn't exist (404), save to localStorage as fallback
    if (error) {
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.warn('⚠️ user_settings table does not exist. Saving to localStorage as fallback.')
        const raw = localStorage.getItem(`dev_settings_${userId}`)
        const current = raw ? JSON.parse(raw) : { id: userId }
        const next = { ...current, ...payload }
        localStorage.setItem(`dev_settings_${userId}`, JSON.stringify(next))
        return { data: next, error: null }
      }
      return { data: null, error }
    }
    return { data, error: null }
  } catch (error) {
    // If any error occurs, save to localStorage as fallback
    console.warn('⚠️ Error updating user_settings. Saving to localStorage as fallback.', error)
    const raw = localStorage.getItem(`dev_settings_${userId}`)
    const current = raw ? JSON.parse(raw) : { id: userId }
    const next = { ...current, ...payload }
    localStorage.setItem(`dev_settings_${userId}`, JSON.stringify(next))
    return { data: next, error: null }
  }
}

export async function deleteUserAccount(userId) {
  if (devMode) {
    localStorage.removeItem(`dev_settings_${userId}`)
    localStorage.removeItem(`dev_profile_${userId}`)
    // Also clear risk logs in dev mode
    return { data: { settingsDeleted: true, profileDeleted: true, riskLogsDeleted: true }, error: null }
  }
  try {
    // Try to delete from user_settings (may not exist, that's okay)
    const { error: settingsError } = await supabase
      .from('user_settings')
      .delete()
      .eq('id', userId)
    
    // If settingsError is because table doesn't exist, that's fine - continue
    const settingsDeleted = !settingsError || 
      (settingsError.code === 'PGRST116' || 
       settingsError.message?.includes('relation') || 
       settingsError.message?.includes('does not exist'))
    
    // Also clear localStorage settings as fallback
    localStorage.removeItem(`dev_settings_${userId}`)
    
    // Delete profile (this table should exist)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)
    
    if (profileError) {
      return { data: null, error: profileError }
    }
    return { data: { settingsDeleted, profileDeleted: true }, error: null }
  } catch (error) {
    return { data: null, error }
  }
}