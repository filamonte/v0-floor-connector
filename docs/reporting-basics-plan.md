# Reporting Basics Plan

Status: Phase B planning document for the smallest useful internal-beta reporting layer.

This plan does not authorize app code, schema changes, reporting tables, workflow mutation, or broad analytics work by itself. It defines the first reporting pass that should help internal beta users understand current work without creating a disconnected analytics system.

Primary references:
- [docs/phase-a-completion-and-phase-b-readiness.md](C:/FloorConnector/docs/phase-a-completion-and-phase-b-readiness.md)
- [docs/full-build-and-launch-plan.md](C:/FloorConnector/docs/full-build-and-launch-plan.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)

Canonical lifecycle remains:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Reporting Principles

- Reports must read canonical records only.
- Reports must use tenant-scoped server-side loaders or server actions.
- Reports must not mutate business records.
- Reports must not create duplicate reporting truth.
- Reports must not imply financial truth outside canonical invoices, invoice line items, payments, and payment events.
- The first pass should calculate summaries at request time from canonical rows.
- Do not create reporting snapshot tables in the first pass unless a measured performance problem proves they are necessary.
- Dashboard cards should remain operational attention cues, not a separate analytics product.
- Dedicated reports should explain where each number comes from and link back to canonical record workspaces.

## 1. Existing Reporting And Partial Reporting

Reporting is currently partial and distributed across operational surfaces.

Implemented or partially available today:

- Dashboard command center:
  - operational metrics and queues over leads, estimates, contracts, projects, schedule/jobs, invoices, payments, notifications, and communication activity
  - useful as a start-here surface, but not a dedicated reports module
- `/financials`:
  - summary-first financial control panel
  - overdue invoices
  - recent payments
  - open receivables
  - routes into invoices, payments, and progress billing
  - reads the existing canonical invoice and payment chain rather than a finance shadow model
- `/invoices`:
  - billing manager over canonical invoices and invoice line items
  - invoice status, balances, retainage-aware totals, tax-aware totals, and lineage context
- `/payments`:
  - payment manager over canonical payments and immutable payment events
  - useful for posted payment review, failed/void activity, and open collections context
- `/progress-billing`:
  - schedule-of-values and progress billing continuity from approved estimate snapshots and invoice lineage
- `/projects` and project detail:
  - readiness blockers, next actions, linked estimate/contract/job/invoice/payment context, and scheduling readiness
- `/schedule` and `/jobs`:
  - operational job state, crew assignment, scheduled work, and production readiness visibility
- Notifications and `/communications`:
  - communication and notification activity exist as canonical operational records, but are not yet reporting outputs
- Tax foundation:
  - invoice calculations and tax snapshots are present, but tax reporting is not yet a complete reporting workflow

Not complete today:

- no full reports module
- no consolidated reporting home
- no durable report definitions
- no CSV/export reporting flow
- no advanced filterable analytics catalog
- no accounting sync or external reconciliation reporting
- no reporting-specific aggregate tables

## 2. First Internal-Beta Reports

The first reports should be narrow, read-only, and useful for a contractor or internal tester running the core workflow.

### Lead Pipeline Summary

Purpose:
- show how many opportunities are moving through the pre-sale pipeline
- highlight stalled leads and next follow-up work

Canonical source records:
- `opportunities`
- optional linked `customers`
- optional linked `projects`
- optional linked `appointments`

Recommended measures:
- count by opportunity status
- active/open opportunity count
- won/lost/converted count
- opportunities with site assessment scheduled or completed
- stale opportunities by `updated_at` or last meaningful workflow date
- next scheduled assessment or follow-up where appointment linkage exists

Guardrails:
- this is not marketing attribution
- this should not create or promote customers/projects
- source, campaign, and ROI analysis wait for the future website/intake layer

### Estimate Status / Approval Summary

Purpose:
- show estimate pipeline health and customer decision status
- help contractors find draft estimates, sent estimates awaiting action, and approved estimates ready for downstream work

Canonical source records:
- `estimates`
- `estimate_line_items`
- `estimate_customer_events`
- approved estimate commercial snapshots where downstream-approved value is needed
- linked `customers`
- linked `projects`

Recommended measures:
- count and value by estimate status
- draft estimates needing completion
- sent estimates awaiting approval
- approved estimates within selected date range
- rejected estimates or estimates needing revision
- aging since sent or updated
- approved estimate value from the approved snapshot when the report is about downstream commercial baseline

Guardrails:
- live `estimate_line_items` are estimate-authoring truth only
- downstream billing truth must continue to use approved snapshots, SOV rows, change-order snapshots, invoice line items, invoices, and payments
- do not infer invoice revenue from estimate totals

### Invoice Aging / Open Balances

Purpose:
- show current receivables and invoices needing follow-up
- support internal beta financial review without external accounting sync

