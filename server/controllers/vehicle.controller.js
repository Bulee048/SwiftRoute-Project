import Vehicle from '../models/Vehicle.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const createVehicle = async (req, res, next) => {
  try {
    const doc = await Vehicle.create(req.body)
    return ApiResponse.success(res, { vehicle: doc }, 'Vehicle created', 201)
  } catch (err) {
    next(err)
  }
}

export const getVehicles = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.status) q.status = req.query.status
    if (req.query.type) q.type = req.query.type

    const [total, items] = await Promise.all([
      Vehicle.countDocuments(q),
      Vehicle.find(q).skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { vehicles: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getVehicleById = async (req, res, next) => {
  try {
    const doc = await Vehicle.findById(req.params.id)
    if (!doc) return ApiResponse.error(res, 'Vehicle not found', 404)
    return ApiResponse.success(res, { vehicle: doc })
  } catch (err) {
    next(err)
  }
}

export const updateVehicle = async (req, res, next) => {
  try {
    const doc = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return ApiResponse.error(res, 'Vehicle not found', 404)
    return ApiResponse.success(res, { vehicle: doc }, 'Vehicle updated')
  } catch (err) {
    next(err)
  }
}

export const deleteVehicle = async (req, res, next) => {
  try {
    const doc = await Vehicle.findByIdAndDelete(req.params.id)
    if (!doc) return ApiResponse.error(res, 'Vehicle not found', 404)
    return ApiResponse.success(res, null, 'Vehicle deleted')
  } catch (err) {
    next(err)
  }
}

export const setVehicleStatus = async (req, res, next) => {
  try {
    const doc = await Vehicle.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!doc) return ApiResponse.error(res, 'Vehicle not found', 404)
    return ApiResponse.success(res, { vehicle: doc }, 'Vehicle status updated')
  } catch (err) {
    next(err)
  }
}

