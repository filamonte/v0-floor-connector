# CrewBoard Phase 3B Drag Drop Technical Spike

Status: Planned
Doc Type: Technical Spike

## Purpose

Define the safest future implementation plan for CrewBoard Phase 3B pointer
drag/drop scheduling as a progressive enhancement on top of Phase 3A confirmed
schedule moves.

This is a planning/specification pass only. It does not implement drag/drop,
install packages, change app code, add schema, add routes, add server actions,
change dispatch tables, add calendar sync, add notifications, add automation,
or change map/route optimization behavior.

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
- [docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md](C:/FloorConnector/docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md)
- [docs/design/crewboard-phase-3a-confirmed-schedule-move.md](C:/FloorConnector/docs/design/crewboard-phase-3a-confirmed-schedule-move.md)
- [docs/design/crewboard-phase-3a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3a-qa-checkpoint.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Files Inspected

- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/components/schedule-crew-assignment-form.tsx](C:/FloorConnector/apps/web/components/schedule-crew-assignment-form.tsx)
- [apps/web/lib/schedule/move.ts](C:/FloorConnector/apps/web/lib/schedule/move.ts)
- [apps/web/lib/schedule/move.test.ts](C:/FloorConnector/apps/web/lib/schedule/move.test.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [apps/web/lib/schedule/warnings.test.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.test.ts)
- [apps/web/lib/jobs/actions.ts](C:/FloorConnector/apps/web/lib/jobs/actions.ts)
- [apps/web/lib/jobs/data.ts](C:/FloorConnector/apps/web/lib/jobs/data.ts)
- [package.json](C:/FloorConnector/package.json)
- [apps/web/package.json](C:/FloorConnector/apps/web/package.json)
- [playwright.config.js](C:/FloorConnector/playwright.config.js)
- [e2e/schedule-ready-handoff.spec.js](C:/FloorConnector/e2e/schedule-ready-handoff.spec.js)

Dependency search checked root package manifests, the lockfile, app source,
Playwright config, and E2E specs for drag/drop and calendar packages. No
dedicated drag/drop or full calendar dependency is currently installed. The
current app uses Next `^15.2.4`, React `^19.0.0`, and Playwright `^1.51.1`.

## Current CrewBoard State

CrewBoard is the existing protected `/schedule` workspace. It reads canonical
jobs, appointments, job assignments, people, labor-provider vendors, projects,
customers, schedule warnings, and project handoff state. It does not own a
separate dispatch model.

Implemented scheduling state remains on `jobs`:

- `scheduled_date`
- `scheduled_start_at`
- `scheduled_end_at`
- `schedule_notes`
- `crew_vendor_id`
- `dispatch_status`

Crew assignment remains on `job_assignments`. Existing write paths remain:

- `scheduleJobAction`
- `unscheduleJobAction`
- `assignCrewAction`
- `unassignCrewAction`

Phase 3A added `apps/web/lib/schedule/move.ts` and the selected-job `Move
schedule` review flow in `ScheduleJobForm`. That flow builds a local move
summary and submits through the existing schedule action. `scheduleJob` still
loads the tenant-scoped job, blocks completed-job rescheduling, preserves
in-progress status when rescheduling, and calls `assertProjectReadinessGate`
before writing schedule fields.

Schedule warnings remain advisory and derived from current job and assignment
data:

- missing crew
- missing end time
- overlapping same-day crew windows

## Package Recommendation

Recommendation for the first Phase 3B implementation slice: start with no new
package and implement explicit proposed-move state plus drop-target
abstractions first. Do not install anything until that state boundary is proven
against the existing confirmation panel.

If pointer drag/drop is approved after that first slice, prefer
`@dnd-kit/core`.

Evaluation:

| Option                             | Recommendation                          | Notes                                                                                                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No package / native pointer events | Use for 3B-A only                       | Lowest bundle risk and best for proving state boundaries. Native pointer logic becomes costly for keyboard sensors, collision behavior, touch quirks, and testable accessibility if it grows beyond simple click-to-propose interactions.                |
| `@dnd-kit/core`                    | Preferred package if drag/drop proceeds | Best fit for React sensor-based drag/drop, custom drop zones, keyboard-compatible patterns, and keeping the app's own job model instead of adopting a calendar event model. Package install is justified only when actual pointer drag/drop is approved. |
| Existing dependency                | Not available                           | No installed drag/drop or full calendar package was found.                                                                                                                                                                                               |
| Full calendar package              | Do not use                              | High model and bundle risk. CrewBoard already has app-specific canonical jobs, warnings, Ready Check copy, and server-action boundaries.                                                                                                                 |

Accessibility impact: `@dnd-kit/core` is safer than hand-rolled pointer-only
drag/drop if Phase 3B needs real sensors, but it still does not replace the
manual Move schedule form. The manual/keyboard flow must remain first-class.

Bundle risk: adding `@dnd-kit/core` is narrower than a full calendar package,
but still a new dependency. Keep it isolated to a client-only CrewBoard
enhancement component if approved.

Testability: no-package state helpers are easiest to unit test first.
`@dnd-kit/core` can then be smoke-tested by asserting drop-to-confirm behavior
rather than brittle pixel-perfect dragging.

Mobile behavior: do not require drag/drop on phones. Touch drag/drop can be
enabled later only if it does not fight scrolling or hide the manual form.

Server-action compatibility: both no-package and `@dnd-kit/core` can prepare
the same `ScheduleMovePayload`; neither should write directly.

## Interaction Model

Draggable cards:

- unscheduled job cards that are Ready Check-cleared and available on
  CrewBoard
- scheduled job cards that are not completed

Not draggable in the first pointer slice:

- appointments
- completed jobs
- warning rows
- crew assignment rows
- Daily Job Logs

Drop targets:

- day columns for date-only moves
- optional time buckets for date/start-time moves
- unscheduled lane only in a later slice if drag-to-unschedule is explicitly
  approved

After drop:

- do not mutate the job
- select the job
- create local proposed move state
- open or prepare the existing `Move schedule` confirmation flow
- show from/to summary, current crew state, schedule notes, and relevant
  warnings
- save only through the existing schedule action after user confirmation

Cancel behavior:

- clear proposed move state
- keep the job in its original rendered lane
- return focus to the originating job card when possible

No-op behavior:

- dropping a job onto its same date/time should open no mutation and use calm
  no-op copy if the confirmation panel is already open
- no-op drops must not submit the form

Warning behavior:

- missing crew remains advisory
- missing end time remains visible if a proposed start has no end
- overlap preview can be added when loaded data is sufficient, but server
  revalidation remains the source of truth after save

## Accessibility Model

Keyboard/manual `Move schedule` remains first-class. Pointer drag/drop is only
a progressive enhancement.

Required behavior:

- every draggable job still has visible Schedule, Reschedule, or Move schedule
  actions
- focus moves to the confirmation panel when a proposed move is prepared
- cancel returns focus to the source job card or nearest stable list heading
- save/error feedback uses the existing status and query-message patterns
- a polite live region announces proposed moves in plain language
- drop targets have accessible names such as `Move to Tue May 26` or
  `Move to Tue May 26 at 8:00 AM`
- reduced-motion users should not depend on animated card movement for
  understanding
- drag handles must not be the only way to schedule work

Mobile/touch fallback:

- keep the manual move form on mobile
- do not require drag/drop on phones
- avoid long-press-only behavior until touch QA proves it does not conflict
  with scrolling or text selection

## Data / Action Boundaries

No new schema, migrations, routes, dispatch tables, calendar sync, or schedule
records are needed for Phase 3B.

Use existing sources:

- `jobs`
- `job_assignments`
- `people`
- `vendors`
- `projects`
- `customers`
- appointments as read-only schedule context

Use existing behavior:

- Phase 3A move helper shape for proposed moves
- existing `scheduleJobAction` for confirmed schedule writes
- existing `unscheduleJobAction` only if a later drag-to-unschedule slice is
  approved
- existing warning helpers after confirmed save
- existing `assertProjectReadinessGate` inside `scheduleJob`

GateKeeper / Ready Check blocks must stay server-side authoritative. Client
drag state may explain readiness but must not decide authorization, tenant
scope, or final schedule validity.

## UI / State Design

Recommended state:

- `selectedJobId`
- `dragOrigin` for source card/drop metadata
- `activeDragJobId`
- `hoveredDropTarget`
- `proposedMove`
- `confirmationMode`
- `lastDragAnnouncement`
- `dragError`

State boundaries:

- local transient drag state only
- no optimistic schedule mutation before save
- render a proposed move preview only as draft/confirmation UI
- keep original job lane until confirmed save revalidates the page
- keep server errors in the existing redirected error feedback path

Stale data handling:

- if the job disappears or its schedule changes before confirmation, drop the
  proposed move and ask the user to reopen the schedule action
- after save, rely on current revalidation/redirect behavior to reload warnings,
  lanes, and selected-job state

## Testing Plan

Pure helper tests:

- continue using `apps/web/lib/schedule/move.test.ts`
- add proposed-drop helper tests if a new adapter maps day/time drop targets to
  `ScheduleMovePayload`
- cover duration preservation only if that behavior is implemented explicitly
- keep warnings tests in `apps/web/lib/schedule/warnings.test.ts`

Component/unit tests:

- add only if the repo has a stable component-test path for this surface
- otherwise prefer pure helpers plus Playwright route coverage

Playwright tests:

- keyboard/manual path remains available
- pointer/drop path opens the existing confirmation panel
- dropping does not mutate the job until confirm
- confirmed save posts through the existing schedule action
- server-blocked move shows existing error behavior
- mobile width keeps manual move controls usable

Avoid brittle pixel drag assertions where possible. Prefer stable selectors,
role/name queries, `dragTo` only for a small smoke path, and database checks
around mutation timing.

Existing E2E note: `e2e/schedule-ready-handoff.spec.js` already covers
schedule handoff and submit behavior, but some labels in that file still refer
to earlier `Update schedule` / `Save schedule` copy. Before relying on it for
Phase 3B, align those expectations with the current `Move schedule` form copy
or intentionally preserve backwards-compatible text in the UI.

## Implementation Slices

### Phase 3B-A: Proposed Move State And Drop Abstractions

- no package install
- add a small client component boundary only if needed around board cards/drop
  zones
- add typed proposed-move and drop-target helpers
- wire manual test scaffold so selecting a day/time prepares the same
  confirmation state
- no pointer drag/drop dependency yet

### Phase 3B-B: Pointer Drag Package If Approved

- install `@dnd-kit/core` only after 3B-A proves the state boundary
- make unscheduled and scheduled job cards draggable
- make day columns and optional time buckets droppable
- on drop, create proposed move and open confirmation
- no mutation on drop

### Phase 3B-C: Accessibility QA And Mobile Fallback

- verify keyboard/manual Move schedule remains complete
- add live-region announcements and focus return
- respect reduced motion
- confirm mobile keeps manual form and does not require drag/drop

### Phase 3B-D: Browser Smoke And Docs

- run focused helper tests
- run relevant Playwright smoke after auth state is healthy
- update CrewBoard docs with actual behavior
- document any protected-route auth blocker honestly

## Risks And Mitigations

- Package/bundle risk: defer dependency until the state boundary is proven;
  prefer `@dnd-kit/core` over a full calendar package.
- Accessibility risk: keep the manual form first-class, add focus management,
  live-region copy, and non-pointer actions.
- Mobile usability risk: do not require drag/drop on phones; preserve explicit
  controls.
- GateKeeper bypass risk: never write on drop; save only through the existing
  schedule action.
- Server action errors after drag: keep the original lane until save succeeds
  and show existing redirected error feedback.
- Timezone/date parsing risk: normalize date keys and datetime-local values
  through the existing Phase 3A helper shape; avoid deriving hidden timezone
  shifts in drag code.
- Conflict/overlap UX risk: show advisory warning preview where possible, but
  recompute after save and avoid hard client-side conflict decisions.
- Test brittleness risk: test proposed-move state and mutation timing instead
  of exact drag pixel paths.

## What Is Intentionally Not Implemented Yet

- pointer drag/drop UI
- `@dnd-kit/core` or any other package installation
- schema or migrations
- routes or server actions
- dispatch tables or schedule records
- crew availability calendars
- route optimization or maps
- recurring jobs
- external calendar sync
- notifications or automation
- AI scheduling
- portal/customer behavior
- auth, RLS, tenant logic, payments, signatures, estimates, invoices,
  settings, or platform-admin behavior
