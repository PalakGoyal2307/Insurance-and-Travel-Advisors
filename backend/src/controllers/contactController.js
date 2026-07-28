import mongoose from 'mongoose'
import { ContactInquiry } from '../models/ContactInquiry.js'
import { User } from '../models/User.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const createContactInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message, context, source } = req.body

  const inquiry = await ContactInquiry.create({
    userId: req.user?._id ?? null,
    name,
    email: email.toLowerCase(),
    phone,
    message,
    context: context || 'general',
    source: source || 'website',
  })

  res.status(201).json({
    success: true,
    message: 'Contact inquiry stored successfully',
    data: {
      inquiryId: inquiry._id,
    },
  })
})

export const listContactInquiriesForAdmin = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page || 1), 1)
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100)
  const skip = (page - 1) * limit
  const search = String(req.query.search || '').trim()

  const query = {}
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { context: { $regex: search, $options: 'i' } },
    ]
  }

  const [items, total] = await Promise.all([
    ContactInquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContactInquiry.countDocuments(query),
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

export const updateContactInquiryStatus = asyncHandler(async (req, res) => {
  const { inquiryId } = req.params
  if (!mongoose.Types.ObjectId.isValid(inquiryId)) {
    throw new ApiError(400, 'Invalid inquiry ID')
  }

  const inquiry = await ContactInquiry.findByIdAndUpdate(
    inquiryId,
    { status: req.body.status },
    { new: true }
  )

  if (!inquiry) {
    throw new ApiError(404, 'Contact inquiry not found')
  }

  res.status(200).json({
    success: true,
    message: 'Contact inquiry status updated',
    data: {
      inquiry,
    },
  })
})

export const adminDashboardSummary = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalAdmins,
    totalContacts,
    newContacts,
    inProgressContacts,
    resolvedContacts,
    recentUsers,
    recentContacts,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'admin' }),
    ContactInquiry.countDocuments(),
    ContactInquiry.countDocuments({ status: 'new' }),
    ContactInquiry.countDocuments({ status: 'in-progress' }),
    ContactInquiry.countDocuments({ status: 'resolved' }),
    User.find().sort({ createdAt: -1 }).limit(5).select('fullName email phone role customerCode createdAt').lean(),
    ContactInquiry.find().sort({ createdAt: -1 }).limit(10).lean(),
  ])

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalAdmins,
        totalContacts,
        newContacts,
        inProgressContacts,
        resolvedContacts,
      },
      recentUsers,
      recentContacts,
    },
  })
})
