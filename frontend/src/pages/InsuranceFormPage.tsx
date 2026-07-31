import { useEffect, useMemo, useState } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL } from '../constants/contact'
import type { AuthUser } from '../utils/authApi'
import { getMyProfile } from '../utils/authApi'
import {
  createGeneralApplication,
  createHealthApplication,
  createLifeApplication,
  type InsuranceMemberPayload,
} from '../utils/insuranceApi'
import { APPLICATION_DOCUMENTS } from '../constants/documents'
import DocumentUploadButton from '../components/DocumentUploadButton'
import { getDocumentViewUrl, type ProfileDocumentItem } from '../utils/documentApi'
import MemberInsuranceModal from '../components/MemberInsuranceModal'

interface Props {
  navigate: (p: PageId) => void
  currentUser: AuthUser | null
  authReady: boolean
}

interface RequirementItem {
  documentType: string
  label: string
  status: 'already-uploaded' | 'required'
  document: {
    id: string
  } | null
}

interface GeneralFormState {
  fullName: string
  phone: string
  email: string
  primaryAddress: string
  primaryPincode: string
  city: string
  businessType: string
  coverageType: string
  requirements: string
}

const getNextProposerSequenceFromProfile = (profile: Awaited<ReturnType<typeof getMyProfile>>) => {
  let maxSequence = 0

  for (const document of profile.uploadedDocuments || []) {
    if (document.documentOwnerType === 'proposer') {
      maxSequence = Math.max(maxSequence, Number(document.proposerSequence) || 0)
    }
  }

  for (const moduleName of ['health', 'life'] as const) {
    for (const application of profile.applications?.[moduleName] || []) {
      if (application.proposerType === 'others') {
        maxSequence = Math.max(maxSequence, Number(application.proposerSequence) || 0)
      }
    }
  }

  return maxSequence + 1
}

