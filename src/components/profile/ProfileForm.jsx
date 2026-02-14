import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, MapPin, Briefcase, Heart, Check, ChevronDown, Home } from 'lucide-react'
import Button from '../shared/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { upsertProfile, getUserProfile, getUserSettings } from '../../services/databaseService.js'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'

const CITIES = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad']
// Occupation options with vulnerable groups
const OCCUPATIONS = [
  // Vulnerable Groups
  { value: 'student', label: 'Student / Child (< 18)' },
  { value: 'pregnant', label: 'Pregnant / Expecting Mother' },
  { value: 'senior', label: 'Senior Citizen / Retired' },
  { value: 'homemaker', label: 'Homemaker / Stay at Home' },
  // Worker Options
  { value: 'outdoor', label: 'Outdoor Worker' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'construction', label: 'Construction' },
  { value: 'office', label: 'Indoor/Office' },
  { value: 'other', label: 'Other' }
]

// Map old occupation values to new ones for backward compatibility
const OCCUPATION_MAP = {
  'Outdoor Worker': 'outdoor',
  'Delivery': 'delivery',
  'Construction': 'construction',
  'Indoor/Office': 'office',
  'Student': 'student',
  'Other': 'other'
}
const HOUSING_TYPES = [
  { value: 'concrete', label: 'Concrete / Pucca House' },
  { value: 'tin_sheet', label: 'Metal / Tin Sheet Roof' },
  { value: 'asbestos', label: 'Asbestos Sheet' },
  { value: 'tiled', label: 'Tiled Roof' },
  { value: 'hut', label: 'Thatched / Hut' }
]
const HEALTH_OPTIONS = [
  { label: 'Heart Disease', value: 'heart' },
  { label: 'Diabetes', value: 'diabetes' },
  { label: 'Respiratory Issues', value: 'respiratory' },
  { label: 'High Blood Pressure', value: 'hypertension' },
  { label: 'None', value: 'none' }
]

function isOccupationDisabledForUser(occ, age, gender) {
  if (occ.value === 'pregnant') return gender !== 'Female'
  if (occ.value === 'student') return age !== '' && Number(age) >= 18
  if (occ.value === 'senior') return age !== '' && Number(age) < 50
  return false
}

