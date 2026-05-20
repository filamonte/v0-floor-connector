# Equipment Assignment And Readiness Plan

Status: Foundation implemented / expansion planning
Doc Type: Architecture / Product Plan
Date: 2026-05-18

This plan defines the target architecture for Equipment Assignment and Schedule/Job Readiness in FloorConnector. The first foundation slice is now implemented; remaining sections describe target direction and deferred expansion.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Equipment assignment and readiness should turn the implemented equipment registry into operational context for jobs, projects, schedule, and field execution. The second equipment slice should answer:

- what equipment a job requires
- which physical assets are assigned
- whether those assets are available for the job window
- whether equipment status, rental dates, or overlapping use creates a warning
- how those warnings appear in Schedule, Job Workspace, Project Workspace, and Dashboard guidance

This must extend the existing canonical job/project/schedule chain. It must not create a separate equipment calendar, duplicate `job_assignments`, duplicate people/vendor records, or bypass existing readiness gates.

Equipment readiness should be advisory and deterministic. Contractors may decide to schedule despite missing equipment, but the system should make the risk clear and leave the action human-confirmed. No autonomous rescheduling belongs in this slice.

## Current Implemented Baseline

The Equipment Registry Foundation is implemented:

- tenant-scoped `equipment_assets`
- `/equipment` Equipment Manager Page
- `/equipment/:id` Equipment Workspace
- asset identity, type, ownership, operational status, vendor link, purchase/rental fields, notes, active state, and created/updated user metadata
- tenant-safe vendor validation for linked vendor context

Implemented assignment/readiness foundation:

- tenant-scoped `job_equipment_requirements`
- tenant-scoped `equipment_assignments`
- manager-scoped server actions for requirements and assignments
- derived, non-persisted equipment readiness summaries with a pure tested
  warning-derivation helper
- warning-only missing equipment, unavailable assigned asset, rental-window, and overlap checks
- Job Workspace equipment requirements, assignments, and warnings
- Schedule selected-job equipment warning context
- Project Workspace compact equipment readiness summary
- Equipment Detail recent assignment visibility
- bounded read-only Dashboard Operational Cockpit equipment warning previews
- focused tests for warning derivation and migration-level tenant/RLS safeguards

Still not implemented:

- hard equipment readiness gates
- autonomous rescheduling
- dashboard-owned equipment cue state or mutation controls
- project-level requirements before jobs exist
- maintenance workflow
- utilization tracking
- job costing
- procurement/AP integration
- portal visibility
- warranty/service behavior
- AI automation

This implemented foundation is advisory only. It does not change project readiness gates, scheduling server actions, job status transitions, crew assignments, financial/payment/signature behavior, portal access, or lifecycle semantics.

## Product Goals

- Let operations teams define required and optional equipment for jobs.
- Let schedulers assign specific equipment assets to jobs or projects.
- Warn when required equipment is missing, unavailable, down, in maintenance, retired, inactive, double-booked, or outside rental dates.
- Surface equipment readiness in the same operational places users already work: Schedule, Job Workspace, Project Workspace, and Dashboard.
- Preserve human-confirmed scheduling and existing readiness semantics.
- Keep equipment assignments distinct from crew/job assignments.
- Keep rented and subcontractor-owned equipment connected to vendors without creating a duplicate vendor model.
- Lay groundwork for later maintenance, utilization, documents, costing, and warranty/service context.

## User Stories

- As a scheduler, I want to see that a polishing job requires a grinder, dust collector, and burnisher before I commit the job date.
- As an operations manager, I want to assign Grinder 03 to a scheduled job and see if it is already committed somewhere else.
- As a project manager, I want a project/job to show missing required equipment before the crew arrives.
- As a crew lead, I want to see the equipment expected on my job without becoming the owner of a second crew-assignment system.
- As a rental coordinator, I want to know if a rented machine's rental window covers the job date.
- As an owner, I want equipment warnings to appear in the same cockpit as crew, schedule, payment, and field blockers.
- As a future job-costing user, I want assignments to preserve enough context to later derive usage and cost without mutating invoices or payments.

## Requirement Vs Assignment Distinction

Requirement means: what equipment is needed.

Examples:

- one planetary grinder required
- one HEPA dust collector required
- two moisture meters optional
- trailer recommended for material haul

Assignment means: which physical asset is committed.

Examples:

- Grinder 03 assigned to Job A from Monday 7:00 AM to Tuesday 4:00 PM
- Trailer 01 assigned to Project B for the week
- Rented Shot Blaster assigned to Job C during its rental window

