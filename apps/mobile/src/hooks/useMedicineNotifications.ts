import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'
import { NOTIFICATION_CATEGORY } from '../features/notifications/constants/notifications.constants'

export interface MedicineReminder {
  id: string          // task _id
  time: string        // "HH:MM"
  isCritical: boolean
}

// Schedules local notifications for today's medicine tasks.
// Called after routine is fetched. Fire-and-forget — failures silently swallowed.
export function useMedicineNotifications(medicines: MedicineReminder[]): void {
  useEffect(() => {
    if (!medicines || medicines.length === 0) return

    async function schedule() {
      // Cancel all existing medicine notifications first
      const scheduled = await Notifications.getAllScheduledNotificationsAsync()
      const medicineIds = scheduled
        .filter((n) => n.content.data?.isMedicine === true)
        .map((n) => n.identifier)
      await Promise.all(medicineIds.map((id) => Notifications.cancelScheduledNotificationAsync(id)))

      const today = new Date()
      const now = Date.now()

      for (const med of medicines) {
        const [h, m] = med.time.split(':').map(Number)
        const fireDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          h,
          m,
          0,
          0,
        )

        if (fireDate.getTime() <= now) continue // already past

        await Notifications.scheduleNotificationAsync({
          identifier: `medicine_${med.id}`,
          content: {
            title: 'Medicine reminder 💊',
            body: 'Time for your medicine. A small habit that keeps you going.',
            categoryIdentifier: NOTIFICATION_CATEGORY.MEDICINE_REMINDER,
            sound: 'default',
            data: { isMedicine: true, taskId: med.id, isCritical: med.isCritical },
          },
          trigger: fireDate,
        })

        // Critical: follow-up after 15 min
        if (med.isCritical) {
          const followUp = new Date(fireDate.getTime() + 15 * 60 * 1000)
          if (followUp.getTime() > now) {
            await Notifications.scheduleNotificationAsync({
              identifier: `medicine_followup_${med.id}`,
              content: {
                title: 'Did you take your medicine? 💊',
                body: 'Just checking in — did you get a chance to take your medicine?',
                categoryIdentifier: NOTIFICATION_CATEGORY.MEDICINE_REMINDER,
                sound: 'default',
                data: { isMedicine: true, taskId: med.id, isFollowUp: true },
              },
              trigger: followUp,
            })
          }
        }
      }
    }

    schedule().catch((err) => console.warn('[medicine-notifications] scheduling failed:', err))
  }, [medicines])
}
