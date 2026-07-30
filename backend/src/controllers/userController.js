import mongoose from 'mongoose'
import { User } from '../models/User.js'
import { HealthApplication } from '../models/HealthApplication.js'
import { LifeApplication } from '../models/LifeApplication.js'
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

  const userIds = items.map((item) => item._id)
  const [healthProposers, lifeProposers] = await Promise.all([
    HealthApplication.find({
      userId: { $in: userIds },
      proposerType: 'others',
      proposerName: { $exists: true, $ne: '' },
    })
      .select('userId proposerName createdAt')
      .sort({ createdAt: -1 })
      .lean(),
    LifeApplication.find({
      userId: { $in: userIds },
      proposerType: 'others',
      proposerName: { $exists: true, $ne: '' },
    })
      .select('userId proposerName createdAt')
      .sort({ createdAt: -1 })
      .lean(),
  ])

  const proposerNameByUserId = new Map()
  ;[...healthProposers, ...lifeProposers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .forEach((item) => {
      const key = item.userId.toString()
      if (!proposerNameByUserId.has(key)) {
        proposerNameByUserId.set(key, item.proposerName)
      }
    })

  const enrichedItems = items.map((item) => ({
    ...item,
    proposerName: proposerNameByUserId.get(item._id.toString()) || '',
  }))

  res.status(200).json({
    success: true,
    data: {
      items: enrichedItems,
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
