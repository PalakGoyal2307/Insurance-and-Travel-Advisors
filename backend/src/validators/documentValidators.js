import { body, param } from 'express-validator'
import { DOCUMENT_TYPES } from '../constants/documentConstants.js'

const scopeValues = ['profile', 'health', 'life', 'general']
const documentTypeValues = Object.keys(DOCUMENT_TYPES)

const isValidLifeYearLabel = (value, type) => {
  if (!value) return false
  const regex = type === 'itrDocument'
    ? /^member[1-4]-itr-year-[1-3]$/i
    : /^member[1-4]-computation-year-[1-3]$/i
  return regex.test(value)
}

const isValidAadhaarLabel = (value) => {
  if (!value) return true
  return /^member[1-4]-aadhaar-(single|front|back)$/i.test(value) || /^member[1-4]-nominee-aadhaar$/i.test(value)
}

const isValidPanLabel = (value) => {
  if (!value) return true
  return /^member[1-4]-pan$/i.test(value) || /^member[1-4]-nominee-pan$/i.test(value)
}

const isValidBankProofLabel = (value) => {
  if (!value) return true
  return /^member[1-4]-bank-proof$/i.test(value) || /^member[1-4]-nominee-bank-proof$/i.test(value)
}

export const uploadDocumentValidator = [
  body('scope').isIn(scopeValues).withMessage('Invalid document scope'),
  body('documentType').isIn(documentTypeValues).withMessage('Invalid document type'),
  body('customLabel').optional().trim().isLength({ max: 120 }).withMessage('Custom label must be at most 120 characters'),
  body('subjectName').optional().trim().isLength({ max: 120 }).withMessage('Subject name must be at most 120 characters'),
  body('subjectGroup').optional().trim().isLength({ max: 80 }).withMessage('Subject group must be at most 80 characters'),
  body().custom((payload) => {
    const scope = String(payload.scope || '')
    const documentType = String(payload.documentType || '')
    const customLabel = String(payload.customLabel || '').trim()

    if (documentType === 'medicalReport' && scope !== 'health') {
      throw new Error('Medical report can only be uploaded under health scope')
    }

    if (documentType === 'policyDocument' && scope !== 'general') {
      throw new Error('Policy document can only be uploaded under general scope')
    }

    if (documentType === 'itrDocument' || documentType === 'computationDocument') {
      if (scope !== 'life') {
        throw new Error('ITR and computation documents can only be uploaded under life scope')
      }
      if (!isValidLifeYearLabel(customLabel, documentType)) {
        throw new Error('Life year-wise document label must match memberN-year-1/2/3 format')
      }
    }

    if (documentType === 'aadhaarCard' && !isValidAadhaarLabel(customLabel)) {
      throw new Error('Aadhaar label must match memberN-aadhaar-single/front/back or memberN-nominee-aadhaar format')
    }

    if (documentType === 'panCard' && !isValidPanLabel(customLabel)) {
      throw new Error('PAN label must match memberN-pan or memberN-nominee-pan format')
    }

    if (documentType === 'cancelledChequePassbook' && !isValidBankProofLabel(customLabel)) {
      throw new Error('Cancelled cheque/passbook label must match memberN-bank-proof or memberN-nominee-bank-proof format')
    }

    if (/nominee-/i.test(customLabel) && scope !== 'life') {
      throw new Error('Nominee documents can only be uploaded under life scope')
    }

    return true
  }),
  body('applicationId').optional().isMongoId().withMessage('Application ID must be a valid identifier'),
]

export const documentIdValidator = [
  param('documentId').isMongoId().withMessage('Document ID must be a valid identifier'),
]
