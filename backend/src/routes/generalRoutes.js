import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createGeneralApplicationValidator } from '../validators/applicationValidators.js'
import { createGeneralApplication, listMyGeneralApplications } from '../controllers/insuranceApplicationController.js'

const router = Router()

router.use(authenticate)
router.get('/applications/my', listMyGeneralApplications)
router.post('/applications', createGeneralApplicationValidator, validateRequest, createGeneralApplication)

export default router
