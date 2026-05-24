# CrewBoard Phase 3 Drag Drop Dispatch Spec

Status: Planned
Doc Type: Design Spec

## Purpose

Define the safest future implementation path for CrewBoard Phase 3 drag/drop
scheduling and dispatch interaction design. This is a planning-only checkpoint;
it does not implement drag/drop, add packages, add routes, change schema, or
change server actions.

Phase 3 should make CrewBoard faster for dispatchers without weakening the
canonical job model, existing schedule actions, GateKeeper / Ready Check
enforcement, or mobile field handoffs.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
- [docs/system-overview.md](C:/FloorConnector/docs/system-overview.md)
- [docs/Roadmap.md](C:/FloorConnector/docs/Roadmap.md)
- [docs/target-ia.md](C:/FloorConnector/docs/target-ia.md)
- [docs/chat-handoff.md](C:/FloorConnector/docs/chat-handoff.md)
- [docs/product-language.md](C:/FloorConnector/docs/product-language.md)
- [docs/design/crewboard-phase-1.md](C:/FloorConnector/docs/design/crewboard-phase-1.md)
- [docs/design/crewboard-phase-2-dispatch-usability.md](C:/FloorConnector/docs/design/crewboard-phase-2-dispatch-usability.md)
- [docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md](C:/FloorConnector/docs/design/mobile-field-phase-1-fast-daily-job-log-capture.md)
- [docs/design/mobile-field-phase-2-quick-job-notes-evidence.md](C:/FloorConnector/docs/design/mobile-field-phase-2-quick-job-notes-evidence.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)
- [docs/README.md](C:/FloorConnector/docs/README.md)

## Files Inspected

- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/components/schedule-crew-assignment-form.tsx](C:/FloorConnector/apps/web/components/schedule-crew-assignment-form.tsx)
- [apps/web/lib/schedule/links.ts](C:/FloorConnector/apps/web/lib/schedule/links.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [apps/web/lib/schedule/warnings.test.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.test.ts)
- [apps/web/lib/jobs/actions.ts](C:/FloorConnector/apps/web/lib/jobs/actions.ts)
- [apps/web/lib/jobs/data.ts](C:/FloorConnector/apps/web/lib/jobs/data.ts)
- [apps/web/lib/jobs/schemas.ts](C:/FloorConnector/apps/web/lib/jobs/schemas.ts)
- [apps/web/app/(app)/jobs/[jobId]/page.tsx](<C:/FloorConnector/apps/web/app/(app)/jobs/[jobId]/page.tsx>)
- [apps/web/lib/daily-logs/links.ts](C:/FloorConnector/apps/web/lib/daily-logs/links.ts)
- [package.json](C:/FloorConnector/package.json)
- [apps/web/package.json](C:/FloorConnector/apps/web/package.json)

Dependency search also checked for existing drag/drop or calendar packages. No
dedicated drag/drop or full calendar package is currently installed.

## Current CrewBoard State

`/schedule` is CrewBoard. It already reads canonical jobs, appointments, job
assignments, people, labor-provider vendors, projects, customers, and schedule
warning summaries. The current page includes filter, date, layout, week, day,
and board modes; command-center cards; a selected job action panel; schedule
and crew assignment forms; Daily Job Log links; and contextual handoffs back to
Project Workspace and Job Workspace.

The implemented schedule fields are on `jobs`:

- `scheduled_date`
- `scheduled_start_at`
- `scheduled_end_at`
- `schedule_notes`
- `crew_vendor_id`

Crew assignments use `job_assignments`. Existing server actions include:

- `scheduleJobAction`
- `unscheduleJobAction`
- `assignCrewAction`
- `unassignCrewAction`

Existing scheduling writes validate organization scope, use the same job
record, and keep GateKeeper / Ready Check enforcement authoritative through
`assertProjectReadinessGate`. Completed jobs cannot be rescheduled, and
in-progress or completed jobs cannot be unscheduled through the current data
helpers.

Existing schedule warnings are advisory and derived from current job and crew
assignment data:

- missing crew
- missing end time
- overlapping crew windows

CrewBoard does not currently implement drag/drop scheduling, route
optimization, automatic scheduling, notifications, external calendar sync,
recurring jobs, capacity planning, or a separate dispatch model.

## Recommended Phase 3 Scope

Phase 3 should include:

- Drag an unscheduled job onto a day or time slot.
- Drag a scheduled job to another day or time slot.
- Provide a keyboard-accessible scheduling alternative that uses the same
  draft and confirmation model.
- Open a confirmation panel before saving any schedule mutation.
- Submit through existing schedule actions where possible.
- Recompute schedule warnings from canonical job and crew assignment data after
  save.
- Surface missing crew, missing end time, and overlap warnings before and after
  confirmation when the current data allows it.
- Respect GateKeeper / Ready Check client-side in copy and server-side in the
  authoritative action.
- Preserve the current mobile fallback through existing non-drag schedule
  controls.

Phase 3 should not include:

- route optimization
- map dispatch
- recurring jobs
- crew availability calendars
- capacity planning
- automatic scheduling
- external calendar sync
- notifications
- new dispatch tables
- new appointments behavior
- customer portal exposure
- AI scheduling recommendations

## Interaction Model

### Board Layout

Use the existing CrewBoard page as the anchor. Phase 3 should evolve the current
board/day/week planner instead of introducing a new scheduling route.

Recommended layout:

- Left or top rail: Needs Scheduling jobs that already cleared Ready Check.
- Main board: date columns for week mode and a tighter time grid for day mode.
- Scheduled cards: existing job cards with customer, project, crew state, time
  window, schedule notes preview, and warning badges.
- Action panel: existing selected job composer becomes the confirmation surface
  for proposed moves.
- Warning area: existing warning summaries remain visible and are mirrored in
  the confirmation panel for the selected job.

The first implementation should keep appointments read-only in the drag/drop
surface. Appointments can remain visible as schedule context, but Phase 3
should only move canonical jobs.

### Draggable Item Types

Initial draggable records:

- unscheduled jobs
- scheduled jobs that are not completed

Not draggable in Phase 3:

- appointments
- completed jobs
- generated warning rows
- Daily Job Logs
- crew assignment rows

In-progress jobs may be selectable for schedule refinement only if the existing
server action continues preserving `in_progress` status. They should not support
"move back to unscheduled."

### Drop Targets

Initial drop targets:

- date-only day bucket for setting `scheduled_date`
- day/time slot for setting `scheduled_date` and `scheduled_start_at`
- existing selected-job schedule action panel for manual refinement

Deferred drop targets:

- crew lanes
- vendor capacity lanes
- map regions
- recurring pattern buckets
- external calendar blocks

Crew lane drops should wait until availability, capacity, and crew assignment
semantics are explicitly designed. For Phase 3, crew assignment stays in the
existing crew form.

### Before Drop

A drag hover may highlight eligible targets, but it must not mutate data. On
drop, the client should create a local proposed move only:

- `jobId`
- source date/time state
- proposed `scheduledDate`
- proposed `scheduledStartAt`
- proposed `scheduledEndAt` when it can be safely preserved or derived
- proposed `scheduleNotes` unchanged by default

If a scheduled job has an existing duration, moving to a new start time may
preserve that duration as a draft. If no end time exists, the draft should keep
end time empty and surface the existing missing-end-time warning.

### After Drop

After drop, open the existing schedule action panel in a confirmation state.
Show:

- selected job
- current schedule
- proposed schedule
- crew state
- warning summary
- schedule notes
- Save schedule action
- Cancel / keep current schedule action

Saving should submit the same fields accepted by `ScheduleJobForm`:

- `jobId`
- `scheduledDate`
- `scheduledStartAt`
- `scheduledEndAt`
- `scheduleNotes`
- `redirectTo`

If a move is blocked by the server, keep the original board state after
navigation/revalidation and show the returned error through the existing query
parameter feedback pattern.

### Confirmation Policy

No schedule mutation should happen at the moment of drop. Drop means "prepare
this move"; confirmation means "save this move." This preserves explicit human
scheduling confirmation and keeps GateKeeper / Ready Check behavior clear.

### Optimistic UI Policy

Use conservative UI. Before submit, show the proposed move only in the selected
job confirmation panel and, optionally, as a visually distinct draft card. Do
not optimistically persist the job into a different lane before the server
action succeeds.

After submit, prefer existing server-action redirect and revalidation behavior.
If a later slice adds pending optimistic preview after submit, it must revert on
server error and must not hide validation or GateKeeper failures.

### Undo / Revert Policy

Phase 3 should rely on confirmation as the primary safety mechanism. Do not add
a separate undo system in the first implementation.

A later polish slice may add a "move back" affordance that resubmits the prior
schedule fields through the same existing schedule action. That should still be
explicitly confirmed and should not create a new event or dispatch table.

### Keyboard Fallback

Every drag/drop action must have a non-drag equivalent. Recommended first
keyboard flow:

1. User focuses a job card.
2. User activates "Move" or "Schedule".
3. Existing action panel opens with date, start, end, and notes fields.
4. User edits fields and saves.
5. Focus returns to the moved job card or to the nearest stable schedule list
   heading after redirect/revalidation.

This is enough for Phase 3A. A later richer keyboard board may add roving focus,
shortcut keys, and arrow-key slot movement, but those should not be required
for the first safe slice.

### Mobile Fallback

Mobile should keep explicit controls. Do not require drag/drop on touch screens
for Phase 3.

Recommended mobile behavior:

- Job cards expose "Schedule", "Reschedule", and "Assign crew" buttons.
- Date chips may prefill the existing schedule form.
- The selected job action panel remains the save surface.
- Drag handles, long press, and gesture-only behavior are deferred.

## Data / Action Boundaries

Phase 3 should not create a dispatch subsystem. Scheduling remains a projection
over canonical `jobs` and `job_assignments`.

Use existing records:

- `jobs`
- `job_assignments`
- `people`
- `vendors`
- `projects`
- `customers`
- appointments as read-only schedule context
- Daily Job Logs as downstream field-capture handoff links

The first implementation should attempt to reuse `scheduleJobAction` and
`unscheduleJobAction` without changing their signatures. If a small extension
is needed later, keep it narrow and form-compatible, such as optional
`redirectTo` or draft-source metadata that is ignored by existing validation.
Do not add a new server action unless reuse becomes unreadable.

Warning recomputation should continue to use `deriveScheduleWarningSummaries`
and `buildScheduleWarningsByJobId` from current job and assignment inputs.
Client-side preview may reuse the same pure warning helper only if it has the
same schedule and assignment data already loaded. Server revalidation remains
the source of truth after save.

## GateKeeper / Ready Check Behavior

GateKeeper / Ready Check enforcement must remain server authoritative.

Client behavior:

- Label Needs Scheduling jobs as Ready Check-cleared only when the current data
  already does.
- Do not offer a drag/drop affordance for records that are not jobs on
  CrewBoard.
- Show blocked or warning language in the confirmation panel when the current
  job state indicates risk.
- Keep the existing Project Workspace handoff for upstream readiness questions.

Server behavior:

- `scheduleJob` continues to call `assertProjectReadinessGate` before schedule
  writes.
- Completed jobs remain blocked from rescheduling.
- In-progress and completed jobs remain blocked from unscheduling.
- Tenant and organization scope remain in existing job data helpers.

Drag/drop must never bypass the same server action path used by the schedule
form.

## Accessibility Plan

Phase 3 should treat drag/drop as progressive enhancement over accessible
controls.

Required accessibility behavior:

- Every movable job has a visible non-drag "Schedule" or "Move" action.
- Confirmation panel receives focus on open.
- Cancel returns focus to the originating job card when possible.
- Save result feedback uses existing status/error messaging patterns.
- A live region announces proposed moves such as "Warehouse floor proposed for
  Tue May 26 at 8:00 AM."
- Drop targets have understandable labels, not just visual grid coordinates.
- Reduced-motion users should not receive animated card flight or layout
  effects as the only feedback.
- Pointer-only drag handles must not be the only scheduling method.

Keyboard Phase 3A should favor explicit form controls over a complex keyboard
grid. A richer ARIA drag/drop pattern can be evaluated after the safe
confirmation model is working.

## Package Recommendation

Do not add a package during this planning pass.

Recommended sequence:

1. Phase 3A should use no drag/drop package. Build pure movement helpers,
   confirmation state, and keyboard/manual scheduling UI around the existing
   action panel.
2. Phase 3B should run a short package spike only if pointer drag/drop is still
   needed after the confirmation model is proven.
3. If a package is needed, evaluate `@dnd-kit/core` first because it supports
   sensor-based React drag/drop, keyboard sensors, and custom collision logic
   better than native HTML5 drag/drop for this kind of board.
4. Avoid full calendar packages in Phase 3. CrewBoard already has canonical
   schedule read models and app-specific warning/Ready Check behavior, and a
   full calendar package risks dragging in a separate event model.

The current dependency set has no existing drag/drop or full calendar package.
That favors a no-package first slice and a later explicit dependency decision.

## Test Plan

Future implementation tests should include:

- Pure movement helper tests for unscheduled-to-date, unscheduled-to-time,
  scheduled-to-new-day, scheduled-to-new-time, preserving existing duration,
  and keeping missing end time empty when no duration exists.
- Link helper tests if CrewBoard adds anchors or query parameters for proposed
  moves.
- Schedule warning tests that confirm moved draft data still detects missing
  crew, missing end time, and overlapping crew windows.
- GateKeeper / Ready Check blocked-move coverage at the server action or
  integration boundary.
- Component or Playwright coverage proving no mutation happens until
  confirmation.
- Keyboard fallback coverage for opening the move panel, changing date/time,
  canceling, and submitting through the existing action path.
- Mobile smoke coverage at a 390px-ish viewport confirming cards and action
  panel controls do not overflow.
- Later Playwright drag/drop smoke only after a pointer drag/drop
  implementation exists and is stable in the test browser.

## Implementation Slices

### Phase 3A: Movement Helpers And Confirmation UI

- Add pure helpers for deriving proposed schedule moves.
- Add tests for date/time movement and duration preservation.
- Add a confirmation state to the existing selected job action panel.
- Add keyboard/manual "Move" and date/time controls.
- Do not add a drag/drop package.
- Keep all saving through existing schedule actions.

### Phase 3B: Pointer Drag/Drop Progressive Enhancement

- Evaluate whether simple pointer interactions are enough or whether `@dnd-kit`
  is warranted.
- If a package is approved, install it in this slice only.
- Make drag/drop create the same proposed move used by Phase 3A.
- Keep drop-to-confirm behavior; do not mutate on drop.
- Keep appointments read-only.

### Phase 3C: Mobile Fallback And QA

- Tune mobile action layout and confirmation panel ergonomics.
- Verify no horizontal overflow, stacked header regression, or hidden save
  controls.
- Confirm protected-route browser QA with saved contractor auth when available.
- Document any auth blocker honestly.

### Phase 3D: Conflict / Warning Polish

- Improve warning preview in the confirmation panel.
- Add clearer copy around missing crew, missing end time, and overlaps.
- Consider a later explicit "move back" action through existing schedule
  fields if operators need reversible dispatch changes.

## What Is Intentionally Not Implemented Yet

This spec does not implement:

- drag/drop UI
- new packages
- schema changes
- migrations
- new routes
- new server actions
- new dispatch tables
- route optimization
- map dispatch
- recurring jobs
- crew availability calendars
- capacity planning
- automatic scheduling
- external calendar sync
- notifications
- portal/customer exposure
- AI scheduling
- payment, signature, estimate, invoice, settings, or platform-admin behavior

## Planning Conclusion

CrewBoard Phase 3 should be confirmation-first and canonical-job-first. The
safest path is to build the scheduling draft model and keyboard/manual
confirmation flow before adding pointer drag/drop. That keeps the current
CrewBoard foundation intact while giving future drag/drop a narrow, tested
place to plug in.
