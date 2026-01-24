import { Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'

export function PublicRoute({ children }) {
  const { user, profileExists } = useAuth()
  // Check if we're in the signup flow - don't redirect if user just signed up
  const isSigningUp = localStorage.getItem('_signing_up') === 'true'
  
  if (user && !isSigningUp) {
    return <Navigate to={profileExists ? '/dashboard' : '/profile'} replace />
  }
  return children
}

export default function ProtectedRoute({ requireProfile = false, redirectIfProfileExists = false, children }) {
  const { user, loading, profileExists, checkProfileExists } = useAuth()
  const [checking, setChecking] = useState(false)
  const [checkedOnce, setCheckedOnce] = useState(false)

  useEffect(() => {
    if (!loading && user && requireProfile && profileExists === false && !checking) {
      setChecking(true)
      checkProfileExists(user.id)
        .finally(() => { setChecking(false); setCheckedOnce(true) })
    }
  }, [user, loading, requireProfile, profileExists, checking, checkProfileExists])

  if (loading || checking) {
    return (
      <div className="fixed inset-0 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center" aria-busy="true">
        <div className="card rounded-3xl p-6" role="status" aria-label="Checking authentication">
          <div className="animate-pulse h-6 bg-neutral-200 rounded w-48" />
          <div className="mt-4 animate-pulse h-32 bg-neutral-200 rounded" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (redirectIfProfileExists && profileExists) return <Navigate to="/dashboard" replace />
  if (requireProfile && !profileExists) {
    if (!checkedOnce || checking) {
      return (
        <div className="fixed inset-0 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm flex items-center justify-center" aria-busy="true">
          <div className="card rounded-3xl p-6" role="status" aria-label="Checking authentication">
            <div className="animate-pulse h-6 bg-neutral-200 rounded w-48" />
            <div className="mt-4 animate-pulse h-32 bg-neutral-200 rounded" />
          </div>
        </div>
      )
    }
    return <Navigate to="/profile" replace />
  }

  return children
}