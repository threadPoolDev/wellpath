import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { Tabs, router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { useBiometricLock } from '../../src/hooks/useBiometricLock'
import { AppTabBar } from '../../src/features/shell/components/AppTabBar'
import { SHELL_STRINGS } from '../../src/features/shell/constants/shell.constants'

export default function AppLayout() {
  const { user, isInitialized } = useAuthStore()
  const { isUnlocked } = useBiometricLock(isInitialized && !!user)

  useEffect(() => {
    if (isInitialized && !user) {
      router.replace('/(auth)/login')
    }
  }, [isInitialized, user])

  if (!isInitialized || !user) return null

  if (!isUnlocked) {
    return (
      <View className="flex-1 bg-stone-50 items-center justify-center">
        <Text className="text-stone-500 text-base">{SHELL_STRINGS.LOCKED_MESSAGE}</Text>
      </View>
    )
  }

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      {/* Today — always first */}
      <Tabs.Screen name="index" options={{ title: 'Today' }} />

      {/* Routine */}
      <Tabs.Screen name="routine" options={{ title: 'Routine' }} />

      {/* Groups — ALWAYS shown to every user, never conditional */}
      <Tabs.Screen name="groups" options={{ title: 'Groups' }} />

      {/* History */}
      <Tabs.Screen name="history" options={{ title: 'History' }} />

      {/* Settings — 5th tab for standard users; married users see "More" via AppTabBar */}
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />

      {/* Relationships — hidden from tab bar; accessible via MoreSheet (married users only) */}
      <Tabs.Screen name="relationships" options={{ href: null, title: 'Relationships' }} />
    </Tabs>
  )
}
