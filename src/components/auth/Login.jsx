
import { useEffect, useState } from 'react'
import { Mail, Lock, Thermometer, Sun } from 'lucide-react'
import Button from '../shared/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import LoginSlider from './LoginSlider.jsx'

function GoogleIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 31.6 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 5.1 29.7 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20c10.9 0 20-8.9 20-20 0-1.7-.2-3.3-.4-4.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.3 16 18.8 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.9 5.1 29.7 3 24 3 16 3 9.2 7.2 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5.2 0 10-2 13.6-5.3l-6.3-5.3C29.3 35 24.9 37 24 37c-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9.1 40.8 16 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.7 3.6-5.1 6.5-9.3 6.5-5.2 0-9.6-3.5-11.2-8.3l-6.6 5.1C9.1 40.8 16 43 24 43c10.9 0 20-8.9 20-20 0-1.7-.2-3.3-.4-4.5z"/>
    </svg>
  )
}

export default function Login() {
  const { login, loginWithGoogle, checkProfileExists, user } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('remember_email')
    if (saved) setEmail(saved)
  }, [])

  useEffect(() => {
    if (user) {
      setLoading(true)
      checkProfileExists(user.id)
        .then(exists => {
          if (exists) window.location.assign('/dashboard')
          else window.location.assign('/profile')
        })
        .finally(() => setLoading(false))
    }
  }, [user])

  const validate = () => {
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!okEmail) return 'Enter a valid email address'
    if (!password) return 'Password is required'
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
      // Clear signup flag if it exists (user is now logging in normally)
      localStorage.removeItem('_signing_up')
      
      const { error: err } = await login(email, password)
      if (err) setError(err.message || 'Failed to sign in')
      else {
        if (remember) localStorage.setItem('remember_email', email)
      }
    } catch (ex) {
      setError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const onGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      const { error: err } = await loginWithGoogle()
      if (err) setError(err.message || 'Google sign-in failed')
    } catch {
      setError('Google sign-in failed')
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
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Thermometer className="h-6 w-6 text-primary" />
          </div>
          <div className="text-2xl font-bold">Welcome Back</div>
          <div className="text-sm text-neutral-600">Sign in to check your heat risk</div>
        </div>
        <form className="mt-4 space-y-3" onSubmit={onSubmit}>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <Mail className="h-5 w-5 text-neutral-500" />
            <input className="w-full outline-none text-sm" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary">
            <Lock className="h-5 w-5 text-neutral-500" />
            <input className="w-full outline-none text-sm" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="h-4 w-4 accent-primary" checked={remember} onChange={e => setRemember(e.target.checked)} />
              <span>Remember me</span>
            </label>
            <a href="#reset" className="text-primary text-xs">Forgot Password?</a>
          </div>
          {error && <div className="text-primary text-xs">{error}</div>}
          <Button type="submit" className="w-full btn-primary px-4 py-2.5 rounded-xl text-sm" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
        <div className="flex items-center gap-2 my-3">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-500">or continue with</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>
        <button className="w-full rounded-xl px-4 py-2.5 bg-white border border-neutral-200 shadow-md flex items-center justify-center gap-2 text-sm" onClick={onGoogle} disabled={loading}>
          <GoogleIcon />
          <span>Sign in with Google</span>
        </button>
        <div className="mt-4 text-center text-xs">
          <span className="text-neutral-600">Don't have an account?</span>{' '}
          <a href="/signup" className="text-primary">Sign Up</a>
        </div>
      </div>
      </div>
    </div>
  )
}