# features/streak

## Purpose
Frontend streak UI. Flame icon in TopBar shows current streak count. Clicking opens StreakPanel (right-side drawer with stats and 30-day dot calendar).

## Contents
| File | Purpose |
|---|---|
| `api.ts` | `fetchStreak()` — GET /streak → StreakData |
| `StreakPanel.tsx` | Right-side drawer (320px, 200ms slide) — stats + StreakCalendar |
| `components/StreakCalendar.tsx` | 30-day dot grid — complete/grace/missed/future/pending states |

## Patterns & Rules
- Flame icon 🔥 always visible when user is logged in; `opacity-40` when streak === 0
- StreakPanel uses React Query `refetchInterval: 5 * 60 * 1000` while open
- StreakCalendar renders 35 slots (5×7), pads leading empty cells so days align correctly
- Skeleton shown during loading — never a spinner
- `dark:` variants applied to all components

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-21 | feat/compassionate-streak | api.ts, StreakPanel.tsx, StreakCalendar.tsx; flame icon in TopBar | Claude |
