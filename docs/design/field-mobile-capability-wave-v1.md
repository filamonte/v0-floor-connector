# Field/Mobile Capability Wave v1

Status: Planning Only
Doc Type: Design

## 1. Status And Intent

This is a planning-only document. It is not an implementation claim and does
not mean the current branch has a complete mobile field app, offline workflow,
dispatch system, payroll workflow, or customer-visible field state.

Field/Mobile Wave v1 should follow Project Workspace and coordinate tightly
with Scheduling because field execution is downstream of project readiness and
job scheduling. Project Workspace remains the readiness and continuity hub.
CrewBoard / Scheduling remains the schedule visibility and action surface over
canonical jobs and job assignments. Field/mobile should make execution usable
for foremen, crews, and field managers from a mobile-first web perspective
without splitting away from the canonical project/job chain.

The goal is to make daily execution easier to open, scan, capture, and hand off
from the field while continuing through canonical `jobs`, `daily_logs`,
`field_notes`, `execution_attachments`, `people`, `vendors`, `job_assignments`,
`time_punch_events`, and derived `time_cards`.

## 2. Source Docs Read

Requested docs read:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/sales-to-production.md`

Relevant field/mobile/scheduling/project docs read:

- `docs/field-operations-architecture-map.md`
- `docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md`
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/design/mobile-field-phase-3c-evidence-upload-foundation.md`
- `docs/design/mobile-field-phase-3d-a-evidence-preview-rows.md`
- `docs/design/mobile-field-phase-3e-evidence-archive-delete-policy.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/context-rich-work-items-and-assignments.md`

Requested docs missing from this stream worktree during the original planning
pass:

- `docs/design/project-workspace-capability-wave-v1.md`
- `docs/design/scheduling-capability-wave-v1.md`

Because those two cross-stream planning docs were missing in that stream
worktree, this plan used the current branch docs plus the prompt's
cross-stream guidance: Project Workspace stays the readiness/continuity hub,
Scheduling extends canonical jobs and `job_assignments`, and Field/Mobile
continues through the existing field execution records rather than creating a
separate field app model.

Reconciled-docs note: both sibling docs are now present in the main docs set.
The missing-doc note above is preserved as historical stream-planning context,
not current missing-doc status.

## 3. Current Implemented Baseline

Based on the docs and inspected code, the current baseline is an implemented
foundation, not a complete mobile field product.

- Jobs/work orders exist as canonical execution records. Job surfaces are backed
  by `jobs` helpers and route files, and scheduling fields live on the job
  foundation.
- Job scheduling and crew assignment exist through `jobs` schedule fields and
  `job_assignments`, with CrewBoard using those records rather than a dispatch
  table.
- Daily Logs exist as canonical project/date execution records. The schema
  keeps one Daily Log per organization/project/date, with optional job context.
- Field Notes exist under Daily Logs for observations, blockers, issues, safety,
  material, equipment, and related execution context. They are not a separate
  issue or blocker subsystem.
- Execution attachments exist as lightweight subject-scoped metadata for Daily
  Logs, Field Notes, and now Work Items. Field evidence uses the private
  `documents` bucket, contractor-side signed preview links, and metadata
  archive/restore.
- Time tracking exists through canonical `time_punch_events`; `time_cards` are
  derived review summaries. Service/warranty attribution also reuses those time
  records.
- People, vendors, compliance, and assignment foundations exist. CrewBoard and
  field-related surfaces read people/vendors where assignment context is
  available.
- Project and Job detail surfaces already provide field execution continuity
  through FieldTrail, Daily Log links, Job Note capture handoffs, evidence
  counts, labor/time visibility, and project/job navigation.
- `/field/work-items` exists as a mobile-friendly assigned Work Item queue for
  the current user's linked active assignable Person record. That surface is
  internal field work-item depth, not a replacement for Daily Logs or Job Notes.

## 4. Product Goal

Field/Mobile Wave v1 should be:

- a mobile-friendly execution queue over assigned and relevant canonical work;
- a field worker and field manager daily workflow surface;
- a lightweight job/day context view for what is scheduled, assigned, blocked,
  and ready to capture;
- a fast Daily Log and Field Note capture path;
- photo/file attachment continuity through existing execution attachments;
- time/labor visibility where canonical time events and derived time cards
  already exist;
- schedule-aware without owning scheduling state;
- project-aware without replacing Project Workspace.

