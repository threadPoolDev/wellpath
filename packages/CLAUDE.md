# packages

## Purpose
Shared workspace packages consumed by both `apps/web` and `apps/mobile`. Platform-agnostic only — no React Native or browser-specific imports.

## Patterns & Rules
- No UI code ever goes in packages/ — only types, constants, and pure logic
- All packages use `"*"` version in workspace consumers (e.g. `"@wellpath/types": "*"`)
- Each package has its own `package.json`, `tsconfig.json`, and `src/index.ts` barrel export

## Contents
| Folder | Purpose |
|---|---|
| `constants/` | Shared enum values and constant arrays (no UI strings) |
| `types/` | Shared TypeScript interfaces used by both web and mobile |
| `api-client/` | Base fetch utility with auth token injection |
| `store/` | Platform-agnostic Zustand stores (e.g. navStore) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | All four packages created |
