# Financials Capability Wave v1

Status: Planning-only
Doc Type: Design / Financials Planning

## 1. Status And Intent

This document is a planning doc only. It is not implementation truth and does
not authorize payment mutations, provider behavior changes, webhook changes,
accounting integrations, financial schema changes, or duplicate financial
models.

Financials Wave v1 should define the first market-readiness financial
continuity slice over existing canonical invoices, payments, payment events,
project readiness signals, portal invoice/payment context, tax snapshots,
retainage, and SOV/progress-billing foundations. The goal is to make financial
readiness, collections, invoice/payment continuity, and payment-event trust
clear enough for market readiness while preserving the existing canonical
financial chain:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## 2. Source Docs Read

Required first read:

- `docs/developer-source-of-truth.md`

Requested docs read:

- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`
- `docs/ai-native-development-architecture.md`
- `docs/floorconnector-build-list-and-completion-timeline.md`
- `active-waves.md`
- `docs/design/operational-capability-waves-v1-coordination.md`
- `docs/design/project-workspace-capability-wave-v1.md`
- `docs/design/scheduling-capability-wave-v1.md`
- `docs/design/field-mobile-capability-wave-v1.md`
- `docs/design/portal-capability-wave-v1.md`

Additional financial docs read:

- `docs/financial-architecture.md`
- `docs/financial-audit-invoice-readiness.md`
- `docs/design/financial-control-phase-1-collections-payment-attention.md`
- `docs/design/financial-control-phase-1-qa-checkpoint.md`
- `docs/aia-progress-billing-plan.md`
- `docs/tax-reporting-foundation-plan.md`
- `docs/design/reporting-phase-1-operations-collections-visibility.md`
- `docs/catalog-to-estimate-invoice-integration-spec.md`
- `docs/lead-to-invoice-ux-audit.md`
- `docs/adr/0004-append-only-financial-events.md`

## 3. Current Implemented Baseline

Based on the source docs and inspected code, the current baseline is real but
foundation-level:

- Canonical invoices and invoice line items exist. Invoice rows carry workflow
  role, billing model, tax snapshots, retainage values, total, balance, customer,
  project, optional estimate, and optional job context.
- Invoice line items preserve billing lineage through approved estimate
  snapshots, SOV items, approved change-order snapshot items, or explicit
  invoice-only adjustments.
- Canonical payments exist as money-collected records attached to invoices.
- `payment_events` exists as immutable or effectively immutable payment
  lifecycle evidence for request, checkout, success, failure, void, and provider
  sync states.
- Portal invoice review and payment start act on canonical invoices, payments,
  and payment events. Checkout start creates or reuses canonical pending
  payment state and does not mark invoices paid without later recorded/provider
  success evidence.
- Stripe webhook reconciliation is implemented through the payment provider
  adapter boundary and canonical invoice/payment/payment-event chain, with
  synthetic E2E coverage for success, expiration, async failure, PaymentIntent
  failure, cancellation, duplicate delivery, invalid signatures, missing
  metadata, wrong payment references, and tenant mismatch cases.
- `/financials` exists as a read-only Financials Home over canonical collections
  inputs.
- `/financials/accounts-receivable` exists as a read-only AR and payment-event
  review lens over invoices, payments, and payment events.
- `/payments` exists as the contractor-side payments manager and shows recent
  payments, payment events, open balances, overdue invoices, and payment-event
  attention without turning payments into a separate financial subsystem.
- `/invoices` and `/invoices/[invoiceId]` exist as canonical invoice Manager
  Page and Invoice Workspace surfaces, including payment summary, Payment Trail,
  recording, send-link/review, PDF print/save, connected-record context, and
  edit handoff.
- Organization financial settings exist at
  `apps/web/lib/organizations/financial-settings.ts` and
  `/settings/financial`.
- Retainage and progress-billing foundations exist. SOV/progress billing stays
  tied to approved commercial lineage and creates canonical invoices with
  `billing_model = "aia_progress"`.
- Sales tax reporting is implemented as a read-only `/reports` section over
  canonical invoice tax snapshot/reporting entries. It does not file or remit
  tax.
- Project readiness and Project Workspace helpers already surface financial
  readiness context, including deposit requirements, open invoices, payments,
  progress-billing exposure, retainage held, and financial continuity.
- Portal project and invoice surfaces show customer-safe invoice/payment state,
  including payment-in-progress and remaining balance language, without owning
  billing state.

This baseline does not mean refunds, disputes, provider retry tooling,
accounting sync, tax engines, mature AIA exports, payment plans, dunning
automation, customer billing-center settings, or a duplicate ledger are
implemented.

## 4. Product Goal

Financials Wave v1 should make market-readiness financial continuity clear:

- finance users can see what is collectible now;
- project teams can understand whether financial readiness is blocking the next
  operational step;
- customers see customer-safe invoice/payment continuity through the portal;
- Payment Trail evidence is clear enough to trust pending, failed, voided, and
  successful outcomes;
- deposit and standard invoice workflow roles are understandable where already
  implemented;
- accounting, tax, AIA, and provider boundaries remain honest and future-safe.

## 5. Wave v1 Scope

Wave v1 may plan or later implement:

- Invoice/payment continuity visibility across `/financials`, `/payments`,
  `/invoices`, Invoice Workspace, Project Workspace, and portal invoice review.
- Collections/readiness queues over existing invoices, payments, payment events,
  projects, and customers.
- Payment-event review clarity for failed, voided, pending checkout, stale
  pending payment, recent success, and provider-sync evidence.
- Deposit and standard invoice workflow-role clarity where the current code
  already supports those roles.
- Project financial handoff visibility for unpaid deposits, open balances,
  progress-billing exposure, retainage held, and invoice/payment continuity.
- Portal payment continuity as read-only/customer-safe context over scoped
  canonical invoices, payments, and payment events.
- Read-model and UI decomposition that improves maintainability without
  changing financial calculations, payment state, provider behavior, or schema.
- Focused QA/test hardening for existing read-only financial helpers and
  provider-isolated payment tests.

## 6. Out Of Scope

Wave v1 explicitly excludes:

- payment provider mutation changes;
- webhook behavior changes;
- refunds or disputes;
- retry automation, dunning automation, collections reminders, or automatic
  payment requests;
- accounting integrations, QuickBooks sync, or provider posting;
- tax engine changes, tax filing, remittance, jurisdiction logic, or provider
  tax calculation;
- AIA/progress-billing overhaul, stored G702/G703 exports, draw lifecycle, or
  retainage release workflow;
- schema changes or migrations unless separately approved;
- duplicate invoice, payment, deposit, customer-financial, ledger, or
  reconciliation models;
- portal-owned billing state;
- portal-only payment records or checkout records;
- payment plans or customer billing-center settings;
- broad reports/BI warehouse work;
- package changes, dependency installs, route changes, or server-action changes
  from this planning pass.

## 7. Proposed Decomposition

Recommended future implementation slices:

1. Financial read-model audit
   - Confirm the current AR, payments, invoice, portal invoice, project
     readiness, progress-billing, and reports helpers that already derive
     financial continuity.
   - Document any duplicated derivation or naming drift before changing code.

2. Invoice/payment continuity panel extraction
   - Extract or reuse a shared read-only continuity panel for invoice/payment
     state where it reduces duplication across Financials Home, Accounts
     Receivable, Payments Manager, Invoice Workspace, and Project Workspace.
   - Keep all actions on existing Invoice Workspace, Payments Manager, or portal
     routes.

3. Collections queue/read-model helper
   - Stabilize the collections priority queue shape around invoice id, project,
     customer, balance, due signal, latest payment event, reason, and next
     action.
   - Preserve canonical invoices, payments, and payment events as the only
     source records.

4. Payment-event visibility polish
   - Clarify Payment Trail language for pending checkout, stale pending payment,
     failed, voided, provider sync, and recent success.
   - Avoid adding provider retry, webhook replay, or reconciliation mutation
     behavior.

5. Project financial readiness handoff pass
   - Align Project Workspace financial readiness handoffs with `/financials`,
     `/financials/accounts-receivable`, `/payments`, and Invoice Workspace.
   - Make deposit, open balance, retainage, and progress-billing signals route
     back to source records.

6. QA/test hardening
   - Keep unit coverage on pure financial helpers.
   - Preserve provider-isolated portal payment and webhook tests.
   - Add browser smoke only when saved contractor/portal auth and fixture data
     are healthy.

## 8. Hotspot Map

Confirmed financial route hotspots:

- `apps/web/app/(app)/financials/page.tsx`
- `apps/web/app/(app)/financials/accounts-receivable/page.tsx`
- `apps/web/app/(app)/financials/accounts-payable/page.tsx`
- `apps/web/app/(app)/financials/accounting-readiness/page.tsx`
- `apps/web/app/(app)/invoices/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/edit/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/pdf/page.tsx`
- `apps/web/app/(app)/payments/page.tsx`
- `apps/web/app/(app)/progress-billing/page.tsx`
- `apps/web/app/(app)/progress-billing/[scheduleOfValuesId]/page.tsx`
- `apps/web/app/(app)/settings/financial/page.tsx`

Confirmed financial helper hotspots:

- `apps/web/lib/financials/collections-read-model.ts`
- `apps/web/lib/financials/collections-core.ts`
- `apps/web/lib/financials/collections-summary.ts`
- `apps/web/lib/financials/collections-follow-up-intelligence.ts`
- `apps/web/lib/financials/collections-command-center.ts`
- `apps/web/lib/financials/payment-reconciliation-core.ts`
- `apps/web/lib/financials/accounting-readiness.ts`
- `apps/web/lib/financials/accounting-readiness-read-model.ts`
- `apps/web/lib/financials/accounting-export.ts`
- `apps/web/lib/invoices/data.ts`
- `apps/web/lib/invoices/actions.ts`
- `apps/web/lib/invoices/manager-read-model.ts`
- `apps/web/lib/invoices/schemas.ts`
- `apps/web/lib/payments/data.ts`
- `apps/web/lib/payments/manager-read-model.ts`
- `apps/web/lib/organizations/financial-settings.ts`
- `apps/web/lib/progress-billing/data.ts`
- `apps/web/lib/progress-billing/actions.ts`
- `apps/web/lib/progress-billing/schemas.ts`
- `apps/web/lib/financial/sov.ts`
- `apps/web/lib/dashboard/progress-billing-summary-read-model.ts`
- `apps/web/lib/projects/readiness.ts`
- `apps/web/lib/projects/operational-workspace.ts`
- `apps/web/lib/projects/timeline.ts`
- `apps/web/lib/projects/cues.ts`

Confirmed portal/payment hotspots:

- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/invoices/[invoiceId]/pdf/page.tsx`
- `apps/web/lib/portal/data.ts`
- `apps/web/lib/portal/shared-documents.ts`
- `apps/web/lib/portal/status-explanation.ts`
- `apps/web/app/api/payments/stripe/webhook/route.ts`
- `packages/integrations/src/payments/gateway.ts`