The field/mobile experience should answer: "What am I doing today, what project
and job does it belong to, what do I need to know, what needs to be captured,
and where does the office continue from this?"

## 5. Wave v1 Scope

Wave v1 should stay on the existing canonical records and focus on mobile-first
execution usability:

- Mobile-friendly "today / upcoming / assigned work" queue over canonical
  `jobs`, `job_assignments`, and current-user Person assignment context where
  available.
- Job Workspace mobile polish for field context: project/customer/job facts,
  schedule context, crew/vendor/person context, field evidence, Daily Log
  continuity, and links back to Project Workspace.
- Daily Log create/update shortcuts from job, schedule, and project context,
  using existing Daily Log quick-create and update actions.
- Field Note capture from Daily Log and job context, preserving Daily Logs as
  the field-note parent.
- Execution attachment capture/review from Daily Log, Field Note, and approved
  Work Item contexts, using existing upload, preview, archive/restore, and
  private storage boundaries.
- Time punch visibility and links to `/time` and `/time-cards`, using
  canonical time punch events and derived time cards.
- Crew/vendor/person visibility from canonical assignments and existing people
  and vendor records.
- Blocker/issue note surfacing through Field Note type/status and Daily Log
  summary fields, without adding new issue, blocker, or punchlist tables.
- Schedule readiness/context display from CrewBoard read models and job
  scheduling fields, without owning schedule mutation.
- Project continuity links back to the Project Workspace for readiness,
  commercial blockers, customer context, ProjectPulse, FieldTrail, Proof Center,
  MessageCenter, CloseoutTrail, and project evidence.

## 6. Out Of Scope

Wave v1 must explicitly exclude:

- new mobile-only job tables;
- new field task, issue, blocker, or punchlist tables;
- new dispatch, calendar, or schedule tables;
- offline sync engine;
- geofencing or background location tracking;
- payroll;
- inventory or material consumption mutations;
- portal/customer-visible field state;
- autonomous AI actions;
- schema changes unless a later implementation slice proves they are necessary;
- broad visual redesign unrelated to field execution usability.

## 7. Proposed Decomposition

Recommended future implementation slices:

1. Field/mobile read-model audit:
   Confirm exactly which existing jobs, assignments, Daily Logs, Field Notes,
   execution attachments, Work Items, people/vendors, and time records can power
   a mobile field queue without new schema.
2. Assigned-work/mobile queue surface:
   Add or refine a mobile-first internal queue that groups today, upcoming,
   assigned, blocked, and recently completed field work from canonical records.
3. Mobile job context componentization:
   Extract reusable job/day context components from Job Workspace, Daily Logs,
   CrewBoard handoffs, and `/field/work-items` so field surfaces do not fork
   business logic.
4. Daily Log shortcut/actions polish:
   Tighten "start/open today's Daily Job Log" handoffs from job, schedule, and
   project context without creating logs implicitly.
5. Field Note capture polish:
   Improve Add Job Note / Add blocker mobile flow, type defaults, and anchors
   while preserving Daily Log parentage.
6. Execution attachment mobile flow:
   Improve attachment capture/review ergonomics around existing upload,
   preview, and archive/restore behavior; keep customer sharing out.
7. Labor/time visibility pass:
   Link field users and managers to active punch state, recent punch audit, and
   time cards where existing canonical time records support it.
8. Blocker/issue surfacing pass:
   Derive mobile-friendly blocker queues from Daily Log summary fields and
   Field Note type/status instead of adding blocker records.
9. QA/E2E fixture hardening:
   Identify stable authenticated fixture coverage for mobile job, Daily Log,
   field evidence, Work Item, and schedule handoff flows.

## 8. Hotspot Map

Confirmed files and paths to inspect before implementation:

