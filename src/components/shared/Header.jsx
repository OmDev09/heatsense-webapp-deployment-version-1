import { useState } from 'react'
import { Sun, Bell, Search } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTranslation } from 'react-i18next'

export default function Header() {
  const { t } = useTranslation()
  const auth = useAuth()
  
  // CRITICAL FIX: Prevent crash if auth is still initializing
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
  
  const { user, logout } = auth
  const location = useLocation()
  const initial = (user?.email?.[0] || 'U').toUpperCase()
  const onLogout = async () => { try { await logout() } catch {} window.location.assign('/login') }

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
      <div className="flex items-center gap-6">
        <button className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" aria-label="Search">
          <Search className="h-5 w-5" />
        </button>
        <button className="relative text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <button
          className="flex items-center justify-center size-8 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          onClick={onLogout}
          aria-label="User menu"
        >
          {initial}
        </button>
      </div>
    </header>
  )
}