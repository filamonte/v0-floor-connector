# Clocking System Plan

Status: Planning / First MVP Slice Implemented
Doc Type: Architecture / Product Plan

This plan defines the next clocking and time-card architecture for FloorConnector. It is planning only and does not authorize application code, schema, migrations, tests, payroll exports, GPS capture, job costing, or financial mutations.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector already has time punch events, time cards, people, vendors, job assignments, jobs, projects, daily logs, and schedule foundations. The next clocking system should mature those foundations into a production-ready field time workflow without creating a detached payroll app.

The architecture principle is simple: punch events remain the canonical audit truth, while time cards are derived and reviewed summaries. Labor time should attach to people, vendor-linked workers, jobs, projects, daily logs, service/warranty work, and future job-costing inputs. GPS, payroll export, accounting export, and automated costing should come later.

## Implementation Checkpoints

### Review / Approval Hardening Checkpoint

The review/approval hardening slice now adds the first manager trust layer without changing punch-event truth. Implemented behavior includes:

- `time_cards` have review state for derived summaries: draft, needs review, approved, and rejected.
- Manager review actions can approve clean completed time cards or reject a card with notes.
- Review state is preserved across time-card rebuilds only when the derived summary still matches the same punch evidence; changed punch evidence returns the card to review.
- `/time` includes a manager exception queue for old open sessions, unended breaks, missing prior-day clock-outs, flagged event sequences, and rejected cards needing correction.
- Time Card Workspace shows review state, review notes, approve/reject actions, and derived exceptions beside the canonical punch-event trail.
- `/time` includes crew clock-in for multiple available people against one project/job context, using one canonical punch-in event per person.

Still deferred: full admin correction event workflow, crew break/clock-out bulk actions, overtime/pay-period policy, GPS verification, payroll/export, accounting integration, job-costing mutations, equipment usage automation, offline mode, and AI automation.

### Service/Warranty Time Clocking Checkpoint

The service/warranty time slice now adds the first post-installation time attribution path without creating a second time model. Implemented behavior includes:

- `time_punch_events.service_ticket_id` optionally links canonical punch events to a tenant-scoped service/warranty ticket.
- `time_cards.service_ticket_id` carries that context into the derived manager-review summary.
- Relationship validation keeps service ticket time in the same company and consistent with any supplied project/job context.
- `/time` can select an optional Service/Warranty context for individual clocking and crew clock-in while preserving normal production clocking.
- Service Ticket detail shows linked punch events and time cards, and routes users to `/time` with service ticket/project/job context prefilled.
- Time Card Workspace shows linked service/warranty context when present.

Still deferred: service visit scheduling, warranty/service labor reporting, billing automation, manufacturer claims, payroll export, GPS verification, job-costing mutation, equipment/material usage automation, portal service requests, offline mode, and AI automation.

### First Clocking MVP Checkpoint

The first clocking MVP slice turned the existing time foundation into a daily-use clocking workflow without adding schema. Implemented behavior includes:

- `/time` presents a clocking center over canonical people, projects, jobs, punch events, and derived time cards.
- Selected worker state is shown as not clocked in, clocked in, or on break.
- Clocking actions are state-aware: clock in, start break, end break, and clock out.
- Clock-in requires project or job attribution before the action is available.
- Job selection is filtered by selected project, and the server still validates same-tenant project/job consistency.
- Current session summary shows selected person, project, job, active clock-in time, and break state where an open session exists.
- Recent punch events are visible as an audit trail.
- Time cards remain derived summaries from punch events; no detached timesheet model was added.
- Focused tests cover transition validation and time-card derivation from punch events.

Still deferred from the first MVP at that time: crew clocking, admin correction UI, approval hardening, GPS verification, payroll/export, accounting integration, job-costing mutations, warranty/service tickets, equipment usage automation, offline mode, and AI automation.

## Current Implemented Time Foundation

Current foundations include:

- canonical `people` records for workforce identity
- vendor and subcontractor-company foundations
- job assignments and project/job execution context
- time punch events
- derived time cards
- current punch-state review
- daily logs and field notes with labor continuity
- schedule and job workspaces tied to canonical jobs
- dashboard/project/job guidance over existing records

The current foundation is real, but it is not yet a payroll-grade clocking system with admin correction events, overtime review, GPS verification, pay-period policy, or exports.

## Product Goals

- Let workers clock in and out against the right project, job, or service/warranty visit.
- Preserve punch events as immutable audit evidence.
- Derive time cards for review, correction, payroll preparation, labor costing, and reporting.
- Support employees, subcontractor/vendor-linked workers, crews, and job switching without duplicate identity systems.
- Connect labor time to daily logs, schedule, project guidance, warranty/service work, equipment usage, and future job costing.
- Keep GPS verification, payroll export, accounting export, and automated cost posting as future phases.

