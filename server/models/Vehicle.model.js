import mongoose from 'mongoose'

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  { _id: false },
)

const documentSchema = new mongoose.Schema(
  { name: String, url: String },
  { _id: false },
)

const vehicleSchema = new mongoose.Schema(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ['bike', 'auto', 'van', 'truck', 'mini_truck', 'container'], required: true },
    brand: String,
    model: String,
    year: Number,
    color: String,
    capacity: {
      weight: { type: Number },
      volume: { type: Number },
    },
    assignedDriver: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', default: null },
    status: { type: String, enum: ['active', 'maintenance', 'retired', 'unassigned'], default: 'unassigned' },
    insuranceNumber: String,
    insuranceExpiry: Date,
    registrationExpiry: Date,
    lastServiced: Date,
    fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'cng'] },
    currentLocation: { type: pointSchema, default: () => ({ type: 'Point', coordinates: [0, 0] }) },
    documents: { type: [documentSchema], default: [] },
  },
  { timestamps: true },
)

vehicleSchema.index({ currentLocation: '2dsphere' })

export default mongoose.model('Vehicle', vehicleSchema)

