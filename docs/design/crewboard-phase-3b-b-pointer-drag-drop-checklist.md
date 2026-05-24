# CrewBoard Phase 3B-B Pointer Drag Drop Checklist

Status: Planned
Doc Type: Design Checklist

## Purpose

This checklist is the final pre-implementation pass for CrewBoard Phase 3B-B:
pointer drag/drop scheduling as a progressive enhancement on top of the
implemented Phase 3B-A proposed-move groundwork.

This pass does not implement pointer drag/drop, install packages, change app
code, add schema, add routes, add server actions, or alter auth, RLS, tenant,
payment, signature, estimate, invoice, portal, settings, or platform-admin
behavior.

## Docs Read

- [docs/developer-source-of-truth.md](C:/FloorConnector/docs/developer-source-of-truth.md)
- [docs/current-state.md](C:/FloorConnector/docs/current-state.md)
- [docs/workflows.md](C:/FloorConnector/docs/workflows.md)
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
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)

## Files Inspected

- [apps/web/app/(app)/schedule/page.tsx](<C:/FloorConnector/apps/web/app/(app)/schedule/page.tsx>)
- [apps/web/components/schedule-job-form.tsx](C:/FloorConnector/apps/web/components/schedule-job-form.tsx)
- [apps/web/lib/schedule/proposed-move.ts](C:/FloorConnector/apps/web/lib/schedule/proposed-move.ts)
- [apps/web/lib/schedule/move.ts](C:/FloorConnector/apps/web/lib/schedule/move.ts)
- [apps/web/lib/schedule/warnings.ts](C:/FloorConnector/apps/web/lib/schedule/warnings.ts)
- [package.json](C:/FloorConnector/package.json)
- [apps/web/package.json](C:/FloorConnector/apps/web/package.json)
- [playwright.config.js](C:/FloorConnector/playwright.config.js)
- [e2e/schedule-ready-handoff.spec.js](C:/FloorConnector/e2e/schedule-ready-handoff.spec.js)

## Current CrewBoard State

CrewBoard now has the scheduling depth needed to prepare pointer drag/drop
without changing the underlying scheduling model:

- Phase 1 established `/schedule` as the CrewBoard workspace on canonical jobs.
- Phase 2 added date navigation, schedule warnings, missing crew, missing
  end-time, and overlap signals.
- Phase 3A added confirmation-first manual and keyboard schedule movement
  through the existing selected-job `Move schedule` action panel.
- Phase 3B-A added pure proposed-move helpers, URL-backed prepared move state,
  inert CrewBoard target metadata, and `Prepare move` / `Preview move`
  affordances that fill the existing `Move schedule` form.

No pointer drag/drop package is installed. No pointer drag/drop behavior exists.
No schedule mutation occurs from prepared move state alone.

## Final Package Recommendation

Use `@dnd-kit/core` for Phase 3B-B only when pointer drag/drop implementation is
explicitly approved.

Expected install command:

```powershell
pnpm.cmd --filter @floorconnector/web add @dnd-kit/core
```

The package is justified for the implementation slice because Phase 3B-B needs
React-compatible sensors, custom droppable zones, keyboard-compatible drag
primitives, touch behavior controls, and testable drag lifecycle state. Native
pointer events would reduce dependency count, but would make FloorConnector own
too much accessibility, sensor, cancellation, and browser-interaction behavior
for a production scheduling surface.

The package must not become a second scheduling workflow. Drag/drop should only
translate a dragged canonical job card plus an existing CrewBoard target into a
`CrewBoardMoveProposal`, then open or prepare the existing `Move schedule`
confirmation flow. The user still saves through the existing schedule action, so
Ready Check and GateKeeper remain server-enforced.

Keyboard/manual Move schedule stays the primary fallback. Pointer drag/drop is a
progressive enhancement for users who can and want to use it.

## Exact Implementation Prerequisites

- Confirm the repo is aligned and that the latest Phase 3B-A QA checkpoint is on
  `origin/main`.
- Confirm `apps/web/lib/schedule/proposed-move.test.ts`,
  `apps/web/lib/schedule/move.test.ts`, and
  `apps/web/lib/schedule/warnings.test.ts` pass before and after the change.
- Confirm `/schedule` still has selected scheduled and unscheduled jobs in the
  available local development data before browser QA.
- Confirm local saved contractor auth is healthy before counting protected
  browser QA; if auth redirects to `/login` or Supabase returns
  `over_request_rate_limit`, report the blocker instead of counting the route
  as passed.
