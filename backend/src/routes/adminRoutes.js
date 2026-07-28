import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorize.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { getAdminDashboardSummary } from '../controllers/adminController.js'
import {
  listUsersForAdmin,
  getUserByIdForAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../controllers/userController.js'
import { updateUserByAdminValidator } from '../validators/adminValidators.js'
import {
  listApplicationsForAdmin,
  getApplicationForAdmin,
  updateApplicationStatusForAdmin,
} from '../controllers/insuranceApplicationController.js'
import { updateApplicationStatusValidator } from '../validators/applicationValidators.js'

const router = Router()

router.use(authenticate, authorizeRoles('admin'))

router.get('/dashboard', getAdminDashboardSummary)
router.get('/users', listUsersForAdmin)
router.get('/users/:userId', getUserByIdForAdmin)
router.patch('/users/:userId', updateUserByAdminValidator, validateRequest, updateUserByAdmin)
router.delete('/users/:userId', deleteUserByAdmin)
router.get('/applications/:module', listApplicationsForAdmin)
router.get('/applications/:module/:applicationId', getApplicationForAdmin)
router.patch('/applications/:module/:applicationId/status', updateApplicationStatusValidator, validateRequest, updateApplicationStatusForAdmin)

export default router
