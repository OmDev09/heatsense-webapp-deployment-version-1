import { useEffect, useState } from 'react'
import { Shield, User, Mail, Lock } from 'lucide-react'
import Button from '../shared/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import LoginSlider from './LoginSlider.jsx'

export default function Signup() {
  const { signup, loginWithGoogle, logout } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const savedName = localStorage.getItem('signup_name')
    if (savedName) setName(savedName)
  }, [])


  const validate = () => {
    if (!name.trim()) return 'Full name is required'
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!okEmail) return 'Enter a valid email address'
    if (!password || password.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    try {
      // Set flag to prevent PublicRoute from redirecting during signup
      localStorage.setItem('_signing_up', 'true')
      
      const { error: err } = await signup(email, password)
      if (err) {
        localStorage.removeItem('_signing_up')
        setError(err.message || 'Failed to create account')
      } else {
        // Save signup data to localStorage for profile creation (will be used after login)
        console.log("💾 Saving signup data to localStorage:", { name })
        localStorage.setItem('signup_name', name)
        console.log("💾 Saved name:", name)
        
        // Supabase automatically logs in the user after signup
        // We need to log them out so they can go to the login screen
        console.log("✅ Signup successful, logging out to redirect to login...")
        try {
          await logout()
          console.log("✅ Logged out successfully")
        } catch (logoutError) {
          console.warn("⚠️ Logout error (continuing anyway):", logoutError)
        }
        
        // Clear the signup flag and navigate to login
        localStorage.removeItem('_signing_up')
        
        // Use a small delay to ensure logout completes and state updates
        // Then navigate to login screen
        setTimeout(() => {
          console.log("🚀 Redirecting to login...")
          window.location.href = '/login'
        }, 200)
      }
    } catch {
      localStorage.removeItem('_signing_up')
      setError('Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: err } = await loginWithGoogle()
      if (err) setError(err.message || 'Google sign-up failed')
    } catch {
      setError('Google sign-up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen grid grid-cols-[40%_60%] overflow-hidden">
      <div className="h-full">
        <LoginSlider />
      </div>
      <div className="bg-app flex items-center justify-center px-6 py-4 overflow-y-auto">
        <div className="card w-full max-w-md p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">Create Account</div>
          <div className="text-sm text-neutral-600">Join the Chennai Resilience Network to protect your family.</div>
        </div>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <User className="h-5 w-5 text-neutral-600" />
            <input className="w-full outline-none text-sm" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <Mail className="h-5 w-5 text-neutral-600" />
            <input className="w-full outline-none text-sm" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary">
              <Lock className="h-5 w-5 text-neutral-600" />
              <input className="w-full outline-none text-sm" placeholder="Set Password" type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-xs mt-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="h-3.5 w-3.5 accent-primary" 
                checked={showPassword} 
                onChange={e => setShowPassword(e.target.checked)} 
              />
              <span className="text-neutral-600">Show password</span>
            </label>
            {password.length > 0 && password.length < 6 && (
              <p className="mt-1 text-xs text-primary">Password must be at least 6 characters</p>
            )}
          </div>
          {error && <div className="text-primary text-xs">{error}</div>}
          <Button type="submit" className="w-full btn-primary px-4 py-2.5 rounded-xl bg-primary hover:bg-red-600 text-white text-sm" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-500">or sign up with</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <button className="w-full rounded-xl px-4 py-2.5 bg-white border border-neutral-200 shadow-md flex items-center justify-center gap-2 text-sm" onClick={onGoogle} disabled={loading}>
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true"><path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-3.1 0-5.6-2.6-5.6-5.8s2.5-5.8 5.6-5.8c1.8 0 3 .7 3.7 1.3l2.5-2.4C16.8 3.6 14.6 2.7 12 2.7 6.9 2.7 2.7 6.9 2.7 12s4.2 9.3 9.3 9.3c5.4 0 9-3.8 9-9.2 0-.6-.1-1-.1-1.5H12z"/><path fill="#34A853" d="M3.3 7.9l3 2.2c.8-2.3 3-3.9 5.7-3.9 1.8 0 3 .7 3.7 1.3l2.5-2.4C16.8 3.6 14.6 2.7 12 2.7c-3.8 0-7 2.2-8.7 5.2z"/><path fill="#4285F4" d="M21 12.5c0-.6-.1-1-.1-1.5H12v3.6h5.1c-.2 1.2-1.5 3.5-5.1 3.5-1.8 0-3.3-.8-4.3-2l-3 2.3c1.8 3 5 4.9 8.6 4.9 5.4 0 9-3.8 9-9.2z"/><path fill="#FBBC05" d="M7.7 13.1c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2L4.7 6.9c-.9 1.4-1.4 3-1.4 4.9s.5 3.5 1.4 4.9l3-2.4z"/></svg>
          <span>Sign up with Google</span>
        </button>
        <div className="mt-4 text-center text-xs">
          <span className="text-neutral-600">Already have an account?</span>{' '}
          <a href="/login" className="text-primary">Sign In</a>
        </div>
      </div>
      </div>
    </div>
  )
}