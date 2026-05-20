# Equipment Management Plan

Status: Planning
Doc Type: Architecture / Product Plan
Date: 2026-05-18

This plan defines the target Equipment Management architecture for FloorConnector. It is primarily a planning document, with slice-level implementation status called out below. Implemented truth remains in [docs/current-state.md](C:/FloorConnector/docs/current-state.md).

Slice 1 update: the Equipment Registry Foundation is implemented through tenant-scoped `equipment_assets`, `/equipment`, and `/equipment/:id`. This creates the canonical asset registry.

Slice 2 update: Equipment Assignment and Schedule/Job Readiness foundation is implemented through job-first requirements, equipment-to-job assignments, and derived advisory warnings. The warning derivation now has focused tests, the migration shape has same-company/RLS assertion coverage, and the Dashboard Operational Cockpit shows bounded read-only equipment warning previews. Detailed planning/status lives in [docs/equipment-assignment-readiness-plan.md](C:/FloorConnector/docs/equipment-assignment-readiness-plan.md). Maintenance, utilization, job costing, procurement/AP, portal visibility, warranty/service behavior, AI automation, autonomous rescheduling, dashboard-owned equipment cue state, and hard equipment readiness blocks remain deferred. The next maintenance/utilization/costing path is planned in [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md).

Canonical lifecycle:

`opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`

## Executive Summary

Equipment Management should become a specialty-contractor resources layer over the existing FloorConnector operating chain. It should help contractors know what they own or rent, what is available, what is assigned, what is down, what needs maintenance, what is required for a job, and how equipment affects schedule readiness, field execution, warranty/service work, utilization, and job costing.

The first implementation should be an equipment registry foundation. Assignment, readiness, maintenance, utilization, and costing should build on that foundation in later slices.

Equipment must not become a disconnected asset silo, fake inventory system, separate schedule, duplicate vendor model, duplicate crew-assignment model, or standalone accounting ledger.

## Why Equipment Matters

Flooring, epoxy, concrete polishing, resinous flooring, coatings, and surface-prep contractors depend on specialized equipment to execute work:

- grinders
- polishers
- vacuums and dust collectors
- shot blasters
- scarifiers
- floor scrapers
- mixers
- sprayers
- trailers
- trucks
- generators
- moisture meters
- concrete testing tools
- coating tools
- burnishers
- hand tools and kits
- rental equipment

Equipment availability can decide whether a job can be scheduled, whether a crew can execute safely, whether a rented machine hits the correct job-cost bucket, and whether warranty/service work is completed inside the promised window.

Most contractor systems treat equipment as a static asset list. FloorConnector should treat it as operating context attached to projects, jobs, people, vendors, documents, time, maintenance, warranty/service, and future job costing.

## Current Foundation To Connect

Equipment should connect to existing or documented FloorConnector foundations:

- `companies` / tenant scoping for every equipment-owned record.
- `vendors` for purchase, rental, service, calibration, and maintenance relationships.
- `people` for responsible operators, assignees, inspectors, and maintenance performers.
- `projects` as the operational continuity hub.
- `jobs` and `job_assignments` for production execution and crew context.
- `/schedule` as the existing canonical job scheduling surface.
- time punch events and time cards for future equipment usage and labor/cost correlation.
- daily logs, field notes, execution attachments, and future shared documents for field evidence.
- compliance records or a future compliance-subject extension for certifications, inspections, calibration, and safety records.
- invoices, payments, progress billing, and future AP/job-costing records for financial reporting inputs.
- deterministic operational cues for future equipment readiness and maintenance warnings.

Equipment should not reuse `catalog_items` as an asset registry. Catalog/cost items can describe sellable or costable item types; equipment assets are physical resources with condition, ownership, assignment, and maintenance state.

## Product Goals

- Give contractors a tenant-owned equipment registry for owned, rented, leased, and borrowed equipment.
- Track operational status: available, reserved, assigned, in use, needs service, in maintenance, down, and retired.
- Tie equipment assignments to projects, jobs, people, vendors, and schedule windows.
- Warn when required equipment is missing, unavailable, down, or outside its rental window.
- Capture maintenance, service, inspection, calibration, documents, and photos against the equipment record.
- Support future equipment usage, utilization, and costing without mutating invoices or payments directly.
- Support warranty/service work with equipment and warranty-time context.
- Preserve human-confirmed scheduling and financial workflows.

## User Stories

