# CrewBoard Phase 3B-B QA Checkpoint

Status: Checkpointed
Doc Type: QA Checkpoint

## Purpose

This checkpoint validates CrewBoard Phase 3B-B: pointer drag/drop preview on
`/schedule`.

The QA scope is intentionally narrow. It verifies that the new drag/drop layer
prepares the existing `Move schedule` confirmation flow only, preserves the
manual/keyboard path, and does not introduce a second schedule write path.

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
- [docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md](C:/FloorConnector/docs/design/crewboard-phase-3b-b-pointer-drag-drop-preview.md)
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

## Files Inspected

- [apps/web/components/crewboard-drag-drop-layer.tsx](C:/FloorConnector/apps/web/components/crewboard-drag-drop-layer.tsx)
- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/lib/schedule/proposed-move.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.ts)
- [apps/web/lib/schedule/proposed-move.test.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.test.ts)
- [apps/web/lib/schedule/move.ts](C:/FloorConnector/apps/web/lib/schedule/move.ts)
- [apps/web/lib/schedule/move.test.ts](C:/FloorConnector/apps/web/lib/schedule/move.test.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [apps/web/lib/schedule/warnings.test.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.test.ts)
- [apps/web/lib/schedule/links.ts](C:/FloorConnector/apps/web/lib/schedule/links.ts)
- [apps/web/lib/jobs/actions.ts](C:/FloorConnector/apps/web/lib/jobs/actions.ts)
- [apps/web/lib/jobs/data.ts](C:/FloorConnector/apps/web/lib/jobs/data.ts)
- [apps/web/package.json](C:/FloorConnector/apps/web/package.json)
- [package.json](C:/FloorConnector/package.json)
- [pnpm-lock.yaml](C:/FloorConnector/pnpm-lock.yaml)
- [playwright.config.js](C:/FloorConnector/playwright.config.js)
- [e2e/schedule-ready-handoff.spec.js](C:/FloorConnector/e2e/schedule-ready-handoff.spec.js)

## Boundary Findings

- Drag/drop does not import or call `scheduleJobAction`,
  `unscheduleJobAction`, or any server action.
- Drag/drop does not call `fetch`, submit `FormData`, or write schedule data.
- `handleDragEnd` only builds prepared URL state and calls `router.push`.
- The existing `ScheduleJobForm` remains the only schedule save path for the
  prepared move.
- Ready Check / GateKeeper still live behind the existing schedule action path.
- No schema, migration, route path, server action, dispatch table, or dispatch
  model was added.

## Package/Dependency Findings

- `@dnd-kit/core` is present only in `apps/web/package.json`.
- The lockfile includes `@dnd-kit/core` plus its expected accessibility and
  utility dependencies.
- No full calendar package, sortable package, route optimization package,
  provider integration, automation package, or notification package was added.
- `pnpm.cmd --filter @floorconnector/web list @dnd-kit/core` resolves the
  installed dependency for the intended workspace.

## Component/Import Findings

- `apps/web/components/crewboard-drag-drop-layer.tsx` is a focused client
  component with `"use client"`.
- The component imports React, Next navigation, `@dnd-kit/core`, and schedule
  types only.
- The client layer receives minimal serializable job schedule fields and
  drop-target data.
- Active drag state is local and transient.
- `CrewBoardDropTarget` preserves stable `data-crewboard-drop-*` metadata for
  future QA.
- No server-only data loader, database helper, auth helper, or job server action
  crosses into the client component.

## Accessibility/Manual Fallback Findings

- User-facing copy says: "Drag is optional. You can also use Move schedule."
- The manual `Prepare move`, `Preview move`, and `Move schedule` controls remain
  available.
- The drag layer uses a polite screen-reader status update for drag start,
  cancel, invalid drop, and prepared move states.
- After a prepared drop, the layer anchors/focuses toward `#schedule-action`.
- Browser smoke confirmed the helper copy renders on desktop and mobile.
- Mobile smoke found no horizontal overflow.

## Tests Run

- `node .\node_modules\prettier\bin\prettier.cjs --write ...`
- `node .\node_modules\prettier\bin\prettier.cjs --check ...`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/web list @dnd-kit/core`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/proposed-move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
- `git diff --check`
- `git status --short --branch`

## Browser QA Checked/Skipped

Browser smoke used saved local contractor auth through Playwright against
`http://localhost:3001`.

Checked:

- desktop `/schedule`
- mobile-ish `/schedule`
- helper copy visible
- Schedule board heading visible
- no horizontal overflow on desktop or mobile
- no server errors or page errors captured during the smoke

Skipped:

- Full drag execution. The loaded local data/layout did not expose both a
  draggable job card and a visible date/time-bucket drop target at the same
  time, so the test did not claim drag/drop execution coverage.
- Real schedule submit. QA did not submit a schedule move.

## Behavior Preserved

Preserved behavior:

- existing schedule form submit path
- existing unschedule form path
- manual selected-job Move schedule flow
- URL-backed prepared move state
- schedule warning derivation
- job/project handoff links
- Ready Check / GateKeeper server enforcement

No schema, migrations, route paths, server actions, auth/RLS, tenant logic,
payments, signatures, estimates, invoices, portal behavior, settings behavior,
or platform-admin behavior changed during this QA checkpoint.

## Follow-Up Candidates

- Add a deterministic fixture or Playwright setup that guarantees a visible
  scheduled job plus date/time-bucket target for drag/drop preview coverage.
- Consider a dedicated drag handle if card-level dragging interferes with
  normal card link use in hands-on QA.
- Decide whether unscheduled-job drag and drag-to-unscheduled should remain
  manual-only or become a later preview slice.
