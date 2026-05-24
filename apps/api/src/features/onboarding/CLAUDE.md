# features/onboarding (API)

## Purpose
Onboarding Layer 1 — saves per-question responses, resumes sessions, and completes the flow by writing all answers into the User profile document.

## Layer files
| File | Role |
|---|---|
| onboarding.routes.ts | PATCH /response, GET /session, POST /complete |
| onboarding.controller.ts | Parses req, delegates to service |
| onboarding.service.ts | saveResponse, getSession, completeOnboarding + buildProfileUpdate |
| onboarding.repository.ts | findOrCreateSession, findActiveSession, upsertResponse, markSessionComplete |
| onboardingResponse.model.ts | Mongoose schema — one session per user per layer |
| onboarding.types.ts | SaveResponseDto, CompleteOnboardingDto, OnboardingSessionResponse |

## Key rules
- Each question answer is saved immediately via PATCH /response — not batched
- `droppedOffAtQuestion` is saved with every response (the NEXT question's ID), enabling resume on return
- `complete()` uses `$set` with dot-notation paths (e.g. `profile.commute.mode`) — safe for optional nested subdocs
- Medicine names stored as-is in User, but excluded from AI prompt snapshots (PR #9)
- Photo uploads are NOT sent via PATCH /response — only an 'uploaded' flag is stored (actual upload is PR #5)
- `findOrCreateSession` checks for an existing incomplete session first — avoids duplicate sessions on refresh

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | onboardingResponse.model.ts |
| 2026-05-16 | feat/onboarding | Full layer: routes, controller, service, repository, types |
