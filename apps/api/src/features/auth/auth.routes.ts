import { Router } from 'express'
import type { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import { register, login, getMe, logout, oauthCallback } from './auth.controller.js'
import { requireAuth } from '../../middleware/requireAuth.js'
import { loginRateLimiter, registerRateLimiter } from '../../middleware/rateLimiter.js'

export const authRouter = Router()

// Tags the OAuth flow as mobile-initiated so oauthCallback can redirect to the deep link
function tagMobileOAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.query.mobile === 'true') {
    // Short-lived cookie (10 min) survives the OAuth round-trip; lax needed for OAuth redirects
    res.cookie('oauth_mobile', '1', { maxAge: 10 * 60 * 1000, httpOnly: true, sameSite: 'lax' })
  }
  next()
}

// ─── Email / Password ─────────────────────────────────────────────────────────
authRouter.post('/register', registerRateLimiter, register)
authRouter.post('/login', loginRateLimiter, login)
authRouter.get('/me', requireAuth, getMe)
authRouter.post('/logout', logout)

// ─── Google OAuth ─────────────────────────────────────────────────────────────
authRouter.get(
  '/google',
  tagMobileOAuth,
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
)
authRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.WEB_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`,
  }),
  oauthCallback
)

// ─── Microsoft OAuth ──────────────────────────────────────────────────────────
authRouter.get(
  '/microsoft',
  tagMobileOAuth,
  passport.authenticate('microsoft', {
    session: false,
    scope: ['openid', 'profile', 'email', 'User.Read'],
  } as Parameters<typeof passport.authenticate>[1])
)
authRouter.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', {
    session: false,
    failureRedirect: `${process.env.WEB_URL ?? 'http://localhost:5173'}/login?error=oauth_failed`,
  }),
  oauthCallback
)
