# Staging Demo Seed Script Spec

Status: Active / Phase 2A Read-Only Target Validation Implemented
Doc Type: Demo / Specification

## 1. Purpose

This spec defines the future `scripts/seed-staging-demo-data.mjs` design for a
staging/demo dataset. Phase 1 implements a strict dry-run-only local planner
and package command:

```bash
pnpm demo:data:seed:dry-run -- --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

The Phase 1 script validates required inputs and prints the planned canonical
demo dataset. It does not write remote data, run Supabase writes, apply
migrations, create schema, create seed records, call providers, create payment
or signature events, send email, expose invite tokens, read `.env.local`,
connect to databases, or change app behavior.

Phase 2A now implements read-only target validation:

```bash
pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url> --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

The implemented Phase 2A mode connects only when explicit Supabase target inputs
and an approved service-role env var name are supplied. It runs select-only
readiness checks, prints a target readiness report, hides secret values, and
never writes data, creates records, creates auth users, creates portal invites,
creates payment/signature/email events, applies migrations, or calls providers.

Future write-mode gates, refusal rules, idempotency, portal-token policy, and
the Phase 2A read-only target-validation boundary are designed in
[docs/demo/staging-demo-seed-write-mode-design.md](C:/FloorConnector/docs/demo/staging-demo-seed-write-mode-design.md).

The future script should make one coherent owner-approved demo company story
visible across the existing operating core:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

The script must preserve the current production-first rules: one canonical
record chain, tenant-scoped writes only after explicit approval, no provider
actions, no portal-only copies, no fake auth, and no shortcut around existing
auth/RLS, tenant, payment, signature, invoice, estimate, settings, or
platform-admin behavior.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/product-language.md`

## 3. Existing Scripts / Schema Inspected

Scripts and package surfaces inspected:

- `package.json`
- `scripts/README.md`
- `scripts/demo-data-inventory.mjs`
- `scripts/seed-staging-demo-data.mjs`
- `scripts/seed-staging-demo-data.test.mjs`
- `scripts/portal-e2e-fixture.mjs`
- `scripts/e2e-second-tenant-fixture.mjs`
- `scripts/staging-preflight.mjs`
- `scripts/platform-admin.mjs`
- `e2e/auth-utils.js`
- `e2e/protected-route-utils.js`
- `e2e/auth.setup.js`
- `e2e/portal-auth.setup.js`
- `e2e/platform-admin-auth.setup.js`
- `e2e/project-ai-cue-work-item-bridge.spec.js`
- `e2e/dashboard-ui-my-work-queue-modes.spec.js`
- `e2e/schedule-ready-handoff.spec.js`

Schema and helper areas inspected:

- `supabase/migrations` table creation, RLS, and event-foundation migrations
- `apps/web/lib/organizations`
- `apps/web/lib/opportunities`
- `apps/web/lib/customers`
- `apps/web/lib/contacts`
- `apps/web/lib/projects`
- `apps/web/lib/estimates`
- `apps/web/lib/contracts`
- `apps/web/lib/change-orders`
- `apps/web/lib/jobs`
- `apps/web/lib/invoices`
- `apps/web/lib/payments`
- `apps/web/lib/communications`
- `apps/web/lib/notifications`
- `apps/web/lib/document-delivery`
- `apps/web/lib/daily-logs`
- `apps/web/lib/field-notes`
- `apps/web/lib/execution-attachments`
- `apps/web/lib/service-tickets`
- `apps/web/lib/warranty-documents`
- `apps/web/lib/portal-access`
- `apps/web/lib/portal`
- `apps/web/lib/people`
- `apps/web/lib/vendors`
- `apps/web/lib/compliance`
- `apps/web/lib/time`
- `apps/web/lib/platform-admin`

Useful existing safety patterns:

- `scripts/demo-data-inventory.mjs` is local-only and dry-run only; it does not
  read env, connect to Supabase, call providers, or write data.
- `scripts/portal-e2e-fixture.mjs` validates by default and writes only with
  `--write` plus `FLOORCONNECTOR_ALLOW_E2E_FIXTURE_WRITE=1`; it refuses
  production-marked environments.
- `scripts/e2e-second-tenant-fixture.mjs` uses the same write gate for
  disposable local payment-boundary records.
- `scripts/platform-admin.mjs` uses service-role access only for a narrow,
  explicit platform role assignment action against existing users.
- Protected E2E helpers prefer route discovery from index pages over stale fixed
  IDs.

## 4. Required Inputs

The future script must require explicit inputs and must never infer the target
tenant from the active local user alone.

Required inputs:

- `organization_id`: canonical `companies.id` for the staging demo tenant.
- `owner_user_id`: canonical `users.id` for the owner/admin operator.
- `owner_email`: email for the same owner/admin operator.
- `portal_customer_email`: owner-approved portal customer email.
- `platform_admin_email`: required only when the platform-admin demo path is in
  scope.
- `staging_confirmation`: a long confirmation string, for example
  `I understand this targets the owner-approved staging demo tenant only`.
- `dry_run`: defaults to true and must be explicit in command output.

Required environment names for read-only target validation and a future
write-capable implementation:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ENV`
- `NODE_ENV`
- `VERCEL_ENV`

