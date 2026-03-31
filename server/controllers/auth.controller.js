import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.model.js'
import Merchant from '../models/Merchant.model.js'
import Driver from '../models/Driver.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { getCookieOptions } from '../utils/cookies.js'
import { randomTokenHex, sha256Hex } from '../utils/crypto.js'
import { signAccessToken, signRefreshToken } from '../utils/generateToken.js'

function handleValidation(req) {
  const result = validationResult(req)
  if (!result.isEmpty()) {
    const err = new Error('Validation error')
    err.statusCode = 400
    err.details = result.array()
    throw err
  }
}

function toPublicUser(user) {
  const u = user.toObject ? user.toObject() : user
  delete u.password
  delete u.refreshToken
  delete u.resetPasswordToken
  delete u.resetPasswordExpires
  return u
}

export const register = async (req, res, next) => {
  try {
    handleValidation(req)
    const { name, email, password, phone, role } = req.body

    const exists = await User.findOne({ email: email.toLowerCase() })
    if (exists) return ApiResponse.error(res, 'Email already in use', 400)

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      phone,
      role: role || 'customer',
      isVerified: true,
      isActive: true,
    })

    // Auto-provision merchant/driver profiles so their dashboards work out of the box.
    if (user.role === 'merchant') {
      await Merchant.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            businessName: `${user.name}'s Business`,
            businessType: 'ecommerce',
            contractStatus: 'pending',
          },
        },
        { upsert: true, new: true },
      )
    } else if (user.role === 'driver') {
      await Driver.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            licenseNumber: `TEMP-${Date.now()}`,
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'off_duty',
          },
        },
        { upsert: true, new: true },
      )
    }

    const accessToken = signAccessToken({ id: user._id })
    const refreshToken = signRefreshToken({ id: user._id })
    user.refreshToken = sha256Hex(refreshToken)
    await user.save()

    res.cookie('refreshToken', refreshToken, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    })

    return ApiResponse.success(res, { user: toPublicUser(user), accessToken }, 'Registered', 201)
  } catch (err) {
    next(err)
  }
}

export const login = async (req, res, next) => {
  try {
    handleValidation(req)
    const { email, password } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return ApiResponse.error(res, 'Invalid credentials', 401)
    if (!user.isActive) return ApiResponse.error(res, 'User inactive', 401)

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) return ApiResponse.error(res, 'Invalid credentials', 401)

    // If this user role existed before we added auto-provisioning, ensure
    // the linked profile docs exist so dashboards can work.
    if (user.role === 'merchant') {
      await Merchant.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            businessName: `${user.name}'s Business`,
            businessType: 'ecommerce',
            contractStatus: 'pending',
          },
        },
        { upsert: true, new: true },
      )
    } else if (user.role === 'driver') {
      await Driver.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            licenseNumber: `TEMP-${Date.now()}`,
            licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            status: 'off_duty',
          },
        },
        { upsert: true, new: true },
      )
    }

    user.lastLogin = new Date()
    const accessToken = signAccessToken({ id: user._id })
    const refreshToken = signRefreshToken({ id: user._id })
    user.refreshToken = sha256Hex(refreshToken)
    await user.save()

    res.cookie('refreshToken', refreshToken, {
      ...getCookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    })

    return ApiResponse.success(res, { user: toPublicUser(user), accessToken }, 'Logged in')
  } catch (err) {
    next(err)
  }
}

export const logout = async (req, res, next) => {
  try {
    const refresh = req.cookies?.refreshToken
    if (refresh) {
      const decoded = jwt.decode(refresh)
      if (decoded?.id) {
        await User.findByIdAndUpdate(decoded.id, { $unset: { refreshToken: 1 } })
      }
    }
    res.clearCookie('refreshToken', getCookieOptions())
    res.clearCookie('accessToken', getCookieOptions())
    return ApiResponse.success(res, null, 'Logged out')
  } catch (err) {
    next(err)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken
    if (!token) return ApiResponse.error(res, 'No refresh token', 401)

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || !user.isActive) return ApiResponse.error(res, 'User not found or inactive', 401)

    const tokenHash = sha256Hex(token)
    if (!user.refreshToken || user.refreshToken !== tokenHash) {
      return ApiResponse.error(res, 'Refresh token mismatch', 401)
    }

    const accessToken = signAccessToken({ id: user._id })
    res.cookie('accessToken', accessToken, {
      ...getCookieOptions(),
      maxAge: 15 * 60 * 1000,
    })
    return ApiResponse.success(res, { accessToken }, 'Refreshed')
  } catch (err) {
    next(err)
  }
}

export const me = async (req, res) => {
  return ApiResponse.success(res, { user: req.user }, 'Current user')
}

export const updateProfile = async (req, res, next) => {
  try {
    handleValidation(req)
    const { name, phone, avatar, address } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { ...(name && { name }), ...(phone && { phone }), ...(avatar && { avatar }), ...(address && { address }) } },
      { new: true },
    ).select('-password -refreshToken')

    return ApiResponse.success(res, { user }, 'Profile updated')
  } catch (err) {
    next(err)
  }
}

export const updatePassword = async (req, res, next) => {
  try {
    handleValidation(req)
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    const ok = await bcrypt.compare(currentPassword, user.password)
    if (!ok) return ApiResponse.error(res, 'Current password incorrect', 400)
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return ApiResponse.success(res, null, 'Password updated')
  } catch (err) {
    next(err)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    handleValidation(req)
    const { email } = req.body
    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return ApiResponse.success(res, null, 'If the email exists, a reset link was sent')

    const token = randomTokenHex(32)
    user.resetPasswordToken = sha256Hex(token)
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000)
    await user.save()

    // Email sending is stubbed for now to keep setup friction low.
    // In production: send `${CLIENT_URL}/reset-password?token=${token}`
    return ApiResponse.success(res, { resetToken: token }, 'Password reset token generated (dev)')
  } catch (err) {
    next(err)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    handleValidation(req)
    const token = req.params.token
    const { password } = req.body

    const hashed = sha256Hex(token)
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    })
    if (!user) return ApiResponse.error(res, 'Reset token invalid or expired', 400)

    user.password = await bcrypt.hash(password, 10)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()
    return ApiResponse.success(res, null, 'Password reset successful')
  } catch (err) {
    next(err)
  }
}

