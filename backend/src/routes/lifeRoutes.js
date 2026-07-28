import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { createLifeApplicationValidator } from '../validators/applicationValidators.js'
import { createLifeApplication, listMyLifeApplications } from '../controllers/insuranceApplicationController.js'

const router = Router()

router.use(authenticate)
router.get('/applications/my', listMyLifeApplications)
router.post('/applications', createLifeApplicationValidator, validateRequest, createLifeApplication)

export default router
