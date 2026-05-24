# features/checkin (web)

## Purpose
Task check-in API calls and the evening summary component. Morning check-in lives in `features/dashboard`.

## Patterns & Rules
- `EveningSummary.tsx` is rendered as a full content-area replacement in Dashboard.tsx — never inline alongside task list
- `POST /checkin/evening` with `{ skipped: true }` marks the evening as done so it doesn't reappear (BUG-03)
- `GET /checkin/evening/status` mirrors the morning status pattern — returns `{ submitted, date }`

## Contents
| File/Folder | Purpose |
|---|---|
| `api.ts` | `getEveningStatus()`, `submitEveningCheckin(dto)`, `updateTaskStatus(routineId, taskId, dto)` |
| `EveningSummary.tsx` | Evening wrap-up card (web version) — rating 1–5, optional free text |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/evening-summary | EveningSummary component, evening checkin API |
| 2026-05-19 | fix/evening-summary-and-nav-overflow | BUG-02/03 fixes applied |
