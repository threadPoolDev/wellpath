import { useEffect, useRef } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Pressable,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { MORE_SHEET_OPTIONS, MORE_SHEET_SNAP_POINT, SHELL_STRINGS } from '../constants/shell.constants'

interface MoreSheetProps {
  visible: boolean
  onClose: () => void
}

export function MoreSheet({ visible, onClose }: MoreSheetProps) {
  const insets = useSafeAreaInsets()
  const translateY = useRef(new Animated.Value(MORE_SHEET_SNAP_POINT)).current

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : MORE_SHEET_SNAP_POINT,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start()
  }, [visible])

  function handleOption(key: string) {
    onClose()
    if (key === 'relationships') {
      router.push('/(app)/relationships')
    } else if (key === 'settings') {
      router.push('/(app)/settings')
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        className="flex-1 bg-black/40"
        onPress={onClose}
        accessibilityLabel="Close menu"
      >
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: MORE_SHEET_SNAP_POINT + insets.bottom,
            transform: [{ translateY }],
          }}
        >
          <View
            className="bg-white rounded-t-2xl px-6 pt-3 pb-0"
            style={{ paddingBottom: insets.bottom }}
          >
            {/* Handle bar */}
            <View className="w-10 h-1 bg-stone-300 rounded-full self-center mb-5" />

            <Text className="text-lg font-semibold text-stone-900 mb-4">
              {SHELL_STRINGS.MORE_SHEET_TITLE}
            </Text>

            {MORE_SHEET_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.key}
                className="flex-row items-center py-3.5 border-b border-stone-100"
                onPress={() => handleOption(option.key)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
              >
                <Text className="text-xl mr-4">{option.icon}</Text>
                <Text className="text-base text-stone-800 font-medium">{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  )
}