- As an operations manager, I want to see every grinder, vacuum, sprayer, trailer, truck, and specialty tool we own or rent so I know what is available.
- As a scheduler, I want to know whether a job requires a grinder, vacuum, generator, or rental machine before I schedule the crew.
- As a project manager, I want to assign equipment to a project or job and see conflicts before the work starts.
- As a crew lead, I want to see which equipment is expected on my job and report if something is down or missing.
- As an office manager, I want maintenance records, manuals, warranty documents, calibration certificates, and rental paperwork attached to the equipment.
- As an owner, I want rented equipment and usage hours to support future job costing and rental-vs-owned decisions.
- As a service coordinator, I want warranty/service work to capture the equipment used and any warranty time separately from standard production work.
- As a maintenance owner, I want upcoming maintenance or calibration to appear before it affects job readiness.

## Equipment Categories And Types

Initial categories should be practical and specialty-contractor friendly:

- surface preparation machines
- grinders and polishers
- dust control
- removal and demolition equipment
- coating and application equipment
- mixing equipment
- testing and measurement tools
- vehicles and trailers
- power and generators
- hand tools and kits
- safety and compliance equipment
- rental equipment
- other

Type values can start as controlled strings or enums if the first schema pass needs simplicity. A separate type/configuration table should wait until contractors need tenant-specific taxonomy, custom fields, or reporting groups.

## Proposed Entities And Schema Outline

This section is a schema outline only. Do not add these tables until an implementation prompt explicitly authorizes schema work.

### `equipment_assets`

Purpose: the canonical equipment record.

Suggested fields:

- `id`
- `company_id`
- `name`
- `asset_tag`
- `category`
- `equipment_type`
- `ownership_type`: `owned`, `rented`, `leased`, `borrowed`
- `status`: `available`, `reserved`, `assigned`, `in_use`, `needs_service`, `in_maintenance`, `down`, `retired`
- `manufacturer`
- `model`
- `serial_number`
- `vendor_id`
- `purchase_date`
- `rental_start_at`
- `rental_end_at`
- `hourly_cost_rate`
- `daily_cost_rate`
- `replacement_cost`
- `location_note`
- `notes`
- `created_at`
- `updated_at`

Tenant rule: always scope by `company_id`. Vendor links must also remain tenant-safe.

### `equipment_assignments`

Purpose: planned or active equipment placement.

Suggested fields:

- `id`
- `company_id`
- `equipment_asset_id`
- `project_id`
- `job_id`
- `person_id`
- `vendor_id`
- `assigned_start_at`
- `assigned_end_at`
- `status`: `planned`, `active`, `returned`, `cancelled`
- `purpose`
- `created_by_user_id`
- `returned_at`
- `notes`
- `created_at`
- `updated_at`

Assignment should complement, not replace, `job_assignments`. People are crew/operator context; equipment remains a resource context.

### `equipment_maintenance_records`

Purpose: maintenance, repair, inspection, and calibration history.

Suggested fields:

- `id`
- `company_id`
- `equipment_asset_id`
- `vendor_id`
- `performed_by_person_id`
- `maintenance_type`
- `status`: `scheduled`, `due`, `in_progress`, `completed`, `cancelled`
- `scheduled_for`
- `completed_at`
- `usage_hours_at_service`
- `cost_amount`
- `blocks_scheduling`
- `summary`
- `notes`
- `created_at`
- `updated_at`

Maintenance should affect readiness and scheduling guidance only after explicit rules are implemented.

### `equipment_usage_entries`

Purpose: usage/utilization evidence for field, maintenance, and costing.

Suggested fields:

- `id`
- `company_id`
- `equipment_asset_id`
- `project_id`
- `job_id`
- `person_id`
- `time_card_id`
- `daily_log_id`
- `usage_start_at`
- `usage_end_at`
- `usage_hours`
- `usage_source`: `manual`, `assignment`, `time_card`, `daily_log`
- `cost_rate_snapshot`
- `cost_amount`
- `notes`
- `created_at`
- `updated_at`

Usage entries should feed future utilization and job costing reports. They must not create invoice/payment mutations by themselves.

### Future Relationship Entities

Possible later entities:

- `job_equipment_requirements`: required equipment category/type/quantity for a job or project.
- `equipment_status_events`: append-only status evidence if audit requirements exceed simple updated state.
- `equipment_document_links`: only if the shared document/evidence layer cannot express equipment links cleanly.
- `equipment_reservations`: only if assignment windows are not enough for dispatch-grade capacity planning.
- `equipment_cost_rate_snapshots`: only if job costing needs historical rate governance beyond fields on the asset or usage entry.

## Status Lifecycle

Recommended first lifecycle:

1. `available`: usable and not currently committed.
2. `reserved`: planned for future work.
3. `assigned`: committed to a project/job/person/vendor window.
4. `in_use`: actively being used on a job or service visit.
5. `needs_service`: usable with warning or pending maintenance review.
6. `in_maintenance`: unavailable because service is scheduled or underway.
7. `down`: unavailable and should block or warn scheduling.
8. `retired`: no longer operationally assignable.

