import { Router } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { uploadDocumentMiddleware } from '../middleware/uploadDocument.js'
import { validateRequest } from '../middleware/validateRequest.js'
import { uploadDocumentValidator, documentIdValidator } from '../validators/documentValidators.js'
import { listMyDocuments, uploadDocument, streamDocument, downloadDocument } from '../controllers/documentController.js'

const router = Router()

router.use(authenticate)
router.get('/', listMyDocuments)
router.post('/', uploadDocumentMiddleware.single('file'), uploadDocumentValidator, validateRequest, uploadDocument)
router.get('/:documentId/view', documentIdValidator, validateRequest, streamDocument)
router.get('/:documentId/download', documentIdValidator, validateRequest, downloadDocument)

export default router
