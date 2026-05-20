# apps/web/src/constants

## Purpose
All frontend enums, static values, and configuration constants.

## Patterns & Rules
- Every constant that appears in more than one place must live here
- Never hardcode enum values inline in components or logic
- `index.ts` is the single export point

## Contents
| File/Folder | Purpose |
|---|---|
| index.ts | All frontend constants (routes, options, swipe config, etc.) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Full constants from planning doc |
