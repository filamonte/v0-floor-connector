# CrewBoard Phase 3A QA Checkpoint

## Purpose

Run a focused QA checkpoint for CrewBoard Phase 3A confirmed schedule moves.
This pass verifies that the new manual `Move schedule` flow remains a
confirmation-first scheduling improvement on the existing CrewBoard foundation,
not a new dispatch subsystem or pointer drag/drop implementation.

## Docs read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/Roadmap.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/design/crewboard-phase-1.md`
- `docs/design/crewboard-phase-2-dispatch-usability.md`
- `docs/design/crewboard-phase-3-drag-drop-dispatch-spec.md`
- `docs/design/crewboard-phase-3a-confirmed-schedule-move.md`
- `docs/operating-core-validation-checklist.md`
- `docs/local-auth-qa-recovery.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Files inspected

- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/schedule-job-form.tsx`
- `apps/web/components/schedule-crew-assignment-form.tsx`
- `apps/web/lib/schedule/move.ts`
- `apps/web/lib/schedule/move.test.ts`
- `apps/web/lib/schedule/warnings.ts`
- `apps/web/lib/schedule/warnings.test.ts`
- `apps/web/lib/jobs/actions.ts`
- `apps/web/lib/jobs/data.ts`
- `apps/web/app/(app)/jobs/[jobId]/page.tsx`
- `package.json`
- `apps/web/package.json`

## Data/model boundary findings

- Phase 3A did not add schema or migrations.
- No new dispatch model, schedule table, route path, server action, package, or
  duplicate schedule record was added.
- The `Move schedule` form still submits through the existing
  `scheduleJobAction`.
- `scheduleJob` remains the server-owned write path and still calls
  `assertProjectReadinessGate` before schedule writes.
- Existing `unscheduleJobAction`, crew assignment actions, and advisory
  schedule warnings remain separate and unchanged.
- No route optimization, calendar sync, automation, notifications, portal
  exposure, payment, signature, estimate, invoice, settings, or platform-admin
  behavior was introduced.

## Move helper findings

- `buildScheduleMoveSummary` is pure and does not mutate data or call a server
  action.
- The helper normalizes current and proposed schedule endpoints, returns a
  stable payload shape, detects no-op movement, and formats user-friendly
  summaries.
- Tests cover unscheduled-to-scheduled movement, scheduled date movement,
  scheduled time movement, no-op detection, missing end time handling, and
  date-only schedule formatting.
- Missing end time remains visible in summary/detail copy so existing schedule
  warnings can continue to flag that state.

## CrewBoard UI findings

- The selected-job schedule composer now reads as `Move schedule`.
- The form shows current schedule, proposed date/time controls, schedule notes,
  and a live move summary before submit.
- No-op moves use calm neutral copy instead of warning styling.
- Existing unschedule behavior remains available where the job status allows it.
- Existing crew assignment flow remains in its separate `Manage crew assignment`
  path.
- Schedule warnings continue to render from the existing warning helper and page
  read model.

## Accessibility/manual-flow findings

- Phase 3A is keyboard/manual first: date, datetime, textarea, submit, and
  unschedule controls are ordinary labeled form controls.
- The move summary uses a polite live region.
- There is no pointer-only interaction and no visible Phase 3A drag/drop claim
  in the schedule form.
- Mobile-width browser smoke loaded CrewBoard without horizontal overflow.

## Tests run

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/move.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/schedule/warnings.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- Focused Prettier write/check on touched files
- `git diff --check`

## Browser QA checked/skipped

Saved contractor auth was available at `playwright/.auth/local-user.json`.

Checked:

- `/schedule` with saved contractor auth at a mobile-ish viewport.
- CrewBoard loaded with the protected shell.
- No horizontal overflow was detected on the loaded schedule page.

Blocked:

- Deeper selected-job move-control browser verification was blocked by local
  Supabase Auth `over_request_rate_limit` redirects after attempting protected
  selected-job action URLs.
- No schedule move was submitted.
- No auth refresh or repeated login setup was attempted during the rate-limit
  state.

## Behavior preserved

- Existing schedule and unschedule actions are preserved.
- Existing crew assignment and unassignment flow is preserved.
- Existing GateKeeper / Ready Check server enforcement is preserved.
- Existing advisory warning behavior is preserved.
- Existing canonical job and job assignment model remains the only scheduling
  data model used by CrewBoard.

## Follow-up candidates

- Retry selected-job move-control browser QA after Supabase Auth cooldown.
- Add projected warning preview in the move summary if dispatcher feedback shows
  it would reduce mistakes.
- Keep any future pointer drag/drop slice as a proposed move that still saves
  only after confirmation.
