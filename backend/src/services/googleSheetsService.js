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

const flattenPayload = (source, prefix = '') => {
  if (Array.isArray(source)) {
    return source.flatMap((item, index) => flattenPayload(item, `${prefix}[${index}]`))
  }

  if (!source || typeof source !== 'object') {
    return []
  }

  return Object.entries(source).flatMap(([fieldName, value]) => {
    const nextPrefix = prefix ? `${prefix}_${fieldName}` : fieldName

    if (shouldSkipField(nextPrefix)) {
      return []
    }

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      return flattenPayload(value, nextPrefix)
    }

    return [{ header: nextPrefix, value }]
  })
}

const collectStructuredValues = (payload) => {
  const values = {}

  flattenPayload(payload).forEach(({ header, value }) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    values[header] = normalizeValue(value)
  })

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

    const existingHeaders = existingValues.data.values?.[0] || []
    const mergedHeaders = Array.from(new Set([...existingHeaders, ...normalizedHeaders]))

    if (existingHeaders.length !== mergedHeaders.length || existingHeaders.some((header, index) => header !== mergedHeaders[index])) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!1:${columnLetter(mergedHeaders.length)}1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [mergedHeaders],
        },
      })
    }

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

  const headers = await ensureSheetHeaders(sheets, spreadsheetId, sheetName, Object.keys(values))
  const row = headers.map((header) => values[header] ?? '')

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A1`,
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
