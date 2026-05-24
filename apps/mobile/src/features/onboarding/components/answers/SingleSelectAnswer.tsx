import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { SelectOption } from '../../questions/essentialQuestions'

interface SingleSelectAnswerProps {
  options: SelectOption[]
  value: string | undefined
  onChange: (value: string) => void
}

export function SingleSelectAnswer({ options, value, onChange }: SingleSelectAnswerProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-2.5 mt-2 pb-4">
        {options.map((opt) => {
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
    </ScrollView>
  )
}
