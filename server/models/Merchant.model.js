import mongoose from 'mongoose'

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  { _id: false },
)

const documentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const merchantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    businessName: { type: String, required: true, trim: true },
    businessType: {
      type: String,
      enum: ['retail', 'wholesale', 'ecommerce', 'restaurant', 'pharmacy', 'other'],
      default: 'other',
    },
    gstin: { type: String },
    logo: { type: String },
    website: { type: String },
    businessAddress: addressSchema,
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    contractStatus: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    documents: { type: [documentSchema], default: [] },
  },
  { timestamps: true },
)

export default mongoose.model('Merchant', merchantSchema)

