import { Router } from 'express'
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js'
import { authenticate } from '../middleware/authenticate.js'
import { updateProfileValidator } from '../validators/profileValidators.js'
import { validateRequest } from '../middleware/validateRequest.js'

const router = Router()

router.use(authenticate)
router.get('/me', getMyProfile)
router.patch('/me', updateProfileValidator, validateRequest, updateMyProfile)

export default router
