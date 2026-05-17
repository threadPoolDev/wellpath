import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { checkinApi, MorningCheckinPayload } from './api'
import { OnboardingCard } from '@/features/onboarding/components/OnboardingCard'
import { SingleSelectAnswer } from '@/features/onboarding/components/answers/SingleSelectAnswer'
import { TextAnswer } from '@/features/onboarding/components/answers/TextAnswer'

interface Step {
  id: keyof MorningCheckinPayload
  category: string
  text: string
  subtext?: string
  skippable: boolean
}

const STEPS: Step[] = [
  {
    id: 'energyLevel',
    category: 'Morning Check-in',
    text: 'How are you feeling this morning?',
    skippable: false,
  },
  {
    id: 'mood',
    category: 'Morning Check-in',
    text: "And your mood — how would you describe it?",
    skippable: false,
  },
  {
    id: 'anythingDifferentToday',
    category: 'Morning Check-in',
    text: 'Anything different about today?',
    subtext: "A late meeting, working from a café, an appointment — anything that changes your usual day.",
    skippable: true,
  },
]

const ENERGY_OPTIONS = [
  { value: 'high', label: 'Energised and ready' },
  { value: 'medium', label: 'Doing okay' },
  { value: 'low', label: 'A bit low today' },
]

const MOOD_OPTIONS = [
  { value: 'great', label: 'Great' },
  { value: 'okay', label: 'Okay' },
  { value: 'tired', label: 'Tired' },
  { value: 'stressed', label: 'Stressed' },
]

export function MorningCheckin() {
  const navigate = useNavigate()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Partial<MorningCheckinPayload>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const currentStep = STEPS[currentIndex]
  const progress = ((currentIndex) / STEPS.length) * 100

  const updateAnswer = (value: unknown) =>
    setAnswers((prev) => ({ ...prev, [currentStep.id]: value }))

  const hasAnswer = !!answers[currentStep.id]

  const advance = useCallback(
    async (skipped = false) => {
      const isLast = currentIndex === STEPS.length - 1

      if (!isLast) {
        setCurrentIndex((i) => i + 1)
        return
      }

      // Submit on last step
      setIsSubmitting(true)
      try {
        await checkinApi.submitMorning({
          energyLevel: answers.energyLevel ?? 'medium',
          mood: answers.mood ?? 'okay',
          anythingDifferentToday: skipped ? undefined : (answers.anythingDifferentToday as string | undefined),
        })
        setDone(true)
        await new Promise((r) => setTimeout(r, 1200))
        navigate(ROUTES.DASHBOARD, { replace: true })
      } catch {
        // Still navigate — user shouldn't be blocked
        navigate(ROUTES.DASHBOARD, { replace: true })
      } finally {
        setIsSubmitting(false)
      }
    },
    [currentIndex, answers, navigate]
  )

  const handleContinue = useCallback(() => {
    if (!hasAnswer && !currentStep.skippable) return
    advance(false)
  }, [hasAnswer, currentStep, advance])

  const handleSkip = useCallback(() => {
    if (!currentStep.skippable) return
    advance(true)
  }, [currentStep, advance])

  if (done || isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <p className="text-3xl">☀️</p>
          <p className="text-lg font-medium text-stone-700">Building your routine for today...</p>
          <p className="text-sm text-stone-400">This only takes a moment</p>
        </div>
      </div>
    )
  }

  return (
    <OnboardingCard
      category={currentStep.category}
      question={currentStep.text}
      subtext={currentStep.subtext}
      progress={progress}
      hasAnswer={hasAnswer}
      skippable={currentStep.skippable}
      onSkip={handleSkip}
      onContinue={handleContinue}
    >
      {currentStep.id === 'energyLevel' && (
        <SingleSelectAnswer
          options={ENERGY_OPTIONS}
          value={(answers.energyLevel as string) ?? null}
          onChange={updateAnswer}
        />
      )}

      {currentStep.id === 'mood' && (
        <SingleSelectAnswer
          options={MOOD_OPTIONS}
          value={(answers.mood as string) ?? null}
          onChange={updateAnswer}
        />
      )}

      {currentStep.id === 'anythingDifferentToday' && (
        <TextAnswer
          value={(answers.anythingDifferentToday as string) ?? ''}
          onChange={updateAnswer}
          placeholder="e.g. Late meeting at 6pm, working from home..."
        />
      )}
    </OnboardingCard>
  )
}
