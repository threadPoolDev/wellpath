# src/lib

## Purpose
Low-level utilities: API client with auth injection and SecureStore wrapper.

## Patterns & Rules
- `apiClient` automatically reads the JWT from SecureStore and injects `Authorization: Bearer <token>` header
- Base URL set from `EXPO_PUBLIC_API_URL` env var — never hardcoded
- `secureStore` wraps `expo-secure-store` with typed get/set/delete — always use this, never raw SecureStore

## Contents
| File/Folder | Purpose |
|---|---|
| `apiClient.ts` | Fetch wrapper — base URL, auth header injection, JSON parsing, error normalization |
| `secureStore.ts` | Typed SecureStore helpers: `saveToken`, `getToken`, `deleteToken` |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | apiClient, secureStore |
