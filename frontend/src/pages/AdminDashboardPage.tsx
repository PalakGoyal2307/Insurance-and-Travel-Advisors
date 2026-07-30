import { useEffect, useState } from 'react'
import type { PageId } from '../App'
import { ApiRequestError } from '../utils/api'
import { getAdminDashboard, getAdminUserDetails, listAdminUsers, type AdminDashboardStats, type AdminUserItem } from '../utils/adminApi'
import { getDocumentDownloadUrl, getDocumentViewUrl } from '../utils/documentApi'
import ApplicationDetailsModal from '../components/ApplicationDetailsModal'
import type { ProfileDocumentItem } from '../utils/documentApi'

interface Props {
  navigate: (page: PageId) => void
}

const getFormattedAdminDocumentLabel = (label: string, customLabel: string, documentType: string) => {
  const memberMatch = customLabel.match(/member(\d+)/i)
  const memberPrefix = memberMatch ? `Member ${memberMatch[1]} - ` : ''
  const lowerCustom = customLabel.toLowerCase()

  if (documentType === 'aadhaarCard') {
    if (lowerCustom.includes('aadhaar-front')) return `${memberPrefix}Aadhaar Card (Front)`
    if (lowerCustom.includes('aadhaar-back')) return `${memberPrefix}Aadhaar Card (Back)`
    if (lowerCustom.includes('aadhaar-single')) return `${memberPrefix}Aadhaar Card (Single)`
    if (lowerCustom.includes('nominee-aadhaar')) return `${memberPrefix}Nominee Aadhaar Card`
  }

  if (lowerCustom.includes('nominee-pan')) return `${memberPrefix}Nominee PAN Card`
  if (lowerCustom.includes('nominee-bank-proof')) return `${memberPrefix}Nominee Cancelled Cheque/Passbook`
  if (lowerCustom.includes('bank-proof')) return `${memberPrefix}Cancelled Cheque/Passbook`

  const itrMatch = lowerCustom.match(/itr-year-(\d)/)
  if (itrMatch) return `${memberPrefix}ITR Document ${itrMatch[1]}`

  const computationMatch = lowerCustom.match(/computation-year-(\d)/)
  if (computationMatch) return `${memberPrefix}Computation Document ${computationMatch[1]}`

  return `${memberPrefix}${label}`
}

const initialStats: AdminDashboardStats = {
  totalUsers: 0,
  totalHealthApplications: 0,
  totalLifeApplications: 0,
  totalGeneralApplications: 0,
  totalContacts: 0,
  totalDocuments: 0,
  pendingApplications: 0,
  approvedApplications: 0,
  rejectedApplications: 0,
  completedApplications: 0,
}

