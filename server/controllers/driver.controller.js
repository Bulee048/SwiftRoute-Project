import Driver from '../models/Driver.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const createDriver = async (req, res, next) => {
  try {
    const doc = await Driver.create(req.body)
    return ApiResponse.success(res, { driver: doc }, 'Driver created', 201)
  } catch (err) {
    next(err)
  }
}

export const getDrivers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.status) q.status = req.query.status
    const [total, items] = await Promise.all([
      Driver.countDocuments(q),
      Driver.find(q).populate('user', 'name email role').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { drivers: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getAvailableDrivers = async (req, res, next) => {
  try {
    const items = await Driver.find({ status: 'available' }).populate('user', 'name email')
    return ApiResponse.success(res, { drivers: items })
  } catch (err) {
    next(err)
  }
}

export const getDriverById = async (req, res, next) => {
  try {
    const doc = await Driver.findById(req.params.id).populate('user', 'name email role')
    if (!doc) return ApiResponse.error(res, 'Driver not found', 404)
    return ApiResponse.success(res, { driver: doc })
  } catch (err) {
    next(err)
  }
}

export const updateDriver = async (req, res, next) => {
  try {
    const doc = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return ApiResponse.error(res, 'Driver not found', 404)
    return ApiResponse.success(res, { driver: doc }, 'Driver updated')
  } catch (err) {
    next(err)
  }
}

export const deleteDriver = async (req, res, next) => {
  try {
    const doc = await Driver.findByIdAndDelete(req.params.id)
    if (!doc) return ApiResponse.error(res, 'Driver not found', 404)
    return ApiResponse.success(res, null, 'Driver deleted')
  } catch (err) {
    next(err)
  }
}

export const setDriverStatus = async (req, res, next) => {
  try {
    const doc = await Driver.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!doc) return ApiResponse.error(res, 'Driver not found', 404)
    return ApiResponse.success(res, { driver: doc }, 'Driver status updated')
  } catch (err) {
    next(err)
  }
}

export const updateDriverLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body
    const doc = await Driver.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { type: 'Point', coordinates: [lng, lat] } },
      { new: true },
    )
    if (!doc) return ApiResponse.error(res, 'Driver not found', 404)
    const io = req.app.get('io')
    io?.emit('driver_location_broadcast', { driverId: doc._id, lat, lng })
    return ApiResponse.success(res, { driver: doc }, 'Location updated')
  } catch (err) {
    next(err)
  }
}

