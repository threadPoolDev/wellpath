# features/calendar (web)

## Purpose
Calendar connection management and event display. Handles Google and Microsoft OAuth flows, event sync, and the CalendarConnectBanner for onboarding.

## Patterns & Rules
- Auth provider and calendar provider are FULLY DECOUPLED — a Google-auth user can connect Microsoft Calendar
- `POST /calendar/sync` must be called before fetching events to ensure today's data is fresh
- Events from both providers merged client-side; deduplication is server-side
- `CalendarConnectBanner` shown in onboarding and Settings — not in the shell

## Contents
| File/Folder | Purpose |
|---|---|
| `api.ts` | `getCalendarEvents(date)`, `syncCalendar()`, `getConnections()`, `disconnectProvider(provider)` |
| `components/CalendarConnectBanner.tsx` | Connect Google/Microsoft calendar button with "Connected ✓" state |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/calendar-integration | Initial calendar OAuth + event fetch |
| 2026-05-19 | feat/app-shell-navigation | CalendarPanel moved to dashboard/components; CalendarConnectBanner kept here |
| 2026-05-19 | Post-ship fix | CalendarPanel rewritten to call GET /calendar/events; sync-on-mount added |
