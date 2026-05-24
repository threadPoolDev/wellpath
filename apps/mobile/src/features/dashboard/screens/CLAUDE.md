# dashboard/screens

## Contents
| File | Purpose |
|---|---|
| `TodayScreen.tsx` | Main Today screen — state machine (morning check-in → evening summary → task list). Orchestrates all queries and mutations. Schedules medicine notifications via useMedicineNotifications. |

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-19 | feat/mobile-dashboard | TodayScreen | Claude |
| 2026-05-19 | feat/mobile-offline-polish | OfflineBanner, medicine notifications, offline-first QueryClient wiring, optimistic update type fixes | Claude |
