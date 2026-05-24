# Staging Demo Seed Write Mode Design

Status: Active / Planning Only
Doc Type: Demo / Design

## 1. Purpose

This document designs the future owner-approved write mode for the staging demo
seed script.

This pass does not implement write mode. It does not connect to Supabase, write
data, apply migrations, create records, create auth users, create portal
invites, call providers, create payment/signature/email/provider events, or
change app workflows.

The goal is to define the gates, refusal rules, record order, idempotency, and
post-write validation needed before any future script can safely create staging
demo data.

## 2. Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`
- `docs/demo/operating-core-demo-path.md`
- `docs/demo/staging-demo-data-plan.md`
- `docs/demo/staging-demo-seed-script-spec.md`
- `docs/design/staging-demo-seed-phase-1-dry-run-script.md`
- `docs/staging-owner-runbook.md`
- `docs/staging-deployment-readiness-audit.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/product-language.md`

## 3. Files Inspected

- `scripts/seed-staging-demo-data.mjs`
- `scripts/seed-staging-demo-data.test.mjs`
- `scripts/demo-data-inventory.mjs`
- `package.json`
- `e2e/protected-route-utils.js`
- `e2e/auth.setup.js`
- `e2e/portal-auth.setup.js`
- `e2e/platform-admin-auth.setup.js`
- `supabase/migrations`

Schema inspection was read-only and focused on existing operational tables,
foreign-key relationships, RLS posture, and provider-adjacent event tables.

## 4. Owner Approval Gates

Future write mode cannot exist until the owner supplies and confirms all of the
following:

- staging Supabase project ref or project URL
- staging app URL
- organization id for the approved staging contractor organization
- owner user id and owner email for an active owner/admin member
- portal customer email
- platform admin email, only if the platform-admin demo path is in scope
- confirmation that the target is not production and not production-like
- confirmation that provider keys are test-mode or provider-isolated
- confirmation that dry-run output was reviewed first
- confirmation that remote migrations and expected tables were checked
- exact confirmation phrase: `I APPROVE STAGING DEMO SEED WRITES`

The future script should require these values as explicit inputs. It should not
infer organization, owner, portal customer, provider posture, or target project
from the active shell environment alone.

## 5. Future Script Modes

The script should move in stages:

- `dry-run`: current default. Validates input shape and prints the planned
  dataset without env reads, Supabase connections, provider calls, or writes.
- `validate-target`: future read-only mode. Connects only after owner approval,
  verifies the target project, required tables, migrations, organization,
  owner membership, portal customer assumptions, and provider posture, then
  emits a readiness report. It must not write.
- `execute`: future write mode. Disabled until separately implemented after
  `validate-target` succeeds. It must be idempotent, tenant-scoped,
  provider-dark, token-safe, and guarded by the exact confirmation phrase.

Phase 2 is design only. Do not add these modes until a later approved
implementation slice.

## 6. Safety Checks

Future write mode must refuse when:

- target URL, Supabase ref, app URL, `APP_ENV`, `NODE_ENV`, or `VERCEL_ENV`
  looks production-like
- organization id, owner user id, owner email, or portal customer email is
  missing
- owner user id and owner email do not resolve to the same user
- owner is not an active owner/admin member of the target organization
- platform admin email is supplied but no matching platform role is present
- provider keys look live, mode-unknown, or not isolated for staging
- dry-run artifact, review token, or reviewed output reference is missing
- remote migration/table readiness has not been verified
- portal customer email is missing or not owner-approved
- command would create auth users or permanent portal credentials
- command would print raw invite tokens, secrets, auth storage, checkout URLs,
  webhook payloads, or customer credentials
- exact confirmation phrase is missing

Provider safety must fail closed. If a provider-adjacent row would look like a
real send, signature, payment, checkout, charge, or webhook event, omit it and
report the demo gap.

## 7. Data Creation Order

Future write mode should create or verify data in this order. Each group must
be scoped by organization id, use deterministic lookup keys, and print non-secret
route validation hints.

