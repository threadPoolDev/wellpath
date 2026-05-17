import { Request, Response, NextFunction } from 'express'
import { saveSubscription, removeSubscription } from './notification.service.js'
import { sendSuccess, sendNoContent } from '../../lib/response.js'

export async function subscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { endpoint, keys } = req.body as { endpoint: string; keys: { p256dh: string; auth: string } }
    await saveSubscription(req.user!.userId, { endpoint, keys })
    sendSuccess(res, { subscribed: true })
  } catch (err) {
    next(err)
  }
}

export async function unsubscribe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await removeSubscription(req.user!.userId)
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}
