import { google } from 'googleapis'
import { Readable } from 'stream'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive']
const FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder'

let cachedDrive = null

const escapeQueryValue = (value) => String(value).replace(/'/g, "\\'")

const getDriveClient = () => {
  if (cachedDrive) return cachedDrive

  if (!env.googleDriveClientEmail || !env.googleDrivePrivateKey) {
    throw new ApiError(500, 'Google Drive is not configured on the server')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: env.googleDriveClientEmail,
      private_key: env.googleDrivePrivateKey,
    },
    scopes: DRIVE_SCOPES,
  })

  cachedDrive = google.drive({ version: 'v3', auth })
  return cachedDrive
}

const findFolder = async (name, parentId = null) => {
  const drive = getDriveClient()
  const parentQuery = parentId ? `'${parentId}' in parents and ` : ''
  const response = await drive.files.list({
    q: `${parentQuery}name = '${escapeQueryValue(name)}' and mimeType = '${FOLDER_MIME_TYPE}' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 10,
    supportsAllDrives: true,
    includeItemsFromAllDrives: true,
  })

  return response.data.files?.[0] || null
}

const createFolder = async (name, parentId = null) => {
  const drive = getDriveClient()
  const response = await drive.files.create({
    requestBody: {
      name,
      mimeType: FOLDER_MIME_TYPE,
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id, name',
    supportsAllDrives: true,
  })

  return response.data
}

export const ensureFolder = async (name, parentId = null) => {
  const existing = await findFolder(name, parentId)
  if (existing) return existing
  return createFolder(name, parentId)
}

const sanitizeNamePart = (value) => String(value || '')
  .trim()
  .replace(/\s+/g, '-')
  .replace(/[^a-zA-Z0-9-]/g, '')

const buildDriveUserFolderName = ({ customerCode, fullName, phone }) => {
  const numericCode = Number(String(customerCode || '').replace(/\D/g, ''))
  const serial = Number.isFinite(numericCode) && numericCode > 0 ? String(numericCode).padStart(4, '0') : '0000'
  const safeName = sanitizeNamePart(fullName) || 'Unknown'
  const safePhone = String(phone || '').replace(/\D/g, '') || 'NA'
  return `${serial}-${safeName}-${safePhone}`
}

export const ensureUserDriveFolders = async ({ customerCode, fullName = '', phone = '' }) => {
  const rootFolder = env.googleDriveRootFolderId
    ? { id: env.googleDriveRootFolderId, name: 'PNP Advisors' }
    : await ensureFolder('PNP Advisors')

  const usersFolder = await ensureFolder('Users', rootFolder.id)
  const preferredUserFolderName = buildDriveUserFolderName({ customerCode, fullName, phone })
  const existingPreferredFolder = await findFolder(preferredUserFolderName, usersFolder.id)
  const existingLegacyFolder = await findFolder(customerCode, usersFolder.id)
  const userFolder = existingPreferredFolder || existingLegacyFolder || await ensureFolder(preferredUserFolderName, usersFolder.id)

  return {
    rootFolder,
    usersFolder,
    userFolder,
  }
}

const buildSubjectFolderName = ({ subjectGroup = 'Primary Member', subjectName = '' }) => {
  const safeGroup = sanitizeNamePart(subjectGroup) || 'Primary-Member'
  const safeSubjectName = sanitizeNamePart(subjectName)
  return safeSubjectName ? `${safeGroup}-${safeSubjectName}` : safeGroup
}

export const resolveDocumentFolder = async ({ customerCode, fullName, phone, subjectGroup, subjectName }) => {
  const folders = await ensureUserDriveFolders({ customerCode, fullName, phone })
  const subjectFolderName = buildSubjectFolderName({ subjectGroup, subjectName })
  return ensureFolder(subjectFolderName, folders.userFolder.id)
}

export const uploadFileToDrive = async ({ customerCode, fullName, phone, storedFileName, mimeType, buffer, subjectGroup, subjectName }) => {
  const drive = getDriveClient()
  const folder = await resolveDocumentFolder({ customerCode, fullName, phone, subjectGroup, subjectName })
  const stream = Readable.from(buffer)
  const response = await drive.files.create({
    requestBody: {
      name: storedFileName,
      parents: [folder.id],
    },
    media: {
      mimeType,
      body:stream,
    },
    fields: 'id, name, webViewLink, webContentLink',
    supportsAllDrives: true,
  })

  const file = response.data
  return {
    folderId: folder.id,
    fileId: file.id,
    viewUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`,
    downloadUrl: file.webContentLink || `https://drive.google.com/uc?id=${file.id}&export=download`,
  }
}

export const trashDriveFile = async (fileId) => {
  const drive = getDriveClient()
  await drive.files.update({
    fileId,
    requestBody: {
      trashed: true,
    },
    supportsAllDrives: true,
  })
}

export const getDriveFileMetadata = async (fileId) => {
  const drive = getDriveClient()
  const response = await drive.files.get({
    fileId,
    fields: 'id, name, mimeType, size',
    supportsAllDrives: true,
  })

  return response.data
}

export const getDriveFileStream = async (fileId) => {
  const drive = getDriveClient()
  const response = await drive.files.get(
    {
      fileId,
      alt: 'media',
      supportsAllDrives: true,
    },
    { responseType: 'stream' }
  )

  return response.data
}
