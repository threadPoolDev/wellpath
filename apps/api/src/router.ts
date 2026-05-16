import { Router } from 'express'

/**
 * Central route registry.
 * Each PR mounts its feature router here — one line per feature.
 *
 * Pattern:
 *   import { authRouter } from './features/auth/auth.routes.js'
 *   router.use('/auth', authRouter)
 */
const router = Router()

// PR #3 — feat/auth
// router.use('/auth', authRouter)

// PR #7 — feat/calendar-integration
// router.use('/calendar', calendarRouter)

// PR #6 — feat/travel-time
// router.use('/travel', travelRouter)

// PR #8 — feat/morning-checkin
// router.use('/checkin', checkinRouter)

// PR #9 — feat/ai-routine-engine
// router.use('/routine', routineRouter)

// PR #12 — feat/adhoc-meetings
// router.use('/routine', routineRouter)  (extends same router)

// PR #5 — feat/profile-photo
// router.use('/user', userRouter)

// PR #13 — feat/desktop-notifications
// router.use('/notifications', notificationsRouter)

// PR #17 — feat/groups-backend
// router.use('/groups', groupsRouter)

// PR #16 — feat/settings
// router.use('/settings', settingsRouter)

export { router }