Status changes should be explicit and auditable enough for operations, but the MVP does not need a full event-sourced equipment ledger.

## Ownership And Rental Model

Owned equipment should support:

- asset tag
- serial/manufacturer/model
- purchase/service/warranty documents
- status and maintenance history
- optional cost rate for future job costing

Rented equipment should support:

- rental vendor
- rental start/end
- rental paperwork
- rental cost snapshot
- job/project assignment
- return status

Rental equipment should be allowed to affect job costing later, but it should not automatically create AP bills, invoices, or payments until procurement/AP workflows are explicitly designed.

## Assignment Model

Assignments should answer: where is the equipment expected to be, when, and under whose responsibility?

Preferred hierarchy:

- job assignment is strongest for scheduled production work
- project assignment is useful before job detail exists
- person assignment is useful for kits, vehicles, or operator-held tools
- vendor assignment is useful for rentals, service, calibration, or repair

Do not create a separate equipment calendar disconnected from jobs. Calendar-style views should derive from equipment assignments and canonical job/schedule windows.

## Maintenance Model

Maintenance should support:

- scheduled maintenance
- repair
- inspection
- calibration
- safety check
- warranty/service on equipment itself
- vendor-performed service
- internal performed-by-person records
- cost tracking for future reporting
- scheduling block/warning flag

MVP maintenance can be manual. Future maintenance can be suggested from usage hours, dates, or manufacturer/service intervals.

## Schedule, Conflict, And Availability

Schedule interactions should be deterministic:

- warn if assigned equipment overlaps another active/planned assignment
- warn if required equipment is missing
- warn or block if assigned equipment is `down` or `in_maintenance`
- warn if rented equipment does not cover the job schedule window
- show upcoming rental return or maintenance dates when they affect a job

Scheduling should remain human-confirmed. Equipment readiness should guide and warn; it should not auto-reschedule jobs.

## Job Readiness

Equipment readiness should eventually become one input into job readiness, separate from existing commercial/financial readiness gates.

Potential readiness states:

- no required equipment defined
- equipment requirements defined but unassigned
- required equipment assigned and available
- assigned equipment unavailable
- rental window mismatch
- maintenance/service conflict

Do not weaken existing project readiness semantics. Equipment readiness should add operational context after the core readiness rules remain intact.

## Job Costing And Utilization

Equipment should feed future job costing through:

- rental cost snapshots
- owned-equipment hourly/daily cost rates
- usage entries
- maintenance costs
- assignment duration
- project/job context

The job-costing layer should derive cost from equipment usage and approved financial/cost inputs. Equipment should not create financial truth by itself and should not mutate invoices, payments, tax, retainage, or progress billing without an approved financial workflow.

Utilization reporting should eventually answer:

- which equipment is underused
- which rentals are overused or late
- which assets spend too much time down
- which jobs consume the most machine time
- whether renting or owning makes sense for specific categories

## Service And Warranty Workflows

Equipment should connect to service/warranty in two ways:

- equipment used during customer warranty/service visits
- maintenance/service history of the equipment asset itself

Customer warranty/service work should attach to the original project, customer, job, installed system/product, field notes, photos, time, materials, equipment, and billing context. It should not become a detached helpdesk.

## Documents, Photos, Compliance, And Safety

Equipment document needs include:

- manuals
- warranties
- rental agreements
- purchase documents
- service records
- inspection forms
- calibration certificates
- insurance/compliance documents
- safety sheets
- photos

These should use or extend the future shared document/evidence layer. Do not create a file island that only equipment can see.

Compliance and safety records should connect to equipment only if the compliance model supports a clean subject relationship. If not, the first equipment slice should defer compliance-subject expansion rather than forcing a one-off equipment compliance table.

## Dashboard, Project, And Schedule UX Concepts

Dashboard:

- equipment needing maintenance
- equipment down that affects upcoming jobs
- rental return or pickup warnings
- jobs missing required equipment
- implemented now: bounded read-only equipment readiness warnings for relevant jobs in the Dashboard Operational Cockpit

Project Workspace:

- equipment required for the project/job
- assigned equipment
- readiness warnings
- related maintenance/rental/document links

Schedule:

- equipment conflicts alongside crew conflicts
- availability warnings in selected job action panel
- rental-window mismatch warnings
- maintenance conflicts before scheduling confirmation

Equipment Manager:

- registry list
- status filters
- ownership filters
- maintenance due queue
- assigned/currently in-use queue
- rental return queue

## AI And Guided Future

AI can eventually help with:

- recommending equipment for a job based on scope, system, surface prep, square footage, and site conditions
- summarizing equipment conflicts and maintenance risks
- drafting maintenance notes
- identifying underused or high-cost equipment
- suggesting rent-vs-own analysis
- warning that a scheduled job lacks required equipment
- explaining why a job is not equipment-ready