export default function AdminDashboardPage({ navigate }: Props) {
  const [stats, setStats] = useState<AdminDashboardStats>(initialStats)
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [selectedUserDetails, setSelectedUserDetails] = useState<Record<string, unknown> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [userSearch, setUserSearch] = useState('')
  const [documentSearch, setDocumentSearch] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<{ moduleName: 'health' | 'life' | 'general'; application: Record<string, unknown> } | null>(null)

  const loadData = async (search = '') => {
    setError('')
    setIsLoading(true)
    try {
      const [dashboard, allUsers] = await Promise.all([getAdminDashboard(), listAdminUsers(search)])
      setStats(dashboard.stats)
      setUsers(allUsers.filter((user) => user.role === 'user'))
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to load admin dashboard right now.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData(userSearch)
    }, 300)

    return () => clearTimeout(timer)
  }, [userSearch])

  const onSelectUser = async (userId: string) => {
    setError('')
    setDocumentSearch('')
    try {
      const details = await getAdminUserDetails(userId)
      setSelectedUserDetails(details)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError('Unable to load user details right now.')
      }
    }
  }

  const filteredUserDocuments =
    selectedUserDetails && 'uploadedDocuments' in selectedUserDetails && Array.isArray(selectedUserDetails.uploadedDocuments)
      ? (selectedUserDetails.uploadedDocuments as Array<Record<string, unknown>>).filter((doc) => {
          const query = documentSearch.trim().toLowerCase()
          if (!query) return true

          const label = getFormattedAdminDocumentLabel(
            String(doc.label || ''),
            String(doc.customLabel || ''),
            String(doc.documentType || '')
          ).toLowerCase()

          return (
            label.includes(query) ||
            String(doc.scope || '').toLowerCase().includes(query) ||
            String(doc.originalFileName || '').toLowerCase().includes(query)
          )
        })
      : []

  const filteredUserOwnedDocuments = filteredUserDocuments.filter(
    (doc) => String(doc.documentOwnerType || 'user') !== 'proposer'
  )

  const filteredProposerDocumentGroups = filteredUserDocuments.reduce<Record<string, Array<Record<string, unknown>>>>((acc, doc) => {
    if (String(doc.documentOwnerType || 'user') !== 'proposer') {
      return acc
    }
    const sequence = Number(doc.proposerSequence || 0)
    if (sequence < 1) {
      return acc
    }
    const key = String(sequence)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(doc)
    return acc
  }, {})

  const proposerDocumentGroups = Object.entries(filteredProposerDocumentGroups)
    .map(([sequence, documents]) => ({ sequence: Number(sequence), documents }))
    .sort((a, b) => a.sequence - b.sequence)

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      {selectedApplication && selectedUserDetails && 'uploadedDocuments' in selectedUserDetails && Array.isArray(selectedUserDetails.uploadedDocuments) && (
        <ApplicationDetailsModal
          title={`${selectedApplication.moduleName.toUpperCase()} Application Details`}
          application={selectedApplication.application}
          uploadedDocuments={selectedUserDetails.uploadedDocuments as ProfileDocumentItem[]}
          onClose={() => setSelectedApplication(null)}
        />
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[#0D2B5E] font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Central panel for all user applications, documents, and activity.</p>
          </div>
          <button
            onClick={() => navigate('home')}
            className="px-4 py-2 rounded-xl text-sm font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50"
          >
            Back to Home
          </button>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            ['Users', stats.totalUsers],
            ['Health Applications', stats.totalHealthApplications],
            ['Life Applications', stats.totalLifeApplications],
            ['General Applications', stats.totalGeneralApplications],
            ['Documents', stats.totalDocuments],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
              <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
              <div className="text-2xl font-bold text-[#0D2B5E] mt-1">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl shadow-xl p-6">
          <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-4">User Directory</h2>
          <div className="mb-4">
            <input
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
              className="w-full sm:w-96 px-4 py-2.5 rounded-xl border border-blue-200 text-sm"
              placeholder="Search users by name, email, phone, or customer code"
            />
          </div>
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-sm text-gray-500">No users found.</div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-blue-100">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-[#0D2B5E]">
                  <tr>
                    <th className="text-left px-4 py-3 font-bold">Customer Code</th>
                    <th className="text-left px-4 py-3 font-bold">Full Name</th>
                    <th className="text-left px-4 py-3 font-bold">Proposer Name</th>
                    <th className="text-left px-4 py-3 font-bold">Email</th>
                    <th className="text-left px-4 py-3 font-bold">Phone</th>
                    <th className="text-left px-4 py-3 font-bold">Created</th>
                    <th className="text-left px-4 py-3 font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-t border-blue-100">
                      <td className="px-4 py-3 text-gray-700">{user.customerCode}</td>
                      <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{user.fullName}</td>
                      <td className="px-4 py-3 text-gray-700">{user.proposerName || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3 text-gray-700">{user.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{new Date(user.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onSelectUser(user._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
                        >
                          View Full Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedUserDetails && (
          <div className="bg-white border border-blue-100 rounded-3xl shadow-xl p-6">
            <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-4">Selected User Complete Details</h2>
            <div className="space-y-6">
              <div className="overflow-auto rounded-2xl border border-blue-100">
                <table className="w-full text-sm">
                  <thead className="bg-blue-50 text-[#0D2B5E]">
                    <tr>
                      <th className="text-left px-4 py-3 font-bold">Field</th>
                      <th className="text-left px-4 py-3 font-bold">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedUserDetails)
                      .filter(([, value]) => !Array.isArray(value) && typeof value !== 'object')
                      .map(([key, value]) => (
                        <tr key={key} className="border-t border-blue-100">
                          <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{key}</td>
                          <td className="px-4 py-3 text-gray-700">{String(value)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {'uploadedDocuments' in selectedUserDetails && Array.isArray(selectedUserDetails.uploadedDocuments) && (
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-[#0D2B5E]">User Uploaded Documents</h3>
                    <input
                      value={documentSearch}
                      onChange={(event) => setDocumentSearch(event.target.value)}
                      className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-blue-200 text-sm"
                      placeholder="Search this user's documents"
                    />
                  </div>

                  <div className="overflow-auto rounded-2xl border border-blue-100">
                    <table className="w-full text-sm">
                      <thead className="bg-blue-50 text-[#0D2B5E]">
                        <tr>
                          <th className="text-left px-4 py-3 font-bold">Label</th>
                          <th className="text-left px-4 py-3 font-bold">Scope</th>
                          <th className="text-left px-4 py-3 font-bold">File</th>
                          <th className="text-left px-4 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUserOwnedDocuments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No user documents found.</td>
                          </tr>
                        ) : (
                          filteredUserOwnedDocuments.map((doc, index) => (
                            <tr key={String(doc.id || index)} className="border-t border-blue-100">
                              <td className="px-4 py-3 text-gray-700">
                                {getFormattedAdminDocumentLabel(
                                  String(doc.label || ''),
                                  String(doc.customLabel || ''),
                                  String(doc.documentType || '')
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{String(doc.scope || '')}</td>
                              <td className="px-4 py-3 text-gray-700">{String(doc.originalFileName || '')}</td>
                              <td className="px-4 py-3">
                                {typeof doc.id === 'string' && doc.id.trim() ? (
                                  <div className="flex flex-wrap gap-2">
                                    <a href={getDocumentViewUrl(doc.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">View</a>
                                    <a href={getDocumentDownloadUrl(doc.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">Download</a>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">Unavailable</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {proposerDocumentGroups.map((group) => (
                    <div key={`proposer-doc-group-${group.sequence}`} className="overflow-auto rounded-2xl border border-blue-100 mt-5">
                      <div className="bg-blue-50 px-4 py-3 text-sm font-bold text-[#0D2B5E]">Proposer {group.sequence} Documents</div>
                      <table className="w-full text-sm">
                        <thead className="bg-blue-50/60 text-[#0D2B5E]">
                          <tr>
                            <th className="text-left px-4 py-3 font-bold">Label</th>
                            <th className="text-left px-4 py-3 font-bold">Scope</th>
                            <th className="text-left px-4 py-3 font-bold">File</th>
                            <th className="text-left px-4 py-3 font-bold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.documents.map((doc, index) => (
                            <tr key={String(doc.id || `${group.sequence}-${index}`)} className="border-t border-blue-100">
                              <td className="px-4 py-3 text-gray-700">
                                {getFormattedAdminDocumentLabel(
                                  String(doc.label || ''),
                                  String(doc.customLabel || ''),
                                  String(doc.documentType || '')
                                )}
                              </td>
                              <td className="px-4 py-3 text-gray-700">{String(doc.scope || '')}</td>
                              <td className="px-4 py-3 text-gray-700">{String(doc.originalFileName || '')}</td>
                              <td className="px-4 py-3">
                                {typeof doc.id === 'string' && doc.id.trim() ? (
                                  <div className="flex flex-wrap gap-2">
                                    <a href={getDocumentViewUrl(doc.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">View</a>
                                    <a href={getDocumentDownloadUrl(doc.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">Download</a>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">Unavailable</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {'applications' in selectedUserDetails && typeof selectedUserDetails.applications === 'object' && selectedUserDetails.applications !== null && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {(['health', 'life', 'general'] as const).map((moduleName) => {
                    const appItems = (selectedUserDetails.applications as Record<string, unknown>)[moduleName]
                    const list = Array.isArray(appItems) ? appItems as Array<Record<string, unknown>> : []
                    return (
                      <div key={moduleName} className="rounded-2xl border border-blue-100 p-4">
                        <div className="font-bold text-[#0D2B5E] capitalize mb-2">{moduleName} Applications</div>
                        {list.length === 0 ? (
                          <div className="text-xs text-gray-500">No data</div>
                        ) : (
                          <div className="space-y-2">
                            {list.map((application, index) => (
                              <button
                                type="button"
                                key={String(application.id || index)}
                                onClick={() => setSelectedApplication({ moduleName, application })}
                                className="w-full text-left rounded-xl border border-blue-100 p-2 hover:border-blue-300 hover:shadow-sm transition"
                              >
                                <div className="text-xs font-semibold text-[#0D2B5E]">{String(application.planName || 'Application')}</div>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <div className="text-xs text-gray-500">Submitted: {application.createdAt ? new Date(String(application.createdAt)).toLocaleDateString() : 'N/A'}</div>
                                  <span className="text-xs text-[#0D2B5E] font-semibold">View Details</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