Canonical source records:
- `invoices`
- `invoice_line_items`
- `payments`
- `payment_events`
- linked `customers`
- linked `projects`
- optional linked `jobs`

Recommended measures:
- open invoice balance
- open receivables total
- overdue invoice count and value
- aging buckets:
  - current
  - 1-30 days
  - 31-60 days
  - 61-90 days
  - over 90 days
- draft, sent, partially paid, and paid invoice counts
- deposit invoice visibility where invoice metadata/status already supports it

Guardrails:
- invoices and payments are the financial source of truth
- payment requests or checkout-start events are not collected revenue
- do not introduce external accounting reconciliation in this pass
- do not create a second receivables ledger

### Payment Activity Summary

Purpose:
- show recent collections and payment workflow activity
- help testers verify recorded payments and payment events reconcile to invoice status

Canonical source records:
- `payments`
- `payment_events`
- linked `invoices`
- linked `customers`
- linked `projects`

Recommended measures:
- recorded payment total by date range
- count and value by payment status
- recent successful/recorded payments
- failed, voided, pending, and checkout-start activity as operational events
- payment source or channel where canonical data already records it
- invoices still open after partial payment

Guardrails:
- only successful or recorded canonical payments count as collected revenue
- payment events are activity history, not a replacement payment ledger
- do not add gateway reconciliation or provider sync in this pass

### Project Readiness Blockers

Purpose:
- show which projects cannot move forward and why
- support the project-centered operating model without making another workflow chain

Canonical source records:
- `projects`
- linked `opportunities`
- linked `estimates`
- linked `contracts`
- linked `change_orders`
- linked `jobs`
- linked `invoices`
- linked `payments`
- existing project readiness fields and readiness utilities where available

Recommended measures:
- projects blocked by missing estimate
- draft/sent estimate blockers
- approved estimate with missing contract
- contract signature readiness blockers
- deposit or financing readiness blockers where existing settings and project readiness fields support it
- ready-to-schedule projects
- scheduled/in-progress/completed job counts
- completed jobs without a related invoice where the canonical links allow it
- open invoice/payment follow-up blockers

Guardrails:
- project readiness is an operational guide, not a financial statement
- do not create project-only copies of estimate, contract, job, invoice, or payment status
- use existing canonical readiness logic where possible so project detail and reports do not drift

## 3. Canonical Source Record Map

| Report | Primary canonical records | Supporting canonical records | Explicit non-sources |
| --- | --- | --- | --- |
| Lead pipeline summary | `opportunities` | `customers`, `projects`, `appointments` | marketing attribution tables, website-only leads |
| Estimate status / approval summary | `estimates`, `estimate_line_items`, approved estimate snapshots | `estimate_customer_events`, `customers`, `projects` | invoice revenue, live estimate rows as billing truth |
| Invoice aging / open balances | `invoices`, `invoice_line_items` | `payments`, `payment_events`, `customers`, `projects`, `jobs` | external accounting balances, detached AR ledger |
| Payment activity summary | `payments`, `payment_events` | `invoices`, `customers`, `projects` | checkout sessions as revenue, provider-only records |
| Project readiness blockers | `projects` | `opportunities`, `estimates`, `contracts`, `change_orders`, `jobs`, `invoices`, `payments` | project-local shadow statuses, schedule-only project copies |

## 4. Dashboard Cards Vs Dedicated Reporting Page

### Dashboard Cards

Dashboard reporting should stay lightweight and action-oriented.

Good dashboard cards:
- active leads
- estimates awaiting approval
- contracts awaiting signature
- open receivables
- recent payments
- projects blocked or ready to schedule

Dashboard cards should:
- show current counts or attention cues
- link into canonical managers or the dedicated report section
- avoid deep filters, exports, or multi-step analysis
- avoid becoming a separate dashboard-builder product

### Dedicated Reporting Page

The first dedicated reporting surface should be a read-only reports home or reports page.

Recommended role:
- show the five internal-beta reports in one place
- support basic date range filtering
- show source-record links for drill-down
- explain source-of-truth boundaries through small labels or helper copy
- use existing contractor manager/page patterns

The dedicated reporting page should not:
- replace `/financials`, `/invoices`, `/payments`, `/projects`, `/leads`, or `/estimates`
- create operational actions that mutate records
- become a custom BI builder
- introduce reporting tables in V1

### Manager Pages

Existing manager pages should remain the operational homes:
- `/leads` for opportunity management
- `/estimates` for estimate work
- `/projects` for project readiness and workflow continuity
- `/invoices` for invoice management
- `/payments` for payment review and recording
- `/financials` for finance section entry and routing

Reports should summarize and route back to these pages, not fork them.

## 5. What Must Not Be Built Yet

Do not build in the first reporting basics pass:

