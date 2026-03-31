import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { ROLES } from '../constants/roles.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createOrder,
  deleteOrder,
  getMyOrders,
  getOrderById,
  getOrders,
  setOrderStatus,
  updateOrder,
} from '../controllers/order.controller.js'
import {
  createOrderValidator,
  setOrderStatusValidator,
  updateOrderValidator,
} from '../validators/order.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize(ROLES.MERCHANT, ROLES.ADMIN), createOrderValidator, validate, createOrder)
router.get('/', requireDb, protect, authorize(ROLES.ADMIN), getOrders)
router.get('/my', requireDb, protect, authorize(ROLES.MERCHANT), getMyOrders)
router.get('/:id', requireDb, protect, getOrderById)
router.patch('/:id', requireDb, protect, updateOrderValidator, validate, updateOrder)
router.delete('/:id', requireDb, protect, deleteOrder)
router.patch('/:id/status', requireDb, protect, authorize(ROLES.ADMIN), setOrderStatusValidator, validate, setOrderStatus)

export default router

