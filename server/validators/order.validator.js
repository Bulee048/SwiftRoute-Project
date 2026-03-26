import { body } from 'express-validator'

export const createOrderValidator = [
  body('merchant').isMongoId(),
  body('customer.name').isString().trim().notEmpty(),
  body('customer.phone').isString().trim().notEmpty(),
]

export const updateOrderValidator = [
  body('priority').optional().isIn(['standard', 'express', 'same_day']),
  body('status')
    .optional()
    .isIn([
      'draft',
      'placed',
      'confirmed',
      'pickup_scheduled',
      'picked_up',
      'in_transit',
      'out_for_delivery',
      'delivered',
      'failed',
      'cancelled',
      'returned',
    ]),
]

export const setOrderStatusValidator = [
  body('status').isIn([
    'draft',
    'placed',
    'confirmed',
    'pickup_scheduled',
    'picked_up',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'failed',
    'cancelled',
    'returned',
  ]),
]

