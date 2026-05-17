import { Router } from 'express'
import { authRouter } from './features/auth/auth.routes.js'
import { onboardingRouter } from './features/onboarding/onboarding.routes.js'
import { userRouter } from './features/user/user.routes.js'
import { travelRouter } from './features/travel/travel.routes.js'
import { calendarRouter } from './features/calendar/calendar.routes.js'
import { checkinRouter } from './features/checkin/checkin.routes.js'
import { routineRouter } from './features/routine/routine.routes.js'

const router = Router()

// PR #3 — feat/auth
router.use('/auth', authRouter)

// PR #4 — feat/onboarding
router.use('/onboarding', onboardingRouter)

// PR #5 — feat/profile-photo
router.use('/user', userRouter)

// PR #6 — feat/travel-time
router.use('/travel', travelRouter)

// PR #5 — feat/profile-photo
// router.use('/user', userRouter)

// PR #6 — feat/travel-time
// router.use('/travel', travelRouter)

// PR #7 — feat/calendar-integration
router.use('/calendar', calendarRouter)

// PR #8 — feat/morning-checkin
router.use('/checkin', checkinRouter)

// PR #9 — feat/ai-routine-engine
router.use('/routine', routineRouter)

// PR #13 — feat/desktop-notifications
// router.use('/notifications', notificationsRouter)

// PR #16 — feat/settings
// router.use('/settings', settingsRouter)

// PR #17 — feat/groups-backend
// router.use('/groups', groupsRouter)

export { router }
