import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import {
  getCurrentReflectionHandler,
  getWeekPreviewHandler,
  submitReflectionHandler,
} from './weekly.controller.js'

export const weeklyRouter = Router()

// GET /api/weekly-reflection/current — current week reflection status
weeklyRouter.get('/current', requireAuth, getCurrentReflectionHandler)

// GET /api/weekly-reflection/preview — next 5 days calendar preview
weeklyRouter.get('/preview', requireAuth, getWeekPreviewHandler)

// POST /api/weekly-reflection — submit reflection + generate AI intention
weeklyRouter.post('/', requireAuth, submitReflectionHandler)
