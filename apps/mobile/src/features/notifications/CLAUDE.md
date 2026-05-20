# features/notifications

## Purpose
Notification category constants and configuration. No screens or components — all runtime notification logic lives in `src/hooks/usePushNotifications.ts` and `src/hooks/useMedicineNotifications.ts`.

## Patterns & Rules
- `NOTIFICATION_CATEGORY` enum values must match the `categoryIdentifier` strings used in notification content
- iOS action buttons defined in `NOTIFICATION_CATEGORIES` array — order matters for iOS
- Android channels defined in `usePushNotifications` hook — medicine channel has `bypassDnd: true`

## Contents
| File/Folder | Purpose |
|---|---|
| `constants/notifications.constants.ts` | `NOTIFICATION_CATEGORY` enum, `NOTIFICATION_CATEGORIES` array (iOS action buttons), `NOTIFICATION_DEEP_LINK` map |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-notifications | notifications.constants — 3 categories (task_reminder, medicine_reminder, morning_checkin) |
