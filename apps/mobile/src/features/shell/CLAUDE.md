# features/shell

## Purpose
Navigation shell — custom tab bar and More sheet. Does not contain any business screens; it wraps them.

## Patterns & Rules
- Groups tab is ALWAYS shown to all users — never conditional
- Relationships tab is NEVER a regular tab — it only appears in MoreSheet for married users
- MoreSheet uses spring animation (`withSpring`) — not timing animation
- `HIDDEN_ROUTES` constant lists route names that should not appear as tabs

## Contents
| File/Folder | Purpose |
|---|---|
| `components/AppTabBar.tsx` | Custom bottom tab bar — 5 tabs (Today/Routine/Groups/History/More or Settings) |
| `components/MoreSheet.tsx` | Spring-animated bottom sheet for married users (Relationships + Settings) |
| `constants/shell.constants.ts` | Tab labels, icons, HIDDEN_ROUTES, animation config |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-shell | AppTabBar, MoreSheet, shell.constants |
