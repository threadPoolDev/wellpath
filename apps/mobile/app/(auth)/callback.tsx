import { useEffect } from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { secureStore } from '../../src/lib/secureStore'
import { mobileAuthApi } from '../../src/features/auth/api'
import { useAuthStore } from '../../src/store/authStore'
import { AUTH_STRINGS } from '../../src/features/auth/constants/auth.constants'

export default function OAuthCallbackScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>()
  const setUser = useAuthStore((s) => s.setUser)

  useEffect(() => {
    async function finish() {
      if (!token) {
        router.replace('/(auth)/login')
        return
      }

      try {
        await secureStore.setToken(token)
        const user = await mobileAuthApi.getMe()
        setUser(user)
        router.replace(user.onboardingComplete ? '/(app)' : '/(onboarding)')
      } catch {
        await secureStore.clearToken()
        router.replace('/(auth)/login')
      }
    }

    finish()
  }, [token])

  return (
    <View className="flex-1 bg-stone-50 items-center justify-center">
      <ActivityIndicator size="large" color="#44403c" />
      <Text className="text-stone-500 text-base mt-4">{AUTH_STRINGS.OAUTH_LOADING}</Text>
    </View>
  )
}
