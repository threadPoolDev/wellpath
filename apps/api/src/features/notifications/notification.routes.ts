import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { subscribe, unsubscribe } from './notification.controller.js'

export const notificationsRouter = Router()

notificationsRouter.post('/subscribe', requireAuth, subscribe)
notificationsRouter.delete('/subscribe', requireAuth, unsubscribe)
