# Staging Owner Runbook

Status: Active
Doc Type: Runbook

## 1. Purpose

This runbook gives the owner-controlled path from local readiness to a safe
FloorConnector staging/demo deployment. It is paired with
`docs/staging-deployment-readiness-audit.md` and the local preflight command:

```bash
pnpm staging:preflight
```

This runbook does not authorize deployment, external resource creation, remote
Supabase changes, provider calls, environment variable changes, migration
application, auth/RLS changes, tenant logic changes, payment changes, signature
changes, portal grant changes, settings changes, platform-admin behavior
changes, or business workflow changes.

## 2. What Codex Can Validate Locally

Codex can safely validate:

- repo status and current commit alignment
- Node and `pnpm` availability
- required local repo files
- package scripts and web app scripts
- `.env.example` variable names only
- staging/demo docs and route checklist presence
- local-only typecheck/lint when explicitly requested
- public/protected Playwright command recommendations without running browser QA

Codex should not read or print `.env.local` values for this runbook. Missing real
secrets are not a local preflight failure.

## 3. What The Owner Must Configure Externally

The owner must configure:

- the correct Vercel account/team/project
- staging URL and preview/protection policy
- Vercel environment variables
- Supabase project selection
- Supabase Auth site URL and redirect URLs
- remote migration alignment review
- RLS/security advisor review
- Stripe/Postmark/SignWell/provider test-mode posture
- contractor, platform-admin, and portal demo users
- real canonical demo data and portal grants

Use
[docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md)
before creating or approving any staging demo records. The plan defines the
minimum coherent canonical dataset, the existing local fixture patterns, and
the required no-provider/no-secret/no-token safety boundaries for any future
seed script.

The dry-run design for that seed script now lives in
[docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md).
Phase 1 is implemented as a local no-write planner:

```bash
pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

That command validates explicit inputs and prints the future canonical dataset
plan. It does not read `.env.local`, connect to Supabase, write data, call
providers, create auth users, create payment/signature/email events, or print
portal invite tokens. Any future write-capable seed mode remains owner-approved
and out of scope until a separate implementation prompt.

Before any future write-capable seed mode exists, review
[docs/demo/staging-demo-seed-write-mode-design.md](C:/FloorConnector/docs/demo/staging-demo-seed-write-mode-design.md)
and make these owner decisions explicitly:

- staging Supabase project ref or project URL
- staging app URL
- target organization id
- owner user id and owner email
- portal customer email
- platform admin email, only if platform-admin demo coverage is in scope
- confirmation that the target is not production or production-like
- confirmation that provider keys are test-mode or provider-isolated
- confirmation that dry-run output was reviewed first
- confirmation that remote migrations and expected tables were checked
- confirmation phrase: `I APPROVE STAGING DEMO SEED WRITES`

Codex should not create these resources or mutate these settings unless the
owner explicitly authorizes a specific action in a later task.

## 4. Vercel Project / Account Checklist

- Confirm the canonical repository is `filamonte/v0-floor-connector`.
- Confirm the owner is logged into the Vercel account/team that should own
  FloorConnector staging.
- Do not create a duplicate Vercel project while ownership is unclear.
- Confirm whether an existing Vercel project already exists under another
  account/team.
- Link or create a project only after the owner approves the target account,
  team, project name, branch, and protection posture.
- Use framework `Next.js`.
- Use Node 20+.
- Start with install command:

  ```bash
  pnpm install --frozen-lockfile
  ```

- Start with build command:

  ```bash
  pnpm --filter @floorconnector/web build
  ```

- Keep `vercel.json` absent unless a failed build or explicit owner preference
  proves the repo needs checked-in hosting config.

## 5. Environment Variable Checklist

Names only. Do not paste secret values into docs, chats, tickets, or screenshots.

### Supabase

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

### App URL / Site URL

- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_MARKETING_URL`
- `NEXT_PUBLIC_SUPPORT_URL`
- `NEXT_PUBLIC_PRIVACY_POLICY_URL`
- `NEXT_PUBLIC_TERMS_OF_SERVICE_URL`
- `NODE_ENV`
- `APP_ENV`
- `APP_SECRET`
- `SESSION_SECRET`
- `ENCRYPTION_KEY`
- `CRON_SECRET`
- `INTERNAL_API_TOKEN`

### Stripe

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `STRIPE_FOUNDER_PLAN_PRICE_ID`
- `STRIPE_PRICE_ID_BASE`
- `FLOORCONNECTOR_E2E_PAYMENT_GATEWAY`

### Postmark / Email

- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_MESSAGE_STREAM`
- `POSTMARK_BROADCAST_STREAM`
- `POSTMARK_FROM_EMAIL`

### Early Access / Activation

- `FLOORCONNECTOR_EARLY_ACCESS_INTAKE_COMPANY_ID`
- `FLOORCONNECTOR_SHOW_DEV_QA_TOOLS`
- `PLATFORM_SUPER_ADMIN_EMAIL`

### Auth / QA

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `FLOORCONNECTOR_E2E_EMAIL`
- `FLOORCONNECTOR_E2E_PASSWORD`
- `FLOORCONNECTOR_PLATFORM_E2E_EMAIL`
- `FLOORCONNECTOR_PLATFORM_E2E_PASSWORD`
- `FLOORCONNECTOR_PORTAL_E2E_EMAIL`
- `FLOORCONNECTOR_PORTAL_E2E_PASSWORD`
- `PLAYWRIGHT_BASE_URL`
- `PLAYWRIGHT_STORAGE_STATE`
- `PLAYWRIGHT_PLATFORM_ADMIN_STORAGE_STATE`
- `PLAYWRIGHT_PORTAL_STORAGE_STATE`

### Provider-Specific

- `SIGNWELL_API_KEY`
- `SIGNWELL_WEBHOOK_SECRET`
- `PDF_BROWSER_EXECUTABLE_PATH`
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

## 6. Supabase Auth Callback URL Checklist

For each environment, verify in the Supabase dashboard:

- Site URL uses the active app origin.
- Redirect URLs include:
  - `/auth/callback`
  - `/update-password`
  - any approved staging preview URL that will be used for auth testing
- Google provider settings point to the matching environment.
- Email/password is configured intentionally.
- Password reset and confirmation flows return to the staging origin.
- `NEXT_PUBLIC_APP_URL` matches the intended browser origin.

Do not count `/login` loops as product-route QA success. Treat them as callback
or storage-state blockers until resolved.

## 7. Supabase Migrations / RLS Owner Verification

Before staging demo:

- Confirm the selected Supabase project is staging, not production.
- Review pending local migrations before applying anything remotely.
- Run remote migration alignment checks only with owner approval.
- Run RLS/security advisor checks with owner credentials or approved tooling.
- Refresh generated types if remote schema changes are applied and the repo has
  an approved type-generation path.
- Confirm tenant-owned tables preserve organization/company isolation.
- Confirm service-role scripts are not run against production by accident.

Do not run `supabase db push`, migration apply commands, or destructive
database commands from this runbook without a separate explicit owner approval.

## 8. Provider Test-Mode Posture Checklist

- Stripe staging should use test-mode keys unless live provider behavior is
  explicitly approved.
- Do not create live Products, Prices, Checkout Sessions, webhooks,
  subscriptions, payment links, invoices, customers, or Customer Portal sessions
  during staging prep.
- Postmark sends should stay disabled or constrained until recipient and sender
  policy is explicit.
- SignWell provider tests should stay scoped to a test lane and must not be
  inferred from browser print/save routes.
- QuickBooks, CompanyCam, n8n, analytics, and monitoring vars do not prove those
  integrations are demo-ready by their presence.

## 9. Demo Data / Auth State Checklist

- Read
  [docs/demo/staging-demo-data-plan.md](C:/FloorConnector/docs/demo/staging-demo-data-plan.md)
  before creating staging demo data.
- Use one approved staging contractor organization.
- Use one contractor owner/admin test account with completed setup.
- Use one platform-admin account with explicit `platform_user_roles` access.
- Use one portal customer auth user backed by canonical portal grants.
- Use real canonical records for the operating-core demo:
  - customer
  - project
  - estimate
  - contract
  - change order where available
  - job
  - invoice
  - payment/payment event where available
  - daily log
  - service ticket
  - warranty document where available
- Avoid stale hardcoded IDs. Start from index routes and follow visible detail
  links whenever possible.
- Do not create fake production data, portal-only records, or local-only
  persistence.

## 10. Preflight Command Usage

Run local structural preflight:

```bash
pnpm staging:preflight
```

That command checks local structure, package scripts, Node/pnpm availability,
important docs/files, and `.env.example` variable names only. It does not read
`.env.local`, deploy, call Vercel, call Supabase, call providers, run browser
QA, or mutate remote state.

Run optional static local checks:

```bash
node scripts/staging-preflight.mjs --run-checks
```

That mode runs:

```bash
pnpm --filter @floorconnector/web typecheck
pnpm --filter @floorconnector/web lint
```

Use the command output as a local readiness signal, not as proof that external
staging configuration is complete.

## 11. Deployment Hold Points

Hold deployment when:

- Vercel account/project ownership is unclear.
- `.vercel/project.json` points to an unapproved project.
- staging env vars are incomplete or copied from production without review.
- Supabase Auth callback URLs do not match the staging origin.
- remote migrations have not been reviewed.
- RLS/security advisor has not been checked for the selected project.
- Stripe keys are live or mode-unknown.
- Postmark/SignWell/provider sends could reach real customers unexpectedly.
- portal auth/grants are not prepared.
- demo data is missing or stale.
- protected Playwright checks redirect to `/login` because auth state is stale.

## 12. Rollback / Stop Guidance

If staging setup behaves unexpectedly:

- Stop before changing more external settings.
- Capture the failing command, route, status, and environment name only.
- Do not print secrets, tokens, auth storage state, invite links, checkout URLs,
  webhook payloads, or customer PII.
- Revert unapproved repo config changes instead of piling on hosting guesses.
- If a deployment was already created, use the hosting provider's rollback or
  disable/share-protection controls according to the owner-approved deployment
  policy.
- If provider sends or webhooks were accidentally enabled, pause the provider
  lane and record exactly which test account or endpoint was involved.

## 13. What Not To Do

- Do not deploy from this runbook without explicit owner approval.
- Do not use production provider keys accidentally.
- Do not enable provider-backed sends casually.
- Do not bypass early-access activation gates.
- Do not weaken setup, auth, portal, billing, tenant, or platform-admin gates
  for demo convenience.
- Do not run migrations without review.
- Do not create duplicate Vercel projects while ownership is unclear.
- Do not create fake dashboard data or local-only business persistence.
- Do not claim accounting sync, AI automation, stored PDFs, full document
  management, customer-facing FieldTrail, service request intake, or native
  mobile/offline support unless `docs/current-state.md` says it is implemented.
