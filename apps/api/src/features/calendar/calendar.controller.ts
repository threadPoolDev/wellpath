import { Request, Response, NextFunction } from 'express'
import {
  buildGoogleAuthUrl,
  handleGoogleCallback,
  buildMicrosoftAuthUrl,
  handleMicrosoftCallback,
  getConnections,
  disconnectCalendar,
  getEventsForDay,
  syncAllConnections,
} from './calendar.service.js'
import { sendSuccess, sendNoContent } from '../../lib/response.js'

export async function connectGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.redirect(buildGoogleAuthUrl(req.user!.userId))
  } catch (err) {
    next(err)
  }
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query as { code: string; state: string }
    await handleGoogleCallback(code, state)
    res.redirect(`${process.env.WEB_URL}/onboarding?calendar_connected=google`)
  } catch (err) {
    next(err)
  }
}

export async function connectMicrosoft(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.redirect(buildMicrosoftAuthUrl(req.user!.userId))
  } catch (err) {
    next(err)
  }
}

export async function microsoftCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.query as { code: string; state: string }
    await handleMicrosoftCallback(code, state)
    res.redirect(`${process.env.WEB_URL}/onboarding?calendar_connected=microsoft`)
  } catch (err) {
    next(err)
  }
}

export async function listConnections(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, await getConnections(req.user!.userId))
  } catch (err) {
    next(err)
  }
}

export async function removeConnection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await disconnectCalendar(req.user!.userId, req.params.provider as string)
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}

export async function listEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query.date as string
    sendSuccess(res, await getEventsForDay(req.user!.userId, date))
  } catch (err) {
    next(err)
  }
}

export async function syncCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await syncAllConnections(req.user!.userId)
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}
