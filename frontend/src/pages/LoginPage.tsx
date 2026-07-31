import { useMemo, useState } from 'react'
import type { PageId } from '../App'
import type { AuthUser } from '../utils/authApi'
import { loginUser } from '../utils/authApi'
import { ApiRequestError } from '../utils/api'

interface Props {
  navigate: (page: PageId) => void
  onLoginSuccess: (user: AuthUser) => void
}

export default function LoginPage({ navigate, onLoginSuccess }: Props) {
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const candidate = params.get('returnTo') || ''
    if (!candidate.startsWith('/')) return ''
    return candidate
  }, [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const user = await loginUser({ email: email.trim(), password })
      onLoginSuccess(user)
      if (returnTo) {
        window.location.replace(returnTo)
      } else {
        navigate('home')
      }
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to login right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md mx-auto bg-white border border-blue-100 rounded-3xl shadow-xl p-8">
        <h1 className="font-display text-3xl text-[#0D2B5E] font-bold mb-2">Login</h1>
        <p className="text-gray-500 text-sm mb-6">Access your profile and insurance dashboard.</p>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Password</label>
            <div className="space-y-2">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
                placeholder="Enter your password"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                Show password
              </label>
            </div>
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => navigate('forgot-password')}
                className="text-xs font-bold text-[#F47B20] hover:underline"
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
          >
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          New customer?{' '}
          <button onClick={() => navigate('register')} className="font-bold text-[#F47B20] hover:underline">
            Register here
          </button>
        </div>
      </div>
    </div>
  )
}
