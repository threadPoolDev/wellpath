import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { getToday, updateTaskStatus } from './routine.controller.js'

const router = Router()

router.get('/today', requireAuth, getToday)
router.patch('/:routineId/tasks/:taskId/status', requireAuth, updateTaskStatus)

export { router as routineRouter }
