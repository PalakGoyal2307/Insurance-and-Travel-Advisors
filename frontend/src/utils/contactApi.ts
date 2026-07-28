import { apiRequest } from './api'

interface ContactPayload {
  name: string
  email: string
  phone: string
  message: string
  context?: string
  source?: 'website' | 'google-form'
}

interface ContactResponse {
  success: boolean
  message: string
  data: {
    inquiryId: string
  }
}

export const createContactInquiry = async (payload: ContactPayload) => {
  return apiRequest<ContactResponse>('/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
