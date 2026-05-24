# features/auth (web)

## Purpose
Frontend auth — login page, register page, OAuth redirect, auth callback, Zustand auth store, ProtectedRoute.

## Files
| File | Role |
|---|---|
| api.ts | authApi — register, login, getMe, logout, getOAuthUrl |
| types.ts | RegisterPayload, LoginPayload |
| components/LoginPage.tsx | Email/password form + Google/Microsoft OAuth buttons |
| components/RegisterPage.tsx | Registration form + OAuth buttons |
| components/ProtectedRoute.tsx | Guards routes — redirects to /login or /onboarding |
| components/AuthCallback.tsx | Handles OAuth redirect — calls /me, navigates |

## Auth store
Zustand store at `src/store/authStore.ts`:
- `user` — null when logged out
- `isInitialized` — false until /me check completes on app load
- `initialize()` — called once on app mount, populates store from cookie
- `logout()` — calls /api/auth/logout, clears user

## OAuth flow (frontend side)
- Click "Google" → `window.location.href = ${API_ROOT}/api/auth/google` (full-page redirect)
- Backend sets cookie, redirects to `/auth/callback`
- `AuthCallback` calls `initialize()` → navigates based on `onboardingComplete`

## Error tone
- Use warm amber text for errors, never red
- Generic login error — does not say "wrong password" or "user not found"
- Form validation errors are specific and friendly

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/auth | Login, Register, ProtectedRoute, AuthCallback, authStore, authApi |
