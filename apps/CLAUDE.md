# apps

## Purpose
Monorepo container for all WellPath applications. Each app is independently installable and runnable.

## Patterns & Rules
- Never add cross-app import dependencies
- Each app manages its own `package.json`, `tsconfig`, and tooling config
- Root `package.json` is for workspace definition only — no scripts

## Contents
| File/Folder | Purpose |
|---|---|
| web/ | React + TypeScript frontend |
| api/ | Node.js + Express backend |

## Changelog
| Date | PR | What was added |
|---|---|---|
| 2026-05-16 | feat/project-scaffold | Initial apps directory with web and api |
