import { apiClient } from '@/lib/apiClient'

export interface SaveResponsePayload {
  sessionId: string
  questionId: string
  questionText: string
  questionType: string
  options?: string[]
  answerValue: unknown
  skipped: boolean
  timeToAnswerSeconds: number
  droppedOffAtQuestion?: string
}

export interface OnboardingSession {
  sessionId: string
  responses: Array<{
    questionId: string
    answerValue: unknown
    skipped: boolean
  }>
  droppedOffAtQuestion?: string
  completedLayer: boolean
}

async function saveResponse(payload: SaveResponsePayload): Promise<void> {
  await apiClient.patch('/onboarding/response', payload)
}

async function getSession(): Promise<OnboardingSession | null> {
  const res = await apiClient.get<{ data: OnboardingSession | null }>('/onboarding/session')
  return res.data.data
}

async function complete(sessionId: string): Promise<void> {
  await apiClient.post('/onboarding/complete', { sessionId })
}

export const onboardingApi = { saveResponse, getSession, complete }
