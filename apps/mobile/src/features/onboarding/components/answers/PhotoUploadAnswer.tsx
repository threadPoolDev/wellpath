import { useState } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as Haptics from 'expo-haptics'
import { ONBOARDING_STRINGS } from '../../constants/onboarding.constants'

interface PhotoUploadAnswerProps {
  value: string | undefined   // local URI of selected photo
  onChange: (uri: string) => void
}

export function PhotoUploadAnswer({ value, onChange }: PhotoUploadAnswerProps) {
  const [loading, setLoading] = useState(false)

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) return

    Haptics.selectionAsync()
    setLoading(true)
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })
      if (!result.canceled && result.assets[0]) {
        onChange(result.assets[0].uri)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="mt-4 items-center">
      <TouchableOpacity
        onPress={pickPhoto}
        disabled={loading}
        className="w-32 h-32 rounded-full bg-stone-100 border-2 border-dashed border-stone-300 items-center justify-center overflow-hidden mb-4"
        accessibilityRole="button"
        accessibilityLabel={value ? ONBOARDING_STRINGS.PHOTO_CHANGE : 'Choose photo'}
      >
        {value ? (
          <Image source={{ uri: value }} className="w-full h-full" accessibilityIgnoresInvertColors />
        ) : (
          <View className="items-center">
            <Text className="text-3xl mb-1">📷</Text>
            <Text className="text-stone-400 text-xs text-center px-2">
              {loading ? 'Loading…' : 'Tap to add'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {value && (
        <TouchableOpacity onPress={pickPhoto} accessibilityRole="button" accessibilityLabel="Change photo">
          <Text className="text-stone-500 text-sm underline">{ONBOARDING_STRINGS.PHOTO_CHANGE}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
