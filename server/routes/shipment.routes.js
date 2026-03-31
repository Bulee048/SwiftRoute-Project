import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { ROLES } from '../constants/roles.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  addCheckpoint,
  assignDriver,
  createShipment,
  getShipmentById,
  getShipments,
  getTimeline,
  trackShipment,
  updateShipmentLocation,
  updateShipmentStatus,
} from '../controllers/shipment.controller.js'
import {
  addCheckpointValidator,
  assignDriverValidator,
  createShipmentValidator,
  updateShipmentLocationValidator,
  updateShipmentStatusValidator,
} from '../validators/shipment.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize(ROLES.ADMIN), createShipmentValidator, validate, createShipment)
router.get('/', requireDb, protect, authorize(ROLES.ADMIN, ROLES.MERCHANT, ROLES.DRIVER), getShipments)
router.get('/track/:trackingId', requireDb, trackShipment)
router.get('/:id', requireDb, protect, getShipmentById)
router.patch('/:id/assign-driver', requireDb, protect, authorize(ROLES.ADMIN), assignDriverValidator, validate, assignDriver)
router.patch('/:id/status', requireDb, protect, authorize(ROLES.ADMIN, ROLES.DRIVER), updateShipmentStatusValidator, validate, updateShipmentStatus)
router.patch('/:id/location', requireDb, protect, authorize(ROLES.ADMIN, ROLES.DRIVER), updateShipmentLocationValidator, validate, updateShipmentLocation)
router.post('/:id/checkpoint', requireDb, protect, authorize(ROLES.ADMIN, ROLES.DRIVER), addCheckpointValidator, validate, addCheckpoint)
router.get('/:id/timeline', requireDb, protect, getTimeline)

export default router

