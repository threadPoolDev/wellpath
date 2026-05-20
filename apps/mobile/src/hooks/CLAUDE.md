# src/hooks

## Purpose
Shared custom hooks used across multiple features. All hooks are side-effect focused — data fetching hooks live in each feature's `api/` folder.

## Patterns & Rules
- All hooks are fire-and-forget where applicable (push registration, medicine scheduling)
- Hooks never return JSX — they return state or callbacks only
- `usePushNotifications` must be called from root `_layout.tsx` — not inside a screen

## Contents
| File/Folder | Purpose |
|---|---|
| `useBiometricLock.ts` | Prompts Face ID / Touch ID on app foreground return |
| `useMedicineNotifications.ts` | Schedules local notifications for today's medicine tasks; cancels+reschedules on every routine load. Uses plain `Date` trigger (expo-notifications 0.28.x API) |
| `useNetworkStatus.ts` | NetInfo subscription → `{ isConnected, isInternetReachable }` |
| `usePushNotifications.ts` | Registers for Expo push token, sets up iOS categories, deep links on notification tap |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-auth | useBiometricLock |
| 2026-05-19 | feat/mobile-notifications | usePushNotifications |
| 2026-05-19 | feat/mobile-offline-polish | useNetworkStatus, useMedicineNotifications |
| 2026-05-19 | fix | useMedicineNotifications: SchedulableTriggerInputTypes → plain Date trigger (0.28.x); usePushNotifications: EventSubscription → Subscription, removed shouldShowBanner/shouldShowList |
