# features/weekly (web)

## Purpose
Weekly reset flow — full-screen 5-card overlay. Users reflect on last week and set an intention for the coming week. Triggered by Monday dashboard banner or Sunday/Monday push notification.

## Patterns & Rules
- `WeeklyResetFlow` renders as a fixed full-screen overlay (z-50) — rendered inside `Dashboard.tsx` when `showWeeklyFlow` is true
- Monday banner shown only when: it is Monday AND `getCurrentReflection()` returns `{ exists: false }` AND `localStorage['weekly_reflection_dismissed:<weekStartDate>']` is not set
- Dismiss stores `weekly_reflection_dismissed:<weekStartDate>` in localStorage — banner does not reappear on same Monday after dismiss
- Card 4 (PreviewCard) fetches `/weekly-reflection/preview` lazily on card render — not before
- Card 5 (AIIntentionCard) calls `POST /weekly-reflection` — response contains `aiWeeklyIntention`
- All API calls use `@/lib/apiClient` (axios instance) — response shape `{ data: T }`

## Contents
| File | Purpose |
|---|---|
| `WeeklyResetFlow.tsx` | Full 5-card flow with FlowProgress, RatingCard, WinCard, IntentionCard, PreviewCard, AIIntentionCard |
| `api.ts` | `getCurrentReflection()`, `getWeekPreview()`, `submitReflection()` |

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-24 | feat/weekly-reset-ritual | WeeklyResetFlow, api.ts | Claude |
