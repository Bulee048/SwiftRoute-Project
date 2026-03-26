import mongoose from 'mongoose'
import { generatePaymentId } from '../utils/generateIds.js'

const paymentSchema = new mongoose.Schema(
  {
    paymentId: { type: String, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['cod', 'online', 'wallet', 'bank_transfer', 'upi'], default: 'online' },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    gateway: { type: String, enum: ['razorpay', 'stripe', 'manual', 'cod'], default: 'manual' },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    receipt: String,
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    paidAt: Date,
  },
  { timestamps: true },
)

paymentSchema.pre('save', function preSave(next) {
  if (!this.paymentId) this.paymentId = generatePaymentId()
  next()
})

export default mongoose.model('Payment', paymentSchema)

