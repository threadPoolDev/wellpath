import { OnboardingResponse, IOnboardingResponse } from './onboardingResponse.model.js'
import { SaveResponseDto } from './onboarding.types.js'

export async function findOrCreateSession(
  userId: string,
  sessionId: string
): Promise<IOnboardingResponse> {
  let session = await OnboardingResponse.findOne({
    userId,
    layer: 'essential',
    completedLayer: false,
  })

  if (!session) {
    session = await OnboardingResponse.create({
      userId,
      layer: 'essential',
      sessionId,
      responses: [],
      completedLayer: false,
      startedAt: new Date(),
    })
  }

  return session
}

export async function findActiveSession(userId: string): Promise<IOnboardingResponse | null> {
  return OnboardingResponse.findOne({
    userId,
    layer: 'essential',
  }).sort({ startedAt: -1 })
}

export async function upsertResponse(
  session: IOnboardingResponse,
  dto: SaveResponseDto
): Promise<IOnboardingResponse> {
  const existingIndex = session.responses.findIndex((r) => r.questionId === dto.questionId)

  const responseItem = {
    questionId: dto.questionId,
    questionText: dto.questionText,
    questionType: dto.questionType as IOnboardingResponse['responses'][number]['questionType'],
    options: dto.options ?? [],
    answerValue: dto.answerValue,
    answeredAt: new Date(),
    skipped: dto.skipped,
    timeToAnswerSeconds: dto.timeToAnswerSeconds,
  }

  if (existingIndex >= 0) {
    session.responses[existingIndex] = responseItem
  } else {
    session.responses.push(responseItem)
  }

  if (dto.droppedOffAtQuestion !== undefined) {
    session.droppedOffAtQuestion = dto.droppedOffAtQuestion
  }

  return session.save()
}

export async function markSessionComplete(session: IOnboardingResponse): Promise<IOnboardingResponse> {
  session.completedLayer = true
  session.completedAt = new Date()
  session.droppedOffAtQuestion = undefined
  return session.save()
}
