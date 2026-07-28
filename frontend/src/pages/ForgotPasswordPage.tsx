import { useState } from 'react'
import type { PageId } from '../App'
import { forgotPassword } from '../utils/authApi'
import { ApiRequestError } from '../utils/api'

interface Props {
  navigate: (page: PageId) => void
}

export default function ForgotPasswordPage({ navigate }: Props) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsSubmitting(true)

    try {
      await forgotPassword({ email: email.trim() })
      setSuccess('If this email is registered, a reset link has been sent. Please check your inbox.')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to process your request right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md mx-auto bg-white border border-blue-100 rounded-3xl shadow-xl p-8">
        <h1 className="font-display text-3xl text-[#0D2B5E] font-bold mb-2">Forgot Password</h1>
        <p className="text-gray-500 text-sm mb-6">Enter your registered email to receive a secure password reset link.</p>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-70"
            style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
          >
            {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Remembered your password?{' '}
          <button onClick={() => navigate('login')} className="font-bold text-[#F47B20] hover:underline">
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
