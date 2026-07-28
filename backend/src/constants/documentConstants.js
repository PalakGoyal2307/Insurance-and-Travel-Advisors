export const DOCUMENT_TYPES = {
  aadhaarCard: {
    label: 'Aadhaar Card',
    folderName: 'Aadhaar',
    reusable: true,
  },
  panCard: {
    label: 'PAN Card',
    folderName: 'PAN',
    reusable: true,
  },
  cancelledChequePassbook: {
    label: 'Cancelled Cheque/Passbook',
    folderName: 'Cancelled Cheque Passbook',
    reusable: true,
  },
  medicalReport: {
    label: 'Medical Report',
    folderName: 'Medical Reports',
    reusable: false,
  },
  itrDocument: {
    label: 'ITR Document',
    folderName: 'ITR Documents',
    reusable: false,
  },
  computationDocument: {
    label: 'Computation Document',
    folderName: 'Computation Documents',
    reusable: false,
  },
  vehicleRc: {
    label: 'Vehicle RC',
    folderName: 'Vehicle Documents',
    reusable: false,
  },
  policyDocument: {
    label: 'Existing Policy Document',
    folderName: 'Policy Documents',
    reusable: false,
  },
  other: {
    label: 'Other Document',
    folderName: 'Other Documents',
    reusable: false,
  },
}

export const DOCUMENT_SCOPES = {
  profile: 'Profile Documents',
  health: 'Health Insurance Documents',
  life: 'Life Insurance Documents',
  general: 'General Insurance Documents',
}

export const PROFILE_DOCUMENT_ORDER = [
  'aadhaarCard',
  'panCard',
  'cancelledChequePassbook',
]

export const APPLICATION_REQUIRED_DOCUMENTS = {
  health: ['aadhaarCard', 'panCard', 'cancelledChequePassbook', 'medicalReport'],
  life: ['aadhaarCard', 'panCard', 'cancelledChequePassbook', 'itrDocument', 'computationDocument'],
  general: ['aadhaarCard', 'panCard', 'policyDocument'],
}

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
