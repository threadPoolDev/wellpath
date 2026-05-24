# src/store

## Purpose
Zustand auth store for the mobile app. Shared store package (`@wellpath/store`) is also available for cross-platform state, but mobile-specific auth state lives here.

## Patterns & Rules
- `authStore` is the single source of truth for user session on mobile
- `initialize()` reads token from SecureStore on app launch — called once in root `_layout.tsx`
- `logout()` clears SecureStore token AND Zustand state

## Contents
| File/Folder | Purpose |
|---|---|
| `authStore.ts` | Zustand store: `user`, `token`, `initialize()`, `setUser()`, `logout()` |
| `index.ts` | Re-exports from authStore |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-auth | authStore with SecureStore integration |
