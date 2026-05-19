import { View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'

const OPTIONS = [
  { value: 'yes', label: 'Yes' },
  { value: 'no',  label: 'No' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
] as const

interface YesNoAnswerProps {
  value: string | undefined
  onChange: (value: string) => void
}

export function YesNoAnswer({ value, onChange }: YesNoAnswerProps) {
  return (
    <View className="gap-3 mt-2">
      {OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <TouchableOpacity
            key={opt.value}
            className={`rounded-xl px-5 py-4 border ${
              active
                ? 'bg-stone-800 border-stone-800'
                : 'bg-stone-50 border-stone-200'
            }`}
            onPress={() => {
              Haptics.selectionAsync()
              onChange(opt.value)
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            accessibilityLabel={opt.label}
          >
            <Text className={`text-base font-medium ${active ? 'text-white' : 'text-stone-800'}`}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
