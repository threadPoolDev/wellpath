import * as Notifications from 'expo-notifications'

// Notification category IDs (iOS action buttons)
export const NOTIFICATION_CATEGORY = {
  TASK_REMINDER: 'TASK_REMINDER',
  MEDICINE_REMINDER: 'MEDICINE_REMINDER',
  MORNING_CHECKIN: 'MORNING_CHECKIN',
  EVENING_SUMMARY: 'EVENING_SUMMARY',
} as const

// Deep link paths mapped to notification types
export const NOTIFICATION_DEEP_LINK: Record<string, string> = {
  task_reminder: '/(app)',
  checkin_prompt: '/(app)',
  morning_checkin: '/(app)',
  evening_summary: '/(app)',
  free_time_suggestion: '/(app)',
}

// iOS notification categories with action buttons
export const NOTIFICATION_CATEGORIES: Notifications.NotificationCategory[] = [
  {
    identifier: NOTIFICATION_CATEGORY.TASK_REMINDER,
    actions: [
      {
        identifier: 'DONE',
        buttonTitle: 'Mark Done ✓',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
      {
        identifier: 'SKIP',
        buttonTitle: 'Skip',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
    ],
    options: { allowAnnouncement: true },
  },
  {
    identifier: NOTIFICATION_CATEGORY.MEDICINE_REMINDER,
    actions: [
      {
        identifier: 'DONE',
        buttonTitle: 'Taken ✓',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
      {
        identifier: 'REMIND_10',
        buttonTitle: 'Remind in 10 min',
        options: { isDestructive: false, isAuthenticationRequired: false },
      },
    ],
    options: { allowAnnouncement: true },
  },
  {
    identifier: NOTIFICATION_CATEGORY.MORNING_CHECKIN,
    actions: [
      {
        identifier: 'OPEN',
        buttonTitle: 'Start Check-in',
        options: { isDestructive: false, isAuthenticationRequired: false, opensAppToForeground: true },
      },
    ],
    options: { allowAnnouncement: false },
  },
]

export const NOTIFICATIONS_STRINGS = {
  PERMISSION_DENIED: 'Notification permission denied — reminders will not be sent.',
  SIMULATOR_WARNING: 'Push notifications are not available on simulator.',
  TOKEN_REGISTER_FAIL: 'Could not register push token — notifications may not arrive.',
} as const
