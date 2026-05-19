import { useEffect } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import { useAuthStore } from '../src/store/authStore'

// Root entry — waits for auth initialisation then routes accordingly
export default function Index() {
  const { user, isInitialized } = useAuthStore()

  useEffect(() => {
    if (!isInitialized) return
    if (user) {
      router.replace(user.onboardingComplete ? '/(app)' : '/(onboarding)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [isInitialized, user])

  return (
    <View className="flex-1 bg-stone-50 items-center justify-center">
      <ActivityIndicator size="large" color="#44403c" />
    </View>
  )
}
