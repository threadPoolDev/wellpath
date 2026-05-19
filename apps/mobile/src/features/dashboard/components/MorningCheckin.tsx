import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import * as Haptics from 'expo-haptics'
import {
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  MORNING_CHECKIN_STEPS,
  DASHBOARD_STRINGS,
} from '../constants/dashboard.constants'
import type { MorningCheckinDto } from '../api'

interface MorningCheckinProps {
  onComplete: (dto: MorningCheckinDto) => void
  loading?: boolean
}

export function MorningCheckin({ onComplete, loading }: MorningCheckinProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [energyLevel, setEnergyLevel] = useState<string | null>(null)
  const [mood, setMood] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const step = MORNING_CHECKIN_STEPS[stepIndex]

  function advance() {
    if (stepIndex < MORNING_CHECKIN_STEPS.length - 1) {
      setStepIndex((i) => i + 1)
    } else {
      if (!energyLevel || !mood) return
      onComplete({
        energyLevel,
        mood,
        anythingDifferentToday: note.trim() || undefined,
      })
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-8 justify-between" style={{ minHeight: 400 }}>
          {/* Progress dots */}
          <View className="flex-row gap-2 mb-8">
            {MORNING_CHECKIN_STEPS.map((s, i) => (
              <View
                key={s}
                className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-stone-700' : 'bg-stone-200'}`}
              />
            ))}
          </View>

          {/* Step: Energy */}
          {step === 'energy' && (
            <View className="flex-1">
              <Text className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
                Morning check-in
              </Text>
              <Text className="text-2xl font-bold text-stone-900 mb-8">
                How's your energy today?
              </Text>

              <View className="gap-3">
                {ENERGY_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      Haptics.selectionAsync()
                      setEnergyLevel(opt.value)
                    }}
                    className={`flex-row items-center gap-4 p-4 rounded-2xl border ${
                      energyLevel === opt.value
                        ? 'bg-stone-800 border-stone-800'
                        : 'bg-white border-stone-200'
                    } active:opacity-80`}
                  >
                    <Text className="text-2xl">{opt.emoji}</Text>
                    <Text
                      className={`text-base font-medium ${
                        energyLevel === opt.value ? 'text-white' : 'text-stone-800'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step: Mood */}
          {step === 'mood' && (
            <View className="flex-1">
              <Text className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
                Morning check-in
              </Text>
              <Text className="text-2xl font-bold text-stone-900 mb-8">
                And how's your mood?
              </Text>

              <View className="gap-3">
                {MOOD_OPTIONS.map((opt) => (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      Haptics.selectionAsync()
                      setMood(opt.value)
                    }}
                    className={`flex-row items-center gap-4 p-4 rounded-2xl border ${
                      mood === opt.value
                        ? 'bg-stone-800 border-stone-800'
                        : 'bg-white border-stone-200'
                    } active:opacity-80`}
                  >
                    <Text className="text-2xl">{opt.emoji}</Text>
                    <Text
                      className={`text-base font-medium ${
                        mood === opt.value ? 'text-white' : 'text-stone-800'
                      }`}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Step: Note */}
          {step === 'note' && (
            <View className="flex-1">
              <Text className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
                Morning check-in
              </Text>
              <Text className="text-2xl font-bold text-stone-900 mb-2">
                Anything different today?
              </Text>
              <Text className="text-stone-500 text-sm mb-6">
                A late meeting, WFH day, feeling under the weather… (optional)
              </Text>

              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="e.g. Working from home, big presentation at 2pm…"
                placeholderTextColor="#a8a29e"
                multiline
                numberOfLines={4}
                autoFocus
                className="border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 bg-white"
                style={{ height: 120, textAlignVertical: 'top' }}
              />
            </View>
          )}

          {/* Next / Submit button */}
          <View className="mt-8">
            <Pressable
              onPress={advance}
              disabled={
                loading ||
                (step === 'energy' && !energyLevel) ||
                (step === 'mood' && !mood)
              }
              className={`py-4 rounded-2xl items-center ${
                (step === 'energy' && !energyLevel) || (step === 'mood' && !mood)
                  ? 'bg-stone-200'
                  : 'bg-stone-800 active:opacity-80'
              }`}
            >
              <Text
                className={`font-semibold text-base ${
                  (step === 'energy' && !energyLevel) || (step === 'mood' && !mood)
                    ? 'text-stone-400'
                    : 'text-white'
                }`}
              >
                {step === 'note' || stepIndex === MORNING_CHECKIN_STEPS.length - 1
                  ? loading
                    ? 'Building your routine…'
                    : 'Start my day →'
                  : 'Next →'}
              </Text>
            </Pressable>

            {step === 'note' && (
              <Pressable
                onPress={advance}
                className="mt-3 py-2 items-center active:opacity-70"
              >
                <Text className="text-stone-400 text-sm">Skip for now</Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
