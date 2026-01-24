import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import './i18n.js'

// Clear all site data on reload to start fresh, but preserve signup data and Supabase session
if (typeof window !== 'undefined') {
  try {
    // Preserve signup data that's needed for profile creation
    const signupName = localStorage.getItem('signup_name')
    const signupPhone = localStorage.getItem('signup_phone')
    const signupCompany = localStorage.getItem('signup_company')
    
    // Preserve Supabase session data (all keys starting with 'sb-')
    const supabaseKeys = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('sb-')) {
        supabaseKeys[key] = localStorage.getItem(key)
      }
    }
    
    // Clear everything
    localStorage.clear()
    sessionStorage.clear()
    
    // Restore signup data if it exists
    if (signupName) localStorage.setItem('signup_name', signupName)
    if (signupPhone) localStorage.setItem('signup_phone', signupPhone)
    if (signupCompany) localStorage.setItem('signup_company', signupCompany)
    
    // Restore Supabase session data
    Object.keys(supabaseKeys).forEach(key => {
      localStorage.setItem(key, supabaseKeys[key])
    })
  } catch (error) {
    console.warn('Failed to clear storage:', error)
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}