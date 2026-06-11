# Local Auth QA Recovery

Status: Active
Doc Type: Runbook

This runbook documents the local Supabase Auth QA recovery path for protected
FloorConnector routes. It is for local development and browser QA only; it does
not change production authentication, authorization, RLS, tenant scoping, route
protection, payments, signatures, portal grants, or canonical workflows.

## Problem Summary

Recent protected browser QA for Project Workspace detail routes was blocked by
three local QA issues:

- Supabase Auth returned `AuthApiError: Request rate limit reached` after
  repeated login attempts.
- Saved Playwright storage state became stale or mismatched with the local app
  URL, causing protected detail routes to redirect to `/login`.
- A fixed project detail fixture surfaced `Customer not found for this
organization` while Project detail loaded Customer Access records.

`/projects` could still load with an authenticated local state, but protected
detail route verification could not be counted as passed while auth state was
stale and rate limited.

## Root Causes Found

- Playwright defaults to `PLAYWRIGHT_BASE_URL=http://localhost:3001`, while
  local manual dev servers are often running at `http://localhost:3000`.
- `chromium-protected` runs the `setup` project, which performs a real
  Supabase email/password login through `/login` and writes
  `playwright/.auth/local-user.json`.
- Re-running auth setup while credentials, URL, or Supabase cooldown state are
  wrong can repeatedly hit the same Supabase Auth rate limit.
- Project detail QA previously had a hardcoded fallback path:
  `/projects/797ec5b1-4417-4a36-934e-e82498efef5a`.
- Project detail loads Customer Access by validating the project's customer
  against the active organization before listing portal access grants. If the
  fixed project fixture is stale, belongs to a different organization context,
  or references a customer that is not valid for the active local account,
  Customer Access loading can fail with `Customer not found for this
organization`.

## Correct Local URL

Use one local app origin for the full auth refresh and protected smoke run.

When Playwright owns the dev server, the default is:

```text
PLAYWRIGHT_BASE_URL=http://localhost:3001
```

When a local Next dev server is already running at `localhost:3000`, use:

```powershell
$env:PLAYWRIGHT_BASE_URL="http://localhost:3000"
$env:PLAYWRIGHT_SKIP_WEB_SERVER="1"
```

Then run auth setup and protected checks against that same origin.

## Auth State Refresh

Required local contractor auth variables:

```text
FLOORCONNECTOR_E2E_EMAIL
FLOORCONNECTOR_E2E_PASSWORD
```

Refresh contractor storage state:

```powershell
pnpm e2e:auth:setup
```

The generated local-only file defaults to:

```text
.playwright/.auth/contractor.json
```

The older `playwright/.auth/local-user.json` path is still reused when it
already exists, and `PLAYWRIGHT_STORAGE_STATE` can point to a different local
file. Do not commit storage-state files. Do not print credentials or values
from `.env.local`.

## Supabase Rate Limit Cooldown

If Supabase returns `AuthApiError: Request rate limit reached`:

- Stop retrying login setup immediately.
- Keep browser QA to already-authenticated index routes only, or skip protected
  browser QA honestly.
- Wait for the Supabase Auth cooldown before running `pnpm e2e:auth` again.
- Before the next auth attempt, verify the app origin, credential env names,
  and intended storage-state path.
- If neither contractor credentials nor a saved contractor storage state exists,
  run `pnpm e2e:smoke:auth` only as a prerequisite check; it should skip with a
  clear message rather than failing mysteriously.

Do not loosen auth, disable route protection, bypass RLS, or create backdoor
test login behavior to work around rate limits.

## Choosing Valid Protected Detail Routes

Prefer discovering detail routes from authenticated index pages instead of
depending on stale fixed IDs:

1. Load the index route with existing authenticated storage state.
2. Confirm it did not redirect to `/login`.
3. Select a real detail link from the rendered page.
4. Use that route for browser QA.

For Project Workspace QA, the project detail smoke now uses
`FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH` when explicitly provided. Otherwise it
loads `/projects`, probes visible `/projects/:projectId` links from the page
content, and skips the smoke if the available links are not valid for the
active local organization.

If a fixed fixture is required for a deeper scenario, set it explicitly in the
local shell and confirm the record belongs to the authenticated user's active
organization:

```powershell
$env:FLOORCONNECTOR_E2E_PROJECT_DETAIL_PATH="/projects/<valid-project-id>"
```

## Known Bad Fixture Pattern

Avoid treating old hardcoded detail IDs as stable project truth. A project ID
that worked for one local organization may fail in another active organization
or after seed/test data changes.

The stale project fallback removed from the project detail smoke was:

```text
/projects/797ec5b1-4417-4a36-934e-e82498efef5a
```

Other detail smokes may still contain fixed IDs for estimates, invoices, jobs,
and contracts. If those routes fail with not-found or organization-scope
errors, verify the fixture before treating the UI as broken.

## Browser QA Checklist

After auth cooldown and storage refresh are healthy:

1. Confirm the current branch and latest commit:

   ```powershell
   git status --short --branch
   git log --oneline -5
   ```

2. Confirm the app origin and storage state:

   ```powershell
   $env:PLAYWRIGHT_BASE_URL
   $env:PLAYWRIGHT_STORAGE_STATE
   ```

3. Refresh auth once:

   ```powershell
   pnpm e2e:auth
   ```

4. Check protected index routes:

   ```text
   /dashboard
   /projects
   /schedule
   /communications
   ```

5. From `/projects`, open one real project detail route.

6. From that project, check linked records only when visible and available:

   ```text
   /contracts/:contractId
   /invoices/:invoiceId
   /daily-logs/:dailyLogId
   /jobs/:jobId
   ```

7. Count a route as blocked, not passed, if it redirects to `/login`, hits
   Supabase Auth rate limits, or fails because the fixture record does not
   belong to the active local organization.

## Behavior Preserved

This recovery path preserves:

- production auth behavior
- Supabase Auth login
- route protection
- organization membership checks
- RLS and tenant boundaries
- Project Workspace data loading
- Customer Access validation
- payment, signature, estimate, invoice, portal, settings, and platform-admin
  behavior
