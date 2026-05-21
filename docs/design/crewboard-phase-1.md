# CrewBoard Phase 1

Status: Active
Doc Type: Implementation Note

## Purpose

CrewBoard Phase 1 makes `/schedule` the protected contractor scheduling
workspace for job timing, crew visibility, and project/job handoff review.

This phase improves the existing schedule manager surface without creating a
separate dispatch subsystem, schedule table, crew table, calendar model, or
automation layer.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/stitch/chrome-collapse-dashboard-header-cleanup.md`
- `docs/design/stitch/unified-header-architecture-cleanup.md`

## Existing Canonical Data Used

CrewBoard Phase 1 reads existing scheduling and execution data only:

- `jobs`
- `job_assignments`
- `people`
- `vendors`
- `projects`
- `customers`
- `appointments`
- opportunity site-assessment scheduling fields already surfaced by the
  schedule read model
- job equipment warning summaries already derived from existing equipment
  helpers

## Route / Surface Changed

- `/schedule` remains the route.
- The visible workspace name is now `CrewBoard`.
- Contractor navigation can label the existing `/schedule` route as
  `CrewBoard`; the route path is not renamed.

## CrewBoard Sections Implemented

CrewBoard Phase 1 surfaces these real-data sections:

- summary metrics for Needs Scheduling, scheduled today, in progress, Missing
  Crew, upcoming work, and recently done work
- Next Move guidance for scheduling, crew assignment, today, upcoming, and
  completed-job closeout handoff
- Needs Scheduling queue
- Today queue
- Upcoming queue
- Assigned crew visibility
- Missing Crew queue
- Completed / Recently Done queue
- CrewBoard planner with week, day, and board layouts
- board lanes for Needs Scheduling, Today, Tomorrow, Upcoming, later scheduled
  work, In Progress, Missing Crew, and Completed / Recently Done
- list view for visible jobs and appointments
- selected job action panel

## Schedule / Crew Actions Preserved

The existing schedule, unschedule, crew assignment, and crew unassignment
server actions remain the write paths. CrewBoard only improves how those actions
are reached from `/schedule`.

## GateKeeper / Ready Check Behavior Preserved

CrewBoard does not loosen project readiness enforcement. Job creation,
scheduling, and schedule-status transitions still depend on the existing
server-side project readiness checks. The UI uses GateKeeper and Ready Check
language to explain why missing work may need to be resolved in the Project
Workspace first.

Equipment warnings remain advisory only and do not become hard schedule gates in
this phase.

## Intentionally Not Implemented Yet

- drag/drop scheduling
- route optimization
- external calendar sync
- automated dispatch
- AI schedule suggestions
- notifications
- map views
- new schedule tables
- new crew tables
- new dispatch records
- new server actions

## Follow-Up Candidates

- a dedicated CrewBoard read-model helper if `/schedule` query volume needs more
  narrowing
- browser QA screenshots for desktop and mobile CrewBoard layouts
- stronger appointment/customer-visible schedule handoff once portal schedule
  behavior is explicitly scoped
- drag/drop rescheduling only after accessibility, validation, and server-action
  boundaries are designed