Phase 2A target validation may read the explicitly named service-role env var
value after the owner supplies the target URL and required ids. It must never
print the value. A later owner-approved write mode may read values but must
never print secrets.

## 4A. Phase 2A Validate Target Mode

Implemented package command:

```bash
pnpm demo:data:seed:validate-target -- --supabase-url <staging-supabase-url> --service-role-key-env SUPABASE_SERVICE_ROLE_KEY --organization-id <uuid> --owner-user-id <uuid> --owner-email <owner@example.test> --portal-customer-email <customer@example.test> --environment staging
```

Read-only checks:

- required tables are queryable through select-only checks
- target organization exists in `companies`
- owner user id/email exists in `users`
- owner membership exists in `company_memberships`
- portal customer canonical user posture can be checked by email
- portal access grant posture can be checked by organization/email
- optional platform-admin user/role posture can be checked when supplied

The mode reports migration alignment as an owner action because migration state
is not safely verified through the PostgREST client. It exits nonzero when
required inputs are missing, the target looks production-like, the approved
service-role env var is missing, or required readiness checks fail.

## 5. Safety Checks

The future script must refuse to proceed when:

- `organization_id` is missing.
- `owner_user_id` or `owner_email` is missing.
- `owner_user_id` does not resolve to the provided `owner_email`.
- the owner user is not an active member of the target organization.
- `platform_admin_email` is provided but no matching platform role exists.
- the portal customer email is missing or not owner-approved.
- `NODE_ENV`, `APP_ENV`, or `VERCEL_ENV` marks the target as production.
- `NEXT_PUBLIC_SUPABASE_URL` appears to point at a production project or a known
  production hostname.
- `dry_run` is disabled without the long confirmation phrase.
- `SUPABASE_SERVICE_ROLE_KEY` is present while the run is not explicitly scoped
  to the owner-approved staging tenant.
- live/provider-looking keys are detectable, including `sk_live_` Stripe keys
  or live/mode-unknown payment, signature, or email provider configuration.
- the command would create auth users, invite users, apply migrations, or call
  provider SDKs.
- the command would print secrets, storage state, invite tokens, raw webhook
  payloads, checkout URLs, provider IDs from real provider actions, or customer
  credentials.

Dry-run output must include:

- target organization id and non-secret display name, if loaded
- owner user id/email confirmation
- portal customer email redacted enough for logs when appropriate
- proposed record groups and counts
- planned lookup keys
- records that already appear to exist
- records that would be inserted, updated, skipped, or left manual
- warnings for provider-adjacent or portal-adjacent omissions

## 6. Dataset Map

The ideal dataset should be mapped into ordered groups. Write mode must remain a
future explicitly approved phase; this section defines only the target plan.

### Organization / Company Baseline

Use the owner-controlled existing organization. Do not create a company by
default. Confirm:

- `companies`
- `company_memberships`
- `users`
- optional `platform_user_roles`

The script may report missing company profile or owner membership readiness but
must leave setup, billing, activation, settings, and platform-admin behavior
unchanged.

### People / Vendors / Crew

Create or find only tenant-scoped operational records:

- one internal estimator/project manager in `people`
- one crew lead in `people`
- one crew member in `people`
- one subcontractor or vendor in `vendors`
- optional compliance examples in `compliance_records`
- optional time examples in `time_punch_events` / `time_cards`

Avoid creating app auth users for crew. Link `people.membership_user_id` only
when the owner has supplied an existing canonical user and the repo pattern
supports it safely.

### Customer / Contact

Create or find:

