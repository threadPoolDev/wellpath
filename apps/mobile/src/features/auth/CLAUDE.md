# features/auth

## Purpose
Login and Register screens. Token stored in SecureStore. Biometric lock on return to app.

## Patterns & Rules
- On successful auth: `authStore.initialize()` sets user, token saved to SecureStore
- OAuth flows use Expo deep-link callback scheme `wellpath://`
- Biometric lock gate is in `useBiometricLock` hook (src/hooks/) — not here
- Error messages are generic — never reveal whether an email exists

## Contents
| File/Folder | Purpose |
|---|---|
| `screens/LoginScreen.tsx` | Email/password + Google/Microsoft OAuth buttons |
| `screens/RegisterScreen.tsx` | Name, email, password registration |
| `constants/auth.constants.ts` | String literals, route names, validation messages |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-auth | LoginScreen, RegisterScreen, auth.constants |
