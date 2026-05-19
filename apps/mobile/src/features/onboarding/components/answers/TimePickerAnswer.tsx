import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'

interface TimePickerAnswerProps {
  value: string | undefined   // "HH:MM" 24-hour format
  onChange: (value: string) => void
}

const QUICK_TIMES = ['06:00', '07:00', '08:00', '09:00', '17:00', '18:00', '19:00', '21:00']

export function TimePickerAnswer({ value, onChange }: TimePickerAnswerProps) {
  const [raw, setRaw] = useState(value ?? '')

  function handleTextChange(text: string) {
    // Auto-insert colon after 2 digits
    let formatted = text.replace(/[^0-9:]/g, '')
    if (formatted.length === 2 && !formatted.includes(':') && raw.length === 1) {
      formatted = formatted + ':'
    }
    if (formatted.length > 5) return
    setRaw(formatted)

    // Validate HH:MM and update parent
    if (/^\d{2}:\d{2}$/.test(formatted)) {
      const [h, m] = formatted.split(':').map(Number)
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        onChange(formatted)
      }
    }
  }

  function handleQuickPick(time: string) {
    Haptics.selectionAsync()
    setRaw(time)
    onChange(time)
  }

  return (
    <View className="mt-2">
      {/* Large time display + input */}
      <TextInput
        className={`text-5xl font-bold text-center py-4 rounded-2xl border ${
          value ? 'text-stone-900 border-stone-200 bg-stone-50' : 'text-stone-300 border-stone-100 bg-stone-50'
        }`}
        value={raw}
        onChangeText={handleTextChange}
        placeholder="09:00"
        placeholderTextColor="#d6d3d1"
        keyboardType="numeric"
        maxLength={5}
        accessibilityLabel="Enter time in HH:MM format"
        returnKeyType="done"
      />

      {/* Quick-pick chips */}
      <View className="flex-row flex-wrap gap-2 mt-4">
        {QUICK_TIMES.map((t) => (
          <TouchableOpacity
            key={t}
            className={`px-4 py-2 rounded-xl border ${
              value === t ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
            }`}
            onPress={() => handleQuickPick(t)}
            accessibilityRole="button"
            accessibilityLabel={t}
          >
            <Text className={`text-sm font-medium ${value === t ? 'text-white' : 'text-stone-700'}`}>
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}
