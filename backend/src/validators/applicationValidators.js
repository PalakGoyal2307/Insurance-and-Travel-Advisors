import mongoose from 'mongoose'
import { body, param } from 'express-validator'

const phoneRegex = /^\+?\d{10,15}$/
const statuses = ['pending', 'approved', 'rejected', 'completed']
const allowedRelations = ['Father', 'Mother', 'Children', 'Spouse', 'Mother-in-law', 'Father-in-law']

const validateObjectIdLike = (value) => mongoose.Types.ObjectId.isValid(value)

const calculateAgeFromDob = (dobValue) => {
  const dob = new Date(dobValue)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

const validateAadhaar = (aadhaar) => {
  if (!aadhaar || typeof aadhaar !== 'object') return 'Aadhaar details are required'

  if (!['single', 'frontBack'].includes(aadhaar.mode)) {
    return 'Aadhaar mode must be single or frontBack'
  }

  if (aadhaar.mode === 'single') {
    if (!validateObjectIdLike(aadhaar.singleDocumentId)) {
      return 'Aadhaar single document is required for single mode'
    }
    if (aadhaar.frontDocumentId || aadhaar.backDocumentId) {
      return 'Aadhaar front/back documents are not allowed for single mode'
    }
    return null
  }

  if (!validateObjectIdLike(aadhaar.frontDocumentId) || !validateObjectIdLike(aadhaar.backDocumentId)) {
    return 'Aadhaar front and back documents are required for frontBack mode'
  }

  if (aadhaar.singleDocumentId) {
    return 'Aadhaar single document is not allowed for frontBack mode'
  }

  return null
}

const validateDiseases = (diseases) => {
  if (!diseases || typeof diseases !== 'object') return 'Disease details are required'

  if (!['notApplicable', 'listed', 'other'].includes(diseases.mode)) {
    return 'Disease mode must be notApplicable, listed, or other'
  }

  if (diseases.mode === 'listed') {
    const hasListedNames = Array.isArray(diseases.names) && diseases.names.length > 0
    const hasOtherText = Boolean(String(diseases.otherText || '').trim())
    if (!hasListedNames && !hasOtherText) {
      return 'At least one disease name or other disease text is required when mode is listed'
    }
  }

  if ((diseases.mode === 'other' || diseases.mode === 'listed') && diseases.otherText && String(diseases.otherText).trim().length < 2) {
    return 'Other disease text must be at least 2 characters long'
  }

  if (diseases.mode === 'other' && (!diseases.otherText || String(diseases.otherText).trim().length < 2)) {
    return 'Other disease text is required when mode is other'
  }

  return null
}

const validateMember = (member, { isPrimary, moduleName }) => {
  if (!member || typeof member !== 'object') return 'Member data is required'

  if (!member.fullName || String(member.fullName).trim().length < 2) {
    return 'Member full name is required'
  }

  if (!isPrimary && (!member.relation || String(member.relation).trim().length < 2)) {
    return 'Member relation is required'
  }

  if (!isPrimary && !allowedRelations.includes(String(member.relation).trim())) {
    return `Member relation must be one of: ${allowedRelations.join(', ')}`
  }

  const numberChecks = [
    ['heightFeet', 1, 8],
    ['heightInch', 0, 11],
    ['weightKg', 1, 400],
    ['age', 0, 120],
  ]

  for (const [field, min, max] of numberChecks) {
    const value = Number(member[field])
    if (!Number.isFinite(value) || value < min || value > max) {
      return `${field} must be between ${min} and ${max}`
    }
  }

  if (!member.dob || Number.isNaN(new Date(member.dob).getTime())) {
    return 'Member date of birth is required'
  }

  const parsedDob = new Date(member.dob)
  if (parsedDob > new Date()) {
    return 'Member date of birth cannot be in the future'
  }

  const enteredAge = Number(member.age)
  const calculatedAge = calculateAgeFromDob(member.dob)
  if (enteredAge !== calculatedAge) {
    return `Member age must match date of birth. Expected age: ${calculatedAge}`
  }

  const aadhaarError = validateAadhaar(member.aadhaar)
  if (aadhaarError) return aadhaarError

  const diseaseError = validateDiseases(member.diseases)
  if (diseaseError) return diseaseError

  if (!isPrimary) {
    return null
  }

  if (!member.address || String(member.address).trim().length < 5) {
    return 'Primary member address is required'
  }

  if (!/^\d{6}$/.test(String(member.pincode || '').trim())) {
    return 'Primary member pincode must be exactly 6 digits'
  }

  if (!validateObjectIdLike(member.panCardDocumentId)) {
    return 'Primary member PAN card document is required'
  }

  if (!validateObjectIdLike(member.bankProofDocumentId)) {
    return 'Primary member cancelled cheque/passbook document is required'
  }

  if (moduleName === 'life') {
    if (!Array.isArray(member.itrDocumentIds) || member.itrDocumentIds.length !== 3 || member.itrDocumentIds.some((id) => !validateObjectIdLike(id))) {
      return 'Primary member must include 3 ITR documents'
    }

    if (!Array.isArray(member.computationDocumentIds) || member.computationDocumentIds.length !== 3 || member.computationDocumentIds.some((id) => !validateObjectIdLike(id))) {
      return 'Primary member must include 3 computation documents'
    }

    if (!validateObjectIdLike(member.nomineeAadhaarDocumentId)) {
      return 'Nominee Aadhaar document is required'
    }

    if (!validateObjectIdLike(member.nomineePanDocumentId)) {
      return 'Nominee PAN document is required'
    }

    if (!validateObjectIdLike(member.nomineeBankProofDocumentId)) {
      return 'Nominee cancelled cheque/passbook document is required'
    }
  }

  return null
}

const createMemberPayloadValidator = (moduleName) => [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone').trim().matches(phoneRegex).withMessage('Phone must be a valid number with 10 to 15 digits'),
  body('planName').optional().trim().isLength({ max: 120 }).withMessage('Plan name must be at most 120 characters'),
  body('sourceContext').optional().trim().isLength({ max: 150 }).withMessage('Source context must be at most 150 characters'),
  body('primaryMember').custom((primaryMember) => {
    const error = validateMember(primaryMember, { isPrimary: true, moduleName })
    if (error) throw new Error(error)
    return true
  }),
  body('additionalMembers').optional().custom((members) => {
    if (!Array.isArray(members)) {
      throw new Error('Additional members must be an array')
    }

    if (members.length > 3) {
      throw new Error('Only up to 3 additional members are allowed')
    }

    for (const member of members) {
      const error = validateMember(member, { isPrimary: false, moduleName })
      if (error) throw new Error(error)
    }

    return true
  }),
]

export const createHealthApplicationValidator = createMemberPayloadValidator('health')

export const createLifeApplicationValidator = createMemberPayloadValidator('life')

export const createGeneralApplicationValidator = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('phone').trim().matches(phoneRegex).withMessage('Phone must be a valid number with 10 to 15 digits'),
  body('primaryAddress').trim().isLength({ min: 5, max: 250 }).withMessage('Primary member address must be between 5 and 250 characters'),
  body('primaryPincode').trim().matches(/^\d{6}$/).withMessage('Primary member pincode must be exactly 6 digits'),
  body('planName').optional().trim().isLength({ max: 120 }).withMessage('Plan name must be at most 120 characters'),
  body('requirements').optional().trim().isLength({ max: 2000 }).withMessage('Requirements must be at most 2000 characters'),
  body('sourceContext').optional().trim().isLength({ max: 150 }).withMessage('Source context must be at most 150 characters'),
  body('city').optional().trim().isLength({ max: 120 }).withMessage('City must be at most 120 characters'),
  body('businessType').optional().trim().isLength({ max: 120 }).withMessage('Business type must be at most 120 characters'),
  body('coverageType').optional().trim().isLength({ max: 120 }).withMessage('Coverage type must be at most 120 characters'),
]

export const updateApplicationStatusValidator = [
  param('applicationId').isMongoId().withMessage('Application ID must be a valid identifier'),
  body('status').isIn(statuses).withMessage('Invalid application status'),
]
