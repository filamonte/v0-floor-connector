# Local Golden Path Seed Mode Design

Status: Active / Planning Only
Doc Type: Demo / Design

## 1. Purpose

This document designs a future local-only golden path seed mode for FloorConnector
demos and QA.

This pass does not implement write mode. It does not create local, staging, or
production data. It does not add package scripts, schema, migrations, routes,
server actions, auth behavior, RLS changes, provider calls, email/SMS sends,
notifications, payment processor calls, signature provider calls, portal invite
delivery, or cleanup behavior.

The goal is to define a safe owner-confirmed path for one deterministic local
demo project that can exercise the current connected operating loop:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The local seed must remain a fixture for development and QA only. It must never
become production behavior, a staging write shortcut, or a duplicate source of
truth.

## 2. Recommendation

Recommended implementation path: **separate local-only seed mode after explicit
owner approval**.

The existing `scripts/seed-staging-demo-data.mjs` is intentionally dry-run and
read-only target validation. Keep that boundary intact. A future local write
mode should be a separate script or a clearly separate local-only mode so
staging validation cannot accidentally become write-capable.

Recommended future command shape:

```powershell
pnpm.cmd demo:data:inventory
pnpm.cmd demo:data:seed:local -- --dry-run --organization-id <uuid> --owner-user-id <uuid> --owner-email owner@example.test --portal-customer-email portal@example.test
pnpm.cmd demo:data:seed:local -- --confirm-local-write --organization-id <uuid> --owner-user-id <uuid> --owner-email owner@example.test --portal-customer-email portal@example.test --demo-slug floorconnector-golden-path-demo
pnpm.cmd demo:data:reset:local -- --confirm-local-write --organization-id <uuid> --demo-slug floorconnector-golden-path-demo
```

These commands are proposed only. They are not implemented in this pass.

## 3. Safety Model

Future local write mode must refuse unless all of these are true:

- `--confirm-local-write` is present.
- A local-only write guard is set, for example
  `FLOORCONNECTOR_ALLOW_LOCAL_DEMO_SEED_WRITE=1`.
- The target environment is explicitly local or development.
- `NODE_ENV`, `APP_ENV`, `VERCEL_ENV`, target URL, and Supabase project/ref do
  not look production-like or staging-like.
- The Supabase URL is localhost, an explicit local Supabase target, or an
  owner-approved development target.
- The command is run from `C:\FloorConnector`.
- `organization_id`, `owner_user_id`, `owner_email`, and
  `portal_customer_email` are supplied explicitly.
- The owner user resolves to the supplied email and has active owner/admin
  membership in the target organization.
- All demo emails use safe non-deliverable/example domains.
- The dry-run record plan has been reviewed first.
- No provider keys, invite tokens, checkout URLs, raw webhook payloads, storage
  state, or passwords will be printed.

Future local write mode must never:

- write to staging or production
- create production-like records
- create or invite real customer auth users
- send email/SMS or create notifications
- call Stripe, Postmark, SignWell, QuickBooks, CompanyCam, n8n, AI providers,
  or any external provider
- create real payment, signature, delivery, webhook, or provider success events
- bypass tenant, auth, RLS, portal access, payment, signature, estimate, or
  invoice rules
- create activity records, portal-only copies, or duplicate business models

## 4. Seed Identity

Use deterministic, obviously fake local fixture labels:

- demo slug: `floorconnector-golden-path-demo`
- customer: `FloorConnector Demo Customer`
- contact: `FloorConnector Demo Contact`
- project: `Golden Path Demo Project`
- opportunity: `Golden Path Demo Opportunity`
- estimate: `Golden Path Demo Estimate`
- contract: `Golden Path Demo Contract`
- invoice: `Golden Path Demo Invoice`
- communication thread: `Golden Path Demo Customer Review`

Use safe emails such as `owner@example.test` and `portal@example.test` in docs,
tests, and examples. Future local write mode should require operator-supplied
emails and reject common real domains unless a later owner-approved rule says
otherwise.

## 5. Data Graph

Future local seed mode should create or reuse data in this order:

1. Validate local target, explicit ids, owner user, owner membership, and safety
   guards.
2. Reuse the existing contractor organization and owner/admin user.
3. Create or find one customer, one contact, and one customer-contact
   relationship.
4. Create or find one active project as the operational hub.
5. Create or find one opportunity linked to the customer/project story.
6. Create or find estimate rows with line items and document-readiness-friendly
   customer/project context.
7. Create or find a contract generated from the estimate, with signer state only
   if it can be represented without fake provider behavior.
