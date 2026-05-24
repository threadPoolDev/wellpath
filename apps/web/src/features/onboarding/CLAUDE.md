# features/onboarding (web)

## Purpose
Layer 1 onboarding — card-swipe UI, 10 essential questions, medicine sub-flow, business owner fork, per-question API save, resume on return.

## Files
| File | Role |
|---|---|
| api.ts | onboardingApi — saveResponse, getSession, complete |
| OnboardingFlow.tsx | Main orchestrator — manages answers state, filtered questions, progress, API calls |
| questions/essentialQuestions.ts | All question definitions with showIf branching logic |
| components/OnboardingCard.tsx | Full-screen card shell — swipe gesture, tint overlays, footer actions |
| components/OnboardingProgress.tsx | Progress bar — fills on answer, warm copy labels |
| components/OnboardingSkip.tsx | Skip button — consistent left placement |
| components/SwipeHint.tsx | Desktop hint — shown once, stored in localStorage |
| components/answers/YesNoAnswer.tsx | Yes / No / Prefer not to say |
| components/answers/SingleSelectAnswer.tsx | Single option select with keyboard number shortcuts |
| components/answers/MultiSelectAnswer.tsx | Multi-select with checkboxes |
| components/answers/TimePickerAnswer.tsx | HTML time input, large display |
| components/answers/TextAnswer.tsx | Free text, auto-focused |
| components/answers/MedicineFormAnswer.tsx | Add up to 5 medicines with timings, withFood, isCritical |
| components/answers/CalendarConnectAnswer.tsx | Google / Microsoft buttons (full OAuth redirect) |
| components/answers/PhotoUploadAnswer.tsx | File picker + circular preview (upload happens in PR #5) |

## Color language
| Action | Color |
|---|---|
| Swipe right / Continue / Selected | Soft sage green (sage-100 bg, sage-500 border) |
| Swipe left / Skip | Warm muted grey (stone-) |
| Unanswered right swipe | Card shake animation — no color change |
| Progress bar fill | sage-400 |

## Key rules
- Questions filtered by `showIf(answers)` on every render — active set is always correct
- Progress calculated from weights of active questions only (not all questions)
- `timeToAnswerSeconds` tracked per question from mount time
- Photo data URLs are NOT sent to the API — only 'uploaded' flag
- Session resume: on mount, calls GET /session → restores answers state + currentIndex
- 100% progress → 800ms pause → navigate to /dashboard
- Skip adds 50% of question weight to progress
- Never red for skip or missed answers

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/onboarding | Full onboarding flow — all components, hooks, question definitions |
