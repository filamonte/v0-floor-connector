# UX Architecture Recovery Plan

Status: Active
Doc Type: Planning

This plan turns the UX Recovery Wave findings into a fast, governed execution
sequence. It is planning only. It does not implement UI changes, create
branches/worktrees, change routes, change schema, or rename canonical tables.

## Recovery Objective

Make FloorConnector easier to operate without weakening the product foundation:

- preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- keep source-record ownership clear
- reduce density and cognitive load
- make navigation and search predictable
- make Settings a configuration surface, not an operational dumping ground
- make Portal customer-safe and organized
- prepare a calendar MVP because it is a go-to-market expectation

## Fast Execution Shape

Do not treat the 45 findings as 45 tickets. Execute by root cause:

1. Align shell and navigation patterns.
2. Define and apply Workspace Framework V2 to the two highest-leverage
   workspaces.
3. Simplify Settings IA and route operational monitoring out of configuration.
4. Fix responsive, overlay, text wrapping, action hierarchy, and dense-card
   foundations across targeted surfaces.
5. Add Calendar MVP over existing schedule data.
6. Recenter Invoice Review on invoice review.
7. Organize Portal before customer-facing density grows.

This should be treated as one recovery wave with focused streams, not a broad
visual redesign.

## Implementation Stream Plan

### 1. Navigation Shell Cleanup

Proposed stream: `navigation-shell-recovery-v1`

Owns:

- contractor shell header/menu consistency
- route context and breadcrumb/page-title rhythm
- project quick search and recent-project affordance
- mobile header visibility
- global search overlay interaction model

Must not:

- rename routes
- add a new navigation product model
- create local-only search state as business truth
- reintroduce a full-time left sidebar as primary navigation without explicit
  product approval

Validation:

- typecheck and lint when app code changes
- protected route smoke for changed shell paths where practical
- responsive screenshot or browser evidence for desktop, 14 inch laptop, and
  mobile shell states

### 2. Workspace Framework V2 For Lead/Sales And Project

Proposed stream: `workspace-framework-v2-lead-project-v1`

Owns:

- shared Workspace Framework V2 documentation and representative application
  to Lead/Sales Opportunity and Project
- source-record context, next action, primary work, handoff lanes, and secondary
  details ordering
- content placement audit for roles, contacts, estimate plans, work items,
  context layers, reports, and operational action

Must not:

- move canonical truth into workspace-local state
- create duplicate role/contact/assessment/work-item models
- implement broad redesign across every workspace in one stream

Validation:

- targeted helper/presentation tests if shared helpers change
- typecheck, lint, preflight, and browser smoke for touched routes where
  practical

### 3. Settings IA Cleanup

Proposed stream: `settings-ia-recovery-v1`

Owns:

- Settings overview simplification
- account status surfaced at top of page
- configuration grouping and nesting strategy
- Operations Monitor routing out of Settings
- workflow status configuration planning
- brand accent color picker/preview decision
- contractor website URL normalization planning
- template merge-field guidance and builder direction

Must not:

- change settings persistence without explicit implementation scope
- move operational action into Settings
- move platform policy into contractor Settings
- create duplicate settings models

Validation:

- owner/admin protected route smoke where practical
- no schema/migration changes unless separately approved

### 4. Display / Overlay / Mobile / Laptop Recovery

Proposed stream: `responsive-display-overlay-recovery-v1`

Owns:

- 14 inch laptop overflow fixes
- mobile shell reviewability
- overlay, popup, modal, and action-menu patterns
- action hierarchy: primary, secondary, overflow, protected/destructive,
  unavailable
- CrewBoard and Appointment Workspace density treatment where scoped
- "Preparing Your Workspace" and empty/loading transitional display polish

Must not:

- rewrite business surfaces wholesale
- hide important readiness, financial, signature, schedule, or portal state
- claim mobile readiness without responsive evidence

Validation:

- browser screenshots or route smoke for changed responsive surfaces
- explicit horizontal-overflow check where practical

### 5. Calendar View MVP

Proposed stream: `schedule-calendar-mvp-v1`

Owns:

- calendar view over existing canonical jobs, appointments, assignments, people,
  vendors, projects, and customers
- daily/weekly/monthly visibility as scoped by implementation approval
- links back to Job, Project, and Schedule action surfaces

Must not:

- add schedule-only records
- create a disconnected dispatch subsystem
- automate rescheduling, route optimization, provider calendar sync, or
  customer-facing schedule commitments
- bypass Ready Check or GateKeeper server enforcement

Validation:

- schedule read-model tests if helpers change
- typecheck, lint, preflight
- protected `/schedule` smoke where practical

### 6. Invoice Review Cleanup

Proposed stream: `invoice-review-recovery-v1`

Owns:

- invoice review-first layout and information hierarchy
- billing source, line items, totals, balance, payment events, customer/project
  context, and next billing/collection action
- clear separation between review, edit, send/payment-request, and record
  evidence

Must not:

- change invoice math, payment state, event semantics, provider behavior, or
  line-item lineage
- create duplicate billing review records
- move collections automation into Invoice Review

Validation:

- targeted financial tests if any helper changes
- typecheck, lint, preflight
- no financial math diff without tests

### 7. Portal Organization Cleanup

Proposed stream: `portal-organization-recovery-v1`

Owns:

- portal dashboard organization for customers with multiple projects,
  estimates, contracts, invoices, and change orders
- sorting/filtering/compact grouping posture
- capitalization and customer-safe copy QA
- links into existing review/sign/pay/print paths

Must not:

- create portal-owned copies
- expose contractor-only readiness, field, provider, or internal note context
- add customer self-service beyond explicitly approved actions

Validation:

- portal route smoke with real portal auth where practical
- expected-denial coverage remains honest when fixtures are missing

### 8. Verification

Proposed stream: `verification-ux-recovery-v1`

Owns:

- source-record ownership verification
- duplicate-model checks
- responsive route evidence review
- implementation-vs-target docs check
- final review packet and merge-order recommendation

Verification runs last after implementation stream commits exist.

## Naming System

The recovery wave should establish a product noun system before broad copy
changes:

- Command Center: cross-record operational triage and routing surface.
- Manager Page: global list/queue for a canonical record type.
- Workspace: record or domain surface where review and action happen.
- Packet: read-only handoff bundle assembled from source records.
- Report: generated, analyzed, or exported business output, not an action queue.
- Trail: chronological source-record evidence or delivery/activity history.
- Library: reusable tenant or platform-managed configuration/content.
- Ready Check: readiness evaluation that explains blockers and source records.
- AI Guidance: review-first summary, draft, or recommendation over canonical
  records.

Job / Work Order naming needs product decision before implementation. The plan
should choose one user-facing term and document how it maps to canonical `job`
records without renaming routes or tables in this pass.

## Visual Language

The visual recovery should separate:

- status: semantic state and readiness
- priority: urgency or attention
- action: what the user can do next
- ownership: which workspace owns the action

Copper remains action emphasis. Status colors should not depend on one accent
color or one dominant hue family.

## Acceptance Criteria

- Every stream routes users back to canonical records and owning workspaces.
- No stream creates duplicate business truth.
- No stream changes database schema unless a later explicit implementation
  approval says so.
- No route renames or canonical table renames happen in the recovery foundation.
- Responsive evidence covers desktop, 14 inch laptop, tablet or mobile where
  the stream touches layout.
- Portal changes remain customer-safe.
- Invoice changes include targeted financial validation when math/state helpers
  are touched.
- Calendar MVP stays on canonical schedule records.
- Final verification confirms target ideas are not described as implemented
  until code and `docs/current-state.md` support them.
