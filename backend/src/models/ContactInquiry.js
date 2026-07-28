import mongoose from 'mongoose'

const contactInquirySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
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
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    context: {
      type: String,
      default: 'general',
      index: true,
    },
    source: {
      type: String,
      enum: ['website', 'google-form'],
      default: 'website',
      index: true,
    },
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const ContactInquiry = mongoose.model('ContactInquiry', contactInquirySchema)
