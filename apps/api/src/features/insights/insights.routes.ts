import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { trendsHandler, moodGraphHandler } from './insights.controller.js'

export const insightsRouter = Router()

insightsRouter.get('/trends', requireAuth, trendsHandler)
insightsRouter.get('/mood-graph', requireAuth, moodGraphHandler)
