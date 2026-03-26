import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createDriver,
  deleteDriver,
  getAvailableDrivers,
  getDriverById,
  getDrivers,
  setDriverStatus,
  updateDriver,
  updateDriverLocation,
} from '../controllers/driver.controller.js'
import {
  createDriverValidator,
  setDriverStatusValidator,
  updateDriverLocationValidator,
  updateDriverValidator,
} from '../validators/driver.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize('admin'), createDriverValidator, validate, createDriver)
router.get('/', requireDb, protect, authorize('admin'), getDrivers)
router.get('/available', requireDb, protect, authorize('admin'), getAvailableDrivers)
router.get('/:id', requireDb, protect, getDriverById)
router.patch('/:id', requireDb, protect, updateDriverValidator, validate, updateDriver)
router.delete('/:id', requireDb, protect, authorize('admin'), deleteDriver)
router.patch('/:id/status', requireDb, protect, authorize('admin'), setDriverStatusValidator, validate, setDriverStatus)
router.patch('/:id/location', requireDb, protect, authorize('admin', 'driver'), updateDriverLocationValidator, validate, updateDriverLocation)

export default router

