import { useEffect, useRef } from 'react'
import { View, Text, Animated } from 'react-native'
import { ONBOARDING_STRINGS } from '../constants/onboarding.constants'

interface OnboardingProgressProps {
  progress: number   // 0–100
}

function getProgressLabel(progress: number): string {
  if (progress >= 100) return ONBOARDING_STRINGS.PROGRESS_LABELS['100']
  if (progress >= 86)  return ONBOARDING_STRINGS.PROGRESS_LABELS['86-99']
  if (progress >= 61)  return ONBOARDING_STRINGS.PROGRESS_LABELS['61-85']
  if (progress >= 31)  return ONBOARDING_STRINGS.PROGRESS_LABELS['31-60']
  return ONBOARDING_STRINGS.PROGRESS_LABELS['0-30']
}

export function OnboardingProgress({ progress }: OnboardingProgressProps) {
  const widthAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: progress,
      useNativeDriver: false,
      damping: 18,
      stiffness: 120,
    }).start()
  }, [progress])

  const label = getProgressLabel(progress)

  return (
    <View className="px-6 pt-4 pb-2">
      <View className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
        <Animated.View
          className="h-full bg-stone-500 rounded-full"
          style={{
            width: widthAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
              extrapolate: 'clamp',
            }),
          }}
        />
      </View>
      <Text className="text-xs text-stone-400 mt-1.5 text-center" numberOfLines={1}>
        {label}
      </Text>
    </View>
  )
}
