# packages/constants

## Purpose
Shared constant values used by both web and mobile. No UI strings — only enums and arrays that have the same meaning on both platforms.

## Patterns & Rules
- Export only plain values: string literals, number literals, arrays, const objects
- No React, no RN, no browser APIs
- Keep in sync with `apps/api/src/constants/index.ts` for values shared with the backend

## Contents
| File/Folder | Purpose |
|---|---|
| `src/index.ts` | All shared constants (task categories, day types, sharing preferences, etc.) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial constants package |
