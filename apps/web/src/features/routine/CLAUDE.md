# features/routine (web)

## Purpose
Routine API calls — fetching and mutating routine data. The "My Routine" nav item currently redirects to dashboard; full history view is in `features/history`.

## Contents
| File/Folder | Purpose |
|---|---|
| `api.ts` | `getTodayRoutine()`, `addAdHocMeeting()`, `endMeetingEarly()`, `updateTaskStatus()` |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/ai-routine-engine | Initial routine API |
| 2026-05-19 | feat/adhoc-meetings | addAdHocMeeting, endMeetingEarly |
| 2026-05-19 | feat/task-checkin | updateTaskStatus |
