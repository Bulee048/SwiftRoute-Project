import { body } from 'express-validator'

export const createMerchantValidator = [
  body('user').isMongoId().withMessage('valid user id required'),
  body('businessName').isString().trim().notEmpty().withMessage('businessName is required'),
  body('businessType').optional().isIn(['retail', 'wholesale', 'ecommerce', 'restaurant', 'pharmacy', 'other']),
]

export const updateMerchantValidator = [
  body('businessName').optional().isString().trim().notEmpty(),
  body('website').optional().isString().trim(),
  body('contractStatus').optional().isIn(['pending', 'active', 'suspended']),
]

export const setMerchantStatusValidator = [body('contractStatus').isIn(['pending', 'active', 'suspended'])]