- advanced BI
- custom dashboard builder
- chart builder
- saved report definitions
- reporting warehouse
- stale snapshot tables or materialized reporting truth
- external accounting sync
- accounting reconciliation
- marketing attribution
- campaign ROI
- job profitability
- labor/material margin reporting
- inventory valuation
- purchasing or material consumption reporting
- scheduled emailed reports
- broad CSV/export suite unless the read-only report tables are stable and the export is low-risk
- any report that writes back to the canonical workflow

## 6. Recommended First Implementation Pass

Build one read-only reporting basics surface after Phase B validation starts.

Recommended implementation shape:

1. Add or activate a contractor-facing reports home using the existing protected app shell and manager-page pattern.
2. Create one server-side report data boundary that reads tenant-scoped canonical records.
3. Compose from existing canonical loaders where practical; use direct tenant-scoped queries only where existing loaders are not suitable.
4. Add a simple date range control:
   - default to the last 30 or 90 days depending on the report
   - allow all-time where it is safe and fast
   - document which date field each report uses
5. Implement the five initial report sections:
   - lead pipeline summary
   - estimate status / approval summary
   - invoice aging / open balances
   - payment activity summary
   - project readiness blockers
6. Keep each report to:
   - summary cards
   - one small table or queue
   - links to canonical record pages
   - clear empty states
7. Reuse existing currency, date, status, and manager-card patterns.
8. Keep CSV export out of the first pass unless internal testers specifically need it after the tables are validated.
9. Run `pnpm typecheck` and `pnpm lint` after implementation.

Acceptance criteria for the first implementation pass:

- reports are read-only
- all queries are tenant scoped
- no schema change is required
- no reporting tables are created
- every displayed number can be traced back to canonical records
- invoice and payment totals reconcile with `/financials`, `/invoices`, and `/payments`
- estimate summaries do not imply billing truth
- project readiness summaries agree with project detail next-action guidance
- dashboard cards remain entry cues rather than separate analytics truth

## 7. Risks And Controls

### Duplicate Aggregates

Risk:
- dashboard, reports, `/financials`, and manager pages compute the same totals differently.

Controls:
- centralize first-pass reporting calculations in one report data boundary.
- reuse existing invoice/payment and readiness helpers where practical.
- keep calculations simple and documented.
- compare financial report totals against `/financials`, `/invoices`, and `/payments` during QA.

### Stale Snapshot Tables

Risk:
- reporting snapshot tables become stale or conflict with canonical workflow records.

Controls:
- do not create reporting tables in V1.
- compute from canonical rows at request time for internal beta.
- use existing immutable commercial snapshots only where they are already canonical downstream truth.
- revisit snapshots only after measured performance or audit requirements justify them.

### Tenant Scope Bypass

Risk:
- reporting loaders accidentally read across organizations because reports aggregate broadly.

Controls:
- require authenticated organization context for every report loader.
- filter every query by the tenant-owned organization/company key used by the source table.
- do not expose service-role report reads to UI code.
- include tenant-scope checks in implementation review and manual QA.

### Financial Truth Drift

Risk:
- reports imply revenue, receivables, or profitability from estimates, payment events, or project status.

Controls:
- collected revenue comes only from canonical successful/recorded payments.
- open balances come only from canonical invoices minus canonical payments.
- estimate value is pipeline/proposal value unless using approved snapshots for downstream baseline.
- payment requests and checkout starts are activity, not revenue.
- job profitability, inventory valuation, and margin reporting wait until their source records are mature.

### Performance Pressure

Risk:
- broad internal reports become slow and create pressure for premature reporting tables.

Controls:
- start with internal beta data volume.
- limit default date ranges.
- add indexes later only if profiling shows a real query problem.
- introduce denormalization only with explicit source-of-truth and refresh rules.

### Status Drift

Risk:
- report status groupings do not match workflow statuses or page copy.

Controls:
- use shared status types and existing label helpers where available.
- keep report group labels close to user-facing workflow language.
- update this plan if canonical statuses change.

## Open Questions For Implementation

Resolve during implementation without changing the canonical model:

- Should lead pipeline date range use `created_at`, `updated_at`, assessment dates, or status transition dates?
- Should estimate aging use `sent_at`, customer event timestamps, or `updated_at` when sent timestamps are absent?
- Should invoice aging use `due_date` when present and fall back to `sent_at` or `created_at`?
- Which existing project readiness helper should be treated as the single source for blocker categories?
- Should CSV export wait until after internal testers validate the on-screen summaries?

## Phase B Recommendation

The first reporting pass should be a small read-only reports home over canonical records, with five internal-beta summaries and drill-down links back into existing workspaces.

Build the reports only after the seed-free QA path and onboarding readiness have proven that a normal contractor tenant can operate without seed data. Reporting should help internal beta testers see what happened in the canonical lifecycle; it should not become a new workflow, ledger, CRM, or analytics warehouse.
