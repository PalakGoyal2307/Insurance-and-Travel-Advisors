import { apiRequest } from './api'

export interface InsuranceApplicationItem {
  id: string
  module: 'health' | 'life' | 'general'
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  planName?: string
  proposerType?: 'self' | 'others'
  proposerSequence?: number | null
  proposerName?: string
  createdAt: string
  updatedAt: string
  fullName: string
  email: string
  phone: string
}

interface CreateApplicationResponse<T> {
  success: boolean
  message: string
  data: {
    application: T
  }
}

interface MyApplicationsResponse<T> {
  success: boolean
  data: {
    items: T[]
  }
}

export interface MemberAadhaarPayload {
  mode: 'single' | 'frontBack'
  singleDocumentId?: string
  frontDocumentId?: string
  backDocumentId?: string
}

export interface MemberDiseasesPayload {
  mode: 'notApplicable' | 'listed' | 'other'
  names: string[]
  otherText?: string
}

export interface InsuranceMemberPayload {
  fullName: string
  address?: string
  pincode?: string
  relation?: string
  heightFeet: number
  heightInch: number
  weightKg: number
  dob: string
  age: number
  aadhaar: MemberAadhaarPayload
  diseases: MemberDiseasesPayload
  panCardDocumentId?: string
  bankProofDocumentId?: string
  itrDocumentIds?: string[]
  computationDocumentIds?: string[]
  nomineeAadhaarDocumentId?: string
  nomineePanDocumentId?: string
  nomineeBankProofDocumentId?: string
}

export interface CreateHealthApplicationPayload {
  fullName: string
  email: string
  phone: string
  proposerType?: 'self' | 'others'
  proposerSequence?: number
  primaryMember: InsuranceMemberPayload
  additionalMembers?: InsuranceMemberPayload[]
  planName?: string
  sourceContext?: string
}

export interface CreateLifeApplicationPayload {
  fullName: string
  email: string
  phone: string
  proposerType?: 'self' | 'others'
  proposerSequence?: number
  primaryMember: InsuranceMemberPayload
  additionalMembers?: InsuranceMemberPayload[]
  planName?: string
  sourceContext?: string
}

export interface CreateGeneralApplicationPayload {
  fullName: string
  email: string
  phone: string
  primaryAddress: string
  primaryPincode: string
  city?: string
  businessType?: string
  coverageType?: string
  planName?: string
  requirements?: string
  sourceContext?: string
}

export const createHealthApplication = async (payload: CreateHealthApplicationPayload) => {
  const response = await apiRequest<CreateApplicationResponse<InsuranceApplicationItem>>('/health/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data.application
}

export const createLifeApplication = async (payload: CreateLifeApplicationPayload) => {
  const response = await apiRequest<CreateApplicationResponse<InsuranceApplicationItem>>('/life/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data.application
}

export const createGeneralApplication = async (payload: CreateGeneralApplicationPayload) => {
  const response = await apiRequest<CreateApplicationResponse<InsuranceApplicationItem>>('/general/applications', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data.application
}

export const listMyHealthApplications = async () => {
  const response = await apiRequest<MyApplicationsResponse<InsuranceApplicationItem>>('/health/applications/my', {
    method: 'GET',
  })

  return response.data.items
}

export const listMyLifeApplications = async () => {
  const response = await apiRequest<MyApplicationsResponse<InsuranceApplicationItem>>('/life/applications/my', {
    method: 'GET',
  })

  return response.data.items
}

export const listMyGeneralApplications = async () => {
  const response = await apiRequest<MyApplicationsResponse<InsuranceApplicationItem>>('/general/applications/my', {
    method: 'GET',
  })

  return response.data.items
}