- one `customers` row with deterministic demo name
- one `contacts` row for the portal customer person
- one `customer_contacts` row marked primary where the schema supports it

Do not treat `customers.email` as the portal identity. Portal identity must stay
Supabase Auth plus canonical customer/contact/project access.

### Portal Access / Customer User Linkage Assumptions

The owner must create or confirm the portal customer auth user separately. The
future script may verify and, in a later approved write mode, attach:

- `portal_access_grants`
- `portal_project_access`

No raw invite token may be generated, printed, stored in docs, or logged.
Pending or active grants must use the owner-approved email only.

### Projects

Create or find:

- one active operating-core project with distinct demo name
- optional closeout-ready project only if one active project cannot safely carry
  closeout, proof, service, warranty, and paid-financial evidence together

Use `projects` as the hub. Do not create schedule-only, portal-only, service-only,
or proof-only project copies.

### Opportunity / Requirements

Create or find:

- one `opportunities` row connected to the customer/project story
- optional requirement/site-assessment notes only in fields already supported by
  the current schema

Do not create a parallel lead/customer/project model. Opportunity remains the
canonical pre-customer commercial record.

### Estimates

Create or find:

- one approved estimate for downstream contract/job readiness
- one sent estimate for portal/customer review
- `estimate_line_items` as immutable current estimate rows

Do not mutate estimate math shortcuts, bypass catalog snapshot behavior, or
write directly to invoices from live estimate rows.

### Contracts

Create or find:

- one sent contract waiting on customer signature
- one signed contract with `contract_signers` and only safe internal/manual
  signature history if explicitly allowed

Avoid real signature provider calls. If the existing contract workflow requires
signature mutation to be truthful, leave the signed-contract state out of Phase
1 and document the gap rather than faking external signature completion.

### Change Orders

Create or find:

- one sent change order pending portal review
- one approved change order when existing schema/workflow supports it safely

Keep change orders attached to the same project/contract/invoice chain.

### Jobs / Schedule / Assignments

Create or find:

- one unscheduled job
- one job scheduled for today
- one upcoming job
- one in-progress job
- one job missing crew assignment
- one completed job
- `job_assignments` rows for selected people/vendor assignments

Use canonical `jobs` and `job_assignments`. Do not create schedule-only rows or
drag/drop dispatch assumptions.

### Daily Logs / Field Notes / Execution Attachments

Create or find:

- one `daily_logs` row tied to the project/job
- one open blocker `field_notes` row
- one resolved `field_notes` row
- optional `execution_attachments` placeholders only when storage/file references
  can be represented without fake uploads or broken links

Do not expose contractor-only FieldTrail or internal Job Notes to portal users.

### Invoices / Payments / Payment Events

Create or find:

- one open invoice
- one partially paid invoice
- one paid invoice
- one overdue invoice if supported by due dates
- one manual/internal pending payment event only if safe
- one failed/voided demo event only if the existing schema allows a synthetic
  internal source without implying a provider action

No Stripe PaymentIntent, Checkout Session, charge, webhook replay, live payment,
provider success, or fake provider callback may be created. If a payment row or
event would imply real provider completion, omit it and document the demo gap.

### Communication Threads / Messages

Create or find:

- one `communication_threads` row tied to the project and a canonical subject
- one or more `communication_messages` rows with safe internal/customer wording

Do not create free-floating chat or provider messages. Keep messages attached to
project/customer/source records.

### Notifications / Notification Events

Create or find only if needed for existing summaries:

- `notification_events`
- optional `notifications`
- optional `notification_deliveries`

Avoid provider send claims. For email/SMS delivery rows, use only safe internal
or pending/demo state if the current model supports it without provider
side-effects.

### Document Delivery / Send Events

Create or find only evidence rows that the current model safely supports:

- `document_delivery_events` for `estimate`, `invoice`, `contract`, or
  `warranty_document` subjects
- channel `internal`, `manual`, or `print` for synthetic owner-approved evidence

Do not use provider-backed `sent`, `opened`, `clicked`, `bounced`, or failed
events unless they were created by a real approved test-provider lane. Contract
document delivery support is manual evidence only; signature workflow remains
owned by contract-specific records.

### Service Tickets / Warranty Documents

Create or find:

- one open `service_tickets` row tied to the customer/project and optionally an
  original job
- one closed service ticket if supported by the current state model
- one `warranty_documents` row tied to customer/project/job/service context

