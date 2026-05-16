import type { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service.js'
import { sendSuccess, sendCreated } from '../../lib/response.js'

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

function setAuthCookie(res: Response, token: string): void {
  res.cookie('token', token, COOKIE_OPTIONS)
}

function clearAuthCookie(res: Response): void {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' })
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await authService.register(req.body)
    setAuthCookie(res, token)
    sendCreated(res, { user })
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { user, token } = await authService.login(req.body)
    setAuthCookie(res, token)
    sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getById(req.user!.userId)
    sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}

export function logout(_req: Request, res: Response): void {
  clearAuthCookie(res)
  res.status(200).json({ success: true })
}

export function oauthCallback(req: Request, res: Response): void {
  const oauthUser = req.user!
  const token = authService.generateToken(oauthUser.userId, oauthUser.email)
  setAuthCookie(res, token)

  const webUrl = process.env.WEB_URL ?? 'http://localhost:5173'
  res.redirect(`${webUrl}/auth/callback`)
}
