import type { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../lib/response.js'
import { getStreak } from './streak.service.js'

export async function getStreakHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await getStreak(req.user!.userId)
    sendSuccess(res, data)
  } catch (err) {
    next(err)
  }
}
