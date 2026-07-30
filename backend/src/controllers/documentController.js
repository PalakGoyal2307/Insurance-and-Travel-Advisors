import path from 'path'
import { PDFParse } from 'pdf-parse'
import { Document } from '../models/Document.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { uploadFileToDrive, trashDriveFile, getDriveFileMetadata, getDriveFileStream } from '../services/googleDriveService.js'
import { DOCUMENT_TYPES } from '../constants/documentConstants.js'

const sanitizeFilePart = (value) => String(value || '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9_-]/g, '')

const buildStoredFileName = ({ customerCode, documentType, originalFileName, subjectName = '', subjectGroup = '' }) => {
  const extension = path.extname(originalFileName) || ''
  const safeType = sanitizeFilePart(DOCUMENT_TYPES[documentType]?.label || documentType) || 'document'
  const safeSubjectGroup = sanitizeFilePart(subjectGroup)
  const safeSubjectName = sanitizeFilePart(subjectName)
  const subjectPart = [safeSubjectGroup, safeSubjectName].filter(Boolean).join('-') || 'Primary-Member'
  return `${customerCode}-${subjectPart}-${safeType}-${Date.now()}${extension}`
}

const mapDocument = (document) => ({
  id: document._id,
  scope: document.scope,
  documentType: document.documentType,
  applicationId: document.applicationId,
  label: DOCUMENT_TYPES[document.documentType]?.label || document.customLabel || document.documentType,
  customLabel: document.customLabel,
  originalFileName: document.originalFileName,
  mimeType: document.mimeType,
  fileSize: document.fileSize,
  googleDriveFileId: document.googleDriveFileId,
  googleDriveViewUrl: document.googleDriveViewUrl,
  googleDriveDownloadUrl: document.googleDriveDownloadUrl,
  uploadedAt: document.createdAt,
  updatedAt: document.updatedAt,
})

const ensureDocumentAccess = (document, user) => {
  if (document.userId.toString() !== user._id.toString() && user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to access this document')
  }
}

const getAadhaarUploadVariant = (customLabel) => {
  const normalized = String(customLabel || '').trim().toLowerCase()
  if (normalized.endsWith('-aadhaar-single')) return 'single'
  if (normalized.endsWith('-aadhaar-front')) return 'front'
  if (normalized.endsWith('-aadhaar-back')) return 'back'
  return null
}

const validateAadhaarPdfPageConstraints = async ({ file, customLabel }) => {
  if (file.mimetype !== 'application/pdf') {
    return
  }

  const uploadVariant = getAadhaarUploadVariant(customLabel)
  let pageCount = 0
  const parser = new PDFParse({ data: file.buffer })
  try {
    const pdfInfo = await parser.getInfo()
    pageCount = Number(pdfInfo.total || 0)
  } catch (_error) {
    throw new ApiError(400, 'Unable to read Aadhaar PDF. Please upload a valid PDF document.')
  } finally {
    await parser.destroy().catch(() => undefined)
  }

  if (!uploadVariant) {
    if (pageCount > 2) {
      throw new ApiError(400, 'Aadhaar upload accepts a maximum of 2 PDF pages.')
    }
    return
  }

  if (uploadVariant === 'single' && pageCount > 2) {
    throw new ApiError(400, 'Aadhaar single upload accepts a maximum of 2 PDF pages.')
  }

  if ((uploadVariant === 'front' || uploadVariant === 'back') && pageCount !== 1) {
    throw new ApiError(400, 'Aadhaar front and back uploads must each be exactly 1 PDF page.')
  }
}

export const listMyDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 })

  res.status(200).json({
    success: true,
    data: {
      items: documents.map(mapDocument),
    },
  })
})

export const uploadDocument = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'A document file is required')
  }

  const { scope, documentType, customLabel = '', applicationId, subjectName = '', subjectGroup = '' } = req.body
  const normalizedCustomLabel = String(customLabel || '').trim()
  const normalizedSubjectName = String(subjectName || '').trim() || req.user.fullName
  const normalizedSubjectGroup = String(subjectGroup || '').trim() || 'Primary Member'

  if (documentType === 'aadhaarCard') {
    await validateAadhaarPdfPageConstraints({
      file: req.file,
      customLabel: normalizedCustomLabel,
    })
  }

  const storedFileName = buildStoredFileName({
    customerCode: req.user.customerCode,
    documentType,
    originalFileName: req.file.originalname,
    subjectName: normalizedSubjectName,
    subjectGroup: normalizedSubjectGroup,
  })

  const existingDocument = await Document.findOne({
    userId: req.user._id,
    scope,
    documentType,
    applicationId: applicationId || null,
    customLabel: normalizedCustomLabel,
    isActive: true,
  })

  const driveUpload = await uploadFileToDrive({
    customerCode: req.user.customerCode,
    fullName: req.user.fullName,
    phone: req.user.phone,
    storedFileName,
    mimeType: req.file.mimetype,
    buffer: req.file.buffer,
    subjectName: normalizedSubjectName,
    subjectGroup: normalizedSubjectGroup,
  })

  const document = await Document.create({
    userId: req.user._id,
    scope,
    documentType,
    applicationId: applicationId || null,
    customLabel: normalizedCustomLabel,
    originalFileName: req.file.originalname,
    storedFileName,
    mimeType: req.file.mimetype,
    fileSize: req.file.size,
    googleDriveFileId: driveUpload.fileId,
    googleDriveFolderId: driveUpload.folderId,
    googleDriveViewUrl: driveUpload.viewUrl,
    googleDriveDownloadUrl: driveUpload.downloadUrl,
    replacedDocumentId: existingDocument?._id || null,
  })

  if (existingDocument) {
    existingDocument.isActive = false
    await existingDocument.save()
    try {
      await trashDriveFile(existingDocument.googleDriveFileId)
    } catch (error) {
      console.error('Failed to trash replaced Google Drive file:', error)
    }
  }

  res.status(existingDocument ? 200 : 201).json({
    success: true,
    message: existingDocument ? 'Document replaced successfully' : 'Document uploaded successfully',
    data: {
      document: mapDocument(document),
      replacedExisting: Boolean(existingDocument),
    },
  })
})

export const streamDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.documentId)
  if (!document || !document.isActive) {
    throw new ApiError(404, 'Document not found')
  }

  ensureDocumentAccess(document, req.user)

  const metadata = await getDriveFileMetadata(document.googleDriveFileId)
  const stream = await getDriveFileStream(document.googleDriveFileId)

  res.setHeader('Content-Type', document.mimeType || metadata.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `inline; filename="${document.originalFileName}"`)
  stream.pipe(res)
})

export const downloadDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.documentId)
  if (!document || !document.isActive) {
    throw new ApiError(404, 'Document not found')
  }

  ensureDocumentAccess(document, req.user)

  const metadata = await getDriveFileMetadata(document.googleDriveFileId)
  const stream = await getDriveFileStream(document.googleDriveFileId)

  res.setHeader('Content-Type', document.mimeType || metadata.mimeType || 'application/octet-stream')
  res.setHeader('Content-Disposition', `attachment; filename="${document.originalFileName}"`)
  stream.pipe(res)
})
