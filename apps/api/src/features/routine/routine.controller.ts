import { Request, Response, NextFunction } from 'express'
import { getTodayRoutine, markTaskStatus } from './routine.service.js'
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

    // Record in checkins collection — fire-and-forget, non-blocking
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
