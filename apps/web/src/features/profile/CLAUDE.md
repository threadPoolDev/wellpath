# features/profile (web)

## Purpose
Profile photo upload and management. Avatar component lives in `src/components/` (shared).

## Files
| File | Role |
|---|---|
| api.ts | profileApi — uploadPhoto (multipart POST), deletePhoto (DELETE) |
| components/PhotoUpload.tsx | Upload area + circular preview + remove-confirm modal |

## Key rules
- Upload is multipart/form-data with field name `photo`
- Remove confirmation copy: "Remove your photo? Your initials will show instead." — never alarming
- Error copy uses warm amber — never red
- `PhotoUpload` is used in Settings (PR #16) — not yet wired to a page in PR #5
- The `Avatar` component (in `src/components/`) is used everywhere: nav, group cards, profile, group page

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/profile-photo | api.ts, PhotoUpload.tsx |
