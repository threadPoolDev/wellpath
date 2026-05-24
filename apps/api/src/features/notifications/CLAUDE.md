# features/notifications

## Purpose
Notification log and dispatch. All sent notifications recorded here.

## Patterns & Rules
- Notifications are scheduled via BullMQ, not sent directly from controllers
- `deliveryStatus` updated after Web Push attempt
- Critical medicine notifications bypass DND — handled at dispatch level

## Contents
| File | Purpose |
|---|---|
| notification.model.ts | Mongoose Notification schema (log) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | Notification schema |
