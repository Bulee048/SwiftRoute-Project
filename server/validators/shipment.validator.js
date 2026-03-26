import { body } from 'express-validator'

export const createShipmentValidator = [
  body('order').isMongoId(),
  body('merchant').isMongoId(),
]

export const assignDriverValidator = [
  body('driverId').optional().isMongoId(),
  body('vehicleId').optional().isMongoId(),
]

export const updateShipmentStatusValidator = [
  body('status').isIn([
    'created',
    'assigned',
    'picked_up',
    'in_transit',
    'hub_received',
    'out_for_delivery',
    'delivered',
    'failed_delivery',
    'returned',
  ]),
]

export const updateShipmentLocationValidator = [
  body('address').optional().isString(),
  body('coordinates').isArray({ min: 2, max: 2 }),
]

export const addCheckpointValidator = [
  body('status').isString().trim().notEmpty(),
  body('description').optional().isString(),
  body('eventType').optional().isIn(['system', 'driver', 'admin', 'auto']),
]

