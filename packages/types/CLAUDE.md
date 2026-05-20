# packages/types

## Purpose
Shared TypeScript interfaces and types used by both web and mobile apps.

## Patterns & Rules
- Types only — no runtime values, no logic
- Must compile cleanly with `tsconfig` that has no platform-specific lib
- Interfaces match the MongoDB document shapes from the API

## Contents
| File/Folder | Purpose |
|---|---|
| `src/index.ts` | All shared interfaces: User, Routine, RoutineTask, Checkin, Group, etc. |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial types package |
