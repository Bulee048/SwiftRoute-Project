import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { getPaymentById, getPayments, overview } from '../controllers/payment.controller.js'

const router = Router()

router.get('/stats/overview', requireDb, protect, authorize('admin'), overview)
router.get('/', requireDb, protect, authorize('admin'), getPayments)
router.get('/:id', requireDb, protect, authorize('admin'), getPaymentById)

export default router

