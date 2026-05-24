import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native'
import * as Haptics from 'expo-haptics'
import type { MedicineEntry } from '../../questions/essentialQuestions'
import {
  MAX_MEDICINES,
  MEDICINE_WITH_FOOD_OPTIONS,
  MEDICINE_CRITICAL_OPTIONS,
  ONBOARDING_STRINGS,
} from '../../constants/onboarding.constants'

interface MedicineFormAnswerProps {
  value: MedicineEntry[] | undefined
  onChange: (medicines: MedicineEntry[]) => void
}

const EMPTY_MEDICINE: MedicineEntry = {
  nameOrNickname: '',
  timings: ['08:00'],
  withFood: 'not_sure',
  isCritical: 'not_sure',
  reminderEnabled: true,
}

export function MedicineFormAnswer({ value = [], onChange }: MedicineFormAnswerProps) {
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<MedicineEntry>({ ...EMPTY_MEDICINE })

  function openAdd() {
    setDraft({ ...EMPTY_MEDICINE })
    setShowForm(true)
  }

  function saveDraft() {
    if (!draft.nameOrNickname.trim()) return
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    onChange([...value, draft])
    setShowForm(false)
  }

  function remove(index: number) {
    Haptics.selectionAsync()
    onChange(value.filter((_, i) => i !== index))
  }

  function addTiming() {
    setDraft((d) => ({ ...d, timings: [...d.timings, '12:00'] }))
  }

  function updateTiming(index: number, time: string) {
    setDraft((d) => {
      const t = [...d.timings]
      t[index] = time
      return { ...d, timings: t }
    })
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Added medicines */}
      {value.map((med, i) => (
        <View key={i} className="flex-row items-center bg-stone-50 rounded-xl px-4 py-3 mb-2 border border-stone-100">
          <View className="flex-1">
            <Text className="text-stone-900 font-medium">{med.nameOrNickname}</Text>
            <Text className="text-stone-500 text-sm">{med.timings.join(', ')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => remove(i)}
            className="pl-3"
            accessibilityLabel={`Remove ${med.nameOrNickname}`}
          >
            <Text className="text-stone-400 text-lg">×</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Add button */}
      {value.length < MAX_MEDICINES && (
        <TouchableOpacity
          className="border-2 border-dashed border-stone-200 rounded-xl py-4 items-center mt-1 mb-4"
          onPress={openAdd}
          accessibilityRole="button"
          accessibilityLabel="Add medicine"
        >
          <Text className="text-stone-500 font-medium">{ONBOARDING_STRINGS.MEDICINE_ADD}</Text>
        </TouchableOpacity>
      )}

      {/* Disclaimer */}
      <Text className="text-xs text-stone-400 text-center leading-relaxed">
        {ONBOARDING_STRINGS.MEDICINE_DISCLAIMER}
      </Text>

      {/* Add medicine modal */}
      <Modal visible={showForm} transparent animationType="slide" onRequestClose={() => setShowForm(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl px-6 pt-4 pb-8">
            <View className="w-10 h-1 bg-stone-300 rounded-full self-center mb-4" />
            <Text className="text-lg font-semibold text-stone-900 mb-4">Add medicine</Text>

            <TextInput
              className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-base mb-4"
              placeholder="Medicine name or nickname"
              placeholderTextColor="#a8a29e"
              value={draft.nameOrNickname}
              onChangeText={(t) => setDraft((d) => ({ ...d, nameOrNickname: t }))}
              autoFocus
            />

            <Text className="text-sm font-medium text-stone-700 mb-2">When do you take it?</Text>
            {draft.timings.map((t, i) => (
              <TextInput
                key={i}
                className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-900 text-base mb-2"
                placeholder="08:00"
                placeholderTextColor="#a8a29e"
                value={t}
                onChangeText={(v) => updateTiming(i, v)}
                keyboardType="numeric"
                maxLength={5}
              />
            ))}
            <TouchableOpacity onPress={addTiming} className="mb-4">
              <Text className="text-stone-500 text-sm">+ Add another time</Text>
            </TouchableOpacity>

            <Text className="text-sm font-medium text-stone-700 mb-2">Take with food?</Text>
            <View className="flex-row gap-2 mb-4">
              {MEDICINE_WITH_FOOD_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    draft.withFood === opt.value ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}
                  onPress={() => setDraft((d) => ({ ...d, withFood: opt.value as MedicineEntry['withFood'] }))}
                >
                  <Text className={`text-xs font-medium ${draft.withFood === opt.value ? 'text-white' : 'text-stone-700'}`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-sm font-medium text-stone-700 mb-2">Is missing a dose serious?</Text>
            <View className="flex-row gap-2 mb-6">
              {MEDICINE_CRITICAL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  className={`flex-1 py-2.5 rounded-xl border items-center ${
                    draft.isCritical === opt.value ? 'bg-stone-800 border-stone-800' : 'bg-stone-50 border-stone-200'
                  }`}
                  onPress={() => setDraft((d) => ({ ...d, isCritical: opt.value as MedicineEntry['isCritical'] }))}
                >
                  <Text className={`text-xs font-medium ${draft.isCritical === opt.value ? 'text-white' : 'text-stone-700'}`}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${draft.nameOrNickname.trim() ? 'bg-stone-800' : 'bg-stone-200'}`}
              onPress={saveDraft}
              disabled={!draft.nameOrNickname.trim()}
            >
              <Text className={`font-semibold ${draft.nameOrNickname.trim() ? 'text-white' : 'text-stone-400'}`}>
                Add medicine
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}
