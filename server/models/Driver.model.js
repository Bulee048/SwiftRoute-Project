import mongoose from 'mongoose'
import { generateEmployeeId } from '../utils/generateIds.js'

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

const shiftSchema = new mongoose.Schema(
  { start: Date, end: Date, hoursWorked: Number },
  { _id: false },
)

const driverSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, unique: true, index: true },
    licenseNumber: { type: String, required: true },
    licenseExpiry: { type: Date },
    vehicleAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    currentLocation: { type: pointSchema, default: () => ({ type: 'Point', coordinates: [0, 0] }) },
    status: {
      type: String,
      enum: ['available', 'on_delivery', 'off_duty', 'on_leave'],
      default: 'off_duty',
    },
    totalDeliveries: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    joiningDate: { type: Date },
    documents: { type: [documentSchema], default: [] },
    shifts: { type: [shiftSchema], default: [] },
  },
  { timestamps: true },
)

driverSchema.index({ currentLocation: '2dsphere' })

driverSchema.pre('save', function preSave(next) {
  if (!this.employeeId) this.employeeId = generateEmployeeId()
  next()
})

export default mongoose.model('Driver', driverSchema)

