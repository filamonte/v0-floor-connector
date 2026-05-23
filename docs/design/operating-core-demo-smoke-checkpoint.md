# Operating Core Demo Smoke Checkpoint

Status: Active
Doc Type: QA

## Purpose

This checkpoint records the demo-readiness smoke pass for the current
operating core after global search was hardened. The pass used saved local auth
state, authenticated index-page discovery, and real linked records where
available. It did not add product capability.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/product-language.md`
- `docs/design/global-search-hardening.md`
- `docs/design/operating-core-runtime-qa-checkpoint.md`

## Commands And Tests Run

- `git status --short --branch`
- `git log --oneline -10`
- `git push origin main`
- `git status --short --branch`
- `git log --oneline -5`
- Route-discovery Playwright smoke against `http://localhost:3000` with saved
  contractor, portal, and platform-admin auth states.
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test ...` focused
  operating-core helper suite, including global search helpers.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000`
  `PLAYWRIGHT_SKIP_WEB_SERVER=1 pnpm.cmd exec playwright test
e2e/project-detail-ui.spec.js e2e/detail-workspace-ui.spec.js
e2e/estimate-document-pdf-delivery.spec.js --project=chromium-protected
--no-deps`

## Routes Checked

The smoke pass checked these contractor routes directly:

- `/dashboard`
- `/projects`
- discovered `/projects/[projectId]`
- `/schedule`
- `/daily-logs`
- discovered `/daily-logs/[dailyLogId]`
- `/jobs`
- discovered `/jobs/[jobId]`
- `/communications`
- `/service-tickets`
- `/estimates`
- discovered `/estimates/[estimateId]`
- discovered `/estimates/[estimateId]/pdf`
- `/contracts`
- discovered `/contracts/[contractId]`
- discovered `/contracts/[contractId]/pdf`
- `/invoices`
- discovered `/invoices/[invoiceId]`
- discovered `/invoices/[invoiceId]/pdf`
- discovered `/projects/[projectId]/closeout-package/pdf`
- `/reports`
- `/financials`
- `/financials/accounts-receivable`
- `/financials/accounting-readiness`
- `/payments`
- `/settings`

The pass checked these portal routes:

- `/portal`
- discovered `/portal/projects/[projectId]`
- discovered portal estimate print/save PDF routes visible from the portal
  project workspace.

The pass also checked mobile-sized viewports for:

- discovered `/projects/[projectId]`
- `/schedule`
- `/daily-logs`
- `/portal/projects/[projectId]`
- `/financials/accounting-readiness`

Global search was checked through the authenticated API with:

- `project`
- `invoice`
- `estimate`
- `contract`
- `scheduled`
- `sent`
- `paid`
- `in progress`
- `zzzz-no-result-smoke`

## Routes Skipped Or Blocked

- `/super-admin` redirected to `/login?next=%2Fsuper-admin` with the saved
  platform-admin auth state. This was recorded as unavailable local
  platform-admin auth, not as a verified super-admin route pass.
- No service-ticket detail link was discovered from `/service-tickets` during
  this smoke run.

## Issues Found

- The combined protected Playwright run exposed a QA harness issue in
  `detail-workspace-ui.spec.js`: the mobile viewport test switched to a
  phone-sized viewport before running index-page detail discovery. That made
  the test depend on mobile list-page link exposure even though the test's
  intent is to verify mobile detail workspaces.
- Protected route discovery also found that some authenticated index-page
  detail candidates can redirect to `/login` while later candidates load
  correctly. Discovery now treats those candidate-level redirects the same way
  it treats unavailable records, while still failing fast if the index page
  itself redirects to login.
- `docs/operating-core-validation-checklist.md` listed filtered helper test
  commands with root-relative `apps/web/lib/...` paths. With
  `--filter @floorconnector/web`, the package-relative `lib/...` paths are the
  copy-safe command shape.

## Fixes Made

- Updated the mobile viewport Playwright test to discover current valid detail
  routes before switching to the mobile viewport.
- Updated the protected route discovery helper to continue past
  login-redirected candidate detail links after the authenticated index page
  has loaded.
- Updated the operating-core validation checklist helper commands to use
  package-relative paths.
- Added this checkpoint and linked it from the docs index and handoff.

## Remaining Follow-Ups

- Refresh or repair the local platform-admin auth state before treating
  `/super-admin` as browser-verified.
- Add or expose a service-ticket detail route smoke only when the index page
  provides a valid detail link for the active organization.
- Keep using index-page discovery for protected detail QA instead of fixed
  record IDs.

## Behavior Preserved

This pass did not change schema, migrations, routes, server actions, auth/RLS,
tenant logic, payment behavior, signature behavior, estimate math, invoice
math, portal grants, settings logic, platform-admin logic, provider
integrations, AI, automation, notifications, accounting sync, storage, or fake
data.
