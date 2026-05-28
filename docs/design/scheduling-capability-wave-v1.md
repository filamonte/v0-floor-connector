# Scheduling Capability Wave v1

Status: Planned
Doc Type: Design Plan

## Purpose

Assess the current scheduling system and define a docs-only implementation plan
for Scheduling Capability Wave v1.

This plan does not implement scheduling changes. It preserves canonical jobs as
the scheduling source of truth, keeps project continuity intact, and avoids a
duplicate dispatch model, module-local scheduling silo, or disconnected
calendar subsystem.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md)
- [docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md)
- [docs/design/crewboard-phase-3b-b-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-qa-checkpoint.md)

Requested but not present in this stream worktree during the original planning
pass:

- `docs/ai-native-development-architecture.md`
- `docs/floorconnector-build-list-and-completion-timeline.md`

Searches for `ai-native`, `development-architecture`, `build-list`,
`completion-timeline`, and related phrases did not find renamed equivalents in
`docs/`.

Reconciled-docs note: both docs are now present in the main docs set. The
missing-doc note above is preserved as historical stream-planning context, not
current missing-doc status.

## Files Inspected

- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/crewboard-drag-drop-layer.tsx](C:/FloorConnector/apps/web/components/crewboard-drag-drop-layer.tsx)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/components/schedule-crew-assignment-form.tsx](C:/FloorConnector/apps/web/components/schedule-crew-assignment-form.tsx)
- [apps/web/components/ready-to-schedule-action-panel.tsx](C:/FloorConnector/apps/web/components/ready-to-schedule-action-panel.tsx)
- [apps/web/lib/schedule/read-model.ts](C:/FloorConnector/apps/web/lib/schedule/read-model.ts)
- [apps/web/lib/schedule/read-model.test.ts](C:/FloorConnector/apps/web/lib/schedule/read-model.test.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [apps/web/lib/schedule/warnings.test.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.test.ts)
- [apps/web/lib/schedule/move.ts](C:/FloorConnector/apps/web/lib/schedule/move.ts)
- [apps/web/lib/schedule/proposed-move.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.ts)
- [apps/web/lib/jobs/actions.ts](C:/FloorConnector/apps/web/lib/jobs/actions.ts)
- [apps/web/lib/jobs/data.ts](C:/FloorConnector/apps/web/lib/jobs/data.ts)
- [apps/web/lib/jobs/manager-read-model.ts](C:/FloorConnector/apps/web/lib/jobs/manager-read-model.ts)
- [apps/web/app/(app)/jobs/page.tsx](<C:/FloorConnector/apps/web/app/(app)/jobs/page.tsx>)
- [apps/web/app/(app)/jobs/[jobId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/jobs/[jobId]/page.tsx>)
- [apps/web/lib/dashboard/operational-cockpit-read-model.ts](C:/FloorConnector/apps/web/lib/dashboard/operational-cockpit-read-model.ts)
- [apps/web/lib/dashboard/equipment-readiness-preview.ts](C:/FloorConnector/apps/web/lib/dashboard/equipment-readiness-preview.ts)
- [apps/web/lib/projects/operational-workspace.ts](C:/FloorConnector/apps/web/lib/projects/operational-workspace.ts)
- [supabase/migrations/20260414173000_jobs_foundation.sql](C:/FloorConnector/supabase/migrations/20260414173000_jobs_foundation.sql)
- [supabase/migrations/20260420133000_job_scheduling_foundation.sql](C:/FloorConnector/supabase/migrations/20260420133000_job_scheduling_foundation.sql)
- [e2e/schedule-ready-handoff.spec.js](C:/FloorConnector/e2e/schedule-ready-handoff.spec.js)

## 1. Current Implemented Scheduling Architecture

The implemented scheduling architecture is CrewBoard on `/schedule`. It is a
protected contractor Manager Page over canonical records, not a separate
dispatch app.

Current source-of-truth records:

- `jobs`: canonical work/schedule/execution records.
- `job_assignments`: canonical crew assignment rows for people or
  labor-provider vendors.
- `people`: assignable internal workforce records.
- `vendors`: labor-provider subcontractor companies.
- `projects`, `customers`, optional `estimates`, and optional
  `service_tickets`: upstream context for schedule continuity.
- `appointments` and opportunity site assessments: read-only schedule context,
  not duplicate jobs.

Current job scheduling fields:

- `dispatch_status`
- `scheduled_date`
- `scheduled_start_at`
- `scheduled_end_at`
- `schedule_notes`
- `crew_vendor_id`

Current write paths:

- `scheduleJobAction`
- `unscheduleJobAction`
- `assignCrewAction`
- `unassignCrewAction`

Those actions route through `apps/web/lib/jobs/data.ts`, validate tenant scope,
validate assignable people and active labor-provider vendors, and preserve
server-side readiness enforcement for job creation and schedule writes through
`assertProjectReadinessGate`.

The main read-model spine is `apps/web/lib/schedule/read-model.ts`. It derives
ready unscheduled work, blocked unscheduled work, overdue scheduling, Today,
Tomorrow, This week, Later scheduled, In progress, Missing Crew, recently done,
readiness-review jobs, date groupings, and ordered dispatch attention items.

Current conflict/warning logic is pure and advisory in
`apps/web/lib/schedule/warnings.ts`. It derives:

- missing crew
- missing end time
- overlapping crew windows
- same-day crew load when timing is incomplete

Pointer drag/drop already exists as a progressive enhancement in
`apps/web/components/crewboard-drag-drop-layer.tsx`. Drop prepares URL-backed
move state only; it does not save. The selected-job `Move schedule` form remains
the confirmation and write path.

## 2. Current Workflow Gaps

CrewBoard is real but not yet fully dispatch-grade. The important gaps are:

- Queue intent is derived but not yet specialized enough for a dispatcher to
  work a whole day from one queue.
- Blocked-vs-ready unscheduled work is visible, but blocker resolution remains
  mostly link-out oriented.
- Crew assignment is row-based and valid, but there is no crew-load view by
  person/vendor/day.
- Conflict detection is advisory and limited to shared people/vendors on the
  same date/time window.
- Equipment readiness is available through job/dashboard helpers, but it is not
  yet a first-class CrewBoard lane or filter.
- Mobile field handoffs exist for Daily Job Logs, Job Notes, and evidence, but
  mobile scheduling is still mainly a responsive version of the desktop board
  and selected-job form.
- Appointments and site assessments are visible schedule context, but they are
  not integrated into a unified dispatcher timeline beyond read-only items.
- The current board has multiple useful lanes, but the implementation remains
  concentrated in a large `/schedule` page component.
- E2E coverage is strong for handoff and schedule submit flows, but drag/drop
  execution coverage remains limited by fixture visibility.

## 3. UX/System Assessment

Strengths:

- CrewBoard reads as an operating surface rather than a bare job table.
- The selected-job action panel correctly anchors scheduling and crew actions
  back to the same job.
- Confirmation-first movement is the right safety model for contractors:
  drag/drop, manual move, and form submit all converge on the same save path.
- Project and Job Workspace links preserve continuity and avoid schedule-only
  dead ends.
- Attention Desk ordering is operationally useful because it starts with
  blocked work and past scheduled incomplete work before lower-risk items.

Weaknesses:

- `/schedule/page.tsx` owns too much presentation, normalization, date math,
  panel logic, and board rendering in one file.
- The dispatcher has to infer some "why now" context from badges and cards
  rather than a dedicated queue detail model.
- Crew-load and conflict surfaces are job-first; a dispatcher often needs
  resource-first visibility.
- The board shows schedule movement, readiness, assignments, warnings, and
  Daily Log handoffs, but the mental model could be clearer if Wave v1 names
  three operating modes: `Triage`, `Plan`, and `Dispatch`.
- Current drag/drop is helpful but not yet guaranteed by deterministic E2E data.

## 4. Mobile Assessment

Mobile must remain explicit-action first. Drag/drop should not become required
on phones.

Current mobile strengths:

- The selected-job action panel works as the authoritative mobile scheduling
  surface.
- Existing CrewBoard QA has checked `/schedule` at mobile width with no
  horizontal overflow in prior smoke passes.
- Job Workspace and Daily Log mobile work already route field users toward
  Daily Job Log, Job Notes, blockers, and field evidence.

Mobile gaps:

- The board-oriented lanes are still denser than an ideal field or dispatcher
  phone workflow.
- Mobile needs a compact "Today / Missing crew / Ready queue" dispatch stack
  before complex board controls.
- Drag/drop helper copy is safe, but touch drag/drop should remain optional and
  likely deferred unless user testing proves it useful.
- The assignment form needs clearer mobile affordance for "add another person"
  and current crew review as crew sizes grow.

Wave v1 should treat mobile as a queue-and-action experience:

- top: active today and blocked items
- middle: selected job schedule/crew action panel
- bottom: Daily Job Log / Job Workspace / Project Workspace handoffs

## 5. Data/Read-Model Assessment

The read-model foundation is strong and should be extended before adding new
schema. The most useful Wave v1 data work is to split derived projections into
smaller reusable helpers while keeping `jobs` and `job_assignments` canonical.

Recommended read-model direction:

- Keep `buildScheduleBoardReadModel(...)` as the top-level CrewBoard projection.
- Extract focused pure helpers only when implementation begins:
  `deriveScheduleQueues`, `deriveScheduleTimingGroups`,
  `deriveScheduleResourceLoads`, and `deriveScheduleReadinessItems`.
- Add richer derived structures for resource/day load, but do not persist them.
- Reuse dashboard equipment-readiness preview patterns when bringing equipment
  signals into CrewBoard.
- Keep project financial/commercial readiness snapshots as the upstream
  readiness source. Do not reimplement readiness inside scheduling.

Schema assessment:

- No new scheduling table is required for Wave v1.
- No crew table is required for Wave v1.
- No dispatch event table is required for Wave v1.
- Future persisted schedule audit/history should be designed separately if
  operators need historical move evidence beyond current `updated_at`.

## 6. Scheduling Board Architecture Recommendation

Wave v1 should keep `/schedule` as CrewBoard and improve its internal
architecture rather than adding a new route.

Recommended board architecture:

- Server page loads canonical jobs, assignments, readiness, appointments, and
  equipment preview inputs.
- Pure read-model helpers derive queue and board state.
- Small presentational components render:
  - command summary
  - Triage queue
  - Day planner
  - Week planner
  - resource load strip
  - selected-job action panel
  - mobile queue stack
- The client drag/drop boundary remains isolated and receives only serializable
  job schedule and target metadata.

Do not introduce a full calendar package. CrewBoard already has app-specific
readiness, warning, project, job, and field handoff semantics that a generic
calendar event model would obscure.

## 7. Queue Architecture Recommendation

Wave v1 should formalize queue categories in the read model while keeping them
derived:

1. `Blocked readiness`: unscheduled jobs whose project readiness says not ready.
2. `Past scheduled incomplete`: scheduled dates in the past and not completed.
3. `Today active`: in-progress and today scheduled jobs.
4. `Missing crew`: scheduled or active jobs with no assignment rows.
5. `Resource conflicts`: overlap and same-day capacity warnings.
6. `Equipment readiness`: jobs with missing required equipment or assignment
   conflicts, derived from existing equipment helpers.
7. `Aging ready`: ready unscheduled jobs older than today.
8. `Upcoming`: tomorrow, this week, later scheduled.

Each queue item should include:

- job id
- project/customer label
- primary reason
- recommended next action
- canonical href
- secondary context href
- severity
- source label such as `Ready Check`, `Crew`, `Equipment`, or `Schedule`

The queue should not create `tasks`, `work_items`, or dispatch records by
default. If later follow-through work is needed, it should route to existing
Work Items as a separate approved slice.

## 8. Crew Assignment Recommendation

Keep crew assignment on `job_assignments`.

Wave v1 should improve crew assignment through derived views and UI, not a new
crew model:

- Add a resource-load read model grouped by date and resource key
  (`person:<id>` or `vendor:<id>`).
- Surface crew load from the same people/vendor assignments used by warnings.
- Keep job-level assignment forms as the write path.
- Add "assign from conflict context" links that preselect the selected job but
  still submit through `assignCrewAction`.
- Show assigned windows when present, and treat missing assignment windows as a
  warning for capacity precision.

Do not create:

- `crews`
- `dispatch_assignments`
- `schedule_assignments`
- `crew_calendar_events`

Those would duplicate the current `people`, `vendors`, `jobs`, and
`job_assignments` foundation.

## 9. Conflict Detection Strategy

Conflict detection should remain advisory in Wave v1.

Recommended layers:

- Layer 1: existing missing crew, missing end time, overlap, and same-day
  capacity warnings.
- Layer 2: derived resource-day load summary by person/vendor.
- Layer 3: equipment readiness warnings from existing equipment assignments and
  conflicts.
- Layer 4: field continuity warnings, such as in-progress job without today's
  Daily Job Log, if derived from existing Daily Log data in a later slice.

Do not hard-block scheduling for advisory conflicts in Wave v1. The only hard
gate should remain server-side project readiness through the existing job
schedule action. Advisory conflicts should explain risk and route to the
existing schedule, crew, job, project, equipment, or Daily Log surfaces.

## 10. Readiness And Continuity Integration

Readiness integration should stay centralized:

- Project readiness and GateKeeper remain the authoritative upstream check.
- CrewBoard displays readiness blockers and links to canonical estimate,
  contract, deposit invoice, opportunity/site assessment, or Project Workspace
  records.
- Job creation and schedule mutation continue to call existing server-side
  readiness enforcement.
- Project Workspace remains the hub for upstream readiness and operational
  intelligence.
- Dashboard Operational Cockpit remains a company-level preview and should link
  into CrewBoard rather than duplicate CrewBoard queues.
- Job Workspace remains the record workspace for execution detail, equipment,
  time, daily logs, work items, service/warranty continuity, and billing handoff.

Continuity rule: CrewBoard can summarize and route, but it should not own
commercial readiness, field evidence, invoice/payment state, service/warranty
workflow, or portal-visible schedule promises.

## 11. Recommended Decomposition Into Parallel Implementation Slices

Wave v1 can be parallelized if each slice has a clear ownership boundary.

### Slice A: Read-Model Decomposition

Owner: schedule read-model agent.

Scope:

- Refactor `apps/web/lib/schedule/read-model.ts` into smaller pure helpers only
  if needed.
- Add queue item types for Triage, Plan, and Dispatch modes.
- Preserve the existing public return shape until UI slices are ready.
- Extend unit coverage first.

Avoid:

- `/schedule` UI churn beyond type integration.
- server actions.
- schema.

### Slice B: Resource Load And Conflict Depth

Owner: conflict/readiness agent.

Scope:

- Add derived person/vendor load summaries.
- Extend warnings with resource-load detail while preserving existing warning
  kinds or adding narrow new kinds.
- Add tests for overlapping windows, missing windows, vendor conflicts, and
  same-day load.

Avoid:

- hard-blocking schedule writes.
- crew model/schema.
- route optimization.

### Slice C: CrewBoard UI Componentization

Owner: UI architecture agent.

Scope:

- Extract presentational components from `/schedule/page.tsx`.
- Keep route, search params, actions, and data loading unchanged.
- Preserve Graphite/Copper Manager Page patterns and mobile wrapping.

Avoid:

- behavior changes in the same slice.
- unrelated UI refactors.

### Slice D: Queue UX And Action Panel

Owner: workflow UX agent.

Scope:

- Render explicit Triage, Plan, and Dispatch queues.
- Improve selected-job action panel context for queue reason, readiness,
  conflict, equipment warning, and next action.
- Keep all mutations on existing forms/actions.

Avoid:

- new queue persistence.
- automatic task/work-item creation.

### Slice E: Equipment/Readiness Integration

Owner: equipment continuity agent.

Scope:

- Bring existing equipment-readiness preview signals into CrewBoard queues.
- Link equipment warnings to Job Workspace/equipment panel or selected schedule
  panel.
- Add pure mapper tests if new mapping logic is created.

Avoid:

- equipment hard blocks.
- equipment assignment mutations from schedule unless separately approved.

### Slice F: E2E Fixture And QA Hardening

Owner: QA agent.

Scope:

- Add deterministic fixture coverage for visible scheduled job plus visible
  CrewBoard drop target.
- Add or improve Playwright coverage for drag/drop URL preparation if stable.
- Keep schedule submit and no-mutation assertions.
- Add mobile smoke for queue/action-panel layout.

Avoid:

- weakening existing E2E assertions.
- relying on random local data.

## 12. Merge/Hotspot Risk Analysis

High-risk files:

- `apps/web/app/(app)/schedule/page.tsx`: largest hotspot because data loading,
  filtering, board rendering, and selected-job panel composition are together.
- `apps/web/lib/schedule/read-model.ts`: shared derivation point for board,
  queues, and attention items.
- `apps/web/lib/schedule/warnings.ts`: conflict semantics used by both UI and
  tests.
- `apps/web/lib/jobs/actions.ts` and `apps/web/lib/jobs/data.ts`: write-path
  guardrails; avoid touching unless a slice truly needs server behavior.
- `e2e/schedule-ready-handoff.spec.js`: broad and write-capable fixture coverage
  for schedule handoffs.

Merge strategy:

- Land read-model changes before broad UI changes.
- Componentize `/schedule` before adding more queue UI if possible.
- Keep warning/conflict changes in a narrow pure-helper slice.
- Keep E2E fixture changes separate from UI component extraction.
- Avoid concurrent edits to `jobs/data.ts` unless the server-action slice is
  explicitly approved.

Primary risk:

- Multiple agents editing `/schedule/page.tsx` will conflict quickly. Extract
  components first or assign a single owner to that file.

## 13. QA Strategy

Recommended validation stack for implementation slices:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/read-model.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/proposed-move.test.ts`
- targeted tests for any new pure helper
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- targeted Prettier check on changed docs/code
- `git diff --check`

Recommended E2E/browser checks:

- `/schedule` desktop authenticated smoke.
- `/schedule` 390px mobile authenticated smoke.
- selected-job action panel opens from dashboard/job/project handoffs.
- schedule submit persists and does not create work items or duplicate jobs.
- drag/drop prepares URL/action panel only and does not mutate before submit.
- blocked readiness jobs route to canonical blocker records.
- missing crew and resource conflict rows route to assignment/schedule actions.

Auth or Supabase rate-limit blockers should be reported directly and should not
be papered over as successful browser QA.

## 14. Recommended Implementation Order

1. Read-model decomposition and queue type stabilization.
2. Resource-load/conflict derivation tests.
3. `/schedule` component extraction with no behavior change.
4. Triage/Plan/Dispatch queue UI over the stabilized read model.
5. Equipment readiness integration into CrewBoard queues.
6. Mobile queue/action-panel polish.
7. Deterministic E2E fixture for drag/drop preparation and visible drop targets.
8. Optional final browser QA checkpoint and current-state/chat-handoff update
   after implementation is complete.

## 15. Pilot-Readiness Definition

Scheduling Capability Wave v1 is pilot-ready when:

- CrewBoard still uses canonical `jobs` and `job_assignments` only for schedule
  and crew source of truth.
- Ready, blocked, today, missing crew, conflict, equipment warning, and aging
  queues are visible and explain their source.
- Selected-job schedule and crew actions still submit through existing server
  actions.
- Project readiness remains server-authoritative and cannot be bypassed from
  CrewBoard.
- Dashboard, Project Workspace, Jobs Manager, Job Workspace, and CrewBoard hand
  off to each other through canonical ids and route links.
- Mobile users can work the current-day queue and selected-job action panel
  without drag/drop.
- Drag/drop, if used, only prepares the existing confirmation form and never
  mutates on drop.
- Unit tests cover queue, warning, move, and resource-load derivation.
- E2E/browser smoke proves the protected `/schedule` page renders on desktop
  and mobile, and at least one schedule submit path persists without duplicate
  records.
- No new scheduling schema, dispatch table, crew table, route optimizer,
  automatic scheduling, notification automation, external calendar source of
  truth, or portal schedule promise is introduced without a separate approved
  design.

## Summary Recommendation

Wave v1 should be a CrewBoard maturity wave, not a scheduling-system rebuild.
The safest decomposition is to deepen derived queues, resource-load warnings,
component boundaries, and QA fixtures while preserving the current canonical job
write paths and project readiness gate.
