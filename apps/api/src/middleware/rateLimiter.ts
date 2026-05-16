import rateLimit from 'express-rate-limit'

const rateLimitResponse = (message: string) => ({
  success: false,
  error: { code: 'RATE_LIMIT_EXCEEDED', message },
})

/**
 * Auth-specific limiters are intentionally strict.
 * Use Redis store (rate-limit-redis) in multi-instance production deployments.
 */

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many sign-in attempts. Please wait 15 minutes and try again.'
  ),
})

export const registerRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse(
    'Too many registration attempts from this address. Please try again in an hour.'
  ),
})

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: rateLimitResponse('Too many requests. Please slow down.'),
  skip: (req) => req.path === '/health',
})