| Order | Group                                        | Source tables                                                               | Required foreign keys                              | Idempotency lookup key                                         | Safety exclusion                                                                   | Validation route                                                         |
| ----- | -------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1     | Organization/company baseline                | `companies`, `users`, `company_memberships`, optional `platform_user_roles` | existing company and user ids                      | supplied organization id plus owner user/email                 | no company creation, billing changes, activation changes, or platform role changes | `/dashboard`, `/settings`, optional `/super-admin`                       |
| 2     | People/vendors/crew                          | `people`, `vendors`, optional compliance/time tables                        | `company_id`, optional existing membership user    | organization plus deterministic demo names/emails              | no auth users, payroll, external worker system, or membership shortcut             | `/schedule`, `/jobs`, `/settings`                                        |
| 3     | Customer/contact                             | `customers`, `contacts`, `customer_contacts`                                | `company_id`, customer/contact relation            | organization plus demo customer name and portal customer email | no portal identity from customer fields alone                                      | `/customers`, `/projects`, global search                                 |
| 4     | Portal access assumptions                    | `portal_access_grants`, `portal_project_access` later only                  | customer/contact/project/user where available      | owner-approved email plus demo customer/project                | no raw invite tokens, no auth user creation                                        | `/portal`, `/portal/projects/[projectId]`                                |
| 5     | Projects                                     | `projects`                                                                  | company/customer                                   | organization plus `FloorConnector Staging Demo` project label  | no schedule-only, proof-only, service-only, or portal-only project copies          | `/projects`, `/projects/[projectId]`                                     |
| 6     | Opportunity                                  | `opportunities`                                                             | company/customer/project                           | organization plus demo opportunity title                       | no duplicate lead model                                                            | `/opportunities`, project workspace links                                |
| 7     | Estimates                                    | `estimates`, `estimate_line_items`                                          | company/customer/project                           | organization plus deterministic estimate reference/title       | no estimate math shortcuts or invoice shortcuts                                    | `/estimates/[estimateId]`, portal estimate route when shared             |
| 8     | Contracts                                    | `contracts`, `contract_signers`, contract events where safe                 | company/customer/project/estimate                  | organization plus deterministic contract title/reference       | no signature provider calls or fake signature completion                           | `/contracts/[contractId]`, portal contract route when shared             |
| 9     | Change orders                                | `change_orders`                                                             | company/project/customer/contract where applicable | organization plus deterministic change-order title/reference   | no detached change-order model                                                     | change-order workspace and portal route when shared                      |
| 10    | Jobs/schedule/assignments                    | `jobs`, `job_assignments`                                                   | company/project/customer/person/vendor             | organization plus demo job titles and schedule dates           | no dispatch table, external calendar, or route optimization                        | `/schedule`, `/jobs/[jobId]`, project workspace                          |
| 11    | Daily logs/field notes/evidence placeholders | `daily_logs`, `field_notes`, `execution_attachments` if safe                | company/project/job                                | organization plus project/job/date labels                      | no fake uploads, broken storage refs, or portal field-proof exposure               | `/daily-logs`, `/daily-logs/[dailyLogId]`, project workspace             |
| 12    | Invoices/payments/payment events             | `invoices`, `invoice_line_items`, `payments`, `payment_events` if safe      | company/customer/project/estimate/job/invoice      | organization plus deterministic invoice reference              | no Stripe PaymentIntent, Checkout, charge, webhook replay, or provider success     | `/financials`, `/invoices/[invoiceId]`, portal invoice route when shared |
| 13    | Communication threads/messages               | `communication_threads`, `communication_messages`                           | company/customer/project/source record             | organization plus project/customer subject label               | no free-floating chat, SMS/email sends, or provider messages                       | `/communications`, project workspace, global search                      |
| 14    | Document delivery placeholders               | `document_delivery_events` only where supported                             | company/subject record                             | subject plus event type/channel/demo metadata                  | no provider sent/opened/clicked/bounced events                                     | estimate, contract, invoice, warranty workspaces                         |
| 15    | Service tickets/warranty documents           | `service_tickets`, `warranty_documents`                                     | company/customer/project/job/service ticket        | organization plus deterministic ticket/document title          | no detached helpdesk or provider warranty send                                     | `/service-tickets`, project workspace, print routes                      |
| 16    | Portal project access                        | `portal_access_grants`, `portal_project_access`                             | customer/contact/user/project                      | owner-approved email plus demo project                         | demo project only, no broad account-wide exposure                                  | `/portal`, `/portal/projects/[projectId]`                                |

## 8. Idempotency Strategy

Future write mode should be create-or-find, not blind insert.

- Use deterministic labels such as `FloorConnector Staging Demo - Polymer Lab
Renovation`.
- Scope every lookup by organization id.
- Prefer existing unique fields when available, such as invoice or estimate
  references.
- For tables without unique references, match by deterministic name/title plus
  customer/project context.
- Store a safe demo marker only in existing notes, description, metadata, or
  payload fields where the table already supports it.
- Never rely on hardcoded stale UUIDs from local fixtures.
- On rerun, update only fields the script owns and only when that behavior is
  explicitly documented.
