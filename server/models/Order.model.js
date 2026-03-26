import mongoose from 'mongoose'
import { generateOrderId } from '../utils/generateIds.js'

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
    landmark: String,
    coordinates: { type: [Number], default: [] }, // [lng, lat]
  },
  { _id: false },
)

const itemSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    quantity: Number,
    weight: Number,
    value: Number,
  },
  { _id: false },
)

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: addressSchema,
    },
    items: { type: [itemSchema], default: [] },
    packageDetails: {
      totalWeight: Number,
      dimensions: { length: Number, width: Number, height: Number },
      fragile: Boolean,
      specialInstructions: String,
    },
    pickupAddress: addressSchema,
    deliveryAddress: addressSchema,
    pickupScheduled: Date,
    deliveryDeadline: Date,
    priority: { type: String, enum: ['standard', 'express', 'same_day'], default: 'standard' },
    status: {
      type: String,
      enum: [
        'draft',
        'placed',
        'confirmed',
        'pickup_scheduled',
        'picked_up',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'failed',
        'cancelled',
        'returned',
      ],
      default: 'draft',
      index: true,
    },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', default: null },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    amount: {
      subtotal: Number,
      tax: Number,
      deliveryCharge: Number,
      discount: Number,
      total: Number,
    },
    notes: String,
    proofOfDelivery: {
      photo: String,
      signature: String,
      receivedBy: String,
      timestamp: Date,
    },
    cancelReason: String,
  },
  { timestamps: true },
)

orderSchema.pre('save', function preSave(next) {
  if (!this.orderId) this.orderId = generateOrderId()
  next()
})

export default mongoose.model('Order', orderSchema)

