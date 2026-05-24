# features/groups (web)

## Purpose
Groups page with two-column desktop layout (list + detail side by side) and full-screen list→detail on mobile. Create group, invite by email, view member activity, manage sharing preferences.

## Patterns & Rules
- Medicine and family tasks NEVER appear in member activity — filtered server-side
- Member cards in join-order — NO ranking, NO leaderboard
- 100% completion: subtle star only — not a trophy or podium
- Missed tasks shown in muted tone, never red
- `GroupsPanel` handles internal navigation via state — not React Router routes

## Contents
| File/Folder | Purpose |
|---|---|
| `GroupsPage.tsx` | Thin wrapper rendering `<GroupsPanel />` |
| `api.ts` | All groups API calls (CRUD, invites, activity, sharing) |
| `components/GroupsPanel.tsx` | Two-column shell (desktop) / list+detail state machine (mobile) |
| `components/GroupList.tsx` | Left-column group list |
| `components/GroupListItem.tsx` | Single group row with completion bar |
| `components/GroupDetail.tsx` | Right-column group detail with member cards |
| `components/MemberCard.tsx` | Member activity card — own card highlighted |
| `components/GroupSettings.tsx` | Sharing preferences + leave group |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/groups-ui | Initial GroupsPage, all components |
| 2026-05-19 | feat/app-shell-navigation | Decomposed into GroupsPanel two-column layout |
