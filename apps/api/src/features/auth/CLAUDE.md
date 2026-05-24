# features/auth

## Purpose
Authentication — email/password registration and login, Google OAuth, Microsoft OAuth. JWT stored in httpOnly cookie.

## Layer files
| File | Role |
|---|---|
| auth.routes.ts | Express Router — mounts all /auth/* endpoints |
| auth.controller.ts | Parses req, calls service, sets cookie, sends response |
| auth.service.ts | register, login, handleOAuthUser, getById, generateToken |
| auth.repository.ts | findByEmail, findById, createEmailUser, findOrCreateOAuthUser |
| passport.config.ts | Registers Google and Microsoft Passport strategies |
| auth.types.ts | RegisterDto, LoginDto, OAuthProfileDto, AuthUserResponse |

## Key rules
- JWT secret in `JWT_SECRET` env var — never hardcoded
- Cookie: httpOnly, secure (prod only), sameSite=strict, 7-day maxAge
- `isWorkEmail` detected from domain — not asked from user
- OAuth providers are optional — strategies not registered if env vars are missing
- Work email detection uses a hardcoded denylist of free providers (not an API)
- Password hashed with bcryptjs (12 rounds)
- Login error message is deliberately generic — does not reveal whether email exists
- `onboardingComplete` in the user response drives the redirect after login/register
- Medicine and calendar data excluded from auth responses

## OAuth flow
1. Frontend navigates (full-page) to `GET /api/auth/google`
2. Passport redirects to Google
3. Google redirects to `GET /api/auth/google/callback`
4. Controller sets JWT cookie → redirects to `${WEB_URL}/auth/callback`
5. Frontend `/auth/callback` calls `GET /api/auth/me` → navigates to dashboard or onboarding

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/auth | Full auth layer: register, login, OAuth (Google + Microsoft), JWT cookies |
