import { Request, Response, NextFunction } from 'express'
import { submitMorningCheckin, getTodayCheckinStatus } from './checkin.service.js'
import { sendSuccess, sendCreated } from '../../lib/response.js'

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
