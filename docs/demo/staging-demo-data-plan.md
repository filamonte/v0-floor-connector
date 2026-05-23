# Staging Demo Data Plan

Status: Active
Doc Type: Demo / Runbook

## 1. Purpose

This plan defines the safe demo data shape needed to show FloorConnector's
current operating core without relying on stale local records or hardcoded IDs.
It is a planning and local fixture-audit artifact only.

It does not authorize production or staging writes, remote Supabase commands,
migrations, provider actions, real payment processing, signature mutation,
email sending, portal invite-token exposure, schema changes, RLS changes, auth
changes, tenant logic changes, routes, server actions, settings changes,
platform-admin behavior changes, or new data models.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/staging-owner-runbook.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/e2e-browser-qa.md`
- `docs/auth-setup.md`

## 3. Existing Fixture / Script Inventory

Inspected:

- `package.json`
- `scripts/README.md`
- `scripts/portal-e2e-fixture.mjs`
- `scripts/e2e-second-tenant-fixture.mjs`
- `scripts/staging-preflight.mjs`
- `e2e/protected-route-utils.js`
- `e2e/auth-utils.js`
- `e2e/auth.setup.js`
- `e2e/portal-auth.setup.js`
- `e2e/platform-admin-auth.setup.js`
- `e2e/project-ai-cue-work-item-bridge.spec.js`
- `e2e/dashboard-ui-my-work-queue-modes.spec.js`
- route and data helpers under `apps/web/lib`
- core Supabase migrations under `supabase/migrations`

Current useful patterns:

- `scripts/portal-e2e-fixture.mjs` validates by default and writes only with
  `--write` plus `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`. It creates
  canonical local/test portal records for customer, contact, project,
  opportunity, catalog item, portal grant, portal project access, stored portal
  permissions, sent estimate, sent contract, sent invoice, and sent change
  order. It prints non-secret route paths, not invite tokens.
- `scripts/e2e-second-tenant-fixture.mjs` validates by default and writes only
  with the same explicit fixture-write guard. It creates a disposable tenant-B
  invoice/payment chain for cross-tenant payment boundary tests, not demo use.
- `e2e/protected-route-utils.js` discovers real protected detail links from
  index pages and skips invalid/stale detail records.
- `e2e/project-ai-cue-work-item-bridge.spec.js` has local fixture patterns for
  approved-estimate-missing-contract, signed-ready-no-job, unscheduled-job,
  scheduled-job, and open blocker field-note states.
- `e2e/dashboard-ui-my-work-queue-modes.spec.js` has local fixture patterns for
  sent estimate follow-up, overdue invoice, unscheduled job, people, and
  responsibility defaults.

Unsafe as a staging demo strategy:

- spec-local fixture creation that deletes or resets data without a staging
  owner-approved cleanup policy
- service-role scripts against remote Supabase without an explicit environment
  and tenant allowlist
- using provider test scripts as demo data creation
- hardcoding UUIDs from one local database into staging docs or scripts

## 4. Ideal Canonical Demo Dataset

### Contractor / Company / Account

- one contractor organization with completed setup and a clear company profile
- one owner/admin contractor user with the correct active membership
- optional platform-admin user with `platform_user_roles` access for
  super-admin smoke only
- one portal customer auth user backed by canonical portal access records

### Customer / Project

- one canonical customer account
- one primary customer contact tied through `contacts` and `customer_contacts`
- one active project with address, scope summary, readiness state, project
  health, and a meaningful Next Move
- one completed or closeout-ready project if the active project cannot carry
  closeout, proof, service, warranty, and paid-financial evidence cleanly

### Commercial Chain

- one approved estimate to drive contract/job readiness
- one sent estimate for portal review
- one contract waiting on customer signature
- one signed contract
- one change order pending customer review
- one approved change order

### Scheduling / CrewBoard

- one unscheduled job
- one job scheduled for today
- one upcoming job
- one in-progress job
- one scheduled job missing crew assignment
- one completed job
- one active assignable person and, where useful, one vendor/subcontractor
  record for assignment visibility

### FieldTrail / Daily Job Log

- at least one Daily Job Log linked to the project/job
- at least one open blocker or issue Job Note
- at least one resolved Job Note
- at least one execution attachment/evidence placeholder if the environment
  supports safe local fixture references
- one time card or labor summary when the current model supports it

### MessageCenter / Send Trail

- one communication thread and at least one communication message
- one document delivery event for estimate, contract, invoice, or warranty
- one signature request or signature history event
- one payment request/payment event
- one portal record view where safe and already generated by real portal access

### Billing / Financial Control

- one open invoice
- one partially paid invoice
- one paid invoice
- one overdue invoice if due dates are supported in the selected environment
- one pending payment event
- one failed or voided payment event if created through safe local/test
  boundary tooling
- no Stripe charge, live Checkout, provider replay, or fake success event

### Proof Center / CloseoutTrail / Document Engine

- enough commercial, billing, field, communication, service, warranty, and
  customer-access records for proof counts
- a valid `/projects/:id/closeout-package/pdf` route for the selected project
- signed contract and paid invoice references
- field proof references through Daily Logs, Job Notes, and execution evidence
- warranty/service handoff if current records support it

### Service Center

- one open service ticket linked to customer/project and optionally original job
- one closed service ticket if supported
- one warranty document or warranty handoff linked to the project/job/service
  context where supported

### Portal Customer Window

- active `portal_access_grants` row tied to the customer/contact/user
- active `portal_project_access` row for the demo project
- shared estimate, contract, invoice, and change order records
- portal-visible Customer Next Step, Project Status, Project Timeline, Shared
  Documents, and safe print/save links

### Global Search

- the demo names should be distinct enough that global search can find the
  customer, project, estimate, contract, invoice, job, daily log, service
  ticket, and communication records without relying on UUIDs.

## 5. Existing Coverage

Existing local fixture/test patterns cover part of the dataset:

- portal user, customer, contact, project, grant, project access, estimate,
  contract, invoice, and change order
- portal review route paths for project, estimate, contract, invoice, change
  order, and unauthorized boundary
- approved-estimate, signed-ready-no-job, unscheduled-job, scheduled-job, and
  open blocker field-note states inside protected E2E specs
- sent-estimate follow-up, overdue invoice, unscheduled job, people, and
  responsibility defaults inside dashboard My Work tests
- payment pending/failure/void/success event coverage inside payment E2E lanes,
  but those are QA lanes and should not be treated as staging demo data creation

Route discovery already handles:

- protected detail discovery from index pages in `e2e/protected-route-utils.js`
- portal fixture route output through non-secret `FLOORCONNECTOR_E2E_PORTAL_*`
  path suggestions
- documented local auth recovery when fixed IDs are stale or storage state is
  mismatched

## 6. Gaps

Missing for a full staging operating-core demo:

- a single coherent owner-approved dataset that ties every demo surface to one
  recognizable customer/project story
- controlled fixture coverage for completed/closeout-ready project state
- one intentional matrix of job states for CrewBoard
- durable service ticket plus warranty document examples linked to the same
  project/job history
- safe document delivery event examples across Send Trail without provider sends
- communication thread/message examples with realistic project context
- safe portal record-view evidence without exposing invite tokens
- a clear paid/partial/open/overdue invoice set that does not call Stripe or
  fake provider completion
- staging-specific idempotency, cleanup, and tenant allowlist rules

Unsafe or not ready to seed without more design:

- real provider-backed email sends
- live or mode-unknown Stripe checkout/payment records
- provider e-sign lifecycle events
- stored generated PDFs or document library records
- portal invite tokens in logs, docs, or script output
- direct production/staging service-role mutation without explicit owner
  allowlist and dry-run proof

## 7. Recommended Demo Data Strategy

Recommended next step: **Hybrid: manual auth/org setup plus safe tenant-scoped
seed script, after a separate approved implementation prompt.**

Why:

- auth users, contractor setup, platform-admin role, provider posture, and
  portal customer credentials are environment-owner concerns and should be
  created or confirmed manually
- the canonical operating dataset is large enough that manual creation through
  the app would be slow and error-prone
- existing fixture patterns prove that a validation-first, write-gated,
  tenant-scoped script can be safe for local/test use
- staging should not inherit spec-local cleanup behavior without a clearer
  idempotency and cleanup policy

If a future seed script is approved, it must:

- require explicit `company_id`, contractor owner/admin user id or email, and
  portal customer email
- refuse production-marked environments and refuse unknown/remote targets unless
  an explicit staging allowlist is supplied
- default to dry-run and print the planned records without secrets
- be idempotent by stable demo slugs/names or provide a cleanup-safe reset plan
- create only tenant-scoped canonical records
- never create provider-side events, Stripe charges, Checkout Sessions, email
  sends, SignWell actions, webhook replays, or fake external callbacks
- never generate or print portal invite tokens
- avoid auth/RLS bypasses except for an explicitly reviewed service-role
  owner-approved fixture path
- preserve canonical lifecycle and avoid duplicate models

## 8. Safety Rules

- No production or staging writes in this pass.
- No remote SQL execution.
- No migrations.
- No env var changes.
- No secrets, provider keys, storage state, invite tokens, checkout URLs, or
  raw webhook payloads in output.
- No provider sends.
- No real or fake payment completion.
- No signature mutation.
- No portal grant widening outside explicit owner-approved fixture setup.
- No auth/RLS bypasses for demo convenience.
- No new data model.

## 9. Future Implementation Prompt

```text
Chat: Staging Demo Data Seed Script - Explicit Owner-Approved Dry Run First

