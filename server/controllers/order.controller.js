import Order from '../models/Order.model.js'
import Merchant from '../models/Merchant.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const createOrder = async (req, res, next) => {
  try {
    const doc = await Order.create(req.body)
    return ApiResponse.success(res, { order: doc }, 'Order created', 201)
  } catch (err) {
    next(err)
  }
}

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.status) q.status = req.query.status
    if (req.query.merchant) q.merchant = req.query.merchant

    const [total, items] = await Promise.all([
      Order.countDocuments(q),
      Order.find(q).populate('merchant').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { orders: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getMyOrders = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const merchant = await Merchant.findOne({ user: req.user._id })
    const q = merchant ? { merchant: merchant._id } : { _id: null }

    const [total, items] = await Promise.all([
      Order.countDocuments(q),
      Order.find(q)
        .populate('merchant')
        .populate('shipment')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { orders: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getOrderById = async (req, res, next) => {
  try {
    const doc = await Order.findById(req.params.id).populate('merchant').populate('shipment')
    if (!doc) return ApiResponse.error(res, 'Order not found', 404)
    return ApiResponse.success(res, { order: doc })
  } catch (err) {
    next(err)
  }
}

export const updateOrder = async (req, res, next) => {
  try {
    const doc = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!doc) return ApiResponse.error(res, 'Order not found', 404)
    return ApiResponse.success(res, { order: doc }, 'Order updated')
  } catch (err) {
    next(err)
  }
}

export const deleteOrder = async (req, res, next) => {
  try {
    const doc = await Order.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', cancelReason: req.body?.cancelReason || 'Cancelled' },
      { new: true },
    )
    if (!doc) return ApiResponse.error(res, 'Order not found', 404)
    return ApiResponse.success(res, { order: doc }, 'Order cancelled')
  } catch (err) {
    next(err)
  }
}

export const setOrderStatus = async (req, res, next) => {
  try {
    const doc = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true })
    if (!doc) return ApiResponse.error(res, 'Order not found', 404)
    return ApiResponse.success(res, { order: doc }, 'Order status updated')
  } catch (err) {
    next(err)
  }
}