Confirmed relevant tests and E2E specs:

- `apps/web/lib/financials/collections-command-center.test.ts`
- `apps/web/lib/financials/collections-core.test.ts`
- `apps/web/lib/financials/collections-follow-up-intelligence.test.ts`
- `apps/web/lib/financials/collections-summary.test.ts`
- `apps/web/lib/financials/payment-reconciliation-core.test.ts`
- `apps/web/lib/financials/accounting-readiness.test.ts`
- `apps/web/lib/financials/accounting-export.test.ts`
- `apps/web/lib/invoices/email.test.ts`
- `e2e/portal-invoice-boundary.spec.js`
- `e2e/portal-invoice-checkout-start.spec.js`
- `e2e/stripe-webhook-reconciliation.spec.js`
- `e2e/project-ai-cue-work-item-bridge.spec.js`

Confirmed schema/history context to treat as sensitive if a future slice is
approved:

- `supabase/migrations/20260414183000_invoices_foundation.sql`
- `supabase/migrations/20260414193000_invoice_line_items_and_payments.sql`
- `supabase/migrations/20260414210000_financial_tax_retainage_sov_foundation.sql`
- `supabase/migrations/20260418150000_online_payment_foundation.sql`
- `supabase/migrations/20260418163000_gateway_payment_idempotency_foundation.sql`
- `supabase/migrations/20260418173000_pending_payment_status_foundation.sql`
- `supabase/migrations/20260420235500_progress_billing_invoice_line_item_linkage.sql`
- `supabase/migrations/20260424123000_inventory_cost_tax_foundation.sql`
- `supabase/migrations/20260425190000_invoice_source_system_phase_4.sql`
- `supabase/migrations/20260426120000_sov_change_order_snapshot_integration.sql`

