# Visual QA Route Smoke V1 Review Packet

Status: Implementation stream
Date: 2026-06-10
Branch: `stream/visual-qa-route-smoke-v1`
Worktree: `C:\FC-worktrees\visual-qa-route-smoke-v1`

## Purpose

Make local authenticated visual QA reliable enough for future UX Beta Readiness
streams to capture route screenshots and validate responsive UI without
mistaking redirects or the generic app error page for successful route renders.

This stream is test/tooling focused. It does not redesign pages, change product
behavior, change auth behavior, change schema, mutate Supabase data, or create
new canonical records.

## Dependency Confirmation

PR #26, `feat: polish mobile field beta surfaces`, is merged into `main` at
merge commit `e34dc556c98368049c767cde8fac6bc05386cf16`.

## Ownership Area

- Local visual QA route smoke reliability
- Authenticated Playwright storage-state diagnostics
- Screenshot-ready protected route validation for UX Beta Readiness surfaces

No other active stream owns this responsibility. This stream depends on the UX
Beta Readiness wave and the merged mobile field beta pass.

## Scope Implemented

- Added `e2e/authenticated-route-smoke.spec.js`.
- Added the smoke to the existing `chromium-protected` Playwright project so it
  uses the existing `setup` dependency and real contractor auth flow.
- The smoke validates `/dashboard`, `/daily-logs`, `/field/work-items`,
  `/schedule`, and `/leads` at desktop and mobile widths.
- The smoke fails when a protected route redirects to `/login`.
- The smoke fails when the generic app error boundary text appears.
- The smoke checks route-specific protected headings, page-level horizontal
  overflow, console errors, page errors, and failed requests.
- The smoke captures screenshots as ignored Playwright test artifacts.

## Reproduction

Local Next was started at `http://127.0.0.1:3106`.

Using the existing `playwright/.auth/local-user.json` before refresh:

- `/dashboard`: HTTP 200, redirected to `/login`, first `h1` = `Welcome back`
- `/daily-logs`: HTTP 200, redirected to `/login`, first `h1` = `Welcome back`
- `/field/work-items`: HTTP 200, redirected to `/login`, first `h1` =
  `Welcome back`
- `/schedule`: HTTP 200, redirected to `/login`, first `h1` = `Welcome back`
- `/leads`: HTTP 200, redirected to `/login`, first `h1` = `Welcome back`

The stored auth state was stale or origin-mismatched for the active smoke
origin. It had one Supabase auth cookie and no storage origins.

After one controlled auth refresh against the same origin:

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://127.0.0.1:3106"
$env:PLAYWRIGHT_SKIP_WEB_SERVER = "1"
pnpm.cmd e2e:auth
```

All target routes rendered real protected content at desktop and mobile widths:

| Route               | Desktop `h1`                          | Mobile `h1`                           | Result   |
| ------------------- | ------------------------------------- | ------------------------------------- | -------- |
| `/dashboard`        | Dashboard                             | Dashboard                             | Rendered |
| `/daily-logs`       | Project-day field logs for jfilamonte | Project-day field logs for jfilamonte | Rendered |
| `/field/work-items` | My Work Items                         | My Work Items                         | Rendered |
| `/schedule`         | CrewBoard                             | CrewBoard                             | Rendered |
| `/leads`            | Lead manager for jfilamonte           | Lead manager for jfilamonte           | Rendered |

No app error page, login redirect, console error, page error, failed request, or
page-level horizontal overflow was observed after auth refresh.

## Root Cause

The immediate blocker was stale or origin-mismatched Playwright contractor
storage state. The earlier browser smoke accepted HTTP 200 and captured the
wrong surface. HTTP 200 alone is not sufficient because both login redirects and
app error boundary renders can still return 200.

No route loader exception, recent UI import/runtime error, missing local env
variable, missing organization membership, or local Supabase connectivity issue
was reproduced after storage state was refreshed against the same
`PLAYWRIGHT_BASE_URL`.

## Screenshot Evidence

Diagnostic screenshots and reports from this stream were saved under the
ignored local artifact directory:

```text
tmp-visual-qa-route-smoke-v1/
```

Representative refreshed screenshots:

- `tmp-visual-qa-route-smoke-v1/desktop-dashboard-refreshed.png`
- `tmp-visual-qa-route-smoke-v1/mobile-schedule-refreshed.png`
- `tmp-visual-qa-route-smoke-v1/mobile-daily-logs-refreshed.png`
- `tmp-visual-qa-route-smoke-v1/mobile-field-work-items-refreshed.png`

These screenshots are not committed because they are temporary diagnostic
artifacts. The focused Playwright smoke writes review screenshots into
Playwright's test output directory when it runs.

## Tool Usage

- GitHub CLI: confirmed PR #26 merged into `main`.
- Repo docs: source of truth for UX wave, auth QA, design system, and active
  stream governance.
- Playwright: reproduced stale auth behavior, refreshed local contractor auth,
  and verified protected routes at desktop and mobile widths.
- Browser/Figma/Stitch/Notion/Linear/Supabase/Stripe/OpenAI/B12/Assessment
  Generator: not used for implementation. Supabase was not mutated.

## Anti-Silo / Safety Check

This stream does not introduce:

- schema changes
- migrations
- Supabase data changes
- auth or RLS weakening
- fake persistence
- hardcoded runtime tenant or user IDs
- duplicate records or queues
- dashboard/workspace redesign
- customer self-service
- AI or AIA

## Validation Plan

Required:

```powershell
pnpm.cmd exec playwright test e2e/authenticated-route-smoke.spec.js --project=chromium-protected
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

## Validation Results

- `pnpm.cmd exec playwright test e2e/authenticated-route-smoke.spec.js --project=chromium-protected`:
  passed, 11 tests.
- `pnpm.cmd --filter @floorconnector/web typecheck`: passed.
- `pnpm.cmd --filter @floorconnector/web lint`: passed.
- `pnpm.cmd fc:preflight:fast`: passed after removing temporary diagnostic JSON
  reports from the changed-file set.
- `git diff --check`: passed.
- `git diff --cached --check`: passed.
- `pnpm.cmd worktree:doctor`: passed with expected no-upstream warning for the
  new stream branch.

## Review Notes

- Review should verify the smoke rejects login redirects and generic app error
  pages, not just HTTP status.
- The smoke intentionally uses the existing auth setup dependency; it does not
  add a bypass or fake auth path.
- Future UX streams should refresh auth against the same `PLAYWRIGHT_BASE_URL`
  before accepting screenshots as visual evidence.
