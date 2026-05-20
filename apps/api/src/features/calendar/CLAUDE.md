# features/calendar

## Purpose
Calendar event cache and sync logic. Supports Google and Microsoft simultaneously.

## Patterns & Rules
- Events from both providers stored here with `provider` field
- Deduplication: same title + startTime within 2-minute window = one event (implemented in service)
- Index on `externalEventId` and `{ userId, date }`
- Calendar data never shared with groups

## Contents
| File | Purpose |
|---|---|
| calendarEvent.model.ts | Mongoose CalendarEvent schema (cache) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | CalendarEvent schema |
