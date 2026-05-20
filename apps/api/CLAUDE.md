# apps/api

## Purpose
Node.js + Express + TypeScript backend for WellPath.

---

## Architecture — Layered Modular Pattern

Every feature follows this exact layer stack. No exceptions.

```
src/features/<name>/
├── <name>.routes.ts       Express Router — maps paths to controller methods only
├── <name>.controller.ts   Parses req, calls service, sends res — no Mongoose, no business logic
├── <name>.service.ts      Business logic — calls repositories, throws AppError — no Express types
├── <name>.repository.ts   Mongoose queries only — returns plain objects/docs — no business logic
├── <name>.model.ts        Mongoose schema + TypeScript interface
└── <name>.types.ts        DTOs, request/response shapes, shared types for this feature
```

### Layer responsibilities (strict)

| Layer | Allowed | Forbidden |
|---|---|---|
| Route | Call controller methods, apply middleware | Business logic, DB access |
| Controller | `req`/`res`, call service, call `sendSuccess`/`sendCreated` | Mongoose, business logic |
| Service | Orchestrate repositories, throw `AppError` subclasses | `req`/`res`, Mongoose queries |
| Repository | Mongoose model calls (`find`, `create`, `updateOne`, etc.) | Business logic, `req`/`res` |

### Shared infrastructure

```
src/lib/
├── db.ts           MongoDB connect/disconnect
├── errors.ts       AppError, NotFoundError, UnauthorizedError, ForbiddenError,
│                   ValidationError, ConflictError
├── response.ts     sendSuccess(), sendCreated(), sendNoContent()
├── redis.ts        ioredis client (PR #13)
├── cloudinary.ts   Cloudinary SDK (PR #5)
└── ai.ts           AI client — Ollama or Gemini via USE_LOCAL_AI (PR #9)

src/middleware/
├── requireAuth.ts  JWT validation, attaches req.user
└── errorHandler.ts Catches AppError and unknown errors, formats JSON response

src/router.ts       Central mount point — one line per feature router
src/index.ts        Express app setup, DB connect, mount router + errorHandler
```

### Error handling flow

Service throws `AppError` subclass → propagates to controller via `next(err)` or async catch → `errorHandler` middleware formats the response.

Controllers must wrap async logic in try/catch and call `next(err)`:
```ts
export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getById(req.user.userId)
    sendSuccess(res, user)
  } catch (err) {
    next(err)
  }
}
```

### Route registration

Routes are never self-registered. Each PR adds one `router.use(...)` line to `src/router.ts`.

---

## Patterns & Rules
- All enum values imported from `constants/index.ts`
- ENV via `process.env.*` — throw on missing at startup, not at request time
- Never expose API keys to the frontend — all external API calls server-side only
- Medical data never in AI prompts, logs, or embeddings
- `medicine` and `family` categories excluded from group activity at DB query level

## Contents
| File/Folder | Purpose |
|---|---|
| src/index.ts | Express app entry, DB connect, middleware mount |
| src/router.ts | Central feature route registry |
| src/features/ | Feature-scoped code (routes, controller, service, repository, model, types) |
| src/lib/ | Shared infrastructure clients and utilities |
| src/middleware/ | Express middleware (auth, error handler) |
| src/constants/ | All backend enums |
| src/types/ | Shared TypeScript types |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Initial Express + TS setup |
| 2026-05-16 | feat/database-setup | All 9 Mongoose schemas |
| 2026-05-16 | architecture | Layered pattern: routes/controller/service/repository, lib/errors, lib/response, middleware/errorHandler, middleware/requireAuth, central router |
