import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization?.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    const user = await User.findById(decoded.id).select('-password -refreshToken')
    if (!user || !user.isActive) return res.status(401).json({ message: 'User not found or inactive' })

    req.user = user
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' })
  }
}

