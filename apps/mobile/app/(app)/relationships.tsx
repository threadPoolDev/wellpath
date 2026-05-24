import { View, Text } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'

// Relationships — shown via MoreSheet for married users only.
// Full partner sync implementation comes with PR #24 (web) + PR #M9 (mobile).
export default function RelationshipsScreen() {
  return (
    <SafeScrollView className="bg-stone-50">
      <View className="px-6 pt-8 pb-4">
        <Text className="text-2xl font-bold text-stone-900 mb-1">Relationships</Text>
        <Text className="text-stone-400 text-sm mb-8">Stay in sync with the people who matter</Text>

        <View className="bg-white rounded-2xl border border-stone-100 p-6 items-center">
          <Text className="text-3xl mb-3">💑</Text>
          <Text className="text-base font-semibold text-stone-800 text-center mb-2">
            Connect with your partner
          </Text>
          <Text className="text-stone-500 text-sm text-center leading-5">
            See when you both have free windows, share your completion, and build a couple streak.
            {'\n\n'}
            Partner sync is coming soon.
          </Text>
        </View>
      </View>
    </SafeScrollView>
  )
}
