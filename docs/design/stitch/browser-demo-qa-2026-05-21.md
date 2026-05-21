# Google Stitch UI Adoption - Browser Demo QA

Status: Active
Doc Type: Design QA

## 1. Commit Under QA

- `3a949ee5 feat: apply Stitch-informed Graphite Copper visual system`

## 2. Environment / Local URL Used

- Local URL: `http://localhost:3001`
- Dev server command: `pnpm.cmd --filter @floorconnector/web dev -p 3001`
- Browser runner: local Playwright/Chromium through the repo-installed Playwright package
- Auth states used:
  - contractor: `playwright/.auth/local-user.json`
  - platform admin: `playwright/.auth/platform-admin.json`
  - portal customer: `playwright/.auth/portal-user.json`
- Screenshot/result artifacts were generated locally under `C:\FloorConnector\tmp-stitch-browser-qa-2026-05-21-rerun` during the QA run. They are local evidence only and should not be committed unless a later review explicitly asks for image artifacts.

## 3. Commands Run

- `git status --short --branch`
- `git log --oneline -5`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/web dev -p 3001`
- `pnpm.cmd e2e:auth`
- Read-only Playwright browser smoke against `http://localhost:3001`

Notes:

- Typecheck and lint initially hit sandbox `EPERM` errors when reading local `node_modules` binaries, then passed outside the sandbox.
- The first browser smoke found the contractor storage state stale and redirected protected routes to `/login`; `pnpm.cmd e2e:auth` refreshed the local contractor auth state, and the rerun passed.
- No mutating UI actions were clicked. Checkout, send, approve, reject, sign, payment, activation, and destructive controls were not invoked.

## 4. Routes Checked

Contractor app:

- `/dashboard`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- `/estimates/d7dd5dff-8d79-46a1-9e4e-ef563b7d3943`
- `/contracts/261df341-32a9-435c-91cf-e7c94bb77e38`
- `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`
- `/jobs/b041ca99-19c6-4a58-aff4-39d0dbdcfed9`
- `/daily-logs/a175b37f-2734-434b-b64f-c10671dff90d`
- `/settings`
- `/super-admin`

Portal:

- `/portal`
- `/portal/projects/db77b765-4d6e-47d4-8c38-e91c041868f1`
- `/portal/contracts/045c379c-132b-4a96-a8f0-8ed9a0d33a6c`
- `/portal/invoices/12be9e05-2171-428e-a280-8fe6aeb9e035`

## 5. Screens / Routes Passed

All checked routes passed the browser smoke:

- HTTP status under 500
- no redirect to `/login` after contractor auth refresh
- no page runtime errors
- no relevant console errors
- no obvious hydration/import/component crash
- no page-level horizontal overflow at desktop width
- no page-level horizontal overflow at the checked narrow width for command-band/card-heavy routes
- no visible Stitch artifact terms such as `industrial_contrast`, `project_management`, `estimate_details`, or `platform_administration`

The checked routes showed the expected Graphite/Copper visual family across contractor, portal, and platform surfaces while preserving portal-safe and super-admin-specific tone.

## 6. Screens / Routes Skipped And Why

No requested QA route was skipped after the contractor auth refresh and rerun.

The exact record ids came from existing local manager/portal links and fixture-backed routes. No new fake records were created for this QA pass.

## 7. Issues Found

- Initial protected route smoke redirected `/dashboard`, `/projects`, and `/settings` to `/login` because the local contractor Playwright auth state was stale.
- No Stitch visual adoption runtime, import, responsive-overflow, or visible fake-data blocker was found after auth refresh.

## 8. Fixes Made

- Refreshed only the local Playwright contractor auth state with `pnpm.cmd e2e:auth`.
- No app code was changed.
- No schema, migrations, RLS, Supabase logic, route protection, auth behavior, server actions, payment logic, signature logic, estimate math, invoice math, job readiness gates, portal grants, settings logic, platform-admin logic, or canonical workflow relationships were changed.

## 9. Final Recommendation

Ready to push after committing this docs-only browser QA record and the compact handoff note.

Recommended next operational step:

`git push origin main`
