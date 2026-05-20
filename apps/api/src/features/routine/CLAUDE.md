# features/routine

## Purpose
Daily routine schema — meetings, tasks, morning check-in, AI metadata. One document per user per day.

## Patterns & Rules
- Unique index on `{ userId, date }` — enforced at schema level
- Medicine tasks are fixed anchors — AI cannot move them
- `generationPromptSnapshot` must never contain medical data or medicine names
- Task statuses: pending → done | missed | skipped

## Contents
| File | Purpose |
|---|---|
| routine.model.ts | Mongoose Routine schema with embedded tasks and meetings |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | Full Routine schema |