- Confirm mobile fallback behavior before enabling any touch sensor. The manual
  `Prepare move` and `Move schedule` path must remain sufficient on phones.
- Decide whether Phase 3B-B enables date-only targets and time-bucket targets in
  one slice or starts with date targets only. The safer default is date and
  existing time buckets because Phase 3B-A already models both.
- Keep unscheduling by drag out of the first pointer slice unless explicitly
  approved. The existing button can continue to handle unscheduling.

## Component Boundaries To Touch

Phase 3B-B should stay tightly scoped:

- `apps/web/app/(app)/schedule/page.tsx`: pass existing canonical job-card and
  CrewBoard target metadata into a client interaction boundary; preserve server
  data loading and existing links.
- New focused client component, such as
  `apps/web/components/crewboard-drag-drop-preview.tsx`: own `DndContext`,
  sensors, draggable card wrappers, droppable target wrappers, and
  `onDragEnd` proposal routing.
- `apps/web/lib/schedule/proposed-move.ts`: only add adapter helpers if the
  drag package needs a typed conversion from drag payload and droppable payload
  to the existing target shape.
- `apps/web/lib/schedule/links.ts` or existing schedule href helpers: only if a
  small helper is needed to build prepared-move URLs consistently.
- `apps/web/components/schedule-job-form.tsx`: avoid changes unless focus,
  live-region, or prepared-proposal copy needs a small accessibility hardening.

Do not touch database files, migrations, route paths, server actions, provider
integrations, auth/RLS logic, payments, signatures, estimates, invoices, portal,
settings, or platform-admin behavior.

## Proposed Code Changes For Phase 3B-B

1. Install `@dnd-kit/core` only after confirming this checklist is still the
   approved path.
2. Add a small client component around the existing CrewBoard card and target
   structure instead of converting the whole `/schedule` page into a client
   component.
3. Represent draggable payloads as canonical job identifiers and the schedule
   fields already accepted by `createCrewBoardMoveProposal`.
4. Represent droppable payloads with the existing Phase 3B-A target shape:
   `date`, `time_bucket`, or explicitly deferred `unscheduled`.
5. On drag start, track transient drag state only. Do not modify job lists,
   dates, warning state, or persisted schedule fields.
6. On drag over, show only lightweight affordance state. Do not create or save a
   proposal until drop.
7. On drag end, ignore invalid/no-op drops. For valid drops, create a
   `CrewBoardMoveProposal` and navigate or update URL state to the existing
   selected-job `Move schedule` composer with prepared move params.
8. Preserve the current `ScheduleJobForm` submit as the only schedule write.
9. Keep schedule warnings advisory until the confirmed save reloads/revalidates
   data.
10. Keep cancellation simple: Escape/cancel clears transient drag state; the
    existing `Clear prepared move` link clears prepared URL state.

## Accessibility Checklist

- Manual `Move schedule` remains visible, keyboard accessible, and complete.
- Pointer drag/drop copy does not replace `Prepare move`, `Preview move`, or
  `Move schedule` language.
- The selected-job composer receives focus or a clear focus target after a
  successful drop prepares a move.
- Drag cancellation returns focus to the source job card or the nearest stable
  schedule control.
- Add a polite live region for prepared-move announcements, for example:
  `Prepared move to <target>. Review and save to update the schedule.`
- Use `@dnd-kit/core` keyboard sensors only if the keyboard interaction opens
  the same prepared-move confirmation path and is understandable. If not, keep
  keyboard users on the existing manual move controls for the first pointer
  slice.
- Respect reduced motion by avoiding animated overlays that are required for
  comprehension.
- Target labels should be stable and descriptive enough for future tests and
  screen reader announcements.

## Mobile Fallback Checklist

- Do not require drag/drop on phones.
- Keep the existing selected-job `Prepare move` / `Preview move` controls as the
  mobile path.
- If pointer sensors are enabled on touch devices, verify scroll does not become
  frustrating or blocked.
- If touch behavior is not ready, disable drag sensors below the chosen mobile
  breakpoint while keeping all manual controls visible.
- Browser QA must include a mobile-ish `/schedule` viewport with no horizontal
  overflow and no stacked-header regression.

## Testing Checklist

Unit and helper tests:

- `apps/web/lib/schedule/proposed-move.test.ts`
- `apps/web/lib/schedule/move.test.ts`
- `apps/web/lib/schedule/warnings.test.ts`
- Add adapter-helper coverage only if Phase 3B-B introduces new pure helpers.

