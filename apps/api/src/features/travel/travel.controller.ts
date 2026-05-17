import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../lib/response.js'
import { ValidationError } from '../../lib/errors.js'
import { estimateTravelTime } from './travel.service.js'

export async function getEstimate(req: Request, res: Response, next: NextFunction) {
  try {
    const { home, office, mode } = req.query as Record<string, string>
    if (!home || !office || !mode) throw new ValidationError('home, office, and mode are required')

    const result = await estimateTravelTime(req.user!.userId, home, office, mode)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
