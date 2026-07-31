import type { ProfileDocumentItem } from '../utils/documentApi'
import { getDocumentDownloadUrl, getDocumentViewUrl } from '../utils/documentApi'

interface Props {
  title: string
  application: Record<string, unknown>
  uploadedDocuments: ProfileDocumentItem[]
  onClose: () => void
  hiddenFields?: string[]
}

const formatDate = (value: unknown) => {
  if (typeof value !== 'string' || !value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined || value === '') return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value
  return JSON.stringify(value)
}

const getDocumentTitle = (key: string) => {
  const title = key
    .replace(/Ids?$/g, '')
    .replace(/([A-Z])/g, ' $1')
    .trim()
  return title.charAt(0).toUpperCase() + title.slice(1)
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value)

export default function ApplicationDetailsModal({ title, application, uploadedDocuments, onClose, hiddenFields = [] }: Props) {
  const documentMap = new Map(uploadedDocuments.map((document) => [document.id, document]))
  const hiddenFieldSet = new Set(hiddenFields.map((field) => field.toLowerCase()))

  const renderDocumentLink = (documentId: string, label: string) => {
    const document = documentMap.get(documentId)
    return (
      <tr key={`${label}-${documentId}`} className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{label}</td>
        <td className="px-4 py-3 text-gray-700">{document?.originalFileName || documentId}</td>
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-2">
            <a href={getDocumentViewUrl(documentId)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">View</a>
            <a href={getDocumentDownloadUrl(documentId)} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#0D2B5E] border border-blue-200 hover:bg-blue-50">Download</a>
          </div>
        </td>
      </tr>
    )
  }

  const renderAadhaarRows = (aadhaar: Record<string, unknown>) => {
    const rows: JSX.Element[] = []
    const mode = String(aadhaar.mode || '')

    rows.push(
      <tr key="aadhaar-mode" className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">Aadhaar Mode</td>
        <td className="px-4 py-3 text-gray-700">{mode || 'N/A'}</td>
      </tr>
    )

    if (typeof aadhaar.singleDocumentId === 'string' && aadhaar.singleDocumentId) {
      rows.push(renderDocumentLink(aadhaar.singleDocumentId, 'Aadhaar Single Document'))
    }

    if (typeof aadhaar.frontDocumentId === 'string' && aadhaar.frontDocumentId) {
      rows.push(renderDocumentLink(aadhaar.frontDocumentId, 'Aadhaar Front Document'))
    }

    if (typeof aadhaar.backDocumentId === 'string' && aadhaar.backDocumentId) {
      rows.push(renderDocumentLink(aadhaar.backDocumentId, 'Aadhaar Back Document'))
    }

    return rows
  }

  const renderDiseasesRows = (diseases: Record<string, unknown>) => {
    const mode = String(diseases.mode || '')
    const names = Array.isArray(diseases.names) ? diseases.names.join(', ') : ''
    const otherText = String(diseases.otherText || '')

    return [
      <tr key="disease-mode" className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">Disease Mode</td>
        <td className="px-4 py-3 text-gray-700">{mode || 'N/A'}</td>
      </tr>,
      <tr key="disease-names" className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">Diseases</td>
        <td className="px-4 py-3 text-gray-700">{names || 'N/A'}</td>
      </tr>,
      <tr key="disease-other" className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">Other Disease</td>
        <td className="px-4 py-3 text-gray-700">{otherText || 'N/A'}</td>
      </tr>,
    ]
  }

  const renderMemberSection = (memberValue: unknown, sectionTitle: string) => {
    if (!isRecord(memberValue)) return null

    const member = memberValue
    const baseFields = [
      ['Member Number', member.memberNumber],
      ['Full Name', member.fullName],
      ['Address', member.address],
      ['Pincode', member.pincode],
      ['Relation', member.relation],
      ['Date of Birth', formatDate(member.dob)],
      ['Age', member.age],
      ['Height (Feet)', member.heightFeet],
      ['Height (Inch)', member.heightInch],
      ['Weight (Kg)', member.weightKg],
    ]

    const memberRows = baseFields.map(([label, value]) => (
      <tr key={`${sectionTitle}-${String(label)}`} className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{label}</td>
        <td className="px-4 py-3 text-gray-700">{formatValue(value)}</td>
      </tr>
    ))

    const documentRows: JSX.Element[] = []
    for (const [key, value] of Object.entries(member)) {
      if (typeof value === 'string' && key.endsWith('DocumentId') && value) {
        documentRows.push(renderDocumentLink(value, getDocumentTitle(key)))
      }
      if (Array.isArray(value) && key.endsWith('DocumentIds')) {
        value.forEach((id, index) => {
          if (typeof id === 'string' && id) {
            documentRows.push(renderDocumentLink(id, `${getDocumentTitle(key)} ${index + 1}`))
          }
        })
      }
    }

    const aadhaarRows = isRecord(member.aadhaar) ? renderAadhaarRows(member.aadhaar) : []
    const diseaseRows = isRecord(member.diseases) ? renderDiseasesRows(member.diseases) : []

    return (
      <div className="rounded-2xl border border-blue-100 overflow-hidden" key={sectionTitle}>
        <div className="bg-blue-50 px-4 py-3 text-sm font-bold text-[#0D2B5E]">{sectionTitle}</div>
        <table className="w-full text-sm">
          <tbody>
            {aadhaarRows}
            {memberRows}
            {diseaseRows}
            {documentRows}
          </tbody>
        </table>
      </div>
    )
  }

  const topLevelRows = Object.entries(application)
    .filter(([key, value]) => !['primaryMember', 'additionalMembers'].includes(key) && !hiddenFieldSet.has(key.toLowerCase()) && !Array.isArray(value) && !isRecord(value))
    .map(([key, value]) => (
      <tr key={key} className="border-t border-blue-100">
        <td className="px-4 py-3 font-semibold text-[#0D2B5E]">{getDocumentTitle(key)}</td>
        <td className="px-4 py-3 text-gray-700">{key.toLowerCase().includes('at') ? formatDate(value) : formatValue(value)}</td>
      </tr>
    ))

  const additionalMembers = Array.isArray(application.additionalMembers) ? application.additionalMembers : []

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-white border-b border-blue-100 px-5 py-4 sm:px-8 sm:py-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-[#0D2B5E] font-bold">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">Complete application details with documents.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="rounded-2xl border border-blue-100 overflow-hidden">
            <div className="bg-blue-50 px-4 py-3 text-sm font-bold text-[#0D2B5E]">Application Summary</div>
            <table className="w-full text-sm">
              <tbody>{topLevelRows}</tbody>
            </table>
          </div>

          {renderMemberSection(application.primaryMember, 'Primary Member')}

          {additionalMembers.map((member, index) =>
            renderMemberSection(member, `Additional Member ${index + 1}`)
          )}
        </div>
      </div>
    </div>
  )
}
