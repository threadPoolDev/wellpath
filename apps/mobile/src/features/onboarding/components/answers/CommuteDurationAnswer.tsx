import { View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'

interface CommuteDurationAnswerProps {
  value: number | undefined   // minutes
  onChange: (minutes: number) => void
}

const QUICK_DURATIONS = [10, 15, 20, 30, 45, 60, 75, 90] as const

export function CommuteDurationAnswer({ value, onChange }: CommuteDurationAnswerProps) {
  function select(minutes: number) {
    Haptics.selectionAsync()
    onChange(minutes)
  }

  function adjust(delta: number) {
    const current = value ?? 30
    const next = Math.max(5, Math.min(180, current + delta))
    Haptics.selectionAsync()
    onChange(next)
  }

  return (
    <View className="mt-2">
      {/* Stepper display */}
      <View className="flex-row items-center justify-center bg-stone-50 rounded-2xl border border-stone-200 py-4 mb-4">
        <TouchableOpacity
          className="w-12 h-12 items-center justify-center"
          onPress={() => adjust(-5)}
          accessibilityLabel="Decrease by 5 minutes"
        >
          <Text className="text-stone-600 text-2xl font-light">−</Text>
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-4xl font-bold text-stone-900">{value ?? '—'}</Text>
          <Text className="text-stone-400 text-sm">minutes each way</Text>
        </View>

        <TouchableOpacity
          className="w-12 h-12 items-center justify-center"
          onPress={() => adjust(5)}
          accessibilityLabel="Increase by 5 minutes"
        >
          <Text className="text-stone-600 text-2xl font-light">+</Text>
        </TouchableOpacity>
      </View>

      {/* Quick-pick */}
      <View className="flex-row flex-wrap gap-2">
        {QUICK_DURATIONS.map((d) => (
          <TouchableOpacity
            key={d}
            className={`px-4 py-2 rounded-xl border ${
              value === d ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}
            onPress={() => select(d)}
            accessibilityRole="button"
            accessibilityLabel={`${d} minutes`}
          >
            <Text className={`text-sm font-medium ${value === d ? 'text-white' : 'text-stone-700'}`}>
              {d} min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
