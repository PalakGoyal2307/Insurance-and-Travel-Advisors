import { useState } from 'react'
import type { PageId } from '../App'
import type { AuthUser } from '../utils/authApi'
import { registerUser } from '../utils/authApi'
import { ApiRequestError } from '../utils/api'

interface Props {
  navigate: (page: PageId) => void
  onRegisterSuccess: (user: AuthUser) => void
}

export default function RegisterPage({ navigate, onRegisterSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const onChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password and confirm password must match.')
      return
    }

    setIsSubmitting(true)

    try {
      const user = await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })

      onRegisterSuccess(user)
      navigate('home')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to register right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md mx-auto bg-white border border-blue-100 rounded-3xl shadow-xl p-8">
        <h1 className="font-display text-3xl text-[#0D2B5E] font-bold mb-2">Register</h1>
        <p className="text-gray-500 text-sm mb-6">Create your secure PNP Advisors account.</p>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Full Name</label>
            <input
              required
              type="text"
              value={form.fullName}
              onChange={(e) => onChange('fullName', e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Email Address</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Phone Number</label>
            <input
              required
              type="tel"
              value={form.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              placeholder="+91XXXXXXXXXX"
            />
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Password</label>
            <div className="space-y-2">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => onChange('password', e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
                placeholder="Strong password"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} />
                Show password
              </label>
            </div>
          </div>

          <div>
            <label className="text-[#0D2B5E] text-sm font-bold block mb-1.5">Confirm Password</label>
            <div className="space-y-2">
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => onChange('confirmPassword', e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
                placeholder="Repeat password"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={showConfirmPassword} onChange={(e) => setShowConfirmPassword(e.target.checked)} />
                Show confirm password
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
          >
            {isSubmitting ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already registered?{' '}
          <button onClick={() => navigate('login')} className="font-bold text-[#F47B20] hover:underline">
            Login here
          </button>
        </div>
      </div>
    </div>
  )
}
