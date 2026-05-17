import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { morningCheckin, checkinStatus } from './checkin.controller.js'

const router = Router()

router.post('/morning', requireAuth, morningCheckin)
router.get('/morning/status', requireAuth, checkinStatus)

export { router as checkinRouter }
