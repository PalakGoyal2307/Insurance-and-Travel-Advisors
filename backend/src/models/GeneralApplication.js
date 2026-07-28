import mongoose from 'mongoose'

const generalApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    primaryAddress: {
      type: String,
      required: true,
      trim: true,
    },
    primaryPincode: {
      type: String,
      required: true,
      trim: true,
      match: /^\d{6}$/,
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    businessType: {
      type: String,
      trim: true,
      default: '',
    },
    coverageType: {
      type: String,
      trim: true,
      default: '',
    },
    planName: {
      type: String,
      trim: true,
      default: '',
    },
    requirements: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
      index: true,
    },
    sourceContext: {
      type: String,
      trim: true,
      default: 'insurance:popup:general',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const GeneralApplication = mongoose.model('GeneralApplication', generalApplicationSchema)
