import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildProfileBundle } from '../services/profileService.js'

const buildProfileResponse = (user) => ({
  id: user._id,
  customerCode: user.customerCode,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
})

export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, 'Profile not found')
  }

  const profileBundle = await buildProfileBundle(user._id)

  res.status(200).json({
    success: true,
    data: {
      profile: {
        ...buildProfileResponse(user),
        ...profileBundle,
      },
    },
  })
})

export const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, 'Profile not found')
  }

  const { fullName, email, phone } = req.body

  if (email && email.toLowerCase() !== user.email) {
    const existingEmail = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } })
    if (existingEmail) {
      throw new ApiError(409, 'Email is already in use by another account')
    }
    user.email = email.toLowerCase()
  }

  if (phone && phone !== user.phone) {
    const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } })
    if (existingPhone) {
      throw new ApiError(409, 'Phone number is already in use by another account')
    }
    user.phone = phone
  }

  if (fullName) {
    user.fullName = fullName
  }

  await user.save()

  const profileBundle = await buildProfileBundle(user._id)

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      profile: {
        ...buildProfileResponse(user),
        ...profileBundle,
      },
    },
  })
})
