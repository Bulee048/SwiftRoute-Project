import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { ROLES } from '../constants/roles.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createMerchant,
  deleteMerchant,
  getMerchantById,
  getMerchants,
  getMyMerchantProfile,
  updateMyMerchantProfile,
  setMerchantStatus,
  updateMerchant,
} from '../controllers/merchant.controller.js'
import {
  createMerchantValidator,
  setMerchantStatusValidator,
  updateMerchantValidator,
} from '../validators/merchant.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize(ROLES.ADMIN), createMerchantValidator, validate, createMerchant)
router.get('/', requireDb, protect, authorize(ROLES.ADMIN), getMerchants)
router.get('/me', requireDb, protect, authorize(ROLES.MERCHANT), getMyMerchantProfile)
router.get('/:id', requireDb, protect, getMerchantById)
router.patch('/:id', requireDb, protect, updateMerchantValidator, validate, updateMerchant)
router.delete('/:id', requireDb, protect, authorize(ROLES.ADMIN), deleteMerchant)
router.patch('/:id/status', requireDb, protect, authorize(ROLES.ADMIN), setMerchantStatusValidator, validate, setMerchantStatus)
router.patch('/me', requireDb, protect, authorize(ROLES.MERCHANT), updateMerchantValidator, validate, updateMyMerchantProfile)

export default router