export default function ProfileForm() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [searchParams] = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('Delhi')
  const [occupation, setOccupation] = useState('outdoor')
  const [housingType, setHousingType] = useState('')
  const [selectedConditions, setSelectedConditions] = useState([])
  const [noneSelected, setNoneSelected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [termsError, setTermsError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(isEditMode)

  const name = useMemo(() => localStorage.getItem('signup_name') || '', [])

  const user = auth?.user
  const checkProfileExists = auth?.checkProfileExists

  useEffect(() => {
    if (!user) {
      window.location.assign('/login')
      return
    }
    // Only check profile existence on initial mount for edit mode
    // For new profiles, don't check - let the form submission handle navigation
    if (isEditMode) {
      // In edit mode, we want to load existing profile data
      // The profile existence check is handled by ProtectedRoute
    }
  }, [user, isEditMode])

  // Load existing profile data when in edit mode
  useEffect(() => {
    if (isEditMode && user) {
      let mounted = true
      getUserProfile(user.id)
        .then(({ data, error: profileError }) => {
          if (!mounted) return
          if (profileError || !data) {
            setError('Failed to load profile data')
            setLoadingProfile(false)
            return
          }
          // Populate form with existing data
          // Map new schema fields to form fields
          setAge(data.age?.toString() || '')
          setGender(data.gender || '')
          setCity(data.home_city || data.city || 'Delhi') // Support both old and new schema
          // Map old occupation values to new ones, or use as-is if already in new format
          const existingOccupation = data.occupation || 'outdoor'
          const mappedOccupation = OCCUPATION_MAP[existingOccupation] || existingOccupation
          setOccupation(mappedOccupation)
          setHousingType(data.housing_type || '')
          
          // Map health condition labels back to values for form
          const healthConditionValues = {
            'Heart Disease': 'heart',
            'Diabetes': 'diabetes',
            'Respiratory Issues': 'respiratory',
            'High Blood Pressure': 'hypertension',
            'None': 'none'
          }
          
          if (data.health_conditions && Array.isArray(data.health_conditions) && data.health_conditions.length > 0) {
            // Convert labels back to values
            const conditionValues = data.health_conditions
              .map(label => healthConditionValues[label] || label)
              .filter(val => val && val !== 'none')
            
            if (conditionValues.length > 0) {
              setSelectedConditions(conditionValues)
              setNoneSelected(false)
            } else {
              setNoneSelected(true)
              setSelectedConditions([])
            }
          } else {
            setNoneSelected(true)
            setSelectedConditions([])
          }
          setLoadingProfile(false)
        })
        .catch(() => {
          if (!mounted) return
          setError('Failed to load profile data')
          setLoadingProfile(false)
        })
      return () => { mounted = false }
    } else {
      setLoadingProfile(false)
    }
  }, [isEditMode, user])

  // Auto-reset occupation when it becomes invalid due to age/gender changes
  useEffect(() => {
    const currentOcc = OCCUPATIONS.find(o => o.value === occupation)
    if (!currentOcc) return
    if (isOccupationDisabledForUser(currentOcc, age, gender)) {
      setOccupation(age !== '' && Number(age) < 18 ? 'student' : 'outdoor')
    }
  }, [age, gender, occupation])

  if (!auth || auth.loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>
  }

  const onToggleCondition = (value, checked) => {
    if (value === 'none') {
      setNoneSelected(checked)
      if (checked) setSelectedConditions([])
      return
    }
    setNoneSelected(false)
    if (checked) setSelectedConditions(prev => Array.from(new Set([...prev, value])))
    else setSelectedConditions(prev => prev.filter(v => v !== value))
  }

  const validate = () => {
    const errs = {}
    if (!age || Number(age) <= 0) errs.age = t('profile.validation.age')
    if (!gender) errs.gender = t('profile.validation.gender')
    if (!city) errs.city = t('profile.validation.city')
    if (!occupation) errs.occupation = t('profile.validation.occupation')
    const currentOcc = OCCUPATIONS.find(o => o.value === occupation)
    if (currentOcc && isOccupationDisabledForUser(currentOcc, age, gender)) {
      errs.occupation = 'Please select an occupation that matches your age and gender.'
    }
    return errs
  }

  const handleSubmit = async () => {
    setError('')
    setTermsError('')

    if (!isEditMode && !termsAccepted) {
      setTermsError(t('profile.validation.terms'))
      return
    }

    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    if (!user) return

    setLoading(true)
    setSubmitStatus(isEditMode ? 'Updating...' : 'Saving...')
    try {
      const healthConditionLabels = {
        'heart': 'Heart Disease',
        'diabetes': 'Diabetes',
        'respiratory': 'Respiratory Issues',
        'hypertension': 'High Blood Pressure',
        'none': 'None'
      }
      const healthConditionsArray = noneSelected
        ? []
        : selectedConditions
            .map(condition => healthConditionLabels[condition] || condition)
            .filter(Boolean)

      const formData = {
        age: Number(age),
        gender,
        home_city: city,
        occupation,
        housing_type: housingType || null,
        health_conditions: healthConditionsArray
      }

      const { data, error: profileError } = await upsertProfile(user.id, formData)

      if (profileError) {
        setError(profileError.message || t('profile.validation.profileFailed'))
        return
      }
      if (!data) {
        setError(t('profile.validation.profileFailed'))
        return
      }

      setSubmitStatus('Finalizing setup...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      await checkProfileExists(user.id)
      if (isEditMode) {
        window.location.href = '/settings'
      } else {
        window.location.href = '/location'
      }
    } catch (err) {
      console.error('❌ ProfileForm: Exception in handleSubmit:', err)
      setError(t('profile.validation.saveFailed'))
    } finally {
      setLoading(false)
      setSubmitStatus('')
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-orange-50 dark:bg-gray-900 px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex items-center justify-center relative">
        <div className="w-full max-w-[600px] mx-auto">
          <div className="card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 backdrop-blur-sm">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-gray-900 px-4 sm:px-6 md:px-8 py-6 sm:py-10 flex items-center justify-center relative">
      <div className="w-full max-w-[600px] mx-auto">
        <div className="card rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800 backdrop-blur-sm">
              <div className="text-center mb-3">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? t('settings.account.editProfile') : t('profile.title')}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1.5">{isEditMode ? t('settings.account.editProfileDesc') : 'Your data helps our AI predict your personal heat risk.'}</div>
              </div>
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">{t('profile.age')}</label>
                    <input
                      className="mt-1 w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm"
                      type="number"
                      min="1"
                      value={age}
                      onChange={e => {
                        const value = e.target.value
                        if (value === '') {
                          setAge('')
                        } else {
                          const num = Number(value)
                          setAge(String(num > 100 ? 100 : num))
                        }
                        setFieldErrors(prev => ({ ...prev, age: '' }))
                      }}
                    />
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('profile.ageHelp')}</div>
                    {fieldErrors.age && <div className="mt-0.5 text-xs text-primary">{fieldErrors.age}</div>}
                  </div>
                  <div>
                    <label className="text-xs text-gray-700 dark:text-gray-300">{t('profile.gender')}</label>
                    <div className="mt-1 relative">
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                      <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 pr-9 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-sm" value={gender} onChange={e => { setGender(e.target.value); setFieldErrors(prev => ({ ...prev, gender: '' })) }}>
                        <option value="">Select</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('profile.genderHelp')}</div>
                    {fieldErrors.gender && <div className="mt-0.5 text-xs text-primary">{fieldErrors.gender}</div>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"><MapPin className="h-3.5 w-3.5" /> <span>{t('profile.city')}</span></label>
                    <div className="mt-1 relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                      <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-9 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-sm" value={city} onChange={e => { setCity(e.target.value); setFieldErrors(prev => ({ ...prev, city: '' })) }}>
                        {CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('profile.cityHelp')}</div>
                    {fieldErrors.city && <div className="mt-0.5 text-xs text-primary">{fieldErrors.city}</div>}
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"><Briefcase className="h-3.5 w-3.5" /> <span>Occupation / Status</span></label>
                    <div className="mt-1 relative">
                      <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                      <select className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-9 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-sm" value={occupation} onChange={e => { setOccupation(e.target.value); setFieldErrors(prev => ({ ...prev, occupation: '' })) }}>
                        {OCCUPATIONS.map(occ => {
                          const disabled = isOccupationDisabledForUser(occ, age, gender)
                          const tooltip = disabled && occ.value === 'pregnant' ? 'Select Female gender for this option' : disabled && occ.value === 'student' ? 'Select age under 18 for this option' : disabled && occ.value === 'senior' ? 'Select age 50 or above for this option' : ''
                          return (
                            <option key={occ.value} value={occ.value} disabled={disabled} title={tooltip}>
                              {occ.label}
                            </option>
                          )
                        })}
                      </select>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('profile.occupationHelp')}</div>
                    {fieldErrors.occupation && <div className="mt-0.5 text-xs text-primary">{fieldErrors.occupation}</div>}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300"><Home className="h-3.5 w-3.5" /> <span>Housing / Roof Type</span></label>
                  <div className="mt-1 relative">
                    <Home className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none z-10" />
                    <select 
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-9 py-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all appearance-none cursor-pointer text-sm" 
                      value={housingType} 
                      onChange={e => { 
                        setHousingType(e.target.value); 
                        setFieldErrors(prev => ({ ...prev, housingType: '' })) 
                      }}
                    >
                      <option value="">Select Housing Type</option>
                      {HOUSING_TYPES.map(ht => (
                        <option key={ht.value} value={ht.value}>
                          {ht.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    We use this to calculate indoor heat risk. Metal roofs can be 3-5°C hotter.
                  </div>
                  {fieldErrors.housingType && <div className="mt-0.5 text-xs text-primary">{fieldErrors.housingType}</div>}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300 mb-2"><Heart className="h-3.5 w-3.5 text-primary" /> <span>{t('profile.healthConditions')}</span></div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {HEALTH_OPTIONS.map(opt => {
                      const isSelected = opt.value === 'none' ? noneSelected : selectedConditions.includes(opt.value)
                      return (
                        <div
                          key={opt.value}
                          onClick={() => onToggleCondition(opt.value, !isSelected)}
                          className={`relative border-2 rounded-xl px-3 py-3 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 shadow-sm'
                              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                          }`}
                        >
                          <span className="font-medium text-xs text-gray-900 dark:text-gray-100 block pr-5">{opt.label}</span>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                {!isEditMode && (
                  <div className="mt-1">
                    <label
                      className="flex items-center gap-2 text-xs cursor-pointer select-none text-gray-700 dark:text-gray-300"
                      onClick={() => setShowTermsModal(true)}
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 accent-primary"
                        checked={termsAccepted}
                        readOnly
                      />
                      <span>{t('profile.termsLabel')}</span>
                    </label>
                    {termsError && <div className="mt-1 text-xs text-primary">{termsError}</div>}
                  </div>
                )}
                {error && <div className="text-primary text-xs">{error}</div>}
                <Button 
                  type="button"
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 min-h-[48px] shadow-lg shadow-orange-500/30 transition-all transform hover:scale-[1.02]" 
                  disabled={loading} 
                  aria-label="Continue"
                >
                  <span className="text-sm">{loading ? (submitStatus || (isEditMode ? 'Updating...' : 'Saving...')) : (isEditMode ? 'Update Profile' : t('profile.continue'))}</span>
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </div>
        </div>
        {showTermsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="relative w-full max-w-lg px-4">
              <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transform transition-all duration-300 ease-out scale-100 opacity-100">
                <div className="p-6">
                <div className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{t('profile.termsTitle')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600 dark:text-gray-300">
  <li>
    <strong>{t('profile.modal.dataUsageTitle')}:</strong> {t('profile.modal.dataUsageText')}
  </li>
  <li>
    <strong>{t('profile.modal.medicalTitle')}:</strong> {t('profile.modal.medicalText')}
  </li>
  <li>
    <strong>{t('profile.modal.emergencyTitle')}:</strong> {t('profile.modal.emergencyText')}
  </li>
  <li>
    <strong>{t('profile.modal.accuracyTitle')}:</strong> {t('profile.modal.accuracyText')}
  </li>
  <li>
    <strong>{t('profile.modal.privacyTitle')}:</strong> {t('profile.modal.privacyText')}
  </li>
</ul>
                  </div>
                  <div className="mt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      className="rounded-2xl px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700"
                      onClick={() => {
                        setShowTermsModal(false)
                        setTermsAccepted(false)
                      }}
                    >
                      {t('profile.modal.cancel')}
                    </button>
                    <button
                      type="button"
                      className="btn-primary rounded-2xl px-4 py-2 text-sm"
                      onClick={() => {
                        setTermsAccepted(true)
                        setTermsError('')
                        setShowTermsModal(false)
                      }}
                    >
                      {t('profile.modal.accept')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}