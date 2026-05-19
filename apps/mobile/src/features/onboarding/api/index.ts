import { apiClient } from '../../../lib/apiClient'

interface SaveResponseDto {
  questionId: string
  questionText: string
  questionType: string
  answerValue: unknown
  skipped: boolean
  timeToAnswerSeconds: number
}

export const onboardingApi = {
  saveResponse: (dto: SaveResponseDto): Promise<void> =>
    apiClient.patch('/onboarding/response', dto).then(() => undefined),

  getSession: (): Promise<{ responses: Array<{ questionId: string; answerValue: unknown }> }> =>
    apiClient.get<{ data: { responses: Array<{ questionId: string; answerValue: unknown }> } }>(
      '/onboarding/session',
    ).then((r) => r.data ?? { responses: [] }),

  complete: (): Promise<void> =>
    apiClient.post('/onboarding/complete').then(() => undefined),
}
