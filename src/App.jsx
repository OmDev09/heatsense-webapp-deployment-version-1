import Header from './components/shared/Header.jsx'
import { lazy, Suspense } from 'react'
const LandingPage = lazy(() => import('./components/landing/LandingPage.jsx'))
const About = lazy(() => import('./components/landing/About.jsx'))
const Contact = lazy(() => import('./components/landing/Contact.jsx'))
const PublicPrivacyPolicy = lazy(() => import('./components/landing/PublicPrivacyPolicy.jsx'))
const PublicTermsOfService = lazy(() => import('./components/landing/PublicTermsOfService.jsx'))
const Login = lazy(() => import('./components/auth/Login.jsx'))
const Signup = lazy(() => import('./components/auth/Signup.jsx'))
const ProfileForm = lazy(() => import('./components/profile/ProfileForm.jsx'))
const Dashboard = lazy(() => import('./components/dashboard/Dashboard.jsx'))
const AdvisoryDetails = lazy(() => import('./components/advisory/AdvisoryDetails.jsx'))
const Settings = lazy(() => import('./components/settings/Settings.jsx'))
const LocationPermission = lazy(() => import('./components/location/LocationPermission.jsx'))
const SafetyGuide = lazy(() => import('./components/safety/SafetyGuide.jsx'))
const FAQ = lazy(() => import('./components/help/FAQ.jsx'))
const Tutorial = lazy(() => import('./components/help/Tutorial.jsx'))
const PrivacyPolicy = lazy(() => import('./components/help/PrivacyPolicy.jsx'))
const TermsOfService = lazy(() => import('./components/help/TermsOfService.jsx'))
const ContactSupport = lazy(() => import('./components/help/ContactSupport.jsx'))
import ProtectedRoute, { PublicRoute } from './components/shared/ProtectedRoute.jsx'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext.jsx'

function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const auth = useAuth()
  
  // All hooks must be called before any conditional returns
  useEffect(() => {
    const path = location.pathname + (location.search || '')
    localStorage.setItem('last_path', path)
  }, [location])

  useEffect(() => {
    if (!auth || auth.loading) return
    const { user, profileExists } = auth
    const last = localStorage.getItem('last_path')
    const currentPath = location.pathname
    const currentFull = location.pathname + (location.search || '')
    
    // Don't redirect if we're already on the stored path (avoids stripping search params e.g. /settings?tab=preferences)
    if (last && currentFull === last) return
    
    // Don't redirect if we're currently on profile or location pages (user is in onboarding flow)
    if (currentPath === '/profile' || currentPath === '/location') {
      return
    }
    
    // Don't redirect if last_path is /location (user just saved profile and is going through onboarding)
    if (last === '/location') {
      return
    }
    
    // Only redirect if profile exists and we're not in onboarding
    // Also ensure we're not redirecting to onboarding pages
    if (user && profileExists && last && last !== '/' && last !== '/login' && last !== '/signup' && last !== '/profile' && last !== '/location') {
      navigate(last, { replace: true })
    }
  }, [auth, navigate, location.pathname])
  
  // CRITICAL FIX: Prevent crash if auth is still initializing
  // Check after all hooks are called
  if (!auth || auth.loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }
  
  const { user, profileExists } = auth

  return (
    <Suspense fallback={<div className="px-4 py-8"><div className="card rounded-3xl p-6"><div className="animate-pulse h-6 bg-neutral-200 rounded w-48" /><div className="mt-4 animate-pulse h-32 bg-neutral-200 rounded" /></div></div>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<PublicPrivacyPolicy />} />
        <Route path="/terms" element={<PublicTermsOfService />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileForm /></ProtectedRoute>} />
        <Route path="/location" element={<LocationPermission />} />
        <Route path="/dashboard" element={<ProtectedRoute requireProfile><Dashboard /></ProtectedRoute>} />
        <Route path="/advisory" element={<ProtectedRoute requireProfile><AdvisoryDetails /></ProtectedRoute>} />
        <Route path="/safety-guide" element={<ProtectedRoute requireProfile><SafetyGuide /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute requireProfile><Settings /></ProtectedRoute>} />
        <Route path="/help/faq" element={<ProtectedRoute requireProfile><FAQ /></ProtectedRoute>} />
        <Route path="/help/tutorial" element={<ProtectedRoute requireProfile><Tutorial /></ProtectedRoute>} />
        <Route path="/help/privacy" element={<ProtectedRoute requireProfile><PrivacyPolicy /></ProtectedRoute>} />
        <Route path="/help/terms" element={<ProtectedRoute requireProfile><TermsOfService /></ProtectedRoute>} />
        <Route path="/help/contact" element={<ProtectedRoute requireProfile><ContactSupport /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  )
}

function AppLayout() {
  const location = useLocation()
  const isPublicPage = ['/', '/about', '/contact'].includes(location.pathname)
  const hideHeaderPages = ['/', '/about', '/contact', '/privacy', '/terms', '/login', '/signup', '/profile', '/location']
  const shouldShowHeader = !hideHeaderPages.includes(location.pathname)

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
      {shouldShowHeader && <Header />}
      <main className={isPublicPage || ['/login', '/signup', '/profile', '/location'].includes(location.pathname) ? "" : ""}>
        <AppRoutes />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  )
}