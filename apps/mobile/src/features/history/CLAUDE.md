# features/history

## Purpose
History screen with two tabs: Past Routines and Trends. Trends shows mood/energy bar chart and AI insight cards. Streak teaser card (backend pending web PR #21).

## Patterns & Rules
- Dismissed insight card IDs persisted in AsyncStorage — never re-shown after dismiss
- `getMoodGraph()` API handles both `data: []` and `data: { data: [] }` response shapes
- If `insightsEnabled = false` on user profile → insights API returns `{ disabled: true }` → show disabled state, no graph
- Streak shown as teaser only — real backend comes in web PR #21
- InsightCardSkeleton used during loading — never a spinner

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/HistoryScreen.tsx` | Two-tab screen: Past Routines + Trends |
| `components/InsightCard.tsx` | AI insight card with dismiss (×) button |
| `components/MoodGraph.tsx` | Scrollable horizontal bar chart (energy + completion stacked bars) |
| `api/index.ts` | `getMoodGraph()`, `getInsights()` — hits `/insights/mood-graph` and `/insights/trends` |
| `constants/history.constants.ts` | Query keys, tab labels, insight type icons, skeleton counts |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-streak-insights | All files — HistoryScreen, InsightCard, MoodGraph, streak teaser |
