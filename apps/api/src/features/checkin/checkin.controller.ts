import { Request, Response, NextFunction } from 'express'
import { submitMorningCheckin, getTodayCheckinStatus, submitEveningSummary, getEveningStatus } from './checkin.service.js'
import { sendSuccess, sendCreated, sendNoContent } from '../../lib/response.js'

export async function morningCheckin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await submitMorningCheckin(req.user!.userId, req.body)
    sendCreated(res, result)
  } catch (err) {
    next(err)
  }
}

export async function checkinStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getTodayCheckinStatus(req.user!.userId)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function eveningSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { routineId, overallRating, howWasYourDay, tomorrowNote, skipped } = req.body as {
      routineId: string
      overallRating?: number
      howWasYourDay?: string
      tomorrowNote?: string
      skipped?: boolean
    }
    await submitEveningSummary(req.user!.userId, routineId, { overallRating, howWasYourDay, tomorrowNote, skipped })
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}

export async function eveningStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, await getEveningStatus(req.user!.userId))
  } catch (err) {
    next(err)
  }
}
