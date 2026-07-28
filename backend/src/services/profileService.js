import { Document } from '../models/Document.js'
import { HealthApplication } from '../models/HealthApplication.js'
import { LifeApplication } from '../models/LifeApplication.js'
import { GeneralApplication } from '../models/GeneralApplication.js'
import { PROFILE_DOCUMENT_ORDER, DOCUMENT_TYPES, APPLICATION_REQUIRED_DOCUMENTS } from '../constants/documentConstants.js'

const mapDocument = (document) => ({
  id: document._id,
  scope: document.scope,
  documentType: document.documentType,
  label: DOCUMENT_TYPES[document.documentType]?.label || document.customLabel || document.documentType,
  customLabel: document.customLabel,
  originalFileName: document.originalFileName,
  mimeType: document.mimeType,
  fileSize: document.fileSize,
  googleDriveFileId: document.googleDriveFileId,
  googleDriveViewUrl: document.googleDriveViewUrl,
  googleDriveDownloadUrl: document.googleDriveDownloadUrl,
  uploadedAt: document.createdAt,
  updatedAt: document.updatedAt,
})

const mapApplication = (application, moduleName) => ({
  id: application._id,
  module: moduleName,
  status: application.status,
  planName: application.planName,
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
  fullName: application.fullName,
  email: application.email,
  phone: application.phone,
  sourceContext: application.sourceContext,
  city: application.city,
  businessType: application.businessType,
  coverageType: application.coverageType,
  requirements: application.requirements,
  primaryMember: application.primaryMember,
  additionalMembers: application.additionalMembers,
})

export const buildProfileBundle = async (userId) => {
  const [documents, healthApplications, lifeApplications, generalApplications] = await Promise.all([
    Document.find({ userId, isActive: true }).sort({ createdAt: -1 }).lean(),
    HealthApplication.find({ userId }).sort({ createdAt: -1 }).lean(),
    LifeApplication.find({ userId }).sort({ createdAt: -1 }).lean(),
    GeneralApplication.find({ userId }).sort({ createdAt: -1 }).lean(),
  ])

  const documentsByKey = new Map()
  const documentsByType = new Map()
  for (const document of documents) {
    documentsByKey.set(`${document.scope}:${document.documentType}:${document.applicationId || 'shared'}`, document)
    if (!documentsByType.has(document.documentType)) {
      documentsByType.set(document.documentType, document)
    }
  }

  const reusableDocuments = PROFILE_DOCUMENT_ORDER.map((documentType) => {
    const document = documentsByType.get(documentType) || documentsByKey.get(`profile:${documentType}:shared`)
    return {
      documentType,
      label: DOCUMENT_TYPES[documentType]?.label || documentType,
      status: document ? 'already-uploaded' : 'missing',
      document: document ? mapDocument(document) : null,
    }
  })

  const applicationCollections = {
    health: healthApplications.map((item) => mapApplication(item, 'health')),
    life: lifeApplications.map((item) => mapApplication(item, 'life')),
    general: generalApplications.map((item) => mapApplication(item, 'general')),
  }

  const applicationRequirements = Object.entries(APPLICATION_REQUIRED_DOCUMENTS).reduce((accumulator, [moduleName, documentTypes]) => {
    accumulator[moduleName] = documentTypes.map((documentType) => {
      const isReusable = Boolean(DOCUMENT_TYPES[documentType]?.reusable)
      const sharedDocument = isReusable
        ? documentsByType.get(documentType) ||
          documentsByKey.get(`profile:${documentType}:shared`) ||
          documentsByKey.get(`${moduleName}:${documentType}:shared`)
        : documentsByKey.get(`${moduleName}:${documentType}:shared`) ||
          documentsByKey.get(`profile:${documentType}:shared`)
      return {
        documentType,
        label: DOCUMENT_TYPES[documentType]?.label || documentType,
        status: sharedDocument ? 'already-uploaded' : 'required',
        document: sharedDocument ? mapDocument(sharedDocument) : null,
      }
    })
    return accumulator
  }, {})

  return {
    reusableDocuments,
    applications: applicationCollections,
    applicationRequirements,
    uploadedDocuments: documents.map(mapDocument),
    summary: {
      totalUploadedDocuments: documents.length,
      totalHealthApplications: healthApplications.length,
      totalLifeApplications: lifeApplications.length,
      totalGeneralApplications: generalApplications.length,
    },
  }
}
