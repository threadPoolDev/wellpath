# features/groups

## Purpose
Groups screen with list, detail, create, and invite flows in a single-screen state machine. No nested navigation — `ScreenView` state type switches between views.

## Patterns & Rules
- `type ScreenView = 'list' | 'detail' | 'create'` — renamed from `View` to avoid RN import conflict
- Pending invites shown as banner at top of list view
- Medicine and family task categories are NEVER shown in member activity — filtered server-side
- Group sharing: `completion_only` shows no task detail; `with_task_detail` / `with_reasons` show progressively more
- Leave group uses Alert confirmation — no modal

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/GroupsScreen.tsx` | State-machine screen: list / detail / create views |
| `components/GroupListItem.tsx` | Single group row with completion bar |
| `components/MemberActivityCard.tsx` | Member card with completion bar and optional task detail |
| `api/` | Groups API calls (CRUD, invites, activity) |
| `constants/groups.constants.ts` | String literals, query keys, sharing preference labels |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-groups | All files — GroupsScreen state machine, GroupListItem, MemberActivityCard |
