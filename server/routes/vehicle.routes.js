import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createVehicle,
  deleteVehicle,
  getVehicleById,
  getVehicles,
  setVehicleStatus,
  updateVehicle,
} from '../controllers/vehicle.controller.js'
import {
  createVehicleValidator,
  setVehicleStatusValidator,
  updateVehicleValidator,
} from '../validators/vehicle.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize('admin'), createVehicleValidator, validate, createVehicle)
router.get('/', requireDb, protect, getVehicles)
router.get('/:id', requireDb, protect, getVehicleById)
router.patch('/:id', requireDb, protect, authorize('admin'), updateVehicleValidator, validate, updateVehicle)
router.delete('/:id', requireDb, protect, authorize('admin'), deleteVehicle)
router.patch('/:id/status', requireDb, protect, authorize('admin'), setVehicleStatusValidator, validate, setVehicleStatus)

export default router

