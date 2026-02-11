import { Sun } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { t } = useTranslation()
  const auth = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const user = auth?.user
  const logout = auth?.logout
  const storedName = useMemo(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('signup_name')
  }, [])
  const profileName = user?.user_metadata?.full_name || storedName || user?.email || t('header.user', { defaultValue: 'User' })
  const profileEmail = user?.email || t('header.user', { defaultValue: 'user@example.com' })
  const editProfileLabel = t('profile.editProfile', { defaultValue: 'Edit Profile' })
  const logoutLabel = t('common.logout', { defaultValue: 'Logout' })
  const initialSource = profileName?.trim() || profileEmail
  const initial = (initialSource?.[0] || 'U').toUpperCase()

  const onLogout = async () => {
    try {
      await logout?.()
    } catch {}
    window.location.assign('/login')
  }

  if (!auth || auth.loading) {
    return (
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <div className="size-8 flex items-center justify-center">
            <Sun className="h-7 w-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">{t('header.title')}</h2>
        </div>
      </header>
    )
  }

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 px-6 py-4 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="size-8 flex items-center justify-center">
          <Sun className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-[-0.015em] text-gray-900 dark:text-white">{t('header.title')}</h2>
      </div>
      <nav className="hidden md:flex items-center gap-8">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `text-sm font-medium leading-normal ${
              isActive
                ? 'text-primary dark:text-primary border-b-2 border-primary pb-1'
                : 'text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            }`
          }
        >
          {t('header.dashboard')}
        </NavLink>
        <NavLink
          to="/advisory"
          className={({ isActive }) =>
            `text-sm font-medium leading-normal ${
              isActive
                ? 'text-primary dark:text-primary border-b-2 border-primary pb-1'
                : 'text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            }`
          }
        >
          {t('header.advisory')}
        </NavLink>
        <NavLink
          to="/safety-guide"
          className={({ isActive }) =>
            `text-sm font-medium leading-normal ${
              isActive
                ? 'text-primary dark:text-primary border-b-2 border-primary pb-1'
                : 'text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            }`
          }
        >
          {t('header.safetyGuide')}
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `text-sm font-medium leading-normal ${
              isActive
                ? 'text-primary dark:text-primary border-b-2 border-primary pb-1'
                : 'text-gray-800 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
            }`
          }
        >
          {t('header.settings')}
        </NavLink>
      </nav>
      <div className="relative" ref={menuRef}>
        <button
          className="flex items-center justify-center size-8 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label="User menu"
          aria-expanded={menuOpen}
        >
          {initial}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50">
            <div className="px-4 py-3">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profileName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{profileEmail}</p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 flex flex-col">
              <button
                className="px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile?edit=true')
                }}
              >
                {editProfileLabel}
              </button>
              <button
                className="px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                onClick={() => {
                  setMenuOpen(false)
                  onLogout()
                }}
              >
                {logoutLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
