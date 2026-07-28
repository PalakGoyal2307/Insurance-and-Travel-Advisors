import { Router } from 'express'
import { register, login, logout, me, changePassword, forgotPassword, resetPassword } from '../controllers/authController.js'
import { registerValidator, loginValidator, changePasswordValidator, forgotPasswordValidator, resetPasswordValidator } from '../validators/authValidators.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { authenticate } from '../middleware/authenticate.js'
import { authRateLimiter } from '../middleware/rateLimiters.js'

const router = Router()

router.post('/register', authRateLimiter, registerValidator, validateRequest, register)
router.post('/login', authRateLimiter, loginValidator, validateRequest, login)
router.post('/forgot-password', authRateLimiter, forgotPasswordValidator, validateRequest, forgotPassword)
router.post('/reset-password', authRateLimiter, resetPasswordValidator, validateRequest, resetPassword)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, me)
router.patch('/change-password', authenticate, changePasswordValidator, validateRequest, changePassword)

export default router