Do not create detached helpdesk records, portal service requests, automated
claims, provider warranty sends, or legal warranty determinations.

### Portal Access / Project Access

Create or find:

- one customer-scoped `portal_access_grants` row for the owner-approved portal
  email/user
- one `portal_project_access` row scoped to the demo project only

Do not widen portal access across all projects. Do not print invite tokens.

## 7. Record Creation Order

Future write mode should use this order so foreign keys and route validation
stay coherent:

1. Validate environment, explicit ids, owner membership, platform-admin
   optional role, and dry-run confirmation.
2. Load organization/company baseline and refuse production-like targets.
3. Load or verify owner user and active organization membership.
4. Load or verify portal customer user by owner-approved email.
5. Create or find people, vendor, and optional compliance/time support records.
6. Create or find customer, contact, and customer-contact relationship.
7. Create or find active project and optional closeout-ready project.
8. Create or find opportunity/requirements.
9. Create or find estimates and estimate line items.
10. Create or find contracts and contract signers; omit unsafe signature
    mutation.
11. Create or find change orders.
12. Create or find jobs and job assignments.
13. Create or find daily logs, field notes, and safe attachment placeholders.
14. Create or find invoices and invoice line items.
15. Create or find manual/internal payments and payment events only where safe.
16. Create or find communication threads and messages.
17. Create or find notification and delivery evidence rows only where safe.
18. Create or find service tickets and warranty documents.
19. Create or find portal access grant and project access for the demo project.
20. Run route discovery validation and print non-secret route paths.

## 8. Idempotency Strategy

Prefer stable demo labels over hardcoded generated UUIDs. The future script
should avoid caller-provided UUIDs unless existing repo patterns explicitly
support them for that table.

Stable demo key convention:

- prefix demo records with `FloorConnector Staging Demo`
- include deterministic role suffixes, for example `FloorConnector Staging Demo
  - Polymer Lab Renovation`
- store a stable marker in `notes`, `description`, `scope_change_notes`,
  `event_note`, `payload`, or `metadata` fields where those fields already
  exist and can safely hold non-secret demo metadata
- use `companies.slug` only for existing company identity, not for new demo
  record generation

Lookup strategy:

- always scope lookup by `company_id`
- prefer table-specific unique fields when present, such as
  `companies.slug`, estimate/invoice `reference_number`, or unique
  portal/project constraints
- otherwise match by deterministic names/titles plus project/customer context
- for event rows, match by subject, event type, actor type, channel, and a
  safe demo marker in `payload` or `metadata` when supported
- for immutable events without metadata, avoid creating repeat events on rerun
  unless a precise lookup is possible

Cleanup strategy:

- Phase 1 should be dry-run only.
- Later write mode should be idempotent by create-or-find, not destructive
  cleanup.
- Any reset/delete mode must be a separate future prompt with owner approval,
  explicit demo markers, preview counts, dependency order, and production
  refusal.

## 9. Provider Safety Rules

The future script must remain provider-dark:

- no Stripe PaymentIntent creation
- no Stripe Checkout Session creation
- no Stripe charges, refunds, disputes, webhook replay, or Customer Portal
  sessions
- no Postmark sends
- no SignWell provider calls
- no QuickBooks, CompanyCam, n8n, analytics, or monitoring provider calls
- no provider webhook payload creation except synthetic local test payloads in
  existing E2E lanes, outside this seed script

Allowed only if current schema supports it safely:

- manual/internal `document_delivery_events` with `channel` as `internal`,
  `manual`, or `print`
- manual/internal `payment_events` that do not set provider references and do
  not imply real provider success
- system/internal `notification_events` where they do not trigger delivery

If provider-adjacent fake events would be ambiguous, omit them. A missing demo
row is safer than a misleading provider history.

## 10. Portal Safety Rules

Portal setup must stay owner-approved and customer-safe:

- portal customer Supabase Auth account setup is owner-controlled first
- `portal_customer_email` must be explicit
- portal grants must attach to canonical `customers`, `contacts`,
  `customer_contacts`, `portal_access_grants`, and `portal_project_access`
- project access must be scoped to the demo project only
- pending grants may be created only if the owner accepts the no-token output
  model
- active grants may be attached only to a verified existing user/email
- raw invite tokens must never be printed, returned, persisted in docs, or
  logged
- if an invite link is needed, stop and instruct owner action through the
  existing app flow
