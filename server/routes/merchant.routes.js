import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { requireDb } from '../middleware/requireDb.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import {
  createMerchant,
  deleteMerchant,
  getMerchantById,
  getMerchants,
  setMerchantStatus,
  updateMerchant,
} from '../controllers/merchant.controller.js'
import {
  createMerchantValidator,
  setMerchantStatusValidator,
  updateMerchantValidator,
} from '../validators/merchant.validator.js'

const router = Router()

router.post('/', requireDb, protect, authorize('admin'), createMerchantValidator, validate, createMerchant)
router.get('/', requireDb, protect, authorize('admin'), getMerchants)
router.get('/:id', requireDb, protect, getMerchantById)
router.patch('/:id', requireDb, protect, updateMerchantValidator, validate, updateMerchant)
router.delete('/:id', requireDb, protect, authorize('admin'), deleteMerchant)
router.patch('/:id/status', requireDb, protect, authorize('admin'), setMerchantStatusValidator, validate, setMerchantStatus)

export default router