## 9. Cross-Stream Coordination

Project Workspace:

- Project Workspace remains the contractor-side readiness and continuity hub.
- Financials should clarify source-linked deposit, open invoice, payment,
  retainage, and progress-billing handoffs rather than moving project readiness
  ownership into `/financials`.
- Do not create project-local financial state or duplicate project finance
  summary records.

Portal:

- Portal invoice/payment visibility must stay customer-safe, scoped through
  portal grants/project access, and read from canonical invoice/payment/event
  state.
- Portal may explain payment progress but must not own billing state, create
  portal-only payment records, expose provider diagnostics, or imply completed
  payment before canonical evidence exists.

Scheduling:

- Scheduling should consume financial readiness blockers, especially deposits,
  through existing project readiness context.
- Financials must not add schedule gates or schedule-local financial state.
- Deposit readiness language should support CrewBoard handoff without bypassing
  existing readiness enforcement.

Field/Mobile:

- Field/Mobile can link finance users to completed-job billing or invoice
  follow-up, but it should not create mobile-only billing state.
- Job completion and billing handoff should remain on canonical jobs and
  invoices.

Communications:

- Collections draft assistance and follow-up copy must remain review-first and
  record-linked.
- No automatic reminders, provider sends, autonomous payment requests, or
  customer-facing financial messages should be introduced by Financials Wave v1.