Readiness compares requirements to assignments and asset state. Requirements should not imply a physical asset is assigned. Assignments should not imply the job's requirement list is complete.

## Proposed Entities And Tables

This section is a planning outline only. Do not add these tables until an implementation prompt explicitly authorizes schema work.

### `job_equipment_requirements`

Purpose: record the equipment types or assets a job needs before or during scheduling.

Recommended MVP fields:

- `id`
- `company_id`
- `job_id`
- `project_id`
- `equipment_type`
- `equipment_asset_id` nullable
- `label`
- `required_quantity`
- `is_required`
- `source_type`: `manual`, `project_template`, `estimate_scope`, `system_template`, `ai_suggested`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

MVP recommendation: require `job_id` and derive project continuity from the job. Project-level requirements can be a later extension unless the first implementation proves project-before-job requirements are needed.

Guardrail: requirement rows do not schedule equipment, reserve equipment, mutate jobs, or create costs. They describe need only.

### `equipment_assignments`

Purpose: record a planned or active commitment of a physical equipment asset to a canonical job, project, person, or vendor context.

Recommended MVP fields:

- `id`
- `company_id`
- `equipment_asset_id`
- `job_id` nullable
- `project_id` nullable
- `responsible_person_id` nullable
- `vendor_id` nullable
- `assignment_start_at`
- `assignment_end_at`
- `assignment_status`: `planned`, `active`, `returned`, `cancelled`
- `assignment_context`: `job`, `project`, `person`, `vendor`, `service`, `rental`
- `notes`
- `created_by`
- `updated_by`
- `created_at`
- `updated_at`

MVP recommendation: support job assignments first, with optional project context for continuity and links. Person/vendor fields should be responsibility or rental/service context only; they must not become crew assignment truth.

Guardrail: equipment assignment complements `job_assignments`; it never replaces or duplicates crew assignment.

### Derived Readiness Summary

Do not create a persisted readiness engine in the MVP. Derive an equipment readiness summary from:

- `equipment_assets`
- `job_equipment_requirements`
- `equipment_assignments`
- canonical `jobs` schedule window/status
- project context through `jobs.project_id`

The derived summary should be query-time or read-model output. It should feed UI warnings and operational cues without becoming its own business record.

## Tenant And Relationship Rules

- Every requirement and assignment row must have `company_id`.
- Requirement `job_id` must belong to the same company.
- Assignment `equipment_asset_id` must belong to the same company.
- Assignment `job_id`, `project_id`, `responsible_person_id`, and `vendor_id` must belong to the same company when supplied.
- If both `job_id` and `project_id` are supplied, the job's project must match the assignment project.
- RLS should allow active organization members to read and appropriate owner/admin/manager roles to write, following existing tenant policy patterns.

## Readiness And Conflict Rules

Equipment readiness should be deterministic and explainable.

### Missing Required Equipment

If a required equipment requirement has no matching assignment, show a warning:

- severity: blocking guidance / needs attention
- example: "Required grinder is not assigned."
- schedule behavior: warn before scheduling or rescheduling; do not auto-block unless a later approved workflow adds explicit enforcement

### Missing Optional Equipment

If optional equipment is missing, show informational guidance:

- severity: caution / optional
- example: "Optional burnisher is not assigned."
- schedule behavior: never block; display as prep context

### Asset Status

Recommended MVP interpretation:

- `available`: can satisfy readiness if assigned and no conflict exists
- `assigned`: ready only for the assignment's own job/window; otherwise conflict risk
- `in_use`: ready only for the same active job/context; otherwise conflict risk
- `maintenance`: not ready for scheduled production
- `out_of_service`: not ready
- `retired`: not assignable
- inactive assets: not ready and should be hidden from default assignment pickers

### Assignment Overlap

Warn when an active or planned assignment for the same asset overlaps another active or planned assignment window.

Overlap should consider:

- assignment start/end
- job schedule date/time when assignment dates are derived or incomplete
- cancelled and returned assignments as non-conflicting
- timezone handling consistent with existing schedule/job date behavior

MVP should warn, not auto-reschedule.

### Rental Window Mismatch

For rented or leased equipment:

- warn if job/assignment starts before rental start date
- warn if job/assignment ends after rental end date
- show caution if rental dates are missing but ownership status indicates rented or leased

Do not create AP, bills, POs, or rental financial mutations in this slice.

### Status And Rental Combined

If a rented asset is assigned but also out of rental window, readiness is not satisfied. If an owned asset is assigned but `maintenance`, `out_of_service`, `retired`, or inactive, readiness is not satisfied.

### Human Override

