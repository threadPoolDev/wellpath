import { Request, Response, NextFunction } from 'express'
import { sendSuccess, sendNoContent } from '../../lib/response.js'
import { ValidationError } from '../../lib/errors.js'
import * as onboardingService from './onboarding.service.js'
import { SaveResponseDto, CompleteOnboardingDto } from './onboarding.types.js'

export async function saveResponse(req: Request, res: Response, next: NextFunction) {
  try {
    const dto: SaveResponseDto = req.body
    if (!dto.sessionId || !dto.questionId) throw new ValidationError('sessionId and questionId are required')

    await onboardingService.saveResponse(req.user!.userId, dto)
    sendNoContent(res)
  } catch (err) {
    next(err)
  }
}

export async function getSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await onboardingService.getSession(req.user!.userId)
    sendSuccess(res, session)
  } catch (err) {
    next(err)
  }
}

export async function completeOnboarding(req: Request, res: Response, next: NextFunction) {
  try {
    const dto: CompleteOnboardingDto = req.body
    if (!dto.sessionId) throw new ValidationError('sessionId is required')

    await onboardingService.completeOnboarding(req.user!.userId, dto)
    sendSuccess(res, { onboardingComplete: true })
  } catch (err) {
    next(err)
  }
}
