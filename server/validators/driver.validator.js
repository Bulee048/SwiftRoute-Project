import { body } from 'express-validator'

export const createDriverValidator = [
  body('user').isMongoId().withMessage('valid user id required'),
  body('licenseNumber').isString().trim().notEmpty().withMessage('licenseNumber is required'),
]

export const updateDriverValidator = [
  body('licenseNumber').optional().isString().trim().notEmpty(),
  body('status').optional().isIn(['available', 'on_delivery', 'off_duty', 'on_leave']),
]

export const setDriverStatusValidator = [body('status').isIn(['available', 'on_delivery', 'off_duty', 'on_leave'])]

export const updateDriverLocationValidator = [
  body('lat').isFloat({ min: -90, max: 90 }),
  body('lng').isFloat({ min: -180, max: 180 }),
]

