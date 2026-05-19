import { View, Text } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'

// Placeholder — replaced in PR #M8 (feat/mobile-streak-insights)
export default function HistoryScreen() {
  return (
    <SafeScrollView>
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Text className="text-2xl font-bold text-stone-900 mb-2">History</Text>
        <Text className="text-stone-500 text-base text-center">
          Coming in PR #M8
        </Text>
      </View>
    </SafeScrollView>
  )
}
