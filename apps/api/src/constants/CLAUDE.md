# apps/api/src/constants

## Purpose
All backend enums and static values. Single source of truth — used in schemas, services, and route handlers.

## Patterns & Rules
- Never hardcode enum strings inline — always import from here
- Keep in sync with Mongoose schema enum arrays

## Contents
| File/Folder | Purpose |
|---|---|
| index.ts | All backend constants (task categories, day types, notification types, etc.) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Full constants from planning doc |
| 2026-05-21 | feat/compassionate-streak | STREAK, STREAK_DAY_STATUSES, STREAK_MILESTONE_COPY |
