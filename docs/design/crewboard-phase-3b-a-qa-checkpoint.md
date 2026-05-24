# CrewBoard Phase 3B-A QA Checkpoint

Status: Active
Doc Type: QA Checkpoint

## Purpose

Run a focused QA checkpoint for CrewBoard Phase 3B-A proposed move groundwork.
This pass verifies that URL-backed prepared move state, proposed-move helpers,
and inert target metadata remain a confirmation-first enhancement on top of the
existing `Move schedule` flow.

This checkpoint does not implement pointer drag/drop, add a package, change
schema, add routes, or introduce a new schedule write path.

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
- [docs/operating-core-validation-checklist.md](C:/FloorConnector/docs/operating-core-validation-checklist.md)
- [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md)
- [docs/graphite-copper-ui-system.md](C:/FloorConnector/docs/graphite-copper-ui-system.md)
- [docs/design/floorconnector-visual-system-evolution.md](C:/FloorConnector/docs/design/floorconnector-visual-system-evolution.md)

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

## Boundary Findings

- No pointer drag/drop implementation is present in the CrewBoard schedule page
  or schedule form.
- No drag/drop package was installed; package manifests still do not include
  `@dnd-kit/core` or another drag/drop dependency.
- No schema, migration, route path, dispatch table, dispatch model, or new
  server action was added.
- Prepared move state is URL/query state only. It does not call a server action
  and does not mutate a job.
- Confirmed saves still flow through the existing `scheduleJobAction` and
  existing job data helper path.
- GateKeeper / Ready Check remains server-authoritative through the existing
  scheduling write path.

## Proposed Move Helper Findings

- `CrewBoardDropTarget` covers date, time-bucket, and future unscheduled target
  shapes.
- `createCrewBoardMoveProposal(job, target)` converts a target into the same
  Phase 3A move payload and summary shape.
- `isValidDropTarget(target)` rejects malformed dates and invalid time values.
- `isNoopMoveProposal(proposal)` exposes no-op move detection from the existing
  move summary helper.
- `formatDropTargetLabel(target)` reuses existing schedule endpoint copy.
- Tests cover valid date targets, valid time-bucket targets, invalid targets,
  proposal payload shape, no-op detection, summary copy, URL target parsing,
  and the future unscheduled target shape.
- The helper reuses `buildScheduleMoveSummary`, keeping Phase 3A move semantics
  centralized rather than duplicating date/time summary rules.

## URL State Findings

- `/schedule` normalizes `moveTarget`, `moveDate`, `moveStart`, and `moveEnd`
  query values before building a proposed target.
- Invalid or missing move query values do not force a proposal and do not create
  a write path.
- Stale or missing `jobId` does not create a proposal because the page only
  creates `selectedMoveProposal` when a real selected job is present.
- Prepared target state fills the existing `Move schedule` form via
  `preparedProposal`; submitting remains a separate explicit form action.
- Clearing selected-job context or clearing the prepared move chip removes the
  proposal query state from the next schedule URL.

## Inert Target Metadata Findings

- Week date sections include data-only date target metadata.
- Day-focus time rows include data-only time-bucket target metadata.
- The board's Needs Scheduling lane includes data-only unscheduled target
  metadata for future evaluation.
- No `onDrag`, `onPointer`, `draggable`, drop handler, or pointer-event handler
  is attached to the CrewBoard schedule markup.
- The only user-facing copy is `Prepare move`, `Preview move`, and
  `Move schedule`; the UI does not promise drag/drop behavior.

## Accessibility / Manual-Flow Findings

- Manual `Move schedule` remains the primary accessible scheduling path.
- The Prepare/Preview affordance uses normal links and the existing labeled
  date/time form controls.
- Preview links include descriptive `aria-label` values based on the proposed
  target label.
- The existing move summary remains a polite live region in the schedule form.
- Mobile behavior still relies on explicit controls instead of pointer-only
  gestures.

## Tests Run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/proposed-move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- Focused Prettier write/check on touched checkpoint docs.
- `git diff --check`

## Browser QA Checked / Skipped

Saved contractor auth exists at `playwright/.auth/local-user.json`, but the
prior Phase 3B-A browser attempt hit local Supabase Auth
`over_request_rate_limit` and redirected protected `/schedule` checks to
`/login?next=%2Fschedule`.

Per [docs/local-auth-qa-recovery.md](C:/FloorConnector/docs/local-auth-qa-recovery.md),
this checkpoint does not keep retrying protected auth while the local auth
cooldown is active. Browser QA for selected-job prepared move URLs, mobile
overflow, and stacked-header regression should be retried after a known-good
auth refresh.

No real schedule move was submitted during this checkpoint.

## Behavior Preserved

- Existing schedule and unschedule actions are preserved.
- Existing crew assignment and unassignment flow is preserved.
- Existing schedule warnings remain advisory and read-only.
- Existing GateKeeper / Ready Check server enforcement is preserved.
- Existing canonical job and job-assignment data model remains the scheduling
  source of truth.
- Payment, signature, estimate, invoice, portal, settings, platform-admin,
  auth, RLS, and tenant-boundary behavior are unchanged.

## Follow-Up Candidates

- Retry protected browser QA after Supabase Auth cooldown and a single
  successful `pnpm e2e:auth` refresh.
- Add a focused protected Playwright check for prepared move query state once
  auth is healthy.
- If actual pointer drag/drop is approved, implement it as Phase 3B-B by mapping
  drag/drop events into the existing proposed-move abstraction and opening the
  same confirmation flow.
- Keep `@dnd-kit/core` uninstalled until the pointer drag/drop implementation
  slice is explicitly approved.
