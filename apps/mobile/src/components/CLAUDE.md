# src/components

## Purpose
Shared UI components used across multiple features. Only truly reusable, feature-agnostic components live here.

## Patterns & Rules
- No feature-specific logic — components must be generic and reusable
- Use NativeWind className props, no StyleSheet
- Every component accepts standard RN props via spreading

## Contents
| File/Folder | Purpose |
|---|---|
| `SafeScrollView.tsx` | ScrollView with safe area insets pre-applied — use on every scrollable screen |
| `OfflineBanner.tsx` | Amber banner shown when `useNetworkStatus` reports offline |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | SafeScrollView |
| 2026-05-19 | feat/mobile-offline-polish | OfflineBanner |
