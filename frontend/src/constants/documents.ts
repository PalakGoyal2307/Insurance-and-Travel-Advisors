export const PROFILE_DOCUMENTS = [
  { documentType: 'aadhaarCard', label: 'Aadhaar Card' },
  { documentType: 'panCard', label: 'PAN Card' },
  { documentType: 'cancelledChequePassbook', label: 'Cancelled Cheque/Passbook' },
]

export const APPLICATION_DOCUMENTS = {
  health: [
    { documentType: 'aadhaarCard', label: 'Aadhaar Card' },
    { documentType: 'panCard', label: 'PAN Card' },
    { documentType: 'cancelledChequePassbook', label: 'Cancelled Cheque/Passbook' },
    { documentType: 'medicalReport', label: 'Medical Report' },
  ],
  life: [
    { documentType: 'aadhaarCard', label: 'Aadhaar Card' },
    { documentType: 'panCard', label: 'PAN Card' },
    { documentType: 'cancelledChequePassbook', label: 'Cancelled Cheque/Passbook' },
    { documentType: 'itrDocument', label: 'ITR Documents' },
    { documentType: 'computationDocument', label: 'Computation Documents' },
  ],
  general: [
    { documentType: 'aadhaarCard', label: 'Aadhaar Card' },
    { documentType: 'panCard', label: 'PAN Card' },
    { documentType: 'policyDocument', label: 'Existing Policy Document' },
  ],
} as const
