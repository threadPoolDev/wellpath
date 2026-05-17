export interface SaveResponseDto {
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

export interface CompleteOnboardingDto {
  sessionId: string
}

export interface OnboardingSessionResponse {
  sessionId: string
  responses: Array<{
    questionId: string
    answerValue: unknown
    skipped: boolean
  }>
  droppedOffAtQuestion?: string
  completedLayer: boolean
}