## Core User Stories

- As a crew member, I can clock into the job I am working on from a mobile-friendly surface.
- As a crew lead, I can clock a crew in and out when policy allows.
- As an office manager, I can review missing punches, break exceptions, and overtime before payroll export.
- As an operations manager, I can see whether labor time aligns with scheduled jobs and daily logs.
- As a service coordinator, I can record warranty/service labor on the same time foundation without creating a helpdesk time system.
- As an owner, I can later use approved time to understand labor cost without automatically mutating invoices or payments.

## Clock-In / Clock-Out Workflow

The clock-in flow should capture:

- worker identity from canonical `people`
- optional vendor/subcontractor context when the worker is vendor-linked
- project context
- job context when the work is production work
- service/warranty context when the work is post-installation work
- timestamp
- source surface, such as worker mobile, crew lead, admin correction, or future kiosk
- optional notes

The clock-out flow should close the active punch, calculate elapsed time for review, and expose exceptions when the punch is incomplete, overlaps another punch, lacks attribution, or conflicts with expected schedule context.

## Break Workflow

Breaks should be modeled as part of the time-audit trail instead of being hidden math. MVP can support manual break start/end or break-duration correction on review. Later phases can add policy-based unpaid breaks, meal-break exceptions, and state-specific compliance logic.

Breaks should not delete or rewrite original work punches. Corrections should leave audit evidence.

## Project/Job Attribution

Clocking should prefer job attribution when a scheduled production job exists. Project-only attribution is useful for mobilization, prep, office-approved project work, service triage, or cases where a job has not been created yet.

Attribution rules:

- production labor should attach to a canonical job and project where possible
- project-only labor should still attach to the canonical project
- service/warranty time should attach to the original customer/project/job/install context through the future service/warranty record
- generic company time can exist only when business policy explicitly allows it

## Employee/Subcontractor/Vendor-Linked Worker Handling

The system should extend `people` and vendors rather than create a payroll-only worker table. A person may be:

- employee
- subcontractor worker
- vendor-linked worker
- crew lead or responsible field contact

Vendor linkage should clarify billing, compliance, and subcontractor context. It must not create a duplicate person identity or a separate vendor workforce system.

## Crew Clocking

Crew clocking should allow an authorized crew lead or admin to start or stop time for multiple people on the same job. It should record who performed the action and preserve each worker's punch record separately.

Crew clocking must avoid silent bulk edits. Any correction or late entry should be visible in review.

## Job Switching Workflow

Job switching should close the current active job punch and open a new punch for the next job or service/warranty visit. The UI should make it clear whether travel, setup, or downtime is being captured as project time, company time, or excluded time according to contractor policy.

Overlapping active punches should be flagged as exceptions.

## Admin Correction/Audit Workflow

Admins need a correction workflow for:

- missed clock-in
- missed clock-out
- wrong job or project
- wrong worker
- break correction
- duplicate or overlapping punch
- service/warranty attribution correction

Corrections should create audit evidence with actor, reason, old value, new value, and timestamp. They should not erase the original punch event history.

## Missing Punches/Exceptions

Exception types should include:

- active punch with no clock-out
- punch with no project/job/service attribution
- overlapping punches
- break missing or too long, if policy applies
- scheduled job with expected crew but no labor time
- labor time recorded on a job outside the scheduled window
- worker not assigned to the job, if assignment is expected

Exceptions should drive review and guidance, not automatic payroll or financial changes.

## Time Card Review/Approval

Time cards should be derived summaries for a person and pay period. A time card can collect punch events, break totals, job/project/service allocation, correction state, and approval status.

Recommended lifecycle:

1. Draft derived summary.
2. Worker or crew lead review, if enabled.
3. Admin review.
4. Approved for payroll/export.
5. Exported later, when payroll integration exists.

Approval should freeze the reviewed summary while preserving access to underlying punch evidence.

## Overtime/Pay-Period Concepts

MVP should define pay periods and overtime visibility without trying to implement every payroll jurisdiction. The plan should support:

- weekly or custom pay periods
- regular vs overtime derived summaries
- worker-level pay type and policy later
- admin override/correction audit

Payroll law and state-specific rules require explicit future design before automation.

## Warranty/Service Time Support

Warranty and service work should reuse the same punch event and time-card foundation. The future service/warranty record should provide a source context so labor can be separated from original production labor while still being connected to the original project/job/install history.

Warranty time should not mutate original invoice/payment state automatically.

## Equipment Usage Connection

Clocking should eventually help derive equipment usage entries when a worker clocks into a job or warranty/service visit with assigned equipment. That connection should be human-reviewable and should feed utilization/job-costing inputs later.

Time punches should not automatically create equipment costs, AP bills, invoices, or payments.

## Daily Log Continuity

