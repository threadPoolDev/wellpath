import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendCreated } from '../../lib/response.js'
import {
  getCurrentReflection,
  getWeekPreview,
  submitReflection,
} from './weekly.service.js'
import type { WeeklyReflectionInput } from './weekly.types.js'

export async function getCurrentReflectionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getCurrentReflection(req.user!.userId)
    sendSuccess(res, data)
  } catch (err) {
    next(err)
  }
}

export async function getWeekPreviewHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = await getWeekPreview(req.user!.userId)
    sendSuccess(res, data)
  } catch (err) {
    next(err)
  }
}

export async function submitReflectionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lastWeekRating, oneWin, oneIntention, calendarPreview } = req.body as WeeklyReflectionInput
    const data = await submitReflection(req.user!.userId, {
      lastWeekRating,
      oneWin,
      oneIntention,
      calendarPreview,
    })
    sendCreated(res, data)
  } catch (err) {
    next(err)
  }
}
