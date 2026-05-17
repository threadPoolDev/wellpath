import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from 'passport'
import swaggerUi from 'swagger-ui-express'
import { connectDB } from './lib/db.js'
import { configurePassport } from './features/auth/passport.config.js'
import { router } from './router.js'
import { errorHandler } from './middleware/errorHandler.js'
import { globalRateLimiter } from './middleware/rateLimiter.js'
import { openapiSpec } from './docs/openapi.js'
import { startNotificationWorker } from './lib/queue.js'
import { configureWebPush, processNotificationJob } from './features/notifications/notification.service.js'

const app = express()
const PORT = process.env.PORT || 5000
const isProd = process.env.NODE_ENV === 'production'

// ─── Security headers (helmet) ────────────────────────────────────────────────
// In production, HSTS tells browsers to always use HTTPS — this is the mechanism
// that encrypts passwords (and all traffic) in transit. Never disable in prod.
app.use(
  helmet({
    hsts: isProd
      ? { maxAge: 63072000, includeSubDomains: true, preload: true }
      : false,
    contentSecurityPolicy: isProd,
  })
)

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.WEB_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

// ─── Global rate limiting ────────────────────────────────────────────────────
app.use(globalRateLimiter)

// ─── Auth (Passport — JWT only, no sessions) ─────────────────────────────────
configurePassport()
app.use(passport.initialize())

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Swagger UI — dev only (helmet CSP is off in dev, so the UI loads fine)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'WellPath API Docs',
  }))
}

app.use('/api', router)

// ─── Error handler (must be last) ─────────────────────────────────────────────
app.use(errorHandler)

// ─── Startup ──────────────────────────────────────────────────────────────────
configureWebPush()

connectDB()
  .then(() => {
    startNotificationWorker(processNotificationJob)
    app.listen(PORT, () => {
      console.log(`WellPath API running on port ${PORT} [${process.env.NODE_ENV ?? 'development'}]`)
    })
  })
  .catch((err) => {
    console.error('[startup] Failed to connect to MongoDB:', err)
    process.exit(1)
  })

export default app
