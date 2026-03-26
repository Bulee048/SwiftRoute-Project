import mongoose from 'mongoose'
import { generateTrackingId } from '../utils/generateIds.js'

const locationSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    coordinates: { type: [Number], default: [] }, // [lng, lat]
  },
  { _id: false },
)

const routePointSchema = new mongoose.Schema(
  { lat: Number, lng: Number, timestamp: { type: Date, default: Date.now } },
  { _id: false },
)

const shipmentSchema = new mongoose.Schema(
  {
    trackingId: { type: String, unique: true, index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null, index: true },
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    merchant: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true, index: true },
    status: {
      type: String,
      enum: [
        'created',
        'assigned',
        'picked_up',
        'in_transit',
        'hub_received',
        'out_for_delivery',
        'delivered',
        'failed_delivery',
        'returned',
      ],
      default: 'created',
      index: true,
    },
    origin: locationSchema,
    destination: locationSchema,
    currentLocation: {
      address: String,
      coordinates: { type: [Number], default: [] },
      updatedAt: { type: Date, default: Date.now },
    },
    estimatedDelivery: Date,
    actualDelivery: Date,
    route: { type: [routePointSchema], default: [] },
    checkpoints: { type: [mongoose.Schema.Types.ObjectId], ref: 'TrackingEvent', default: [] },
    distance: Number,
    deliveryAttempts: { type: Number, default: 0 },
    notes: {
      type: [
        {
          text: String,
          by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

shipmentSchema.pre('save', function preSave(next) {
  if (!this.trackingId) this.trackingId = generateTrackingId()
  next()
})

export default mongoose.model('Shipment', shipmentSchema)

