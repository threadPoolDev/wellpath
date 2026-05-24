# features/onboarding

## Purpose
9-card swipe onboarding flow. Each question is a full-screen card with Gesture.Pan() swipe + Reanimated 3 animations. Answers saved fire-and-forget to the API on every selection.

## Patterns & Rules
- Card swipe: 80px threshold, bounce-back shake if no answer selected, ±5deg rotation
- `useOnboardingFlow` hook owns question filtering via `showIf` predicates — never filter in JSX
- Each answer type is its own component in `components/answers/`
- Progress bar fills on answer selection, not on Next press
- Skip = 50% of question weight in progress calculation
- `droppedOffAtQuestion` saved on session end for resume support

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/OnboardingScreen.tsx` | Main flow — card renderer, progress, navigation |
| `components/OnboardingCard.tsx` | Card shell with swipe gesture and rotation animation |
| `components/OnboardingProgress.tsx` | Animated progress bar |
| `components/answers/` | Answer type components (9 types) |
| `hooks/useOnboardingFlow.ts` | Question list with showIf filtering, active question management |
| `questions/essentialQuestions.ts` | 10 Layer 1 question definitions |
| `api/` | `PATCH /onboarding/response` and `POST /onboarding/complete` |
| `constants/onboarding.constants.ts` | String literals, swipe thresholds, progress labels |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-onboarding | All files — 9 answer types, swipe gestures, useOnboardingFlow hook |
