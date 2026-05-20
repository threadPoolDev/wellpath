# apps/api/src/lib

## Purpose
Shared infrastructure — configured clients, error classes, response helpers. Imported by services and middleware; never imported directly by controllers or routes.

## Patterns & Rules
- No business logic here — pure infrastructure
- Connection errors must throw on startup so the process exits cleanly
- `errors.ts` is the single source of all AppError subclasses — never create ad-hoc error objects in features

## Contents
| File | Purpose |
|---|---|
| db.ts | Mongoose connect/disconnect + event logging |
| errors.ts | AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError, ConflictError |
| response.ts | sendSuccess(), sendCreated(), sendNoContent() |
| redis.ts | ioredis client for BullMQ (PR #13) |
| cloudinary.ts | Cloudinary SDK instance (PR #5) |
| ai.ts | AI client — Ollama or Gemini, switched via USE_LOCAL_AI (PR #9) |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Directory created |
| 2026-05-16 | feat/database-setup | db.ts |
| 2026-05-16 | architecture | errors.ts, response.ts |
