import Payment from '../models/Payment.model.js'
import Merchant from '../models/Merchant.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const getPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.status) q.status = req.query.status
    const [total, items] = await Promise.all([
      Payment.countDocuments(q),
      Payment.find(q).populate('order merchant').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { payments: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getMyPayments = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)

    const merchant = await Merchant.findOne({ user: req.user._id })
    if (!merchant) {
      return ApiResponse.paginated(res, { payments: [] }, buildPagination(0, page, limit))
    }

    const q = { merchant: merchant._id }
    if (req.query.status) q.status = req.query.status

    const [total, items] = await Promise.all([
      Payment.countDocuments(q),
      Payment.find(q)
        .populate({ path: 'order', populate: 'shipment' })
        .populate('merchant')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
    ])

    return ApiResponse.paginated(res, { payments: items }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

export const getPaymentById = async (req, res, next) => {
  try {
    const doc = await Payment.findById(req.params.id).populate('order merchant')
    if (!doc) return ApiResponse.error(res, 'Payment not found', 404)
    return ApiResponse.success(res, { payment: doc })
  } catch (err) {
    next(err)
  }
}

export const overview = async (req, res, next) => {
  try {
    const [successful, pending, revenueAgg] = await Promise.all([
      Payment.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'pending' }),
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    const revenue = revenueAgg?.[0]?.total || 0

    return ApiResponse.success(
      res,
      { revenue, successful, pending },
      'Revenue overview'
    )
  } catch (err) {
    next(err)
  }
}

