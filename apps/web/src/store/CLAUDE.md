# apps/web/src/store

## Purpose
Zustand stores for global client-side state.

## Patterns & Rules
- One store per domain (auth, onboarding, etc.)
- Server state (API data) lives in React Query — not here
- Store files named `<domain>Store.ts`

## Contents
| File/Folder | Purpose |
|---|---|
| (empty) | Stores added per feature PR |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Directory created |
