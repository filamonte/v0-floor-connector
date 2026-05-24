# Staging Demo Seed Phase 1 Dry-Run Script

Status: Active
Doc Type: Implementation Checkpoint

## 1. Purpose

This checkpoint records the first executable staging demo seed foundation:
`scripts/seed-staging-demo-data.mjs`.

Phase 1 is dry-run only. The script validates explicit owner-supplied
identifiers and prints the planned canonical demo dataset, idempotency notes,
provider safety rules, portal safety rules, and future validation routes. It
does not connect to Supabase, read `.env.local`, read secrets, write data, call
providers, create auth users, create portal invites, create payment/signature
events, or mutate app behavior.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/product-language.md`

## 3. Script Behavior

Run:

```bash
pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

The command defaults to dry-run behavior even if `--dry-run` is omitted. It
prints the banner:

```text
DRY RUN ONLY - no database writes, provider calls, emails, payments, signatures, or portal invite tokens will be created.
```

The script exits with code `0` only after required inputs pass validation and
the full plan is printed. It exits nonzero for missing required inputs, invalid
UUID/email shapes, unsafe environment values, production-like confirmation
wording, unknown flags, provider-looking flags, or `--execute`.

## 4. Required Inputs

Required:

- `--organization-id`
- `--owner-user-id`
- `--owner-email`
- `--portal-customer-email`

Optional:

- `--platform-admin-email`
- `--environment local|staging`
- `--confirm <text>`
- `--dry-run`

The script validates UUID-shaped organization and owner ids, basic email shape,
and the allowed environment values `local` or `staging`.

## 5. Safety Checks

The script refuses:

- `--execute`
- write, seed, migration, Supabase, provider, Stripe, Postmark, SignWell,
  invite-token, webhook, payment-provider, or signature-provider flags
- unknown flags
- `--environment` values outside `local` or `staging`
- confirmation text containing production/live-data wording

The dry-run path intentionally does not create a Supabase client, call app data
helpers, or import provider SDKs. It also does not read `.env.local` or inspect
secret values. Phase 2A adds an explicit read-only Supabase client path for
`--validate-target`, but that path is separate from the Phase 1 dry-run
planner.

## 6. Dataset Groups Printed

The dry-run output prints these groups from the seed specification:

- organization/company baseline
- people/vendors/crew
- customer/contact
- portal access/customer linkage assumptions
- projects
- opportunity/requirements
- estimates
- contracts
- change orders
- jobs/schedule/job assignments
- daily logs/field notes/execution attachment placeholders
- invoices/payments/payment events
- communication threads/messages
- document delivery/send event placeholders
- service tickets/warranty documents
- portal access/project access

Each group includes purpose, approximate planned records, safety notes, provider
exclusion status, and future validation routes.

## 7. Tests Run

Focused tests are implemented in `scripts/seed-staging-demo-data.test.mjs`.

The validation pass should run:

```bash
node scripts/seed-staging-demo-data.mjs
node scripts/seed-staging-demo-data.mjs --organization-id 11111111-1111-4111-8111-111111111111 --owner-user-id 22222222-2222-4222-8222-222222222222 --owner-email owner@example.test --portal-customer-email portal@example.test --environment staging --dry-run
node scripts/seed-staging-demo-data.test.mjs
pnpm demo:data:seed:dry-run -- --organization-id 11111111-1111-4111-8111-111111111111 --owner-user-id 22222222-2222-4222-8222-222222222222 --owner-email owner@example.test --portal-customer-email portal@example.test --environment staging
```

Static validation should also include focused Prettier, `git diff --check`, and
repo status. Because the root package scripts changed, a practical validation
pass should also run the web typecheck and lint commands.

## 8. What Remains Future Work

Intentionally not implemented:

- database writes
- Supabase client integration
- seed execution mode
- provider events
- portal invite creation
- demo auth user creation
- cleanup/reset script
- staging data validation against a remote database
- storage/file uploads
- schema or migration changes
- app route or server-action changes

Any future write-capable seed mode requires a separate owner-approved task,
explicit staging identifiers, production refusal, provider-dark behavior,
idempotent create-or-find rules, and no portal invite-token output.
