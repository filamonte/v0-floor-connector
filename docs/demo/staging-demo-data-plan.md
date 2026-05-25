# Staging Demo Data Plan

Status: Active
Doc Type: Demo / Runbook

## 1. Purpose

This plan defines the live workflow coverage needed to show FloorConnector's
current operating core without relying on stale hardcoded IDs, fake records, or
local database assumptions. It is a planning and readiness artifact only.

FloorConnector uses remote Supabase-backed canonical records for demos and QA.
Golden-path coverage should be created through the real app workflows and
verified against that live remote environment.

This plan does not authorize fake/demo data inserts, local database seed
workflows, production or staging writes, remote Supabase mutation commands,
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

Current useful patterns and boundaries:

- `scripts/portal-e2e-fixture.mjs` validates by default and writes only with
  `--write` plus `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`. Treat this as an
  E2E test harness, not the normal demo-data workflow. Do not use it to seed
  fake records into the live remote environment.
- `scripts/e2e-second-tenant-fixture.mjs` validates by default and writes only
  with the same explicit fixture-write guard. It creates a disposable tenant-B
  invoice/payment chain for cross-tenant payment boundary tests, not demo use.
- `e2e/protected-route-utils.js` discovers real protected detail links from
  index pages and skips invalid/stale detail records.
- `e2e/project-ai-cue-work-item-bridge.spec.js` has spec-scoped fixture patterns for
  approved-estimate-missing-contract, signed-ready-no-job, unscheduled-job,
  scheduled-job, and open blocker field-note states.
- `e2e/dashboard-ui-my-work-queue-modes.spec.js` has spec-scoped fixture patterns for
  sent estimate follow-up, overdue invoice, unscheduled job, people, and
  responsibility defaults.

Unsafe as a live/demo strategy:

- fake/demo record insertion outside the app workflow
- spec-scoped fixture creation that deletes or resets data without an
  owner-approved cleanup policy
- service-role scripts against remote Supabase without an explicit environment,
  tenant allowlist, idempotency, cleanup policy, and owner approval
- using provider test scripts as demo data creation
- hardcoding UUIDs from one environment into docs or scripts

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
  supports safe existing evidence references
- one time card or labor summary when the current model supports it

### MessageCenter / Send Trail

- one communication thread and at least one communication message
- one document delivery event for estimate, contract, invoice, or warranty
- one signature request or signature history event
- one payment request/payment event
- one portal record view where safe and already generated by real portal access

### Project Command Timeline

- one coherent project story with linked records that can populate the Project
  Command Timeline's `Needs attention`, `Ready to move`, and `Recent movement`
  groups
- at minimum: estimate, contract/signature state, invoice/payment state,
  job/schedule state, Daily Log, open blocker or issue Job Note, document/proof
  readiness signal, portal visibility signal, and communication or delivery
  evidence where safely available
- timeline coverage must remain derived from canonical records and existing
  read models; do not seed a separate activity table or project-history model

### Billing / Financial Control

- one open invoice
- one partially paid invoice
- one paid invoice
- one overdue invoice if due dates are supported in the selected environment
- one pending payment event
- one failed or voided payment event if created through approved test
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

### One-Project Golden Path Readiness Matrix

The strongest current demo target is one recognizable project that can exercise
the newer operational stack without making users hunt across unrelated fixtures.
That project should have enough canonical records to prove:

- Dashboard Operational Digest source signals from project, financial,
  schedule, field, and communication context
- Project Command Timeline coverage for needs-attention, ready-to-move, and
  recent movement items
- Project Copilot summary and at least one review-first draft action
- CrewBoard readiness and scheduling context on canonical jobs and assignments
- Accounts Receivable collections intelligence from canonical invoice/payment
  state
- Document Readiness on estimate, contract, and invoice workspaces
- Communications handoff plus customer send-readiness for at least one
  estimate-, contract-, or invoice-related draft
- Daily Log, open blocker/issue note, resolved note, and field evidence where
  fixture-safe
- portal-safe customer project status plus portal estimate, contract, and
  invoice review routes

This is a read-model and QA target, not a new data model. The project does not
need separate activity records, portal-only copies, provider events, or AI-owned
truth. If one project cannot safely carry every state, a secondary companion
project may cover closeout/paid-state evidence, but the main demo should still
center on one customer/project story.

## 5. Existing Coverage

Existing implementation and test patterns prove that the app can represent much
of the dataset when real records exist:

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
- Project Command Timeline, Document Readiness, Customer Communication Send
  Readiness, Collections Follow-Up Intelligence, and AI Operational Copilot are
  implemented and tested, but current live data discovery does not guarantee
  that one project lights all of them up together

Route discovery already handles:

- protected detail discovery from index pages in `e2e/protected-route-utils.js`
- portal route output through non-secret `FLOORCONNECTOR_E2E_PORTAL_*` path
  suggestions where the E2E harness is intentionally used
