import { ApiError } from '../utils/ApiError.js'

export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'))
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You are not authorized to perform this action'))
    }

    return next()
  }
}
