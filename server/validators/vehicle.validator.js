import { body } from 'express-validator'

export const createVehicleValidator = [
  body('vehicleNumber').isString().trim().notEmpty(),
  body('type').isIn(['bike', 'auto', 'van', 'truck', 'mini_truck', 'container']),
]

export const updateVehicleValidator = [
  body('vehicleNumber').optional().isString().trim().notEmpty(),
  body('type').optional().isIn(['bike', 'auto', 'van', 'truck', 'mini_truck', 'container']),
]

export const setVehicleStatusValidator = [body('status').isIn(['active', 'maintenance', 'retired', 'unassigned'])]

