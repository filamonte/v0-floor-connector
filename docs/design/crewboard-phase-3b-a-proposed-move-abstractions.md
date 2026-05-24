# CrewBoard Phase 3B-A Proposed Move Abstractions

Status: Implemented
Doc Type: Design Checkpoint

## Purpose

CrewBoard Phase 3B-A adds no-package proposed-move groundwork for future pointer
drag/drop scheduling. It gives `/schedule` a way to represent a target before
confirmation, while preserving the Phase 3A `Move schedule` form as the only
write path.

This phase does not implement pointer drag/drop, install a package, or mutate a
schedule from board interaction.

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

## Helper Abstractions Implemented

`apps/web/lib/schedule/proposed-move.ts` now defines:

- `CrewBoardDropTarget` for date, time-bucket, and future unscheduled targets.
- `CrewBoardMoveProposal` for the selected job, current schedule, target,
  payload, summary, validity, no-op state, and warnings.
- `createCrewBoardMoveProposal(job, target)` to turn a job and target into the
  existing Phase 3A move payload and summary.
- `formatDropTargetLabel(target)` for shared target labels.
- `isValidDropTarget(target)` for date and time-shape checks.
- `isNoopMoveProposal(proposal)` for no-change detection.
- `buildCrewBoardDropTargetFromSearch(input)` for URL-backed prepared move
  state.

The helper intentionally reuses the Phase 3A move summary and payload helper so
date/time normalization stays centralized.

## UI And Markup Changes

`/schedule` now accepts URL-backed prepared target state:

- `moveDate`
- `moveStart`
- `moveEnd`
- `moveTarget`

The selected job panel includes a small `Prepare move` area when the active
action is `schedule`. It lets the user preview a target date or common time
bucket and then fills the existing `Move schedule` form. Saving still requires
submitting the existing confirmation form.

The schedule board also includes data-only target metadata such as
`data-crewboard-drop-target`, `data-crewboard-drop-date`, and time-bucket
attributes. These attributes are inert and have no pointer handlers.

## Accessibility Behavior

Keyboard/manual scheduling remains the real accessible path. The prepared move
affordance uses links and the existing form fields, so it remains keyboard
reachable and screen-reader visible without pointer-only language.

The `Move schedule` form keeps its live move summary. A prepared target only
prefills the form and displays any proposal warnings before the existing submit
button.

## GateKeeper / Ready Check Boundaries

Phase 3B-A does not add a server action, route, schema, dispatch model, or
client-side write path. Confirmed saves still flow through the existing schedule
action, where Ready Check / GateKeeper behavior remains server-side.

Warnings are derived from existing schedule warning helpers after data is
loaded; proposal warnings are local UI guidance only.

## What Is Intentionally Not Implemented Yet

- Pointer drag/drop.
- `@dnd-kit/core` or any other drag/drop dependency.
- Hover, drop, or pointer event handlers.
- Optimistic schedule mutation.
- New schedule tables, dispatch tables, migrations, or routes.
- New server actions.
- Calendar sync, route optimization, automation, or notifications.
- Auth, RLS, tenant logic, payments, signatures, estimates, invoices, portal,
  settings, or platform-admin behavior.

## Follow-Up Candidates

- Phase 3B-B: add approved pointer drag/drop wiring that maps drag events into
  the proposed-move target abstraction and opens the same confirmation flow.
- Phase 3B-C: run accessibility QA around focus management, live-region copy,
  reduced motion, and phone fallback.
- Phase 3B-D: browser smoke, documentation checkpoint, and package/bundle review
  if a drag/drop dependency is approved.
