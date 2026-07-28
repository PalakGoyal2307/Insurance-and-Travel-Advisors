import { useMemo, useState } from 'react'
import type { PageId } from '../App'
import { resetPassword } from '../utils/authApi'
import { ApiRequestError } from '../utils/api'

interface Props {
  navigate: (page: PageId) => void
}

export default function ResetPasswordPage({ navigate }: Props) {
  const queryToken = useMemo(() => new URLSearchParams(window.location.search).get('token') || '', [])
  const [token, setToken] = useState(queryToken)
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!token.trim()) {
      setError('Reset token is required.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password must match.')
      return
    }

    setIsSubmitting(true)

    try {
      await resetPassword({
        token: token.trim(),
        newPassword,
        confirmNewPassword,
      })
      setSuccess('Password reset successful. You can now login with your new password.')
      setTimeout(() => navigate('login'), 1400)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to reset password right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-md mx-auto bg-white border border-blue-100 rounded-3xl shadow-xl p-8">
        <h1 className="font-display text-3xl text-[#0D2B5E] font-bold mb-2">Reset Password</h1>
        <p className="text-gray-500 text-sm mb-6">Set a new password for your account using the reset token from your email.</p>

        {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Reset Token</label>
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              placeholder="Paste reset token"
            />
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">New Password</label>
            <div className="space-y-2">
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
                placeholder="Enter new password"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={showNewPassword} onChange={(e) => setShowNewPassword(e.target.checked)} />
                Show password
              </label>
            </div>
          </div>

          <div>
            <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Confirm New Password</label>
            <div className="space-y-2">
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
                placeholder="Confirm new password"
              />
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input type="checkbox" checked={showConfirmNewPassword} onChange={(e) => setShowConfirmNewPassword(e.target.checked)} />
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
            {isSubmitting ? 'Updating password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <button onClick={() => navigate('login')} className="font-bold text-[#F47B20] hover:underline">
            Back to login
          </button>
        </div>
      </div>
    </div>
  )
}
