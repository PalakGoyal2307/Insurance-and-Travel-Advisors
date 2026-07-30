import { apiRequest } from './api'

export interface AdminDashboardStats {
  totalUsers: number
  totalHealthApplications: number
  totalLifeApplications: number
  totalGeneralApplications: number
  totalContacts: number
  totalDocuments: number
  pendingApplications: number
  approvedApplications: number
  rejectedApplications: number
  completedApplications: number
}

export interface AdminDashboardResponse {
  success: boolean
  data: {
    stats: AdminDashboardStats
    recentRegistrations: Array<{
      _id: string
      customerCode: string
      fullName: string
      email: string
      phone: string
      createdAt: string
    }>
    recentApplications: {
      health: Array<Record<string, unknown>>
      life: Array<Record<string, unknown>>
      general: Array<Record<string, unknown>>
    }
    recentContacts: Array<Record<string, unknown>>
  }
}

export interface AdminUserItem {
  _id: string
  customerCode: string
  fullName: string
  proposerName?: string
  email: string
  phone: string
  role: 'user' | 'admin'
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export const getAdminDashboard = async () => {
  const response = await apiRequest<AdminDashboardResponse>('/admin/dashboard', {
    method: 'GET',
  })

  return response.data
}

export const listAdminUsers = async (search = '') => {
  const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
  const response = await apiRequest<{
    success: boolean
    data: {
      items: AdminUserItem[]
    }
  }>(`/admin/users${query}`, {
    method: 'GET',
  })

  return response.data.items
}

export const getAdminUserDetails = async (userId: string) => {
  const response = await apiRequest<{
    success: boolean
    data: {
      user: Record<string, unknown>
    }
  }>(`/admin/users/${userId}`, {
    method: 'GET',
  })

  return response.data.user
}
