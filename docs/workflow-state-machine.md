# Contractor Workflow State Machine

This document translates the target contractor workflow into practical states, blockers, and transitions.

It should be read alongside:

- [workflow-spec.md](C:/FloorConnector/docs/workflow-spec.md): primary guided contractor journey
- [sales-to-production.md](C:/FloorConnector/docs/sales-to-production.md): broader business-process intent
- [target-ia.md](C:/FloorConnector/docs/target-ia.md): target navigation and workspace structure
- [current-state.md](C:/FloorConnector/docs/current-state.md): implemented status today

Ownership note: this document owns deterministic workflow states, blockers,
transitions, and readiness gates. Future AI or agentic behavior must respect
these gates and should route through the canonical transitions described here;
for umbrella agentic strategy, see
[agentic-operations-layer.md](C:/FloorConnector/docs/agentic-operations-layer.md).

## Purpose

The goal of this document is to define:

- the main progression from sales through billing
- what states block forward movement
- what transitions should be primary versus fallback
- where the product should compute readiness instead of relying on tribal knowledge

This is a workflow planning document, not a statement that every state already exists in the running product.

## Core Model

The workflow should be centered on a **project lifecycle** supported by connected canonical records.

Primary lifecycle:

`intake -> scoped -> estimating -> awaiting_customer -> contracting -> awaiting_financial_readiness -> ready_to_schedule -> scheduled -> in_progress -> completed -> invoicing -> paid`

This lifecycle can be represented through:

- project stage
- connected record statuses
- computed blockers

The system does not need one giant enum immediately. It does need one coherent interpretation of readiness.

## Workflow Stages

### 1. Intake

Meaning:

- initial inquiry exists
- not yet qualified into active delivery work

Primary owner:

- sales

Typical transitions:

- `intake -> scoped`
- `intake -> lost`

Typical blockers:

- missing contact information
- missing address or service context
- unqualified lead

### 2. Scoped

Meaning:

- the opportunity/customer context is qualified enough to define real job scope
- project context can begin to form

Primary owner:

- sales

Typical transitions:

- `scoped -> estimating`
- `scoped -> lost`

Typical blockers:

- missing site assessment
- missing measurements
- missing recommended system or scope notes

### 3. Estimating

Meaning:

- estimate is being prepared or revised

Primary owner:

- sales / estimating

Primary transition:

- `estimating -> awaiting_customer`

Fallback transitions:

- remain in `estimating` while edits continue
- return from later customer-change loop back into `estimating`

Typical blockers:

- no estimate exists
- estimate missing line items
- estimate missing pricing completeness
- internal review not complete if required

### 4. Awaiting Customer

Meaning:

- estimate has been sent and customer action is needed

Primary owner:

- sales

Primary transitions:

- `awaiting_customer -> contracting` when approved
- `awaiting_customer -> estimating` when customer requests changes
- `awaiting_customer -> lost` when rejected

Typical blockers:

- customer has not reviewed
- customer requested revisions
- financing prequalification still needed if organization uses it

### 5. Contracting

Meaning:

- estimate is approved and contract generation / signature work is underway

Primary owner:

- sales

Primary transitions:

- `contracting -> awaiting_financial_readiness`
- `contracting -> estimating` if commercial terms must change before signature

Typical blockers:

- contract not generated
- contract still draft
- contract not sent
- contract not signed

### 6. Awaiting Financial Readiness

Meaning:

- contract is signed, but the work is not yet cleared for operations

Primary owner:

- sales / finance

Primary transitions:

- `awaiting_financial_readiness -> ready_to_schedule`

Typical blockers:

- deposit required but not received
- financing required but not approved
- internal approval outstanding
- scheduling prerequisites incomplete

### 7. Ready To Schedule

Meaning:

- commercial and financial prerequisites are satisfied
- operations can take over

Primary owner:

- operations

Primary transitions:

- `ready_to_schedule -> scheduled`

Typical blockers:

- no job created yet
- no schedule date assigned
- staffing constraints later

### 8. Scheduled

Meaning:

- job exists and work date is planned

Primary owner:

- operations

Primary transitions:

- `scheduled -> in_progress`
- `scheduled -> ready_to_schedule` if schedule is removed

Typical blockers:

- missing crew assignment later
- missing materials later
- schedule conflict later

