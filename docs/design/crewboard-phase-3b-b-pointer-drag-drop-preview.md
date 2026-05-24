# CrewBoard Phase 3B-B Pointer Drag Drop Preview

Status: Implemented
Doc Type: Design Note

## Purpose

CrewBoard Phase 3B-B adds pointer drag/drop as a progressive enhancement on
top of the existing proposed-move and confirmed `Move schedule` flow.

Dragging a job card to a CrewBoard target prepares a proposed move only. It does
not save, mutate, call a server action, or bypass Ready Check / GateKeeper. The
user still reviews and confirms through the existing `Move schedule` form.

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
- [docs/design/crewboard-phase-3b-drag-drop-technical-spike.md](C:/FloorConnector/docs/design/crewboard-phase-3b-drag-drop-technical-spike.md)
- [docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md)
- [docs/design/crewboard-phase-3b-a-qa-checkpoint.md](C:/FloorConnector/docs/design/crewboard-phase-3b-a-qa-checkpoint.md)
- [docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Package Added

Phase 3B-B adds:

- `@dnd-kit/core`

No calendar package, sortable package, route-optimization package, automation
package, or provider integration package was added.

## Files Inspected

- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/components/schedule-crew-assignment-form.tsx](C:/FloorConnector/apps/web/components/schedule-crew-assignment-form.tsx)
- [apps/web/lib/schedule/proposed-move.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.ts)
- [apps/web/lib/schedule/proposed-move.test.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.test.ts)
- [apps/web/lib/schedule/move.ts](C:/FloorConnector/apps/web/lib/schedule/move.ts)
- [apps/web/lib/schedule/move.test.ts](C:/FloorConnector/apps/web/lib/schedule/move.test.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [apps/web/lib/schedule/warnings.test.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.test.ts)
- [apps/web/lib/schedule/links.ts](C:/FloorConnector/apps/web/lib/schedule/links.ts)
- [apps/web/lib/jobs/actions.ts](C:/FloorConnector/apps/web/lib/jobs/actions.ts)
- [apps/web/lib/jobs/data.ts](C:/FloorConnector/apps/web/lib/jobs/data.ts)
- [package.json](C:/FloorConnector/package.json)
- [apps/web/package.json](C:/FloorConnector/apps/web/package.json)
- [playwright.config.js](C:/FloorConnector/playwright.config.js)
- [e2e/schedule-ready-handoff.spec.js](C:/FloorConnector/e2e/schedule-ready-handoff.spec.js)

## Client Component Boundary

The `/schedule` Manager Page remains server-rendered. Drag/drop is isolated in
[apps/web/components/crewboard-drag-drop-layer.tsx](C:/FloorConnector/apps/web/components/crewboard-drag-drop-layer.tsx).

The client boundary provides:

- `CrewBoardDragDropLayer` for the `@dnd-kit/core` context and transient drag
  state.
- `CrewBoardDraggableJob` for existing CrewBoard job cards.
- `CrewBoardDropTarget` for existing planner date and time-bucket targets.

Only minimal serializable job schedule fields and target data cross into the
client boundary.

## Drag/Drop Behavior

Supported preview targets in this slice:

- week planner date targets
- day planner time-bucket targets

Supported draggable cards:

- scheduled job cards in day and week planner views

Unscheduled job drag is intentionally deferred because the current board mode
does not show date or time-bucket targets in the same layout. Unscheduled jobs
still use the manual `Prepare move` / `Preview move` controls.

Dragging uses an activation distance so normal card links remain usable. A
valid drop updates the `/schedule` URL with the selected `jobId`,
`action=schedule`, and prepared move target params, then anchors to
`#schedule-action`.

## Proposed Move Integration

The drag/drop layer does not save schedule data. It updates the same prepared
move URL state introduced in Phase 3B-A:

- `jobId`
- `action=schedule`
- `moveDate`
- `moveStart`
- `moveEnd`
- `moveTarget` only for future unscheduled target support

The server-rendered `/schedule` page then rebuilds the existing
`CrewBoardMoveProposal` through `buildCrewBoardDropTargetFromSearch` and
`createCrewBoardMoveProposal`, and passes that proposal into the existing
`ScheduleJobForm`.

## Accessibility/Manual Fallback

Manual `Move schedule` remains the complete scheduling path. The drag/drop
helper copy says: "Drag is optional. You can also use Move schedule."

The drag/drop layer includes a polite screen-reader status update for drag start,
cancel, invalid drop, and prepared move. After a prepared drop, focus is moved
toward the existing `#schedule-action` panel.

## Mobile Fallback

Drag/drop is not required on mobile. The selected-job `Prepare move`,
`Preview move`, and `Move schedule` controls remain the mobile path.

This slice avoids mobile-only drag/drop copy and keeps the existing manual form
visible and keyboard accessible.

## Behavior Preserved

Preserved behavior:

- existing `scheduleJobAction` submit path
- existing `unscheduleJobAction` button path
- Ready Check / GateKeeper server enforcement
- schedule warning derivation
- selected-job URL handoff
- manual and keyboard `Move schedule` flow
- existing job/project links inside cards

No schema, migration, route path, server action, dispatch model, auth/RLS,
tenant logic, payment, signature, estimate, invoice, portal, settings, or
platform-admin behavior changed.

## What Is Intentionally Not Implemented Yet

- no direct schedule save on drop
- no drag-to-unschedule behavior
- no unscheduled-job drag from board mode
- no route optimization
- no external calendar sync
- no automated dispatch
- no notifications
- no AI scheduling
- no map view
- no `@dnd-kit/sortable`
- no full calendar package

## Follow-Up Candidates

- Add focused Playwright coverage for drag/drop URL preparation if local auth is
  healthy and the interaction is stable enough to avoid brittle pixel tests.
- Consider a clearer drag handle if card-level dragging feels too broad during
  browser QA.
- Decide whether unscheduled-job drag and drag-to-unscheduled belong in a later
  slice or should remain manual only.
- Revisit touch sensors only after mobile manual-flow QA stays clean.
