import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
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

router.post('/', requireDb, protect, authorize('admin'), createShipmentValidator, validate, createShipment)
router.get('/', requireDb, protect, authorize('admin', 'merchant', 'driver'), getShipments)
router.get('/track/:trackingId', requireDb, trackShipment)
router.get('/:id', requireDb, protect, getShipmentById)
router.patch('/:id/assign-driver', requireDb, protect, authorize('admin'), assignDriverValidator, validate, assignDriver)
router.patch('/:id/status', requireDb, protect, authorize('admin', 'driver'), updateShipmentStatusValidator, validate, updateShipmentStatus)
router.patch('/:id/location', requireDb, protect, authorize('admin', 'driver'), updateShipmentLocationValidator, validate, updateShipmentLocation)
router.post('/:id/checkpoint', requireDb, protect, authorize('admin', 'driver'), addCheckpointValidator, validate, addCheckpoint)
router.get('/:id/timeline', requireDb, protect, getTimeline)

export default router

