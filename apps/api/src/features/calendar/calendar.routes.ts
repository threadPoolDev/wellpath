import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import {
  connectGoogle,
  googleCallback,
  connectMicrosoft,
  microsoftCallback,
  listConnections,
  removeConnection,
  listEvents,
} from './calendar.controller.js'

const router = Router()

// OAuth initiation — requires the user's JWT cookie to embed userId in state
router.get('/connect/google', requireAuth, connectGoogle)
router.get('/connect/microsoft', requireAuth, connectMicrosoft)

// OAuth callbacks — stateless, userId recovered from signed state param
router.get('/connect/google/callback', googleCallback)
router.get('/connect/microsoft/callback', microsoftCallback)

// Calendar management
router.get('/connections', requireAuth, listConnections)
router.delete('/connections/:provider', requireAuth, removeConnection)
router.get('/events', requireAuth, listEvents)

export { router as calendarRouter }
