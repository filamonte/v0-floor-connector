# Staging Deployment Readiness Audit

Status: Active
Doc Type: QA / Deployment Readiness Audit

## 1. Purpose

This audit checks whether FloorConnector is ready for a controlled staging or
external demo deployment after the operating-core, marketing, portal, financial,
document, and public-demo readiness work.

It is a docs and QA planning pass only. It does not deploy, change environment
variables, create external resources, apply migrations, alter auth/RLS, change
tenant logic, change provider behavior, or modify app workflows.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/system-overview.md`
- `docs/workflows.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/design/public-demo-readiness-qa.md`
- `docs/design/operating-core-demo-smoke-checkpoint.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/auth-setup.md`
- `docs/e2e-browser-qa.md`
- `docs/staging-demo-readiness.md`
- root `README.md`

No `docs/staging-demo-readiness-runbook.md`, `docs/vercel*`, or
`docs/deployment*` file was present during this audit.

## 3. Files Inspected

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `.env.example`
- `playwright.config.js`
- `apps/web/package.json`
- `apps/web/next.config.ts`
- `apps/web/middleware.ts`
- `apps/web/lib/auth/*`
- `apps/web/lib/supabase/*`
- `apps/web/lib/onboarding/*`
- `apps/web/lib/organizations/setup-status.ts`
- `packages/config/src/env/public.ts`
- `packages/config/src/env/server.ts`
- `e2e/auth.setup.js`
- `e2e/platform-admin-auth.setup.js`
- `e2e/portal-auth.setup.js`
- `e2e/auth-utils.js`
- `e2e/protected-route-utils.js`
- `scripts/platform-admin.mjs`
- `scripts/portal-e2e-fixture.mjs`
- `scripts/e2e-second-tenant-fixture.mjs`
- `supabase/migrations/*`
- public and demo route files for `/`, `/login`, `/signup`, `/setup/company`,
  `/setup/billing`, `/setup/pending-activation`, `/dashboard`, `/projects`,
  `/schedule`, `/reports`, `/financials`, and `/portal`

Local hosting files checked:

- `.env.example` is present.
- `.vercel/project.json` is absent.
- `vercel.json` is absent.

## 4. Validation / Build Command Inventory

Canonical local install:

```bash
pnpm install
```

Deployment or CI install should prefer the frozen lockfile when available:

```bash
pnpm install --frozen-lockfile
```

Root validation commands from `package.json`:

```bash
pnpm typecheck
pnpm lint
pnpm build
pnpm format
```

Focused web validation commands from `apps/web/package.json`:

```bash
pnpm --filter @floorconnector/web typecheck
pnpm --filter @floorconnector/web lint
pnpm --filter @floorconnector/web build
```

Vercel staging build expectation from the existing staging runbook:

```bash
pnpm --filter @floorconnector/web build
```

Focused operating-core helper tests are documented in
`docs/operating-core-validation-checklist.md` and use package-relative paths,
for example:

```bash
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/projectpulse/summary.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/accounting-readiness.test.ts
pnpm.cmd --filter @floorconnector/web exec tsx --test lib/document-engine/print.test.ts
```

Public smoke:

```bash
pnpm exec playwright test --project=chromium-public e2e/marketing-login.spec.js
```

Contractor auth state refresh:

```bash
pnpm e2e:auth
```

Protected smoke examples:

```bash
pnpm exec playwright test e2e/dashboard-ui.spec.js e2e/schedule-ready-handoff.spec.js --project=chromium-protected
pnpm exec playwright test e2e/detail-workspace-ui.spec.js --project=chromium-protected
```

Portal fixture/auth/smoke:

```bash
pnpm e2e:portal-fixture
pnpm e2e:portal-auth
pnpm e2e:portal
```

Platform-admin smoke:

```bash
pnpm e2e:super-admin
```

Demo route smoke should follow `docs/demo/operating-core-demo-path.md` and use
fresh authenticated storage states. Protected or portal redirects to `/login`
are blockers or expected auth gates, not successful route coverage.

## 5. Env Var Checklist By Category

This section lists names only. It intentionally does not print local values.

### Public App / URLs

Documented in `.env.example`, `packages/config`, `docs/auth-setup.md`,
`docs/staging-demo-readiness.md`, and root `README.md`:

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MARKETING_URL`
- `NEXT_PUBLIC_SUPPORT_URL`
- `NEXT_PUBLIC_PRIVACY_POLICY_URL`
- `NEXT_PUBLIC_TERMS_OF_SERVICE_URL`
- `APP_ENV`
- `NODE_ENV`

Staging owner check: set these to the actual staging HTTPS origin before
testing redirects, email links, portal links, and callback URLs.

### Supabase

Documented in `.env.example`, `packages/config`, `docs/auth-setup.md`,
`docs/staging-demo-readiness.md`, scripts, and root `README.md`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL_DEV`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV`
- `SUPABASE_SERVICE_ROLE_KEY_DEV`
- `SUPABASE_JWT_SECRET_DEV`
- `SUPABASE_DB_URL_DEV`
- `SUPABASE_DIRECT_URL_DEV`
- `NEXT_PUBLIC_SUPABASE_URL_PROD`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY_PROD`
- `SUPABASE_SERVICE_ROLE_KEY_PROD`
- `SUPABASE_JWT_SECRET_PROD`
- `SUPABASE_DB_URL_PROD`
- `SUPABASE_DIRECT_URL_PROD`

Staging owner check: confirm the staging Vercel app points to the intended
staging Supabase project, not a local, production, or stale project.

### Auth / Operator

Documented in `.env.example`, `docs/auth-setup.md`, root `README.md`, and E2E
auth scripts:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `PLATFORM_SUPER_ADMIN_EMAIL`
- `FLOORCONNECTOR_E2E_EMAIL`
- `FLOORCONNECTOR_E2E_PASSWORD`
- `FLOORCONNECTOR_PLATFORM_E2E_EMAIL`
- `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`
- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_STORAGE_STATE`
- `PLAYWRIGHT_PLATFORM_ADMIN_STORAGE_STATE`

Supabase dashboard settings are also required: site URL, redirect URLs,
provider enablement, and email confirmation behavior.

### Portal / E2E Fixture

Documented in `.env.example`, `docs/e2e-browser-qa.md`,
`scripts/portal-e2e-fixture.mjs`, and `playwright.config.js`:

- `FLOORCONNECTOR_PORTAL_E2E_EMAIL`
- `FLOORCONNECTOR_PORTAL_E2E_PASSWORD`
- `PLAYWRIGHT_PORTAL_STORAGE_STATE`
- `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE`
- `FLOORCONNECTOR_E2E_PORTAL_PROJECT_PATH`
- `FLOORCONNECTOR_E2E_PORTAL_ESTIMATE_PATH`
- `FLOORCONNECTOR_E2E_PORTAL_CONTRACT_PATH`
- `FLOORCONNECTOR_E2E_PORTAL_INVOICE_PATH`
- `FLOORCONNECTOR_E2E_PORTAL_UNAUTHORIZED_PROJECT_PATH`

The fixture script refuses write mode when `NODE_ENV`, `APP_ENV`, or
`VERCEL_ENV` marks the environment as production.

### Stripe / Billing

Documented in `.env.example`, `packages/config`,
`docs/staging-demo-readiness.md`, `docs/e2e-browser-qa.md`, and root
`README.md`:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `STRIPE_FOUNDER_PLAN_PRICE_ID`
- `STRIPE_PRICE_ID_BASE`
- `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY`

Staging owner check: decide test-mode vs live-mode posture before exposing any
payment route. Controlled staging should use test-mode keys unless the owner
explicitly approves live provider behavior.

### Email / Postmark

Documented in `.env.example` and `packages/config`:

- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_MESSAGE_STREAM`
- `POSTMARK_BROADCAST_STREAM`
- `POSTMARK_FROM_EMAIL`

Staging owner check: keep sends disabled or constrained until recipient
domains, from address, and test target accounts are intentional.

### Signature / Document Providers

Documented in `.env.example`, `packages/config`, and staging docs:

- `SIGNWELL_API_KEY`
- `SIGNWELL_WEBHOOK_SECRET`
- `PDF_BROWSER_EXECUTABLE_PATH`

Staging owner check: do not claim provider e-sign or server PDF readiness from
route rendering alone. Current document exports are browser print/save flows
unless a provider-specific test lane is explicitly run.

### Optional / Future Integrations

Documented in `.env.example` and `packages/config`:

- `QUICKBOOKS_CLIENT_ID`
- `QUICKBOOKS_CLIENT_SECRET`
- `QUICKBOOKS_REDIRECT_URI`
- `QUICKBOOKS_ENVIRONMENT`
- `COMPANYCAM_CLIENT_ID`
- `COMPANYCAM_CLIENT_SECRET`
- `COMPANYCAM_REDIRECT_URI`
- `COMPANYCAM_WEBHOOK_SECRET`
- `N8N_BASE_URL`
- `N8N_WEBHOOK_URL`
- `N8N_API_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`

These do not make accounting sync, external integrations, automation, or
analytics ready unless their explicit implementation and provider QA have been
run.

### Early Access / Demo Controls

Documented in `.env.example`, `packages/config`, root `README.md`, and staging
docs:

- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`
- `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS`

Staging owner check: choose the canonical intake company before public early
access traffic. Keep dev QA tools disabled for clean demos.

## 6. Supabase Readiness Notes

- `supabase/migrations` contains 123 local migration files. The latest files
  inspected end at `20260520130000_document_delivery_events_contracts.sql`.
- This audit did not apply migrations or call a remote Supabase project.
- May 24, 2026 read-only Supabase connector discovery is documented in
  [docs/design/supabase-staging-target-discovery.md](C:/FloorConnector/docs/design/supabase-staging-target-discovery.md).
  The connector returned one visible organization, `FloorConnectoor`
  (`cvkfudwshnfsftnnwrro`, free plan), and zero visible projects. No staging
  project candidate was identified, so no project details, migrations, tables,
  SQL, auth settings, RLS, or data were queried or changed.
- Supabase project visibility is currently a staging blocker. The owner must
  confirm the correct Supabase account/organization or make the intended
  staging project visible before Phase 2A read-only target validation can run.
- Remote migration alignment is an owner action. Before staging, run an
  intentional remote check such as `supabase migration list` and a non-mutating
  dry run where appropriate.
- No generated Supabase database types file was found by filename during this
  audit. If the staging database migration state changes, refresh generated
  types through the repo's approved type-generation path before relying on new
  schema in app code.
- RLS/security advisor review should be run later with the Supabase connector or
  owner credentials. This pass did not run destructive, production, or external
  Supabase commands.
- Current docs continue to treat `docs/current-state.md` as implemented truth;
  roadmap and target IA docs are not proof that remote staging has the matching
  schema applied.

## 7. Auth / Demo Readiness Notes

- Auth is real Supabase Auth with Google-first direction and email/password
  fallback. There is no mock auth path to count as staging readiness.
- `playwright.config.js` defaults to `PLAYWRIGHT_BASE_URL=http://localhost:3001`
  and `PLAYWRIGHT_STORAGE_STATE=playwright/.auth/local-user.json`.
- `docs/local-auth-qa-recovery.md` and `docs/e2e-browser-qa.md` document the
  common `localhost:3000` vs `localhost:3001` mismatch and the need to refresh
  auth state with the same base URL used by protected specs.
- Contractor auth setup requires `FLOORCONNECTOR_E2E_EMAIL` and
  `FLOORCONNECTOR_E2E_PASSWORD` for a real contractor account.
- Platform-admin auth setup requires a real platform-admin account and role,
  using `FLOORCONNECTOR_PLATFORM_E2E_EMAIL` or
  `PLATFORM_SUPER_ADMIN_EMAIL`, plus
  `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`.
- Portal QA requires a separate real portal customer auth user backed by
  canonical portal grants and shared project access.
- Protected route helpers now discover valid detail paths from list pages
  instead of relying only on stale hardcoded IDs.
- Supabase Auth rate limits, stale cookies, stale storage state, or callback URL
  mismatch must be reported as auth blockers, not as product-route success.

## 8. Public / Demo Route Checklist

| Route                         | Staging expectation                                                                                      | Notes                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                           | Public homepage loads and tells the operating-core story honestly.                                       | Public demo readiness already removed broken auth/footer links and avoided unavailable claims. |
| `/login`                      | Public auth route loads and can start real Supabase auth.                                                | Callback URLs must include the staging origin.                                                 |
| `/signup`                     | Public signup route loads with early-access language.                                                    | No fake free-plan claim should be introduced.                                                  |
| `/signup?next=/setup/company` | Starts signup with setup-company handoff.                                                                | Must preserve redirect intent across auth.                                                     |
| `/setup/company`              | Requires contractor auth or redirects to login.                                                          | Do not weaken setup gating for demo convenience.                                               |
| `/setup/billing`              | Requires contractor auth; billing remains early-access/manual unless test Stripe lane is explicitly run. | Do not click live Checkout.                                                                    |
| `/setup/pending-activation`   | Requires contractor auth and reflects manual activation posture.                                         | Do not imply automatic entitlement launch.                                                     |
| `/dashboard`                  | Command Center loads for a real contractor member.                                                       | Requires complete company setup and valid storage state.                                       |
| `/projects`                   | Project list and detail links resolve to real records.                                                   | Use discovery helpers, not stale fixed IDs.                                                    |
| `/schedule`                   | CrewBoard route loads with current scheduling/readiness surfaces.                                        | No drag/drop dispatch claim.                                                                   |
| `/reports`                    | Read-only operations and collections visibility loads.                                                   | Not a full report builder.                                                                     |
| `/financials`                 | Financial Control loads over existing invoices/payments.                                                 | No external accounting sync claim.                                                             |
| `/portal`                     | Customer portal loads only with real portal auth and grants.                                             | Do not count login redirect or access denied as portal success unless testing denial.          |

## 9. Operating-Core Staging Demo Checklist

| Surface                            | Demo route / anchor                                                 | Readiness check                                                                       | Caveat                                               |
| ---------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Command Center                     | `/dashboard`                                                        | Show current work, operational cues, and command-center framing.                      | Requires real contractor auth and current records.   |
| Project Workspace                  | `/projects/:id`                                                     | Show connected record lanes and next operational move.                                | Use a discovered valid project.                      |
| CrewBoard                          | `/schedule`                                                         | Show schedule board, warnings, and readiness context.                                 | No drag/drop dispatch or route optimization claim.   |
| FieldTrail                         | Project detail field section                                        | Show daily-log and field evidence timeline.                                           | Customer-facing FieldTrail is not ready.             |
| MessageCenter                      | Project detail communication section                                | Show project communication timeline over existing records.                            | No external messaging sync claim.                    |
| ProjectPulse                       | Project detail summary                                              | Show health and next-move signals.                                                    | Deterministic summary, not AI.                       |
| CloseoutTrail                      | Project detail closeout section                                     | Show closeout readiness and blockers.                                                 | Not automated closeout completion.                   |
| Proof Center                       | Project detail proof/evidence section                               | Show evidence index over source records.                                              | No standalone Proof Center route.                    |
| Send Trail                         | Estimate, contract, invoice workspaces                              | Show delivery proof visibility where events exist.                                    | Provider retry lifecycle is not ready.               |
| Document Engine                    | Print/save estimate, contract, invoice, and closeout package routes | Show browser print/save exports from canonical records.                               | Not stored PDF/document management.                  |
| Portal Customer Window             | `/portal` and portal detail routes                                  | Show customer-safe project, estimate, contract, invoice, and shared-document windows. | Requires real portal grants.                         |
| Service Center                     | Project service/warranty sections and service routes                | Show warranty/service continuity tied to project/job history.                         | Not a detached helpdesk.                             |
| Reports                            | `/reports`                                                          | Show read-only operations and collections visibility.                                 | Not full analytics/report builder.                   |
| Financial Control                  | `/financials`                                                       | Show collections/payment attention over existing invoices/payments.                   | No provider posting or new payment mutation in demo. |
| Accounting Readiness / Export Prep | `/financials/accounting-readiness`                                  | Show reconciliation/export prep and CSV copy/download where available.                | Not QuickBooks sync.                                 |
| Mobile Daily Job Log               | Daily log route at mobile width                                     | Show fast field capture and page fit.                                                 | No native/offline mobile app claim.                  |

## 10. Risk Register

| Risk                                       | Impact                                                  | Mitigation / owner action                                                                    |
| ------------------------------------------ | ------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Vercel project/account mismatch            | No reliable staging URL.                                | Owner confirms the correct Vercel account/team before linking or deploying.                  |
| Supabase project not visible to connector  | No validated staging database target.                   | Owner confirms the correct Supabase organization/account or grants connector visibility.     |
| Missing staging env vars                   | Build or runtime failures.                              | Configure names from `.env.example` and `packages/config`; do not paste values into docs.    |
| Supabase Auth callback mismatch            | Login/signup loops or stale sessions.                   | Add staging site URL and redirect URLs in Supabase dashboard.                                |
| Supabase migrations not applied remotely   | Routes may load against missing tables/functions.       | Run remote migration alignment check with owner credentials.                                 |
| RLS/security posture not reviewed remotely | Possible tenant-boundary or access surprises.           | Run Supabase security/RLS advisor with owner credentials after staging DB is selected.       |
| Stripe sandbox/live mismatch               | Accidental live billing or blocked billing QA.          | Use test-mode keys for staging unless live mode is explicitly approved.                      |
| Provider email sends accidentally enabled  | Unwanted emails to real contacts.                       | Keep Postmark constrained or disabled until sender/recipient plan is approved.               |
| SignWell/provider assumptions              | Demo may imply unavailable e-sign behavior.             | Keep e-sign provider lanes explicit and test-mode only.                                      |
| Portal invite/auth mismatch                | Portal route cannot show shared records.                | Verify portal auth user, grants, and shared project access before demo.                      |
| Demo data unavailable                      | Operating-core path cannot be shown end to end.         | Prepare one approved local/staging fixture set through sanctioned tooling.                   |
| Platform-admin role missing                | `/super-admin` smoke fails.                             | Grant role with `pnpm platform-admin grant` only against the intended environment.           |
| Browser QA stale auth                      | Protected routes redirect to `/login`.                  | Refresh storage state with matching `PLAYWRIGHT_BASE_URL`.                                   |
| Early-access intake company missing        | Public request flow fails or has nowhere safe to write. | Set `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID` to the owner-approved canonical company. |
| Roadmap/current-state confusion            | Demo overpromises future features.                      | Treat `docs/current-state.md` and this audit as the current truth boundary.                  |

## 11. Owner Actions Before Staging / Demo

1. Confirm the correct Vercel account/team and create or link the staging
   project intentionally.
2. Choose staging URL, branch, preview protection, and whether the demo is
   internal-only or shareable.
3. Configure Vercel env names from `.env.example` and `packages/config`, using
   staging/test provider values.
4. Confirm the intended Supabase staging project is visible to the
   owner-approved account/connector session.
5. Configure Supabase Auth site URL and redirect URLs for the staging origin.
6. Verify remote migration alignment and run RLS/security checks with owner
   Supabase credentials.
7. Confirm contractor, platform-admin, and portal demo users exist and have the
   expected canonical memberships/grants.
8. Decide Stripe posture: provider-isolated, test-mode Checkout/webhook smoke,
   or explicitly approved live-mode launch work.
9. Decide Postmark and SignWell posture before triggering any provider sends.
10. Prepare one approved staging demo record set and avoid stale hardcoded IDs.
11. Run public, protected, portal, setup, and platform-admin smoke commands
    against the staging base URL.
12. Record blockers honestly instead of weakening auth, setup, portal, billing,
    or tenant boundaries for demo convenience.

## 12. Recommended Next Codex Prompt

The follow-up local preflight foundation now lives in:

- `scripts/staging-preflight.mjs`
- `docs/staging-owner-runbook.md`
- package script `pnpm staging:preflight`

Use those before any owner-approved staging deploy or external setup action.

```text
Chat: Controlled Staging Setup Checklist Verification - FloorConnector

Use the staging deployment readiness audit as the source checklist.
Do not deploy, create resources, change env vars, or call providers unless the
owner explicitly authorizes that specific action.

Verify the current repo status, confirm the Vercel project/account state if the
owner has made it available, inspect the selected staging URL/env-name plan
without printing secrets, and prepare a final go/no-go checklist for the first
controlled staging smoke run.
```
