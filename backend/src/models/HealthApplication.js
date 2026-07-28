import mongoose from 'mongoose'

const aadhaarSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['single', 'frontBack'],
      required: true,
    },
    singleDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    frontDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    backDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: false }
)

const diseaseSchema = new mongoose.Schema(
  {
    mode: {
      type: String,
      enum: ['notApplicable', 'listed', 'other'],
      required: true,
    },
    names: {
      type: [String],
      default: [],
    },
    otherText: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
)

const memberSchema = new mongoose.Schema(
  {
    memberNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    address: {
      type: String,
      trim: true,
      maxlength: 250,
      required() {
        return this.memberNumber === 1
      },
      default: '',
    },
    pincode: {
      type: String,
      trim: true,
      match: /^\d{6}$/,
      required() {
        return this.memberNumber === 1
      },
      default: '',
    },
    relation: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
      enum: ['', 'Father', 'Mother', 'Children', 'Spouse', 'Mother-in-law', 'Father-in-law'],
    },
    heightFeet: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    heightInch: {
      type: Number,
      required: true,
      min: 0,
      max: 11,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 1,
      max: 400,
    },
    dob: {
      type: Date,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    aadhaar: {
      type: aadhaarSchema,
      required: true,
    },
    diseases: {
      type: diseaseSchema,
      required: true,
    },
    panCardDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    bankProofDocumentId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: false }
)

const healthApplicationSchema = new mongoose.Schema(
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
    planName: {
      type: String,
      trim: true,
      default: '',
    },
    sourceContext: {
      type: String,
      trim: true,
      default: 'insurance:popup:health',
    },
    primaryMember: {
      type: memberSchema,
      required: true,
    },
    additionalMembers: {
      type: [memberSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length <= 3,
        message: 'Up to 3 additional members are allowed',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const HealthApplication = mongoose.model('HealthApplication', healthApplicationSchema)
