# apps/web/src

## Purpose
All React application source code.

## Patterns & Rules
- Feature code lives in `features/<feature-name>/` — not in top-level `components/`
- Shared UI primitives go in `components/` (e.g. Avatar)
- Hooks shared across features go in `hooks/`
- Never import from a sibling feature — only from `components/`, `hooks/`, `lib/`, `store/`, `constants/`, `types/`

## Contents
| File/Folder | Purpose |
|---|---|
| main.tsx | App entry point |
| App.tsx | Root component, QueryClient, BrowserRouter |
| index.css | Tailwind directives + shadcn CSS variables |
| components/ | Shared UI components (Avatar, etc.) |
| features/ | Feature-scoped code (auth, onboarding, dashboard, …) |
| hooks/ | Shared custom hooks |
| lib/ | Utility functions (cn, api client, etc.) |
| store/ | Zustand stores |
| constants/ | All enums and static values |
| types/ | Shared TypeScript types |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Initial src structure |
