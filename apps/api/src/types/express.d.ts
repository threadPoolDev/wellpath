import type { AuthPayload } from '../middleware/requireAuth.js'

declare global {
  namespace Express {
    // Standard Passport + TypeScript integration: augmenting Express.User makes
    // req.user carry AuthPayload fields without conflicting with Passport's own types.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthPayload {}
  }
}
