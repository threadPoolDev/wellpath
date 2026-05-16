import { Router } from 'express'
import passport from 'passport'
import { register, login, getMe, logout, oauthCallback } from './auth.controller.js'
import { requireAuth } from '../../middleware/requireAuth.js'
import { loginRateLimiter, registerRateLimiter } from '../../middleware/rateLimiter.js'

export const authRouter = Router()

// ─── Email / Password ─────────────────────────────────────────────────────────
authRouter.post('/register', registerRateLimiter, register)
authRouter.post('/login', loginRateLimiter, login)
authRouter.get('/me', requireAuth, getMe)
authRouter.post('/logout', logout)

// ─── Google OAuth ─────────────────────────────────────────────────────────────
authRouter.get(
  '/google',
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
