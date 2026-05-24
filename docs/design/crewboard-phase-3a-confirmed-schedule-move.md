# CrewBoard Phase 3A Confirmed Schedule Move

## Purpose

CrewBoard Phase 3A adds the first implementation slice from the Phase 3 drag/drop
dispatch plan: a confirmation-first manual schedule move flow. Dispatchers can
review a scheduled job's current timing, choose a new date and optional time, and
save the change through the existing schedule action.

This is not pointer drag/drop. It is the keyboard/manual foundation that future
drag/drop can reuse as a proposed move and confirmation path.

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
- `docs/design/mobile-field-phase-2-quick-job-notes-evidence.md`
- `docs/operating-core-validation-checklist.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`

## Existing data/actions used

- Existing `jobs` schedule fields:
  - `scheduled_date`
  - `scheduled_start_at`
  - `scheduled_end_at`
  - `schedule_notes`
  - `crew_vendor_id`
- Existing job assignment and warning helpers for crew and overlap visibility.
- Existing `scheduleJobAction` and `unscheduleJobAction`.
- Existing `scheduleJob` server-side behavior, including Ready Check /
  GateKeeper enforcement.

No schema, migration, new route, dispatch table, duplicate schedule record, or
new server action was added.

## Move helper behavior

`apps/web/lib/schedule/move.ts` now provides pure helpers for schedule move
review:

- normalizes proposed current and next schedule endpoints
- formats unscheduled, date-only, timed, and missing-end-time schedule labels
- produces a stable payload shape for the existing schedule action
- detects no-op moves
- returns user-friendly summary and detail copy
- does not mutate data or call a server action

Focused tests cover unscheduled-to-scheduled movement, date changes, time
changes, no-op detection, missing end time handling, and date-only formatting.

## CrewBoard UI changes

The selected-job action panel on `/schedule` continues to use the existing
schedule form, now framed as a `Move schedule` flow when a job is selected.

The form shows:

- the current schedule
- new scheduled date
- optional new start and end times
- schedule notes
- a live review summary before saving
- the existing unschedule control

Saving still posts to the existing schedule action. Schedule warnings continue
to be recomputed by the existing page read model after the action revalidates
and redirects.

## Accessibility behavior

Phase 3A is the accessibility-first scheduling flow:

- standard labeled form controls remain keyboard accessible
- the review summary uses a polite live region
- the submit control uses explicit `Move schedule` language
- there is no pointer-only path
- mobile widths keep the controls in the normal selected-job panel flow

## GateKeeper / Ready Check behavior preserved

GateKeeper / Ready Check remains server-authoritative because the form still
uses the existing schedule action and job scheduling data path. Phase 3A does
not introduce a client-side bypass, alternate mutation, or schedule-only record.

## What is intentionally not implemented yet

- pointer drag/drop
- drag/drop package installation
- route optimization
- map dispatch
- recurring jobs
- crew availability calendars
- capacity planning
- automatic scheduling
- external calendar sync
- notifications or automation
- new dispatch tables or schedule records
- new upload, portal, payment, signature, estimate, invoice, settings, or
  platform-admin behavior

## Follow-up candidates

- Add projected warning previews before saving a proposed move.
- Add quick duration-preserving move controls once dispatcher patterns are
  proven.
- Implement pointer drag/drop as Phase 3B by creating proposed moves that still
  require confirmation.
- Run a dedicated mobile QA checkpoint after the manual move flow has real user
  feedback.
