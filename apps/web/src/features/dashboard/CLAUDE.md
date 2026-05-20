# features/dashboard (web)

## Purpose
Primary daily view. Thin `Dashboard.tsx` orchestrates data; all content rendered through panel components. Evening summary replaces the full panel area — never sits alongside it.

## Patterns & Rules
- `showEveningSummary` condition: `isAfterWorkdayEnd && !eveningSubmitted` — BOTH required (BUG-03 fix)
- Evening summary REPLACES `<DashboardPanels />` in the render tree — not a sibling
- Task action gated by `isTaskActionable(taskTime)` — future tasks show "Upcoming" only
- Meeting "Ended Early" updates `freeMinutesGained` via `PATCH /routine/:id/meetings/:meetingId/end-early`
- `CalendarPanel` calls `POST /calendar/sync` on mount before fetching events — always fresh

## Contents
| File/Folder | Purpose |
|---|---|
| `Dashboard.tsx` | Thin data-fetcher — queries, mutations, derives showMorningCheckin / showEveningSummary |
| `EveningSummary.tsx` | Full content-area evening wrap-up (rating 1–5, free text) |
| `MorningCheckin.tsx` | Morning check-in card inline on dashboard |
| `components/DashboardPanels.tsx` | Tab switcher: Today / Calendar / Check-in |
| `components/TodayPanel.tsx` | Task list panel |
| `components/CalendarPanel.tsx` | Merged Google/Microsoft events + ad-hoc meetings |
| `components/CheckinPanel.tsx` | Tasks awaiting check-in response |
| `components/TaskCard.tsx` | Task card with status actions, medicine-safe buttons, formatDuration() |
| `components/MeetingCard.tsx` | Meeting card with "Ended Early" flow |
| `components/DayBanner.tsx` | Date + day-type badge |
| `components/AddMeetingForm.tsx` | Quick-add ad-hoc meeting form |
| `api.ts` | Dashboard API calls |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/dashboard | Initial Dashboard.tsx |
| 2026-05-19 | feat/adhoc-meetings | MeetingCard, AddMeetingForm; task time enforcement |
| 2026-05-19 | feat/app-shell-navigation | Decomposed into panel components |
| 2026-05-19 | fix/evening-summary-and-nav-overflow | BUG-02: evening summary as full replacement; BUG-03: server-side status check |
