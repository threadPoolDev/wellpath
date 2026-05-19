import { useEffect } from 'react'
import { View, Text } from 'react-native'
import { Stack, router } from 'expo-router'
import { useAuthStore } from '../../src/store/authStore'
import { useBiometricLock } from '../../src/hooks/useBiometricLock'

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
        <Text className="text-stone-500 text-base">Unlock WellPath to continue</Text>
      </View>
    )
  }

  // Full bottom-tab shell is built in PR #M3 (feat/mobile-shell).
  // For now, render a simple Stack so auth flow works end-to-end.
  return <Stack screenOptions={{ headerShown: false }} />
}
