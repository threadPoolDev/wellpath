import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants'
import { useKeyboardNav } from '@/hooks/useKeyboardNav'
import { onboardingApi } from './api'
import { essentialQuestions, OnboardingQuestion, MedicineEntry, SelectOption } from './questions/essentialQuestions'
import { OnboardingCard } from './components/OnboardingCard'
import { SwipeHint } from './components/SwipeHint'
import { YesNoAnswer } from './components/answers/YesNoAnswer'
import { SingleSelectAnswer } from './components/answers/SingleSelectAnswer'
import { MultiSelectAnswer } from './components/answers/MultiSelectAnswer'
import { TimePickerAnswer } from './components/answers/TimePickerAnswer'
import { TextAnswer } from './components/answers/TextAnswer'
import { MedicineFormAnswer } from './components/answers/MedicineFormAnswer'
import { CalendarConnectAnswer } from './components/answers/CalendarConnectAnswer'
import { PhotoUploadAnswer } from './components/answers/PhotoUploadAnswer'

const SESSION_ID_KEY = 'onboarding_session_id'

function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_ID_KEY)
  if (existing) return existing
  const id = crypto.randomUUID()
  sessionStorage.setItem(SESSION_ID_KEY, id)
  return id
}

function resolveOptions(
  question: OnboardingQuestion,
  answers: Record<string, unknown>
): SelectOption[] {
  if (!question.options) return []
  return typeof question.options === 'function' ? question.options(answers) : question.options
}

function hasValidAnswer(question: OnboardingQuestion, answers: Record<string, unknown>): boolean {
  const value = answers[question.id]
  if (value === undefined || value === null || value === '') return false
  if (question.type === 'multi_select' && Array.isArray(value)) return value.length > 0
  if (question.type === 'medicine_form' && Array.isArray(value)) return value.length > 0
  return true
}

