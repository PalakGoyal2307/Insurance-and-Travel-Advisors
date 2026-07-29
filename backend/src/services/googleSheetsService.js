import { google } from 'googleapis'
import { env } from '../config/env.js'

const DEFAULT_SHEET_NAME = env.googleSheetsSheetName || 'Form Submissions'
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

const CORE_FIELDS = [
  'fullName',
  'name',
  'email',
  'phone',
  'mobile',
  'dob',
  'dateOfBirth',
  'heightFeet',
  'heightInch',
  'weightKg',
  'weight',
  'address',
  'pincode',
  'gender',
  'relation',
  'pan',
  'panNumber',
  'aadhaar',
  'aadhaarNumber',
  'occupation',
  'annualIncome',
  'smoking',
  'medicalHistory',
]

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
        title: DEFAULT_SHEET_NAME,
      },
      sheets: [{ properties: { title: env.googleSheetsSheetName || 'Form Submissions' } }],
    },
  })

  cachedSpreadsheetId = createResponse.data.spreadsheetId
  return cachedSpreadsheetId
}

const ensureSheetExists = async (sheets, spreadsheetId) => {
  const sheetName = env.googleSheetsSheetName || 'Form Submissions'
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

const findValue = (source, aliases) => {
  if (!source || typeof source !== 'object') {
    return ''
  }

  for (const alias of aliases) {
    const value = source[alias]
    if (value !== undefined && value !== null && value !== '') {
      return normalizeValue(value)
    }
  }

  return ''
}

const collectStructuredValues = (payload) => {
  const values = {}
  const addField = (fieldName, value) => {
    if (value === undefined || value === null || value === '') {
      return
    }

    values[fieldName] = normalizeValue(value)
  }

  for (const fieldName of CORE_FIELDS) {
    const directValue = findValue(payload, [fieldName])
    if (directValue) {
      addField(fieldName, directValue)
    }
  }

  for (const fieldName of ['fullName', 'name', 'email', 'phone', 'mobile', 'dob', 'dateOfBirth', 'heightFeet', 'heightInch', 'weightKg', 'weight', 'address', 'pincode', 'gender', 'relation', 'pan', 'panNumber', 'aadhaar', 'aadhaarNumber', 'occupation', 'annualIncome', 'smoking', 'medicalHistory']) {
    if (payload[fieldName] !== undefined && payload[fieldName] !== null && payload[fieldName] !== '') {
      addField(fieldName, payload[fieldName])
    }
  }

  if (payload.primaryMember && typeof payload.primaryMember === 'object') {
    const primaryMember = payload.primaryMember
    addField('primaryMember_fullName', findValue(primaryMember, ['fullName', 'name']))
    addField('primaryMember_email', findValue(primaryMember, ['email']))
    addField('primaryMember_phone', findValue(primaryMember, ['phone', 'mobile']))
    addField('primaryMember_dob', findValue(primaryMember, ['dob', 'dateOfBirth']))
    addField('primaryMember_heightFeet', findValue(primaryMember, ['heightFeet']))
    addField('primaryMember_heightInch', findValue(primaryMember, ['heightInch']))
    addField('primaryMember_weightKg', findValue(primaryMember, ['weightKg', 'weight']))
    addField('primaryMember_address', findValue(primaryMember, ['address']))
    addField('primaryMember_pincode', findValue(primaryMember, ['pincode']))
    addField('primaryMember_gender', findValue(primaryMember, ['gender']))
    addField('primaryMember_relation', findValue(primaryMember, ['relation']))
    addField('primaryMember_pan', findValue(primaryMember, ['pan', 'panNumber']))
    addField('primaryMember_aadhaar', findValue(primaryMember, ['aadhaar', 'aadhaarNumber']))
    addField('primaryMember_occupation', findValue(primaryMember, ['occupation']))
    addField('primaryMember_annualIncome', findValue(primaryMember, ['annualIncome']))
    addField('primaryMember_smoking', findValue(primaryMember, ['smoking']))
    addField('primaryMember_medicalHistory', findValue(primaryMember, ['medicalHistory']))
  }

  if (Array.isArray(payload.additionalMembers)) {
    payload.additionalMembers.forEach((member, index) => {
      if (!member || typeof member !== 'object') {
        return
      }

      const prefix = `additionalMember_${index + 1}`
      addField(`${prefix}_fullName`, findValue(member, ['fullName', 'name']))
      addField(`${prefix}_email`, findValue(member, ['email']))
      addField(`${prefix}_phone`, findValue(member, ['phone', 'mobile']))
      addField(`${prefix}_dob`, findValue(member, ['dob', 'dateOfBirth']))
      addField(`${prefix}_heightFeet`, findValue(member, ['heightFeet']))
      addField(`${prefix}_heightInch`, findValue(member, ['heightInch']))
      addField(`${prefix}_weightKg`, findValue(member, ['weightKg', 'weight']))
      addField(`${prefix}_address`, findValue(member, ['address']))
      addField(`${prefix}_pincode`, findValue(member, ['pincode']))
      addField(`${prefix}_gender`, findValue(member, ['gender']))
      addField(`${prefix}_relation`, findValue(member, ['relation']))
      addField(`${prefix}_pan`, findValue(member, ['pan', 'panNumber']))
      addField(`${prefix}_aadhaar`, findValue(member, ['aadhaar', 'aadhaarNumber']))
      addField(`${prefix}_occupation`, findValue(member, ['occupation']))
      addField(`${prefix}_annualIncome`, findValue(member, ['annualIncome']))
      addField(`${prefix}_smoking`, findValue(member, ['smoking']))
      addField(`${prefix}_medicalHistory`, findValue(member, ['medicalHistory']))
    })
  }

  return values
}

const ensureSheetHeaders = async (sheets, spreadsheetId, sheetName, headers) => {
  try {
    const existingValues = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    })

    if (!existingValues.data.values || existingValues.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:${String.fromCharCode(64 + Math.min(headers.length, 26))}1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      })
    }
  } catch (error) {
    console.error('Failed to initialize Google Sheets headers:', error)
  }
}

export const appendFormSubmission = async ({ route, method, formType, payload }) => {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const values = collectStructuredValues(payload)
  if (Object.keys(values).length === 0) {
    return null
  }

  const headers = Object.keys(values)
  const row = headers.map((header) => values[header])

  const sheets = getSheetsClient()
  const spreadsheetId = await getSpreadsheetId()
  const sheetName = await ensureSheetExists(sheets, spreadsheetId)
  await ensureSheetHeaders(sheets, spreadsheetId, sheetName, headers)

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
