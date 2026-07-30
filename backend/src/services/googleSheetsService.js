import { google } from 'googleapis'
import { env } from '../config/env.js'

const DEFAULT_SPREADSHEET_TITLE = env.googleSheetsSheetName || 'Form Submissions'
const SENSITIVE_FIELDS = new Set([
  'password',
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
  'api_key',
])
const DOCUMENT_FIELD_PATTERN = /(document|documents|file|files|attachment|attachments|upload|uploads|proof|proofs)/i
const MAX_ADDITIONAL_MEMBERS = 3
const MEMBER_FIELD_DEFINITIONS = [
  { key: 'fullName', header: 'Name' },
  { key: 'email', header: 'Email' },
  { key: 'phone', header: 'Phone' },
  { key: 'dob', header: 'DOB' },
  { key: 'age', header: 'Age' },
  { key: 'heightFeet', header: 'Height Feet' },
  { key: 'heightInch', header: 'Height Inch' },
  { key: 'weightKg', header: 'Weight' },
  { key: 'address', header: 'Address' },
  { key: 'pincode', header: 'Pincode' },
  { key: 'gender', header: 'Gender' },
  { key: 'relation', header: 'Relation' },
  { key: 'occupation', header: 'Occupation' },
  { key: 'annualIncome', header: 'Annual Income' },
  { key: 'smoking', header: 'Smoking' },
  { key: 'medicalHistory', header: 'Medical History' },
  { key: 'aadhaar.mode', header: 'Aadhaar Mode' },
  { key: 'aadhaar.singleDocumentId', header: 'Aadhaar Single Document ID' },
  { key: 'aadhaar.frontDocumentId', header: 'Aadhaar Front Document ID' },
  { key: 'aadhaar.backDocumentId', header: 'Aadhaar Back Document ID' },
  { key: 'diseases.mode', header: 'Disease Mode' },
  { key: 'diseases.names', header: 'Diseases' },
  { key: 'diseases.otherText', header: 'Other Disease' },
  { key: 'panCardDocumentId', header: 'PAN Card Document ID' },
  { key: 'bankProofDocumentId', header: 'Bank Proof Document ID' },
  { key: 'itrDocumentIds', header: 'ITR Document IDs' },
  { key: 'computationDocumentIds', header: 'Computation Document IDs' },
  { key: 'nomineeAadhaarDocumentId', header: 'Nominee Aadhaar Document ID' },
  { key: 'nomineePanDocumentId', header: 'Nominee PAN Document ID' },
  { key: 'nomineeBankProofDocumentId', header: 'Nominee Bank Proof Document ID' },
]
const FIXED_INSURANCE_TOP_LEVEL_HEADERS = ['Name', 'Email', 'Phone', 'Plan Name', 'Source Context']
const FIELD_LABELS = {
  fullName: 'Name',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  mobile: 'Phone',
  dob: 'DOB',
  dateOfBirth: 'DOB',
  heightFeet: 'Height Feet',
  heightInch: 'Height Inch',
  weightKg: 'Weight',
  weight: 'Weight',
  address: 'Address',
  pincode: 'Pincode',
  gender: 'Gender',
  relation: 'Relation',
  pan: 'PAN',
  panNumber: 'PAN',
  aadhaar: 'Aadhaar',
  aadhaarNumber: 'Aadhaar',
  occupation: 'Occupation',
  annualIncome: 'Annual Income',
  smoking: 'Smoking',
  medicalHistory: 'Medical History',
  planName: 'Plan Name',
  sourceContext: 'Source Context',
  message: 'Message',
  subject: 'Subject',
  context: 'Context',
  source: 'Source',
  company: 'Company',
}

let cachedSheetsClient = null
let cachedSpreadsheetId = null

