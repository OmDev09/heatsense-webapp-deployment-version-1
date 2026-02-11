import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, Thermometer } from 'lucide-react'
import Button from '../shared/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import LoginSlider from './LoginSlider.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { login, checkProfileExists } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('Sign In')

  useEffect(() => {
    const saved = localStorage.getItem('remember_email')
    if (saved) setEmail(saved)
  }, [])

  const validate = () => {
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!okEmail) return 'Enter a valid email address'
    if (!password) return 'Password is required'
    return ''
  }

  const handleLogin = async e => {
    e.preventDefault()
    setError('')
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setLoading(true)
    setStatus('Signing in...')
    try {
      localStorage.removeItem('_signing_up')
      const { data, error } = await login(email, password)
      if (error) {
        setError(error.message || 'Failed to sign in')
        setLoading(false)
        setStatus('Sign In')
        return
      }
      const loggedInUser = data?.user
      if (!loggedInUser) {
        setError('Login failed')
        setLoading(false)
        setStatus('Sign In')
        return
      }
      if (remember) localStorage.setItem('remember_email', email)
      setStatus('Verifying profile...')
      await new Promise(r => setTimeout(r, 800))
      const profileExists = await checkProfileExists(loggedInUser.id)
      if (profileExists) navigate('/dashboard', { replace: true })
      else navigate('/profile', { replace: true })
    } catch (ex) {
      setError('Login failed')
      setLoading(false)
      setStatus('Sign In')
    } finally {
      setLoading(false)
      setStatus('Sign In')
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
        <form className="mt-4 space-y-3" onSubmit={handleLogin}>
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
            {loading ? status : 'Sign In'}
          </Button>
        </form>
        <div className="mt-4 text-center text-xs">
          <span className="text-neutral-600">Don't have an account?</span>{' '}
          <a href="/signup" className="text-primary hover:underline">Sign Up</a>
        </div>
      </div>
      </div>
    </div>
  )
}
