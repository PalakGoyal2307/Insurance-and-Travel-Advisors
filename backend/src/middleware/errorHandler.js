import mongoose from 'mongoose'

export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500
  let message = error.message || 'Internal server error'
  let details = error.details || null

  if (error instanceof mongoose.Error.ValidationError) {
    message = 'Database validation failed'
    details = Object.values(error.errors).map((err) => err.message)
  }

  if (error.code === 11000) {
    message = 'Duplicate value detected'
    details = error.keyValue
  }

  if (error instanceof mongoose.Error.CastError) {
    message = 'Invalid resource identifier'
  }

  if (statusCode >= 500) {
    console.error(error)
  }

  res.status(statusCode).json({
    success: false,
    message,
    details,
  })
}