Scheduling may continue only through explicit human action in existing scheduling flows. If a future acknowledgement is needed, it should be designed as a record-linked acknowledgement or operational cue state, not as a hidden bypass of readiness gates.

## Job, Project, And Schedule Integration

Equipment readiness should extend the existing job/project/schedule model.

### Jobs

Jobs should be the first MVP anchor because current scheduling is job-based. Job Equipment should show:

- required equipment
- optional equipment
- assigned equipment
- missing required equipment
- asset conflicts
- rental-window warnings
- non-ready status warnings

### Projects

Project Workspace should aggregate equipment status from the project's jobs:

- jobs missing required equipment
- jobs with conflicting equipment
- jobs with assigned equipment that is unavailable
- upcoming equipment needs

Project should remain the operational hub, but it should not own a separate equipment readiness truth.

### Schedule

Schedule should show equipment warnings alongside existing readiness and crew context:

- selected job action panel equipment warning summary
- assigned equipment list for selected job
- conflict count or warning badge
- links to Job Workspace or Equipment Workspace

The schedule should not become an equipment calendar. Equipment calendar views, if later needed, should derive from equipment assignments plus canonical job schedule windows.

## Owned Vs Rented Assignment Behavior

Owned equipment:

- assignment checks status and overlap
- future usage/costing can use asset cost rates
- documents and maintenance history stay on equipment

Rented or leased equipment:

- assignment checks status, overlap, and rental window
- vendor relationship remains the rental/source context
- future costing can snapshot rental cost later
- no AP or procurement mutation in MVP

Subcontractor-owned equipment:

- assignment can identify vendor/person responsibility context
- it should not create a new subcontractor model
- compliance or insurance requirements remain later work unless already represented by canonical vendor/people compliance

## Crew, Person, And Vendor Interactions

Equipment assignment must not duplicate crew assignment.

- `job_assignments` remains crew/person assignment truth.
- `equipment_assignments.responsible_person_id` means caretaker/operator/contact, not crew staffing.
- `vendor_id` means rental, service, subcontractor-owned, or supplier context, not a duplicate vendor.
- Crew warnings and equipment warnings should appear near each other because they affect readiness, but they remain different domains.

## UX Concepts

### Schedule Page

For selected jobs:

- show "Equipment" as a compact readiness subsection near crew/readiness context
- show missing required equipment
- show assigned equipment with operational status
- show conflict and rental-window warnings
- link to Job Workspace or Equipment Workspace for details

No drag/drop equipment scheduling in MVP.

### Job Workspace

Add a job equipment panel:

- requirements
- assigned assets
- warnings
- links to equipment records
- future add/edit actions when assignment server actions exist

This should feel like production readiness, not a separate inventory app.

### Project Workspace

Add project-level summary:

- "Equipment readiness" across upcoming jobs
- missing required equipment by job
- conflicts affecting the project
- key assigned assets

Project Workspace should route to job/equipment detail surfaces rather than becoming the full assignment editor.

### Dashboard / Operational Cockpit

Surface high-signal equipment blockers:

- upcoming jobs missing required equipment
- assigned equipment is out of service
- rental window does not cover scheduled work
- double-booked equipment affecting upcoming work

Dashboard should remain a guidance surface, not a place to mutate equipment assignments in MVP.

## AI And Guided Future

Future AI or guided assistance can:

- suggest equipment requirements from estimate scope, surface system, square footage, prep method, and site conditions
- explain why a job is not equipment-ready
- draft an equipment assignment plan for human review
- summarize conflicts for the schedule
- recommend rental vs owned equipment based on usage history later

AI must not:

- create AI-only equipment truth
- auto-assign equipment without human confirmation
- auto-reschedule jobs
- mutate financial records
- bypass readiness gates
- expose equipment to portal customers without an approved portal/service design

## Anti-Silo Guardrails

- Equipment extends canonical projects, jobs, schedule, vendors, people, time, documents, warranty/service, and future costing.
- No duplicate job assignment model.
- No duplicate vendor or person model.
- No separate equipment calendar as source of truth.
- No separate readiness engine.
- No portal/customer equipment copy.
- No automatic financial mutations from equipment status, assignment, or usage.
- No autonomous schedule changes.
- No AI-owned equipment requirements or assignments.

## MVP Implementation Slice

Implemented foundation slice: Equipment Assignment And Job Readiness Foundation.

MVP scope:

- added `job_equipment_requirements`
- added `equipment_assignments`
- added RLS and tenant-safe policies
- added local domain/type exports for assignment statuses and records
- added server utilities for job equipment requirements, assignments, and derived readiness summaries
- validates same-company links for equipment, jobs, and projects
- added Job Workspace equipment readiness panel
- added Schedule selected-job equipment warnings
- added Project Workspace summary from job-level equipment readiness
- added Equipment Detail recent assignment visibility
- added bounded read-only Dashboard Operational Cockpit equipment warning previews
- added focused warning-derivation and migration-scope tests

