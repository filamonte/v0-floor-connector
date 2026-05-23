# Operating Core Runtime QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## Purpose

This checkpoint records a focused operating-core runtime QA and low-risk bug
fix pass after the recent Command Center, CrewBoard, FieldTrail,
MessageCenter, ProjectPulse, CloseoutTrail, Proof Center, Send Trail,
Document Engine, portal Customer Window, Service Center, Reports, Financial
Control, Accounting Readiness, Accounting Export Prep, and demo-path work.

This was not a feature build. The pass focused on stale E2E fixtures, obvious
runtime warnings, route-smoke blockers, helper validation, and honest local
auth limitations.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/operating-core-validation-checklist.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/local-auth-qa-recovery.md`
- `docs/product-language.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/accounting-export-prep-phase-1-qa-checkpoint.md`
- `docs/design/portal-maturity-phase-4-qa-customer-window.md`
- `docs/design/document-engine-qa-checkpoint.md`

## Commands Run

- `git status --short --branch`
- `git log --oneline -10`
- `git push origin main`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `git diff --check`
- `pnpm.cmd exec prettier --write apps/web/components/manager-dashboard-card.tsx e2e/protected-route-utils.js e2e/estimate-document-pdf-delivery.spec.js e2e/detail-workspace-ui.spec.js`
- `pnpm.cmd exec prettier --check e2e/protected-route-utils.js e2e/estimate-document-pdf-delivery.spec.js e2e/detail-workspace-ui.spec.js`
- `pnpm.cmd exec playwright test e2e/project-detail-ui.spec.js e2e/estimate-document-pdf-delivery.spec.js e2e/detail-workspace-ui.spec.js --project=chromium-protected --no-deps`

## Focused Tests Run

The focused helper suite from `docs/operating-core-validation-checklist.md`
passed in one package-relative `tsx --test` run:

- schedule warnings
- daily-log links
- FieldTrail summary
- MessageCenter summary
- ProjectPulse summary
- CloseoutTrail summary
- Proof Center summary
- Send Trail summary
- Service Center summary
- portal Customer Next Step
- portal Project Status Window
- portal Project Timeline
- portal Shared Documents
- Reports operations summary
- Financial Control collections summary
- Accounting Readiness
- Accounting Export
- Document Engine print helpers

Result: 98 tests passed, 0 failed.

## Browser Routes Checked Or Skipped

The protected Playwright lane reused existing local auth state and did not run
the setup project. `/dashboard` loaded and passed the authenticated dashboard
smoke.

The golden manager route spine reached the authenticated app and exposed a real
React duplicate-key warning on `/invoices`. The warning was fixed during this
pass. The same run then surfaced the known local Supabase Auth rate limit:

```text
AuthApiError: Request rate limit reached
code: over_request_rate_limit
```

Because the auth cooldown was active, the remaining protected browser route QA
was treated as blocked rather than passed. No repeated auth setup was run.

Routes not counted as fully verified in this pass because of the local auth
rate limit:

- `/projects`
- discovered `/projects/[projectId]`
- `/schedule`
- `/daily-logs`
- `/service-tickets`
- `/reports`
- `/financials`
- `/financials/accounting-readiness`
- `/portal`
- discovered `/portal/projects/[projectId]`
- portal contract review local 500 follow-up
- portal invoice review local 500 follow-up

## Issues Found

- Local `main` was ahead of `origin/main`; the push completed successfully.
- `e2e/estimate-document-pdf-delivery.spec.js` and
  `e2e/detail-workspace-ui.spec.js` still used stale fixed fallback IDs for
  protected detail/document route smoke tests.
- `/invoices` emitted a React duplicate-key warning through
  `ManagerDashboardCard` when invoice queue rows shared the same href and
  title.
- Local protected browser QA hit Supabase Auth rate limiting during the
  protected E2E run.

## Fixes Made

- `e2e/protected-route-utils.js` now exposes `resolveLinkedDetailPaths` so
  protected E2E specs can discover valid detail links from authenticated index
  pages.
- `e2e/estimate-document-pdf-delivery.spec.js` now discovers estimate,
  contract, and invoice detail paths from their manager pages unless explicit
  `FLOORCONNECTOR_E2E_*_DETAIL_PATH` overrides are provided.
- `e2e/detail-workspace-ui.spec.js` now uses authenticated detail discovery for
  project, estimate, invoice, job, and contract workspace smokes instead of
  stale hardcoded local fixture IDs.
- `apps/web/components/manager-dashboard-card.tsx` now includes the item index
  in the repeated item key, preventing duplicate-key warnings when legitimate
  duplicate queue rows share the same destination and title.

## Issues Deferred

- Re-run the protected browser route matrix after Supabase Auth cooldown and
  storage-state refresh.
- Reproduce the previously noted portal contract review and portal invoice
  review local 500s only after portal auth state is healthy.
- Investigate any remaining fixed protected-route fixture paths outside the
  two E2E specs touched in this pass when those lanes are next run.

## Behavior Preserved

This pass did not change schema, migrations, routes, server actions, auth/RLS,
tenant logic, portal grants, payment/signature/provider behavior, estimate
math, invoice math, settings behavior, platform-admin behavior, AI,
automation, notifications, accounting sync, storage, or production data.

The E2E changes are test-harness stability only. The UI fix only changes React
list identity for repeated manager-card links.

## Follow-Up Recommendations

- Let Supabase Auth cooldown before running `pnpm e2e:auth` or protected
  browser QA again.
- Use a single `PLAYWRIGHT_BASE_URL` for auth refresh and protected route
  checks.
- Prefer index-page link discovery over fixed detail IDs for future protected
  route smoke tests.
- Keep portal 500 investigation separate from portal permission or grant
  changes unless server logs identify a small null/fallback/UI read bug.