const getSheetsClient = () => {
  if (cachedSheetsClient) {
    return cachedSheetsClient
  }

  if (!env.googleDriveClientEmail || !env.googleDrivePrivateKey) {
    throw new Error('Google Sheets is not configured because Google Drive credentials are missing')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.googleDriveClientEmail,
      private_key: env.googleDrivePrivateKey,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  cachedSheetsClient = google.sheets({ version: 'v4', auth })
  return cachedSheetsClient
}

const getSpreadsheetId = async () => {
  if (cachedSpreadsheetId) {
    return cachedSpreadsheetId
  }

  if (env.googleSheetsSpreadsheetId) {
    cachedSpreadsheetId = env.googleSheetsSpreadsheetId
    return cachedSpreadsheetId
  }

  const sheets = getSheetsClient()
  const createResponse = await sheets.spreadsheets.create({
    requestBody: {
      properties: {
        title: DEFAULT_SPREADSHEET_TITLE,
      },
      sheets: [{ properties: { title: 'Registration' } }],
    },
  })

  cachedSpreadsheetId = createResponse.data.spreadsheetId
  return cachedSpreadsheetId
}

const sanitizeSheetName = (value) => {
  const cleaned = String(value || 'Other Forms')
    .replace(/[\\/*\[\]:?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned.slice(0, 100) || 'Other Forms'
}

const getSheetName = (formType) => {
  const normalized = String(formType || '').toLowerCase()

  if (normalized.includes('life')) return 'Life Insurance'
  if (normalized.includes('health')) return 'Health Insurance'
  if (normalized.includes('general')) return 'General Insurance'
  if (normalized.includes('register')) return 'Registration'
  if (normalized.includes('contact')) return 'Contact Form'
  if (normalized.includes('profile')) return 'Profile'
  if (normalized.includes('login')) return 'Login'

  return 'Other Forms'
}

const ensureSheetExists = async (sheets, spreadsheetId, sheetName) => {
  const metadataResponse = await sheets.spreadsheets.get({ spreadsheetId })
  const existingSheet = metadataResponse.data.sheets?.find((sheet) => sheet.properties?.title === sheetName)

  if (existingSheet) {
    return sheetName
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: {
              title: sheetName,
            },
          },
        },
      ],
    },
  })

  return sheetName
}

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }

  if (typeof value === 'string') {
    return value.trim()
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  return JSON.stringify(value)
}

const shouldSkipField = (fieldName) => {
  const normalized = String(fieldName || '').toLowerCase()
  return SENSITIVE_FIELDS.has(normalized) || DOCUMENT_FIELD_PATTERN.test(normalized)
}

const findValue = (source, aliases) => {
  if (!source || typeof source !== 'object') {
    return ''
  }

  for (const alias of aliases) {
    const value = source[alias]
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        continue
      }

      if (typeof value === 'object' && !(value instanceof Date)) {
        continue
      }

      return normalizeValue(value)
    }
  }

  return ''
}

const makeHeader = (label, fieldName) => {
  const friendlyFieldName = FIELD_LABELS[fieldName] || fieldName.replace(/([a-z])([A-Z])/g, '$1 $2')
  return `${label} ${friendlyFieldName}`.trim()
}

const addEntry = (values, header, value) => {
  if (value === undefined || value === null || value === '') {
    return
  }

  values[header] = normalizeValue(value)
}

const getNestedValue = (source, path) => {
  const segments = path.split('.')
  let current = source

  for (const segment of segments) {
    if (!current || typeof current !== 'object') {
      return ''
    }
    current = current[segment]
  }

  if (current === undefined || current === null) {
    return ''
  }

  if (Array.isArray(current)) {
    return current.map((item) => normalizeValue(item)).filter(Boolean).join(', ')
  }

  if (typeof current === 'object' && !(current instanceof Date)) {
    return ''
  }

  return normalizeValue(current)
}

const getMemberHeadersForLabel = (memberLabel) => MEMBER_FIELD_DEFINITIONS.map((field) => `${memberLabel} ${field.header}`)

const addMemberEntries = (values, memberLabel, member) => {
  if (!member || typeof member !== 'object') {
    return
  }

  MEMBER_FIELD_DEFINITIONS.forEach((field) => {
    addEntry(values, `${memberLabel} ${field.header}`, getNestedValue(member, field.key))
  })
}

const isHealthOrLifeForm = (formType) => {
  const normalizedFormType = String(formType || '').toLowerCase()
  return normalizedFormType.includes('health') || normalizedFormType.includes('life')
}

const shouldIncludeFixedMemberHeaders = (formType, payload) => {
  if (isHealthOrLifeForm(formType)) {
    return true
  }

  return Boolean(payload?.primaryMember) || Array.isArray(payload?.additionalMembers)
}

const getFixedMemberHeaders = () => {
  const headers = [...getMemberHeadersForLabel('Primary Member')]

  for (let memberIndex = 1; memberIndex <= MAX_ADDITIONAL_MEMBERS; memberIndex += 1) {
    headers.push(...getMemberHeadersForLabel(`Member ${memberIndex}`))
  }

  return headers
}

const collectStructuredValues = (payload) => {
  const values = {}

  Object.keys(FIELD_LABELS).forEach((fieldName) => {
    if (shouldSkipField(fieldName)) {
      return
    }

    const value = payload[fieldName]
    if (value !== undefined && value !== null && value !== '') {
      addEntry(values, FIELD_LABELS[fieldName], value)
    }
  })

  if (payload.primaryMember && typeof payload.primaryMember === 'object') {
    addMemberEntries(values, 'Primary Member', payload.primaryMember)
  }

  if (Array.isArray(payload.additionalMembers)) {
    payload.additionalMembers.forEach((member, index) => {
      if (!member || typeof member !== 'object') {
        return
      }

      const memberLabel = `Member ${index + 1}`
      addMemberEntries(values, memberLabel, member)
    })
  }

  return values
}

const columnLetter = (index) => {
  let remaining = index
  let letters = ''

  while (remaining > 0) {
    remaining -= 1
    letters = String.fromCharCode(65 + (remaining % 26)) + letters
    remaining = Math.floor(remaining / 26)
  }

  return letters || 'A'
}

const ensureSheetHeaders = async (sheets, spreadsheetId, sheetName, headers) => {
  const normalizedHeaders = Array.from(new Set(headers.filter(Boolean)))
  if (normalizedHeaders.length === 0) {
    return []
  }

  try {
    const existingValues = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    })

    const existingHeadersRaw = existingValues.data.values?.[0] || []
    const existingHeaders = Array.from(new Set(existingHeadersRaw.filter(Boolean).map((header) => String(header).trim()).filter(Boolean)))
    const mergedHeaders = Array.from(new Set([...existingHeaders, ...normalizedHeaders]))

    // Always rewrite headers from A1 so shifted/blank leading columns are corrected.
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!1:1`,
    })

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1:${columnLetter(mergedHeaders.length)}1`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [mergedHeaders],
      },
    })

    return mergedHeaders
  } catch (error) {
    console.error('Failed to initialize Google Sheets headers:', error)
    return normalizedHeaders
  }
}

export const appendFormSubmission = async ({ formType, payload }) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const values = collectStructuredValues(payload)
  if (Object.keys(values).length === 0) {
    return null
  }

  const sheets = getSheetsClient()
  const spreadsheetId = await getSpreadsheetId()
  const sheetName = sanitizeSheetName(getSheetName(formType))
  await ensureSheetExists(sheets, spreadsheetId, sheetName)

  const fixedTopLevelHeaders = isHealthOrLifeForm(formType) ? FIXED_INSURANCE_TOP_LEVEL_HEADERS : []
  const fixedMemberHeaders = shouldIncludeFixedMemberHeaders(formType, payload) ? getFixedMemberHeaders() : []
  const headers = await ensureSheetHeaders(sheets, spreadsheetId, sheetName, [...Object.keys(values), ...fixedTopLevelHeaders, ...fixedMemberHeaders])
  const row = headers.map((header) => values[header] ?? '')

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A2`,
    valueInputOption: 'RAW',
    requestBody: {
      values: [row],
    },
  })

  return {
    spreadsheetId,
    sheetName,
  }
}
