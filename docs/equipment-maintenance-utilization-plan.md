# Equipment Maintenance / Utilization / Costing Plan

Status: Planning
Doc Type: Architecture / Product Plan

This plan defines the maintenance, utilization, and costing path that should build on the implemented equipment registry and assignment/readiness foundations. It is planning only and does not authorize application code, schema, migrations, tests, AP/procurement behavior, job costing, portal exposure, or financial mutations.

Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

FloorConnector now has a tenant-scoped equipment registry plus job equipment requirements, equipment assignments, and advisory readiness warnings. The next equipment depth layer should add maintenance records, usage/utilization evidence, rental lifecycle tracking, and job-costing inputs without turning equipment into a detached asset/accounting system.

Equipment should remain operational context connected to vendors, people, jobs, projects, schedule, time, documents, warranty/service, and future job costing.

## Current Equipment Foundation

Implemented foundations include:

- `equipment_assets`
- `/equipment` Equipment Manager Page
- `/equipment/:id` Equipment Workspace
- asset identity, ownership/rental status, vendor linkage, operational status, purchase/rental fields, notes, active state
- `job_equipment_requirements`
- `equipment_assignments`
- derived advisory readiness warnings
- Job Workspace equipment forms/warnings
- Schedule selected-job warnings
- Project Workspace compact equipment summary
- Dashboard Operational Cockpit read-only warning previews
- focused warning-derivation and migration-scope tests

Not implemented: maintenance, utilization, job costing, procurement/AP, portal visibility, warranty/service behavior, AI automation, autonomous rescheduling, dashboard-owned cue state, or hard equipment readiness blocks.

## Product Goals

- Track preventive maintenance, repairs, inspections, calibration, and downtime.
- Capture usage evidence by project/job/person/time card/daily log where appropriate.
- Support rental pickup, use, return, and vendor context.
- Prepare equipment costs for future job-costing reports without mutating financial records.
- Tie maintenance and usage warnings into Schedule, Project, Job, Dashboard, and service/warranty context.
- Keep equipment records tenant-owned and connected to canonical vendors, people, projects, jobs, schedule, time, documents, and future costing.

## Maintenance Tracking

Maintenance records should answer:

- what happened
- when it was due or performed
- who performed it
- which vendor was involved
- whether it affects operational status or scheduling
- what documents/photos support it
- what cost should be available for future reporting

Maintenance should update equipment readiness guidance only through explicit, deterministic rules.

## Preventive Maintenance Vs Repair Records

Preventive maintenance covers planned service such as oil changes, filters, inspections, calibration, blade/tooling checks, and scheduled service intervals.

Repair records cover unexpected failures, damage, replacement parts, vendor repair, and field breakdowns.

Both should attach to the same equipment asset and preserve vendor/person/project/job context where known.

## Equipment Status Events

The current asset status is useful for assignment and readiness. A future `equipment_status_events` concept may be needed when audit and reporting need more than the current status field.

MVP can start with maintenance records and asset status updates. Append-only status events should wait until the implementation needs historical status reporting, downtime analytics, or strict audit evidence.

## Downtime Handling

Downtime should be explicit when equipment is down, in maintenance, or unavailable for job work. Downtime can affect:

- assignment picker warnings
- Schedule selected-job warnings
- Project Workspace equipment summaries
- Dashboard Operational Cockpit guidance
- future utilization and reliability reports

Downtime should not auto-reschedule jobs.

## Maintenance Reminders/Advisory Cues

Maintenance reminders should begin as deterministic advisory cues:

- maintenance due by date
- calibration/inspection due
- rented equipment return due
- equipment down and assigned to upcoming job
- asset repeatedly reported as needing service

Cue-state mutation, snooze, and acknowledgement should reuse existing operational cue patterns only after a clear design is approved.

## Equipment Usage/Utilization

Usage entries should capture actual equipment use in a way that can support utilization and costing later.

Possible sources:

- manual field entry
- assignment-based confirmation
- daily log equipment section
- time-card-linked equipment usage
- service/warranty visit usage

Usage should include equipment asset, project, job, person, source, start/end or hours, and optional notes. Usage is evidence for reporting, not billing truth.

## Rental Equipment Lifecycle

Rental equipment should track:

- rental vendor
- rental window
- assigned project/job
- expected return
- actual return
- rental paperwork/documents
- cost-rate or rental-cost snapshot for future costing

Rental windows should continue to warn when they do not cover the assigned job or service visit. AP bills and POs remain future procurement/accounting workflows.

## Vendor/Rental-Provider Connection

Rental providers, maintenance vendors, calibration vendors, and equipment suppliers should use canonical vendors. Do not create a rental-provider table or equipment-specific vendor model.

Vendor context should support reporting and documents but not replace the vendor module.

## Equipment Cost-Rate Planning

Equipment cost rates can support future internal job costing:

- hourly owned-equipment internal rate
- daily owned-equipment internal rate
- rental rate snapshot
- repair/maintenance cost
- downtime cost concepts later

Cost rates should be snapshots when used for historical reporting. They should not expose internal cost to customer-facing documents by default.

## Future Job-Costing Integration

Future job costing can derive equipment costs from:

- usage entries
- rental cost snapshots
- maintenance costs allocated by policy
- assignment duration
- job/project context

Job costing should be a report/control layer. Equipment events should not create invoices, payments, bills, AP entries, tax changes, retainage changes, or progress billing mutations automatically.

## Warranty/Service Equipment Usage

Warranty/service work should capture equipment used during the visit and tie it back to the original project/job/install context. This helps answer whether service labor required grinders, vacs, testing tools, trailers, or rental equipment.

The same equipment foundation should serve production work and service/warranty work.

## Document/Compliance Links

Equipment documents can include:

- manuals
- purchase records
- rental agreements
- service invoices or receipts
- calibration certificates
- inspection records
- warranty documents
- photos

These should use or extend the future shared document/evidence layer. Equipment should not create a file island.

Compliance links should wait until the compliance model supports equipment as a clean subject or a shared evidence model can express the relationship.

## Schedule Readiness Interactions

Maintenance, downtime, rental windows, and usage context should feed advisory schedule readiness:

- assigned asset is down
- assigned asset is in maintenance
- maintenance due before job start
- rental return before job end
- asset already in use elsewhere

Scheduling remains human-confirmed unless a future approved workflow explicitly adds a hard readiness block.

## Dashboard/Project/Schedule Guidance

Dashboard should surface high-signal equipment risks only:

- upcoming job missing required equipment
- assigned equipment down or in maintenance
- rental return risk
- maintenance due on assigned equipment

Project and Job Workspaces should show context and hand off to Equipment Workspace for detailed edits. Schedule should show conflicts near crew/readiness context.

## Mobile Field Capture Future

Field capture should eventually support:

- report equipment down
- confirm assigned equipment on site
- enter usage hours
- attach photo
- add maintenance note
- mark rental returned

This should be responsive web first. Offline sync requires a separate conflict plan.

## AI/Guided Opportunities

AI or guided assistance can later:

- suggest maintenance based on usage
- summarize repeated downtime
- draft maintenance notes
- explain schedule/equipment conflicts
- propose rent-vs-own analysis
- recommend equipment for service/warranty visits

AI must not auto-reschedule, auto-assign equipment, create financial records, or become equipment truth.

## Anti-Silo Guardrails

- Equipment must remain tenant-owned and canonical.
- Use canonical vendors, people, jobs, projects, schedule, time, documents, and service/warranty context.
- No duplicate rental-provider, crew, vendor, or job model.
- No equipment-owned accounting ledger.
- No automatic invoice, payment, AP, tax, retainage, or progress-billing mutation.
- No detached equipment calendar as source of truth.
- No portal exposure without a customer-safe service/warranty design.
- No AI-owned equipment state.

## MVP Implementation Slice

Recommended MVP:

- maintenance records for preventive maintenance, repair, inspection, and calibration
- maintenance due/completed status
- equipment status update path with audit reason
- maintenance/vendor/person/document links where current foundations safely support them
- basic maintenance due/down equipment guidance in Equipment, Job, Schedule, Project, and Dashboard surfaces
- manual usage entry concept tied to job/project/person and optional daily-log/time-card context

MVP exclusions:

- AP/procurement
- automatic job costing
- depreciation
- portal exposure
- autonomous scheduling behavior
- AI automation
- offline field capture

## Phase 2/3 Expansion

Phase 2:

- usage entries from daily logs and time cards
- rental return workflow
- utilization reporting
- maintenance reminder cues
- service/warranty equipment context

Phase 3:

- job-costing equipment inputs
- cost-rate snapshot governance
- mobile/offline capture
- AI summaries and recommendations
- richer maintenance analytics

## Testing/QA Strategy

Future implementation should include:

- migration/RLS validation for tenant-owned maintenance and usage records
- same-company validation for equipment, vendors, people, jobs, projects, time cards, and daily logs
- unit tests for maintenance due, downtime, rental return, and warning derivation
- server-action tests for create/update/complete/cancel maintenance
- Playwright smoke for Equipment Workspace maintenance and Job/Schedule/Project warnings
- regression checks proving invoices, payments, contracts, signatures, portal access, project readiness gates, and schedule behavior are unchanged

## Open Questions

- Which maintenance types should be first-class versus configurable text?
- Should maintenance update equipment status automatically or ask for confirmation?
- Should usage entries begin as manual entries or be derived from assignment/time context?
- How should rental costs be captured without AP/bills?
- Which roles can mark equipment down, complete maintenance, or edit cost rates?
- Does the shared document layer need to exist before equipment documents deepen?
- How much equipment context should customers see in future service/warranty workflows?
