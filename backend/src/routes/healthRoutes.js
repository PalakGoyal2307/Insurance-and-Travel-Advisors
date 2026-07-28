import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createHealthApplicationValidator } from '../validators/applicationValidators.js'
import { createHealthApplication, listMyHealthApplications } from '../controllers/insuranceApplicationController.js'

const router = Router()

router.use(authenticate)
router.get('/applications/my', listMyHealthApplications)
router.post('/applications', createHealthApplicationValidator, validateRequest, createHealthApplication)

export default router
