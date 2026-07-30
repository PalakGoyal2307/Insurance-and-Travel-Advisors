import { useEffect, useMemo, useState } from 'react'
import DocumentUploadButton from './DocumentUploadButton'
import type { InsuranceMemberPayload } from '../utils/insuranceApi'
import { getDocumentDownloadUrl, getDocumentViewUrl, type ProfileDocumentItem } from '../utils/documentApi'

type InsuranceKind = 'health' | 'life'
type DiseaseMode = 'notApplicable' | 'listed'
type AadhaarMode = 'single' | 'frontBack'

interface MemberState {
  fullName: string
  address: string
  pincode: string
  relation: string
  heightFeet: string
  heightInch: string
  weightKg: string
  dob: string
  age: string
  aadhaarMode: AadhaarMode
  aadhaarSingleId: string
  aadhaarFrontId: string
  aadhaarBackId: string
  diseaseMode: DiseaseMode
  diseaseNamesText: string
  diseaseOtherText: string
  otherDiseaseSelected: boolean
  panCardDocumentId: string
  bankProofDocumentId: string
  itrDocumentIds: [string, string, string]
  computationDocumentIds: [string, string, string]
  nomineeAadhaarDocumentId: string
  nomineePanDocumentId: string
  nomineeBankProofDocumentId: string
}

interface SubmitPayload {
  fullName: string
  email: string
  phone: string
  proposerType: 'self' | 'others'
  proposerSequence?: number
  primaryMember: InsuranceMemberPayload
  additionalMembers: InsuranceMemberPayload[]
}

interface Props {
  kind: InsuranceKind
  planLabel: string
  existingDocuments?: ProfileDocumentItem[]
  prefillUser?: {
    fullName: string
    email: string
    phone: string
  } | null
  nextProposerSequence?: number
  isSubmitting: boolean
  errorMessage: string
  successMessage: string
  onClose: () => void
  onSubmit: (payload: SubmitPayload) => Promise<void>
}

const MAX_MEMBERS = 4
const COMMON_DISEASES = ['Thyroid', 'BP', 'Diabetes', 'Asthma', 'Heart Disease', 'Kidney Disease', 'Liver Disease']
const RELATION_OPTIONS = ['Father', 'Mother', 'Children', 'Spouse', 'Mother-in-law', 'Father-in-law'] as const

const createEmptyMember = (fullName = ''): MemberState => ({
  fullName,
  address: '',
  pincode: '',
  relation: '',
  heightFeet: '',
  heightInch: '',
  weightKg: '',
  dob: '',
  age: '',
  aadhaarMode: 'single',
  aadhaarSingleId: '',
  aadhaarFrontId: '',
  aadhaarBackId: '',
  diseaseMode: 'notApplicable',
  diseaseNamesText: '',
  diseaseOtherText: '',
  otherDiseaseSelected: false,
  panCardDocumentId: '',
  bankProofDocumentId: '',
  itrDocumentIds: ['', '', ''],
  computationDocumentIds: ['', '', ''],
  nomineeAadhaarDocumentId: '',
  nomineePanDocumentId: '',
  nomineeBankProofDocumentId: '',
})

const sectionTitle = (kind: InsuranceKind) => (kind === 'health' ? 'Health Insurance Application' : 'Life Insurance Application')

const findDocumentByCustomLabel = (documents: ProfileDocumentItem[], customLabel: string) => {
  const normalized = customLabel.trim().toLowerCase()
  return documents.find((item) => (item.customLabel || '').trim().toLowerCase() === normalized)
}

const findDocumentByType = (documents: ProfileDocumentItem[], documentType: string) => documents.find((item) => item.documentType === documentType)

const getUploadScopeForDocument = (
  documentType: string,
  kind: InsuranceKind,
  customLabel = ''
): 'profile' | 'health' | 'life' | 'general' => {
  if (customLabel.toLowerCase().includes('nominee-')) {
    return 'life'
  }

  if (documentType === 'aadhaarCard' || documentType === 'panCard' || documentType === 'cancelledChequePassbook') {
    return 'profile'
  }
  return kind === 'health' ? 'health' : 'life'
}

const calculateAgeFromDob = (dob: string) => {
  if (!dob) return ''
  const normalizedDob = convertDisplayDobToIso(dob)
  if (!normalizedDob) return ''

  const dobDate = new Date(normalizedDob)
  if (Number.isNaN(dobDate.getTime())) return ''

  const today = new Date()
  let age = today.getFullYear() - dobDate.getFullYear()
  const monthDiff = today.getMonth() - dobDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    age -= 1
  }

  return String(Math.max(age, 0))
}

