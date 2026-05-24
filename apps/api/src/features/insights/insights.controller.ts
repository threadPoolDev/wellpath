import { Request, Response, NextFunction } from 'express'
import { sendSuccess } from '../../lib/response.js'
import { getTrends, getMoodGraph } from './insights.service.js'

export async function trendsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getTrends(req.user!.userId)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

export async function moodGraphHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getMoodGraph(req.user!.userId)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}
