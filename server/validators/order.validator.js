import { body } from 'express-validator'
import { ORDER_STATUSES } from '../constants/statuses.js'

export const createOrderValidator = [
  body('merchant').isMongoId(),
  body('customer.name').isString().trim().notEmpty(),
  body('customer.phone').isString().trim().notEmpty(),
]

export const updateOrderValidator = [
  body('priority').optional().isIn(['standard', 'express', 'same_day']),
  body('status')
    .optional()
    .isIn(Object.values(ORDER_STATUSES)),
]

export const setOrderStatusValidator = [
  body('status').isIn(Object.values(ORDER_STATUSES)),
]

