# features/groups

## Purpose
Groups, invites, and daily activity projections for social accountability.

## Patterns & Rules
- `medicine` and `family` task categories excluded from GroupActivity at DB query level — never a UI toggle
- `missedReason`/`didInstead` only in GroupActivity when `sharingPreference === 'with_reasons'` AND per-entry confirmed
- GroupActivity index on `{ userId, date }`
- Invite expiry handled by `expiresAt` field — 7 days from sent
- Group members in join-order — no ranking or leaderboard logic

## Contents
| File | Purpose |
|---|---|
| group.model.ts | Group schema with members subdocument |
| groupInvite.model.ts | GroupInvite schema with 7-day expiry |
| groupActivity.model.ts | Daily activity projection — excludes private categories |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | All three group schemas |
