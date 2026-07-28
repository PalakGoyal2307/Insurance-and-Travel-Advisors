import { Router } from 'express'
import {
  createContactInquiry,
  listContactInquiriesForAdmin,
  updateContactInquiryStatus,
} from '../controllers/contactController.js'
import { optionalAuthenticate, authenticate } from '../middleware/authenticate.js'
import { authorizeRoles } from '../middleware/authorize.js'
import { createContactValidator, updateContactStatusValidator } from '../validators/contactValidators.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { contactRateLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.post('/', contactRateLimiter, optionalAuthenticate, createContactValidator, validateRequest, createContactInquiry)

router.get('/admin/list', authenticate, authorizeRoles('admin'), listContactInquiriesForAdmin)
router.patch('/admin/:inquiryId/status', authenticate, authorizeRoles('admin'), updateContactStatusValidator, validateRequest, updateContactInquiryStatus)

export default router
