import { apiRequest } from './api'
import type { ProfileDocumentItem } from './documentApi'
import type { InsuranceApplicationItem } from './insuranceApi'

export interface AuthUser {
  id: string
  customerCode: string
  fullName: string
  email: string
  phone: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
  isActive?: boolean
  lastLoginAt?: string
  reusableDocuments?: Array<{
    documentType: string
    label: string
    status: 'already-uploaded' | 'missing'
    document: ProfileDocumentItem | null
  }>
  applications?: {
    health: InsuranceApplicationItem[]
    life: InsuranceApplicationItem[]
    general: InsuranceApplicationItem[]
  }
  applicationRequirements?: Record<string, Array<{
    documentType: string
    label: string
    status: 'already-uploaded' | 'required'
    document: ProfileDocumentItem | null
  }>>
  uploadedDocuments?: ProfileDocumentItem[]
  summary?: {
    totalUploadedDocuments: number
    totalHealthApplications: number
    totalLifeApplications: number
    totalGeneralApplications: number
  }
}

interface AuthResponse {
  success: boolean
  message?: string
  data: {
    user: AuthUser
    token?: string
  }
}

interface ProfileResponse {
  success: boolean
  data: {
    profile: AuthUser
  }
}

interface RegisterPayload {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

interface LoginPayload {
  email: string
  password: string
}

interface ForgotPasswordPayload {
  email: string
}

interface ResetPasswordPayload {
  token: string
  newPassword: string
  confirmNewPassword: string
}

interface UpdateProfilePayload {
  fullName?: string
  email?: string
  phone?: string
}

export const registerUser = async (payload: RegisterPayload) => {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data.user
}

export const loginUser = async (payload: LoginPayload) => {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data.user
}

export const logoutUser = async () => {
  await apiRequest<{ success: boolean; message: string }>('/auth/logout', {
    method: 'POST',
  })
}

export const getCurrentUser = async () => {
  const response = await apiRequest<AuthResponse>('/auth/me', {
    method: 'GET',
  })

  return response.data.user
}

export const forgotPassword = async (payload: ForgotPasswordPayload) => {
  await apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const resetPassword = async (payload: ResetPasswordPayload) => {
  await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export const getMyProfile = async () => {
  const response = await apiRequest<ProfileResponse>('/profile/me', {
    method: 'GET',
  })

  return response.data.profile
}

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  const response = await apiRequest<ProfileResponse>('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  return response.data.profile
}
