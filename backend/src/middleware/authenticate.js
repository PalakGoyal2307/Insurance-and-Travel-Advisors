import { User } from '../models/User.js'
import { verifyAccessToken, extractTokenFromRequest } from '../services/tokenService.js'
import { ApiError } from '../utils/ApiError.js'

export const authenticate = async (req, _res, next) => {
  try {
    const token = extractTokenFromRequest(req)
    if (!token) {
      return next(new ApiError(401, 'Authentication required'))
    }

    const payload = verifyAccessToken(token)

    const user = await User.findById(payload.sub)
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Invalid or inactive account'))
    }

    req.user = user
    return next()
  } catch (_error) {
    return next(new ApiError(401, 'Invalid or expired token'))
  }
}

export const optionalAuthenticate = async (req, _res, next) => {
  try {
    const token = extractTokenFromRequest(req)
    if (!token) return next()

    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub)

    if (user && user.isActive) {
      req.user = user
    }

    return next()
  } catch (_error) {
    return next()
  }
}
