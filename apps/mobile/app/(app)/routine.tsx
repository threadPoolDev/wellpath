import { View, Text } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'

// Placeholder — replaced in PR #M5 (feat/mobile-dashboard)
export default function RoutineScreen() {
  return (
    <SafeScrollView>
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Text className="text-2xl font-bold text-stone-900 mb-2">My Routine</Text>
        <Text className="text-stone-500 text-base text-center">
          Coming in PR #M5
        </Text>
      </View>
    </SafeScrollView>
  )
}
