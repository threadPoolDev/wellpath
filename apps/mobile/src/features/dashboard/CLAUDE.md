# features/dashboard

## Purpose
Today screen — the primary daily view. Shows the generated routine, handles morning check-in, evening summary, and per-task status updates. Local medicine notifications scheduled here.

## Patterns & Rules
- State machine: `showMorningCheckin → showEveningSummary → routine task list`
- Medicine notifications scheduled via `useMedicineNotifications` whenever routine loads
- Task status updates use optimistic cache update via `queryClient.setQueryData`
- `isTaskActionable(taskTime)` gates action buttons — no marking future tasks done
- Medicine tasks show only Done + Remind buttons — no Skip
- `EVENING_SUMMARY_HOUR = 20` (8pm) — defined in constants

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/TodayScreen.tsx` | Main screen — state machine, mutations, query orchestration |
| `components/TaskCard.tsx` | Individual task card with status actions and missed-reason modal |
| `components/DayBanner.tsx` | Date + day-type badge (Light/Moderate/Packed) |
| `components/MorningCheckin.tsx` | 3-step check-in: energy → mood → note |
| `components/EveningSummary.tsx` | Evening wrap-up: rating + free text |
| `api/index.ts` | `dashboardApi` — all dashboard API calls + TypeScript interfaces |
| `constants/dashboard.constants.ts` | Query keys, string literals, option arrays, category icons, EVENING_SUMMARY_HOUR |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-dashboard | All files — TodayScreen, TaskCard, DayBanner, MorningCheckin, EveningSummary |
| 2026-05-19 | feat/mobile-offline-polish | OfflineBanner added to TodayScreen; medicine notifications wired; optimistic update types fixed |
