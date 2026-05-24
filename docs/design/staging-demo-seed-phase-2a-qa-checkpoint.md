# Staging Demo Seed Phase 2A QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## 1. Purpose

This checkpoint validates the Staging Demo Seed Phase 2A read-only target
validation work without enabling write mode.

The checkpoint covers `scripts/seed-staging-demo-data.mjs`,
`scripts/seed-staging-demo-data.test.mjs`, the package seed commands, and the
supporting staging/demo docs. It does not authorize real data creation,
Supabase writes, migrations, auth user creation, portal invites, payment or
signature events, provider calls, or app workflow changes.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/demo/staging-demo-seed-write-mode-design.md`
- `docs/design/staging-demo-seed-phase-1-dry-run-script.md`
- `docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`
- `docs/product-language.md`

## 3. Files Inspected

- `scripts/seed-staging-demo-data.mjs`
- `scripts/seed-staging-demo-data.test.mjs`
- `scripts/demo-data-inventory.mjs`
- `package.json`
- `docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/demo/staging-demo-seed-write-mode-design.md`
- `docs/staging-owner-runbook.md`
- `docs/chat-handoff.md`
- `docs/README.md`
- `scripts/platform-admin.mjs`
- `scripts/portal-e2e-fixture.mjs`
- `scripts/e2e-second-tenant-fixture.mjs`

## 4. Dry-Run Findings

- Dry-run remains the default mode.
- Dry-run validates required explicit identifiers before printing the plan.
- Dry-run exits nonzero on missing required inputs.
- Dry-run exits zero with valid fake UUID/email inputs.
- Dry-run does not create a Supabase client, connect to Supabase, or read
  `.env.local`.
- Dry-run does not write records, call providers, create auth users, create
  portal invites, create payment/signature/email events, or print invite
  tokens.
- The package command `pnpm demo:data:seed:dry-run -- ...` remains a no-write
  planner.

## 5. Validate-Target Findings

- `--validate-target` is explicit and separate from dry-run.
- Validate-target requires explicit Supabase URL, approved service-role env var
  name, organization id, owner user id/email, portal customer email, and
  `local|staging` environment.
- Validate-target hides the service-role value and prints only the env var
  name.
- Validate-target refuses production environment values and production-like
  Supabase URLs.
- Validate-target uses select-only table and posture checks.
- Validate-target reports remote migration alignment as an owner action rather
  than attempting to verify or apply migrations.
- Mocked validate-target QA passed without connecting to Supabase.
- `--execute` and write-looking flags remain refused.

## 6. Script Safety Findings

Static search found no `.insert`, `.update`, `.delete`, `.upsert`, or `.rpc`
calls in `scripts/seed-staging-demo-data.mjs`.

Static search found no `auth.admin`, `createUser`, `generateLink`, provider SDK
calls, `.env.local` reads, or invite-token output path in the seed script.
Expected safety-string references remain for forbidden provider, payment,
signature, email, and invite-token behavior.

The script imports `@supabase/supabase-js` for the explicit read-only
validate-target mode only. The dry-run path does not instantiate a client.

## 7. Commands / Tests Run

```bash
git status --short --branch
git log --oneline -10
rg -n "\.(insert|update|delete|upsert|rpc)\b|auth\.admin|createUser|invite|generateLink|createClient|Stripe|Postmark|SignWell|OpenAI|\.env\.local|invite token|invite-token|SUPABASE_SERVICE_ROLE_KEY" scripts/seed-staging-demo-data.mjs scripts/seed-staging-demo-data.test.mjs
rg -n "\.from\([^\n]+\)\.(insert|update|delete|upsert)|\.rpc\(" scripts/seed-staging-demo-data.mjs
node scripts/seed-staging-demo-data.test.mjs
node scripts/seed-staging-demo-data.mjs --organization-id 11111111-1111-4111-8111-111111111111 --owner-user-id 22222222-2222-4222-8222-222222222222 --owner-email owner@example.test --portal-customer-email portal@example.test --environment staging --dry-run
node scripts/seed-staging-demo-data.mjs
node scripts/seed-staging-demo-data.mjs --validate-target
pnpm demo:data:seed:dry-run -- --organization-id 11111111-1111-4111-8111-111111111111 --owner-user-id 22222222-2222-4222-8222-222222222222 --owner-email owner@example.test --portal-customer-email portal@example.test --environment staging
pnpm exec prettier --check scripts/seed-staging-demo-data.mjs scripts/seed-staging-demo-data.test.mjs package.json docs/design/staging-demo-seed-phase-2a-qa-checkpoint.md docs/design/staging-demo-seed-phase-2a-validate-target-read-only.md docs/design/staging-demo-seed-phase-1-dry-run-script.md docs/demo/staging-demo-data-plan.md docs/demo/staging-demo-seed-script-spec.md docs/demo/staging-demo-seed-write-mode-design.md docs/staging-owner-runbook.md docs/chat-handoff.md docs/README.md
git diff --check
git status --short --branch
```

Mocked validate-target command:

```powershell
$env:FLOORCONNECTOR_DEMO_SEED_VALIDATE_TARGET_MOCK = "ready"
$env:SUPABASE_SERVICE_ROLE_KEY = "test-secret-not-printed"
node scripts/seed-staging-demo-data.mjs --validate-target --supabase-url https://staging-ref.supabase.co --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id 11111111-1111-4111-8111-111111111111 --owner-user-id 22222222-2222-4222-8222-222222222222 --owner-email owner@example.test --portal-customer-email portal@example.test --environment staging
```

## 8. Behavior Preserved

- Dry-run remains no-write and no-connection.
- Validate-target remains read-only.
- Write mode remains unavailable.
- `--execute` still fails.
- No schema, migrations, routes, server actions, auth/RLS, tenant logic, portal
  grants, payments, signatures, estimates, invoices, settings,
  platform-admin behavior, or app workflows were changed by this checkpoint.

## 9. Follow-Up Candidates

- Owner runs `pnpm demo:data:seed:validate-target` against the intended staging
  Supabase target with approved credentials and identifiers.
- Owner verifies remote migration alignment and RLS/security posture with
  approved Supabase tooling.
- If read-only validation is clean, plan Phase 2B write mode separately with
  explicit owner approval, idempotency rules, provider-dark behavior, and
  rollback boundaries.
- If staging details are not ready, stay local and continue Vercel/Supabase
  staging setup before revisiting write mode.

## 10. Future Write-Mode Gate Reminder

Future write mode requires a separate approved task. It must remain
tenant-scoped, production-refusing, provider-dark, token-safe, idempotent or
cleanup-safe, and human-reviewed before any staging data is created.
