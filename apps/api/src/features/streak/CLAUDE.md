# features/streak

## Purpose
Compassionate streak system. Measures consistency, not perfection: ≥60% completion = a valid streak day. One grace day per rolling 7-day window (resets Monday 00:00). Milestone push notifications at 3, 7, 14, 30, 60, 100 days.

## Layer files
| File | Role |
|---|---|
| streak.types.ts | StreakDay, StreakDayStatus, StreakResponse DTOs |
| streak.service.ts | getStreak, calculateStreakForUser, runNightlyStreakUpdate, milestone firing |
| streak.controller.ts | GET /streak |
| streak.routes.ts | Router — requireAuth |

## Streak schema (on User document)
```
streak: {
  current, personalBest, lastStreakDate, graceDaysUsedThisWeek,
  graceWeekStartDate, totalDaysCompleted, milestonesSeen[]
}
```

## Key rules
- Grace counter resets every Monday 00:00 in the user's timezone
- `calculateStreakForUser` is idempotent — skips if `lastStreakDate === today`
- Milestone notifications are fire-and-forget (non-fatal if push fails)
- `runNightlyStreakUpdate` called by node-cron at 23:59 in `src/index.ts`
- Constants: `STREAK`, `STREAK_DAY_STATUSES`, `STREAK_MILESTONE_COPY` in constants/index.ts

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-21 | feat/compassionate-streak | streak.types.ts, streak.service.ts, streak.controller.ts, streak.routes.ts | Claude |
