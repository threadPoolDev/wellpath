# features/settings

## Purpose
Full settings screen: account info, insights toggle, group sharing toggle, travel mode sheet stub, sign-out. Travel mode sheet shows all 4 mode options with "Soon" badges (backend pending web PR #23).

## Patterns & Rules
- Profile fields updated via `PATCH /user/profile` — mutations invalidate the user query
- Sign-out uses Alert confirmation, then calls `authStore.logout()`
- Travel mode sheet is an absolute-positioned overlay — no modal navigator
- `insightsEnabled` and `groupSharingDefaults.shareWithGroups` are the two toggleable booleans

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/SettingsScreen.tsx` | Full settings screen + TravelModeSheet component |
| `api/` | Settings API calls (PATCH /user/profile) |
| `constants/settings.constants.ts` | String literals, section labels, travel mode options |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-travel-settings | SettingsScreen with all sections + TravelModeSheet stub |
