import Merchant from '../models/Merchant.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const createMerchant = async (req, res, next) => {
  try {
    const doc = await Merchant.create(req.body)
    return ApiResponse.success(res, { merchant: doc }, 'Merchant created', 201)
  } catch (err) {
    next(err)
  }
}

export const getMerchants = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.contractStatus) q.contractStatus = req.query.contractStatus
    if (req.query.search) q.businessName = { $regex: req.query.search, $options: 'i' }

    const [total, items] = await Promise.all([
      Merchant.countDocuments(q),
      Merchant.find(q).populate('user', 'name email role').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { merchants: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getMerchantById = async (req, res, next) => {
  try {
    const doc = await Merchant.findById(req.params.id).populate('user', 'name email role')
    if (!doc) return ApiResponse.error(res, 'Merchant not found', 404)
    return ApiResponse.success(res, { merchant: doc })
  } catch (err) {
    next(err)
  }
}

export const updateMerchant = async (req, res, next) => {
  try {
    const doc = await Merchant.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return ApiResponse.error(res, 'Merchant not found', 404)
    return ApiResponse.success(res, { merchant: doc }, 'Merchant updated')
  } catch (err) {
    next(err)
  }
}

export const deleteMerchant = async (req, res, next) => {
  try {
    const doc = await Merchant.findByIdAndDelete(req.params.id)
    if (!doc) return ApiResponse.error(res, 'Merchant not found', 404)
    return ApiResponse.success(res, null, 'Merchant deleted')
  } catch (err) {
    next(err)
  }
}

export const setMerchantStatus = async (req, res, next) => {
  try {
    const doc = await Merchant.findByIdAndUpdate(req.params.id, { contractStatus: req.body.contractStatus }, { new: true })
    if (!doc) return ApiResponse.error(res, 'Merchant not found', 404)
    return ApiResponse.success(res, { merchant: doc }, 'Contract status updated')
  } catch (err) {
    next(err)
  }
}

