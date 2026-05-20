# features/history (web)

## Purpose
History page with two tabs: Past Routines and Trends. Trends shows a Recharts mood/energy graph and AI insight cards. Insight cards are dismissable and persist via localStorage.

## Patterns & Rules
- Dismissed insight IDs stored in `localStorage` — key: `dismissed_insights`
- If `insightsEnabled = false` in user profile → show disabled state message, no AI call made
- Empty state (< 3 days data): show "Check back in a few days" card — never fabricate insights
- Skeleton loading: 2 cards on desktop, 1 on mobile
- `GET /insights/trends` cached 24hrs server-side in Redis; client invalidates on new morning checkin

## Contents
| File/Folder | Purpose |
|---|---|
| `HistoryPage.tsx` | Two-tab page: Past Routines / Trends |
| `api.ts` | `getMoodGraph()`, `getInsights()` |
| `components/PastRoutinesList.tsx` | Past routine summary cards grouped by week |
| `components/TrendsTab.tsx` | Graph + insight cards with loading/disabled/empty states |
| `components/InsightCard.tsx` | Dismissable insight card with category icon |
| `components/MoodGraph.tsx` | Recharts LineChart — energy line + completion area |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mood-energy-trends | All files — HistoryPage, MoodGraph, InsightCard, TrendsTab, PastRoutinesList |