Build a tenant-scoped staging demo seed script for FloorConnector.

Do not run it in write mode. Do not mutate remote data unless the owner later
provides explicit staging identifiers and approval.

Start from docs/demo/staging-demo-data-plan.md and existing fixture patterns in
scripts/portal-e2e-fixture.mjs, e2e/project-ai-cue-work-item-bridge.spec.js,
and e2e/dashboard-ui-my-work-queue-modes.spec.js.

Create a dry-run-first script that requires explicit company/user/customer
identifiers, prints a canonical record plan, refuses production-marked
environments, never prints secrets or portal invite tokens, and never calls
Stripe, Postmark, SignWell, Supabase Auth invite, webhooks, migrations, or
external providers.

Only after the dry-run behavior is reviewed should a separate task consider a
write-gated, idempotent staging seed mode.
```

## 10. Dry-Run Inventory Script

Run:

```bash
pnpm demo:data:inventory
```

or:

```bash
node scripts/demo-data-inventory.mjs
```

The script prints the required demo record checklist, fixture/script path
availability, repository counts, and an owner-action reminder. It does not read
`.env.local`, connect to Supabase, call providers, or write files/data.

## 11. Seed Script Specification

The future seed script design is specified in
[docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md).
Phase 1 of that script is implemented as a strict no-write dry-run planner:

```bash
pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

The command validates explicit identifiers and prints the planned dataset,
idempotency notes, provider safety rules, portal safety rules, and future route
validation checklist. It does not read `.env.local`, import Supabase clients,
connect to databases, write data, call providers, create auth users, generate
portal invite tokens, or create payment/signature/email events.

The spec defines required inputs, dry-run behavior, safety checks, idempotency,
record order, provider/portal boundaries, route validation, and the future
write-capable implementation boundary if the owner approves it later.

It does not authorize staging writes, remote Supabase commands, migrations,
provider actions, payment/signature mutation, portal invite-token exposure, or
auth/RLS/tenant/settings/platform-admin changes.

## 12. What Was Intentionally Not Changed

- app behavior
- schema
- migrations
- routes
- server actions
- auth/RLS
- tenant logic
- payments, payment math, Stripe behavior, or webhook behavior
- signatures or signature provider behavior
- estimate math or invoice math
- portal grants or portal permissions
- settings or platform-admin behavior
- provider configuration or external resources
