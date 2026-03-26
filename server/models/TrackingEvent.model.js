import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema(
  {
    address: String,
    city: String,
    coordinates: { type: [Number], default: [] }, // [lng, lat]
  },
  { _id: false },
)

const trackingEventSchema = new mongoose.Schema(
  {
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true, index: true },
    status: { type: String, required: true },
    description: { type: String },
    location: locationSchema,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now, index: true },
    eventType: { type: String, enum: ['system', 'driver', 'admin', 'auto'], default: 'system' },
  },
  { timestamps: false },
)

export default mongoose.model('TrackingEvent', trackingEventSchema)

