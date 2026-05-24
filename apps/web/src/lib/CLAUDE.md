# apps/web/src/lib

## Purpose
Pure utility functions and configured third-party client instances.

## Patterns & Rules
- No React — plain TypeScript only
- `utils.ts` is the shadcn `cn()` helper — do not rename or move it

## Contents
| File/Folder | Purpose |
|---|---|
| utils.ts | `cn()` — Tailwind class merge helper (shadcn standard) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | utils.ts with cn() |
