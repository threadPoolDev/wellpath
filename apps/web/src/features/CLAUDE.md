# apps/web/src/features

## Purpose
Feature-scoped code. Each subfolder owns everything for that feature: components, hooks, API calls, types.

## Patterns & Rules
- One folder per feature, named after the PR branch (auth, onboarding, dashboard, etc.)
- Features do not import from each other — shared logic goes in `src/hooks/`, `src/lib/`, or `src/store/`
- Each feature folder gets its own `CLAUDE.md` when created

## Contents
| File/Folder | Purpose |
|---|---|
| auth/ | Login, register, OAuth (PR #3) |
| onboarding/ | Layer 1 card-swipe onboarding (PR #4) |
| dashboard/ | Today's routine view (PR #10) |
| routine/ | Routine display components |
| checkin/ | Task check-ins (PR #11) |
| groups/ | Groups UI (PR #18) |
| profile/ | Profile photo + settings (PR #5, #16) |
| settings/ | App settings (PR #16) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Directory created |
