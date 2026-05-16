import type { AuthPayload } from '../middleware/requireAuth.js'

declare global {
  namespace Express {
    interface Request {
      user: AuthPayload
    }
  }
}
