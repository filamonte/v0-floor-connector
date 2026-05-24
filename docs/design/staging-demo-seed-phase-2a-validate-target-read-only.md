# Staging Demo Seed Phase 2A Validate Target Read Only

Status: Active
Doc Type: Implementation Checkpoint

## 1. Purpose

This checkpoint records Phase 2A of the staging demo seed script:
`scripts/seed-staging-demo-data.mjs --validate-target`.

Phase 2A is read-only target validation. It lets the owner check whether an
explicit Supabase target has the required table/query posture, target
organization, owner user/membership, and portal customer assumptions needed
before any future staging demo seed write mode is considered.

It does not write data, seed records, apply migrations, create auth users,
create portal invites, create payments, create signature events, send emails,
call providers, expose invite tokens, or print secrets.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/demo/staging-demo-seed-write-mode-design.md`
- `docs/design/staging-demo-seed-phase-1-dry-run-script.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/local-auth-qa-recovery.md`
- `docs/operating-core-validation-checklist.md`

## 3. Implementation Choice

Option A was chosen.

`@supabase/supabase-js` is already a root dependency, and existing scripts use
it for explicit service-role tasks. This phase adds a read-only Supabase client
path that requires:

- explicit `--validate-target`
- explicit `--supabase-url`
- explicit `--service-role-key-env`
- explicit `--organization-id`
- explicit `--owner-user-id`
- explicit `--owner-email`
- explicit `--portal-customer-email`
- explicit `--environment local|staging`

The script reads only the named service-role env var value and never prints it.
Tests use a mock read-only client so validation does not connect to Supabase.

## 4. Script Behavior

Run:

```bash
pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url> --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

The command prints:

- a read-only banner
- target summary without secret values
- table queryability checks
- target organization check
- owner canonical user check
- owner membership check
- portal customer canonical user posture
- portal access grant posture
- optional platform-admin role posture
- migration-alignment warning for owner verification
- passed/warned/failed counts
- owner actions

The command exits nonzero if required inputs are missing, the target appears
production-like, the service-role env var name is not approved, the env value is
missing, or any required readiness check fails.

## 5. Required Inputs

Required for `--validate-target`:

- `--supabase-url`
- `--service-role-key-env SUPABASE_SERVICE_ROLE_KEY`
- `--organization-id`
- `--owner-user-id`
- `--owner-email`
- `--portal-customer-email`
- `--environment local|staging`

Optional:

- `--platform-admin-email`
- `--confirm <text>`

Approved service-role env var names:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY_DEV`
- `SUPABASE_SERVICE_ROLE_KEY_STAGING`

## 6. Safety Checks

The script refuses:

- `--execute`
- write/seed/migration/provider/payment/signature/email/webhook/invite-token
  flags
- `--environment production`
- production-like Supabase URLs
- production/live wording in `--confirm`
- missing explicit target inputs
- unapproved service-role env var names
- missing service-role env var value

The script never calls `.insert`, `.update`, `.delete`, `.upsert`, `.rpc`, auth
admin creation/invite methods, provider SDKs, or migration commands.

## 7. Read-Only Checks Implemented

Implemented:

- required table queryability through select-only `limit(1)` checks
- `companies` target organization lookup by supplied organization id
- `users` owner lookup by supplied owner user id and owner email
- `company_memberships` lookup by organization id and owner user id
- portal customer canonical user lookup by email
- `portal_access_grants` lookup by organization id and portal customer email
- optional platform-admin canonical user and role posture warning

Deferred to owner-approved external tooling:

- remote migration alignment
- RLS/security advisor review
- provider test-mode posture
- authenticated app route smoke
- portal auth and grant end-to-end validation
- any seed/write execution

## 8. Tests Run

Focused test command:

```bash
node scripts/seed-staging-demo-data.test.mjs
```

Covered:

- dry-run still works
- `--execute` still fails
- validate-target missing required inputs fails
- validate-target production environment fails
- validate-target production-like Supabase URL fails
- validate-target mock path exits zero
- validate-target output hides the secret value
- validate-target still refuses execute/write mode

## 9. Behavior Preserved

Preserved:

- dry-run remains default
- `pnpm demo:data:seed:dry-run` remains no-write
- `--execute` remains unavailable
- no schema changes
- no migrations
- no app routes
- no server actions
- no auth/RLS changes
- no tenant logic changes
- no portal grants or invite-token behavior changes
- no payment/signature/provider/email behavior changes
- no settings or platform-admin behavior changes

## 10. Next Step Toward Write Mode

Only after the owner runs `validate-target` against the intended staging
Supabase project and reviews any warnings should a separate task consider:

`Staging Demo Seed Phase 2B - Owner Approved Write Mode`

That future phase still needs explicit owner approval, idempotent create-or-find
behavior, provider-dark policy, portal token safety, no production-like targets,
and a separate validation/rollback plan.
