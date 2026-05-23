# Mobile Field Phase 2 - Quick Job Notes And Evidence

Status: Implemented
Doc Type: Implementation Note

## Purpose

Mobile Field Phase 2 makes Job Notes, blockers, and field evidence faster to
capture from Job Workspace, Daily Job Log Workspace, and FieldTrail while
preserving Daily Job Logs as the owner of field capture.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md](C:/FloorConnector/docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md)
- [docs/design/mobile-field-phase-1-qa-checkpoint.md](C:/FloorConnector/docs/design/mobile-field-phase-1-qa-checkpoint.md)
- [docs/design/fieldtrail-phase-1-project-execution-timeline.md](C:/FloorConnector/docs/design/fieldtrail-phase-1-project-execution-timeline.md)
- [docs/design/proof-center-phase-1-project-document-evidence-index.md](C:/FloorConnector/docs/design/proof-center-phase-1-project-document-evidence-index.md)
- [docs/design/closeouttrail-phase-1-project-closeout-workspace.md](C:/FloorConnector/docs/design/closeouttrail-phase-1-project-closeout-workspace.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Existing Data Used

- Daily Job Logs
- Job Notes
- execution attachments
- jobs and projects
- time cards and labor continuity where already loaded
- FieldTrail summary derivation

## Surfaces Changed

- Job Workspace FieldTrail quick-capture actions
- Daily Job Log Workspace Job Notes and Field Evidence sections
- Project Workspace FieldTrail empty-state handoff
- Daily Log link helpers
- FieldTrail summary Next Move routing
- Job Note label helpers

## Quick Capture Behavior

Job Workspace now shows a compact quick field capture area inside FieldTrail:

- Add Job Note
- Add blocker
- Open or start today's Daily Job Log
- Add field evidence

When today's Daily Job Log exists, the Job Note and field evidence actions jump
to that log's exact section. When it does not exist, the actions use the
existing Daily Log quick-create path with project, job, and day prefilled. Job
Notes are not created without a Daily Job Log.

Daily Job Log Workspace now exposes top-of-page anchors for Add Job Note, Add
blocker, and Add field evidence. The form language uses Job Notes, Blocker, and
Field evidence while keeping the existing storage/file-reference behavior.

## Link/Helper Behavior

`buildDailyLogSectionHref` builds section-specific Daily Job Log links:

- `#job-notes`
- `#field-evidence`

FieldTrail routes open blocker context to `#job-notes` and missing field
evidence to `#field-evidence`. Missing-log FieldTrail behavior still uses the
existing quick-create Daily Job Log path.

## Existing Behavior Preserved

- Daily Job Log create/update behavior
- Daily Log project/date uniqueness
- Job Note validation under Daily Job Logs
- execution attachment storage/file-reference behavior
- project readiness enforcement
- time-card derivation
- FieldTrail read-only summary behavior

## What Is Intentionally Not Implemented Yet

- schema changes or migrations
- new field subsystem
- issue, blocker, or punchlist tables
- new upload/storage mechanics
- offline mode
- GPS/geofencing
- customer/portal field visibility
- AI summaries
- notifications or automation

## Follow-Up Candidates

- Add stable protected browser fixture coverage for mobile Job Workspace and
  Daily Job Log Workspace.
- Add safer defaulting for the Job Note type select if field crews need a
  one-tap blocker preset later.
- Design real file upload/storage depth only after shared evidence ownership is
  explicitly approved.
