# app (Expo Router file-based routes)

## Purpose
Expo Router route files only. Each file is a thin wrapper that imports the real screen from `src/features/`. No business logic here.

## Patterns & Rules
- Files here are route entry points only — import screen, export as default
- Group directories: `(app)` = authenticated routes, `(auth)` = unauthenticated, `(onboarding)` = onboarding flow
- `_layout.tsx` at each level defines the navigator (Stack, Tabs)
- Root `_layout.tsx` sets up QueryClient, SafeAreaProvider, GestureHandlerRootView, AuthInitializer, PushRegistrar

## Contents
| File/Folder | Purpose |
|---|---|
| `_layout.tsx` | Root layout — providers, auth init, push registration |
| `index.tsx` | Root redirect (→ auth or app based on onboarding state) |
| `+not-found.tsx` | 404 fallback |
| `(auth)/` | Login, Register screens |
| `(onboarding)/` | Onboarding flow |
| `(app)/` | Main app tab navigator |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial Expo Router setup, group directories |
| 2026-05-19 | feat/mobile-auth | (auth) group routes |
| 2026-05-19 | feat/mobile-shell | (app) tab group, AppTabBar |
| 2026-05-19 | feat/mobile-onboarding | (onboarding) group routes |
| 2026-05-19 | feat/mobile-notifications | PushRegistrar added to root _layout |
| 2026-05-19 | feat/mobile-offline-polish | QueryClient upgraded to offline-first config |
