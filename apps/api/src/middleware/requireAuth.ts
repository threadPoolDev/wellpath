import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../lib/errors.js'

export interface AuthPayload {
  userId: string
  email: string
  onboardingComplete?: boolean
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    // Cookie (web) takes precedence; Bearer header is the mobile fallback
    const bearerHeader = req.headers.authorization
    const token =
      (req.cookies?.token as string | undefined) ??
      (bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7) : undefined)

    if (!token) throw new UnauthorizedError('No token provided')

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET is not set')

    req.user = jwt.verify(token, secret) as AuthPayload
    next()
  } catch {
    next(new UnauthorizedError())
  }
}