- documented saved-auth recovery when fixed IDs are stale or storage state is
  mismatched

## 6. Gaps

Missing for a full live operating-core demo:

- a single coherent owner-approved dataset that ties every demo surface to one
  recognizable customer/project story
- a document-specific customer-bound communication handoff that reliably shows
  send-readiness for an estimate, contract, or invoice
- guaranteed estimate, contract, and invoice detail paths in the active remote
  contractor data
- one project with enough linked records for the Project Command Timeline to
  show the full lifecycle story instead of a minimal valid project
- controlled fixture coverage for completed/closeout-ready project state
- one intentional matrix of job states for CrewBoard
- durable service ticket plus warranty document examples linked to the same
  project/job history
- safe document delivery event examples across Send Trail without provider sends
- communication thread/message examples with realistic project context
- safe portal record-view evidence without exposing invite tokens
- a clear paid/partial/open/overdue invoice set that does not call Stripe or
  fake provider completion
- any direct remote data setup policy beyond normal app workflows

Unsafe or not ready to seed without more design:

- real provider-backed email sends
- live or mode-unknown Stripe checkout/payment records
- provider e-sign lifecycle events
- stored generated PDFs or document library records
- portal invite tokens in logs, docs, or script output
- direct production/staging service-role mutation without explicit owner
  allowlist and dry-run proof

## 7. Recommended Demo Data Strategy

Recommended next step: **treat demo readiness as live workflow readiness over
remote Supabase-backed canonical records.**

Why:

- auth users, contractor setup, platform-admin role, provider posture, and
  portal customer credentials are environment-owner concerns and should be
  created or confirmed manually
- the canonical operating dataset should be created through real app workflows
  so tenant behavior, portal access, readiness, signatures, payments,
  communications, and audit state stay truthful
- existing fixture patterns are useful for E2E tests, but they are not the
  normal demo data workflow
- direct remote mutation should not become the answer to missing demo coverage
- the current immediate need is not broader product behavior; it is identifying
  which live records/workflows need to be completed through the app

Decision matrix:

| Path                             | Recommendation     | Why                                                                                                                                       |
| -------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Live workflow checklist          | Recommended now    | Keeps golden-path coverage grounded in real remote Supabase records and app workflows.                                                    |
| No-write readiness inventory     | Available now      | Gives repeatable visibility into needed golden-path surfaces without env reads, Supabase access, provider calls, or data writes.          |
| E2E fixture helpers              | Test harness only  | Useful for targeted automated tests, but not a normal demo-data workflow and not a source of live demo truth.                             |
| Direct remote write-mode seeding | Not current policy | Would require separate owner approval, target validation, tenant allowlist, idempotency, cleanup policy, and strict no-provider behavior. |

The live workflow policy is:

- create customers, projects, estimates, contracts, invoices, jobs, Daily Logs,
  communications, portal grants, and related records through the real app
  workflows
- use route discovery and explicit saved route overrides for stable QA links
- record missing coverage as workflow/data setup gaps, not product failures and
  not permission to insert fake rows
- keep payment/signature/provider evidence tied to real implemented flows or
  approved test-mode QA lanes
- do not seed fake/demo records into the live database

## 8. Safety Rules

- No fake/demo record seeding.
- No direct remote SQL execution for demo coverage.
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

## 9. Live Workflow Setup Guidance

Use this checklist when preparing a live demo or QA walkthrough:

1. Select the remote Supabase project and tenant intentionally.
2. Confirm contractor and portal auth through the real app.
3. Create or complete missing records through the app workflow chain.
4. Use route discovery or explicit safe route overrides to avoid stale UUIDs.
5. Record any missing golden-path coverage as a real setup gap.
6. Do not use service-role mutation as a substitute for app workflows.

## 10. Dry-Run Inventory Script

Run:

```bash
pnpm demo:data:inventory
```

or:

```bash
node scripts/demo-data-inventory.mjs
```

The script prints the required live workflow checklist, existing QA signal
availability, golden-path surface readiness, known data gaps, repository counts,
and an owner-action reminder. It does not read `.env.local`, connect to
Supabase, call providers, or write files/data.

## 11. Legacy No-Write Staging Planner

The historical no-write staging planner is specified in
[docs/demo/staging-demo-seed-script-spec.md](C:/FloorConnector/docs/demo/staging-demo-seed-script-spec.md).
Phase 1 of that script is implemented as a strict no-write dry-run planner:

```bash
pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

Treat that command as a legacy guardrail/planner only, not a seed workflow. It
does not authorize staging writes, remote Supabase mutation commands,
migrations, provider actions, payment/signature mutation, portal invite-token
exposure, or auth/RLS/tenant/settings/platform-admin changes.

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