export function OnboardingFlow() {
  const navigate = useNavigate()
  const { initialize } = useAuthStore()

  const [sessionId] = useState(getOrCreateSessionId)
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const questionStartTimeRef = useRef(Date.now())

  // Restore session on mount
  useEffect(() => {
    onboardingApi.getSession().then((session) => {
      if (!session || session.completedLayer) return

      const restored: Record<string, unknown> = {}
      for (const r of session.responses) {
        restored[r.questionId] = r.answerValue
      }
      setAnswers(restored)

      if (session.droppedOffAtQuestion) {
        const activeQs = essentialQuestions.filter((q) => !q.showIf || q.showIf(restored))
        const idx = activeQs.findIndex((q) => q.id === session.droppedOffAtQuestion)
        if (idx >= 0) setCurrentIndex(idx)
      }
    })
  }, [])

  const activeQuestions = essentialQuestions.filter(
    (q) => !q.showIf || q.showIf(answers)
  )

  const currentQuestion = activeQuestions[currentIndex]

  // Seed default '09:00' the moment a time_picker question becomes active so
  // hasValidAnswer is true immediately — the displayed value IS the user's answer.
  useEffect(() => {
    if (currentQuestion?.type === 'time_picker' && answers[currentQuestion.id] === undefined) {
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: '09:00' }))
    }
  }, [currentQuestion?.id, currentQuestion?.type]) // eslint-disable-line react-hooks/exhaustive-deps

  // Progress calculation — based on answered weights
  const totalWeight = activeQuestions.reduce((s, q) => s + q.weight, 0)
  const completedWeight = activeQuestions.slice(0, currentIndex).reduce((s, q) => {
    const answered = hasValidAnswer(q, answers)
    return s + (answered ? q.weight : q.skippable ? q.weight * 0.5 : 0)
  }, 0)
  const progress = totalWeight > 0 ? Math.min(100, (completedWeight / totalWeight) * 100) : 0

  const saveResponseToApi = useCallback(
    async (question: OnboardingQuestion, value: unknown, skipped: boolean, nextQuestionId?: string) => {
      const timeToAnswer = Math.round((Date.now() - questionStartTimeRef.current) / 1000)
      // Photo uploads are data URLs — don't send to API
      const safeValue = question.type === 'photo_upload' ? (value ? 'uploaded' : null) : value
      try {
        await onboardingApi.saveResponse({
          sessionId,
          questionId: question.id,
          questionText: question.text,
          questionType: question.type,
          options: resolveOptions(question, answers).map((o) => o.value),
          answerValue: safeValue,
          skipped,
          timeToAnswerSeconds: timeToAnswer,
          droppedOffAtQuestion: nextQuestionId,
        })
      } catch {
        // Non-blocking — continue the flow even if save fails
      }
    },
    [sessionId, answers]
  )

  const advance = useCallback(
    async (value: unknown, skipped = false) => {
      const question = currentQuestion
      if (!question) return

      const newAnswers = skipped ? answers : { ...answers, [question.id]: value }
      if (!skipped) setAnswers(newAnswers)

      const nextActiveQs = essentialQuestions.filter((q) => !q.showIf || q.showIf(newAnswers))
      const nextIndex = currentIndex + 1
      const nextQuestion = nextActiveQs[nextIndex]

      await saveResponseToApi(question, skipped ? null : value, skipped, nextQuestion?.id)
      questionStartTimeRef.current = Date.now()

      if (nextIndex < nextActiveQs.length) {
        setCurrentIndex(nextIndex)
      } else {
        // All questions answered — complete
        setIsCompleting(true)
        try {
          await onboardingApi.complete(sessionId)
          await initialize()
        } catch {
          // Still navigate — onboarding data is saved
        }
        await new Promise((r) => setTimeout(r, 800))
        navigate(ROUTES.DASHBOARD, { replace: true })
      }
    },
    [currentIndex, currentQuestion, answers, sessionId, saveResponseToApi, initialize, navigate]
  )

  const handleSkip = useCallback(() => {
    if (!currentQuestion?.skippable) return
    advance(null, true)
  }, [currentQuestion, advance])

  const handleContinue = useCallback(() => {
    if (!currentQuestion) return
    if (!hasValidAnswer(currentQuestion, answers)) {
      // Skippable with no answer — treat Continue as a skip
      if (currentQuestion.skippable) advance(null, true)
      return
    }
    advance(answers[currentQuestion.id])
  }, [currentQuestion, answers, advance])

  const handleSelectOption = useCallback(
    (index: number) => {
      if (!currentQuestion) return
      const opts = resolveOptions(currentQuestion, answers)
      if (opts[index]) {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: opts[index].value }))
      }
    },
    [currentQuestion, answers]
  )

  useKeyboardNav({
    onLeft: handleSkip,
    onRight: handleContinue,
    onSelectOption: handleSelectOption,
    enabled: !isCompleting,
  })

  if (isCompleting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-4">
          <p className="text-2xl">✨</p>
          <p className="text-lg font-medium text-stone-700">Building your first routine...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  const currentValue = answers[currentQuestion.id]
  const answered = hasValidAnswer(currentQuestion, answers)
  const resolvedOptions = resolveOptions(currentQuestion, answers)

  const updateAnswer = (value: unknown) =>
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))

  return (
    <OnboardingCard
      category={currentQuestion.category}
      question={currentQuestion.text}
      subtext={currentQuestion.subtext}
      progress={progress}
      hasAnswer={answered}
      skippable={currentQuestion.skippable}
      onSkip={handleSkip}
      onContinue={handleContinue}
    >
      {currentQuestion.type === 'text_input' && (
        <TextAnswer
          value={(currentValue as string) ?? ''}
          onChange={updateAnswer}
          placeholder={currentQuestion.id === 'name' ? 'Your name' : 'Type here...'}
        />
      )}

      {currentQuestion.type === 'single_select' && (
        <SingleSelectAnswer
          options={resolvedOptions}
          value={(currentValue as string) ?? null}
          onChange={updateAnswer}
        />
      )}

      {currentQuestion.type === 'multi_select' && (
        <MultiSelectAnswer
          options={resolvedOptions}
          value={(currentValue as string[]) ?? []}
          onChange={updateAnswer}
        />
      )}

      {currentQuestion.type === 'time_picker' && (
        <TimePickerAnswer
          value={(currentValue as string) ?? '09:00'}
          onChange={updateAnswer}
        />
      )}

      {currentQuestion.type === 'yes_no' && (
        <YesNoAnswer
          value={(currentValue as string) ?? null}
          onChange={updateAnswer}
          allowPreferNotToSay={currentQuestion.id === 'takes_medicines'}
        />
      )}

      {currentQuestion.type === 'medicine_form' && (
        <MedicineFormAnswer
          value={(currentValue as MedicineEntry[]) ?? []}
          onChange={updateAnswer}
        />
      )}

      {currentQuestion.type === 'calendar_connect' && (
        <CalendarConnectAnswer
          value={(currentValue as string) ?? null}
          onChange={updateAnswer}
        />
      )}

      {currentQuestion.type === 'photo_upload' && (
        <PhotoUploadAnswer
          value={(currentValue as string) ?? null}
          onChange={updateAnswer}
        />
      )}

      <div className="mt-6">
        <SwipeHint />
      </div>
    </OnboardingCard>
  )
}
