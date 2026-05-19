import { useState } from 'react'
import { View, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import * as Haptics from 'expo-haptics'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '../../../store/authStore'
import { mobileAuthApi } from '../../auth/api'
import { onboardingApi } from '../api'
import { useOnboardingFlow } from '../hooks/useOnboardingFlow'
import { OnboardingCard } from '../components/OnboardingCard'
import { OnboardingProgress } from '../components/OnboardingProgress'
import { YesNoAnswer } from '../components/answers/YesNoAnswer'
import { SingleSelectAnswer } from '../components/answers/SingleSelectAnswer'
import { MultiSelectAnswer } from '../components/answers/MultiSelectAnswer'
import { TimePickerAnswer } from '../components/answers/TimePickerAnswer'
import { TextAnswer } from '../components/answers/TextAnswer'
import { MedicineFormAnswer } from '../components/answers/MedicineFormAnswer'
import { CalendarConnectAnswer } from '../components/answers/CalendarConnectAnswer'
import { PhotoUploadAnswer } from '../components/answers/PhotoUploadAnswer'
import { CommuteDurationAnswer } from '../components/answers/CommuteDurationAnswer'
import type { SelectOption } from '../questions/essentialQuestions'
import type { MedicineEntry } from '../questions/essentialQuestions'

export function OnboardingScreen() {
  const setUser = useAuthStore((s) => s.setUser)
  const [completing, setCompleting] = useState(false)
  const [entryDirection, setEntryDirection] = useState<'right' | 'left'>('right')

  const {
    currentQuestion,
    currentAnswer,
    answers,
    progress,
    isLastQuestion,
    recordAnswer,
    advance,
    skip,
    goBack,
  } = useOnboardingFlow()

  async function handleNext() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    if (isLastQuestion) {
      await handleComplete()
    } else {
      setEntryDirection('right')
      advance()
    }
  }

  function handleSkip() {
    setEntryDirection('left')
    skip()
  }

  function handleBack() {
    setEntryDirection('left')
    goBack()
  }

  async function handleComplete() {
    setCompleting(true)
    try {
      await onboardingApi.complete()
    } catch {
      // best-effort — if endpoint missing, getMe will still return updated user
    }
    try {
      const user = await mobileAuthApi.getMe()
      setUser(user)
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      router.replace('/(app)')
    } catch {
      router.replace('/(app)')
    } finally {
      setCompleting(false)
    }
  }

  if (completing) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <ActivityIndicator size="large" color="#44403c" />
        <Text className="text-stone-500 text-base mt-4">Setting up your routine…</Text>
      </View>
    )
  }

  if (!currentQuestion) return null

  // Resolve dynamic options
  const resolvedOptions: SelectOption[] =
    typeof currentQuestion.options === 'function'
      ? currentQuestion.options(answers)
      : (currentQuestion.options ?? [])

  function renderAnswer() {
    switch (currentQuestion!.type) {
      case 'yes_no':
        return (
          <YesNoAnswer
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'single_select':
        return (
          <SingleSelectAnswer
            options={resolvedOptions}
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'multi_select':
        return (
          <MultiSelectAnswer
            options={resolvedOptions}
            value={currentAnswer as string[] | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'time_picker':
        return (
          <TimePickerAnswer
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'text_input':
        return (
          <TextAnswer
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'medicine_form':
        return (
          <MedicineFormAnswer
            value={currentAnswer as MedicineEntry[] | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'calendar_connect':
        return (
          <CalendarConnectAnswer
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'photo_upload':
        return (
          <PhotoUploadAnswer
            value={currentAnswer as string | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      case 'commute_duration':
        return (
          <CommuteDurationAnswer
            value={currentAnswer as number | undefined}
            onChange={(v) => recordAnswer(v)}
          />
        )
      default:
        return null
    }
  }

  // medicine_form and calendar_connect are valid even with empty state
  const hasAnswer =
    currentAnswer !== undefined ||
    currentQuestion.type === 'medicine_form' ||
    currentQuestion.type === 'calendar_connect'

  return (
    <GestureHandlerRootView className="flex-1 bg-stone-50">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <OnboardingProgress progress={progress} />

        <View className="flex-1 py-4">
          <OnboardingCard
            key={currentQuestion.id}
            question={currentQuestion}
            hasAnswer={hasAnswer}
            onNext={handleNext}
            onSkip={handleSkip}
            onBack={handleBack}
            entryDirection={entryDirection}
          >
            {renderAnswer()}
          </OnboardingCard>
        </View>
      </KeyboardAvoidingView>
    </GestureHandlerRootView>
  )
}