const formatDobInput = (value: string) => {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`
}

const isValidDobString = (value: string) => {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(value)) return false

  const normalizedDob = convertDisplayDobToIso(value)
  if (!normalizedDob) return false

  const [year, month, day] = normalizedDob.split('-').map(Number)
  const parsed = new Date(normalizedDob)
  if (Number.isNaN(parsed.getTime())) return false

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() + 1 === month &&
    parsed.getUTCDate() === day
  )
}

const convertDisplayDobToIso = (value: string) => {
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)
  if (!match) return ''

  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

const getSubjectGroup = (index: number, isNominee = false) => {
  if (isNominee) return 'Nominee Documents'
  return index === 0 ? 'Primary Member' : `Member ${index + 1}`
}

const createPrimaryMemberFromExistingDocuments = (kind: InsuranceKind, documents: ProfileDocumentItem[], primaryFullName = '') => {
  const member = createEmptyMember(primaryFullName)

  const aadhaarSingle = findDocumentByCustomLabel(documents, 'member1-aadhaar-single')
  const aadhaarFront = findDocumentByCustomLabel(documents, 'member1-aadhaar-front')
  const aadhaarBack = findDocumentByCustomLabel(documents, 'member1-aadhaar-back')

  if (aadhaarSingle) {
    member.aadhaarMode = 'single'
    member.aadhaarSingleId = aadhaarSingle.id
  } else if (aadhaarFront && aadhaarBack) {
    member.aadhaarMode = 'frontBack'
    member.aadhaarFrontId = aadhaarFront.id
    member.aadhaarBackId = aadhaarBack.id
  } else {
    const fallbackAadhaar = findDocumentByType(documents, 'aadhaarCard')
    if (fallbackAadhaar) {
      member.aadhaarMode = 'single'
      member.aadhaarSingleId = fallbackAadhaar.id
    }
  }

  member.panCardDocumentId =
    findDocumentByCustomLabel(documents, 'member1-pan')?.id ||
    findDocumentByType(documents, 'panCard')?.id ||
    ''

  member.bankProofDocumentId =
    findDocumentByCustomLabel(documents, 'member1-bank-proof')?.id ||
    findDocumentByType(documents, 'cancelledChequePassbook')?.id ||
    ''

  if (kind === 'life') {
    member.itrDocumentIds = [
      findDocumentByCustomLabel(documents, 'member1-itr-year-1')?.id || '',
      findDocumentByCustomLabel(documents, 'member1-itr-year-2')?.id || '',
      findDocumentByCustomLabel(documents, 'member1-itr-year-3')?.id || '',
    ]

    member.computationDocumentIds = [
      findDocumentByCustomLabel(documents, 'member1-computation-year-1')?.id || '',
      findDocumentByCustomLabel(documents, 'member1-computation-year-2')?.id || '',
      findDocumentByCustomLabel(documents, 'member1-computation-year-3')?.id || '',
    ]

    member.nomineeAadhaarDocumentId = findDocumentByCustomLabel(documents, 'member1-nominee-aadhaar')?.id || ''
    member.nomineePanDocumentId = findDocumentByCustomLabel(documents, 'member1-nominee-pan')?.id || ''
    member.nomineeBankProofDocumentId = findDocumentByCustomLabel(documents, 'member1-nominee-bank-proof')?.id || ''
  }

  return member
}

export default function MemberInsuranceModal({
  kind,
  planLabel,
  existingDocuments = [],
  prefillUser = null,
  nextProposerSequence = 1,
  isSubmitting,
  errorMessage,
  successMessage,
  onClose,
  onSubmit,
}: Props) {
  const [proposerType, setProposerType] = useState<'self' | 'others'>('self')
  const [proposerSequence] = useState(Math.max(1, Number(nextProposerSequence) || 1))
  const [contactEmail, setContactEmail] = useState(prefillUser?.email || '')
  const [contactPhone, setContactPhone] = useState(prefillUser?.phone || '')
  const selfDocuments = useMemo(
    () => existingDocuments.filter((document) => (document.documentOwnerType || 'user') !== 'proposer'),
    [existingDocuments]
  )
  const proposerDocuments = useMemo(
    () => existingDocuments.filter((document) => document.documentOwnerType === 'proposer' && document.proposerSequence === proposerSequence),
    [existingDocuments, proposerSequence]
  )
  const [members, setMembers] = useState<MemberState[]>(() => [createPrimaryMemberFromExistingDocuments(kind, selfDocuments, prefillUser?.fullName || '')])
  const [localError, setLocalError] = useState('')

  const activeDocumentOwnerType: 'user' | 'proposer' = proposerType === 'others' ? 'proposer' : 'user'
  const activeProposerSequence = proposerType === 'others' ? proposerSequence : undefined

  useEffect(() => {
    if (proposerType === 'self') {
      setMembers([createPrimaryMemberFromExistingDocuments(kind, selfDocuments, prefillUser?.fullName || '')])
      if (prefillUser) {
        setContactEmail((current) => current || prefillUser.email || '')
        setContactPhone((current) => current || prefillUser.phone || '')
      }
      return
    }

    setMembers([createPrimaryMemberFromExistingDocuments(kind, proposerDocuments, '')])
  }, [kind, prefillUser, proposerDocuments, proposerType, selfDocuments])

  const canAddMember = members.length < MAX_MEMBERS

  const updateMember = (index: number, updater: (member: MemberState) => MemberState) => {
    setMembers((prev) => prev.map((member, memberIndex) => (memberIndex === index ? updater(member) : member)))
  }

  const addMember = () => {
    if (!canAddMember) return
    setMembers((prev) => [...prev, createEmptyMember()])
  }

  const removeMember = (index: number) => {
    if (index === 0) return
    setMembers((prev) => prev.filter((_, memberIndex) => memberIndex !== index))
  }

  const parseDiseaseNames = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

  const toggleDiseaseName = (existingCsv: string, diseaseName: string) => {
    const existing = parseDiseaseNames(existingCsv)
    const hasDisease = existing.includes(diseaseName)
    const next = hasDisease ? existing.filter((item) => item !== diseaseName) : [...existing, diseaseName]
    return next.join(', ')
  }

  const getMemberValidationError = (member: MemberState, index: number) => {
    const memberNumber = index + 1

    if (!member.fullName.trim()) return `Member ${memberNumber}: full name is required`
    if (index > 0 && !member.relation.trim()) return `Member ${memberNumber}: relation is required`
    if (index > 0 && !RELATION_OPTIONS.includes(member.relation.trim() as (typeof RELATION_OPTIONS)[number])) {
      return `Member ${memberNumber}: relation must be selected from the list`
    }

    if (index === 0 && member.address.trim().length < 5) {
      return 'Member 1: address is compulsory'
    }

    if (index === 0 && !/^\d{6}$/.test(member.pincode.trim())) {
      return 'Member 1: pincode must be exactly 6 digits'
    }

    const numberChecks: Array<[string, string, number, number]> = [
      ['height (feet)', member.heightFeet, 1, 8],
      ['height (inch)', member.heightInch, 0, 11],
      ['weight (kg)', member.weightKg, 1, 400],
      ['age', member.age, 0, 120],
    ]

    for (const [field, value, min, max] of numberChecks) {
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
        return `Member ${memberNumber}: ${field} must be between ${min} and ${max}`
      }
    }

    if (!member.dob) return `Member ${memberNumber}: date of birth is required`
    if (!isValidDobString(member.dob)) return `Member ${memberNumber}: date of birth must be in DD-MM-YYYY format`

    const expectedAge = calculateAgeFromDob(member.dob)
    if (member.age !== expectedAge) {
      return `Member ${memberNumber}: age must match date of birth`
    }

    if (member.aadhaarMode === 'single' && !member.aadhaarSingleId) {
      return `Member ${memberNumber}: upload Aadhaar single image/document`
    }

    if (member.aadhaarMode === 'frontBack' && (!member.aadhaarFrontId || !member.aadhaarBackId)) {
      return `Member ${memberNumber}: upload both Aadhaar front and back`
    }

    if (member.diseaseMode === 'listed' && parseDiseaseNames(member.diseaseNamesText).length === 0 && !member.otherDiseaseSelected) {
      return `Member ${memberNumber}: provide at least one disease name`
    }

    if (member.diseaseMode === 'listed' && member.otherDiseaseSelected && member.diseaseOtherText.trim().length < 2) {
      return `Member ${memberNumber}: specify disease in Other`
    }

    if (index === 0) {
      if (!member.panCardDocumentId) return 'Member 1: PAN card upload is compulsory'
      if (!member.bankProofDocumentId) return 'Member 1: cancelled cheque/passbook upload is compulsory'

      if (kind === 'life') {
        if (member.itrDocumentIds.some((item) => !item)) return 'Member 1: all 3 ITR documents are compulsory'
        if (member.computationDocumentIds.some((item) => !item)) return 'Member 1: all 3 computation documents are compulsory'
        if (!member.nomineeAadhaarDocumentId) return 'Member 1: nominee Aadhaar upload is compulsory'
        if (!member.nomineePanDocumentId) return 'Member 1: nominee PAN upload is compulsory'
        if (!member.nomineeBankProofDocumentId) return 'Member 1: nominee cancelled cheque/passbook upload is compulsory'
      }
    }

    return ''
  }

  const toMemberPayload = (member: MemberState, isPrimaryMember: boolean): InsuranceMemberPayload => {
    const commonPayload: InsuranceMemberPayload = {
      fullName: member.fullName.trim(),
      heightFeet: Number(member.heightFeet),
      heightInch: Number(member.heightInch),
      weightKg: Number(member.weightKg),
      dob: convertDisplayDobToIso(member.dob),
      age: Number(member.age),
      aadhaar:
        member.aadhaarMode === 'single'
          ? {
              mode: 'single',
              singleDocumentId: member.aadhaarSingleId,
            }
          : {
              mode: 'frontBack',
              frontDocumentId: member.aadhaarFrontId,
              backDocumentId: member.aadhaarBackId,
            },
      diseases:
        member.diseaseMode === 'notApplicable'
          ? { mode: 'notApplicable', names: [] }
          : {
              mode: 'listed',
              names: parseDiseaseNames(member.diseaseNamesText),
              otherText: member.otherDiseaseSelected ? member.diseaseOtherText.trim() : undefined,
            },
    }

    if (isPrimaryMember) {
      commonPayload.address = member.address.trim()
      commonPayload.pincode = member.pincode.trim()
    }

    if (!isPrimaryMember) {
      commonPayload.relation = member.relation.trim()
    }

    if (member.panCardDocumentId) commonPayload.panCardDocumentId = member.panCardDocumentId
    if (member.bankProofDocumentId) commonPayload.bankProofDocumentId = member.bankProofDocumentId

    if (kind === 'life') {
      if (member.itrDocumentIds.every(Boolean)) commonPayload.itrDocumentIds = member.itrDocumentIds
      if (member.computationDocumentIds.every(Boolean)) commonPayload.computationDocumentIds = member.computationDocumentIds
      if (member.nomineeAadhaarDocumentId) commonPayload.nomineeAadhaarDocumentId = member.nomineeAadhaarDocumentId
      if (member.nomineePanDocumentId) commonPayload.nomineePanDocumentId = member.nomineePanDocumentId
      if (member.nomineeBankProofDocumentId) commonPayload.nomineeBankProofDocumentId = member.nomineeBankProofDocumentId
    }

    return commonPayload
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLocalError('')

    if (!contactEmail.trim()) {
      setLocalError('Contact email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setLocalError('Please enter a valid contact email address')
      return
    }

    if (!/^\+?\d{10,15}$/.test(contactPhone.trim().replace(/\s+/g, ''))) {
      setLocalError('Please enter a valid contact phone number with 10 to 15 digits')
      return
    }

    for (let index = 0; index < members.length; index += 1) {
      const memberError = getMemberValidationError(members[index], index)
      if (memberError) {
        setLocalError(memberError)
        return
      }
    }

    const primaryMember = toMemberPayload(members[0], true)
    const additionalMembers = members.slice(1).map((member) => toMemberPayload(member, false))

    await onSubmit({
      fullName: members[0].fullName.trim(),
      email: contactEmail.trim(),
      phone: contactPhone.trim(),
      proposerType,
      proposerSequence: proposerType === 'others' ? proposerSequence : undefined,
      primaryMember,
      additionalMembers,
    })
  }

  const totalMembersLabel = useMemo(() => `Members Added: ${members.length}/${MAX_MEMBERS}`, [members.length])

  const renderDocumentActions = (documentId: string) => {
    if (!documentId) return null
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        <a href={getDocumentViewUrl(documentId)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">
          View
        </a>
        <a href={getDocumentDownloadUrl(documentId)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">
          Download
        </a>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="p-6 sm:p-8 border-b border-blue-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{sectionTitle(kind)}</h2>
              <p className="text-gray-500 text-sm mt-1">Selected Plan: {planLabel}</p>
              <p className="text-gray-500 text-sm">{totalMembersLabel}</p>
            </div>
            <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {(localError || errorMessage) && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{localError || errorMessage}</div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</div>
          )}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
            <div className="text-sm font-bold text-[#0D2B5E]">Who is the proposer?</div>
            <div className="flex flex-wrap gap-6 text-sm">
              <label className="inline-flex items-center gap-2 text-[#0D2B5E]">
                <input
                  type="radio"
                  name="proposerType"
                  checked={proposerType === 'self'}
                  onChange={() => {
                    setProposerType('self')
                    setLocalError('')
                  }}
                />
                Self (logged-in user)
              </label>
              <label className="inline-flex items-center gap-2 text-[#0D2B5E]">
                <input
                  type="radio"
                  name="proposerType"
                  checked={proposerType === 'others'}
                  onChange={() => {
                    setProposerType('others')
                    setLocalError('')
                  }}
                />
                Others (new proposer)
              </label>
            </div>
            {proposerType === 'others' && (
              <div className="text-xs text-gray-600">
                This submission will be stored under proposer folder: <span className="font-bold">Proposer {proposerSequence}</span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="required-label text-[#0D2B5E] text-sm font-bold block mb-1.5">Contact Phone</label>
              <input
                value={contactPhone}
                onChange={(event) => setContactPhone(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-blue-200 text-sm"
                placeholder="+91XXXXXXXXXX"
                required
              />
            </div>
          </div>

          {members.map((member, index) => {
            const memberNumber = index + 1
            const isPrimary = index === 0
            const memberHeading = isPrimary
              ? proposerType === 'others'
                ? 'Member 1 (Primary Member - Proposer)'
                : 'Member 1 (Primary Member)'
              : `Member ${memberNumber}`
            const baseLabel = `member${memberNumber}`

            return (
              <div key={memberNumber} className="rounded-2xl border border-blue-100 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-[#0D2B5E]">{memberHeading}</h3>
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50"
                    >
                      Remove Member
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Full Name</label>
                    <input value={member.fullName} onChange={(event) => updateMember(index, (current) => ({ ...current, fullName: event.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name" required />
                  </div>
                  {isPrimary && (
                    <>
                      <div className="space-y-1.5 sm:col-span-2 lg:col-span-2">
                        <label className="required-label text-xs font-bold text-[#0D2B5E]">Address</label>
                        <input
                          value={member.address}
                          onChange={(event) => updateMember(index, (current) => ({ ...current, address: event.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                          placeholder="Current Address"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="required-label text-xs font-bold text-[#0D2B5E]">Pincode</label>
                        <input
                          value={member.pincode}
                          onChange={(event) => updateMember(index, (current) => ({ ...current, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                          placeholder="6-digit Pincode"
                          inputMode="numeric"
                          pattern="\d{6}"
                          required
                        />
                      </div>
                    </>
                  )}
                  {!isPrimary && (
                    <div className="space-y-1.5">
                      <label className="required-label text-xs font-bold text-[#0D2B5E]">Relation</label>
                      <select
                        value={member.relation}
                        onChange={(event) => updateMember(index, (current) => ({ ...current, relation: event.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                        required
                      >
                        <option value="" disabled hidden />
                        {RELATION_OPTIONS.map((relation) => (
                          <option key={relation} value={relation}>
                            {relation}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Date of Birth</label>
                    <input
                      value={member.dob}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="DD-MM-YYYY"
                      onChange={(event) => {
                        const nextDob = formatDobInput(event.target.value)
                        updateMember(index, (current) => ({
                          ...current,
                          dob: nextDob,
                          age: isValidDobString(nextDob) ? calculateAgeFromDob(nextDob) : '',
                        }))
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Age</label>
                    <input value={member.age} type="number" min={0} max={120} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Age (Auto)" readOnly required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Height (Feet)</label>
                    <input value={member.heightFeet} type="number" min={1} max={8} onChange={(event) => updateMember(index, (current) => ({ ...current, heightFeet: event.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Height (Feet)" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Height (Inch)</label>
                    <input value={member.heightInch} type="number" min={0} max={11} onChange={(event) => updateMember(index, (current) => ({ ...current, heightInch: event.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Height (Inch)" required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                    <label className="required-label text-xs font-bold text-[#0D2B5E]">Weight (kg)</label>
                    <input value={member.weightKg} type="number" min={1} max={400} onChange={(event) => updateMember(index, (current) => ({ ...current, weightKg: event.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Weight (kg)" required />
                  </div>
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
                  <div className="required-label text-sm font-bold text-[#0D2B5E]">Aadhaar Card Upload</div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        checked={member.aadhaarMode === 'single'}
                        onChange={() => updateMember(index, (current) => ({ ...current, aadhaarMode: 'single', aadhaarFrontId: '', aadhaarBackId: '' }))}
                      />
                      Single Upload (front/back in one image)
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        checked={member.aadhaarMode === 'frontBack'}
                        onChange={() => updateMember(index, (current) => ({ ...current, aadhaarMode: 'frontBack', aadhaarSingleId: '' }))}
                      />
                      Separate Front + Back Upload
                    </label>
                  </div>
                  <div className="text-xs text-gray-600">
                    Aadhaar PDF rule: Single upload allows up to 2 pages. Front/Back uploads must each be 1 page.
                  </div>

                  {member.aadhaarMode === 'single' ? (
                    <div>
                      <DocumentUploadButton
                        label={`Member ${memberNumber} Aadhaar Single`}
                        documentType="aadhaarCard"
                        customLabel={`${baseLabel}-aadhaar-single`}
                        scope={getUploadScopeForDocument('aadhaarCard', kind, `${baseLabel}-aadhaar-single`)}
                        subjectName={member.fullName.trim() || `Member ${memberNumber}`}
                        subjectGroup={getSubjectGroup(index)}
                        documentOwnerType={activeDocumentOwnerType}
                        proposerSequence={activeProposerSequence}
                        buttonText={member.aadhaarSingleId ? 'Replace Aadhaar Single' : 'Upload Aadhaar Single'}
                        onUploaded={(id) => updateMember(index, (current) => ({ ...current, aadhaarSingleId: id || current.aadhaarSingleId }))}
                      />
                      {renderDocumentActions(member.aadhaarSingleId)}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <DocumentUploadButton
                          label={`Member ${memberNumber} Aadhaar Front`}
                          documentType="aadhaarCard"
                          customLabel={`${baseLabel}-aadhaar-front`}
                          scope={getUploadScopeForDocument('aadhaarCard', kind, `${baseLabel}-aadhaar-front`)}
                          subjectName={member.fullName.trim() || `Member ${memberNumber}`}
                          subjectGroup={getSubjectGroup(index)}
                          documentOwnerType={activeDocumentOwnerType}
                          proposerSequence={activeProposerSequence}
                          buttonText={member.aadhaarFrontId ? 'Replace Aadhaar Front' : 'Upload Aadhaar Front'}
                          onUploaded={(id) => updateMember(index, (current) => ({ ...current, aadhaarFrontId: id || current.aadhaarFrontId }))}
                        />
                        {renderDocumentActions(member.aadhaarFrontId)}
                      </div>
                      <div>
                        <DocumentUploadButton
                          label={`Member ${memberNumber} Aadhaar Back`}
                          documentType="aadhaarCard"
                          customLabel={`${baseLabel}-aadhaar-back`}
                          scope={getUploadScopeForDocument('aadhaarCard', kind, `${baseLabel}-aadhaar-back`)}
                          subjectName={member.fullName.trim() || `Member ${memberNumber}`}
                          subjectGroup={getSubjectGroup(index)}
                          documentOwnerType={activeDocumentOwnerType}
                          proposerSequence={activeProposerSequence}
                          buttonText={member.aadhaarBackId ? 'Replace Aadhaar Back' : 'Upload Aadhaar Back'}
                          onUploaded={(id) => updateMember(index, (current) => ({ ...current, aadhaarBackId: id || current.aadhaarBackId }))}
                        />
                        {renderDocumentActions(member.aadhaarBackId)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-3">
                  <div className="required-label text-sm font-bold text-[#0D2B5E]">Diseases</div>
                  <select
                    value={member.diseaseMode}
                    onChange={(event) =>
                      updateMember(index, (current) => ({
                        ...current,
                        diseaseMode: event.target.value as DiseaseMode,
                        diseaseNamesText: '',
                        diseaseOtherText: '',
                        otherDiseaseSelected: false,
                      }))
                    }
                    className="w-full sm:w-80 px-4 py-3 rounded-xl border border-gray-200 text-sm"
                  >
                    <option value="notApplicable">Not Applicable</option>
                    <option value="listed">Applicable</option>
                  </select>

                  {member.diseaseMode === 'listed' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {COMMON_DISEASES.map((diseaseName) => {
                          const selectedDiseases = parseDiseaseNames(member.diseaseNamesText)
                          const checked = selectedDiseases.includes(diseaseName)
                          return (
                            <label key={diseaseName} className="inline-flex items-center gap-2 text-sm text-gray-700">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  updateMember(index, (current) => ({
                                    ...current,
                                    diseaseNamesText: toggleDiseaseName(current.diseaseNamesText, diseaseName),
                                  }))
                                }
                              />
                              {diseaseName}
                            </label>
                          )
                        })}
                        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                          <input
                            type="checkbox"
                            checked={member.otherDiseaseSelected}
                            onChange={() =>
                              updateMember(index, (current) => ({
                                ...current,
                                otherDiseaseSelected: !current.otherDiseaseSelected,
                                diseaseOtherText: current.otherDiseaseSelected ? '' : current.diseaseOtherText,
                              }))
                            }
                          />
                          Other
                        </label>
                      </div>
                      {member.otherDiseaseSelected && (
                        <input
                          value={member.diseaseOtherText}
                          onChange={(event) => updateMember(index, (current) => ({ ...current, diseaseOtherText: event.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm"
                          placeholder="Specify other disease"
                        />
                      )}
                    </div>
                  )}
                </div>

                {isPrimary && (
                  <div className="rounded-xl border border-orange-100 bg-orange-50/70 p-4 space-y-3">
                    <div className="required-label text-sm font-bold text-[#0D2B5E]">Primary Member Compulsory Documents</div>
                    <div className="flex flex-wrap gap-3">
                      <div>
                        <DocumentUploadButton
                          label="PAN Card"
                          documentType="panCard"
                          customLabel={`${baseLabel}-pan`}
                          scope={getUploadScopeForDocument('panCard', kind, `${baseLabel}-pan`)}
                          subjectName={member.fullName.trim() || 'Primary Member'}
                          subjectGroup={getSubjectGroup(index)}
                          documentOwnerType={activeDocumentOwnerType}
                          proposerSequence={activeProposerSequence}
                          buttonText={member.panCardDocumentId ? 'Replace PAN Card' : 'Upload PAN Card'}
                          onUploaded={(id) => updateMember(index, (current) => ({ ...current, panCardDocumentId: id || current.panCardDocumentId }))}
                        />
                        {renderDocumentActions(member.panCardDocumentId)}
                      </div>
                      <div>
                        <DocumentUploadButton
                          label="Cancelled Cheque/Passbook"
                          documentType="cancelledChequePassbook"
                          customLabel={`${baseLabel}-bank-proof`}
                          scope={getUploadScopeForDocument('cancelledChequePassbook', kind, `${baseLabel}-bank-proof`)}
                          subjectName={member.fullName.trim() || 'Primary Member'}
                          subjectGroup={getSubjectGroup(index)}
                          documentOwnerType={activeDocumentOwnerType}
                          proposerSequence={activeProposerSequence}
                          buttonText={member.bankProofDocumentId ? 'Replace Cancelled Cheque/Passbook' : 'Upload Cancelled Cheque/Passbook'}
                          onUploaded={(id) => updateMember(index, (current) => ({ ...current, bankProofDocumentId: id || current.bankProofDocumentId }))}
                        />
                        {renderDocumentActions(member.bankProofDocumentId)}
                      </div>
                    </div>

                    {kind === 'life' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((yearIndex) => (
                            <div key={`itr-wrap-${yearIndex}`}>
                              <DocumentUploadButton
                                key={`itr-${yearIndex}`}
                                label={`ITR Year ${yearIndex + 1}`}
                                documentType="itrDocument"
                                customLabel={`${baseLabel}-itr-year-${yearIndex + 1}`}
                                scope={getUploadScopeForDocument('itrDocument', kind, `${baseLabel}-itr-year-${yearIndex + 1}`)}
                                subjectName={member.fullName.trim() || 'Primary Member'}
                                subjectGroup={getSubjectGroup(index)}
                                documentOwnerType={activeDocumentOwnerType}
                                proposerSequence={activeProposerSequence}
                                buttonText={member.itrDocumentIds[yearIndex] ? `Replace ITR ${yearIndex + 1}` : `Upload ITR ${yearIndex + 1}`}
                                onUploaded={(id) =>
                                  updateMember(index, (current) => {
                                    const next = [...current.itrDocumentIds] as [string, string, string]
                                    next[yearIndex] = id || next[yearIndex]
                                    return { ...current, itrDocumentIds: next }
                                  })
                                }
                              />
                              {renderDocumentActions(member.itrDocumentIds[yearIndex])}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((yearIndex) => (
                            <div key={`computation-wrap-${yearIndex}`}>
                              <DocumentUploadButton
                                key={`computation-${yearIndex}`}
                                label={`Computation Year ${yearIndex + 1}`}
                                documentType="computationDocument"
                                customLabel={`${baseLabel}-computation-year-${yearIndex + 1}`}
                                scope={getUploadScopeForDocument('computationDocument', kind, `${baseLabel}-computation-year-${yearIndex + 1}`)}
                                subjectName={member.fullName.trim() || 'Primary Member'}
                                subjectGroup={getSubjectGroup(index)}
                                documentOwnerType={activeDocumentOwnerType}
                                proposerSequence={activeProposerSequence}
                                buttonText={member.computationDocumentIds[yearIndex] ? `Replace Computation ${yearIndex + 1}` : `Upload Computation ${yearIndex + 1}`}
                                onUploaded={(id) =>
                                  updateMember(index, (current) => {
                                    const next = [...current.computationDocumentIds] as [string, string, string]
                                    next[yearIndex] = id || next[yearIndex]
                                    return { ...current, computationDocumentIds: next }
                                  })
                                }
                              />
                              {renderDocumentActions(member.computationDocumentIds[yearIndex])}
                            </div>
                          ))}
                        </div>

                        <div className="required-label text-sm font-bold text-[#0D2B5E] pt-1">Nominee Documents</div>
                        <div className="flex flex-wrap gap-3">
                          <div>
                            <DocumentUploadButton
                              label="Nominee Aadhaar Card"
                              documentType="aadhaarCard"
                              customLabel={`${baseLabel}-nominee-aadhaar`}
                              scope={getUploadScopeForDocument('aadhaarCard', kind, `${baseLabel}-nominee-aadhaar`)}
                              subjectName="Nominee"
                              subjectGroup={getSubjectGroup(index, true)}
                              documentOwnerType={activeDocumentOwnerType}
                              proposerSequence={activeProposerSequence}
                              buttonText={member.nomineeAadhaarDocumentId ? 'Replace Nominee Aadhaar' : 'Upload Nominee Aadhaar'}
                              onUploaded={(id) => updateMember(index, (current) => ({ ...current, nomineeAadhaarDocumentId: id || current.nomineeAadhaarDocumentId }))}
                            />
                            {renderDocumentActions(member.nomineeAadhaarDocumentId)}
                          </div>
                          <div>
                            <DocumentUploadButton
                              label="Nominee PAN Card"
                              documentType="panCard"
                              customLabel={`${baseLabel}-nominee-pan`}
                              scope={getUploadScopeForDocument('panCard', kind, `${baseLabel}-nominee-pan`)}
                              subjectName="Nominee"
                              subjectGroup={getSubjectGroup(index, true)}
                              documentOwnerType={activeDocumentOwnerType}
                              proposerSequence={activeProposerSequence}
                              buttonText={member.nomineePanDocumentId ? 'Replace Nominee PAN' : 'Upload Nominee PAN'}
                              onUploaded={(id) => updateMember(index, (current) => ({ ...current, nomineePanDocumentId: id || current.nomineePanDocumentId }))}
                            />
                            {renderDocumentActions(member.nomineePanDocumentId)}
                          </div>
                          <div>
                            <DocumentUploadButton
                              label="Nominee Cancelled Cheque/Passbook"
                              documentType="cancelledChequePassbook"
                              customLabel={`${baseLabel}-nominee-bank-proof`}
                              scope={getUploadScopeForDocument('cancelledChequePassbook', kind, `${baseLabel}-nominee-bank-proof`)}
                              subjectName="Nominee"
                              subjectGroup={getSubjectGroup(index, true)}
                              documentOwnerType={activeDocumentOwnerType}
                              proposerSequence={activeProposerSequence}
                              buttonText={member.nomineeBankProofDocumentId ? 'Replace Nominee Cancelled Cheque/Passbook' : 'Upload Nominee Cancelled Cheque/Passbook'}
                              onUploaded={(id) => updateMember(index, (current) => ({ ...current, nomineeBankProofDocumentId: id || current.nomineeBankProofDocumentId }))}
                            />
                            {renderDocumentActions(member.nomineeBankProofDocumentId)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={!canAddMember}
              onClick={addMember}
              className="px-5 py-2.5 rounded-xl font-bold text-sm text-[#0D2B5E] border border-blue-200 hover:bg-blue-50 disabled:opacity-60"
            >
              Add Member
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-70"
              style={{ background: kind === 'health' ? 'linear-gradient(135deg, #FF6B00, #FF9A00)' : 'linear-gradient(135deg, #003366, #0066CC)' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
