# .github

## Purpose
GitHub Actions CI/CD workflows and configuration for all WellPath apps.

## Patterns & Rules
- One workflow per app (`web-ci.yml`, `api-ci.yml`, `mobile-ci.yml`) — only triggers on path changes for that app
- `sonar.yml` runs on every PR and every push to main or feature branches
- **PR naming convention** (enforced by team, not by automation):
  - `feat/mobile-<feature>` — mobile feature PRs
  - `feat/<feature>` — web/API feature PRs
  - `fix/<description>` — bug fix PRs
  - PR title must include the PR number and the order: e.g. `[PR #21] feat/compassionate-streak`
- PRs must be merged in spec order — each PR's base branch is the previous PR's branch (or main after merge)
- `SONAR_TOKEN` must be set as a repository secret in GitHub → Settings → Secrets → Actions
- `sonar.organization` value in `sonar-project.properties` must match the SonarCloud org slug

## Contents
| File/Folder | Purpose |
|---|---|
| `workflows/web-ci.yml` | Lint + type check + build for apps/web on every PR |
| `workflows/api-ci.yml` | Lint + type check + build for apps/api on every PR |
| `workflows/mobile-ci.yml` | Type check + expo export for apps/mobile on every PR |
| `workflows/sonar.yml` | SonarCloud static analysis — runs on all PRs and main pushes |

## SonarCloud Setup (one-time, manual)
1. Go to https://sonarcloud.io → sign in with GitHub
2. Create new project → select the wellpath repo → use automatic analysis OFF (we use GitHub Action)
3. Copy the `SONAR_TOKEN` → add to GitHub repo secrets as `SONAR_TOKEN`
4. Update `sonar.organization` in `sonar-project.properties` to match your SonarCloud org slug
5. Update `sonar.projectKey` in `sonar-project.properties` if different from `wellpath`

## Changelog
| Date | PR | What was added | Author |
|---|---|---|---|
| 2026-05-19 | feat/mobile-scaffold | web-ci.yml, api-ci.yml, mobile-ci.yml | Claude |
| 2026-05-19 | setup | sonar.yml, sonar-project.properties — SonarCloud analysis on all PRs | Claude |
