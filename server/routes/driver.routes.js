import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { ROLES } from '../constants/roles.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createDriver,
  deleteDriver,
  getAvailableDrivers,
  getMyDriverProfile,
  getDriverById,
  getDrivers,
  setDriverStatus,
  updateDriver,
  updateMyDriverProfile,
  updateDriverLocation,
} from '../controllers/driver.controller.js'
import {
  createDriverValidator,
  setDriverStatusValidator,
  updateDriverLocationValidator,
  updateDriverValidator,
} from '../validators/driver.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize(ROLES.ADMIN), createDriverValidator, validate, createDriver)
router.get('/', requireDb, protect, authorize(ROLES.ADMIN), getDrivers)
router.get('/available', requireDb, protect, authorize(ROLES.ADMIN), getAvailableDrivers)
router.get('/me', requireDb, protect, authorize(ROLES.DRIVER), getMyDriverProfile)
router.patch('/me', requireDb, protect, authorize(ROLES.DRIVER), updateDriverValidator, validate, updateMyDriverProfile)

router.get('/:id', requireDb, protect, getDriverById)
router.patch('/:id', requireDb, protect, updateDriverValidator, validate, updateDriver)
router.delete('/:id', requireDb, protect, authorize(ROLES.ADMIN), deleteDriver)
router.patch('/:id/status', requireDb, protect, authorize(ROLES.ADMIN), setDriverStatusValidator, validate, setDriverStatus)
router.patch('/:id/location', requireDb, protect, authorize(ROLES.ADMIN, ROLES.DRIVER), updateDriverLocationValidator, validate, updateDriverLocation)

export default router

