# features/checkin

## Purpose
Check-in records — morning, task completion, task missed, evening summary.

## Patterns & Rules
- Index on `userId` for fast per-user queries
- `eveningSummary` only populated when `type === 'evening_summary'`
- `embedding` field stores check-in free-text embedding — medical fields never embedded

## Contents
| File | Purpose |
|---|---|
| checkin.model.ts | Mongoose Checkin schema |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | Checkin schema |
