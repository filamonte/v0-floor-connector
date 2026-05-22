# Mobile Field Phase 1 - Fast Daily Job Log Capture

Status: Implemented
Doc Type: Implementation Note

## Purpose

Mobile Field Phase 1 improves the existing Daily Job Log capture loop for
phone-sized field use without creating a native app, offline mode, duplicate
field subsystem, or new execution records.

The slice keeps Daily Job Logs, Job Notes, execution attachments, jobs,
projects, time cards, and FieldTrail on the existing project/job execution
chain while making the first field capture step faster from Daily Logs, Job
Workspace, and CrewBoard.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/vision.md](C:/FloorConnector/docs/vision.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/product-language-audit.md](C:/FloorConnector/docs/product-language-audit.md)
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md)
- [docs/design/projectpulse-phase-1-project-health-summary.md](C:/FloorConnector/docs/design/projectpulse-phase-1-project-health-summary.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/crewboard-phase-1.md](C:/FloorConnector/docs/design/crewboard-phase-1.md)
- [docs/design/crewboard-phase-2-dispatch-usability.md](C:/FloorConnector/docs/design/crewboard-phase-2-dispatch-usability.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Existing Data Used

This slice uses existing records and helpers:

- Daily Job Logs
- Job Notes
- execution attachments
- jobs and projects
- time cards and labor summaries
- FieldTrail summary derivation
- Daily Log quick-create and update actions
- existing protected app auth and tenant-safe loaders

No schema, migrations, new tables, route rewrites, new upload mechanics, or
server-action ownership changes were added.

## Surfaces Changed

- Daily Logs Manager Page
- Daily Job Log Workspace
- Job Workspace FieldTrail panel
- CrewBoard schedule job action links and selected-job panel
- FieldTrail summary helper
- shared Daily Log, Job Note, and execution attachment forms

## Mobile Daily Job Log Improvements

The Daily Job Log form now reads in a more field-oriented order:

1. Project / job / day
2. Work completed
3. Next work / blockers / safety
4. Weather

The update form uses clearer section grouping, larger mobile save affordance,
and a sticky save area on narrow screens. Job Notes and attachment buttons now
span full width on mobile so field users are not aiming for small controls.

The Daily Log quick-create sheet now uses `Start Daily Job Log` language,
accepts a safe default `logDate` from query params, and keeps copy focused on
project/job/day selection before opening the full Daily Job Log Workspace.

## Fast Paths Added

Job Workspace:

- Detects today's existing Daily Job Log for the job when one exists.
- Shows `Open today's Daily Job Log` if today's job log exists.
- Shows `Start today's Daily Job Log` when no job log exists for today.
- Uses the existing `/daily-logs` quick-create sheet with project, job, and day
  prefilled.

CrewBoard:

- Adds a Daily Job Log action to job action links on the schedule surface.
- Adds `Start Daily Job Log` to the selected-job panel.
- Uses existing Daily Log quick-create behavior and does not create logs
  directly from CrewBoard.

FieldTrail:

- Missing-log Next Move now starts a Daily Job Log from the current job context
  instead of only opening the Job Workspace.
- Existing-log and open-blocker Next Moves still route to the latest Daily Job
  Log.

## Existing Behavior Preserved

Preserved:

- Daily Log project/date uniqueness
- Daily Log create/update actions
- project readiness enforcement
- field-note validation under Daily Job Logs
- execution attachment behavior
- time-card derivation
- job, schedule, payment, invoice, estimate, contract, signature, portal,
  settings, platform-admin, auth, RLS, and tenant behavior

The new helper only builds Daily Log capture links and selects an existing
job/day log from already-loaded Daily Log records.

## Intentionally Not Implemented Yet

- native mobile app
- offline mode
- GPS/geofencing or background location
- push notifications
- AI field summaries
- new photo upload mechanics
- photo markup
- advanced punchlist subsystem
- customer-facing field sharing
- payroll/labor approval
- full mobile redesign

## Follow-Up Candidates

- Add fixture-safe protected browser coverage for Daily Logs mobile viewport.
- Improve daily-log detail anchor navigation after more field users exercise
  the page.
- Add a portal/customer-safe field visibility plan only after internal capture
  boundaries are stable.
- Consider attachment upload depth only after storage/versioning and evidence
  policy are explicit.

## Browser QA Limitations

Protected-route browser QA depends on local Supabase Auth state. If auth state,
rate limits, or stale fixtures block detail routes, use
[docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
and report the blockage honestly.
