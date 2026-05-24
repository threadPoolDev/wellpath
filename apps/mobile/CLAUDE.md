# apps/mobile

## Purpose
Expo SDK 52 React Native app for WellPath. File-based routing via Expo Router. NativeWind v4 for Tailwind-style styling. Offline-first data layer via React Query.

## Patterns & Rules
- All screen components live in `src/features/<feature>/screens/` — never directly in `app/`
- `app/` files are thin wrappers: import the screen component and re-export as default
- Every feature folder has `constants/<feature>.constants.ts` — no inline strings in JSX
- Use `expo-image` everywhere, never RN `Image`
- Every scrollable screen uses `<SafeScrollView />` from `src/components/`
- NativeWind classes only — no `StyleSheet.create` unless absolutely necessary
- Haptics: `Haptics.notificationAsync(SUCCESS)` on positive actions (task done, streak milestone)
- All `accessibilityLabel` and `accessibilityRole` set on interactive elements

## Contents
| File/Folder | Purpose |
|---|---|
| `app/` | Expo Router file-based routes (thin wrappers only) |
| `src/` | All application source code |
| `src/features/` | Feature-sliced modules |
| `src/components/` | Shared UI components |
| `src/hooks/` | Shared custom hooks |
| `src/lib/` | API client, secure storage utilities |
| `src/store/` | Zustand auth store |
| `global.css` | NativeWind base styles |
| `tailwind.config.js` | Tailwind/NativeWind config |
| `app.json` | Expo app config (SDK 52, critical-alerts entitlement) |
| `metro.config.js` | Metro monorepo config (resolves packages/* workspace) |
| `scripts/patch-metro.js` | Postinstall: adds ./src/* exports back to metro-cache 0.83.x |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | Initial Expo SDK 52 app, NativeWind, Expo Router, Metro monorepo config |
| 2026-05-19 | feat/mobile-auth | Auth screens, biometric lock, SecureStore |
| 2026-05-19 | feat/mobile-shell | AppTabBar, MoreSheet, tab navigation |
| 2026-05-19 | feat/mobile-onboarding | 9-card onboarding flow with swipe gestures |
| 2026-05-19 | feat/mobile-dashboard | Today screen, task cards, check-ins |
| 2026-05-19 | feat/mobile-notifications | Expo push tokens, iOS categories, medicine reminders |
| 2026-05-19 | feat/mobile-groups | Groups list/detail/create/invite |
| 2026-05-19 | feat/mobile-streak-insights | History screen, mood graph, insight cards |
| 2026-05-19 | feat/mobile-travel-settings | Settings screen, travel mode sheet stub |
| 2026-05-19 | feat/mobile-offline-polish | Offline banner, offline-first QueryClient, NetInfo, local medicine notifications |
| 2026-05-19 | fix | Downgraded SDK-55 packages to SDK-52 compatible; patched metro-cache exports |
| 2026-05-21 | fix/expo-web-bundling | babel.config.js: explicit expoRouterBabelPlugin (hasModule('expo-router') false in monorepo); app.json: output changed static→single (SSR + React 18/19 version conflict) |
| 2026-05-24 | fix/metro-rn-version | metro.config.js: added `resolver.extraNodeModules` to force react-native → mobile's node_modules/react-native@0.76.3; prevents root node_modules/react-native@0.85.3 (uses JS `match` syntax) from being picked up by Metro |
