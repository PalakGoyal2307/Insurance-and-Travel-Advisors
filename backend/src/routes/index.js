import { Router } from 'express'
import systemRoutes from './systemRoutes.js'
import authRoutes from './authRoutes.js'
import profileRoutes from './profileRoutes.js'
import userRoutes from './userRoutes.js'
import documentRoutes from './documentRoutes.js'
import contactRoutes from './contactRoutes.js'
import adminRoutes from './adminRoutes.js'
import healthRoutes from './healthRoutes.js'
import lifeRoutes from './lifeRoutes.js'
import generalRoutes from './generalRoutes.js'

const router = Router()

router.use('/system', systemRoutes)
router.use('/auth', authRoutes)
router.use('/profile', profileRoutes)
router.use('/users', userRoutes)
router.use('/documents', documentRoutes)
router.use('/health', healthRoutes)
router.use('/life', lifeRoutes)
router.use('/general', generalRoutes)
router.use('/contact', contactRoutes)
router.use('/admin', adminRoutes)

export default router
