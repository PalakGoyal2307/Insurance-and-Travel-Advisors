import { validationResult } from 'express-validator'
import { ApiError } from '../utils/ApiError.js'

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req)

  if (result.isEmpty()) {
    return next()
  }

  const details = result.array().map((issue) => ({
    field: issue.path,
    message: issue.msg,
  }))

  return next(new ApiError(400, 'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.', details))
}
