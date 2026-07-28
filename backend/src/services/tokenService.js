import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export const signAccessToken = (payload) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpires,
  })
}

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwtAccessSecret)
}

export const extractTokenFromRequest = (req) => {
  const cookieToken = req.cookies?.[env.cookieName]
  if (cookieToken) return cookieToken

  const authHeader = req.headers.authorization
  if (!authHeader) return null

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token) return null

  return token
}
