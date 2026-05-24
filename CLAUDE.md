# WellPath — Full Project Planning Document
> Generated from planning conversation. Local only — never commit to repository.
> Last updated: 2026-05-19 — All mobile PRs #M1–#M10 complete + expo startup crash fixed + react-native-web added. All web PRs (#1–#19, fix/bugs, #20) complete. SonarCloud configured. CLAUDE.md files created for all folders. CLAUDE.md now tracked in git. Remaining: web PRs #21–#24 (streak, weekly reset, travel mode, partner sync)

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Core Philosophy](#2-core-philosophy)
3. [Global Rules](#3-global-rules)
4. [Tech Stack](#4-tech-stack)
5. [Monorepo Structure](#5-monorepo-structure)
6. [ENV Files](#6-env-files)
7. [Constants Files](#7-constants-files)
8. [MongoDB Schemas](#8-mongodb-schemas)
9. [Onboarding Design](#9-onboarding-design)
10. [UI Interaction Model](#10-ui-interaction-model)
11. [AI Routine Engine](#11-ai-routine-engine)
12. [Business Owner Special Handling](#12-business-owner-special-handling)
13. [Medical Data Handling](#13-medical-data-handling)
14. [Calendar Integration](#14-calendar-integration)
15. [Travel Time API](#15-travel-time-api)
16. [Groups & Social Accountability](#16-groups--social-accountability)
17. [Profile Photo Upload](#17-profile-photo-upload)
18. [Desktop Notifications](#18-desktop-notifications)
19. [Embeddings Pipeline](#19-embeddings-pipeline)
20. [UI Architecture & Navigation — Web](#20-ui-architecture--navigation--web)
21. [Mobile App — Architecture, Navigation & iOS Optimisation](#21-mobile-app--architecture-navigation--ios-optimisation)
22. [GitHub Flow & CI](#22-github-flow--ci)
23. [PR Specifications — Web (including bug fix and features #20–#24)](#23-pr-specifications--web)
24. [PR Specifications — Mobile](#24-pr-specifications--mobile)

---

## 0. Build Progress

### PR Status

| PR | Branch | Status | Notes |
|---|---|---|---|
| PR #1 | feat/project-scaffold | ✅ Done | |
| PR #2 | feat/database-setup | ✅ Done | |
| PR #3 | feat/auth | ✅ Done | Google + Microsoft OAuth, JWT cookies |
| PR #4 | feat/onboarding | ✅ Done | Includes `home_area`, `office_area`, `commute_duration` questions added for PR #6 integration |
| PR #5 | feat/profile-photo | ✅ Done | |
| PR #6 | feat/travel-time | ✅ Done | **Deviation:** OpenRouteService used instead of Google Maps. `TRAVEL_PROVIDER` env toggle allows switching. See notes below. |
| PR #7 | feat/calendar-integration | ✅ Done | |
| PR #8 | feat/morning-checkin | ✅ Done | Added `GET /checkin/morning/status` (not in original spec) |
| PR #9 | feat/ai-routine-engine | ✅ Done | **Deviation:** `llama3.1` used (llama3.2 not installed on dev machine). Hardcoded fallback routine when AI unavailable. |
| PR #10 | feat/dashboard | ✅ Done | Quick-add meeting, business owner strip, invite banner deferred — core routine view complete |
| PR #11 | feat/task-checkin | ✅ Done | "Remind in 10 min" uses browser Notification API (stub until PR #13 adds push) |
| PR #12 | feat/adhoc-meetings | ✅ Done | `IRoutineMeeting` given `_id`; end-early endpoint; task time enforcement added |
| PR #13 | feat/desktop-notifications | ✅ Done | BullMQ worker, VAPID push, service worker, subscribe endpoint, notification scheduling wired into routine generation |
| PR #14 | feat/embeddings | ✅ Done | Profile embedding on onboarding complete; checkin text embedded when missedReason or didInstead present; all fire-and-forget |
| PR #15 | feat/evening-summary | ✅ Done | `POST /checkin/evening`; `EveningSummary.tsx` card on dashboard after 8pm; rating 1–5 + optional free text; embeddings wired |
| PR #16 | feat/settings | ✅ Done | `GET/PATCH /user/profile`; `SettingsPage` with name, workMode, sleep, exercise, focus, diet, medicines, group sharing; profile re-embedding on save |
| PR #17 | feat/groups-backend | ✅ Done | Full CRUD + invites + activity projection; medicine/family excluded at DB level; activity computed on task status update |
| PR #18 | feat/groups-ui | ✅ Done | `GroupsPage` with list/detail/create views; invite banner on Dashboard; completion bar per member; no leaderboard |
| PR #19 | feat/app-shell-navigation | ✅ Done | AppShell + TopBar + SideNav (collapse/expand) + MobileDrawer + navStore; Dashboard decomposed into panel components; GroupsPage decomposed into GroupsPanel with two-column desktop layout; App.tsx nested routes via Outlet |
| fix/bugs | fix/evening-summary-and-nav-overflow | ✅ Done | BUG-01 overflow-x fixed; BUG-02 evening summary full-area replacement; BUG-03 server-side status check added |
| PR #20 | feat/mood-energy-trends | ✅ Done | HistoryPage + TrendsTab + MoodGraph + InsightCards; Redis cache; AI insights endpoint; insightsEnabled toggle in Settings |
| PR #21 | feat/compassionate-streak | 🔲 Not started | Streak counter in TopBar; StreakPanel drawer; grace day logic; milestone notifications |
| PR #22 | feat/weekly-reset-ritual | 🔲 Not started | Sunday/Monday reflection flow; week-ahead preview; AI weekly intention |
| PR #23 | feat/travel-mode | 🔲 Not started | Work trip / vacation / different location; routine adapts instantly |
| PR #24 | feat/partner-sync | 🔲 Not started | Partner connection; free-window sharing; couple streak. Married users only. |
| PR #M1 | feat/mobile-scaffold | ✅ Done | packages/ workspace (constants, types, api-client, store); Expo SDK 52, NativeWind v4, Expo Router; Metro monorepo config; mobile CI |
| PR #M2 | feat/mobile-auth | ✅ Done | Bearer token in requireAuth; token in login/register body; mobile OAuth deep link; SecureStore; LoginScreen/RegisterScreen; biometric lock |
| PR #M3 | feat/mobile-shell | ✅ Done | AppTabBar custom tab bar; Groups always 3rd tab; married users get More sheet (Relationships + Settings); MoreSheet spring animation; HIDDEN_ROUTES for relationships tab |
| PR #M4 | feat/mobile-onboarding | ✅ Done | OnboardingCard Gesture.Pan() + Reanimated 3 swipe; bounce-back; 9 answer types (yes_no, single/multi-select, time_picker, text, medicine_form, calendar_connect, photo_upload, commute_duration); useOnboardingFlow hook with showIf-filtered active questions; fire-and-forget API saves |
| PR #M5 | feat/mobile-dashboard | ✅ Done | Today tab, task cards, morning check-in, evening summary |
| PR #M6 | feat/mobile-notifications | ✅ Done | Expo push token registration, categories, deep links, iOS action buttons |
| PR #M7 | feat/mobile-groups | ✅ Done | Groups screen (list/detail/create/invite), Relationships placeholder (married only, MoreSheet) |
| PR #M8 | feat/mobile-streak-insights | ✅ Done | History screen, mood graph, insight cards (streak teaser — backend pending PR #21) |
| PR #M9 | feat/mobile-travel-settings | ✅ Done | Full settings screen (profile, insights toggle, group sharing, sign out) + travel mode sheet stub |
| PR #M10 | feat/mobile-offline-polish | ✅ Done | Offline banner, local medicine notifications, offline-first QueryClient, NetInfo hook |

### Additional Work (Not in Original PR Specs)

| Item | Where | Description |
|---|---|---|
| **Expo startup crash fix** | `apps/mobile/package.json`, `scripts/patch-metro.js`, root `package.json` | `expo start` crashed with `ERR_PACKAGE_PATH_NOT_EXPORTED` on `metro-cache/src/stores/FileStore`. Root cause: `expo-local-authentication@15` pulled `expo@55` (SDK 55) as peer dep, hoisting `metro-cache@0.83.7` which removed `./src/*` exports. Fix: downgraded `expo-local-authentication` → `~14.0.1`, `expo-notifications` → `~0.28.19`, `expo-image-picker` → `~15.0.7`. Added `scripts/patch-metro.js` postinstall to add back `./src/*` exports to metro 0.83.7 packages. Also updated `useMedicineNotifications` (use `Date` trigger directly, not `SchedulableTriggerInputTypes.DATE`), `usePushNotifications` (`EventSubscription` → `Subscription`, removed `shouldShowBanner`/`shouldShowList`). |
| **react-native-web missing** | `apps/mobile/package.json` | `localhost:8081` failed with "Unable to resolve module react-native-web/dist/index". Added `react-native-web: ~0.19.13` to mobile dependencies. |
| **CLAUDE.md now tracked in git** | `.gitignore` | Removed `**/CLAUDE.md` from .gitignore. CLAUDE.md files in all folders are now committed and pushed — they serve as the source of truth for reviewers on each PR. |
| **CLAUDE.md files created for all folders** | All folders | Created CLAUDE.md in every mobile feature folder, every packages/ folder, missing web feature folders, and `.github/`. |
| **SonarCloud setup** | `sonar-project.properties`, `.github/workflows/sonar.yml` | SonarCloud static analysis configured for the full monorepo. Runs on every PR and every push to main/feature branches. No test coverage required. Requires `SONAR_TOKEN` secret in GitHub repo settings. |
| **Nodemon** | `apps/api/nodemon.json` | Auto-restarts server on `src/` or `.env` changes. Replaces `tsx watch`. |
| **OpenRouteService** | `travel.service.ts`, `.env` | Primary travel provider (free tier). `TRAVEL_PROVIDER=openrouteservice\|google_maps` env toggle. `ORS_API_KEY` added. |
| **Google profile pre-fill** | `passport.config.ts`, `auth.repository.ts`, `OnboardingFlow.tsx` | OAuth sign-in stores `profilePhoto.url` from Google avatar. Onboarding pre-fills `name` and `photo` fields from the signed-in user so users don't have to re-enter. |
| **`GET /checkin/morning/status`** | `checkin.routes.ts` | Returns `{ submitted, date }` — dashboard uses this to decide whether to show the check-in banner. |
| **AI model corrected to `llama3.1`** | `.env` | Original spec said `llama3.2` but that model was not installed. Updated to `llama3.1:latest` which is available. `nomic-embed-text` confirmed installed. |
| **`skipped` added to `CHECKIN_RESPONSES`** | `constants/index.ts` | Original enum only had `done`, `missed`, `ended_early`. Added `skipped` to support the Skip button in PR #11. |
| **`shareWithGroup` on Checkin model** | `checkin.model.ts` | Per-entry group sharing preference stored with every task checkin record. Group activity projection (PR #17) will read this. |
| **`recordTaskCheckin` service** | `checkin.service.ts`, `checkin.repository.ts` | Saves a `Checkin` document on every task status update. Fires non-blocking (fire-and-forget) from `routine.controller.ts`. |
| **Swagger / OpenAPI docs** | `src/docs/openapi.ts`, `src/index.ts` | Full OpenAPI 3.0.3 spec for all 21 endpoints. Served at `http://localhost:3001/api/docs` in dev (disabled in production). Must be kept in sync as new endpoints are added. |
| **Task time enforcement** | `Dashboard.tsx` — `isTaskActionable()` | Tasks whose scheduled time hasn't arrived yet show as "Upcoming" with no action buttons. Prevents marking future tasks as done. Purely client-side, no API change needed. |
| **Push notification Swagger tag** | `src/docs/openapi.ts` | Added `Notifications` tag and subscribe/unsubscribe endpoints to the Swagger spec (now 23 endpoints total). |
| **`usePushNotifications` hook** | `apps/web/src/hooks/usePushNotifications.ts` | Registers SW, requests permission, subscribes to push, and POSTs the subscription to the API — all fire-and-forget on login. |
| **Light / dark mode toggle** | `src/hooks/useTheme.ts`, `src/components/ThemeToggle.tsx`, `index.html` | `useTheme` hook reads `localStorage` + OS preference, toggles `.dark` on `<html>`, persists choice. `ThemeToggle` button (sun/moon icon) placed in TopBar (was Dashboard header — moved in PR #19). Inline script in `index.html` applies saved theme before first paint. |
| **Dark mode — all screens** | `Dashboard.tsx`, `EveningSummary.tsx`, `SettingsPage.tsx`, `GroupsPage.tsx`, `index.css` | `dark:` Tailwind variants applied throughout. Color mapping: `bg-stone-50`→`dark:bg-stone-900`, `bg-white`→`dark:bg-stone-800`, `border-stone-200`→`dark:border-stone-700`, `text-stone-800`→`dark:text-stone-100`. `LOCAL_STORAGE_KEYS.THEME` uses `'wellpath-theme'` (hyphen) not `'wellpath_theme'` — kept as-is to preserve existing stored preferences. |
| **`photo_upload` enum fix** | `apps/api/src/features/onboarding/onboarding.model.ts` | Added `'photo_upload'` to `questionType` enum in `OnboardingResponse` schema. Was causing `ValidatorError` when the final onboarding card was answered. |
| **Routine overlap resolution + work-hours enforcement** | `routine.service.ts` — `resolveOverlapsAndSplit`, `enforceWorkBoundaries`, `mergeTasks` | AI sometimes generates overlapping tasks (e.g., 8-hour Deep Work block that swallows Lunch). Post-processing now: (1) removes/trims focus_work/learning/exercise before `workStart`; (2) splits long splittable tasks around fixed tasks (nutrition, medicine, break). Prompt also strengthened: no focus_work before workStart, max 3-hour focus blocks, no overlapping tasks. |
| **Duration display formatting** | `TaskCard.tsx` — `formatDuration()` | Frontend was always showing raw minutes (e.g., "480 min"). Now converts to human-readable: "8 hrs", "1 hr 30 min", "45 min". |
| **`calendar_connect` + `photo_upload` enum fix** | `apps/api/src/constants/index.ts` — `QUESTION_TYPES` | Both types were used by onboarding questions but missing from the backend enum, causing `ValidatorError` on every onboarding save that reached those question cards. |
| **Commute task duration fix** | `routine.service.ts` — `fixCommuteTasks`, `buildPrompt` | AI was generating commute tasks with `durationMinutes: 0` because the prompt never included actual commute durations. Fix: (1) prompt now includes exact departure time and duration for each commute leg; (2) `fixCommuteTasks` post-processor guarantees correct time + duration using `homeToOfficeDuration` / `officeToHomeDuration` from the user profile regardless of what the AI outputs. Morning commute placed at `workStart − duration`; evening commute placed at `workEnd`. |
| **CalendarPanel — real events fetch** | `CalendarPanel.tsx`, `apps/web/src/features/calendar/api.ts` | CalendarPanel was reading `routine.meetings` (ad-hoc only). Rewritten to call `GET /api/calendar/events?date=<today>` and show synced Google/Microsoft events. Ad-hoc meetings from the routine shown separately in an "Added today" section. |
| **Calendar sync on demand** | `calendar.service.ts` — `syncAllConnections`, `calendar.routes.ts` — `POST /api/calendar/sync` | Calendar events were only synced once at OAuth connect time. Added `POST /api/calendar/sync` endpoint that re-syncs all active providers from midnight today (so past events today are included). `CalendarPanel` calls sync on mount before fetching events, so data is always fresh. `syncGoogle` / `syncMicrosoft` accept optional `timeMin` param. |

### Known Bugs — Pending Fix

These are confirmed bugs observed in the running app. Fix them in the next available PR or as a dedicated hotfix branch before continuing with new features.

---

#### BUG-01 — Horizontal Scrollbar Appears on Nav Collapse / Expand

**Observed:** When the side navigation bar is collapsed or expanded, a horizontal scrollbar briefly appears (or persists) at the bottom of the viewport.

**Root cause (likely):** The `AppShell` or its direct children are not correctly constrained to `100vw`. During the nav width transition (`200ms ease-in-out`), the content area momentarily overflows. Could also be a fixed-width element inside the content area that does not respond to the nav width change, causing total width to exceed viewport.

**Files to investigate:**
- `apps/web/src/components/layout/AppShell.tsx` — check that the shell wrapper has `overflow-x: hidden` or equivalent
- `apps/web/src/components/layout/SideNav.tsx` — check that the nav width transition does not temporarily push total width past `100vw`
- `apps/web/src/index.css` or `tailwind.config` — check for any `min-w` values on shell children that could cause overflow

**Fix requirements:**
- [ ] Shell root element must have `overflow-x: hidden` so no horizontal overflow ever reaches the viewport during transition
- [ ] `AppShell` wrapper: use `w-screen` or `w-full` + `max-w-screen` — never a fixed pixel width
- [ ] Content area flex child: must use `min-w-0` (critical in Flexbox — without it, flex children do not shrink below their content size, causing overflow)
- [ ] SideNav transition: `width` property animated, not `transform: translateX` on expanded state — confirm the transition does not cause reflow that pushes content
- [ ] Test: collapse and expand nav at 1280px, 1440px, and 1920px viewport widths — no scrollbar at any size
- [ ] Test: collapse and expand with a long task title in TodayPanel — long content should not cause overflow either
- [ ] Specific Tailwind classes to audit: remove any `w-max`, `min-w-max`, `whitespace-nowrap` from task titles or card components that could force content wider than the container

**Exact fix pattern:**
```tsx
// AppShell.tsx
<div className="flex h-screen w-screen overflow-hidden">
  <SideNav />
  <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
    <TopBar />
    <main className="flex-1 overflow-y-auto overflow-x-hidden">
      <Outlet />
    </main>
  </div>
</div>
```
Key classes: `overflow-hidden` on root, `min-w-0` on flex-1 content wrapper, `overflow-x-hidden` on main scroll container.

---

#### BUG-02 — Evening Summary Card Overlaps Dashboard Content (Not Full-Screen)

**Observed (see screenshot):** The evening wrap-up card ("How did today go?") appears as a large card overlaid on top of the dashboard, but the dashboard content (Today/Calendar/Check-in tabs, task list) is still visibly rendering behind it. The card is not dismissing or replacing the background — it sits on top of it, making the screen feel cluttered and broken.

**Expected behaviour:** When the evening summary is active, it should either:
- Option A (preferred): Take over the full content area — the dashboard panels should not be visible behind it. The evening summary replaces the content area entirely until submitted or skipped.
- Option B: If shown as an overlay modal, it must have a full-screen semi-opaque backdrop covering the entire content area (not just the card area), so nothing is readable or interactive behind it.

**Root cause (likely):** `EveningSummary.tsx` is rendered inside `TodayPanel` or `Dashboard.tsx` as a sibling to the task list rather than as a full content-area replacement or a proper modal with a backdrop that fills the viewport.

**Files to investigate:**
- `apps/web/src/features/dashboard/components/TodayPanel.tsx` — likely renders `<EveningSummary />` inline alongside the task list
- `apps/web/src/features/dashboard/EveningSummary.tsx` — check its positioning and z-index

**Fix requirements:**
- [ ] Evening summary must be rendered as a **full content-area replacement** — when `showEveningSummary === true`, render `<EveningSummary />` in place of `<DashboardPanels />`, not alongside it
- [ ] The tab bar (Today / Calendar / Check-in) must be hidden while evening summary is active — it should not be visible or interactive
- [ ] Implementation pattern: in `Dashboard.tsx` (or the component that owns both), use a conditional render:
```tsx
// Dashboard.tsx
{showEveningSummary
  ? <EveningSummary onComplete={handleEveningComplete} onSkip={handleEveningSkip} />
  : (
    <>
      <DayBanner />
      <DashboardPanels />
    </>
  )
}
```
- [ ] `<EveningSummary />` itself: must be `w-full h-full` filling the content area, not a fixed-width card floating in space
- [ ] The card shown in the screenshot (max ~700px wide, centred) is fine visually — but it must sit on a background that fills the entire content area behind it, not on a transparent layer showing the task list
- [ ] If keeping the overlay/card approach: wrap with a full-area backdrop `<div className="absolute inset-0 bg-stone-900/80 z-50 flex items-start justify-center pt-12">` — covers everything, nothing readable behind it
- [ ] `showEveningSummary` state: set to `true` at the user's `workdayEndTime` (or 8pm default) — driven by the same logic as the existing implementation
- [ ] Test: submit morning check-in, generate routine, wait until after 8pm (or manually trigger) — evening summary must cover the full content area with nothing visible behind it

---

#### BUG-03 — Evening Summary Reappears After Submission

**Observed:** After completing or skipping the evening summary ("Done for today" / "Skip for now"), the card disappears briefly but reappears again when the user navigates or refreshes. It keeps showing even though the user has already submitted it.

**Root cause (likely):** The component that decides whether to show the evening summary (`showEveningSummary` condition) is checking the wrong signal. Most likely it is checking `time >= workdayEndTime` without also checking whether a `type: 'evening_summary'` checkin record already exists for today. So every time the component mounts or the page is visited after submission, the time condition is still true and the summary re-renders.

**Files to investigate:**
- `apps/web/src/features/dashboard/Dashboard.tsx` or `TodayPanel.tsx` — find the `showEveningSummary` logic
- `apps/web/src/features/dashboard/EveningSummary.tsx` — check what happens on submit/skip
- `apps/api/src/features/checkin/checkin.routes.ts` — confirm `GET /checkin/evening/status` exists or needs to be added (mirrors the existing `GET /checkin/morning/status` pattern)

**Fix requirements:**
- [ ] Add `GET /api/checkin/evening/status` backend endpoint — mirrors `GET /api/checkin/morning/status`
  - Returns `{ submitted: boolean, date: string }`
  - Checks for a `Checkin` document with `type: 'evening_summary'` and `userId` for today's date
  - Returns `{ submitted: true }` if found, `{ submitted: false }` if not
- [ ] Frontend: on Dashboard mount (or on TodayPanel mount), call `GET /api/checkin/evening/status` alongside the existing morning status check
- [ ] `showEveningSummary` condition must be: `isAfterWorkdayEnd && !eveningSubmitted`
  - `isAfterWorkdayEnd`: current time >= user's `workdayEndTime` (or 8pm default)
  - `eveningSubmitted`: from the `/checkin/evening/status` response
- [ ] On submit ("Done for today"): immediately set local state `eveningSubmitted = true` before the API response returns — prevents flash of re-render while awaiting confirmation
- [ ] On skip ("Skip for now"): also set `eveningSubmitted = true` locally AND record a skip on the backend so the summary does not reappear on next page visit
  - Backend: `POST /api/checkin/evening` with `{ skipped: true }` — saves a checkin document with `skipped: true` so the status endpoint returns `{ submitted: true }` on next check
- [ ] React Query: invalidate `['eveningStatus', today]` query key after successful submit or skip so any cached result is cleared
- [ ] Test: submit evening summary → navigate to Groups → navigate back to Today → evening summary must NOT reappear
- [ ] Test: skip evening summary → refresh page → evening summary must NOT reappear
- [ ] Test: on a new day (after midnight), evening summary status resets → shows again after workday end the next day

---

**Summary for Claude Code:**
Fix all three bugs before building any new features. They are independent and can be fixed in a single PR.

```
Branch: fix/evening-summary-and-nav-overflow

Bug fixes in this PR:
1. BUG-01: AppShell overflow-x causes horizontal scrollbar on nav toggle
2. BUG-02: EveningSummary rendered inline — must replace content area fully
3. BUG-03: EveningSummary re-shows after submit — missing server-side status check

Read BUG-01, BUG-02, BUG-03 in CLAUDE.md Section 0 before writing any code.
Fix all three. Verify each fix matches the test cases listed.
```

### Deviations from Spec

| Spec | Actual | Reason |
|---|---|---|
| Google Maps Distance Matrix for travel time | OpenRouteService | Free tier available; Google Maps requires billing. Toggle added so it can be switched back. |
| `OLLAMA_CHAT_MODEL=llama3.2` | `llama3.1` | `llama3.2` not installed on dev machine; `llama3.1` is equivalent. |
| "Remind me in 10 minutes" via push notification | Browser `Notification` API + `setTimeout` | Push notifications are PR #13. Stub works for now — reminder fires if tab stays open. |
| PR #10 AC: quick-add meeting, business owner strip, invite/calendar banners | Deferred | Core routine card view is complete. Deferred items belong in PR #12 (meetings) and PR #16+ (settings/groups). |
| `LOCAL_STORAGE_KEYS.THEME = 'wellpath_theme'` (spec) | `'wellpath-theme'` (hyphen) | Kept existing hyphen key to preserve already-stored user theme preferences. Constant exposed as `LOCAL_STORAGE_KEYS.THEME`. |
| PR #19: CSS Grid shell layout | Flexbox | Achieves identical result with fewer classes; no functional difference. |
| PR #19: `navStore.activeView` drives active nav state | `NavLink.isActive` from `useLocation()` | Avoids double source of truth and sync bugs between router and store. |
| PR #19: Content transitions 150ms cross-fade | Instant view swap | Deferred — React Router Outlet transitions require additional complexity. |

---

### Post-Ship Bug Fixes (discovered after PR merges)

| Bug | Root Cause | Fix | Files |
|---|---|---|---|
| AI routine tasks overlapping (e.g., 8-hr Deep Work swallowing Lunch) | AI generated single long focus block ignoring other tasks | `resolveOverlapsAndSplit` post-processor splits long splittable tasks around fixed ones; prompt capped focus blocks at 3 hrs max | `routine.service.ts` |
| focus_work scheduled before user's work start time | AI ignored `workStart` constraint | `enforceWorkBoundaries` trims/removes focus_work/learning/exercise before `workStart`; prompt rule added | `routine.service.ts` |
| Commute tasks showing "0 min" duration | Prompt never included commute duration — AI had no data | Prompt now specifies exact departure time + duration per leg; `fixCommuteTasks` post-processor overwrites commute tasks using profile values | `routine.service.ts` |
| Duration shown as raw minutes (e.g., "480 min") | `TaskCard` always rendered `durationMinutes` directly | `formatDuration()` helper converts to "8 hrs", "1 hr 30 min", "45 min" | `TaskCard.tsx`, `CalendarPanel.tsx` |
| `ValidatorError: calendar_connect / photo_upload not valid enum` | Both question types missing from `QUESTION_TYPES` constant | Added `'photo_upload'` and `'calendar_connect'` to the array | `apps/api/src/constants/index.ts` |
| Calendar tab always shows "No meetings today" | `CalendarPanel` read `routine.meetings` (ad-hoc only); real Google/Microsoft events live in `calendarevents` collection | Rewrote `CalendarPanel` to call `GET /api/calendar/events?date=<today>` | `CalendarPanel.tsx`, `calendar/api.ts` |
| Calendar events stale / never refreshed | Sync only ran once at OAuth connect time (fire-and-forget) | Added `POST /api/calendar/sync` endpoint; `CalendarPanel` calls it on mount before fetching — always starts from midnight today UTC | `calendar.service.ts`, `calendar.routes.ts`, `CalendarPanel.tsx` |

---

## 1. Project Vision

**WellPath** helps busy people build flexible, adaptive daily routines — not rigid schedules — by understanding their life context and adjusting every single day based on what is actually happening.

**Main Aim:** Plan a daily healthy routine for the user as per their current day.

**Target Users:** Working professionals, students, business owners, freelancers, homemakers — anyone whose day is unpredictable and whose routine collapses under pressure.

**System:** Apple MacBook M4 Air (development machine).

---

## 2. Core Philosophy

> "Your routine should fit your day — not the other way around."

- No guilt-tripping if a task is missed
- No rigid schedules — routine regenerated fresh every day
- Gentle nudges, warm encouragement throughout
- Adapts daily based on calendar, energy patterns, and past behaviour
- Never restricts the user — always asks, never demands
- Every piece of copy is warm, human, and non-judgmental

---

## 3. Global Rules

These rules apply to every PR, every session, every file.

### Code Rules
- One PR at a time. Build, review, merge, then move to the next.
- Claude Code does the coding. This document is the source of truth.
- No silent actions — every integration requires explicit user consent.
- Each folder has a `CLAUDE.md` file — **committed and pushed to GitHub**.
- `PLANNING.md` stays in `.gitignore` (local only). `CLAUDE.md` files are tracked.
- No test cases for now — omit test runners entirely.
- ESLint + TypeScript + Prettier enforced on every PR via CI.
- SonarCloud static analysis runs on every PR — all quality gate issues must be resolved.
- All enums extracted into `constants/index.ts` — never hardcoded inline.
- ENV variables consumed cleanly — no raw strings in code.

### PR & Branch Workflow Rules
- **One PR per feature** — even if multiple features are requested together, each gets its own branch and PR.
- **Branch from the previous PR's branch** (not from main) so the latest code is included. After a PR is merged into main, create the next branch from main.
- **Branch naming:** `feat/<feature-name>` for features, `fix/<description>` for bug fixes.
- **PR title format:** `[PR #N] <type>: <description>` — e.g. `[PR #21] feat: compassionate-streak`. This lets reviewers merge in the correct order.
- **PR description** must include a link to the corresponding CLAUDE.md section and a summary of files changed.
- Never merge out of order — each PR's base branch must be verified before merging.

### CLAUDE.md Rules (Updated)
- Every folder created gets a `CLAUDE.md` immediately — not after the fact.
- CLAUDE.md files are **committed and pushed** — they are the primary review artifact.
- Reviewers use the CLAUDE.md to understand what changed without reading every line of code.
- Each CLAUDE.md changelog entry must include: Date, PR branch/number, what was added/changed, and Author (Claude or developer name).
- When editing a folder's CLAUDE.md, always append to the changelog — never overwrite history.

### Security Rules (production-grade — applies to every PR)

WellPath will serve millions of users. Security is non-negotiable at every layer.

#### Transport & Headers
- **HTTPS is mandatory in production.** `helmet` with HSTS (`maxAge: 63072000`, `includeSubDomains`, `preload`) enforces this — browsers will refuse HTTP after first visit.
- `helmet()` is applied globally in `src/index.ts` before all routes. Never remove it.
- **Do not add client-side password hashing.** TLS encrypts the full request body in transit. Client-side hashing turns the hash into a replayable credential and is an OWASP antipattern.
- CORS is locked to `WEB_URL` — never use `origin: '*'` in any environment.

#### Authentication
- Passwords hashed with `bcryptjs` at 12 rounds minimum. Never store plaintext or MD5/SHA passwords.
- JWT stored in `httpOnly` + `secure` + `sameSite: strict` cookies. Never in `localStorage`.
- JWT secret sourced from `JWT_SECRET` env var — minimum 32 random characters in production.
- Login error messages are deliberately generic — never reveal whether an email exists.

#### Rate Limiting
- `express-rate-limit` is applied at two levels:
  - **Global:** 300 req / 15 min per IP (skips `/health`)
  - **Login:** 10 attempts / 15 min per IP
  - **Register:** 5 attempts / 60 min per IP
- In multi-instance (clustered) production deployments, replace the in-memory store with `rate-limit-redis` using the existing Redis connection. The limiter interface does not change.

#### Data Privacy
- Medical data (medicine names, conditions) — never in logs, never in AI prompts, never in embeddings.
- Passwords — never logged at any level (request body logging must strip `password` field).
- API keys — never exposed to the frontend. All third-party calls (Maps, Cloudinary, AI) go through the backend.
- `generationPromptSnapshot` on routines must never contain medical fields before saving.

#### Input Validation
- Validate all user-supplied input at the controller or service boundary.
- Reject requests with unexpected large payloads — `express.json({ limit: '1mb' })` is set globally.
- Never pass raw `req.body` directly to Mongoose — always destructure expected fields.

#### Future additions (implement when the relevant PR is built)
- CAPTCHA on register and login (hCaptcha preferred) once traffic warrants it
- Account lockout after N consecutive failed logins (track in Redis)
- Audit log for sensitive actions (password change, calendar connect, group join)

### CLAUDE.md Rule
- Every folder gets a `CLAUDE.md` on creation.
- Updated in every PR that touches that folder.
- Never staged, never committed, never pushed.
- Root `.gitignore` includes `**/CLAUDE.md`.

### CLAUDE.md Structure (for every folder)
```markdown
# [Folder Name]

## Purpose
What this folder is responsible for.

## Patterns & Rules
- Naming conventions
- Import rules
- Folder-specific constraints

## Contents
| File/Folder | Purpose |
|---|---|

## Changelog
| Date | PR | What was added |
|---|---|---|
```

---

## 4. Tech Stack

```
Frontend        React + TypeScript
Styling         Tailwind CSS + shadcn/ui
State           Zustand (client) + React Query (server)
Router          React Router v6
Build           Vite

Backend         Node.js + Express + TypeScript
Database        MongoDB + Mongoose
Queue           BullMQ + Redis
Scheduler       node-cron

AI (local)      Ollama — llama3.2 (chat) + nomic-embed-text (embeddings)
AI (cloud)      Google Gemini Pro — gemini-1.5-pro (chat)
                                  + text-embedding-004 (embeddings)
AI Switch       USE_LOCAL_AI=true in .env — boolean flag, one line change

Calendar        Google Calendar API
                Microsoft Graph API (Outlook / Teams)

Maps            Google Maps Distance Matrix API (travel time)

Storage         Cloudinary (profile photos)

Notifications   Web Push API + Service Worker (desktop browser notifications)

Auth            JWT (httpOnly cookies) + Google OAuth + Microsoft OAuth
```

---

## 5. Monorepo Structure

```
wellpath/
├── apps/
│   ├── web/                              # React frontend
│   │   ├── src/
│   │   │   ├── components/               # Shared UI components
│   │   │   │   ├── Avatar.tsx            # Photo + initials fallback
│   │   │   │   └── layout/               # Shell components (PR #19)
│   │   │   │       ├── AppShell.tsx      # Root shell — TopBar + SideNav + Content
│   │   │   │       ├── TopBar.tsx        # Fixed top bar with toggle + avatar
│   │   │   │       ├── SideNav.tsx       # Collapsible nav with items + user footer
│   │   │   │       ├── SideNavItem.tsx   # Single nav item — icon, label, active state
│   │   │   │       ├── NavTooltip.tsx    # Tooltip on collapsed icon hover
│   │   │   │       └── MobileDrawer.tsx  # Overlay drawer for mobile nav
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── components/
│   │   │   │   │   │   ├── OnboardingCard.tsx
│   │   │   │   │   │   ├── OnboardingProgress.tsx
│   │   │   │   │   │   ├── OnboardingSkip.tsx
│   │   │   │   │   │   ├── SwipeHint.tsx
│   │   │   │   │   │   └── answers/
│   │   │   │   │   │       ├── YesNoAnswer.tsx
│   │   │   │   │   │       ├── SingleSelectAnswer.tsx
│   │   │   │   │   │       ├── MultiSelectAnswer.tsx
│   │   │   │   │   │       ├── TimePickerAnswer.tsx
│   │   │   │   │   │       ├── TextAnswer.tsx
│   │   │   │   │   │       └── PhotoUploadAnswer.tsx
│   │   │   │   │   ├── questions/
│   │   │   │   │   │   └── essentialQuestions.ts
│   │   │   │   │   └── OnboardingFlow.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── components/       # Updated in PR #19 refactor
│   │   │   │   │       ├── DashboardPanels.tsx  # Tab switcher
│   │   │   │   │       ├── TodayPanel.tsx
│   │   │   │   │       ├── CalendarPanel.tsx
│   │   │   │   │       ├── CheckinPanel.tsx
│   │   │   │   │       ├── TaskCard.tsx
│   │   │   │   │       ├── MeetingCard.tsx
│   │   │   │   │       └── DayBanner.tsx
│   │   │   │   ├── routine/
│   │   │   │   ├── checkin/
│   │   │   │   ├── groups/
│   │   │   │   │   └── components/       # Updated in PR #19 refactor
│   │   │   │   │       ├── GroupsPanel.tsx      # Two-column shell
│   │   │   │   │       ├── GroupList.tsx
│   │   │   │   │       ├── GroupListItem.tsx
│   │   │   │   │       ├── GroupDetail.tsx
│   │   │   │   │       ├── MemberCard.tsx
│   │   │   │   │       ├── GroupSettings.tsx
│   │   │   │   │       └── InviteFlow.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── components/
│   │   │   │   │       └── PhotoUpload.tsx
│   │   │   │   └── settings/
│   │   │   ├── hooks/
│   │   │   │   ├── useSwipeGesture.ts
│   │   │   │   ├── useKeyboardNav.ts
│   │   │   │   ├── usePushNotifications.ts
│   │   │   │   └── useTheme.ts
│   │   │   ├── store/
│   │   │   │   └── navStore.ts           # Navigation state (PR #19)
│   │   │   ├── lib/
│   │   │   ├── constants/
│   │   │   │   └── index.ts
│   │   │   └── types/
│   │   ├── public/
│   │   │   └── sw.js                     # Service worker
│   │   ├── .env.example
│   │   ├── .env                          # gitignored
│   │   └── vite.config.ts
│   │
│   └── api/                              # Express backend
│       ├── src/
│       │   ├── features/
│       │   │   ├── auth/
│       │   │   ├── user/
│       │   │   ├── routine/
│       │   │   ├── checkin/
│       │   │   ├── calendar/
│       │   │   ├── ai/
│       │   │   ├── travel/
│       │   │   ├── groups/
│       │   │   ├── notifications/
│       │   │   └── embeddings/
│       │   ├── lib/
│       │   │   ├── db.ts
│       │   │   ├── cloudinary.ts
│       │   │   ├── redis.ts
│       │   │   └── ai.ts
│       │   ├── middleware/
│       │   │   └── requireAuth.ts
│       │   ├── constants/
│       │   │   └── index.ts
│       │   └── types/
│       ├── .env.example
│       └── .env                          # gitignored
│
├── .github/
│   └── workflows/
│       ├── web-ci.yml
│       └── api-ci.yml
│
├── .gitignore                            # includes **/CLAUDE.md, PLANNING.md
└── README.md
```

---

## 6. ENV Files

### `apps/api/.env.example`

```env
# App
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/wellpath

# AI Provider Toggle
# Set to true for Ollama (local), false for Google Gemini (cloud)
USE_LOCAL_AI=true

# Ollama (used when USE_LOCAL_AI=true)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3.2
OLLAMA_EMBED_MODEL=nomic-embed-text

# Google Gemini (used when USE_LOCAL_AI=false)
GEMINI_API_KEY=
GEMINI_CHAT_MODEL=gemini-1.5-pro
GEMINI_EMBED_MODEL=text-embedding-004

# Google OAuth + Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_SCOPE=https://www.googleapis.com/auth/calendar.readonly

# Microsoft OAuth + Calendar
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_TENANT_ID=common
MICROSOFT_CALENDAR_SCOPE=Calendars.Read

# Google Maps (travel time)
GOOGLE_MAPS_API_KEY=

# Cloudinary (profile photos)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Web Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=

# Redis (BullMQ)
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=
JWT_EXPIRES_IN=7d
```

### `apps/web/.env.example`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_VAPID_PUBLIC_KEY=
VITE_GOOGLE_CLIENT_ID=
```

---

## 7. Constants Files

### `apps/api/src/constants/index.ts`

```ts
export const CITY_TYPES = {
  METRO: 'metro',
  TIER2: 'tier2',
  RURAL: 'rural'
}

export const METRO_CITIES = [
  'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai',
  'hyderabad', 'kolkata', 'pune', 'ahmedabad', 'surat',
  'london', 'new york', 'singapore', 'dubai'
]

export const WORK_SHIFTS = {
  INDIA: { label: 'India', timezone: 'Asia/Kolkata' },
  UK:    { label: 'UK',    timezone: 'Europe/London' },
  USA:   { label: 'USA',   timezone: 'America/New_York' },
  OTHER: { label: 'Other', timezone: null }
}

export const AI_PROVIDERS = {
  OLLAMA: 'ollama',
  GEMINI: 'gemini'
}

export const TASK_CATEGORIES = [
  'hydration', 'exercise', 'nutrition', 'focus_work',
  'break', 'commute', 'family', 'medicine',
  'wind_down', 'learning', 'social', 'mindfulness'
]

// Medicine and family are NEVER shared with groups
export const PRIVATE_TASK_CATEGORIES = ['medicine', 'family']

export const DAY_TYPES = {
  LIGHT:    'light',      // 0–1 meetings
  MODERATE: 'moderate',   // 2–3 meetings
  PACKED:   'packed'      // 4+ meetings or < 90 min free time
}

export const NOTIFICATION_TYPES = [
  'task_reminder', 'checkin_prompt', 'morning_checkin',
  'evening_summary', 'free_time_suggestion'
]

export const PROFILE_PHOTO = {
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  CLOUDINARY_FOLDER: 'wellpath/profile_photos',
  THUMBNAIL_WIDTH: 100,
  THUMBNAIL_HEIGHT: 100,
  FULL_WIDTH: 400,
  FULL_HEIGHT: 400
}

export const TRAVEL_TIME = {
  MAX_CALLS_PER_USER_PER_DAY: 10
}

export const GROUP_INVITE_EXPIRY_DAYS = 7
export const GROUP_ACTIVITY_NOTIFICATION_HOUR = 20  // 8pm local time
```

### `apps/web/src/constants/index.ts`

```ts
export const APP_NAME = 'WellPath'

export const ONBOARDING_LAYERS = {
  ESSENTIAL:    'essential',
  CONTEXTUAL:   'contextual',
  DEEP_PROFILE: 'deep_profile'
}

export const ONBOARDING_STEPS = [
  'role_work',
  'location',
  'commute',
  'health_medicines',
  'sleep_energy',
  'personal_life',
  'calendar',
  'photo'
]

export const METRO_CITIES = [
  'delhi', 'mumbai', 'bengaluru', 'bangalore', 'chennai',
  'hyderabad', 'kolkata', 'pune', 'ahmedabad', 'surat',
  'london', 'new york', 'singapore', 'dubai'
]

export const DIET_OPTIONS = ['veg', 'vegan', 'non_veg', 'eggetarian', 'jain']

export const EXERCISE_OPTIONS = [
  'walk', 'gym', 'yoga', 'home_workout', 'none', 'open'
]

export const PEAK_WINDOWS = [
  'early_morning', 'morning', 'afternoon', 'evening', 'night'
]

export const ENERGY_LEVELS  = ['low', 'medium', 'high']
export const MOOD_OPTIONS   = ['great', 'okay', 'tired', 'stressed']

export const SWIPE = {
  THRESHOLD_PX: 80,
  TRANSITION_MS: 200,
  MAX_ROTATION_DEG: 5
}

export const ONBOARDING_PROGRESS_LABELS: Record<string, string> = {
  '0-30':   'Just getting started...',
  '31-60':  'Getting to know you...',
  '61-85':  'Almost there...',
  '86-99':  'One more thing...',
  '100':    'All set! Building your first routine ✨'
}

export const SHARING_PREFERENCES = {
  COMPLETION_ONLY:   'completion_only',
  WITH_TASK_DETAIL:  'with_task_detail',
  WITH_REASONS:      'with_reasons'
}

export const ROUTES = {
  LOGIN:       '/login',
  REGISTER:    '/register',
  ONBOARDING:  '/onboarding',
  DASHBOARD:   '/dashboard',
  GROUPS:      '/groups',
  HISTORY:     '/history',
  SETTINGS:    '/settings'
}
```

---

## 8. MongoDB Schemas

### 8.1 `users` collection

```js
{
  _id: ObjectId,
  email: String,                        // unique, required
  name: String,                         // required
  passwordHash: String,                 // null if OAuth-only
  authProvider: enum['email', 'google', 'microsoft'],
  isWorkEmail: Boolean,                 // detected on login

  onboardingComplete: Boolean,
  onboardingStep: Number,               // last completed step index

  profile: {

    // Role & Work
    role: enum['student', 'professional', 'business_owner',
               'freelancer', 'homemaker'],
    workShift: enum['india', 'uk', 'usa', 'other'],
    shiftTimezone: String,              // e.g. "Asia/Kolkata"
    workMode: enum['wfh', 'office', 'hybrid'],

    // Location
    city: String,
    cityType: enum['metro', 'tier2', 'rural'],
    homeAddress: String,                // area level — not precise
    officeAddress: String,

    // Commute (skipped if workMode === 'wfh')
    commute: {
      mode: enum['car', 'metro', 'bus', 'walk',
                 'cycle', 'two_wheeler', 'wfh'],
      // metro only offered if cityType === 'metro'
      homeToOfficeDuration: Number,     // minutes, from Maps API
      homeToOfficeTime: String,         // "09:00" — confirmed/edited by user
      officeToHomeDuration: Number,
      officeToHomeTime: String,         // "18:30"
      travelTimeOverridden: Boolean,    // true if user manually edited
      metroActivities: [enum[
        'reading', 'meditation', 'learning', 'music', 'podcasts'
      ]]
    },

    // Health
    health: {
      takesMedicines: enum['yes', 'no', 'prefer_not_to_say'],
      medicines: [{
        nameOrNickname: String,         // informal names accepted
        timings: [String],              // ["08:00", "21:00"]
        withFood: enum['yes', 'no', 'not_sure'],
        isCritical: enum['yes', 'no', 'not_sure'],
        // not_sure treated same as yes in notification logic
        reminderEnabled: Boolean        // default true
      }],
      medicalDisclaimerAcknowledged: Boolean,
      // Layer 3 only — not collected in onboarding Layer 1
      hasMedicalCondition: Boolean,
      conditions: [{
        name: String,
        isChronicOrCritical: Boolean
      }]
    },

    // Diet
    diet: {
      type: enum['veg', 'vegan', 'non_veg', 'eggetarian', 'jain'],
      waterReminderNeeded: Boolean,
      restrictions: String              // free text
    },

    // Sleep
    sleep: {
      wakeTime: String,                 // "06:30"
      sleepGoal: Number                 // hours: 6 / 7 / 8
    },

    // Exercise
    exercise: {
      preference: enum['walk', 'gym', 'yoga',
                       'home_workout', 'none', 'open']
    },

    // Deep Focus
    focus: {
      peakWindow: enum['early_morning', 'morning',
                       'afternoon', 'evening', 'night']
    },

    // Personal Life — consent-gated, Layer 2/3 only
    personalLifeConsented: Boolean,
    personal: {
      relationshipStatus: enum['single', 'partnered', 'married'],
      hasChildren: Boolean,
      familyTimeFeeling: enum['usually', 'sometimes', 'rarely'],
      friendsTimeFeeling: enum['usually', 'sometimes', 'rarely']
    },

    // Business Owner Profile — only if role === 'business_owner'
    businessOwnerProfile: {
      calendarToolUsed: enum['google', 'microsoft', 'both', 'none'],
      hasFrequentAdHocMeetings: Boolean,
      manualDayProfile: {               // only if calendarToolUsed === 'none'
        workdayStartTime: String,
        workdayEndTime: String,
        avgMeetingsPerDay: enum['1_2', '3_4', '5_plus', 'varies'],
        avgMeetingDuration: enum['under_30', '30_60', 'over_60', 'mixed'],
        hasProtectedLunch: enum['always', 'sometimes', 'rarely'],
        recurringCommitments: String,
        additionalContext: String
      },
      deepWorkPreference: enum[
        'early_morning', 'morning', 'afternoon', 'evening', 'varies'
      ],
      interruptionFrequency: enum['rarely', 'sometimes', 'often', 'constantly'],
      hasTeamDependency: enum['yes', 'no', 'sometimes'],
      hardToSwitchOff: enum['yes', 'sometimes', 'no'],
      lunchHabit: enum['proper_meal', 'quick_bite', 'often_skip'],
      physicalMovementDuringDay: enum['yes', 'rarely', 'never']
    }
  },

  // Calendar Connections — array supports multiple providers
  calendarConnections: [{
    provider: enum['google', 'microsoft'],
    accountEmail: String,               // which account is connected
    accessToken: String,                // encrypted at rest
    refreshToken: String,               // encrypted at rest
    tokenExpiry: Date,
    calendarId: String,
    scopes: [String],
    isActive: Boolean,
    lastSyncedAt: Date,
    connectedAt: Date,
    connectionNote: String              // e.g. "Work calendar — Microsoft Teams"
  }],

  // Profile Photo
  profilePhoto: {
    url: String,                        // Cloudinary CDN URL (400x400)
    thumbnailUrl: String,               // Cloudinary CDN URL (100x100)
    publicId: String,                   // for deletion
    uploadedAt: Date
  },

  // Groups
  groupIds: [ObjectId],
  groupSharingDefaults: {
    defaultSharingPreference: enum[
      'completion_only', 'with_task_detail', 'with_reasons'
    ],
    shareWithGroups: Boolean            // master off switch
  },

  // Push Notifications
  pushSubscription: {
    endpoint: String,
    keys: {
      p256dh: String,
      auth: String
    }
  },

  // Embedding
  profileEmbedding: [Number],

  createdAt: Date,
  updatedAt: Date
}
```

---

### 8.2 `routines` collection

```js
{
  _id: ObjectId,
  userId: ObjectId,                     // ref: users
  date: String,                         // "2025-05-16"
  // Index: userId + date (unique)

  // Day Classification — auto from calendar
  dayType: enum['light', 'moderate', 'packed'],
  // light = 0–1 meetings
  // moderate = 2–3 meetings
  // packed = 4+ meetings OR < 90 min free time
  totalMeetingMinutes: Number,
  totalFreeMinutes: Number,

  // Morning Check-in
  morningCheckin: {
    energyLevel: enum['low', 'medium', 'high'],
    mood: enum['great', 'okay', 'tired', 'stressed'],
    anythingDifferentToday: String,     // optional free text
    submittedAt: Date
  },

  // Meetings — from calendar + ad-hoc entries
  meetings: [{
    calendarEventId: String,            // null if ad-hoc
    isAdHoc: Boolean,
    title: String,
    startTime: String,                  // "14:00"
    endTime: String,                    // "15:00"
    durationMinutes: Number,
    priorityLevel: enum['high', 'passive', 'unset'],
    actualEndTime: String,              // filled if ended early
    endedEarly: Boolean,
    freeMinutesGained: Number
  }],

  // Routine Tasks
  tasks: [{
    _id: ObjectId,
    time: String,                       // "07:00"
    durationMinutes: Number,
    category: enum[
      'hydration', 'exercise', 'nutrition', 'focus_work',
      'break', 'commute', 'family', 'medicine',
      'wind_down', 'learning', 'social', 'mindfulness'
    ],
    title: String,
    description: String,                // warm, human tone
    status: enum['pending', 'done', 'missed', 'skipped'],
    notificationSentAt: Date,
    checkinPromptSentAt: Date,
    completedAt: Date,
    missedReason: String,               // optional, user-entered
    didInstead: String,                 // optional, user-entered
    taskEmbedding: [Number]
  }],

  // AI Metadata
  generatedBy: enum['ollama', 'gemini'],
  generationPromptSnapshot: String,     // for debugging — NO medical data
  generatedAt: Date,

  createdAt: Date,
  updatedAt: Date
}
// Index: { userId: 1, date: 1 } unique
```

---

### 8.3 `checkins` collection

```js
{
  _id: ObjectId,
  userId: ObjectId,                     // ref: users
  routineId: ObjectId,                  // ref: routines
  taskId: ObjectId,

  type: enum[
    'morning', 'task_completion',
    'task_missed', 'evening_summary'
  ],

  response: enum['done', 'missed', 'ended_early'],
  missedReason: String,
  didInstead: String,

  eveningSummary: {
    overallRating: Number,              // 1–5
    howWasYourDay: String,
    tomorrowNote: String
  },

  embedding: [Number],
  timestamp: Date
}
```

---

### 8.4 `calendarevents` collection (cache)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  provider: enum['google', 'microsoft'],
  externalEventId: String,
  title: String,
  startTime: Date,
  endTime: Date,
  durationMinutes: Number,
  isRecurring: Boolean,
  fetchedAt: Date,
  date: String                          // "2025-05-16" for easy lookup
}
```

---

### 8.5 `notifications` collection (log)

```js
{
  _id: ObjectId,
  userId: ObjectId,
  routineId: ObjectId,
  taskId: ObjectId,
  type: enum[
    'task_reminder', 'checkin_prompt', 'morning_checkin',
    'evening_summary', 'free_time_suggestion'
  ],
  title: String,
  body: String,
  scheduledFor: Date,
  sentAt: Date,
  deliveryStatus: enum['pending', 'sent', 'failed'],
  clickedAt: Date
}
```

---

### 8.6 `onboardingresponses` collection

```js
{
  _id: ObjectId,
  userId: ObjectId,
  layer: enum['essential', 'contextual', 'deep_profile'],
  sessionId: String,

  responses: [{
    questionId: String,                 // stable key e.g. "role", "work_mode"
    questionText: String,               // exact text shown to user
    questionType: enum[
      'single_select', 'multi_select',
      'time_picker', 'text_input',
      'yes_no', 'scale'
    ],
    options: [String],
    answerValue: Mixed,
    answeredAt: Date,
    skipped: Boolean,
    timeToAnswerSeconds: Number
  }],

  completedLayer: Boolean,
  droppedOffAtQuestion: String,         // questionId where they stopped
  startedAt: Date,
  completedAt: Date
}
```

---

### 8.7 `groups` collection

```js
{
  _id: ObjectId,
  name: String,                         // user-defined
  createdBy: ObjectId,                  // ref: users

  members: [{
    userId: ObjectId,
    email: String,                      // denormalized
    displayName: String,                // denormalized
    role: enum['admin', 'member'],      // creator = admin
    joinedAt: Date,
    status: enum['active', 'invited', 'declined', 'left']
  }],

  settings: {
    allowMemberInvites: Boolean
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

### 8.8 `groupinvites` collection

```js
{
  _id: ObjectId,
  groupId: ObjectId,
  groupName: String,                    // denormalized
  invitedBy: ObjectId,
  invitedByName: String,               // denormalized
  inviteeEmail: String,
  inviteeUserId: ObjectId,             // if existing user
  status: enum['pending', 'accepted', 'declined', 'expired'],
  expiresAt: Date,                     // 7 days from sent
  sentAt: Date,
  respondedAt: Date
}
```

---

### 8.9 `groupactivity` collection

```js
{
  _id: ObjectId,
  groupId: ObjectId,
  userId: ObjectId,
  displayName: String,                 // denormalized
  date: String,

  summary: {
    totalTasks: Number,
    completedTasks: Number,
    missedTasks: Number,
    completionPercentage: Number,      // 0–100

    // medicine and family categories NEVER included
    // excluded at DB query level — not a UI toggle
    tasks: [{
      category: enum[
        'hydration', 'exercise', 'nutrition', 'focus_work',
        'break', 'commute', 'learning', 'mindfulness'
      ],
      title: String,
      status: enum['done', 'missed'],
      missedReason: String,            // null unless sharingPreference allows
      didInstead: String               // null unless sharingPreference allows
    }]
  },

  sharingPreference: enum[
    'completion_only',
    'with_task_detail',
    'with_reasons'
  ],

  computedAt: Date
}
// Index: { userId: 1, date: 1 }
```

---

## 9. Onboarding Design

### Three-Layer Architecture

**Layer 1 — Essential (Day 0)**
- Maximum 10 questions
- Maximum 5 minutes
- Generates first routine immediately after completion

**Layer 2 — Contextual (Days 1–3)**
- One question per session, surfaced inline on dashboard or morning check-in
- Never shown as a form
- Dismissible always

**Layer 3 — Deep Profile (Settings, self-serve)**
- User-initiated
- Prompted once per week: *"Your profile is 60% complete — a few more answers means smarter routines."*

---

### Layer 1 — The 10 Essential Questions

| # | Question | Type | Notes |
|---|---|---|---|
| 1 | What's your name? | text_input | |
| 2 | What best describes you? | single_select | Student / Professional / Business Owner / Freelancer / Homemaker |
| 3 | Work from home, office, or both? | single_select | WFH skips commute questions |
| 4 | What city are you in? | text_input | Determines metro/tier2/rural |
| 5 | How do you get to work? | single_select | Metro only shown if metro city |
| 6 | Work start and finish time? | time_picker x2 | Day boundary anchors |
| 7 | When do you feel most focused? | single_select | Peak window |
| 8 | Any medicines at specific times? | yes_no | Gates medicine entry |
| 9 | Connect your calendar | action | Google / Microsoft / Skip |
| 10 | Add a profile photo | photo_upload | Fully optional, final card |

---

### Business Owner Fork

If `role === 'business_owner'`, an extra step is inserted after Question 2:

- Do you use Google Calendar / Microsoft / Both / None?
- If None → Manual Day Builder (start time, end time, avg meetings, lunch, recurring commitments)
- Deep work preference, interruption frequency, team dependency
- Energy and transition questions (lunch habit, physical movement, switch-off difficulty)

---

### Personal Life Questions — Consent Gate

Before any personal question (Layer 2 / Layer 3 only — never in Layer 1):

> *"The next few questions are personal and completely optional. Answering them helps WellPath protect time for the people who matter most to you — family, friends, and yourself. You can skip this section anytime."*

Buttons: *"Sure, I'm happy to answer"* / *"Skip this section"*

Questions (only if consented):
- Relationship status
- Do you have children?
- Do you usually get enough time for family?
- Do you usually get enough time for friends?

---

### Medicine Flow (Layer 1)

**Gate question:** *"Do you take any medicines at specific times of day?"*
- Yes / No / Prefer not to say
- No or Prefer not to say → move on, no follow-up

**If Yes — per medicine card:**
- Medicine name or nickname (informal names explicitly welcome)
- When do you take it? (time picker, multi-time)
- Take with food? Yes / No / Not sure
- Is missing a dose serious? Yes / No / Not sure
- No dosage field — not a medical app
- No condition name field — not required
- Max 5 medicines in Layer 1, more in Settings
- Inline disclaimer: *"WellPath reminders are gentle nudges, not medical advice. Always follow your doctor's guidance."*

---

### Per-Question Storage

Every question and answer saved immediately on selection — not on Next click.

`PATCH /api/onboarding/response` called on every answer.

Tracks: `questionId`, `questionText`, `questionType`, `options shown`, `answerValue`, `answeredAt`, `skipped`, `timeToAnswerSeconds`.

`droppedOffAtQuestion` saved if session ends mid-flow. Resume from exact question on return.

---

### Question Definition Shape

```ts
export interface OnboardingQuestion {
  id: string
  layer: 'essential' | 'contextual' | 'deep_profile'
  category: string
  text: string
  type: 'yes_no' | 'single_select' | 'multi_select'
        | 'time_picker' | 'text_input' | 'photo_upload'
  options?: string[]
  weight: number                // progress bar contribution
  skippable: boolean
  showIf?: (answers: Record<string, unknown>) => boolean
}
```

`showIf` handles all conditional logic — metro only if metro city, commute only if not WFH, business owner step only if role matches.

---

## 10. UI Interaction Model

### Card-Based Swipe System

Every onboarding question = one full-screen card. One question, one card, full attention.

**Mobile / Touch:** Swipe left = No / Skip. Swipe right = Yes / Continue.
**Desktop:** `←` `→` arrow keys or on-screen buttons. Number keys `1–4` for option selection.

### Card Anatomy

```
┌─────────────────────────────────────┐
│  [Progress Bar]                     │
│                                     │
│  [Small category label]             │
│                                     │
│  [Question — large, warm type]      │
│                                     │
│  [Answer area]                      │
│                                     │
│  [← Skip]          [Continue →]    │
└─────────────────────────────────────┘
```

### Swipe Mechanics

- Swipe threshold: 80px horizontal
- During swipe: card follows finger with `rotate(±5deg)` and opacity shift
- Right swipe on unanswered card: gentle bounce-back shake, no navigation
- Left swipe: muted warm grey tint
- Right swipe: soft sage green tint
- Card transition: 200ms ease, never jarring

### Color Language

| Action | Color |
|---|---|
| Swipe right / Yes / Continue | Soft sage green |
| Swipe left / Skip | Warm muted grey |
| No answer + swipe attempt | Card shake — no color change |
| Progress bar fill | Soft sage green |

**Never red for skip or no. Skipping is not a failure.**

### Progress Bar

- Fills on answer selection — not on Next click
- Skipping adds 50% of question weight
- Labels: 0–30% "Just getting started..." / 31–60% "Getting to know you..." / 61–85% "Almost there..." / 86–99% "One more thing..." / 100% "All set! Building your first routine ✨"
- On 100%: 800ms pause → transition to dashboard

### Desktop Swipe Hint (first time only)

```
[← No / Skip]    ←  Use arrow keys or click  →    [Yes / Continue →]
```

Fades after 3 seconds or first interaction. Stored in `localStorage` as `onboarding_hint_shown`. Never shown again.

### Custom Hooks

- `useSwipeGesture` — all touch logic, exported from `src/hooks/`
- `useKeyboardNav` — keyboard arrow logic, exported from `src/hooks/`

---

## 11. AI Routine Engine

### Provider Switching

```
USE_LOCAL_AI=true  → Ollama (llama3.2 chat, nomic-embed-text embeddings)
USE_LOCAL_AI=false → Google Gemini Pro (gemini-1.5-pro chat, text-embedding-004)
```

One boolean. One line change. No other code changes needed.

### Daily Routine Generation Flow

**Step 1 — Morning Check-in (3 questions max)**
- How are you feeling today? (Energy: Low / Medium / High)
- How is your mood? (Great / Okay / Tired / Stressed)
- Anything different about today? (optional free text)
- Calendar day type detected automatically — NOT asked

**Step 2 — Calendar Parsing**
- Read all active calendar connections
- Classify day: light / moderate / packed
- Identify: deep work windows, short breaks (10–15 min), long breaks (30+ min), commute slots

**Step 3 — AI Generation**
Input to AI:
- User profile (role, commute, diet, health anchors — no medical names)
- Today's calendar (meetings, free slots)
- Morning check-in energy + mood
- Yesterday's completion rate
- Historical patterns (what they skipped, what they did instead)
- Medicine timings as "medicine_reminder at 08:00" — NOT medicine names

Output:
- Time-slotted routine for today
- Each task: time, duration, category, title, warm description
- Alternatives for likely-to-skip tasks

**Step 4 — Adaptive Notifications**
- Sent at task time via Web Push
- At task completion time: gentle check-in prompt
- If no response: one follow-up only (15 min for critical medicine, none for others)

**Step 5 — Learning Loop**
- After 3–4 days: AI has pattern data
- Starts pre-planning 2–3 days ahead
- Improves silently — user does nothing extra

### Medicine Tasks in Routine

- Medicine timings are **fixed anchors** — AI cannot move or compress them
- `isCritical: yes OR not_sure` → no skip option in check-in, one follow-up after 15 min
- `isCritical: no` → standard reminder, skip option available
- Medicine names NEVER in `generationPromptSnapshot`
- Medicine tasks NEVER in group activity projection

### Business Owner Routine Rules

- Always block at least one deep work window matching `deepWorkPreference`
- Deep work never adjacent to back-to-back meetings without 10-min buffer
- `interruptionFrequency === 'constantly'` → micro-recovery tasks (5 min) instead of long blocks
- `calendarToolUsed === 'none'` → routine built from `manualDayProfile`
- `hasFrequentAdHocMeetings: true` → morning check-in includes quick ad-hoc meeting prompt
- Routine leaves visible buffer gaps labelled "Flexible buffer"
- `lunchHabit === 'often_skip'` → lunch block always included, warmer notification copy
- `hardToSwitchOff === 'yes'` → deliberate wind-down task 30–45 min before `workdayEndTime`

### Packed Day — Meeting Prioritization

**Never suggest skipping a meeting.** Instead:

> *"Today looks quite full. Would you like help thinking through which meetings need your full presence and which ones might be lighter?"*

User marks each meeting: High Focus / Passive Attendance. Routine built around energy needs per slot.

### Early Meeting Completion

User taps "Ended Early" on any meeting.
- Free time gained calculated
- Gentle suggestion: *"Your 3pm sync ended 20 minutes early — want to use that for a quick stretch or catch up on water? 🚶"*

### Ad-hoc Meeting Entry

User can add a sudden meeting from the dashboard at any time during the day. Fields: title, start time, expected duration. Routine recalculates around it.

---

## 12. Business Owner Special Handling

See Section 11 for routine rules. Additional dashboard UI:

- "Day Overview" strip: Deep work protected ✓ / Lunch blocked ✓ / Buffer time available
- Quick-add meeting button always visible (not buried in menu)
- If `calendarToolUsed === 'none'` → subtle weekly prompt to connect calendar

### Business Owner Notification Tone

Brief, respectful, never preachy:

| Situation | Copy |
|---|---|
| Deep work starting | *"Your focus time starts now. Notifications paused for 90 min 🎯"* |
| Lunch | *"Step away for a bit — you've earned it 🍱"* |
| Water | *"Quick one — water? 💧"* |
| Wind-down | *"Time to close the loop on today. Tomorrow will handle itself."* |
| Medicine | *"Your [medicine time] reminder 💊"* |
| Ad-hoc check | *"Any surprise meetings today? Tap to add one quickly"* |

---

## 13. Medical Data Handling

### Principles

- WellPath is not a medical app and never gives medical advice
- Reminders are gentle nudges — not medical instructions
- Always follow doctor's guidance, not ours
- Medical data encrypted at rest (field-level encryption)
- Medical data never sent to AI as raw text — only as time anchors
- Medicine names never in logs or prompt snapshots

### Consent & Disclaimer

Medical disclaimer shown before any health question:

> *"The next section asks about your health and any medicines you take. This helps WellPath remind you at the right time and plan rest when your body needs it.*
> *WellPath is not a medical app and does not give medical advice. Your data stays private and is never shared. Reminders are gentle nudges — not medical instructions. Always follow your doctor's guidance, not ours.*
> *You can skip this section entirely and add it later from Settings."*

`medicalDisclaimerAcknowledged: true` set only on explicit "I understand" — never assumed.

### Critical Medicine Rules

- `isCritical: yes OR not_sure` → treated as critical
- Cannot be marked optional in UI
- Check-in shows only: "Done" and "Remind me in 10 minutes"
- One gentle follow-up after 15 min if no response — no spam
- Sent even if user has DND enabled in app
- Never: "You missed your medication!" Instead: *"Did you get a chance to take your evening medicine?"*

### Data Exclusions

- Medical data excluded from embedding pipeline
- Medicine tasks excluded from group activity at DB query level
- Medical fields excluded from `generationPromptSnapshot`

---

## 14. Calendar Integration

### Cross-Provider Rule

Auth provider and calendar provider are fully decoupled.

A user can:
- Sign in with Google → connect Microsoft Calendar
- Sign in with Microsoft → connect Google Calendar
- Connect both simultaneously
- Connect neither (manual entry only)

### Calendar Connect Flow

Onboarding Step 9 always shows both options regardless of login method:
- Connect Google Calendar
- Connect Microsoft Calendar / Teams
- Skip for now

If signed in with work email → prompt: *"We noticed you signed in with a work email. Would you like to connect your work calendar automatically?"* — explicit Yes / No.

Each connection: calendar read-only OAuth scope only. No write access ever requested.

After connecting: show account email that was connected.

### Sync Logic

- Sync iterates over ALL active entries in `calendarConnections` array
- Events from both providers land in `calendarevents` with `provider` field
- Deduplication: same title + startTime within 2-minute window = one event
- Token refresh handled independently per connection
- Expired token → Settings badge: *"Your Microsoft calendar needs to be reconnected"*

### Day Type Classification (automatic, never asked)

```
Light    → 0–1 meetings
Moderate → 2–3 meetings
Packed   → 4+ meetings OR < 90 min free time total
```

---

## 15. Travel Time API

### Endpoint

`GET /api/travel/estimate?home=<area>&office=<area>&mode=<mode>`

### Mode Mapping

| WellPath mode | Maps API mode |
|---|---|
| car, bus, two_wheeler | driving |
| metro | transit |
| walk | walking |
| cycle | bicycling |

### Response

```json
{ "durationMinutes": 35, "distanceKm": 12, "source": "google_maps" }
```

On failure:
```json
{ "error": "Could not fetch", "fallback": true }
```

Frontend shows manual input only if fallback.

### UX

Fetched duration shown to user: *"We found your commute is roughly 35 minutes each way — does that sound right?"*

User confirms or manually adjusts. `travelTimeOverridden: true` if edited.

Rate limit: max 10 calls per user per day.
API key: `GOOGLE_MAPS_API_KEY` in `.env` — never exposed to frontend.

---

## 16. Groups & Social Accountability

### Core Philosophy

> "You can see if I showed up. You cannot see why I am struggling."

### What is Shared

| Data | Shared |
|---|---|
| Overall completion % | ✅ (unless invisible) |
| Task title + status | ✅ If `with_task_detail` or `with_reasons` |
| Missed reason | ✅ Only if `with_reasons` AND user confirmed per entry |
| Did instead | ✅ Only if `with_reasons` AND user confirmed per entry |
| Medicine tasks | ❌ Never — excluded at DB query level |
| Family/personal tasks | ❌ Never — excluded at DB query level |
| Onboarding answers | ❌ Never |
| Medical data | ❌ Never |
| Calendar events | ❌ Never |
| Morning check-in mood | ❌ Never |

Medicine and family categories filtered in backend query — frontend never receives them.

### Sharing Preferences

```
completion_only    → "Priya completed 80% of her routine today"
with_task_detail   → "Priya did her morning walk but missed her lunch break"
with_reasons       → also shows missedReason/didInstead if user confirmed
nothing            → invisible to all groups
```

Default: `completion_only`. Per-entry override available at check-in.

### Group Page Layout

- Member cards in join-order — not performance order
- No ranking, no leaderboard
- 100% gets subtle star — not a trophy
- Missed tasks in muted tone — never red
- Shared reasons in italics, quiet

### Group Notifications (batched)

All batched into one per day per group at 8pm user local time. Never real-time per-member pings.

| Trigger | Copy |
|---|---|
| Invite accepted | *"[Name] joined [Group Name] 🎉"* |
| Member finishes day | Batched daily digest |
| First to complete | *"You're the first in [Group Name] to finish today 🌟"* |
| 3 days quiet | *"[Group Name] hasn't checked in for a few days — how's everyone doing?"* |
| Member leaves | Silent — no notification to group |

---

## 17. Profile Photo Upload

### Stack

Cloudinary — handles resizing, compression, CDN delivery.

### Rules

- Accepted: JPG, PNG, WEBP
- Max size: 5MB before compression
- Transformations: `400x400` full, `100x100` thumbnail, `gravity: face`
- Applied server-side — never raw upload to Cloudinary from frontend

### Endpoints

```
POST   /api/user/profile-photo    Upload or replace
DELETE /api/user/profile-photo    Remove, revert to initials
```

### Initials Avatar Fallback

`<Avatar />` component:
- `photoUrl` present → show photo
- `photoUrl` null → show initials (first letter of each name word, max 2)
- Background color derived from name hash — consistent, never random
- Props: `photoUrl?`, `thumbnailUrl?`, `name`, `size: 'sm'|'md'|'lg'`, `variant: 'full'|'thumbnail'`

Avatar used in: nav bar, group member cards, profile settings, group page.

### Onboarding Card (Final, Optional)

> *"Last thing — add a photo so your friends and family recognise you in groups. Completely optional."*

Upload area: tap/click file picker OR drag and drop on desktop.
After selection: circular preview shown immediately.
Skip is prominent. Progress bar hits 100% whether uploaded or skipped.

---

## 18. Desktop Notifications

### Implementation

Web Push API + Service Worker.

Notifications appear even when browser tab is in background.
Clicking notification opens directly to relevant check-in card.

### Tone

Warm, minimal, non-alarming. Example:

> *"Time for your afternoon water break 💧 — how's the day going?"*

### Push Subscription

Stored in `users.pushSubscription` (endpoint, p256dh, auth keys).
VAPID keys in `.env`.

---

## 19. Embeddings Pipeline

### What Gets Embedded

- User profile (on onboarding completion and profile updates)
- Daily check-in responses (free text fields)
- "What did you do instead?" entries
- Routine task completion patterns

### What Never Gets Embedded

- Medical data
- Medicine names or timings
- Personal life answers
- Any field from `users.profile.health`

### Embedding Models

```
USE_LOCAL_AI=true  → nomic-embed-text via Ollama
USE_LOCAL_AI=false → text-embedding-004 via Google Gemini
```

### Usage

- Smarter routine suggestions via vector similarity
- Pattern recognition (consistently skips X when Y happens)
- Personalisation improves silently over time

---

## 20. UI Architecture & Navigation — Web

### Core Decision: Single Page Application — No Full Page Reloads

Every view lives within a **shell layout**. The shell never unmounts. Only the content area changes. No page navigations — only panel and view transitions within the shell.

---

### Shell Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                    TOP BAR                              │
│  [≡ Toggle]  WellPath        [🔔] [Avatar]             │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│   SIDE   │                                              │
│   NAV    │           CONTENT AREA                       │
│          │       (only this part changes)               │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

Three zones: **Top Bar** (always visible), **Side Nav** (collapsible, fixed left), **Content Area** (only this changes).

---

### Side Navigation — Two States

**Expanded (240px)**
```
┌────────────────────────┐
│  ≡   WellPath          │
├────────────────────────┤
│  🏠  Today             │
│  📅  My Routine        │
│  👥  Groups            │
│  📊  History           │
│  ⚙️  Settings          │
├────────────────────────┤
│  [Avatar] Priya     →  │
└────────────────────────┘
```

**Collapsed (64px — icons only)**
```
┌────────┐
│   ≡    │
├────────┤
│   🏠   │
│   📅   │
│   👥   │
│   📊   │
│   ⚙️   │
├────────┤
│  [Av]  │
└────────┘
```

### Nav Items

| Icon | Label | View |
|---|---|---|
| 🏠 | Today | Dashboard — today's routine |
| 📅 | My Routine | Routine history + upcoming |
| 👥 | Groups | Groups list → group detail |
| 📊 | History | Past routines, patterns |
| ⚙️ | Settings | Profile, calendar, preferences |

### Collapsed State Rules

- Icons only — no labels
- Hovering an icon on desktop shows a **tooltip** to the right with the label
- Active item: soft sage green left border indicator
- `nav_collapsed` persisted in `localStorage` — survives sessions
- Expand/collapse: `200ms ease-in-out` — content area adjusts simultaneously, no layout jump

### Toggle Behaviour

- `≡` toggle always visible in top bar
- Mobile (< 768px): collapsed = completely hidden. Toggle opens a full-height **overlay drawer** sliding in from left — never pushes content
- Overlay drawer has semi-transparent backdrop — tap to close

### Active State & Transitions

- Active nav item: soft sage green background pill, icon tinted, label bold
- Switching views: 150ms opacity cross-fade in content area — never slides

---

### Groups Panel — Internal Navigation

Groups has its own sub-navigation within the content area. It does not navigate to a new page.

**Desktop (> 1024px): Two-column layout**
```
┌─────────────────┬──────────────────────────────────────┐
│  GROUP LIST     │       GROUP DETAIL                   │
│                 │                                      │
│  ● Family 🌟    │  Family · 4 members · Today          │
│  ● Work Crew    │                                      │
│  ● Morning Club │  [Member cards]                      │
│                 │                                      │
│  [+ New Group]  │                                      │
└─────────────────┴──────────────────────────────────────┘
```

**Tablet (768–1024px) and Mobile (< 768px):**
- Group list shown first (full screen)
- Tapping a group → detail slides in from right (200ms)
- Back chevron in detail header → slides back to list
- Back never changes the main route — only toggles within the groups panel

**Navigating between groups:**
- Desktop: click group in list → right panel cross-fades (150ms), no scroll reset
- Mobile/tablet: swipe back or tap chevron → returns to list
- Keyboard: `↑` `↓` cycle through group list, `Enter` opens focused group

**Group List Item:**
- Group initials avatar (color from name hash — same system as user avatar)
- Group name, member count
- Today's average completion bar across all members
- Active group: soft left border indicator

---

### Dashboard — Panel System (Not a Static Screen)

Dashboard is a **panel system**. All content on one screen — user switches panels, never navigates away.

**Three Tabs:**

| Tab | Content |
|---|---|
| Today | Current day routine tasks — primary view |
| Calendar | Today's meetings from calendar connections |
| Check-in | Tasks awaiting a response |

- Active tab: soft sage green underline
- Tab switch: 150ms cross-fade, no scroll reset
- Pending check-in count badge on Check-in tab label

**Task Card:**
```
┌──────────────────────────────────────────────────┐
│  09:00 · 90 min                    🎯 Focus Work │
│  Deep focus block                                │
│  Your best thinking time — protect this window  │
│  [✓ Done]  [⏰ Remind me later]                 │
└──────────────────────────────────────────────────┘
```

Status colours: Done = sage green, In Progress = soft amber, Upcoming = muted grey, Missed = warm rose (never harsh red). Critical medicine tasks: only "Done" and "10 min reminder" — no skip.

---

### Zustand navStore

```ts
// store/navStore.ts

interface NavStore {
  isNavCollapsed: boolean
  activeView: 'dashboard' | 'routine' | 'groups' | 'history' | 'settings'
  activeGroupId: string | null
  dashboardPanel: 'today' | 'calendar' | 'checkin'
  isMobileDrawerOpen: boolean

  toggleNav: () => void
  setActiveView: (view: NavStore['activeView']) => void
  setActiveGroup: (groupId: string | null) => void
  setDashboardPanel: (panel: NavStore['dashboardPanel']) => void
  toggleMobileDrawer: () => void
}
```

`isNavCollapsed` synced to `localStorage` on every change. No URL routing needed for panel or group switching — all state-driven.

---

### Responsive Breakpoints

| Breakpoint | Behaviour |
|---|---|
| < 768px (mobile) | Side nav hidden. Toggle opens full-height overlay drawer. Groups = full screen list then detail. |
| 768px–1024px (tablet) | Side nav collapsed by default (icons only). Groups = full screen list then detail slide-in. |
| > 1024px (desktop) | Side nav expanded by default. Groups = two-column. Dashboard panels visible. |

---

### Constants Addition — `apps/web/src/constants/index.ts`

```ts
export const NAV_VIEWS = {
  DASHBOARD: 'dashboard',
  ROUTINE:   'routine',
  GROUPS:    'groups',
  HISTORY:   'history',
  SETTINGS:  'settings'
} as const

export const DASHBOARD_PANELS = {
  TODAY:    'today',
  CALENDAR: 'calendar',
  CHECKIN:  'checkin'
} as const

export const NAV_WIDTH = {
  EXPANDED:  240,   // px
  COLLAPSED: 64     // px
} as const

export const BREAKPOINTS = {
  MOBILE:  768,
  TABLET:  1024
} as const

export const TRANSITION_MS = {
  NAV:     200,
  CONTENT: 150,
  GROUPS:  200
} as const

export const LOCAL_STORAGE_KEYS = {
  NAV_COLLAPSED:      'nav_collapsed',
  ONBOARDING_HINT:    'onboarding_hint_shown',
  THEME:              'wellpath_theme'
} as const
```

---

## 21. Mobile App — Architecture, Navigation & iOS Optimisation

See the full mobile spec in the previous planning session. Key decisions recorded here for Claude Code reference:

### Framework
React Native + Expo SDK 51+, NativeWind, Expo Router (file-based), Zustand + React Query from shared `packages/`.

### Navigation — Groups Rule (Critical)
**Groups tab is ALWAYS visible to every user. Relationships is additive — only shown for married users. It never replaces Groups.**

- Standard user: Today | Routine | Groups | History | Settings (5 tabs)
- Married user: Today | Routine | Groups | History | ··· More (5 tabs, More opens sheet with Relationships + Settings)

### Shared Packages
```
packages/constants/   — shared enums, no UI strings
packages/types/       — shared TypeScript interfaces
packages/api-client/  — base fetch, auth injection
packages/store/       — authStore, navStore (platform-agnostic)
```

### Screen-Level Constants Rule
Every feature in `apps/mobile/src/features/` has `constants/<feature>.constants.ts` exporting `*_STRINGS`, option arrays, animation values, and React Query keys. No inline strings in JSX anywhere.

### iOS Optimisation Highlights
- `app.json`: `critical-alerts` entitlement for medicine reminders, all `NSUsageDescription` strings set
- `expo-image` everywhere — not RN `Image`
- `SafeAreaProvider` + `SafeScrollView` on every screen
- `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`
- Reanimated on native thread — no `LayoutAnimation`
- Haptics: `Haptics.notificationAsync(SUCCESS)` on task done, streak milestone
- Dynamic Type respected — no fixed font sizes
- All `accessibilityLabel` and `accessibilityRole` set throughout

---

## 22. GitHub Flow & CI

### Branch Naming — Web

```
fix/evening-summary-and-nav-overflow
feat/mood-energy-trends
feat/compassionate-streak
feat/weekly-reset-ritual
feat/travel-mode
feat/partner-sync
```

### Branch Naming — Mobile

```
feat/mobile-scaffold
feat/mobile-auth
feat/mobile-shell
feat/mobile-onboarding
feat/mobile-dashboard
feat/mobile-notifications
feat/mobile-groups
feat/mobile-streak-insights
feat/mobile-travel-settings
feat/mobile-offline-polish
```

### CI Checks (every PR)

- ESLint
- TypeScript type check
- Build check
- No test runners
- Mobile CI: `expo export --platform all`

### `.gitignore` additions

```
apps/mobile/.expo
apps/mobile/ios
apps/mobile/android
```

---

## 23. PR Specifications — Web

---

### PR #1 — `feat/project-scaffold` ✅

**Description:** Initialize the WellPath monorepo. Foundation only — no feature code.

**AC:**
- [x] Monorepo root with `apps/web` and `apps/api`
- [x] `apps/web` — Vite + React + TypeScript
- [x] `apps/api` — Node.js + Express + TypeScript
- [x] ESLint + Prettier configured for both with shared rules
- [x] `tsconfig.json` for both apps
- [x] `.env.example` for both apps — all keys documented with comments
- [x] `constants/index.ts` placeholder structure for both apps
- [x] `.gitignore` includes `**/CLAUDE.md`, `PLANNING.md`, `node_modules`, `dist`, `.env`
- [x] GitHub Actions CI: lint + type-check + build for both apps on every PR
- [x] Root `README.md` with project description, setup steps, PR conventions, note that CLAUDE.md is local-only
- [x] No test runners
- [x] CLAUDE.md created locally for every folder — never committed

---

### PR #2 — `feat/database-setup` ✅

**Depends on:** PR #1

**Description:** MongoDB connection and all Mongoose schemas.

**AC:**
- [x] `apps/api/src/lib/db.ts` — connect/disconnect, error logging, health check on boot
- [x] All 9 schemas created: `User`, `Routine`, `Checkin`, `CalendarEvent`, `Notification`, `OnboardingResponse`, `Group`, `GroupInvite`, `GroupActivity`
- [x] All enums in `constants/index.ts` — never inline in schemas
- [x] Indexes: `userId + date` unique on routines, `userId` on checkins, `externalEventId` on calendarevents, `userId + date` on groupactivity
- [x] `MONGODB_URI` from `.env` — no raw strings
- [x] CI passes

---

### PR #3 — `feat/auth` ✅

**Depends on:** PR #2

**Description:** Email/password + Google OAuth + Microsoft OAuth. JWT in httpOnly cookies.

**Backend AC:**
- [x] `POST /api/auth/register`
- [x] `POST /api/auth/login`
- [x] `GET /api/auth/google` + `/api/auth/google/callback`
- [x] `GET /api/auth/microsoft` + `/api/auth/microsoft/callback`
- [x] Work email detection on OAuth login → `isWorkEmail: true`
- [x] `requireAuth` middleware — validates JWT, attaches `req.user`
- [x] Tokens in httpOnly cookies

**Frontend AC:**
- [x] `/login` — email/password + Google + Microsoft buttons
- [x] `/register` — name, email, password
- [x] Zustand auth store
- [x] Protected route wrapper
- [x] Redirect to `/onboarding` if `onboardingComplete: false`
- [x] Redirect to `/dashboard` if onboarded
- [x] Warm UI, no harsh error messages
- [x] CI passes

---

### PR #4 — `feat/onboarding` ✅

**Depends on:** PR #3

**Description:** Layer 1 onboarding — card swipe UI, 10 questions, per-question DB save, medicine flow, business owner fork.

**AC:**
- [x] `<OnboardingCard />` — card shell with swipe + keyboard support
- [x] `<OnboardingProgress />` — animates on answer selection, not Next click
- [x] `<OnboardingSkip />` — consistent placement, never hidden
- [x] `<SwipeHint />` — shown once on desktop, stored in localStorage
- [x] All answer type components: `YesNoAnswer`, `SingleSelectAnswer`, `MultiSelectAnswer`, `TimePickerAnswer`, `TextAnswer`, `PhotoUploadAnswer`
- [x] `useSwipeGesture` hook — 80px threshold, rotation, opacity, bounce-back on unanswered
- [x] `useKeyboardNav` hook — `←` `→` arrows, `1–4` number keys
- [x] Question definitions in `essentialQuestions.ts` with `showIf` for all branching
- [x] Max 10 questions, max 5 minutes
- [x] Progress bar at 100% → 800ms pause → dashboard
- [x] Skip = 50% weight of question
- [x] Every answer saved immediately: `PATCH /api/onboarding/response`
- [x] `timeToAnswerSeconds` tracked per question
- [x] `droppedOffAtQuestion` saved on session end
- [x] Resume from exact question on return
- [x] Medicine gate: Yes / No / Prefer not to say
- [x] Medicine card: nickname, timing, with food, is critical — nothing else
- [x] Max 5 medicines in Layer 1
- [x] Inline disclaimer below medicine form
- [x] `isCritical: 'not_sure'` treated as critical in all downstream logic
- [x] Personal life questions NOT in Layer 1 — Layer 2/3 only
- [x] Business owner extra step after role selection
- [x] Calendar connect as second-to-last step with clear skip
- [x] Photo upload as final step — fully optional
- [x] `onboardingComplete: true` and redirect to `/dashboard` on completion
- [x] Soft sage / muted grey color language — never red for skip
- [x] Card transition 200ms ease
- [x] CLAUDE.md updated locally for all touched folders
- [x] CI passes

**Additional (not in original spec):**
- [x] `home_area` + `office_area` text questions added (feeds PR #6 travel estimate)
- [x] `commute_duration` answer type + `CommuteDurationAnswer` component added
- [x] Name and Google profile photo pre-filled from OAuth profile on first entry

---

### PR #5 — `feat/profile-photo` ✅

**Depends on:** PR #3

**Description:** Cloudinary upload, Avatar component with initials fallback.

**AC:**
- [x] Cloudinary SDK in `apps/api`
- [x] `CLOUDINARY_*` env vars in `.env.example`
- [x] Constants for formats, size, folder, dimensions in `constants/index.ts`
- [x] `POST /api/user/profile-photo` — validate, upload, save URLs
- [x] `DELETE /api/user/profile-photo` — Cloudinary delete, clear user document
- [x] Format + size validation before Cloudinary call
- [x] Server-side transformations: `400x400` full, `100x100` thumbnail, `gravity: face`
- [x] `<Avatar />` component — photo or initials fallback, color from name hash
- [x] `<Avatar />` used in nav, group cards, profile, group page
- [x] `<PhotoUpload />` in profile settings — upload, preview, remove
- [x] Remove confirm: *"Remove your photo? Your initials will show instead."*
- [x] CI passes

---

### PR #6 — `feat/travel-time` ✅

**Depends on:** PR #4

**Description:** Google Maps Distance Matrix API for commute duration. Shown to user, editable.
> **Deviation:** Implemented with OpenRouteService (free tier) as default. Google Maps support kept behind `TRAVEL_PROVIDER=google_maps` env toggle.

**AC:**
- [x] `GET /api/travel/estimate` endpoint
- [x] Mode mapping: car/bus/two_wheeler → driving-car, metro → driving-car, walk → foot-walking, cycle → cycling-regular *(ORS mode names)*
- [x] Returns `{ durationMinutes, distanceKm, source }`
- [x] On failure → `{ error, fallback: true }` → frontend shows manual input
- [x] API key in `.env` — never exposed to frontend (`ORS_API_KEY` / `GOOGLE_MAPS_API_KEY`)
- [x] Rate limit: max 10 calls per user per day
- [x] User sees fetched time and can confirm or edit
- [x] `travelTimeOverridden: true` if edited
- [x] CI passes

**Additional (not in original spec):**
- [x] `TRAVEL_PROVIDER` env toggle — `openrouteservice` (default) or `google_maps`
- [x] ORS geocode → directions two-step flow (`geocodeORS` helper)
- [x] Nodemon configured (`nodemon.json`) — watches `src/` and `.env`, auto-restarts on any change

---

### PR #7 — `feat/calendar-integration` ✅

**Depends on:** PR #3

**Description:** Google Calendar + Microsoft Calendar sync. Cross-provider support. Calendar event caching.

**AC:**
- [x] Google Calendar OAuth with `calendar.readonly` scope
- [x] Microsoft Graph OAuth with `Calendars.Read` scope
- [x] Both connections stored in `calendarConnections` array — independent of login provider
- [x] Sync iterates all active connections
- [x] Events cached in `calendarevents` collection with `provider` field
- [x] Deduplication: same title + startTime within 2-minute window
- [x] Token refresh independent per connection
- [x] Expired token → Settings badge notification
- [x] Day type classification: light / moderate / packed (automatic)
- [x] `GET /api/calendar/events?date=<date>` returns merged events for a day
- [x] CI passes

**Additional (not in original spec):**
- [x] JWT-signed `state` param on both OAuth flows for CSRF protection
- [x] `GET /api/calendar/connections` — lists active connections
- [x] `DELETE /api/calendar/connections/:provider` — disconnect a provider
- [x] `CalendarConnectAnswer` component in onboarding — real OAuth redirect, shows "Connected ✓" badge

---

### PR #8 — `feat/morning-checkin` ✅

**Depends on:** PR #7

**Description:** Daily morning check-in — energy, mood, optional note. Calendar auto-read.

**AC:**
- [x] Morning check-in shown on dashboard if not yet submitted today
- [x] 3 questions max: energy level, mood, anything different today (optional)
- [x] Card swipe UI — same component as onboarding
- [x] Calendar day type detected automatically — NOT asked
- [x] Saves to `routines.morningCheckin`
- [x] `POST /api/checkin/morning`
- [x] CI passes

**Additional (not in original spec):**
- [x] `GET /api/checkin/morning/status` — returns `{ submitted, date }` used by dashboard banner logic

---

### PR #9 — `feat/ai-routine-engine` ✅

**Depends on:** PR #8

**Description:** AI routine generation. Ollama and Gemini switchable via `USE_LOCAL_AI`.
> **Deviation:** `llama3.1` used in practice (`llama3.2` not installed on dev machine — functionally equivalent).

**AC:**
- [x] `USE_LOCAL_AI=true` → Ollama (`llama3.1` + nomic-embed-text) *(spec said llama3.2)*
- [x] `USE_LOCAL_AI=false` → Gemini Pro (gemini-1.5-pro + text-embedding-004)
- [x] Single `ai.ts` client in `lib/` — one interface, two implementations
- [x] Routine generation triggered after morning check-in submission
- [x] Input: user profile, calendar, check-in, history — NO medicine names, NO medical conditions
- [x] Medicine timings passed as "medicine_reminder at 08:00" only
- [x] Output: array of time-slotted tasks with category, title, warm description
- [x] Medicine tasks are fixed anchors — AI cannot move them
- [x] `generationPromptSnapshot` stored for debugging — medical data explicitly excluded
- [x] Business owner routing rules applied (see Section 11/12)
- [x] `generatedBy` field set correctly
- [x] CI passes

**Additional (not in original spec):**
- [x] Hardcoded fallback routine (5 sensible tasks) when AI not configured or call fails — never errors to user
- [x] `isAIConfigured` check at runtime — graceful degradation without requiring env changes

---

### PR #10 — `feat/dashboard` ✅

**Depends on:** PR #9

**Description:** Today's routine view. Primary daily screen.

**AC:**
- [x] Shows today's generated routine as task cards
- [x] Tasks sorted by time
- [x] Each task card: time, title, category icon, status indicator
- [x] "Mark as done" on each task
- [ ] "Ended Early" on meeting tasks — *deferred to PR #12 (adhoc-meetings)*
- [ ] Quick-add meeting button — *deferred to PR #12*
- [ ] Business owner "Day Overview" strip — *deferred to PR #16 (settings/profile)*
- [x] Morning check-in banner if not yet submitted
- [ ] Pending group invite banner — *deferred to PR #18 (groups-ui)*
- [ ] Calendar connect prompt (once per week) — *deferred to PR #16*
- [x] CI passes

**Additional (not in original spec):**
- [x] Day type badge (Light / Moderate / Packed) with colour coding
- [x] "Building your routine..." placeholder state when check-in submitted but routine not yet generated

---

### PR #11 — `feat/task-checkin` ✅

**Depends on:** PR #10

**Description:** Task completion check-ins, missed reason capture, early meeting completion.

**AC:**
- [ ] At task time: notification sent — *push notification deferred to PR #13*
- [x] Check-in options: Done / Missed
- [x] If Missed: optional free text for reason and "what did you do instead?"
- [x] Per-entry group sharing override: "Share this with your group? Yes / No" *(simplified; "Just this once" distinction handled in PR #17 group logic)*
- [x] Critical medicine tasks: only "Done" and "Remind me in 10 minutes" — no skip
- [x] Non-critical tasks: standard options including skip
- [x] Saves to `checkins` collection
- [x] Updates `routines.tasks[].status`
- [x] CI passes

**Additional (not in original spec):**
- [x] `'skipped'` added to `CHECKIN_RESPONSES` constant and checkin model
- [x] `shareWithGroup?: boolean` field on `Checkin` model — stored per task action, read by PR #17 group projection
- [x] `recordTaskCheckin()` service function — fires non-blocking (fire-and-forget) from routine controller
- [x] "Remind me in 10 min" implemented via browser `Notification` API + `setTimeout` (stub until PR #13 adds Web Push)

---

### Extra — Swagger / OpenAPI Docs ✅ *(not in original PR list)*

**Description:** OpenAPI 3.0.3 spec for all API endpoints, served via Swagger UI.

**What was built:**
- [x] `src/docs/openapi.ts` — full spec (19 endpoints, 7 tags, request/response schemas)
- [x] Swagger UI mounted at `http://localhost:3001/api/docs` in development only
- [x] Disabled in production (`NODE_ENV === 'production'`)
- [x] Must be updated in every PR that adds or changes an endpoint

---

### PR #12 — `feat/adhoc-meetings` ✅

**Depends on:** PR #11

**Description:** Add sudden meetings from dashboard during the day.

**AC:**
- [x] Quick-add button always visible on dashboard (`+ Meeting` in header)
- [x] Form: title, start time, expected duration (15/30/45/60/90/120 min select)
- [x] Saved to `routines.meetings` with `isAdHoc: true`
- [x] Routine recalculates free time around new meeting (`totalMeetingMinutes` / `totalFreeMinutes` updated via `$inc`)
- [x] Gentle suggestion for reclaimed time if meeting ends early (inline dismissable banner)
- [x] `POST /api/routine/:routineId/meetings` endpoint
- [x] CI passes

**Additional (not in original spec):**
- [x] `PATCH /api/routine/:routineId/meetings/:meetingId/end-early` endpoint — marks meeting ended early, computes `freeMinutesGained`, recalculates totals
- [x] `IRoutineMeeting` given `_id` (removed `_id: false` from schema) so meetings can be targeted by ID
- [x] `MeetingCard` component — displays all meetings with ad-hoc badge, "Ended early?" button with time picker
- [x] Meetings shown in a dedicated labelled section above routine tasks in the dashboard
- [x] Both endpoints documented in Swagger spec (`/api/docs`)
- [x] **Task time enforcement (bug fix):** `isTaskActionable(taskTime)` helper — tasks whose scheduled time hasn't arrived yet show as "Upcoming" (no action buttons, lighter card). Prevents users from ticking off all tasks at once unrealistically.

---

### PR #13 — `feat/desktop-notifications`

**Depends on:** PR #12

**Description:** Web Push API + Service Worker for desktop browser notifications.

**AC:**
- [ ] Service worker registered on login
- [ ] Push subscription stored in `users.pushSubscription`
- [ ] VAPID keys in `.env`
- [ ] Notifications sent via BullMQ scheduled jobs
- [ ] Clicking notification opens relevant check-in card
- [ ] Critical medicine notifications bypass DND
- [ ] Non-critical: one reminder only, no follow-up spam
- [ ] All copy warm and minimal (see notification tone specs)
- [ ] Group activity notifications batched — one per group per day at 8pm local time
- [ ] `notifications` collection logs all sent notifications
- [ ] CI passes

---

### PR #14 — `feat/embeddings`

**Depends on:** PR #9

**Description:** Embedding pipeline for profile and check-in data.

**AC:**
- [ ] Profile embedding generated on onboarding completion
- [ ] Profile embedding regenerated on profile updates
- [ ] Check-in free text fields embedded on submission
- [ ] "Did instead" entries embedded
- [ ] Medical data, medicine names, personal life answers — never embedded
- [ ] `USE_LOCAL_AI=true` → nomic-embed-text via Ollama
- [ ] `USE_LOCAL_AI=false` → text-embedding-004 via Gemini
- [ ] Embeddings stored in respective documents
- [ ] CI passes

---

### PR #15 — `feat/evening-summary`

**Depends on:** PR #11

**Description:** End-of-day wrap-up check-in.

**AC:**
- [ ] Triggered at `workdayEndTime` (or 8pm default)
- [ ] Card UI: overall rating (1–5), how was your day (optional free text), note for tomorrow (optional)
- [ ] Saved to `checkins` collection with `type: 'evening_summary'`
- [ ] Warm, brief copy — never guilt-inducing
- [ ] CI passes

---

### PR #16 — `feat/settings`

**Depends on:** PR #15

**Description:** Profile management, calendar management, photo, sharing preferences.

**AC:**
- [ ] Update name, work shift, work mode
- [ ] Update commute details (re-triggers Maps API fetch)
- [ ] Update medicine list (add, edit, remove)
- [ ] Update diet, sleep, exercise, focus window
- [ ] "Help us know you better" section for Layer 3 deep profile
- [ ] Weekly prompt: "Your profile is X% complete"
- [ ] Calendar management: all connected calendars, re-authenticate, disconnect, add new
- [ ] Profile photo upload / remove
- [ ] Group sharing defaults
- [ ] Master group sharing off switch
- [ ] All medicine reminder toggles
- [ ] CI passes

---

### PR #17 — `feat/groups-backend`

**Depends on:** PR #3

**Description:** Groups API, invites, group activity projection.

**AC:**
- [ ] `POST /api/groups` — create group, send invites
- [ ] `GET /api/groups/:id` — group with member activity for today
- [ ] `POST /api/groups/:id/invite` — invite by email
- [ ] `POST /api/groups/invites/:inviteId/accept`
- [ ] `POST /api/groups/invites/:inviteId/decline`
- [ ] `DELETE /api/groups/:id/members/me` — leave silently
- [ ] `PATCH /api/groups/:id/sharing` — update sharing preference
- [ ] Background job: builds `groupactivity` projection daily at 10pm user local time
- [ ] `groupactivity` builder explicitly excludes `medicine` and `family` at query level
- [ ] `missedReason` / `didInstead` only in projection if `with_reasons` AND per-entry confirmed
- [ ] Invite email for non-WellPath users with 7-day expiry link
- [ ] CI passes

---

### PR #18 — `feat/groups-ui`

**Depends on:** PR #17

**Description:** Group page, sharing controls, invite flow — all in card swipe UI.

**AC:**
- [ ] Groups section in main navigation
- [ ] Create group: name input + email invite + member invite toggle
- [ ] Group page: member cards in join-order, completion bar, shared reasons if available
- [ ] Own card visually distinct — subtle highlight
- [ ] 100%: subtle star indicator — no trophy, no podium
- [ ] Missed tasks and reasons: muted, warm — never red
- [ ] "Edit what I share" from own card
- [ ] Sharing preference screen: 4 options as swipeable cards
- [ ] Per-entry share override in missed task check-in
- [ ] "Invite someone" always visible on group page
- [ ] Leave group in Group Settings — *"You can always come back"*
- [ ] Pending invite banner on dashboard
- [ ] CI passes

---

### PR #19 — `feat/app-shell-navigation` ✅ Done

**Branch:** `feat/app-shell-navigation`

**What was built:**
- `<AppShell />` — flex layout (TopBar + [SideNav | Content]), never unmounts. Uses Flexbox (not CSS Grid — simpler for this layout).
- `<TopBar />` — `≡` toggle, WellPath wordmark, `<ThemeToggle />`, notification bell, Avatar with dropdown (Settings / Sign Out)
- `<SideNav />` — 5 nav items (Today, My Routine, Groups, History, Settings) with SVG icons; user card at bottom links to Settings
- `<SideNavItem />` — uses React Router `NavLink` `isActive` for active state (avoids double source of truth with navStore); sage green pill when expanded, left border when collapsed
- `<NavTooltip />` — tooltip shown on collapsed icon hover using Tailwind `group/tooltip`
- `<MobileDrawer />` — always mounted, `translate-x` animation; backdrop closes drawer; nav item click closes drawer
- `navStore.ts` — `isNavCollapsed` (localStorage-persisted), `activeGroupId`, `dashboardPanel`, `isMobileDrawerOpen`
- `Dashboard.tsx` refactored → thin data-fetcher; content split into `TodayPanel`, `CalendarPanel`, `CheckinPanel`, `DashboardPanels`, `DayBanner`, `TaskCard`, `MeetingCard`, `AddMeetingForm`
- `GroupsPage.tsx` refactored → 3-line thin wrapper rendering `GroupsPanel`
- Groups decomposed into: `GroupList`, `GroupListItem`, `GroupDetail`, `MemberCard`, `GroupSettings`, `GroupsPanel` (two-column desktop, full-screen list/detail on mobile)
- `App.tsx` — shell-wrapped routes nested via `<Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>` with `<Outlet />`; onboarding and morning check-in remain outside shell
- All 6 new constants added to `apps/web/src/constants/index.ts`

**Deviations from spec:**
- Shell uses Flexbox not CSS Grid — achieves identical layout with fewer classes
- Active nav state derived from `useLocation()` via `NavLink.isActive`, not `navStore.activeView` — eliminates sync bugs
- `ROUTES.HISTORY` redirects to dashboard (`<Navigate to={ROUTES.DASHBOARD} />`) — History page not yet built
- `InviteFlow.tsx` not created as separate file — create form lives inline in `GroupsPanel.tsx`
- Content transitions (150ms cross-fade) not implemented — views swap instantly; adding CSS transitions deferred to avoid complexity with React Router outlet

---

### fix/evening-summary-and-nav-overflow 🔲

**Branch:** `fix/evening-summary-and-nav-overflow`
**Depends on:** PR #19 merged
**Must be done before:** any new feature PR

**Description:**
Fix three confirmed bugs observed in the running app. All three are independent and fixed in a single PR. Read BUG-01, BUG-02, BUG-03 in Section 0 "Known Bugs — Pending Fix" for full root cause analysis, files to investigate, and test cases.

**BUG-01 — Horizontal scrollbar on nav collapse/expand**
- [ ] `AppShell.tsx` root element: `overflow-hidden` class applied — no horizontal overflow reaches viewport during nav transition
- [ ] Content area flex child: `min-w-0` class applied — flex child can shrink below content width
- [ ] `<main>` scroll container: `overflow-x-hidden` applied
- [ ] Exact fix pattern:
  ```tsx
  <div className="flex h-screen w-screen overflow-hidden">
    <SideNav />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
      <TopBar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  </div>
  ```
- [ ] Audit and remove any `w-max`, `min-w-max`, `whitespace-nowrap` from task title or card components
- [ ] Test: collapse and expand nav at 1280px, 1440px, 1920px — no scrollbar at any width
- [ ] Test: collapse/expand with a long task title in TodayPanel — no overflow

**BUG-02 — Evening summary overlaps dashboard (not full-screen)**
- [ ] `EveningSummary` rendered as a full content-area **replacement**, not a sibling alongside task list
- [ ] Pattern in `Dashboard.tsx` (or owner component):
  ```tsx
  {showEveningSummary
    ? <EveningSummary onComplete={handleComplete} onSkip={handleSkip} />
    : (
      <>
        <DayBanner />
        <DashboardPanels />
      </>
    )
  }
  ```
- [ ] Tab bar (Today / Calendar / Check-in) is hidden while evening summary is active — not visible, not interactive
- [ ] `<EveningSummary />` fills full content area (`w-full h-full`) — card is centred within it
- [ ] Test: trigger evening summary — nothing from dashboard visible behind it
- [ ] Test: submit → dashboard panels reappear correctly

**BUG-03 — Evening summary reappears after submission**
- [ ] `GET /api/checkin/evening/status` endpoint added to `checkin.routes.ts`
  - Returns `{ submitted: boolean, date: string }`
  - Checks for Checkin document with `type: 'evening_summary'` for today's date and userId
  - Mirrors existing `GET /api/checkin/morning/status` pattern exactly
- [ ] `showEveningSummary` condition: `isAfterWorkdayEnd && !eveningSubmitted` — both must be true
- [ ] `eveningSubmitted` sourced from `/checkin/evening/status` response — fetched on Dashboard mount
- [ ] On submit: set `eveningSubmitted = true` locally **before** API response to prevent flash
- [ ] On skip: set `eveningSubmitted = true` locally AND `POST /api/checkin/evening` with `{ skipped: true }` — status endpoint returns `submitted: true` on next check
- [ ] React Query: invalidate `['eveningStatus', today]` key after submit or skip
- [ ] Test: submit → navigate to Groups → back to Today → summary does NOT reappear
- [ ] Test: skip → refresh page → summary does NOT reappear
- [ ] Test: next day after midnight → summary correctly resets and shows again after workday end

**CI passes**

---

### PR #20 — `feat/mood-energy-trends` 🔲

**Branch:** `feat/mood-energy-trends`
**Depends on:** bug fix PR merged

**Description:**
Build the History page (currently redirects to dashboard) and add a Trends tab with AI-generated insight cards and a mood/energy graph. Uses data already being collected from morning check-ins and routines — no new data collection. Insights generated on-demand and cached in Redis for 24 hours.

**New files to create:**
- `apps/web/src/features/history/HistoryPage.tsx`
- `apps/web/src/features/history/components/PastRoutinesList.tsx`
- `apps/web/src/features/history/components/TrendsTab.tsx`
- `apps/web/src/features/history/components/InsightCard.tsx`
- `apps/web/src/features/history/components/MoodGraph.tsx`
- `apps/api/src/features/insights/insights.routes.ts`
- `apps/api/src/features/insights/insights.service.ts`
- `apps/api/src/features/insights/insights.controller.ts`

**Backend AC:**
- [ ] `GET /api/insights/trends` endpoint
  - Requires `requireAuth` middleware
  - Queries last 30 days of `routines` + `checkins` for authenticated user
  - Builds structured summary per day: `{ date, energyLevel, mood, completionPercentage, meetingCount, categoriesMissed[] }`
  - Sends summary to AI with tone prompt: curiosity-driven, warm, never judgmental, min 3 data points per insight, no fabrication
  - **Medical data, medicine names, conditions, personal life answers explicitly excluded from AI prompt** — enforced at service layer before prompt is built, not as a note
  - Returns `{ generatedAt, insights: [{ id, type, title, body, dataPoints, category }] }`
  - Returns `{ insights: [] }` if < 3 days of checkin data — never fabricates
  - `type` values: `'pattern' | 'positive' | 'observation' | 'weekly_summary'`
  - `category` values: `'energy' | 'completion' | 'meetings' | 'exercise'`
- [ ] `GET /api/insights/mood-graph` endpoint
  - Returns last 14 days: `[{ date, energyLevel, mood, completionPercentage }]`
  - `energyLevel` mapped: `low=1, medium=2, high=3`
  - Days with no checkin → `null` values — frontend handles gap gracefully, no crash
- [ ] Redis cache: key `insights:{userId}`, TTL 24 hours (`INSIGHT_CACHE_TTL_HOURS = 24` from constants)
- [ ] Cache busted when new `morningCheckin` is submitted — hook into existing checkin service
- [ ] `insightsEnabled: false` on user profile → both endpoints return `{ disabled: true }` immediately, no AI call made
- [ ] `INSIGHT_TYPES` and `INSIGHT_CACHE_TTL_HOURS` added to `apps/api/src/constants/index.ts`
- [ ] Swagger docs updated for both new endpoints

**Frontend AC:**
- [ ] `ROUTES.HISTORY = '/history'` now routes to `<HistoryPage />` — remove the `<Navigate to={ROUTES.DASHBOARD} />` redirect from PR #19 deviation
- [ ] `<HistoryPage />` — two tabs: **Past Routines** | **Trends**
  - Active tab: sage green underline, 2px
  - Tab switch: 150ms cross-fade, no scroll reset
- [ ] **Past Routines tab** — `<PastRoutinesList />`
  - List of past routine summary cards: date, completion %, day type badge, energy level icon
  - Grouped by week
  - Empty state: *"No past routines yet — check back after your first day"*
- [ ] **Trends tab** — `<TrendsTab />`
  - `<MoodGraph />` — `recharts` LineChart (already available in project)
    - Energy line (sage green, smooth curve) over 14 days
    - Completion % as shaded area (warm amber, 30% opacity) behind line
    - X-axis: abbreviated dates, no gridlines
    - Y-axis: hidden — no raw numbers shown
    - Null data points: line breaks gracefully (no crash, no zero render)
    - Caption below graph: *"Your energy and routine tend to move together"*
    - Full width on all breakpoints
  - `<InsightCard />` grid below graph
    - Each card: category icon, `title` (small muted label), `body` (warm readable text)
    - Category icons: 📅 pattern, ✨ positive, 👀 observation, 📊 weekly_summary
    - Dismiss button (×) top-right — stores dismissed `insight.id` in `localStorage`; dismissed cards never re-shown
    - Hover: subtle shadow elevation
    - Desktop (> 1024px): 2-column grid
    - Tablet (768–1024px): single column
    - Mobile (< 768px): single column, full width
  - **Empty state** (< 3 days data or `insights: []`):
    - No graph rendered
    - Centred card: *"Check back in a few days — we're just getting to know you 🌱"*
    - Subtitle: *"We need at least 3 days of check-ins to notice patterns"*
  - **Loading state**: 2 skeleton cards on desktop, 1 on mobile — never a spinner
  - **Disabled state** (if `insightsEnabled: false`): message explaining insights are turned off + link to Settings
- [ ] `insightsEnabled` toggle added to Settings page — turns Trends tab off with message *"You can turn this back on anytime"*
- [ ] Side nav History item now correctly links to `/history` — no redirect
- [ ] `dark:` Tailwind variants applied to all new components — consistent with rest of app
- [ ] CI passes

---

### PR #21 — `feat/compassionate-streak` 🔲

**Branch:** `feat/compassionate-streak`
**Depends on:** PR #20 merged

**Description:**
Streak system that measures consistency, not perfection. 60% completion = a valid streak day. One grace day per rolling 7-day window. Streak count shown as flame icon in TopBar. StreakPanel opens as a right-side drawer without navigating away.

**Schema update — `users` collection:**
```js
streak: {
  current: Number,
  personalBest: Number,
  lastStreakDate: String,           // "2025-05-16"
  graceDaysUsedThisWeek: Number,    // resets Monday 00:00 user local time
  graceWeekStartDate: String,
  totalDaysCompleted: Number,       // lifetime, never resets
  milestonesSeen: [Number]          // prevents re-showing same milestone
}
```

**New files to create:**
- `apps/web/src/features/streak/StreakPanel.tsx`
- `apps/web/src/features/streak/components/StreakCalendar.tsx`
- `apps/api/src/features/streak/streak.routes.ts`
- `apps/api/src/features/streak/streak.service.ts`
- `apps/api/src/features/streak/streak.controller.ts`

**Backend AC:**
- [ ] `streak` fields added to User Mongoose schema
- [ ] `GET /api/streak` endpoint
  - Returns `{ current, personalBest, graceDaysUsedThisWeek, graceRemaining, totalDaysCompleted, last30Days: [{ date, status }] }`
  - `status` per day: `'complete' | 'grace' | 'missed' | 'future' | 'pending'`
  - `pending` = today, calculation not yet run
  - `graceRemaining = STREAK.GRACE_DAYS_PER_WEEK - graceDaysUsedThisWeek`
- [ ] Streak calculation service — runs nightly at 23:59 user local time via node-cron:
  - `completionPercentage >= 60` → `complete`, increment `current`, increment `totalDaysCompleted`
  - `< 60` AND grace available → `grace`, use grace, increment `current`, increment `graceDaysUsedThisWeek`, increment `totalDaysCompleted`
  - `< 60` AND grace exhausted → `missed`, check reset condition
  - Reset condition: two consecutive `missed` days OR two graces used in one week → `current = 0`
  - `personalBest` updated whenever `current > personalBest`
  - `graceDaysUsedThisWeek` resets every Monday 00:00 user local time (separate cron)
- [ ] Milestone detection after each calculation:
  - Checks if `current` is in `STREAK.MILESTONES` array (`[3,7,14,30,60,100]`) AND not in `milestonesSeen`
  - If new milestone: send push notification, add to `milestonesSeen`
  - Notification copy per milestone: `3` → *"Three days in. The hardest part is starting — you've done that."*, `7` → *"A full week. You're building something real."*, `14` → *"Two weeks. This is becoming yours."*, `30` → *"A month of showing up. That's not a streak — that's a habit."*
- [ ] `STREAK` constants (`COMPLETION_THRESHOLD_PERCENT: 60`, `GRACE_DAYS_PER_WEEK: 1`, `MILESTONES: [3,7,14,30,60,100]`) added to `apps/api/src/constants/index.ts`
- [ ] Swagger updated

**Frontend AC:**
- [ ] Flame icon 🔥 + `current` count added to `<TopBar />` between notification bell and avatar
  - Shown when `current > 0`; flame dimmed (opacity-40) when `current === 0` — never hidden entirely
  - Clicking flame opens `<StreakPanel />`
- [ ] `<StreakPanel />` — right-side drawer, 320px wide, slides in from right (200ms), semi-transparent backdrop
  - Header: "Your Streak 🔥" + close button (×)
  - Current count: large warm typography, e.g. "18 days"
  - Grace days remaining: *"1 grace day remaining this week"* — muted small text
  - Personal best: *"Personal best: 23 days"*
  - Total days: *"You've shown up X days in total"*
  - `<StreakCalendar />` below stats
  - Milestone message if just reached: inline card, sage green background, dismissable
  - Reset message if recently reset: inline card, warm stone background — shown once per reset, then cleared from `localStorage`
  - Polls `GET /api/streak` every 5 minutes while panel is open — today's dot updates live
- [ ] `<StreakCalendar />` — 30-day dot grid
  - 5 rows of 7 dots, 8px × 8px, 4px gap
  - `complete` → filled sage green
  - `grace` → dimmed sage green ring
  - `missed` → empty grey outline
  - `future` → very pale outline
  - `pending` → subtle pulse animation (CSS keyframes)
  - Each dot has `aria-label` e.g. `"May 16: complete"`
- [ ] Streak panel accessible from TopBar only — not a nav item
- [ ] `dark:` Tailwind variants on all new components
- [ ] CI passes

---

### PR #22 — `feat/weekly-reset-ritual` 🔲

**Branch:** `feat/weekly-reset-ritual`
**Depends on:** PR #21 merged

**Description:**
Sunday evening / Monday morning reflection ritual. Five swipeable cards — rating, one win, one intention, week-ahead preview, AI-generated weekly intention. Reuses existing `<OnboardingCard />` and `<OnboardingProgress />` components. Results feed into Monday's AI routine generation.

**New collection — `weeklyreflections`:**
```js
{
  _id: ObjectId,
  userId: ObjectId,
  weekStartDate: String,            // Monday "2025-05-19"
  reflection: {
    lastWeekRating: enum['exhausting','tough','okay','good','great'],
    oneWin: String,                 // optional
    oneIntention: String,           // optional
    calendarPreview: [{ date, dayType }],
    aiWeeklyIntention: String
  },
  submittedAt: Date,
  notificationSentAt: Date,
  reminderSentAt: Date,
  skipped: Boolean
}
```

**New files to create:**
- `apps/web/src/features/weekly/WeeklyResetFlow.tsx`
- `apps/api/src/features/weekly/weekly.routes.ts`
- `apps/api/src/features/weekly/weekly.service.ts`
- `apps/api/src/features/weekly/weekly.model.ts`
- `apps/api/src/features/weekly/weekly.controller.ts`

**Backend AC:**
- [ ] `weeklyreflections` Mongoose schema and model created
- [ ] `GET /api/weekly-reflection/current` — returns reflection for current week if exists, `{ exists: false }` if not
- [ ] `GET /api/weekly-reflection/preview` — returns next 5 calendar days: `[{ date, dayType, meetingCount }]`; `very_packed` = 5+ meetings or < 60 min free
- [ ] `POST /api/weekly-reflection` — saves reflection, generates `aiWeeklyIntention` via AI, returns it
  - AI prompt receives: `lastWeekRating`, `oneIntention`, `calendarPreview`
  - If `lastWeekRating` is `exhausting` or `tough` → prompt includes: *"user had a hard week — generate a lighter Monday routine"*
  - `aiWeeklyIntention` is one warm sentence — concise, personal, references the preview
  - Medical data, medicines, personal life answers never in prompt
- [ ] **Monday routine injection**: `routine.service.ts` checks for current week's reflection before generating Monday routine; if found, injects `lastWeekRating` + `oneIntention` into AI prompt
- [ ] **Sunday 7pm cron** per user (respects timezone): checks if reflection submitted → skips if yes → sends push notification *"5 minutes to set up your week? 📅"*
- [ ] **Monday 7am cron** per user: sends one reminder only if Sunday notification sent AND reflection not submitted
- [ ] `WEEKLY_REFLECTION` constants added to `apps/api/src/constants/index.ts`
- [ ] Settings field `weeklyReflectionEnabled` + `weeklyReflectionTiming` added to user profile (add to User schema)
- [ ] Swagger updated

**Frontend AC:**
- [ ] `<WeeklyResetFlow />` — full-screen overlay, rendered outside `<AppShell />` (same level as onboarding)
  - Opened by: Sunday/Monday push notification tap OR dashboard Monday banner tap
  - 5 cards using existing `<OnboardingCard />` — same swipe mechanics, no new component needed
  - Progress bar uses existing `<OnboardingProgress />` across all 5 cards
- [ ] **Card 1 — Rating** (`single_select`, emoji):
  - 5 options: 😴 Exhausting / 😕 Tough / 😐 Okay / 🙂 Good / 🌟 Great
  - Rendered via existing `<SingleSelectAnswer />` with emoji chips
  - Not skippable — required
  - Auto-advances 600ms after selection
- [ ] **Card 2 — One Win** (`text_input`, optional):
  - Placeholder: *"Even small wins count — a good night's sleep, a lunch break you actually took..."*
  - Skip clearly visible
- [ ] **Card 3 — One Intention** (`text_input`, optional):
  - Placeholder: *"Not a resolution — just a gentle intention."*
  - Skip clearly visible
- [ ] **Card 4 — Week Ahead Preview** (read-only):
  - Fetches `GET /api/weekly-reflection/preview` on card render (lazy — not before)
  - Loading: skeleton rows
  - 5 days rendered: day name + density dots (● = 1 per meeting) + label
  - AI commentary below from simple client-side rule (no AI call): if any day is `very_packed` → *"[Day] looks heavy. We'll plan something restorative around it."*
  - Auto-advances 4 seconds OR tap anywhere
  - Not skippable
- [ ] **Card 5 — AI Intention** (read-only):
  - Calls `POST /api/weekly-reflection` on render with all collected answers
  - Loading: pulsing text *"Thinking about your week..."*
  - Displays `aiWeeklyIntention` in large warm typography
  - Single button: *"Start the week →"* — closes flow, returns to dashboard
- [ ] **Dashboard Monday banner** — shown if `GET /api/weekly-reflection/current` returns `{ exists: false }` and it is Monday
  - Text: *"Quick 2-minute week check-in?"* CTA: *"Let's go →"*
  - Dismiss (×) — stored in `localStorage` as `weekly_reflection_dismissed:{weekStartDate}`
  - Shown once per Monday; not shown again if dismissed
- [ ] **Settings** — "Weekly Ritual" section:
  - On/Off toggle (`weeklyReflectionEnabled`)
  - Timing: Sunday evening / Monday morning (radio buttons)
- [ ] `dark:` Tailwind variants on all new components
- [ ] CI passes

---

### PR #23 — `feat/travel-mode` 🔲

**Branch:** `feat/travel-mode`
**Depends on:** PR #22 merged

**Description:**
One-tap mode that adapts today's routine immediately when the user's day is different. Three types: work trip, vacation (minimal or paused), different location. Routine regenerates for remainder of day. Medicine tasks always preserved regardless of travel type.

**Schema update — `routines` collection:**
```js
travelMode: {
  active: Boolean,
  type: enum['work_trip','vacation','different_location'],
  destination: String,
  destinationTimezone: String,
  vacationMode: enum['minimal','paused'],
  activatedAt: Date
}
```

**New files to create:**
- `apps/web/src/features/travel/TravelModeSheet.tsx`
- `apps/web/src/features/travel/TravelModeBanner.tsx`

**Backend AC:**
- [ ] `travelMode` fields added to Routine Mongoose schema
- [ ] `POST /api/routine/:routineId/travel-mode`
  - Body: `{ type, destination?, destinationTimezone?, vacationMode? }`
  - Sets `routine.travelMode` fields
  - Regenerates tasks from `now` onwards only — past completed tasks preserved
  - AI prompt injection by type:
    - `work_trip`: *"User travelling for work. No home commute tasks. Hotel-friendly exercise only (room workout, walk, hotel gym). Increase hydration reminders. User may be in [destination] timezone."*
    - `vacation_minimal`: *"User on vacation. Include medicines at normal times and one personal enjoyment task only. All other tasks silent."*
    - `vacation_paused`: *"User on vacation. Include medicines at normal times only. No other tasks."*
    - `different_location`: *"User working from different location. No commute tasks. Normal routine otherwise."*
  - `fixMedicineTasks()` post-processor re-adds medicine tasks after AI generation — medicine tasks cannot be removed by travel mode
  - Returns updated routine
- [ ] `DELETE /api/routine/:routineId/travel-mode`
  - Clears `travelMode` fields
  - Regenerates routine for remainder of day without travel context
- [ ] **Jet lag detection**: if `destinationTimezone` differs from `users.profile.shiftTimezone` by ≥ 3 hours → next day's routine generation receives *"user may be jet lagged — lighter, more restorative routine"* instruction
- [ ] **Morning check-in travel detection**: if `anythingDifferentToday` text contains travel intent (AI classification in check-in response) → return `{ suggestTravelMode: true, detectedType: string | null }` alongside normal check-in response
- [ ] `TRAVEL_MODE_TYPES` and `VACATION_MODES` constants added to `apps/api/src/constants/index.ts`
- [ ] Swagger updated

**Frontend AC:**
- [ ] **`<TravelModeSheet />`** — rendered as a popover on desktop (anchored to trigger button, 300px wide, click outside to dismiss) and a bottom-sheet on mobile (< 768px, slides up, swipe down to dismiss)
  - 4 tappable option cards: ✈️ Work trip / 🏖️ Vacation / 🗺️ Different location / ✕ Not today
  - **Work trip sub-flow**: optional destination text input → timezone auto-detect chip (confirm or change)
  - **Vacation sub-flow**: two option cards — 🌿 Light (medicines + one task) / 🔕 Quiet (medicines only)
  - **Different location sub-flow**: one-time travel estimate using existing travel API, editable result shown
  - Confirm → `POST /api/routine/:id/travel-mode` → sheet closes → routine refreshes via React Query invalidation
- [ ] **`<TravelModeBanner />`** — shown at top of `TodayPanel` when `routine.travelMode.active === true`
  - Desktop: full-width bar — icon + type label + destination if set + *"End mode"* link on right
  - Mobile: compact pill below day header — type + destination + × to end
  - Background: soft sky blue (light mode) / stone-700 (dark mode)
  - *"End mode"* → confirmation: *"Back to your normal routine for the rest of today?"* — Yes / Not yet
- [ ] *"Travelling today?"* button added to `TodayPanel` header area — discreet text-button, not prominent; not shown if travel mode already active
- [ ] Morning check-in: if response contains `suggestTravelMode: true` → extra card shown after final check-in card with travel mode options embedded as answer chips
- [ ] `dark:` Tailwind variants on all new components
- [ ] CI passes

---

### PR #24 — `feat/partner-sync` 🔲

**Branch:** `feat/partner-sync`
**Depends on:** PR #23 merged

**Description:**
Partner routine sync for married users only. Connection via email invite with dual consent. Shares only free time windows and completion % — never task names, categories, reasons, medical data, or calendar events. Couple streak calculated nightly. Relationships nav item appears in SideNav for married users (additive — Groups remains always visible).

**Schema updates:**
```js
// users collection — add:
partnerSync: {
  partnerId: ObjectId,
  partnerEmail: String,
  partnerName: String,
  status: enum['none','pending_sent','pending_received','active','disconnected'],
  initiatedAt: Date,
  connectedAt: Date,
  bothConsented: Boolean,
  coupleStreak: {
    current: Number,
    personalBest: Number,
    lastStreakDate: String,
    totalDaysCompleted: Number,
    milestonesSeen: [Number]
  },
  sharingPreference: {
    showFreeWindows: Boolean,         // default true
    showCompletionPercent: Boolean    // default true
  }
}
```

**New collection — `partnerinvites`:**
```js
{
  _id, fromUserId, fromUserName, fromUserEmail,
  toEmail, toUserId,
  status: enum['pending','accepted','declined','expired'],
  expiresAt: Date,   // 7 days
  sentAt, respondedAt
}
```

**New files to create:**
- `apps/web/src/features/relationships/RelationshipsPage.tsx`
- `apps/web/src/features/relationships/components/PartnerWidget.tsx`
- `apps/web/src/features/relationships/components/PartnerSetup.tsx`
- `apps/web/src/features/relationships/components/PartnerInviteFlow.tsx`
- `apps/api/src/features/partner/partner.routes.ts`
- `apps/api/src/features/partner/partner.service.ts`
- `apps/api/src/features/partner/partner.controller.ts`
- `apps/api/src/features/partner/partnerInvite.model.ts`
- `apps/api/src/middleware/requireMarried.ts`

**Backend AC:**
- [ ] `partnerSync` fields added to User Mongoose schema
- [ ] `partnerinvites` Mongoose schema and model created
- [ ] `requireMarried` middleware: checks `req.user.profile.personal.relationshipStatus === 'married'`; returns `403 { error: 'partner_sync_unavailable' }` if not; applied to all partner endpoints
- [ ] `POST /api/partner/invite` — body: `{ toEmail }`; validates not own email; creates `partnerinvites` doc; sends in-app notification if existing user; sends invite email if not; sets `partnerSync.status: 'pending_sent'` on sender
- [ ] `POST /api/partner/invite/:inviteId/accept` — two-step consent:
  - First call (receiver): marks receiver consent, not yet active
  - Sender receives push notification to also confirm
  - Second call (sender): `bothConsented: true` → activates `partnerSync.status: 'active'` on both users atomically
  - Both get push: *"You and [Name] are now connected on WellPath 💑"*
- [ ] `POST /api/partner/invite/:inviteId/decline` — marks declined; clears `partnerSync` on both; no notification to inviting user
- [ ] `DELETE /api/partner/disconnect` — clears `partnerSync` on both users atomically; silent
- [ ] `GET /api/partner/status`
  - Requires `partnerSync.status === 'active'`
  - Calculates free windows from partner's today routine: gaps ≥ 20 min between tasks/meetings
  - Returns **only**: `{ partnerName, partnerThumbnailUrl, completionPercent, freeWindows: [{ approximateTime, durationMinutes }], overlappingWindows, coupleStreak }`
  - **Task names, categories, reasons NEVER in response** — enforced at query level, not UI level
  - If partner has no routine today → `{ hasRoutineToday: false }`
  - Sharing preferences respected: if `showFreeWindows: false` → `freeWindows: []`; if `showCompletionPercent: false` → `completionPercent: null`
- [ ] `PATCH /api/partner/sharing` — update own sharing preferences
- [ ] **Couple streak** added to nightly streak cron: if both partners' `completionPercentage >= 60` on same date → increment `coupleStreak.current`; milestones at 7, 14, 30 days → push to both
- [ ] `PARTNER_INVITE_EXPIRY_DAYS = 7`, `PARTNER_FREE_WINDOW_MIN_MINUTES = 20`, `PARTNER_OVERLAP_MIN_MINUTES = 20` added to `apps/api/src/constants/index.ts`
- [ ] Swagger updated

**Frontend AC:**

**SideNav update (Groups always shown, Relationships additive):**
- [ ] `<SideNav />` reads `user.profile.personal.relationshipStatus` from auth store
- [ ] Groups `<SideNavItem />` always rendered — no condition
- [ ] Relationships `<SideNavItem />` conditionally rendered after Groups, only when `relationshipStatus === 'married'`
  ```tsx
  <SideNavItem icon={UsersIcon} label="Groups" to={ROUTES.GROUPS} />
  {isMarried && (
    <SideNavItem icon={HeartIcon} label="Relationships" to={ROUTES.RELATIONSHIPS} />
  )}
  ```
- [ ] `ROUTES.RELATIONSHIPS = '/relationships'` added to `apps/web/src/constants/index.ts`

**RelationshipsPage:**
- [ ] `<RelationshipsPage />` at `/relationships` — only accessible to married users; non-married direct URL access → redirect to `/groups`
- [ ] Sub-tab bar: *"Partner ♥"* | *"Groups"* — sage green underline on active
- [ ] Partner tab → `<PartnerWidget />` or `<PartnerSetup />` based on `partnerSync.status`
- [ ] Groups tab → existing `<GroupsPanel />` component — zero changes to Groups

**PartnerSetup & invite:**
- [ ] `<PartnerSetup />` — centred card, *"Connect with your partner to see when you're both free"*, sub-text about what is and is not shared, *"Connect Partner"* button
- [ ] `<PartnerInviteFlow />` — email input step → sent confirmation; incoming invite shows consent screen → Accept / Not now

**PartnerWidget:**
- [ ] Partner `<Avatar />` + name
- [ ] Completion bar (if `showCompletionPercent` not hidden by partner)
- [ ] Free windows list: *"Free around: 6:30pm (~45 min)"*
- [ ] Overlapping window: sage green background row, 💑, *"You both have time at 6:30pm"* — only when overlap ≥ 20 min
- [ ] If `hasRoutineToday: false` → *"[Name] hasn't started their day yet"*
- [ ] Couple streak: 💑 + count + *"days together"* — shown inline at widget bottom
- [ ] *"Update what I share"* → inline dropdown/sheet with two toggles
- [ ] Auto-refreshes every 10 min (React Query `refetchInterval`)
- [ ] Desktop: max-width 600px centred; tablet + mobile: full width card
- [ ] Couple streak also shown as 💑 + count in TopBar when `partnerSync.status === 'active'` AND `coupleStreak.current > 0` — sits next to 🔥 flame

**Settings — Relationships section (married users only):**
- [ ] Connected: partner name + avatar + connected date + Disconnect button
- [ ] Sharing preferences: two toggles (free windows, completion %)
- [ ] Disconnect confirmation: *"Disconnecting means [Name] will no longer see your free windows. Your individual data is unaffected."*
- [ ] Not connected: *"Connect Partner"* button

- [ ] `dark:` Tailwind variants on all new components
- [ ] CI passes

---

## 24. PR Specifications — Mobile

Mobile PRs (#M1–#M10) follow after all web PRs are merged. Full specs for each mobile PR are documented in the planning conversation. Key rules for Claude Code:

1. **Read Section 21 fully** before starting any mobile PR — framework decisions, navigation model, Groups rule, iOS optimisation spec are all there
2. **Every feature folder gets `constants/<feature>.constants.ts`** — see Section 7 for the pattern and required exports per screen
3. **Groups tab is always shown** — Relationships is via More sheet for married users, never a replacement
4. **`expo-image` everywhere** — not RN `Image`
5. **`<SafeScrollView />`** on every scrollable screen
6. **`requireAuth` middleware pattern already exists** — mobile just sends the JWT from SecureStore instead of cookie

### Mobile PR Order

| PR | Branch | Depends On |
|---|---|---|
| #M1 | `feat/mobile-scaffold` | All web PRs merged |
| #M2 | `feat/mobile-auth` | #M1 |
| #M3 | `feat/mobile-shell` | #M2 |
| #M4 | `feat/mobile-onboarding` | #M3 |
| #M5 | `feat/mobile-dashboard` | #M4 |
| #M6 | `feat/mobile-notifications` | #M5 |
| #M7 | `feat/mobile-groups` | #M5 |
| #M8 | `feat/mobile-streak-insights` | #M5 |
| #M9 | `feat/mobile-travel-settings` | #M7 |
| #M10 | `feat/mobile-offline-polish` | #M8, #M9 |

For detailed ACs on each mobile PR, ask the planning assistant to generate the full mobile PR spec document.

---

*End of PLANNING.md*
*This file is local only. Never commit to repository.*