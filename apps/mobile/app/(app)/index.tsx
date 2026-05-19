import { View, Text, TouchableOpacity } from 'react-native'
import { useAuthStore } from '../../src/store/authStore'

// Placeholder today screen — replaced in PR #M5 (feat/mobile-dashboard).
export default function TodayScreen() {
  const { user, logout } = useAuthStore()

  return (
    <View className="flex-1 bg-stone-50 items-center justify-center px-6">
      <Text className="text-2xl font-bold text-stone-900 mb-2">
        Hello, {user?.name ?? 'there'} 👋
      </Text>
      <Text className="text-stone-500 text-base text-center mb-8">
        Your dashboard is coming in PR #M5.
      </Text>
      <TouchableOpacity
        className="bg-stone-200 rounded-xl px-6 py-3"
        onPress={logout}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Text className="text-stone-700 font-medium">Sign out</Text>
      </TouchableOpacity>
    </View>
  )
}
