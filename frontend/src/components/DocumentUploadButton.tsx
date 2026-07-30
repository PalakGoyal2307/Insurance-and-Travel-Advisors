import { useRef, useState } from 'react'
import { uploadDocument } from '../utils/documentApi'
import { ApiRequestError } from '../utils/api'
import type { AadhaarOcrPayload } from '../utils/aadhaarOcr'

interface Props {
  label: string
  documentType: string
  scope: 'profile' | 'health' | 'life' | 'general'
  applicationId?: string
  customLabel?: string
  subjectName?: string
  subjectGroup?: string
  buttonText: string
  onUploaded: (uploadedDocumentId?: string, uploadedFile?: File, aadhaarOcr?: AadhaarOcrPayload | null) => Promise<void> | void
}

export default function DocumentUploadButton({
  label,
  documentType,
  scope,
  applicationId,
  customLabel,
  subjectName,
  subjectGroup,
  buttonText,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setIsUploading(true)

    try {
      const response = await uploadDocument({
        file,
        scope,
        documentType,
        customLabel,
        applicationId,
        subjectName,
        subjectGroup,
      })
      await onUploaded(response.data.document.id, file, response.data.aadhaarOcr || null)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message)
      } else {
        setError(`Unable to upload ${label.toLowerCase()} right now.`)
      }
    } finally {
      setIsUploading(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 rounded-xl font-bold text-sm text-white disabled:opacity-70"
        style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
      >
        {isUploading ? 'Uploading...' : buttonText}
      </button>
      {error && <div className="mt-2 text-xs text-red-600">{error}</div>}
    </div>
  )
}
