# packages/api-client

## Purpose
Platform-agnostic base fetch utility. Web and mobile both extend this to inject their auth token (cookie vs Bearer header respectively).

## Patterns & Rules
- Uses `fetch` API only — no axios, no platform-specific HTTP client
- Auth injection is done by each app's own `apiClient` wrapper, not here
- Base URL is a parameter, not hardcoded

## Contents
| File/Folder | Purpose |
|---|---|
| `src/index.ts` | `createApiClient(baseUrl)` factory — GET, POST, PATCH, DELETE helpers with JSON parsing |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial api-client package |
