import { body } from 'express-validator'
import { SHIPMENT_STATUSES } from '../constants/statuses.js'

export const createShipmentValidator = [
  body('order').isMongoId(),
  body('merchant').isMongoId(),
]

export const assignDriverValidator = [
  body('driverId').optional().isMongoId(),
  body('vehicleId').optional().isMongoId(),
]

export const updateShipmentStatusValidator = [
  body('status').isIn(Object.values(SHIPMENT_STATUSES)),
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

