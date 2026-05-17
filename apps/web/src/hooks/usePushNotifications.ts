import { useEffect } from 'react'
import { apiClient } from '@/lib/apiClient'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  const arr = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i)
  return arr as Uint8Array<ArrayBuffer>
}

async function registerAndSubscribe(): Promise<void> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return

  const reg = await navigator.serviceWorker.register('/sw.js')
  await navigator.serviceWorker.ready

  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
  if (!vapidKey) return

  const existing = await reg.pushManager.getSubscription()
  if (existing) return // already subscribed, skip re-posting

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  })

  await apiClient.post('/notifications/subscribe', subscription.toJSON())
}

export function usePushNotifications(isAuthenticated: boolean): void {
  useEffect(() => {
    if (!isAuthenticated) return
    registerAndSubscribe().catch((err) =>
      console.warn('[push] setup failed:', err)
    )
  }, [isAuthenticated])
}
