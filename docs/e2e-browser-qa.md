# E2E Browser QA

Status:
- local Playwright browser QA setup for protected FloorConnector contractor flows
- test infrastructure only; no schema, workflow, auth, RLS, estimate calculation, invoice, or catalog behavior changes

## Purpose

Use this path when the in-app browser or coordinate-based automation cannot reliably click inside dense editor surfaces such as the Estimate Editoror. The current focused spec covers Phase B group-targeted catalog insertion in the Estimate Editoror.

## Setup

Install dependencies after pulling this change:

```bash
pnpm install
```

Install Playwright browsers if they are not already present:

```bash
pnpm exec playwright install chromium
```

Start or allow Playwright to reuse the local dev server:

```bash
pnpm dev
```

The Playwright config defaults to:

```text
PLAYWRIGHT_BASE_URL=http://localhost:3001
PLAYWRIGHT_STORAGE_STATE=playwright/.auth/local-user.json
```

The public `chromium-public` project also includes the marketing entry-point regression spec:

```bash
pnpm exec playwright test --project=chromium-public e2e/marketing-login.spec.js
```

That spec verifies the public homepage exposes `Log in -> /login` and preserves `Start early access -> /signup?next=/setup/company`.

## Auth Strategy

Protected contractor specs use the shared `chromium-protected` Playwright project. That project depends on the `setup` project, which logs in through the real local `/login` route and saves storage state before protected tests run.

Preferred local path:

1. Provide a real local contractor test account.
2. Do not hardcode credentials in the repo.
3. Do not bypass Supabase Auth, RLS, middleware, or organization membership checks.

Required local environment variables:

```text
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_E2E_PASSWORD
```

To create or refresh the saved auth state directly:

```bash
$env:FLOORCONNECTOR_E2E_EMAIL="contractor-test@example.com"
$env:FLOORCONNECTOR_E2E_PASSWORD="your-local-test-password"
pnpm e2e:auth
```

The generated file is:

```text
playwright/.auth/local-user.json
```

That file is local-only and should not be committed.

Running protected specs through `pnpm e2e` also runs the setup project first. If either credential variable is missing, auth setup fails with a clear environment-variable error instead of letting protected tests drift into `/login`.

If you already have a saved storage-state file, point Playwright to it:

```bash
$env:PLAYWRIGHT_STORAGE_STATE="C:\path\to\local-user.json"
```

## Super Admin Access Regression QA

The super-admin access spec uses two real authenticated states:
- contractor-only owner state from `FLOORCONNECTOR_E2E_EMAIL` / `FLOORCONNECTOR_E2E_PASSWORD`
- platform-admin state from `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` / `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`

The intended local platform operator is:

```text
platform@floorconnector.com
```

That account must be created through the normal Supabase Auth signup/login flow first so `public.users` exists. Then grant platform access explicitly:

```bash
pnpm platform-admin grant platform@floorconnector.com
pnpm platform-admin status platform@floorconnector.com
pnpm platform-admin status jfilamonte@gmail.com
```

The existing first-entry auth bootstrap can create a normal contractor owner membership for the platform account after login. That bootstrap membership is not required for `/super-admin`; the access check must still come from `platform_user_roles`.

Required local environment variables:

```text
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_E2E_PASSWORD
FLOORCONNECTOR_PLATFORM_E2E_EMAIL
FLOORCONNECTOR_PLATFORM_E2E_PASSWORD
```

To run only the focused access regression:

```bash
pnpm e2e:super-admin
```

The generated local-only storage files are:

```text
playwright/.auth/local-user.json
playwright/.auth/platform-admin.json
```

The spec verifies:
- platform-admin auth setup lands the platform account on `/super-admin` after a normal login when no `next` is supplied
- platform-admin user can load `/super-admin`
- contractor-only owner is redirected from `/super-admin` to `/dashboard?error=Platform+admin+access+is+required.`
- contractor-only owner can still load `/dashboard`, `/projects`, and `/settings`

Contractor route-continuity checks assume the contractor E2E account has completed the real `/setup/company` gate. If the account redirects to `/setup/company`, complete that form through the app UI and rerun `pnpm e2e:super-admin`; do not patch storage state manually.

## Estimate Group Catalog Insertion QA

Required test data:

- an authenticated contractor user
- a safe draft estimate that can be edited during QA
- at least two active non-system catalog items
- optionally a third active non-system catalog item for the global fallback check

Set the draft estimate and catalog item names:

```bash
$env:FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_ID="estimate-uuid"
$env:FLOORCONNECTOR_E2E_GROUP_A_CATALOG_ITEM="Vinyl Cove Base"
$env:FLOORCONNECTOR_E2E_GROUP_B_CATALOG_ITEM="Mobilization or Setup"
$env:FLOORCONNECTOR_E2E_GLOBAL_CATALOG_ITEM="Surface Prep / Grind"
pnpm e2e -- e2e/estimate-group-catalog-insertion.spec.js
```

Instead of an estimate id, a path may be supplied:

```bash
$env:FLOORCONNECTOR_E2E_DRAFT_ESTIMATE_PATH="/estimates/estimate-uuid/edit"
```

## What The Focused Spec Verifies

- protected Estimate Editoror loads with real auth
- a draft estimate can create new groups through the existing UI
- group-level `Add Item` opens the existing add-item tools
- active non-system catalog item quick-add inserts into the selected group
- a second group can receive a different active non-system catalog item
- renaming a group keeps the inserted item in that group
- optional global add flow inserts without selected group into the existing ungrouped fallback

## What It Does Not Do

- it does not seed fake data
- it does not create users, organizations, catalog items, or draft estimates
- it does not bypass auth, permissions, RLS, or middleware
- it does not test invoice behavior
- it does not test estimate calculations beyond confirming the inserted rows render in the expected group

## Troubleshooting

If the test redirects to `/login`, refresh the saved auth state:

```bash
pnpm e2e:auth
```

If no catalog quick match appears, confirm the environment variable matches an active non-system catalog item name available to the organization.

If the test should use an already running dev server and never start one:

```bash
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm e2e -- e2e/estimate-group-catalog-insertion.spec.js
```

## Manual Estimate Approval QA

The manual approval spec uses the same protected project and shared authenticated storage state. It is a real action against a real draft or sent estimate and will mark that estimate approved through the canonical status-transition path.

```bash
$env:FLOORCONNECTOR_E2E_MANUAL_APPROVAL_ESTIMATE_PATH="/estimates/estimate-uuid"
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
pnpm exec playwright test e2e/estimate-manual-approval-action.spec.js
```
