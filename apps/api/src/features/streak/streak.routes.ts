import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { getStreakHandler } from './streak.controller.js'

export const streakRouter = Router()

streakRouter.get('/', requireAuth, getStreakHandler)
