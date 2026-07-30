import { useEffect, useMemo, useState } from 'react'
import type { PageId } from '../App'
import type { AuthUser } from '../utils/authApi'
import { getMyProfile, updateMyProfile } from '../utils/authApi'
import { ApiRequestError } from '../utils/api'
import DocumentUploadButton from '../components/DocumentUploadButton'
import ApplicationDetailsModal from '../components/ApplicationDetailsModal'
import { PROFILE_DOCUMENTS } from '../constants/documents'
import { getDocumentDownloadUrl, getDocumentViewUrl } from '../utils/documentApi'

interface Props {
  navigate: (page: PageId) => void
  user: AuthUser
  onProfileUpdated: (user: AuthUser) => void
}

const formatMemberTag = (customLabel: string) => {
  const match = customLabel.match(/member(\d+)/i)
  if (!match) return ''
  const number = Number(match[1])
  return Number.isFinite(number) && number > 0 ? `Member ${number}` : ''
}

const formatAadhaarSide = (customLabel: string) => {
  const label = customLabel.toLowerCase()
  if (label.includes('aadhaar-front')) return 'Front'
  if (label.includes('aadhaar-back')) return 'Back'
  if (label.includes('aadhaar-single')) return 'Single'
  if (label.includes('nominee-aadhaar')) return 'Nominee'
  return ''
}

const getReadableDocumentLabel = (document: { label: string; documentType: string; customLabel?: string }) => {
  if (document.documentType !== 'aadhaarCard') {
    if (document.customLabel?.includes('nominee-bank-proof')) return 'Nominee Cancelled Cheque/Passbook'
    if (document.customLabel?.includes('nominee-pan')) return 'Nominee PAN Card'
    if (document.customLabel?.includes('bank-proof')) return 'Cancelled Cheque/Passbook'
    return document.label
  }

  const side = formatAadhaarSide(document.customLabel || '')
  const member = formatMemberTag(document.customLabel || '')

  if (member && side) return `${member} Aadhaar Card (${side})`
  if (member) return `${member} Aadhaar Card`
  if (side) return `Aadhaar Card (${side})`
  return 'Aadhaar Card'
}

const getDocumentSubjectGroup = (document: { customLabel?: string; scope: 'profile' | 'health' | 'life' | 'general' }) => {
  const customLabel = String(document.customLabel || '').toLowerCase()
  if (customLabel.includes('nominee-')) return 'Nominee Documents'

  const memberTag = formatMemberTag(customLabel)
  if (memberTag) return `${memberTag} Documents`

  if (document.scope === 'profile') return 'Profile Documents'
  return 'Primary Member'
}

