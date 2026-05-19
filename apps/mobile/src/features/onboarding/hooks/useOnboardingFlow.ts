import { useState, useMemo, useRef, useCallback } from 'react'
import { essentialQuestions } from '../questions/essentialQuestions'
import { onboardingApi } from '../api'

const SKIPPED_SENTINEL = '__skipped__'

export function useOnboardingFlow() {
  const [answers, setAnswers] = useState<Record<string, unknown>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const cardMountedAt = useRef(Date.now())

  // Active question set — re-evaluated whenever answers change
  const activeQuestions = useMemo(
    () => essentialQuestions.filter((q) => !q.showIf || q.showIf(answers)),
    [answers],
  )

  const currentQuestion = activeQuestions[currentIndex] ?? null
  const isLastQuestion = currentIndex >= activeQuestions.length - 1

  // Progress: sum of weights for answered questions / total active weight
  const progress = useMemo(() => {
    const total = activeQuestions.reduce((s, q) => s + q.weight, 0)
    if (total === 0) return 0
    const answered = activeQuestions.slice(0, currentIndex).reduce((s, q) => {
      const val = answers[q.id]
      const contribution = val === SKIPPED_SENTINEL ? q.weight * 0.5 : q.weight
      return s + contribution
    }, 0)
    return Math.min(100, Math.round((answered / total) * 100))
  }, [currentIndex, activeQuestions, answers])

  function recordAnswer(value: unknown) {
    if (!currentQuestion) return
    const elapsed = Math.round((Date.now() - cardMountedAt.current) / 1000)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
    // Fire-and-forget — never block the UI on API saves
    onboardingApi.saveResponse({
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      questionType: currentQuestion.type,
      answerValue: value,
      skipped: false,
      timeToAnswerSeconds: elapsed,
    }).catch(() => {})
  }

  function advance() {
    cardMountedAt.current = Date.now()
    if (isLastQuestion) return  // caller handles completion
    setCurrentIndex((i) => i + 1)
  }

  function skip() {
    if (!currentQuestion?.skippable) return
    const elapsed = Math.round((Date.now() - cardMountedAt.current) / 1000)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: SKIPPED_SENTINEL }))
    onboardingApi.saveResponse({
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      questionType: currentQuestion.type,
      answerValue: null,
      skipped: true,
      timeToAnswerSeconds: elapsed,
    }).catch(() => {})
    cardMountedAt.current = Date.now()
    if (!isLastQuestion) setCurrentIndex((i) => i + 1)
  }

  function goBack() {
    if (currentIndex > 0) {
      cardMountedAt.current = Date.now()
      setCurrentIndex((i) => i - 1)
    }
  }

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined
  const hasAnswer = currentAnswer !== undefined && currentAnswer !== SKIPPED_SENTINEL

  return {
    currentQuestion,
    currentAnswer: hasAnswer ? currentAnswer : undefined,
    answers,
    progress,
    currentIndex,
    totalQuestions: activeQuestions.length,
    isLastQuestion,
    recordAnswer,
    advance,
    skip,
    goBack,
  }
}