- portal route validation must use authenticated portal storage state and must
  report `/login` redirects or access denied as blockers, not as pass results

## 11. Validation Plan

After a future approved seed, validation should use route discovery instead of
hardcoded IDs.

Expected checks:

- global search finds the demo customer, project, estimate, contract, invoice,
  job, daily log, service ticket, and communication records
- `/projects` discovers the demo project
- `/projects/[projectId]` shows ProjectPulse, FieldTrail, MessageCenter,
  CloseoutTrail, Proof Center, Customer Access, source-record links, and the
  closeout package route link where applicable
- `/schedule` / CrewBoard shows unscheduled, scheduled, upcoming, in-progress,
  missing-crew, and completed job examples where included
- `/reports`, `/financials`, `/financials/accounts-receivable`, and
  `/financials/accounting-readiness` show financial rows and source-record links
- `/portal` and `/portal/projects/[projectId]` show Customer Next Step, Project
  Status, Project Timeline, Shared Documents, and existing review routes
- portal estimate, contract, invoice, change-order, and warranty document routes
  load only when the seeded records are intentionally shared
- Document Engine print routes load for estimates, contracts, invoices,
  warranty documents, and `/projects/[projectId]/closeout-package/pdf` where
  records exist

Validation commands for the future implementation prompt:

```bash
git status --short --branch
pnpm demo:data:inventory
pnpm exec playwright test --project=chromium-public e2e/marketing-login.spec.js
pnpm e2e:auth
pnpm e2e:portal-auth
pnpm e2e:portal
```

Protected and portal route checks may be blocked by auth, storage-state, or
fixture availability. Report those blockers honestly and do not loosen auth,
RLS, portal grants, or tenant checks to make a demo pass.

## 12. Future Implementation Prompt

```text
Chat: Staging Demo Seed Phase 1 - Dry Run Script

You are working in the FloorConnector repo.

Goal:
Implement the first dry-run-only version of the future staging demo seed script.

Start from:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/demo/staging-demo-data-plan.md
- docs/demo/staging-demo-seed-script-spec.md
- scripts/demo-data-inventory.mjs
- scripts/portal-e2e-fixture.mjs
- scripts/e2e-second-tenant-fixture.mjs
- docs/staging-owner-runbook.md
- docs/local-auth-qa-recovery.md

Hard guardrails:
- dry-run only in this phase
- no Supabase writes
- no migrations
- no schema changes
- no seed data creation
- no provider calls
- no auth/RLS, tenant, portal grant, payment, signature, estimate math, invoice
  math, settings, or platform-admin behavior changes
- no secrets or invite tokens in output
- no package script that sounds like a real write seed unless it is clearly
  dry-run/no-write

Implement:
- `scripts/seed-staging-demo-data.mjs` as a dry-run planner only
- required explicit inputs:
  - `--organization-id`
  - `--owner-user-id`
  - `--owner-email`
  - `--portal-customer-email`
  - optional `--platform-admin-email`
  - `--confirm-staging-demo "<long phrase>"`
  - `--dry-run`, defaulting true
- env/prod safety guard that refuses production-marked environments
- provider posture warnings for live-looking keys without printing values
- no-write dataset plan output grouped by canonical record family
- idempotency lookup plan output by table/group
- route discovery validation plan output
- docs update explaining usage and preserved guardrails
- focused tests or script smoke checks that prove no-write behavior

Validation:
- focused Prettier on touched files
- `node scripts/seed-staging-demo-data.mjs --help`
- dry-run command with fake UUID-like placeholders should fail before any
  Supabase write and print no secrets
- `git diff --check`
- `git status --short --branch`

Commit:
If validation passes, commit with:
`chore: add staging demo seed dry run`

Final report:
- files changed
- dry-run behavior
- safety checks
- validation results
- confirmation no writes/providers/schema/auth/RLS/tenant/payment/signature/
  portal/settings/platform-admin behavior changed
```

## 13. What Was Intentionally Not Changed

- app behavior
- scripts
- package scripts
- schema
- migrations
- routes
- server actions
- auth/RLS
- tenant logic
- portal grants or portal project access behavior
- invite token creation or output
- payments, payment math, Stripe behavior, or webhook behavior
- signatures or signature provider behavior
- estimate math or invoice math
- settings or platform-admin behavior
- provider configuration or external resources
- remote Supabase data
