import { View, Text } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'
import { useAuthStore } from '../../src/store/authStore'

// Today tab placeholder — replaced in PR #M5 (feat/mobile-dashboard)
export default function TodayScreen() {
  const user = useAuthStore((s) => s.user)

  return (
    <SafeScrollView>
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-stone-900 mb-1">
          Good morning, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </Text>
        <Text className="text-stone-500 text-base">
          Your dashboard is coming in PR #M5.
        </Text>
      </View>
    </SafeScrollView>
  )
}