export default function ProfilePage({ navigate, user, onProfileUpdated }: Props) {
  const [fullName, setFullName] = useState(user.fullName)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedApplication, setSelectedApplication] = useState<{ moduleName: 'health' | 'life' | 'general'; application: Record<string, unknown> } | null>(null)

  const refreshProfile = async () => {
    setIsLoadingProfile(true)
    try {
      const profile = await getMyProfile()
      onProfileUpdated(profile)
      setFullName(profile.fullName)
      setEmail(profile.email)
      setPhone(profile.phone)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Unable to load your latest profile details.')
      }
    } finally {
      setIsLoadingProfile(false)
    }
  }

  useEffect(() => {
    refreshProfile()
  }, [])

  const handleUpdate = async (event: React.FormEvent) => {
    event.preventDefault()
    setSuccessMessage('')
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      const updatedProfile = await updateMyProfile({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      })

      onProfileUpdated(updatedProfile)
      setSuccessMessage('Profile updated successfully.')
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Unable to update profile right now. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const applications = user.applications || { health: [], life: [], general: [] }
  const uploadedDocuments = user.uploadedDocuments || []

  const documentCards = useMemo(
    () => [
      {
        key: 'aadhaar-single',
        label: 'Aadhaar Card (Single)',
        documentType: 'aadhaarCard',
        scope: 'profile' as const,
        customLabel: 'member1-aadhaar-single',
      },
      {
        key: 'aadhaar-front',
        label: 'Aadhaar Card (Front)',
        documentType: 'aadhaarCard',
        scope: 'profile' as const,
        customLabel: 'member1-aadhaar-front',
      },
      {
        key: 'aadhaar-back',
        label: 'Aadhaar Card (Back)',
        documentType: 'aadhaarCard',
        scope: 'profile' as const,
        customLabel: 'member1-aadhaar-back',
      },
      ...PROFILE_DOCUMENTS.filter((item) => item.documentType !== 'aadhaarCard').map((item) => ({
        key: item.documentType,
        label: item.label,
        documentType: item.documentType,
        scope: 'profile' as const,
      })),
      {
        key: 'itr-1',
        label: 'ITR Document 1',
        documentType: 'itrDocument',
        scope: 'life' as const,
        customLabel: 'member1-itr-year-1',
      },
      {
        key: 'itr-2',
        label: 'ITR Document 2',
        documentType: 'itrDocument',
        scope: 'life' as const,
        customLabel: 'member1-itr-year-2',
      },
      {
        key: 'itr-3',
        label: 'ITR Document 3',
        documentType: 'itrDocument',
        scope: 'life' as const,
        customLabel: 'member1-itr-year-3',
      },
      {
        key: 'computation-1',
        label: 'Computation Document 1',
        documentType: 'computationDocument',
        scope: 'life' as const,
        customLabel: 'member1-computation-year-1',
      },
      {
        key: 'computation-2',
        label: 'Computation Document 2',
        documentType: 'computationDocument',
        scope: 'life' as const,
        customLabel: 'member1-computation-year-2',
      },
      {
        key: 'computation-3',
        label: 'Computation Document 3',
        documentType: 'computationDocument',
        scope: 'life' as const,
        customLabel: 'member1-computation-year-3',
      },
      {
        key: 'nominee-bank-proof',
        label: 'Nominee Cancelled Cheque/Passbook',
        documentType: 'cancelledChequePassbook',
        scope: 'life' as const,
        customLabel: 'member1-nominee-bank-proof',
      },
    ],
    []
  )

  const profileDocMap = useMemo(() => {
    const map = new Map<string, (typeof uploadedDocuments)[number]>()
    for (const document of uploadedDocuments) {
      if (document.scope === 'profile') {
        map.set(document.documentType, document)
      }
    }
    return map
  }, [uploadedDocuments])

  const latestDocumentByType = useMemo(() => {
    const map = new Map<string, (typeof uploadedDocuments)[number]>()
    for (const document of uploadedDocuments) {
      if (!map.has(document.documentType)) {
        map.set(document.documentType, document)
      }
    }
    return map
  }, [uploadedDocuments])

  const latestDocumentByCustomLabel = useMemo(() => {
    const map = new Map<string, (typeof uploadedDocuments)[number]>()
    for (const document of uploadedDocuments) {
      const label = (document.customLabel || '').toLowerCase()
      if (!label) continue
      if (!map.has(label)) {
        map.set(label, document)
      }
    }
    return map
  }, [uploadedDocuments])

  return (
    <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
      {selectedApplication && (
        <ApplicationDetailsModal
          title={`${selectedApplication.moduleName.toUpperCase()} Application Details`}
          application={selectedApplication.application}
          uploadedDocuments={uploadedDocuments}
          onClose={() => setSelectedApplication(null)}
        />
      )}
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="bg-white border border-blue-100 rounded-3xl shadow-xl p-6 sm:p-8">
          <h1 className="font-display text-3xl text-[#0D2B5E] font-bold mb-2">My Profile</h1>
          <p className="text-gray-500 text-sm mb-8">Manage your account details securely.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Customer ID</div>
              <div className="text-[#0D2B5E] font-bold mt-1">{user.customerCode}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Role</div>
              <div className="text-[#0D2B5E] font-bold mt-1 capitalize">{user.role}</div>
            </div>
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Account Created</div>
              <div className="text-[#0D2B5E] font-bold mt-1">{new Date(user.createdAt).toLocaleDateString()}</div>
            </div>
          </div>

          {errorMessage && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>}
          {successMessage && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>}

          <form onSubmit={handleUpdate} className="space-y-5">
            <div>
              <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              />
            </div>

            <div>
              <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              />
            </div>

            <div>
              <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-70"
                style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
              >
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </button>

              <button
                type="button"
                onClick={refreshProfile}
                className="px-6 py-3 rounded-2xl font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50"
              >
                {isLoadingProfile ? 'Refreshing...' : 'Refresh Profile'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-2">Documents</h2>
          <p className="text-gray-500 text-sm mb-6">View and update all required profile and life insurance documents from one place.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {documentCards.map((item) => {
              const document = item.customLabel
                ? latestDocumentByCustomLabel.get(item.customLabel.toLowerCase())
                : latestDocumentByType.get(item.documentType)
              const alreadyUploaded = Boolean(document)
              const uploadScope = item.scope
              const uploadCustomLabel = item.customLabel

              return (
                <div key={item.key} className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="text-[#0D2B5E] font-bold">{item.label}</div>
                      <div className="text-sm text-gray-500 mt-1">{alreadyUploaded ? 'Already Uploaded' : 'Not uploaded yet'}</div>
                      {document && <div className="text-xs text-gray-500 mt-1 capitalize">Scope: {document.scope}</div>}
                      {document && <div className="text-xs text-gray-500 mt-2 break-all">{document.originalFileName}</div>}
                    </div>
                    <div className="w-full sm:w-auto">
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                      {document && (
                        <>
                          <a href={getDocumentViewUrl(document.id)} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-sm font-bold text-[#0D2B5E] border border-blue-200 hover:bg-white">
                            View
                          </a>
                          <a href={getDocumentDownloadUrl(document.id)} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-sm font-bold text-[#0D2B5E] border border-blue-200 hover:bg-white">
                            Download
                          </a>
                        </>
                      )}
                      <DocumentUploadButton
                        label={item.label}
                        documentType={item.documentType}
                        customLabel={uploadCustomLabel}
                        scope={uploadScope}
                        subjectName={user.fullName}
                        subjectGroup={item.customLabel?.includes('nominee-') ? 'Nominee Documents' : 'Primary Member'}
                        buttonText={alreadyUploaded ? 'Replace' : 'Upload'}
                        onUploaded={refreshProfile}
                      />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="overflow-auto rounded-2xl border border-blue-100">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 text-[#0D2B5E]">
                <tr>
                  <th className="text-left px-4 py-3 font-bold">Document</th>
                  <th className="text-left px-4 py-3 font-bold">Scope</th>
                  <th className="text-left px-4 py-3 font-bold">File</th>
                  <th className="text-left px-4 py-3 font-bold">Uploaded</th>
                  <th className="text-left px-4 py-3 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploadedDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-gray-500">No files uploaded yet.</td>
                  </tr>
                ) : (
                  uploadedDocuments.map((document) => (
                    <tr key={document.id} className="border-t border-blue-100">
                      <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{getReadableDocumentLabel(document)}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{document.scope}</td>
                      <td className="px-4 py-3 text-gray-600">{document.originalFileName}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(document.uploadedAt).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <a href={getDocumentViewUrl(document.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">View</a>
                          <a href={getDocumentDownloadUrl(document.id)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">Download</a>
                          <DocumentUploadButton
                            label={getReadableDocumentLabel(document)}
                            documentType={document.documentType}
                            scope={document.scope}
                            customLabel={document.customLabel}
                            applicationId={document.applicationId || undefined}
                            subjectName={user.fullName}
                            subjectGroup={getDocumentSubjectGroup(document)}
                            buttonText="Replace"
                            onUploaded={refreshProfile}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-3xl shadow-xl p-6 sm:p-8">
          <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-2">Insurance Applications</h2>
          <p className="text-gray-500 text-sm mb-6">Track all your submitted applications across health, life, and general insurance.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {(['health', 'life', 'general'] as const).map((moduleName) => (
              <div key={moduleName} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                <div className="text-[#0D2B5E] font-bold capitalize mb-4">{moduleName} Insurance</div>
                <div className="space-y-3">
                  {applications[moduleName].length === 0 ? (
                    <div className="text-sm text-gray-500">No applications submitted yet.</div>
                  ) : (
                    applications[moduleName].map((application) => (
                            <button
                              type="button"
                              key={application.id}
                              onClick={() => setSelectedApplication({ moduleName, application: application as unknown as Record<string, unknown> })}
                              className="w-full text-left rounded-xl bg-white border border-blue-100 p-3 hover:border-blue-300 hover:shadow-sm transition"
                            >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-bold text-[#0D2B5E]">{application.planName || 'General Application'}</div>
                                <span className="text-xs text-[#0D2B5E] font-semibold">View Details</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Submitted on {new Date(application.createdAt).toLocaleDateString()}</div>
                            </button>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
