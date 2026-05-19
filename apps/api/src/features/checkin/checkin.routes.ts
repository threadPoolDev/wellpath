import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { morningCheckin, checkinStatus, eveningSummary, eveningStatus } from './checkin.controller.js'

const router = Router()

router.post('/morning', requireAuth, morningCheckin)
router.get('/morning/status', requireAuth, checkinStatus)
router.post('/evening', requireAuth, eveningSummary)
router.get('/evening/status', requireAuth, eveningStatus)

export { router as checkinRouter }
