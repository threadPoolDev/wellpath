import { View, Text } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'

// Hidden from tab bar — only accessible for married users via MoreSheet.
// Replaced in PR #M7 (feat/mobile-groups) with full Relationships page.
export default function RelationshipsScreen() {
  return (
    <SafeScrollView>
      <View className="flex-1 items-center justify-center px-6 py-20">
        <Text className="text-2xl font-bold text-stone-900 mb-2">Relationships</Text>
        <Text className="text-stone-500 text-base text-center">
          Partner sync and group connections coming in PR #M7
        </Text>
      </View>
    </SafeScrollView>
  )
}