QA:

- QA should protect invoice math, payment state, Payment Trail evidence,
  provider isolation, portal visibility, tenant scope, and docs truth.
- Browser QA must distinguish real protected-route success from login redirects,
  stale auth, missing fixtures, and Supabase Auth rate limits.

## 10. Acceptance Criteria For Implementation Readiness

Financials Wave v1 is safe to implement only when:

- Every proposed summary or queue maps back to canonical invoices, payments,
  payment events, projects, customers, SOV items, approved estimate snapshots,
  approved change-order snapshots, or invoice-only lineage.
- The implementation plan names whether each surface is read-only visibility,
  existing action handoff, or an approved mutation path.
- Payment provider mutations, webhook behavior, refunds, disputes, accounting
  sync, tax engines, AIA overhaul, and schema changes are explicitly excluded
  unless a later approved slice changes scope.
- Deposit, standard invoice, progress-billing, retainage, and portal payment
  language is tied to current implementation instead of target claims.
- Portal payment visibility is customer-safe and scoped to canonical records.
- No duplicate invoice, payment, deposit, ledger, customer-financial, or
  reconciliation model is introduced.
- Tests and QA targets are named before implementation.
- Cross-stream hotspot ownership is clear for Project Workspace, Portal,
  Scheduling, Field/Mobile, Communications, and QA.

## 11. Validation Plan

For this planning-only slice:

- `git diff --check`
- `git diff --cached --check` before commit
- Prettier check or write for changed Markdown files if available

For future implementation slices:

- focused financial helper tests, for example:
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/collections-command-center.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/collections-core.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/collections-follow-up-intelligence.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/collections-summary.test.ts`
  - `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/financials/payment-reconciliation-core.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- focused E2E only when behavior changes:
  - `pnpm.cmd e2e:payments:portal`
  - `pnpm.cmd e2e:payments:webhook`
  - `pnpm.cmd e2e:payments`
- authenticated desktop and 390px smoke for `/financials`,
  `/financials/accounts-receivable`, `/payments`, `/invoices`, one Invoice
  Workspace, one portal invoice, and relevant Project Workspace financial
  handoff when saved auth and fixtures are healthy
