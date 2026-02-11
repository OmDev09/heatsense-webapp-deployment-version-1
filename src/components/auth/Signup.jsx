import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, User, Mail, Lock } from 'lucide-react'
import Button from '../shared/Button.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import LoginSlider from './LoginSlider.jsx'

export default function Signup() {
  const navigate = useNavigate()
  const { signup } = useAuth()
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
      localStorage.setItem('_signing_up', 'true')
      const { error: err } = await signup(email, password)
      if (err) {
        localStorage.removeItem('_signing_up')
        setError(err.message || 'Failed to create account')
      } else {
        localStorage.setItem('signup_name', name)
        navigate('/profile', { replace: true })
      }
    } catch {
      localStorage.removeItem('_signing_up')
      setError('Signup failed')
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
        <div className="mt-4 text-center text-xs">
          <span className="text-neutral-600">Already have an account?</span>{' '}
          <a href="/login" className="text-primary hover:underline">Sign In</a>
        </div>
      </div>
      </div>
    </div>
  )
}
