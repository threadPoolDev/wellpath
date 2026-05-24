# dashboard/components

## Purpose
Reusable display components for the Today screen. No API calls here — all data and mutations passed as props from TodayScreen.

## Patterns & Rules
- Props-driven: no `useQuery` or `useMutation` inside these components
- `TaskCard` is the most complex — it owns its own missed-reason Modal state
- `isMedicineTask(category)` helper determines button layout — never hardcode category strings

## Contents
| File | Purpose |
|---|---|
| `TaskCard.tsx` | Task row with time, category icon, status buttons, missed-reason modal |
| `DayBanner.tsx` | Top banner showing date and day type (Light / Moderate / Packed) |
| `MorningCheckin.tsx` | 3-step check-in wizard: energy → mood → note |
| `EveningSummary.tsx` | Evening wrap-up: emoji rating + optional free-text |

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-19 | feat/mobile-dashboard | Initial TaskCard, DayBanner, MorningCheckin, EveningSummary | Claude |
