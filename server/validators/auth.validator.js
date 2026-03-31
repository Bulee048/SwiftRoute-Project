import { body } from 'express-validator'
import { ROLES } from '../constants/roles.js'

export const registerValidator = [
  body('name').isString().trim().notEmpty().withMessage('name is required'),
  body('email').isEmail().normalizeEmail().withMessage('valid email required'),
  body('password').isString().isLength({ min: 8 }).withMessage('password min 8 chars'),
  body('phone').optional().isString(),
  body('role').optional().isIn(Object.values(ROLES)),
]

export const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty(),
]

export const forgotPasswordValidator = [body('email').isEmail().normalizeEmail()]

export const resetPasswordValidator = [body('password').isString().isLength({ min: 8 })]

export const updateProfileValidator = [
  body('name').optional().isString().trim().notEmpty(),
  body('phone').optional().isString(),
  body('avatar').optional().isString(),
  body('address').optional().isObject(),
]

export const updatePasswordValidator = [
  body('currentPassword').isString().notEmpty(),
  body('newPassword').isString().isLength({ min: 8 }),
]

