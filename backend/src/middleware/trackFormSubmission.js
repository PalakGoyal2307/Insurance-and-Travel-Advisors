import { appendFormSubmission } from '../services/googleSheetsService.js'

const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
  'api_key',
])

const shouldTrackRequest = (req) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return false
  }

  if (['GET', 'HEAD'].includes(req.method.toUpperCase())) {
    return false
  }

  const bodyKeys = Object.keys(req.body)
  if (bodyKeys.length === 0) {
    return false
  }

  return bodyKeys.some((key) => !SENSITIVE_FIELD_NAMES.has(key.toLowerCase()))
}

const inferFormType = (req) => {
  const path = req.originalUrl || req.path || ''

  if (path.includes('/auth/register')) return 'Registration'
  if (path.includes('/auth/login')) return 'Login'
  if (path.includes('/auth/forgot-password')) return 'Forgot Password'
  if (path.includes('/auth/reset-password')) return 'Reset Password'
  if (path.includes('/contact')) return 'Contact Form'
  if (path.includes('/profile')) return 'Profile Update'
  if (path.includes('/documents')) return 'Document Upload'
  if (path.includes('/admin')) return 'Admin Form'
  if (path.includes('/life')) return 'Life Application'
  if (path.includes('/general')) return 'General Application'

  return path || 'Form Submission'
}

export const trackFormSubmission = (req, _res, next) => {
  if (!shouldTrackRequest(req)) {
    return next()
  }

  void appendFormSubmission({
    route: req.originalUrl || req.path || 'unknown',
    method: req.method,
    formType: inferFormType(req),
    payload: req.body,
  }).catch((error) => {
    console.error('Failed to store form submission in Google Sheets:', error)
  })

  return next()
}
