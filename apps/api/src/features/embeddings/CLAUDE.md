# features/embeddings

## Purpose
Embedding pipeline — converts user profile text and check-in free-text into vector embeddings for personalised routine suggestions.

## Patterns & Rules
- Medical fields (`health`, `medicines`) are NEVER embedded — excluded in `buildProfileText()`
- Personal life answers are only embedded if `personalLifeConsented: true`
- All embedding calls are fire-and-forget — never block request/response paths
- Provider matches `USE_LOCAL_AI`: `nomic-embed-text` via Ollama or `text-embedding-004` via Gemini

## Contents
| File | Purpose |
|---|---|
| embeddings.service.ts | `embedUserProfile()`, `embedCheckin()` |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-17 | feat/embeddings | embeddings.service.ts |
