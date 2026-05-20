# src/features

## Purpose
Feature-sliced architecture. Each subdirectory is one self-contained feature with its own screens, components, API layer, hooks, and constants.

## Patterns & Rules
- Structure per feature: `screens/`, `components/`, `api/`, `constants/`, `hooks/` (if needed)
- Every feature MUST have `constants/<feature>.constants.ts` with all string literals and query keys
- Cross-feature imports are allowed only from `src/components/`, `src/hooks/`, `src/lib/`, `src/store/`
- Features never import from each other directly

## Contents
| Folder | Purpose |
|---|---|
| `auth/` | Login and Register screens |
| `dashboard/` | Today screen — routine tasks, morning check-in, evening summary |
| `groups/` | Groups list, detail, create, invite |
| `history/` | History screen with mood graph and AI insight cards |
| `notifications/` | Notification category constants (no screens — logic in hooks) |
| `onboarding/` | 9-card swipe onboarding flow |
| `settings/` | Full settings screen + travel mode sheet |
| `shell/` | AppTabBar and MoreSheet (navigation shell) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-auth | auth/ |
| 2026-05-19 | feat/mobile-shell | shell/ |
| 2026-05-19 | feat/mobile-onboarding | onboarding/ |
| 2026-05-19 | feat/mobile-dashboard | dashboard/ |
| 2026-05-19 | feat/mobile-notifications | notifications/ |
| 2026-05-19 | feat/mobile-groups | groups/ |
| 2026-05-19 | feat/mobile-streak-insights | history/ |
| 2026-05-19 | feat/mobile-travel-settings | settings/ |