function RequirementChecklist({
  requirements,
  scope,
  onRefresh,
}: {
  requirements: RequirementItem[]
  scope: 'health' | 'life' | 'general'
  onRefresh: () => Promise<void> | void
}) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
      <div className="text-[#0D2B5E] font-bold mb-3">Required Documents</div>
      <div className="space-y-3">
        {requirements.map((item) => {
          const alreadyUploaded = item.status === 'already-uploaded' && item.document
          const uploadScope = ['aadhaarCard', 'panCard', 'cancelledChequePassbook'].includes(item.documentType)
            ? 'profile'
            : scope

          return (
            <div key={item.documentType} className="rounded-xl bg-white border border-blue-100 p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-[#0D2B5E]">{item.label}</div>
                <div className="text-xs text-gray-500">{alreadyUploaded ? 'Already Uploaded' : 'Upload required'}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {alreadyUploaded && (
                  <a href={getDocumentViewUrl(item.document.id)} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-xl text-sm font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">
                    View
                  </a>
                )}
                <DocumentUploadButton
                  label={item.label}
                  documentType={item.documentType}
                  scope={uploadScope}
                  buttonText={alreadyUploaded ? 'Replace' : 'Upload'}
                  onUploaded={onRefresh}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getBackPage(action: string): PageId {
  if (action.startsWith('health-')) return 'insurance-health'
  if (action.startsWith('life-')) return 'insurance-life'
  if (action.startsWith('general-')) return 'insurance-general'
  return 'insurance'
}

export default function InsuranceFormPage({ navigate, currentUser, authReady }: Props) {
  const query = useMemo(() => new URLSearchParams(window.location.search), [window.location.search])
  const action = query.get('action') || 'health-quote'
  const selectedPlan = query.get('plan') || ''
  const backPage = getBackPage(action)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSent, setFormSent] = useState(false)
  const [existingDocuments, setExistingDocuments] = useState<ProfileDocumentItem[]>([])
  const [nextProposerSequence, setNextProposerSequence] = useState(1)
  const [requirements, setRequirements] = useState<RequirementItem[]>([])
  const [form, setForm] = useState<GeneralFormState>({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    primaryAddress: '',
    primaryPincode: '',
    city: '',
    businessType: '',
    coverageType: '',
    requirements: '',
  })

  useEffect(() => {
    if (!authReady) return
    if (!currentUser) {
      navigate('login')
      return
    }

    const bootstrap = async () => {
      try {
        const profile = await getMyProfile()
        setExistingDocuments(profile.uploadedDocuments || [])
        setNextProposerSequence(getNextProposerSequenceFromProfile(profile))
        setRequirements((profile.applicationRequirements?.general as RequirementItem[] | undefined) || [])
      } catch (_error) {
        setExistingDocuments([])
        setNextProposerSequence(1)
        setRequirements([])
      }
    }

    bootstrap()
  }, [authReady, currentUser, navigate])

  useEffect(() => {
    if (!currentUser) return
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || currentUser.fullName,
      phone: prev.phone || currentUser.phone,
      email: prev.email || currentUser.email,
    }))
  }, [currentUser])

  const loadGeneralRequirements = async () => {
    if (!currentUser) return
    const profile = await getMyProfile()
    setRequirements((profile.applicationRequirements?.general as RequirementItem[] | undefined) || [])
  }

  const handleHealthSubmit = async ({
    fullName,
    email,
    phone,
    proposerType,
    proposerSequence,
    primaryMember,
    additionalMembers,
  }: {
    fullName: string
    email: string
    phone: string
    proposerType: 'self' | 'others'
    proposerSequence?: number
    primaryMember: InsuranceMemberPayload
    additionalMembers: InsuranceMemberPayload[]
  }) => {
    const inquiryType = action === 'health-consultation' ? 'Health Insurance Consultation Request' : 'Health Insurance Quote Request'
    const planLabel = selectedPlan || 'General Health Insurance Consultation'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      `Selected Plan: ${planLabel}`,
      `Members Included: ${1 + additionalMembers.length}`,
      `Primary Member: ${primaryMember.fullName}`,
    ].join('\n')

    setIsSubmitting(true)
    setFormError('')

    try {
      await createHealthApplication({
        fullName,
        email,
        phone,
        proposerType,
        proposerSequence,
        primaryMember,
        additionalMembers,
        planName: planLabel,
        sourceContext: action === 'health-consultation' ? 'insurance:page:health-consultation' : 'insurance:page:health-quote',
      })

      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your health insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: action === 'health-consultation' ? 'insurance:page:health-consultation' : 'insurance:page:health-quote',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          member_count: String(1 + additionalMembers.length),
        },
        autoReplyTemplateParams: {
          phone,
          context: 'Health Insurance',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setTimeout(() => navigate(backPage), 1200)
    } catch (_error) {
      setFormError('Unable to submit health application right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLifeSubmit = async ({
    fullName,
    email,
    phone,
    proposerType,
    proposerSequence,
    primaryMember,
    additionalMembers,
  }: {
    fullName: string
    email: string
    phone: string
    proposerType: 'self' | 'others'
    proposerSequence?: number
    primaryMember: InsuranceMemberPayload
    additionalMembers: InsuranceMemberPayload[]
  }) => {
    const inquiryType = action === 'life-consultation' ? 'Life Insurance Consultation Request' : 'Life Insurance Quote Request'
    const planLabel = selectedPlan || 'General LIC Consultation'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      `Selected Plan: ${planLabel}`,
      `Members Included: ${1 + additionalMembers.length}`,
      `Primary Member: ${primaryMember.fullName}`,
    ].join('\n')

    setIsSubmitting(true)
    setFormError('')

    try {
      await createLifeApplication({
        fullName,
        email,
        phone,
        proposerType,
        proposerSequence,
        primaryMember,
        additionalMembers,
        planName: planLabel,
        sourceContext: action === 'life-consultation' ? 'insurance:page:life-consultation' : 'insurance:page:life-quote',
      })

      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your life insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: action === 'life-consultation' ? 'insurance:page:life-consultation' : 'insurance:page:life-quote',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          member_count: String(1 + additionalMembers.length),
        },
        autoReplyTemplateParams: {
          phone,
          context: 'Life Insurance',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setTimeout(() => navigate(backPage), 1200)
    } catch (_error) {
      setFormError('Unable to submit life application right now. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGeneralSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const primaryAddress = form.primaryAddress.trim()
    const primaryPincode = form.primaryPincode.trim()
    const city = form.city.trim()
    const businessType = form.businessType.trim()
    const coverageType = form.coverageType.trim()
    const requirementsText = form.requirements.trim()

    if (!fullName || !phone || !email || !primaryAddress || !primaryPincode) {
      setFormError('Please fill all required fields.')
      return
    }

    if (!/^\d{6}$/.test(primaryPincode)) {
      setFormError('Please enter a valid 6-digit pincode.')
      return
    }

    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid phone number with 10 to 15 digits.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.')
      return
    }

    setFormError('')
    setIsSubmitting(true)

    const inquiryType = action === 'general-audit' ? 'General Insurance Audit Request' : 'General Insurance Enquiry Request'
    const planLabel = selectedPlan || 'General Insurance Audit'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      `Insurance Type: General Insurance`,
      `Selected Plan: ${planLabel}`,
      `Full Name: ${fullName}`,
      `Primary Address: ${primaryAddress}`,
      `Primary Pincode: ${primaryPincode}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `City: ${city || 'N/A'}`,
      `Business Type: ${businessType || 'N/A'}`,
      `Coverage Type: ${coverageType || 'N/A'}`,
      `Requirements: ${requirementsText || 'N/A'}`,
    ].join('\n')

    try {
      try {
        await createGeneralApplication({
          fullName,
          email,
          phone,
          primaryAddress,
          primaryPincode,
          city,
          businessType,
          coverageType,
          planName: planLabel,
          requirements: requirementsText,
          sourceContext: action === 'general-audit' ? 'insurance:page:general-audit' : 'insurance:page:general-enquiry',
        })
      } catch (_backendError) {
        // Fallback to email only if API write fails.
      }

      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your general insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: action === 'general-audit' ? 'insurance:page:general-audit' : 'insurance:page:general-enquiry',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          primary_address: primaryAddress,
          primary_pincode: primaryPincode,
          city: city || 'N/A',
          business_type: businessType || 'N/A',
          coverage_type: coverageType || 'N/A',
          requirements: requirementsText || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: 'General Insurance',
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        primaryAddress: '',
        primaryPincode: '',
        city: '',
        businessType: '',
        coverageType: '',
        requirements: '',
      })
      setTimeout(() => navigate(backPage), 1200)
    } catch (_error) {
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      navigate(backPage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!authReady || !currentUser) {
    return null
  }

  if (action.startsWith('health-')) {
    return (
      <MemberInsuranceModal
        variant="page"
        kind="health"
        planLabel={selectedPlan || 'General Health Insurance Consultation'}
        existingDocuments={existingDocuments}
        nextProposerSequence={nextProposerSequence}
        prefillUser={currentUser ? { fullName: currentUser.fullName, email: currentUser.email, phone: currentUser.phone } : null}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        successMessage={formSent ? 'Health insurance application submitted successfully.' : ''}
        onClose={() => navigate(backPage)}
        onSubmit={handleHealthSubmit}
      />
    )
  }

  if (action.startsWith('life-')) {
    return (
      <MemberInsuranceModal
        variant="page"
        kind="life"
        planLabel={selectedPlan || 'General LIC Consultation'}
        existingDocuments={existingDocuments}
        nextProposerSequence={nextProposerSequence}
        prefillUser={currentUser ? { fullName: currentUser.fullName, email: currentUser.email, phone: currentUser.phone } : null}
        isSubmitting={isSubmitting}
        errorMessage={formError}
        successMessage={formSent ? 'Life insurance application submitted successfully.' : ''}
        onClose={() => navigate(backPage)}
        onSubmit={handleLifeSubmit}
      />
    )
  }

  return (
    <div className="pt-20 pb-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(backPage)} className="flex items-center gap-2 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors mb-6">
          ← Back
        </button>

        <div className="bg-white rounded-3xl border border-teal-100 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-teal-100 bg-gradient-to-r from-[#005555] to-[#00897B] text-white">
            <h1 className="font-display text-3xl font-bold">{action === 'general-audit' ? 'General Insurance Audit' : 'General Insurance Enquiry'}</h1>
            <p className="text-white/80 text-sm mt-2">Complete this form and our advisors will connect with tailored recommendations.</p>
          </div>

          <form onSubmit={handleGeneralSubmit} className="p-6 sm:p-8 space-y-4">
            {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">General insurance request sent successfully.</div>}
            {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-[#0D2B5E]">
              Selected Plan: <span className="font-bold">{selectedPlan || 'General Insurance Audit'}</span>
            </div>

            <RequirementChecklist
              requirements={requirements.length ? requirements : APPLICATION_DOCUMENTS.general.map((item) => ({ ...item, status: 'required' as const, document: null }))}
              scope="general"
              onRefresh={loadGeneralRequirements}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={form.fullName} onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
              <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
              <input value={form.primaryAddress} onChange={(e) => setForm((prev) => ({ ...prev, primaryAddress: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Primary Member Address*" required />
              <input value={form.primaryPincode} onChange={(e) => setForm((prev) => ({ ...prev, primaryPincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Primary Member Pincode*" inputMode="numeric" pattern="\d{6}" required />
              <input value={form.city} onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="City (Optional)" />
              <input value={form.businessType} onChange={(e) => setForm((prev) => ({ ...prev, businessType: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Business Type (Optional)" />
              <input value={form.coverageType} onChange={(e) => setForm((prev) => ({ ...prev, coverageType: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Coverage Type (Optional)" />
            </div>

            <textarea value={form.requirements} onChange={(e) => setForm((prev) => ({ ...prev, requirements: e.target.value }))} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Requirements / Asset Details (Optional)" />

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
              {isSubmitting ? 'Sending...' : action === 'general-audit' ? 'Submit Audit Request' : 'Submit Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