Daily logs should be able to summarize approved or current labor activity for the project/job day. A daily log may reference labor totals and workers present, but the canonical labor audit remains punch events and reviewed time cards.

Daily logs should not become the timekeeping source of truth.

## Schedule/Job Integration

Schedule should provide expected job context for clocking. Clocking should provide actual labor evidence back to job, project, and schedule guidance.

Useful guidance:

- scheduled job has no labor started
- worker clocked into unscheduled job
- labor time continues after scheduled end
- crew assigned but no punch activity

All actions remain human-confirmed.

## Dashboard/Project/Job Guidance

Dashboard, Project Workspace, and Job Workspace should surface:

- active punches
- missing punch exceptions
- pending time-card reviews
- warranty/service labor needing attribution
- jobs with schedule/labor mismatch
- approved time ready for future export

These are guidance surfaces and should not own time truth.

## Mobile/Responsive Field UX

The field UX should be fast, responsive, and job-context aware:

- large clock-in/out controls
- clear active job/project/service context
- crew mode for authorized leads
- offline-friendly design later, after sync/conflict rules are planned
- minimal text entry during field use

Offline support is future and needs explicit sync conflict design.

## GPS/Location Future Phase

GPS should come after the core clocking workflow is reliable. Location data should be verification evidence, not time truth by itself.

Future GPS rules should address:

- consent and policy
- mobile browser/app capability
- precision and failure states
- location at clock-in/out
- jobsite geofence guidance
- exception review

No GPS requirement belongs in the MVP.

## Payroll/Accounting/Export Future Phase

Payroll export should use reviewed and approved time cards. Exports should include enough metadata for payroll systems without making the payroll provider the source of truth for FloorConnector time records.

Accounting exports and job-costing feeds should derive from approved time and cost-rate policy later. They must not mutate invoices/payments automatically.

## Job Costing Future Phase

Future job costing can derive labor costs from approved time, worker cost rates, burden assumptions, project/job attribution, service/warranty categorization, and equipment/material inputs.

Job costing should be a reporting/cost-control layer. It should not create customer-facing billing by itself.

## AI/Guided Opportunities

AI or guided assistance can later:

- summarize time exceptions
- suggest missing job attribution
- explain schedule/labor mismatch
- draft admin correction notes
- identify repeated overtime or service labor patterns

AI must not approve time cards, change punches, send payroll exports, mutate financial records, or create AI-only labor truth without human confirmation and server-side validation.

## Anti-Silo Guardrails

- Punch events remain canonical audit truth.
- Time cards are reviewed/approved summaries, not a separate source of truth.
- Do not create a detached timesheet/payroll silo.
- Do not create duplicate people, vendors, jobs, projects, or service records.
- Do not use GPS as time truth.
- Do not mutate invoices, payments, payroll, job costing, or equipment costs automatically from punch events.
- Warranty/service time must reuse the same time foundation.
- AI must not own labor records or approvals.

## MVP Implementation Slice

Recommended MVP:

- formalize active clock-in/out against person + project/job: implemented for single-worker clocking
- add break capture or break correction, depending on current data shape: implemented as explicit break-start and break-end punch events
- add crew clocking for authorized users: implemented for crew clock-in only
- add exception review for missing/overlapping/unattributed punches: implemented as derived exception visibility; correction workflow deferred
- add time-card review/approval state: implemented as derived summary review state with approve/reject actions
- show Project/Job/Schedule/Dashboard guidance from existing time records: existing linked labor context remains; broader active-clock guidance deferred
- include service/warranty attribution hooks in the model design: implemented through optional service ticket context on punch events and derived time cards

MVP exclusions:

- GPS verification
- payroll export
- accounting export
- automated job costing
- equipment usage automation
- offline sync
- AI actions

## Phase 2/3 Expansion

Phase 2:

- pay periods and overtime review
- richer admin correction audit
- service visit scheduling and richer service/warranty labor reporting
- equipment usage linkage proposals
- payroll-safe export preview

Phase 3:

- GPS verification
- payroll/accounting provider adapters
- labor costing reports
- offline/mobile app sync
- AI summaries and exception drafting

## Testing/QA Strategy

Future implementation should include:

- unit tests for punch overlap, duration, break, and exception derivation
- tenant isolation and same-company validation tests
- server-action tests for clock-in/out and admin correction
- Playwright smoke for worker clocking, crew clocking, exception review, and time-card approval
- regression checks proving invoices, payments, contracts, signatures, portal access, project readiness gates, and existing schedule semantics are unchanged

## Open Questions

- Which roles can clock for themselves, clock a crew, and correct time?
- Should project-only time be allowed before a job exists?
- What are the first pay-period defaults?
- Are breaks explicit punches, admin adjustments, or both?
- Should subcontractor time be included in the same approval flow as employee time?
- What is the minimum audit trail required before payroll export?
- How should warranty/service time be selected before the service/warranty module exists?
