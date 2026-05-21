# features/user

## Purpose
User schema and profile management. The most complex model in the system — nested subdocuments for commute, health, diet, sleep, exercise, focus, personal life, business owner profile, calendar connections, and more.

## Layer files
| File | Role |
|---|---|
| user.model.ts | Mongoose User schema + IUser interface |
| user.types.ts | ProfilePhotoResponse DTO |
| user.repository.ts | findById, setProfilePhoto, clearProfilePhoto |
| user.service.ts | uploadProfilePhoto (validate → destroy old → upload full + thumb → save), deleteProfilePhoto |
| user.controller.ts | POST /profile-photo, DELETE /profile-photo |
| user.routes.ts | Router — multer memory storage, requireAuth |

## Key rules
- Medical data fields (`health`, `medicines`) are never sent to AI or included in embeddings
- Cloudinary configured lazily in `src/lib/cloudinary.ts` — fails at upload time if env vars missing
- File validated (format + size) BEFORE calling Cloudinary
- Old photo deleted from Cloudinary before uploading new one (non-blocking failure)
- Two uploads per call: `_full` (400x400 face gravity) and `_thumb` (100x100 face gravity)
- `$unset: { profilePhoto: 1 }` used for clean removal
- Multer memory storage — never writes to disk

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/database-setup | Full User schema with all subdocuments |
| 2026-05-16 | feat/profile-photo | user.types.ts, user.repository.ts, user.service.ts, user.controller.ts, user.routes.ts |
| 2026-05-21 | feat/compassionate-streak | user.model.ts: `streak` subdocument added (current, personalBest, lastStreakDate, graceDays, milestonesSeen) |
