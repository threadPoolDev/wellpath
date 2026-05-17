self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'WellPath', body: event.data.text() }
  }

  const { title, body, type, routineId, taskId } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: taskId ?? routineId ?? type,
      renotify: true,
      data: { type, routineId, taskId },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const { type, routineId, taskId } = event.notification.data ?? {}

  let path = '/dashboard'
  if (type === 'task_reminder' && taskId) path = `/dashboard?task=${taskId}`
  else if (type === 'checkin_prompt' && taskId) path = `/dashboard?checkin=${taskId}`
  else if (type === 'morning_checkin') path = '/dashboard?checkin=morning'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin))
        if (existing) return existing.focus().then((c) => c.navigate(path))
        return self.clients.openWindow(path)
      })
  )
})
