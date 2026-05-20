# apps/web/src/hooks

## Purpose
Custom React hooks shared across features.

## Patterns & Rules
- Only hooks used by 2+ features live here
- Feature-local hooks stay inside `features/<name>/`
- Named `use<Thing>.ts` always

## Contents
| File/Folder | Purpose |
|---|---|
| useSwipeGesture.ts | Touch swipe detection — 80px threshold, ±5deg rotation, bounce-back shake on unanswered right swipe |
| useKeyboardNav.ts | Keyboard nav — ArrowLeft/Right + number keys 1–4 for option selection |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Directory created |
| 2026-05-16 | feat/onboarding | useSwipeGesture, useKeyboardNav |
