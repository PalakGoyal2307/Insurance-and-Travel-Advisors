import { User } from '../models/User.js'
import crypto from 'crypto'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { hashPassword, comparePassword } from '../services/passwordService.js'
import { generateUserCode } from '../services/userCodeService.js'
import { signAccessToken } from '../services/tokenService.js'
import { getAuthCookieOptions } from '../utils/cookieOptions.js'
import { env } from '../config/env.js'
import { sendPasswordResetEmail } from '../services/emailService.js'

const buildAuthResponse = (user) => ({
  id: user._id,
  customerCode: user.customerCode,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const register = asyncHandler(async (req, res) => {
  const { fullName, email, phone, password } = req.body

  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { phone }],
  })

  if (existingUser) {
    throw new ApiError(409, 'A user with the same email or phone already exists')
  }

  const passwordHash = await hashPassword(password)
  const customerCode = await generateUserCode()

  const user = await User.create({
    customerCode,
    fullName,
    email: email.toLowerCase(),
    phone,
    passwordHash,
    role: 'user',
  })

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })

  res.cookie(env.cookieName, token, getAuthCookieOptions())

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: buildAuthResponse(user),
      token,
    },
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash')
  if (!user) {
    throw new ApiError(401, 'Invalid email or password')
  }

  const isValidPassword = await comparePassword(password, user.passwordHash)
  if (!isValidPassword) {
    throw new ApiError(401, 'Invalid email or password')
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Your account is currently inactive. Please contact support.')
  }

  user.lastLoginAt = new Date()
  await user.save()

  const token = signAccessToken({ sub: user._id.toString(), role: user.role })
  res.cookie(env.cookieName, token, getAuthCookieOptions())

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: buildAuthResponse(user),
      token,
    },
  })
})

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(env.cookieName, {
    ...getAuthCookieOptions(),
    maxAge: undefined,
  })

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  })
})

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: buildAuthResponse(req.user),
    },
  })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+passwordHash')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash)
  if (!isCurrentPasswordValid) {
    throw new ApiError(400, 'Current password is incorrect')
  }

  user.passwordHash = await hashPassword(newPassword)
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  })
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const user = await User.findOne({ email })

  if (user) {
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + env.passwordResetTokenExpiresMinutes * 60 * 1000)

    user.passwordResetTokenHash = tokenHash
    user.passwordResetExpiresAt = expiresAt
    await user.save()

    const resetUrl = `${env.frontendUrl}?page=reset-password&token=${encodeURIComponent(rawToken)}`

    try {
      await sendPasswordResetEmail({
        toEmail: user.email,
        fullName: user.fullName,
        resetUrl,
      })
    } catch (error) {
      user.passwordResetTokenHash = null
      user.passwordResetExpiresAt = null
      await user.save()
      throw new ApiError(500, 'Unable to send reset email. Please try again later.', { reason: String(error.message || error) })
    }
  }

  res.status(200).json({
    success: true,
    message: 'If this email is registered, a password reset link has been sent.',
  })
})

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body.token || '').trim()
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpiresAt +passwordHash')

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token')
  }

  user.passwordHash = await hashPassword(req.body.newPassword)
  user.passwordResetTokenHash = null
  user.passwordResetExpiresAt = null
  await user.save()

  res.status(200).json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  })
})
