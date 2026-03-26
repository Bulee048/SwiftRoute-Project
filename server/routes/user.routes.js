import { Router } from 'express'
import { protect } from '../middleware/auth.middleware.js'
import { authorize } from '../middleware/role.middleware.js'
import { getUsers, summary } from '../controllers/user.controller.js'

const router = Router()

router.get('/', protect, authorize('admin'), getUsers)
router.get('/stats/summary', protect, authorize('admin'), summary)

export default router

