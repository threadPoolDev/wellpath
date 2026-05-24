import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { router } from 'expo-router'
import { apiClient } from '../lib/apiClient'
import {
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_DEEP_LINK,
} from '../features/notifications/constants/notifications.constants'

// Foreground: show banner + sound even when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

async function setupCategories(): Promise<void> {
  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES[0].identifier,
    NOTIFICATION_CATEGORIES[0].actions,
    NOTIFICATION_CATEGORIES[0].options,
  )
  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES[1].identifier,
    NOTIFICATION_CATEGORIES[1].actions,
    NOTIFICATION_CATEGORIES[1].options,
  )
  await Notifications.setNotificationCategoryAsync(
    NOTIFICATION_CATEGORIES[2].identifier,
    NOTIFICATION_CATEGORIES[2].actions,
    NOTIFICATION_CATEGORIES[2].options,
  )
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[push] Push notifications not available on simulator')
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true, // for medicine reminders
      },
    })
    finalStatus = status
  }

  if (finalStatus !== 'granted') {
    console.warn('[push] Permission not granted')
    return null
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'WellPath reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#78716c',
    })
    await Notifications.setNotificationChannelAsync('medicine', {
      name: 'Medicine reminders',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#78716c',
      bypassDnd: true, // medicine bypasses Do Not Disturb
    })
  }

  const tokenResponse = await Notifications.getExpoPushTokenAsync()
  return tokenResponse.data
}

async function sendTokenToBackend(token: string): Promise<void> {
  try {
    await apiClient.post('/notifications/expo-token', { token })
  } catch (err) {
    console.warn('[push] Token registration failed:', err)
  }
}

function handleNotificationResponse(response: Notifications.NotificationResponse): void {
  const data = response.notification.request.content.data as Record<string, unknown>
  const type = data?.type as string | undefined
  const actionId = response.actionIdentifier

  // Quick action: DONE via notification banner (no app open required)
  if (actionId === 'DONE' || actionId === 'SKIP' || actionId === 'REMIND_10') {
    // For now navigate to app — task update requires app context
    // Full background task handling is in PR #M10 (offline queue)
    router.push('/(app)')
    return
  }

  // Tap on notification body → deep link
  if (type && NOTIFICATION_DEEP_LINK[type]) {
    router.push(NOTIFICATION_DEEP_LINK[type] as Parameters<typeof router.push>[0])
  }
}

export function usePushNotifications(isAuthenticated: boolean): void {
  const responseListenerRef = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    // Set up iOS notification categories
    setupCategories().catch((err) => console.warn('[push] category setup failed:', err))

    // Register and send token to backend — fire-and-forget
    registerForPushNotifications()
      .then((token) => {
        if (token) return sendTokenToBackend(token)
      })
      .catch((err) => console.warn('[push] registration failed:', err))

    // Listen for notification tap / action button press
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse,
    )

    return () => {
      if (responseListenerRef.current) {
        Notifications.removeNotificationSubscription(responseListenerRef.current)
      }
    }
  }, [isAuthenticated])
}
