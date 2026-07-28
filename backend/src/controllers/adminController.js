import { asyncHandler } from '../utils/asyncHandler.js'
import { User } from '../models/User.js'
import { ContactInquiry } from '../models/ContactInquiry.js'
import { HealthApplication } from '../models/HealthApplication.js'
import { LifeApplication } from '../models/LifeApplication.js'
import { GeneralApplication } from '../models/GeneralApplication.js'
import { Document } from '../models/Document.js'

export const getAdminDashboardSummary = asyncHandler(async (_req, res) => {
  const [
    totalUsers,
    totalHealthApplications,
    totalLifeApplications,
    totalGeneralApplications,
    totalContacts,
    totalDocuments,
    recentRegistrations,
    recentHealthApplications,
    recentLifeApplications,
    recentGeneralApplications,
    recentContacts,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    completedApplications,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    HealthApplication.countDocuments(),
    LifeApplication.countDocuments(),
    GeneralApplication.countDocuments(),
    ContactInquiry.countDocuments(),
    Document.countDocuments({ isActive: true }),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(5).select('customerCode fullName email phone createdAt').lean(),
    HealthApplication.find().sort({ createdAt: -1 }).limit(5).lean(),
    LifeApplication.find().sort({ createdAt: -1 }).limit(5).lean(),
    GeneralApplication.find().sort({ createdAt: -1 }).limit(5).lean(),
    ContactInquiry.find().sort({ createdAt: -1 }).limit(10).lean(),
    Promise.all([
      HealthApplication.countDocuments({ status: 'pending' }),
      LifeApplication.countDocuments({ status: 'pending' }),
      GeneralApplication.countDocuments({ status: 'pending' }),
    ]),
    Promise.all([
      HealthApplication.countDocuments({ status: 'approved' }),
      LifeApplication.countDocuments({ status: 'approved' }),
      GeneralApplication.countDocuments({ status: 'approved' }),
    ]),
    Promise.all([
      HealthApplication.countDocuments({ status: 'rejected' }),
      LifeApplication.countDocuments({ status: 'rejected' }),
      GeneralApplication.countDocuments({ status: 'rejected' }),
    ]),
    Promise.all([
      HealthApplication.countDocuments({ status: 'completed' }),
      LifeApplication.countDocuments({ status: 'completed' }),
      GeneralApplication.countDocuments({ status: 'completed' }),
    ]),
  ])

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalHealthApplications,
        totalLifeApplications,
        totalGeneralApplications,
        totalContacts,
        totalDocuments,
        pendingApplications: pendingApplications.reduce((sum, count) => sum + count, 0),
        approvedApplications: approvedApplications.reduce((sum, count) => sum + count, 0),
        rejectedApplications: rejectedApplications.reduce((sum, count) => sum + count, 0),
        completedApplications: completedApplications.reduce((sum, count) => sum + count, 0),
      },
      recentRegistrations,
      recentApplications: {
        health: recentHealthApplications,
        life: recentLifeApplications,
        general: recentGeneralApplications,
      },
      recentContacts,
    },
  })
})