- Job detail route: `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- Jobs Manager Page: `apps/web/app/(app)/jobs/page.tsx`
- Jobs data/actions/schemas:
  `apps/web/lib/jobs/data.ts`,
  `apps/web/lib/jobs/actions.ts`,
  `apps/web/lib/jobs/manager-read-model.ts`,
  `apps/web/lib/jobs/schemas.ts`
- Schedule route and read models:
  `apps/web/app/(app)/schedule/page.tsx`,
  `apps/web/lib/schedule/read-model.ts`,
  `apps/web/lib/schedule/summary.ts`,
  `apps/web/lib/schedule/warnings.ts`,
  `apps/web/lib/schedule/links.ts`,
  `apps/web/lib/schedule/move.ts`,
  `apps/web/lib/schedule/proposed-move.ts`
- Schedule handoff/action components:
  `apps/web/components/schedule-job-form.tsx`,
  `apps/web/components/schedule-crew-assignment-form.tsx`,
  `apps/web/components/schedule-context-card.tsx`,
  `apps/web/components/ready-to-schedule-action-panel.tsx`
- Daily Logs route and helpers:
  `apps/web/app/(app)/daily-logs/page.tsx`,
  `apps/web/app/(app)/daily-logs/[dailyLogId]/page.tsx`,
  `apps/web/lib/daily-logs/data.ts`,
  `apps/web/lib/daily-logs/actions.ts`,
  `apps/web/lib/daily-logs/links.ts`,
  `apps/web/lib/daily-logs/schemas.ts`
- Field Notes:
  `apps/web/components/field-note-form.tsx`,
  `apps/web/lib/field-notes/data.ts`,
  `apps/web/lib/field-notes/labels.ts`,
  `apps/web/lib/field-notes/schemas.ts`
- Execution attachments:
  `apps/web/lib/execution-attachments/data.ts`,
  `apps/web/lib/execution-attachments/storage.ts`,
  `apps/web/lib/execution-attachments/preview.ts`,
  `apps/web/lib/execution-attachments/lifecycle.ts`,
  `apps/web/lib/execution-attachments/schemas.ts`
- FieldTrail:
  `apps/web/lib/fieldtrail/summary.ts`,
  `apps/web/components/field-execution-command-band.tsx`
- Time tracking:
  `apps/web/app/(app)/time/page.tsx`,
  `apps/web/app/(app)/time-cards/page.tsx`,
  `apps/web/app/(app)/time-cards/[timeCardId]/page.tsx`,
  `apps/web/components/time-punch-form.tsx`,
  `apps/web/lib/time/data.ts`,
  `apps/web/lib/time/actions.ts`,
  `apps/web/lib/time/transitions.ts`,
  `apps/web/lib/time/exceptions.ts`
- People/vendors:
  `apps/web/app/(app)/people/page.tsx`,
  `apps/web/lib/people/data.ts`,
  `apps/web/lib/people/manager-read-model.ts`,
  `apps/web/app/(app)/vendors/page.tsx`,
  `apps/web/lib/vendors/data.ts`
- Existing field-specific Work Item route:
  `apps/web/app/(app)/field/work-items/page.tsx`,
  `apps/web/app/(app)/field/work-items/[workItemId]/page.tsx`,
  `apps/web/lib/work-items/data.ts`,
  `apps/web/lib/work-items/read-model.ts`,
  `apps/web/lib/work-items/actions.ts`
- Equipment readiness context, if field/mobile displays readiness warnings:
  `apps/web/components/job-equipment-panel.tsx`,
  `apps/web/lib/equipment/data.ts`,
  `apps/web/lib/equipment/readiness.ts`,
  `apps/web/lib/dashboard/equipment-readiness-preview.ts`
- Relevant tests:
  `apps/web/lib/daily-logs/links.test.ts`,
  `apps/web/lib/field-notes/labels.test.ts`,
  `apps/web/lib/fieldtrail/summary.test.ts`,
  `apps/web/lib/execution-attachments/storage.test.ts`,
  `apps/web/lib/execution-attachments/preview.test.ts`,
  `apps/web/lib/execution-attachments/lifecycle.test.ts`,
  `apps/web/lib/time/transitions.test.ts`,
  `apps/web/lib/time/exceptions.test.ts`,
  `apps/web/lib/schedule/read-model.test.ts`,
  `apps/web/lib/schedule/warnings.test.ts`,
  `apps/web/lib/work-items/work-items.test.ts`,
  `e2e/schedule-ready-handoff.spec.js`

Risk areas:

- Daily Log project/date uniqueness must not be bypassed by "quick" mobile
  flows.
- Field Notes must remain children of Daily Logs, not free-floating mobile
  notes.
- Execution attachment previews must stay contractor-only and must not expose
  raw storage paths or portal access.
- Work Item assignment can support field action, but it must not replace crew
  assignment on jobs or source-of-truth field narrative in Daily Logs/Field
  Notes.
- Time cards are derived summaries; mobile field UX should not present them as
  the audit truth over punch events.
- Equipment readiness is advisory unless a later slice explicitly changes
  enforcement.
- Schedule warnings and prepared moves must not mutate schedule state without
  the existing confirmed schedule actions.

## 9. Cross-Stream Coordination

Project Workspace stream:

- Field/mobile must link back to Project Workspace for readiness, blockers,
  financial/commercial context, proof, communications, and closeout continuity.
- Do not move ProjectPulse, Proof Center, CloseoutTrail, or project evidence
  ownership into a field-only area.
- Conflict warning: a field mobile queue that creates its own project summary
  table or separate field project status would compete with Project Workspace.

Scheduling stream:

- Field/mobile should consume schedule context from canonical jobs,
  `job_assignments`, and existing schedule read models.
- CrewBoard owns scheduling review, selected-job schedule actions, move
  confirmation, and advisory schedule warnings.
- Conflict warning: do not create dispatch/schedule tables, mobile schedule
  state, or drop-to-mutate behavior inside field/mobile.

Portal stream:

- Portal must remain customer-safe and must not receive portal-owned schedule or
  field state.
- Field evidence, internal blockers, Work Item instructions, Daily Log bodies,
  Job Notes, and contractor-only readiness details stay internal unless a
  future explicit portal evidence grant/share policy permits selected evidence.
- Conflict warning: do not expose field mobile copy or internal note summaries
  through portal project status.

Dashboard / universal-create work:

- Dashboard and universal create can route into field/mobile capture, but they
  should create canonical records first and then hand off to the owning
  workspace.
- Universal Capture remains planned/guarded; do not add a capture table or
  assistant action staging as part of Field/Mobile Wave v1.
- Conflict warning: do not use dashboard/local capture state as a field queue
  source of truth.

Equipment readiness:

- Existing equipment registry, requirements, assignments, and advisory
  readiness warnings can provide context to field/mobile views.
- Conflict warning: field/mobile should not create an equipment calendar,
  enforce equipment blocks, or mutate equipment assignment from a queue unless a
  separate equipment implementation slice approves it.

## 10. Acceptance Criteria For Implementation Readiness

Wave v1 is safe to implement only when:

- Canonical data sources for the first slice are confirmed in current code.
- Read-model boundaries are clear and documented.
- No duplicate field/mobile job, schedule, issue, blocker, punchlist, time, or
  attachment model is introduced.
- Project, job, schedule, Daily Log, Field Note, attachment, people/vendor, and
  time links are preserved.
- Mobile UX scope is narrow enough to avoid broad contractor-shell redesign.
- Tests and QA targets are identified before code changes.
- Cross-stream hotspots are assigned: Project Workspace ownership, Scheduling
  ownership, Portal visibility, Dashboard/universal-create handoffs, and
  equipment readiness boundaries.
- Any schema need is proven by a later implementation slice instead of assumed
  during planning.

## 11. Validation Plan

Likely validation for future implementation:

- `pnpm typecheck`
- `pnpm lint`
- targeted unit tests, where relevant:
  - `pnpm --filter @floorconnector/web exec tsx --test lib/daily-logs/links.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/fieldtrail/summary.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/execution-attachments/storage.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/execution-attachments/preview.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/execution-attachments/lifecycle.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/time/transitions.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/time/exceptions.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
  - `pnpm --filter @floorconnector/web exec tsx --test lib/work-items/work-items.test.ts`
- targeted E2E when authenticated fixtures are healthy:
  - schedule handoff coverage around `e2e/schedule-ready-handoff.spec.js`
  - mobile Job Workspace and Daily Log smoke
  - field evidence preview/archive smoke against real uploaded evidence
  - `/field/work-items` mobile queue/detail smoke
- `git diff --check`
- `pnpm format` or a narrower Prettier check when available

For this planning-only pass, validation should be limited to docs formatting and
diff whitespace checks.

## 12. Recommended First Implementation Slice

Recommended first code slice: field/mobile read-model and UX audit only.

That slice should inspect the existing Daily Log, Job, CrewBoard, Work Item,
execution attachment, people/vendor, and time helpers and produce a minimal
implementation plan for a mobile "today / assigned work" queue. It should not
add schema, routes, server actions, or broad UI edits in the first pass.

If code must change in the first implementation pass, prefer extracting or
reusing small read-model helpers for existing data over building a new surface.
This minimizes conflicts with Project Workspace and Scheduling while proving
the queue can remain canonical-record-first.
