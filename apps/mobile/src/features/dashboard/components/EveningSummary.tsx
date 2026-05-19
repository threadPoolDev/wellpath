import { useState } from 'react'
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import { RATING_OPTIONS } from '../constants/dashboard.constants'
import type { EveningCheckinDto } from '../api'

interface EveningSummaryProps {
  onComplete: (dto: EveningCheckinDto) => void
  onSkip: () => void
  loading?: boolean
}

const RATING_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🌟',
}

const RATING_LABELS: Record<number, string> = {
  1: 'Tough day',
  2: 'Could be better',
  3: 'Decent',
  4: 'Good day',
  5: 'Great day!',
}

export function EveningSummary({ onComplete, onSkip, loading }: EveningSummaryProps) {
  const [rating, setRating] = useState<number | null>(null)
  const [howWasYourDay, setHowWasYourDay] = useState('')
  const [tomorrowNote, setTomorrowNote] = useState('')

  function handleSubmit() {
    if (!rating) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onComplete({
      overallRating: rating,
      howWasYourDay: howWasYourDay.trim() || undefined,
      tomorrowNote: tomorrowNote.trim() || undefined,
    })
  }

  function handleSkip() {
    Haptics.selectionAsync()
    onSkip()
  }

  return (
    <View className="flex-1 bg-stone-50">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 py-8"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-2">
          Evening wrap-up
        </Text>
        <Text className="text-2xl font-bold text-stone-900 mb-1">How did today go?</Text>
        <Text className="text-stone-500 text-sm mb-8">A quick wrap-up — no pressure.</Text>

        {/* Rating */}
        <Text className="text-sm font-medium text-stone-700 mb-3">Overall, today was…</Text>
        <View className="flex-row justify-between mb-2">
          {RATING_OPTIONS.map((r) => (
            <Pressable
              key={r}
              onPress={() => {
                Haptics.selectionAsync()
                setRating(r)
              }}
              className={`items-center justify-center w-14 h-14 rounded-2xl border ${
                rating === r ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'
              } active:opacity-75`}
            >
              <Text className="text-xl">{RATING_EMOJIS[r]}</Text>
            </Pressable>
          ))}
        </View>
        {rating && (
          <Text className="text-xs text-stone-500 text-center mb-6">{RATING_LABELS[rating]}</Text>
        )}
        {!rating && <View className="mb-6" />}

        {/* Free text — how was your day */}
        <Text className="text-sm font-medium text-stone-700 mb-2">
          Anything you want to note? <Text className="text-stone-400 font-normal">(optional)</Text>
        </Text>
        <TextInput
          value={howWasYourDay}
          onChangeText={setHowWasYourDay}
          placeholder="A win, a struggle, something that surprised you…"
          placeholderTextColor="#a8a29e"
          multiline
          numberOfLines={3}
          className="border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 bg-white mb-5"
          style={{ height: 90, textAlignVertical: 'top' }}
        />

        {/* Tomorrow note */}
        <Text className="text-sm font-medium text-stone-700 mb-2">
          Anything to remember for tomorrow? <Text className="text-stone-400 font-normal">(optional)</Text>
        </Text>
        <TextInput
          value={tomorrowNote}
          onChangeText={setTomorrowNote}
          placeholder="An early meeting, finish that report…"
          placeholderTextColor="#a8a29e"
          multiline
          numberOfLines={2}
          className="border border-stone-200 rounded-2xl px-4 py-3 text-sm text-stone-800 bg-white mb-8"
          style={{ height: 72, textAlignVertical: 'top' }}
        />

        {/* Actions */}
        <Pressable
          onPress={handleSubmit}
          disabled={!rating || loading}
          className={`py-4 rounded-2xl items-center mb-3 ${
            !rating ? 'bg-stone-200' : 'bg-stone-800 active:opacity-80'
          }`}
        >
          <Text className={`font-semibold text-base ${!rating ? 'text-stone-400' : 'text-white'}`}>
            {loading ? 'Saving…' : 'Done for today ✓'}
          </Text>
        </Pressable>

        <Pressable onPress={handleSkip} className="py-2 items-center active:opacity-70">
          <Text className="text-stone-400 text-sm">Skip for now</Text>
        </Pressable>
      </ScrollView>
    </View>
  )
}
