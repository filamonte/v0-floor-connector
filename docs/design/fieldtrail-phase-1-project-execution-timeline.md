# FieldTrail Phase 1 - Project Execution Timeline

Status: Active
Doc Type: Implementation Note

## Purpose

FieldTrail Phase 1 adds a read-only project/job execution history layer over
existing field records. It helps contractors see recent Daily Job Logs, Job
Notes, blockers, field evidence, labor time, and the next practical execution
handoff without creating a separate field-reporting subsystem.

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
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing Canonical Data Used

FieldTrail reads existing execution records only:

- `projects`
- `jobs`
- `daily_logs`
- `field_notes`
- `execution_attachments`
- `time_cards`
- existing project/job/daily-log/time links

Invoices and payments remain continuity links through existing project/job
surfaces; no finance behavior was added.

## Project / Job Surfaces Changed

- Project Workspace now includes a FieldTrail section inside the existing
  Operations Hub.
- Job Workspace now includes a compact job-specific FieldTrail panel.
- No route paths were added or renamed.

## FieldTrail Summary Implemented

The Project Workspace FieldTrail summary shows:

- latest Daily Job Log context
- Daily Job Log count
- open blocker/issue Job Notes count
- execution attachment and photo counts
- project time-card labor total
- a Next Move link to the latest Daily Job Log, current job, or CrewBoard

## FieldTrail Timeline Implemented

The Project Workspace timeline lists recent Daily Job Logs and groups existing
Job Notes, blocker counts, field evidence counts, photo counts, and labor time
by log date. It links to the owning Daily Job Log detail.

The Job Workspace panel keeps the same data compact and job-specific so the
Project Workspace remains the primary execution memory hub.

## Existing Behavior Preserved

FieldTrail is read-only. Existing behavior remains owned by the existing
surfaces and server actions:

- daily log create/update
- daily log project/date uniqueness
- field note parent daily-log validation
- execution attachment behavior
- time punch and derived time-card behavior
- project/job/daily-log links
- GateKeeper / Ready Check enforcement before execution workflows

## Intentionally Not Implemented Yet

- standalone field activity route
- customer-facing field note sharing
- full document management
- punchlist subsystem changes
- issue/blocker subsystem
- automated notifications
- offline mobile capture
- photo markup
- AI field summaries
- advanced labor costing
- payroll

## Follow-Up Candidates

- Add a reusable FieldTrail component if the same panel expands into service or
  warranty workspaces.
- Add richer closeout evidence once the shared file/evidence layer is designed.
- Add mobile-first daily-log capture improvements before offline support.
- Add customer-safe field sharing only after visibility, portal access, and
  evidence redaction rules are explicitly scoped.
