import mongoose from 'mongoose'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { HealthApplication } from '../models/HealthApplication.js'
import { LifeApplication } from '../models/LifeApplication.js'
import { GeneralApplication } from '../models/GeneralApplication.js'

const APPLICATION_MODELS = {
  health: HealthApplication,
  life: LifeApplication,
  general: GeneralApplication,
}

const createApplicationFactory = (moduleName, Model) => asyncHandler(async (req, res) => {
  const payload = { ...req.body }

  if (payload.primaryMember) {
    const additionalMembers = Array.isArray(payload.additionalMembers) ? payload.additionalMembers : []
    const totalMembers = 1 + additionalMembers.length
    if (totalMembers > 4) {
      throw new ApiError(400, 'A maximum of 4 members is allowed per application')
    }

    payload.primaryMember = {
      ...payload.primaryMember,
      memberNumber: 1,
    }

    payload.additionalMembers = additionalMembers.map((member, index) => ({
      ...member,
      memberNumber: index + 2,
    }))

    payload.proposerType = payload.proposerType === 'others' ? 'others' : 'self'
    payload.proposerSequence = payload.proposerType === 'others' ? Number(payload.proposerSequence) : null
    payload.proposerName = payload.proposerType === 'others'
      ? String(payload.primaryMember.fullName || '').trim()
      : ''
  }

  const application = await Model.create({
    userId: req.user._id,
    ...payload,
  })

  res.status(201).json({
    success: true,
    message: `${moduleName} insurance application created successfully`,
    data: {
      application,
    },
  })
})

const listMyApplicationsFactory = (Model) => asyncHandler(async (req, res) => {
  const items = await Model.find({ userId: req.user._id }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    data: {
      items,
    },
  })
})

export const createHealthApplication = createApplicationFactory('Health', HealthApplication)
export const listMyHealthApplications = listMyApplicationsFactory(HealthApplication)

export const createLifeApplication = createApplicationFactory('Life', LifeApplication)
export const listMyLifeApplications = listMyApplicationsFactory(LifeApplication)

export const createGeneralApplication = createApplicationFactory('General', GeneralApplication)
export const listMyGeneralApplications = listMyApplicationsFactory(GeneralApplication)

export const listApplicationsForAdmin = asyncHandler(async (req, res) => {
  const { module } = req.params
  const page = Math.max(Number(req.query.page || 1), 1)
  const limit = Math.min(Math.max(Number(req.query.limit || 20), 1), 100)
  const skip = (page - 1) * limit
  const search = String(req.query.search || '').trim()
  const status = String(req.query.status || '').trim()

  const Model = APPLICATION_MODELS[module]
  if (!Model) {
    throw new ApiError(400, 'Invalid insurance module')
  }

  const query = {}
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { planName: { $regex: search, $options: 'i' } },
    ]
  }

  if (status) {
    query.status = status
  }

  const [items, total] = await Promise.all([
    Model.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Model.countDocuments(query),
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

export const updateApplicationStatusForAdmin = asyncHandler(async (req, res) => {
  const { module, applicationId } = req.params
  const Model = APPLICATION_MODELS[module]
  if (!Model) {
    throw new ApiError(400, 'Invalid insurance module')
  }

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, 'Invalid application ID')
  }

  const application = await Model.findByIdAndUpdate(
    applicationId,
    { status: req.body.status },
    { new: true }
  )

  if (!application) {
    throw new ApiError(404, 'Application not found')
  }

  res.status(200).json({
    success: true,
    message: 'Application status updated successfully',
    data: {
      application,
    },
  })
})

export const getApplicationForAdmin = asyncHandler(async (req, res) => {
  const { module, applicationId } = req.params
  const Model = APPLICATION_MODELS[module]
  if (!Model) {
    throw new ApiError(400, 'Invalid insurance module')
  }

  if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    throw new ApiError(400, 'Invalid application ID')
  }

  const application = await Model.findById(applicationId)
  if (!application) {
    throw new ApiError(404, 'Application not found')
  }

  res.status(200).json({
    success: true,
    data: {
      application,
    },
  })
})
