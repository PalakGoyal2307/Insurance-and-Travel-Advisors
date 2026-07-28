import { env } from '../config/env.js'

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  secure: env.nodeEnv === 'production' ? true : env.cookieSecure,
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/',
})
