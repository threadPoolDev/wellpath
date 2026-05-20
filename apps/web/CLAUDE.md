# apps/web

## Purpose
React + TypeScript frontend for WellPath. Built with Vite, styled with Tailwind CSS and shadcn/ui.

## Patterns & Rules
- Path alias `@/` maps to `src/` — use it everywhere, no relative `../../` imports
- All UI primitives come from shadcn/ui (`src/components/ui/`) — don't build from scratch
- State: Zustand for client state, React Query for server state
- Router: React Router v6 — routes defined in `App.tsx` and expanded per feature PR
- Constants: all enums and static values in `src/constants/index.ts`
- ENV: only `VITE_` prefixed vars are accessible in browser; never expose secrets

## Contents
| File/Folder | Purpose |
|---|---|
| src/ | All application source code |
| public/sw.js | Service worker stub (implemented in PR #13) |
| index.html | App entry HTML |
| vite.config.ts | Vite config with `@/` alias |
| tailwind.config.ts | Tailwind + shadcn CSS variable tokens |
| postcss.config.js | PostCSS for Tailwind |
| components.json | shadcn/ui config |
| tsconfig*.json | TypeScript project references setup |
| eslint.config.js | ESLint v9 flat config |
| .prettierrc.json | Prettier with tailwindcss plugin |
| .env.example | All required env vars documented |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Initial Vite + React + TS + Tailwind + shadcn setup |