### 9. In Progress

Meaning:

- field execution has started

Primary owner:

- operations / field

Primary transitions:

- `in_progress -> completed`

Typical blockers:

- incomplete field work
- unresolved punch items later
- change-order decision pending later

### 10. Completed

Meaning:

- work is complete enough to bill

Primary owner:

- operations / finance

Primary transitions:

- `completed -> invoicing`

Typical blockers:

- completion confirmation missing
- billing support documents missing later

### 11. Invoicing

Meaning:

- invoice exists and finance is actively billing or collecting

Primary owner:

- finance

Primary transitions:

- `invoicing -> paid`

Typical blockers:

- invoice still draft
- invoice not sent
- balance still due
- retainage still held

### 12. Paid

Meaning:

- invoice collection is complete for the current billing scope

Primary owner:

- finance

Typical blockers:

- none for the basic workflow
- future retainage release or final closeout may still apply

## Blocker Model

Users usually care more about blockers than raw status labels.

The product should compute blockers from canonical records and show them prominently.

Recommended blocker set:

- `waiting_on_scope`
- `waiting_on_estimate`
- `waiting_on_customer_review`
- `waiting_on_estimate_changes`
- `waiting_on_contract_generation`
- `waiting_on_signature`
- `waiting_on_deposit`
- `waiting_on_financing`
- `waiting_on_schedule`
- `waiting_on_field_completion`
- `waiting_on_invoice_send`
- `waiting_on_payment`
- `waiting_on_retainage_release`

These should be treated as user-facing workflow signals, not necessarily all as first-pass database enums.

## Primary Transition Rules

These should become the recommended system path.

### Estimate

Primary path:

- create estimate from project
- edit estimate until ready
- send estimate
- revise if requested
- approve estimate

Secondary path:

- directly opening estimates from global queue

### Contract

Primary path:

- generate contract from approved estimate
- edit while still draft
- send for signature
- mark viewed
- mark signed

Secondary path:

- direct navigation from contract queue

### Financial Readiness

Primary path:

- evaluate deposit requirement
- evaluate financing requirement
- confirm readiness to schedule

Secondary path:

- finance manually creating records from list screens

### Job / Schedule

Primary path:

- create job from ready work
- assign schedule
- move into execution

Secondary path:

- direct job creation from project when a company intentionally bypasses earlier steps

### Invoice

Primary path:

- create invoice from the connected sold-work context
- send invoice
- record payment

Secondary path:

- direct invoice creation from project
- finance queue-driven Invoice Editoror work

## Fallback Rules

The system should still allow some flexibility, but fallback actions should be visually secondary.

Fallback examples:

- create invoice directly from project
- create job directly from project
- edit invoice manually from global finance pages
- open records from module queues instead of the Project Workspace

The rule is:

- keep flexibility for real operations
- do not let fallback actions become the default mental model

## Readiness Rules

### Contract Readiness

A project should not be considered contract-ready unless:

- estimate exists
- estimate is approved

### Schedule Readiness

A project should not be considered schedule-ready unless:

- contract is signed
- deposit requirement is satisfied or not required
- financing requirement is satisfied or not required

### Billing Readiness

A project should not be considered invoice-ready unless:

- work is complete enough to bill
- required billing basis exists
- required financial gating is satisfied

### Paid State

An invoice should not be considered fully paid unless:

- balance due is zero
- no blocking retainage condition remains for the billed scope

## Role Queues

The same workflow should power different queue views.

### Sales Queue

Should emphasize:

- new intake
- awaiting scope
- estimate draft
- awaiting customer review
- awaiting signature

### Operations Queue

Should emphasize:

- ready to schedule
- scheduled soon
- in progress
- blocked execution work

### Finance Queue

Should emphasize:

- invoice draft
- invoice ready to send
- overdue invoices
- partially paid invoices
- retainage follow-up later

## Project Workspace Guidance

Project should become the place where users understand:

- current stage
- blockers
- next best action
- connected records
- handoff status between sales, ops, and finance

Project should not just list related records. It should explain workflow health.

## Implementation Guidance

Before major UI redesign work:

1. align on the primary stage model
2. align on the blocker vocabulary
3. define which transitions are primary and which are fallback
4. surface these rules in project and queue views

This lets the UI become simpler because the workflow itself is clearer.
