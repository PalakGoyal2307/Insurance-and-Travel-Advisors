import { API_BASE_URL, ApiRequestError, apiRequest } from './api'

export interface ProfileDocumentItem {
  id: string
  scope: 'profile' | 'health' | 'life' | 'general'
  documentType: string
  applicationId?: string | null
  label: string
  customLabel?: string
  originalFileName: string
  mimeType: string
  fileSize: number
  googleDriveFileId: string
  googleDriveViewUrl: string
  googleDriveDownloadUrl: string
  uploadedAt: string
  updatedAt: string
}

interface DocumentListResponse {
  success: boolean
  data: {
    items: ProfileDocumentItem[]
  }
}

interface UploadDocumentResponse {
  success: boolean
  message: string
  data: {
    document: ProfileDocumentItem
    replacedExisting: boolean
  }
}

export interface UploadDocumentPayload {
  file: File
  scope: 'profile' | 'health' | 'life' | 'general'
  documentType: string
  customLabel?: string
  applicationId?: string
  subjectName?: string
  subjectGroup?: string
}

export const listMyDocuments = async () => {
  const response = await apiRequest<DocumentListResponse>('/documents', {
    method: 'GET',
  })

  return response.data.items
}

export const uploadDocument = async (payload: UploadDocumentPayload) => {
  const formData = new FormData()
  formData.append('file', payload.file)
  formData.append('scope', payload.scope)
  formData.append('documentType', payload.documentType)
  if (payload.customLabel) formData.append('customLabel', payload.customLabel)
  if (payload.applicationId) formData.append('applicationId', payload.applicationId)
  if (payload.subjectName) formData.append('subjectName', payload.subjectName)
  if (payload.subjectGroup) formData.append('subjectGroup', payload.subjectGroup)

  const response = await fetch(`${API_BASE_URL}/documents`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })

  const data = await response.json()
  if (!response.ok || !data.success) {
    throw new ApiRequestError(data.message || 'Document upload failed', response.status, data.details)
  }

  return data as UploadDocumentResponse
}

export const getDocumentViewUrl = (documentId: string) => `${API_BASE_URL}/documents/${documentId}/view`
export const getDocumentDownloadUrl = (documentId: string) => `${API_BASE_URL}/documents/${documentId}/download`
