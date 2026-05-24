# apps/api/src/features

## Purpose
Feature-scoped code. Each folder owns its full vertical slice: routes, controller, service, repository, model, and types.

## Required structure per feature

```
<name>/
├── <name>.routes.ts       — Express Router, maps paths to controller methods
├── <name>.controller.ts   — req/res parsing, delegates to service, calls sendSuccess/sendCreated
├── <name>.service.ts      — business logic, calls repositories, throws AppError subclasses
├── <name>.repository.ts   — Mongoose queries only, no business logic
├── <name>.model.ts        — Mongoose schema + TypeScript interface
├── <name>.types.ts        — DTOs and request/response types for this feature
└── CLAUDE.md              — folder context (local only, never committed)
```

## Layer rules (strict)

| Layer | Can import | Cannot import |
|---|---|---|
| routes | controller, middleware | service, repository, model |
| controller | service, lib/response, lib/errors | repository, model, Mongoose |
| service | repository, lib/errors | req/res, lib/response, Express |
| repository | model | service, controller, Express |

## Controller pattern
```ts
export async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await featureService.doSomething(req.user.userId, req.body)
    sendSuccess(res, result)
  } catch (err) {
    next(err)  // always pass to errorHandler — never res.json() on error
  }
}
```

## Route registration
After creating a feature router, add one line to `src/router.ts`:
```ts
import { featureRouter } from './features/<name>/<name>.routes.js'
router.use('/<name>', featureRouter)
```

## Features (by PR)
| Folder | PR | Status |
|---|---|---|
| user/ | PR #2 (model), PR #5 (photo), PR #16 (settings) | model only |
| routine/ | PR #2 (model), PR #9 (engine), PR #12 (ad-hoc) | model only |
| checkin/ | PR #2 (model), PR #8 (morning), PR #11 (task), PR #15 (evening) | model only |
| calendar/ | PR #2 (model), PR #7 (integration) | model only |
| notifications/ | PR #2 (model), PR #13 (push) | model only |
| onboarding/ | PR #2 (model), PR #4 (flow) | model only |
| groups/ | PR #2 (models), PR #17 (backend), PR #18 (ui) | models only |
| auth/ | PR #3 | not started |
| travel/ | PR #6 | not started |
| ai/ | PR #9 | not started |
| embeddings/ | PR #14 | not started |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | All 9 model files across feature folders |
| 2026-05-16 | architecture | Layer pattern documented, controller/service/repository required |