8. Create or find an invoice linked to the project, estimate, and job where the
   current schema supports those links.
9. Create or find safe manual/internal payment or payment-event state only when
   the row cannot be confused with a processor result.
10. Create or find jobs with unscheduled, scheduled, in-progress, and
    ready-to-schedule coverage as the schema safely supports.
11. Create or find job assignments tied to existing people/vendor records.
12. Create or find one Daily Log, one open blocker field note, and one resolved
    field note.
13. Create an execution attachment placeholder only when the existing model can
    represent it without fake uploads, broken storage paths, or portal exposure.
14. Create or find one communication thread and safe customer-review messages
    linked to the project/customer/source record.
15. Create or find document delivery evidence only as internal/manual/print
    evidence when the current model can represent it without provider claims.
16. Create or find portal access grant and portal project access only for an
    existing owner-approved portal customer identity.
17. Print non-secret route hints and fixture gap notes.

If any record would require provider-like behavior, real auth user creation,
signature mutation, payment success, invite-token generation, or fake storage,
the seed should omit that record and report the gap.

## 6. Idempotency Strategy

Future local write mode should be create-or-find by deterministic fixture keys,
not blind insert.

Use this lookup hierarchy:

- always scope by `company_id`
- use `demo_slug` only in existing notes, description, metadata, payload, or
  reference fields where the table already supports safe fixture metadata
- prefer table-specific stable references where they exist, such as estimate or
  invoice reference fields
- otherwise match by deterministic title/name plus customer/project context
- update only script-owned fixture fields and only when documented
- skip immutable events if there is no precise way to avoid duplicate rows

Do not depend on generated UUIDs as reusable demo truth. Do not create a new
demo marker table.

## 7. Cleanup / Reset Strategy

The first approved local seed mode should be create-or-find and refresh-safe. A
reset command should remain separate.

Future reset mode must:

- require `--confirm-local-write`
- require the local-only write env guard
- require `--organization-id` and `--demo-slug`
- print a dry-run preview count before deleting or archiving anything
- touch only rows scoped to the organization and marked with the demo slug or
  deterministic local fixture labels
- delete or archive in reverse dependency order
- refuse staging, production, production-like URLs, unknown Supabase refs, and
  any row without a deterministic demo marker

If the current schema supports archive/status fields for a record, prefer
archive/reset-to-known-state over hard delete. If a safe reset cannot be proven
for a table, leave the rows in place and report the manual cleanup note.

## 8. Test Plan

Future implementation should include focused script tests for:

- missing `--confirm-local-write` refuses write mode
- missing local write env guard refuses write mode
- production-like or staging-like target refuses write mode
- invalid UUID/email inputs refuse before connecting
- non-example customer emails warn or refuse according to the approved policy
- dry-run prints a plan and performs no Supabase writes
- write mode cannot run through `scripts/seed-staging-demo-data.mjs`
- create-or-find idempotency avoids duplicate records on rerun
- reset mode previews counts and refuses unmarked rows
- provider-like payment/signature/delivery state is omitted or flagged
- output never contains service-role values, portal tokens, passwords, checkout
  URLs, provider secrets, or storage state

Suggested validation for a future implementation:

```powershell
node scripts/seed-local-golden-path-demo-data.test.mjs
pnpm.cmd demo:data:inventory
pnpm.cmd demo:data:seed:local -- --dry-run --organization-id <uuid> --owner-user-id <uuid> --owner-email owner@example.test --portal-customer-email portal@example.test
node .\node_modules\prettier\bin\prettier.cjs --check "scripts/seed-local-golden-path-demo-data.mjs" "scripts/seed-local-golden-path-demo-data.test.mjs" "docs/demo/local-golden-path-seed-mode-design.md"
git diff --check
```

Run web typecheck/lint only if app or TypeScript runtime code changes.

## 9. Docs Update Plan

When a future local write mode is approved and implemented, update:

- `docs/demo/local-golden-path-seed-mode-design.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/golden-workflow-demo-path.md`
- `docs/operational-intelligence-demo-readiness.md`
- `docs/chat-handoff.md`
- `docs/feature-build-status.md` only if status wording changes
- `docs/e2e-browser-qa.md` only if commands or fixture behavior change

Docs must continue to say whether the mode is dry-run, local write, staging
read-only validation, or staging write design. Do not blur those modes.

## 10. Current Decision

Write mode remains disabled.

The safest next owner decision is whether to approve a local-only implementation
slice that adds a separate dry-run-first local seed script with the gates above.
Staging write mode should remain deferred until read-only target validation,
explicit allowlist, idempotency, cleanup policy, and owner approval are all in
place.
