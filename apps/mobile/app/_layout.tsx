import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuthStore } from '../src/store/authStore'
import { usePushNotifications } from '../src/hooks/usePushNotifications'
import '../global.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
      // Keep data in cache for 10 minutes when offline
      gcTime: 10 * 60 * 1000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations up to 3 times — handles transient network failures
      retry: 3,
      networkMode: 'offlineFirst',
    },
  },
})

function AuthInitializer() {
  const initialize = useAuthStore((s) => s.initialize)
  useEffect(() => { initialize() }, [])
  return null
}

function PushRegistrar() {
  const user = useAuthStore((s) => s.user)
  usePushNotifications(!!user)
  return null
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthInitializer />
          <PushRegistrar />
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
