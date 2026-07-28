import mongoose from 'mongoose'

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    scope: {
      type: String,
      enum: ['profile', 'health', 'life', 'general'],
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      index: true,
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    customLabel: {
      type: String,
      trim: true,
      default: '',
    },
    originalFileName: {
      type: String,
      required: true,
    },
    storedFileName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    googleDriveFileId: {
      type: String,
      required: true,
      index: true,
    },
    googleDriveFolderId: {
      type: String,
      required: true,
    },
    googleDriveViewUrl: {
      type: String,
      required: true,
    },
    googleDriveDownloadUrl: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    replacedDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

documentSchema.index(
  { userId: 1, scope: 1, documentType: 1, applicationId: 1, customLabel: 1, isActive: 1 },
  { name: 'document_lookup_index' }
)

export const Document = mongoose.model('Document', documentSchema)
