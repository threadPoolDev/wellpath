import { Router } from 'express'
import { requireAuth } from '../../middleware/requireAuth.js'
import { saveResponse, getSession, completeOnboarding } from './onboarding.controller.js'

export const onboardingRouter = Router()

onboardingRouter.patch('/response', requireAuth, saveResponse)
onboardingRouter.get('/session', requireAuth, getSession)
onboardingRouter.post('/complete', requireAuth, completeOnboarding)
