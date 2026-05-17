import { Request, Response, NextFunction } from 'express'
import { getTodayRoutine, markTaskStatus, addAdHocMeeting, markMeetingEndedEarly } from './routine.service.js'
import { recordTaskCheckin } from '../checkin/checkin.service.js'
import { sendSuccess } from '../../lib/response.js'

export async function getToday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routine = await getTodayRoutine(req.user!.userId)
    sendSuccess(res, { routine })
  } catch (err) {
    next(err)
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { routineId, taskId } = req.params as { routineId: string; taskId: string }
    const { status, missedReason, didInstead, shareWithGroup } = req.body as {
      status: 'done' | 'missed' | 'skipped'
      missedReason?: string
      didInstead?: string
      shareWithGroup?: boolean
    }

    const routine = await markTaskStatus(req.user!.userId, routineId, taskId, status, {
      missedReason,
      didInstead,
    })

    recordTaskCheckin(req.user!.userId, routineId, taskId, status, {
      missedReason,
      didInstead,
      shareWithGroup,
    }).catch((err) => console.error('[routine] Failed to save task checkin:', err))

    sendSuccess(res, { routine })
  } catch (err) {
    next(err)
  }
}

export async function addMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { routineId } = req.params as { routineId: string }
    const { title, startTime, durationMinutes } = req.body as {
      title: string
      startTime: string
      durationMinutes: number
    }
    const routine = await addAdHocMeeting(req.user!.userId, routineId, { title, startTime, durationMinutes })
    sendSuccess(res, { routine })
  } catch (err) {
    next(err)
  }
}

export async function endMeeting(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { routineId, meetingId } = req.params as { routineId: string; meetingId: string }
    const { actualEndTime } = req.body as { actualEndTime: string }
    const { routine, freeMinutesGained } = await markMeetingEndedEarly(
      req.user!.userId, routineId, meetingId, actualEndTime
    )
    sendSuccess(res, { routine, freeMinutesGained })
  } catch (err) {
    next(err)
  }
}
