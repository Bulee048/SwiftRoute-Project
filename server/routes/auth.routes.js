import { Router } from 'express'
import {
  forgotPassword,
  login,
  logout,
  me,
  refreshToken,
  register,
  resetPassword,
  updatePassword,
  updateProfile,
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { authRateLimiter } from '../middleware/rateLimiter.middleware.js'
import {
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updatePasswordValidator,
  updateProfileValidator,
} from '../validators/auth.validator.js'

const router = Router()

router.post('/register', authRateLimiter, requireDb, registerValidator, register)
router.post('/login', authRateLimiter, requireDb, loginValidator, login)
router.post('/logout', requireDb, protect, logout)
router.post('/refresh-token', authRateLimiter, requireDb, refreshToken)
router.post('/forgot-password', authRateLimiter, requireDb, forgotPasswordValidator, forgotPassword)
router.patch('/reset-password/:token', authRateLimiter, requireDb, resetPasswordValidator, resetPassword)
router.get('/me', requireDb, protect, me)
router.patch('/update-password', requireDb, protect, updatePasswordValidator, updatePassword)
router.patch('/update-profile', requireDb, protect, updateProfileValidator, updateProfile)

export default router

