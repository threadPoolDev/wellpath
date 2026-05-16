# WellPath

> Your routine should fit your day — not the other way around.

WellPath helps busy people build flexible, adaptive daily routines by understanding their life context and adjusting every single day based on what is actually happening.

---

## Monorepo Structure

```
wellpath/
├── apps/
│   ├── web/     # React + TypeScript frontend
│   └── api/     # Node.js + Express backend
├── .github/
│   └── workflows/
└── README.md
```

---

## Setup

### Prerequisites

- Node.js 22 LTS or higher
- npm 10 or higher
- MongoDB (local or Atlas)
- Redis (for BullMQ)

### Install

Each app is independent. Install from within each app directory:

```bash
# Frontend
cd apps/web
npm install

# Backend
cd apps/api
npm install
```

### Environment Variables

Copy `.env.example` to `.env` in each app and fill in the required values:

```bash
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
```

### Development

```bash
# Frontend (http://localhost:5173)
cd apps/web
npm run dev

# Backend (http://localhost:5000)
cd apps/api
npm run dev
```

---

## CI

GitHub Actions runs on every PR:

- ESLint
- TypeScript type check
- Build check

No test runners are configured.

---

## PR Conventions

- One PR at a time. Build → review → merge → next.
- Branch naming: `feat/<feature-name>`
- All enums in `constants/index.ts` — never hardcoded inline
- ENV variables consumed via `.env` — no raw strings in code

---

## Notes

- `CLAUDE.md` files exist in every folder locally for development context. They are **never committed** (listed in `.gitignore`).
- `PLANNING.md` is local only and never committed.
