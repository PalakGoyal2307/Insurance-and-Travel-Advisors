import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildProfileBundle } from '../services/profileService.js'

export const listUsersForAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1)
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100)
  const skip = (page - 1) * limit
  const search = String(req.query.search || '').trim()

  const query = { role: 'user' }
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { customerCode: { $regex: search, $options: 'i' } },
    ]
  }

  const [items, total] = await Promise.all([
    User.find(query)
      .select('customerCode fullName email phone role isActive lastLoginAt createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
  ])

  res.status(200).json({
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

export const getUserByIdForAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID')
  }

  const user = await User.findById(userId).select('customerCode fullName email phone role isActive lastLoginAt createdAt updatedAt')
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const profileBundle = await buildProfileBundle(user._id)

  res.status(200).json({
    success: true,
    data: {
      user: {
        ...user.toObject(),
        ...profileBundle,
      },
    },
  })
})

export const updateUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID')
  }

  const { fullName, email, phone, role, isActive } = req.body
  const user = await User.findById(userId)

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

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

  if (typeof fullName === 'string' && fullName.trim()) {
    user.fullName = fullName.trim()
  }

  if (role && ['user', 'admin'].includes(role)) {
    user.role = role
  }

  if (typeof isActive === 'boolean') {
    user.isActive = isActive
  }

  await user.save()

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user,
    },
  })
})

export const deleteUserByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID')
  }

  const user = await User.findByIdAndDelete(userId)
  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  })
})
