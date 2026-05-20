# features/settings (web)

## Purpose
Settings page — profile management, calendar connections, medicines, sleep/exercise/focus preferences, group sharing defaults, and the insights on/off toggle.

## Patterns & Rules
- `PATCH /user/profile` is the single update endpoint — always patch the full profile object
- Profile re-embedding fires server-side on every save (fire-and-forget in the backend)
- Calendar management (connect/disconnect) redirects to the OAuth flow
- Medicine list: add, edit, remove — max 5 enforced in Layer 1, unlimited in Settings
- `insightsEnabled` toggle controls the Trends tab visibility in HistoryPage

## Contents
| File/Folder | Purpose |
|---|---|
| `SettingsPage.tsx` | Full settings page — all sections in one scrollable view |
| `api.ts` | `getProfile()`, `updateProfile(dto)` |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/settings | SettingsPage with all sections |
| 2026-05-19 | feat/mood-energy-trends | insightsEnabled toggle added to settings |
