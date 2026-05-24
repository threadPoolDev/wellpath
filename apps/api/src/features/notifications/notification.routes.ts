import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { subscribe, unsubscribe, registerExpoToken, unregisterExpoToken } from './notification.controller.js'

export const notificationsRouter = Router()

notificationsRouter.post('/subscribe', requireAuth, subscribe)
notificationsRouter.delete('/subscribe', requireAuth, unsubscribe)
notificationsRouter.post('/expo-token', requireAuth, registerExpoToken)
notificationsRouter.delete('/expo-token', requireAuth, unregisterExpoToken)
