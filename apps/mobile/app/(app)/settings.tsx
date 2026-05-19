import { View, Text, TouchableOpacity } from 'react-native'
import { SafeScrollView } from '../../src/components/SafeScrollView'
import { useAuthStore } from '../../src/store/authStore'

// Placeholder — replaced in PR #M9 (feat/mobile-travel-settings)
export default function SettingsScreen() {
  const { user, logout } = useAuthStore()

  return (
    <SafeScrollView>
      <View className="px-6 py-8">
        <Text className="text-2xl font-bold text-stone-900 mb-1">Settings</Text>
        <Text className="text-stone-500 text-sm mb-8">
          Full settings coming in PR #M9
        </Text>

        <View className="bg-white rounded-xl border border-stone-100 px-5 py-4 mb-4">
          <Text className="text-xs text-stone-400 uppercase tracking-widest mb-1">Signed in as</Text>
          <Text className="text-stone-900 font-medium">{user?.name}</Text>
          <Text className="text-stone-500 text-sm">{user?.email}</Text>
        </View>

        <TouchableOpacity
          className="bg-stone-100 rounded-xl px-5 py-4 items-center"
          onPress={logout}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text className="text-stone-700 font-medium">Sign out</Text>
        </TouchableOpacity>
      </View>
    </SafeScrollView>
  )
}
