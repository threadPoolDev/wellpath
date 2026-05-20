# packages/store

## Purpose
Platform-agnostic Zustand stores. Only stores with identical shape and behavior on web and mobile live here.

## Patterns & Rules
- No platform-specific APIs (no SecureStore, no localStorage directly)
- Persistence is handled by each app using its own storage adapter
- Stores are pure Zustand — no React context wrappers

## Contents
| File/Folder | Purpose |
|---|---|
| `src/index.ts` | Shared store exports (navStore for cross-platform nav state if needed) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial store package |
