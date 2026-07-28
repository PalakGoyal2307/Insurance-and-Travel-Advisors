import multer from 'multer'
import { ALLOWED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from '../constants/documentConstants.js'
import { ApiError } from '../utils/ApiError.js'

const storage = multer.memoryStorage()

const fileFilter = (_req, file, callback) => {
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    callback(new ApiError(400, 'Unsupported file format. Only PDF, JPG, PNG, and WEBP are allowed.'))
    return
  }

  callback(null, true)
}

export const uploadDocumentMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE_BYTES,
  },
  fileFilter,
})
