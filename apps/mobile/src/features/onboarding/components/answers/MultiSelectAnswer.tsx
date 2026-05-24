import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { SelectOption } from '../../questions/essentialQuestions'

interface MultiSelectAnswerProps {
  options: SelectOption[]
  value: string[] | undefined
  onChange: (value: string[]) => void
}

export function MultiSelectAnswer({ options, value = [], onChange }: MultiSelectAnswerProps) {
  function toggle(optValue: string) {
    Haptics.selectionAsync()
    if (value.includes(optValue)) {
      onChange(value.filter((v) => v !== optValue))
    } else {
      onChange([...value, optValue])
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="gap-2.5 mt-2 pb-4">
        {options.map((opt) => {
          const active = value.includes(opt.value)
          return (
            <TouchableOpacity
              key={opt.value}
              className={`flex-row items-center rounded-xl px-5 py-4 border ${
                active ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
              }`}
              onPress={() => toggle(opt.value)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: active }}
              accessibilityLabel={opt.label}
            >
              <View
                className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                  active ? 'border-white bg-white' : 'border-stone-300'
                }`}
              >
                {active && <Text className="text-stone-800 text-xs font-bold">✓</Text>}
              </View>
              <Text className={`text-base font-medium flex-1 ${active ? 'text-white' : 'text-stone-800'}`}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </ScrollView>
  )
}