Type and lint:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`

Playwright:

- Existing schedule handoff coverage in
  `e2e/schedule-ready-handoff.spec.js` remains relevant for the manual path and
  no-mutation-before-submit behavior.
- Add or extend focused protected-route coverage only if saved contractor auth
  is healthy.
- Prefer testing the URL/prepared-proposal effect over brittle pixel-perfect drag
  assertions.
- Verify a drag/drop path prepares the Move schedule composer.
- Verify no schedule mutation occurs until the existing form submit.
- Verify invalid/no-op drops do not prepare misleading state.
- Verify the mobile fallback keeps manual move controls usable.

## Rollback Plan

Rollback should be straightforward because Phase 3B-B must not add schema,
routes, server actions, or data migrations:

- Remove the `@dnd-kit/core` dependency if installed for Phase 3B-B.
- Remove the focused client drag/drop component and its imports.
- Leave Phase 3B-A proposed-move helpers and manual `Prepare move` preview
  controls intact unless the implementation changed them.
- Keep existing schedule actions, Ready Check, GateKeeper, warnings, and
  selected-job links unchanged.

## What Must Remain Unchanged

- No schema or migration changes.
- No new route paths.
- No new server actions.
- No new dispatch table or dispatch data model.
- No schedule mutation from drag/drop, hover, URL state, or proposal state alone.
- No bypass of Move schedule confirmation.
- No bypass of Ready Check or GateKeeper server enforcement.
- No auth, RLS, tenant, payment, signature, estimate, invoice, portal, settings,
  or platform-admin behavior changes.
- No route optimization, calendar sync, automation, notifications, AI
  scheduling, or map views.

## Exact Future Codex Implementation Prompt

```text
Chat: CrewBoard Phase 3B-B - Pointer Drag Drop Preview Flow

You are working in the FloorConnector repo.

Goal:
Implement CrewBoard Phase 3B-B: pointer drag/drop preview flow for scheduling as
a progressive enhancement on top of the Phase 3B-A proposed-move groundwork.

Install `@dnd-kit/core` only if this checklist is still approved:
- docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md

Required first step:
Confirm repo is clean/aligned:
- git status --short --branch
- git log --oneline -10

Then read:
- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/Roadmap.md
- docs/target-ia.md
- docs/chat-handoff.md
- docs/product-language.md
- docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md
- docs/design/crewboard-phase-3a-confirmed-schedule-move.md
- docs/design/crewboard-phase-3b-drag-drop-technical-spike.md
- docs/design/crewboard-phase-3b-a-proposed-move-abstractions.md
- docs/design/crewboard-phase-3b-a-qa-checkpoint.md
- docs/design/crewboard-phase-3b-b-pointer-drag-drop-checklist.md
- docs/operating-core-validation-checklist.md
- docs/local-auth-qa-recovery.md

Then inspect:
- apps/web/app/(app)/schedule/page.tsx
- apps/web/components/schedule-job-form.tsx
- apps/web/lib/schedule/proposed-move.ts
- apps/web/lib/schedule/move.ts
- apps/web/lib/schedule/warnings.ts
- apps/web/lib/schedule/links.ts
- package.json
- apps/web/package.json
- playwright.config.js
- e2e/schedule-ready-handoff.spec.js

Implementation requirements:
- Wire pointer drag/drop as a progressive enhancement only.
- Use Phase 3B-A proposed-move helpers.
- Create a proposed move only on drop.
- Open or prepare the existing Move schedule confirmation flow after drop.
- Never mutate schedules on drag start, hover, drag over, or drop.
- Never bypass the existing Move schedule confirmation form.
- Preserve the keyboard/manual Move schedule flow as a first-class path.
- Preserve Ready Check and GateKeeper server enforcement by saving only through
  the existing schedule action.
- Keep mobile fallback usable through manual Prepare/Preview move controls.
- Do not add schema, migrations, new route paths, new server actions, dispatch
  tables, provider integrations, auth/RLS changes, tenant logic changes,
  payments, signatures, estimates, invoices, portal behavior, settings behavior,
  or platform-admin behavior.

Validation:
- Run focused Prettier on touched files.
- Run pnpm.cmd --filter @floorconnector/web typecheck.
- Run pnpm.cmd --filter @floorconnector/web lint.
- Run focused tests for schedule proposed-move, move, and warnings.
- Run browser QA on /schedule if saved contractor auth is healthy.
- Verify drag/drop prepares the Move schedule composer and does not mutate until
  submit.
- Verify mobile-ish /schedule viewport has no horizontal overflow or stacked
  header regression.

Commit:
If validation passes, commit with:
feat: add CrewBoard pointer drag drop preview flow
```
