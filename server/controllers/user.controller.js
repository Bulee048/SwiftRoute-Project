import { ApiResponse } from '../utils/ApiResponse.js'
import User from '../models/User.model.js'
import { buildPagination, getPagination } from '../utils/pagination.js'

export const summary = async (req, res) => {
  const [totalUsers, activeUsers] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true }),
  ])
  return ApiResponse.success(res, { totalUsers, activeUsers }, 'User stats')
}

export const getUsers = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req)
    const q = {}
    if (req.query.role) q.role = req.query.role
    if (req.query.search) {
      q.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ]
    }
    const [total, users] = await Promise.all([
      User.countDocuments(q),
      User.find(q).select('-password -refreshToken').skip(skip).limit(limit).sort({ createdAt: -1 }),
    ])
    return ApiResponse.paginated(res, { users }, buildPagination(total, page, limit))
  } catch (err) {
    next(err)
  }
}

