# features/travel (web)

## Purpose
Travel mode UI — stub for web PR #23. Travel time estimation API calls used during onboarding and settings to pre-fill commute duration.

## Patterns & Rules
- `GET /travel/estimate` is rate-limited to 10 calls per user per day
- On API failure → `{ fallback: true }` → show manual duration input instead
- Travel mode UI (sheet, banner) will be built in PR #23

## Contents
| File/Folder | Purpose |
|---|---|
| `api.ts` | `getTravelEstimate(home, office, mode)` → `{ durationMinutes, distanceKm, source }` |
| `components/` | Placeholder — TravelModeSheet and TravelModeBanner come in PR #23 |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/travel-time | Initial travel estimate API |
