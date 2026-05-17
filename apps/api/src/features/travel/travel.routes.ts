import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { getEstimate } from './travel.controller.js'

export const travelRouter = Router()

travelRouter.get('/estimate', requireAuth, getEstimate)
