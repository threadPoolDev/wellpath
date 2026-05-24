'use client'
import { useEffect } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import type { OnboardingQuestion } from '../questions/essentialQuestions'
import { SWIPE_THRESHOLD, SWIPE_ROTATE_FACTOR, CARD_EXIT_DISTANCE, CARD_SPRING } from '../constants/onboarding.constants'
import { ONBOARDING_STRINGS } from '../constants/onboarding.constants'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface OnboardingCardProps {
  question: OnboardingQuestion
  hasAnswer: boolean
  onNext: () => void   // called after swipe-right animation completes
  onSkip: () => void   // called after swipe-left animation completes
  onBack: () => void
  entryDirection: 'right' | 'left'  // which side the card enters from
  children: React.ReactNode         // the answer component
}

export function OnboardingCard({
  question,
  hasAnswer,
  onNext,
  onSkip,
  onBack,
  entryDirection,
  children,
}: OnboardingCardProps) {
  const translateX = useSharedValue(entryDirection === 'right' ? CARD_EXIT_DISTANCE : -CARD_EXIT_DISTANCE)

  // Animate card in from the appropriate side on mount / question change
  useEffect(() => {
    translateX.value = entryDirection === 'right' ? CARD_EXIT_DISTANCE : -CARD_EXIT_DISTANCE
    translateX.value = withSpring(0, CARD_SPRING)
  }, [question.id, entryDirection])

  function triggerNext() {
    translateX.value = withSpring(-CARD_EXIT_DISTANCE, CARD_SPRING, () => runOnJS(onNext)())
  }

  function triggerSkip() {
    if (!question.skippable) return
    translateX.value = withSpring(CARD_EXIT_DISTANCE, CARD_SPRING, () => runOnJS(onSkip)())
  }

  function triggerBounce() {
    translateX.value = withSequence(
      withTiming(24, { duration: 80 }),
      withTiming(-16, { duration: 60 }),
      withSpring(0, CARD_SPRING),
    )
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onUpdate((e) => {
      translateX.value = e.translationX
    })
    .onEnd((e) => {
      const dx = e.translationX
      if (dx > SWIPE_THRESHOLD) {
        if (hasAnswer) {
          runOnJS(triggerNext)()
        } else {
          runOnJS(triggerBounce)()
        }
      } else if (dx < -SWIPE_THRESHOLD && question.skippable) {
        runOnJS(triggerSkip)()
      } else {
        translateX.value = withSpring(0, CARD_SPRING)
      }
    })

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = translateX.value * SWIPE_ROTATE_FACTOR
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.6],
      [1, 0.4],
      Extrapolation.CLAMP,
    )
    return {
      transform: [{ translateX: translateX.value }, { rotate: `${rotation}deg` }],
      opacity,
    }
  })

  // Left tint (skip) or right tint (continue) overlay
  const rightTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 0.15], Extrapolation.CLAMP),
  }))
  const leftTintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0, 0.1], Extrapolation.CLAMP),
  }))

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        className="flex-1 mx-4 bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden"
        style={animatedStyle}
      >
        {/* Swipe tint overlays */}
        <Animated.View
          style={[{ ...overlay }, rightTintStyle]}
          className="bg-stone-500"
          pointerEvents="none"
        />
        <Animated.View
          style={[{ ...overlay }, leftTintStyle]}
          className="bg-stone-300"
          pointerEvents="none"
        />

        {/* Card content */}
        <View className="flex-1 px-6 pt-6 pb-4">
          {/* Category */}
          <Text className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-3">
            {question.category}
          </Text>

          {/* Question */}
          <Text className="text-2xl font-bold text-stone-900 leading-snug mb-2">
            {question.text}
          </Text>
          {question.subtext && (
            <Text className="text-sm text-stone-500 mb-4 leading-relaxed">
              {question.subtext}
            </Text>
          )}

          {/* Answer area */}
          <View className="flex-1">{children}</View>
        </View>

        {/* Footer */}
        <View className="flex-row items-center justify-between px-6 pb-6 pt-2 border-t border-stone-50">
          <TouchableOpacity
            onPress={onBack}
            className="py-2 pr-4"
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <Text className="text-stone-400 text-sm">{ONBOARDING_STRINGS.BACK}</Text>
          </TouchableOpacity>

          {question.skippable && (
            <TouchableOpacity
              onPress={triggerSkip}
              className="py-2 px-3"
              accessibilityRole="button"
              accessibilityLabel="Skip"
            >
              <Text className="text-stone-400 text-sm">{ONBOARDING_STRINGS.SKIP}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => { if (hasAnswer) triggerNext(); else triggerBounce() }}
            className={`py-2.5 px-5 rounded-xl ${hasAnswer ? 'bg-stone-800' : 'bg-stone-200'}`}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <Text className={`text-sm font-semibold ${hasAnswer ? 'text-white' : 'text-stone-400'}`}>
              {ONBOARDING_STRINGS.CONTINUE}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </GestureDetector>
  )
}

const overlay = {
  position: 'absolute' as const,
  top: 0, left: 0, right: 0, bottom: 0,
  zIndex: 1,
}