MVP exclusions:

- no maintenance records
- no usage/utilization entries
- no job-costing calculations
- no AP/procurement/bills/PO behavior
- no portal exposure
- no warranty/service workflow
- no autonomous rescheduling
- no AI automation

Additional deferred work after the foundation: project-level requirements before jobs exist, requirement templates from floor systems or estimate scope, scheduling acknowledgement evidence for proceeding with missing required equipment, dashboard-owned equipment cue state/mutation controls, maintenance, utilization, job costing, procurement/AP, warranty/service, portal visibility, and AI/guided assignment recommendations.

## Hardening Checkpoint

The first hardening pass extracted the warning derivation into a pure helper and
added focused tests for:

- missing required equipment
- missing optional equipment
- assigned equipment satisfying type/quantity requirements
- unavailable assigned assets: maintenance, out of service, retired, inactive
- rental-window mismatches before rental start and after rental end
- overlapping active assignments
- returned/canceled assignments staying non-active
- no-requirement jobs staying quiet

Migration assertion tests also check that the assignment/readiness migration keeps
same-company job/asset validation, project matching, RLS enforcement, and
owner/admin/manager write-policy shape in place.

Dashboard Operational Cockpit equipment blockers are now implemented as a
bounded read-only cockpit summary over the tested derived warnings. This adds
visibility only; it does not add cue-state mutation, schedule blocking, or
autonomous schedule behavior.

## Phase 2 Expansion

After MVP:

- project-level requirements before jobs exist
- requirement templates from floor systems or estimate scope
- assignment picker improvements for status/rental conflicts
- richer dashboard filtering and dashboard-owned acknowledgement/cue-state rules, if approved later
- richer schedule conflict filters
- equipment document links if the shared document layer supports it

Maintenance, utilization, rental-return, service/warranty equipment usage, and job-costing inputs are planned separately in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md).

## Phase 3 Expansion

Later depth:

- maintenance records and maintenance-due guidance
- utilization entries from field/time/daily-log workflows
- rental return tracking
- job-costing input summaries
- service/warranty equipment context
- equipment reports and utilization analytics
- mobile-first field capture for assigned equipment

## Testing And QA Strategy

Future implementation should include:

- migration review for foreign keys, indexes, constraints, and RLS
- tenant isolation tests for requirements and assignments
- validation tests for same-company equipment/job/project/person/vendor links
- unit tests for missing required equipment, optional equipment, asset status, rental-window mismatch, and overlap detection
- read-model tests for derived readiness summaries
- server action tests for create/update/cancel/return flows if actions are added
- Playwright smoke for Job Workspace equipment panel
- Playwright smoke for Schedule selected-job warning display
- Project Workspace smoke for aggregate equipment readiness
- regression validation that invoices, payments, contracts, signatures, portal access, project readiness gates, and existing job scheduling behavior are unchanged

## Risks And Open Questions

- Should MVP support project-level requirements before a job exists, or stay job-first to match the current schedule model?
- Should equipment type taxonomy remain fixed strings or move to tenant-owned configuration later?
- Should "schedule with missing required equipment" acknowledgements be stored, and if so where?
- How should all-day jobs, partial-day jobs, and timezone boundaries affect overlap checks?
- How should kit assets behave when one kit contains multiple tools?
- Which roles should be allowed to assign equipment or override warnings?
- How should subcontractor-owned equipment be represented without creating duplicate subcontractor identity?
- What is the right boundary between equipment warnings and hard readiness gates?
- Should assignment windows default from job schedule windows or require explicit equipment windows?
- How much equipment context, if any, belongs in future portal service/warranty workflows?

## Recommended Next Prompt

```text
Chat: FloorConnector Equipment Assignment And Job Readiness Foundation

Goal:
Implement the MVP equipment assignment/readiness slice from docs/equipment-assignment-readiness-plan.md.

Scope:
Add tenant-scoped job equipment requirements and equipment assignments, derived equipment readiness summaries, Job Workspace equipment readiness context, Schedule selected-job equipment warnings, and Project Workspace equipment readiness summary.

Hard constraints:
Do not add maintenance, utilization, job costing, AP/procurement, portal exposure, warranty/service behavior, AI automation, or autonomous rescheduling. Preserve canonical jobs, job_assignments, project readiness gates, financial/payment/signature behavior, tenant isolation, and existing schedule semantics.
```