- Skip immutable event rows when a precise existing-row lookup is not possible.
- Do not include cleanup/reset in the first write mode.

Cleanup should be a later separate script with preview counts, dependency order,
demo-marker checks, and explicit owner approval.

## 9. Provider Simulation Policy

Future write mode must remain provider-dark:

- no Stripe PaymentIntent creation
- no Stripe Checkout Session creation
- no Stripe charge, refund, dispute, Customer Portal, or webhook replay
- no Postmark sends
- no SignWell provider calls
- no QuickBooks, CompanyCam, n8n, analytics, or monitoring provider calls

Allowed only when the current schema can represent it without ambiguity:

- internal/manual payment events that do not imply provider success
- internal/manual/print document delivery events that do not imply provider
  delivery proof
- internal notification events that do not trigger delivery

If the schema cannot clearly distinguish internal demo evidence from provider
truth, omit the record and document the gap.

## 10. Portal Invite / Token Policy

Portal setup stays owner-controlled:

- no raw invite token output
- no invite link printing
- no portal customer password creation
- no Supabase Auth customer creation
- pending grants only when the owner accepts that no token will be exposed
- active grants only when the portal customer auth user already exists and is
  owner-approved
- `portal_project_access` scoped to the demo project only
- active portal user setup remains an owner action unless a later safe pattern
  is approved

Portal validation must treat `/login`, access denied, or missing shared records
as blockers, not as successful QA.

## 11. Post-Write Validation Plan

After a future approved write, validation should use route discovery and
non-secret route output instead of hardcoded IDs.

Expected checks:

- route discovery finds the demo project from `/projects`
- global search finds demo customer, project, estimate, contract, invoice, job,
  daily log, service ticket, and communication records
- Project Workspace shows ProjectPulse, FieldTrail, MessageCenter,
  CloseoutTrail, Proof Center, Customer Access, and source-record links
- CrewBoard shows expected unscheduled, scheduled, upcoming, in-progress,
  missing-crew, and completed job examples where seeded
- Financials, Reports, Accounting Readiness, and source invoice routes show the
  expected rows without provider claims
- Portal Customer Window shows Customer Next Step, Project Status, Project
  Timeline, Shared Documents, and approved shared review routes
- Document Engine print routes load for estimate, contract, invoice, warranty,
  and closeout package routes where records exist

Any auth, storage-state, Supabase Auth rate-limit, portal grant, or fixture
blocker must be reported exactly.

## 12. Rollback / Cleanup Policy

The first write mode should not delete data.

Safer policy:

- idempotently create or find demo records
- update only script-owned demo fields
- archive or mark demo records only in a later owner-approved cleanup slice
- require preview counts before cleanup
- require exact target project/org confirmation before cleanup
- refuse production-like targets for cleanup

The cleanup script should be separate from seed execution so a demo run cannot
accidentally become a destructive reset.

## 13. Recommended Next Implementation Prompt

Next implementation should be read-only, not write mode:

```text
Chat: Staging Demo Seed Phase 2A - Validate Target Read Only

You are working in the FloorConnector repo.

Goal:
Add a read-only Supabase target validation mode for the staging demo seed
script.

Guardrails:
- no writes
- no migrations
- no schema changes
- no record creation
- no auth user creation
- no portal invites
- no provider calls
- no payment/signature/email/provider events
- no raw secrets, invite tokens, checkout URLs, webhook payloads, or auth
  storage output

Implement:
- a future `validate-target` mode only after owner approval of target details
- explicit inputs for staging project URL/ref, organization id, owner user
  id/email, portal customer email, optional platform admin email, and provider
  posture confirmation
- read-only checks that required tables exist
- read-only checks that the organization and owner user/membership exist
- read-only checks that portal customer assumptions can be evaluated without
  creating auth users or grants
- production-like target refusal
- non-secret target-readiness report

Validation:
- focused tests proving no writes
- focused Prettier/checks on touched files
- script help and validate-target refusal tests
- git diff --check

Commit:
docs or chore commit according to touched files.
```

Only after Phase 2A succeeds should a later prompt consider:

`Staging Demo Seed Phase 2B - Owner Approved Write Mode`

## 14. What Is Intentionally Not Implemented Yet

- write mode
- `validate-target` mode
- Supabase connection
- service-role usage
- schema changes
- migrations
- app routes
- server actions
- auth or RLS changes
- tenant logic changes
- payment, signature, email, provider, or webhook events
- portal grants or portal project access
- portal auth users or invites
- settings or platform-admin behavior
- cleanup/reset behavior
