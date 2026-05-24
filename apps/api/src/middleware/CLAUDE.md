# apps/api/src/middleware

## Purpose
Express middleware applied to routes or the global app.

## Patterns & Rules
- Middleware must call `next()` or send a response — never both
- `requireAuth` attaches `req.user` — downstream controllers can trust it is populated
- `errorHandler` must be registered last in `src/index.ts` — after all routes
- Controllers pass errors to `next(err)` — never call `res.json()` on caught errors in controllers

## Error handling contract
```
Service throws AppError → Controller catches → next(err) → errorHandler formats response
```

## Security contract
- `helmet` is mounted first in `src/index.ts` — before CORS, before routes
- HSTS is enabled only in production (`NODE_ENV === 'production'`)
- Rate limiters use in-memory store by default — switch to `rate-limit-redis` in clustered production
- `loginRateLimiter` and `registerRateLimiter` are applied per-route in `auth.routes.ts`
- `globalRateLimiter` is applied app-wide in `src/index.ts`

## Contents
| File | Purpose |
|---|---|
| requireAuth.ts | JWT validation from httpOnly cookie, attaches req.user |
| errorHandler.ts | Catches AppError and unknown errors, returns standard JSON error shape |
| rateLimiter.ts | loginRateLimiter (10/15min), registerRateLimiter (5/hr), globalRateLimiter (300/15min) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Directory created |
| 2026-05-16 | architecture | requireAuth.ts, errorHandler.ts |
| 2026-05-16 | feat/auth (security) | rateLimiter.ts — helmet + express-rate-limit |