- exact blocker reporting for stale auth, missing fixture data, provider config,
  or Supabase Auth rate limits

## 12. Recommended First Implementation Slice

Recommended first code slice: financial read-model audit and continuity-panel
extraction planning only, with no runtime change unless the audit proves a
small pure helper extraction is safe.

If code is approved afterward, the safest first implementation is:

- stabilize one shared read-only invoice/payment continuity helper over the
  existing `collections-read-model`, `collections-command-center`, and
  `payment-reconciliation-core` semantics;
- consume it first in `/financials/accounts-receivable` or `/payments`, not in
  payment actions or webhooks;
- keep links to Invoice Workspace, Project Workspace, Payments Manager, and
  portal invoice review as handoffs;
- validate with pure helper tests and `git diff --check`;
- leave schema, migrations, payment provider behavior, webhook behavior,
  accounting integrations, tax behavior, and portal billing state untouched.

This first slice improves market-readiness clarity while keeping the financial
source of truth unchanged.

## 13. Implementation Note - AR Continuity Snapshot

The first read-only implementation slice now extends the existing
`/financials/accounts-receivable` command-center helper with an operational
continuity snapshot. The snapshot derives invoice status counts and review lanes
for open balances, collection attention, deposit readiness, payment in progress,
payment-event review, and recently settled continuity from the already loaded
canonical invoices, payments, and payment events.

This implementation does not add schema, migrations, payment provider behavior,
webhook behavior, invoice/payment mutations, accounting integrations, tax logic,
portal-owned billing state, duplicate AR models, or collection-task records.

## 14. Implementation Note - Collections Priority Depth

The second read-only implementation slice refines the same
`/financials/accounts-receivable` command-center helper with derived collection
priority bands and compact latest Payment Trail signal context. Priority bands
are presentation labels only: urgent, attention, or monitoring, based on
existing invoice status, balance due, due date, workflow role, payment state,
Payment Trail events, retainage, progress-billing markers, stale activity, and
customer exposure.

The AR page now shows the latest Payment Trail signal label, timestamp, and
event count where existing immutable payment events are already loaded. This is
read-only continuity visibility. It does not add schema, payment actions,
provider calls, webhook behavior, invoice lifecycle changes, portal billing
state, accounting integration, tax behavior, reminder automation, or duplicate
financial models.

## 15. Implementation Note - Financials Command Center Continuity

The third read-only implementation slice hardens `/financials` as the Financials
Home command center by adding a compact continuity map over the already loaded
Financial Control and Collections Command Center read models. The map routes
users into Accounts Receivable, Payments, Invoices, Projects, Customers, and
Progress Billing with open balance, priority, Payment Trail, project handoff,
customer exposure, retained amount, and progress-billing snippets.

This is navigation and review clarity only. It does not add financial schema,
payment actions, checkout creation, provider calls, webhook behavior, invoice
lifecycle changes, portal-owned billing state, accounting integration, tax
behavior, readiness enforcement, duplicate ledgers, customer-financial records,
or AR-specific financial state.

## 16. Implementation Note - AR Control Room V1

The fourth read-only implementation slice upgrades
`/financials/accounts-receivable` into an AR Control Room over the same canonical
invoices, payments, and immutable `payment_events` read model. The control room
adds summary visibility for open AR balance, urgent/attention counts, active
deposit invoices, Payment Trail issues, and recent successful payment activity;
groups the priority queue into urgent, attention, and monitoring bands; and adds
a deposit continuity lane that labels deposit-role invoices as open,
in-progress, settled, or void from existing invoice, payment, and payment-event
evidence.

Payment Trail continuity now includes `payment_succeeded` event evidence where
it is already present, history counts per invoice, and invoice/customer/project
handoffs. This is review and navigation clarity only. It does not add schema,
migrations, payment creation/finalization, checkout creation, provider calls,
webhook behavior, invoice lifecycle changes, portal billing behavior,
accounting integration, tax behavior, readiness enforcement, payment automation,
collection reminders, duplicate deposit records, duplicate receivable records,
or AR-specific financial state.
