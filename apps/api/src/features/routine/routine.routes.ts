import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { getToday, updateTaskStatus, addMeeting, endMeeting } from './routine.controller.js'

const router = Router()

router.get('/today', requireAuth, getToday)
router.patch('/:routineId/tasks/:taskId/status', requireAuth, updateTaskStatus)
router.post('/:routineId/meetings', requireAuth, addMeeting)
router.patch('/:routineId/meetings/:meetingId/end-early', requireAuth, endMeeting)

export { router as routineRouter }