AI must remain an operating layer over canonical records. It may draft and suggest, but it must not create AI-only equipment truth, auto-reschedule jobs, create financial transactions, or bypass human confirmation.

## Anti-Silo Guardrails

- Equipment records must be tenant-owned and `company_id` scoped.
- Equipment must attach to canonical vendors, people, projects, jobs, schedule, time, field evidence, documents, warranty/service, and future costing.
- Do not create a duplicate vendor/rental-company model.
- Do not create a duplicate crew/person assignment model.
- Do not create a separate schedule/calendar source of truth.
- Do not treat catalog items as physical equipment assets.
- Do not create equipment-owned financial balances.
- Do not mutate invoices, payments, retainage, tax, or progress billing from equipment events.
- Do not create portal-only equipment copies.
- Do not make AI or guidance a source of equipment truth.

## MVP Slice

Implemented first slice: Equipment Registry Foundation.

Scope:

- `equipment_assets` tenant-owned registry.
- Owned/rented/leased/subcontractor-owned/other ownership model.
- Practical equipment type values and operational status lifecycle.
- Vendor link for purchase/rental/service context.
- Basic manager page with search/filter/status cards.
- Equipment detail workspace with notes and clearly marked planned-later placeholders.
- Advisory schedule conflict warnings now exist in the assignment/readiness foundation.
- No hard equipment readiness gates.
- Job-first assignment tables now exist.
- No maintenance records yet.
- No utilization or usage entries yet.
- No job costing mutations.
- No AP/procurement coupling.
- No portal visibility or AI behavior.

This creates the canonical object before adding operational logic.

## Phase 2

Implemented second foundation phase: Equipment Assignment And Readiness.

Scope:

- assign equipment to canonical jobs with derived project continuity
- show project/job equipment context
- warn on inactive/retired/maintenance/out-of-service assigned equipment
- warn on active assignment overlap
- integrate schedule selected-job action panel with equipment warnings
- keep schedule changes human-confirmed

Detailed planning/status for this phase lives in [docs/equipment-assignment-readiness-plan.md](C:/FloorConnector/docs/equipment-assignment-readiness-plan.md). The implemented foundation is job-first equipment requirements, equipment assignments, derived readiness/conflict summaries, Job Workspace mutation UI, Schedule selected-job warnings, Project Workspace summary warnings, Equipment Detail recent assignment visibility, and bounded read-only Dashboard Operational Cockpit equipment warnings. Project-level requirements before jobs exist, maintenance, utilization, costing, procurement/AP, portal visibility, warranty/service, AI automation, dashboard-owned equipment cue state, autonomous rescheduling, and hard readiness blocks remain future work.
The first hardening pass added focused warning-derivation tests and migration
scope/RLS assertion tests without changing scheduling behavior or readiness gates.

## Phase 3

Recommended third phase: Maintenance, Utilization, And Costing Inputs. The detailed planning reference is [docs/equipment-maintenance-utilization-plan.md](C:/FloorConnector/docs/equipment-maintenance-utilization-plan.md).

Scope:

- maintenance records and maintenance due queue
- usage entries from manual field capture, daily logs, and time workflows
- rental window/rental return tracking
- job-costing input summaries
- equipment utilization reports
- service/warranty equipment context

## Testing And QA Strategy

Future implementation should include:

- schema/RLS tests for tenant isolation
- server-action validation for create/update/status changes
- assignment conflict unit tests
- deterministic readiness warning tests
- manager read-model tests for bounded list/count behavior
- Playwright smoke for equipment registry and detail workspace
- schedule smoke for equipment-warning display after assignment/readiness exists
- regression checks proving invoices, payments, contracts, readiness gates, portal access, and job scheduling behavior are not mutated by equipment display state

Implemented hardening now covers deterministic warning derivation and migration
scope assertions. Remaining QA depth should prioritize protected browser smoke for
Job/Schedule/Project equipment warning visibility once stable fixtures exist,
plus server-action tests if a lightweight authenticated action harness becomes
available.

## Risks And Open Questions

- Should equipment requirements live on jobs first, project templates later, or system templates later?
- Does the current compliance model support equipment as a subject cleanly, or should equipment compliance wait?
- Should asset type taxonomy be global starter data, tenant-owned settings, or simple enums at MVP?
- How should kit behavior work when a set of tools travels together?
- When should rental equipment connect to POs/AP/bills?
- How should depreciation or owned-equipment internal rates be represented without pretending FloorConnector is accounting truth?
- What field/mobile capture is needed before equipment usage entries are reliable?
- Which maintenance statuses should block scheduling versus warn only?
- How much equipment context should customers see, if any, through portal service/warranty workflows?

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
