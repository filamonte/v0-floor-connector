# CrewBoard Phase 2 - Dispatch Usability And Schedule Detail

Status: Active
Doc Type: Implementation Note

## Purpose

CrewBoard Phase 2 improves the existing `/schedule` workspace for daily dispatch review and crew planning without creating a separate dispatch system.

The slice keeps CrewBoard on the existing canonical job foundation and adds clearer date controls, schedule-note visibility, Project Workspace continuity, and read-only schedule warnings from real job timing and crew-assignment data.

## Docs Read

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/system-overview.md`
- `docs/target-ia.md`
- `docs/vision.md`
- `docs/Roadmap.md`
- `docs/chat-handoff.md`
- `docs/product-language.md`
- `docs/product-language-audit.md`
- `docs/design/crewboard-phase-1.md`
- `docs/graphite-copper-ui-system.md`
- `docs/design/floorconnector-visual-system-evolution.md`
- `docs/design/stitch/chrome-collapse-dashboard-header-cleanup.md`
- `docs/design/stitch/unified-header-architecture-cleanup.md`

## Existing Canonical Data Used

CrewBoard Phase 2 continues to read existing records only:

- `jobs`
- `job_assignments`
- `people`
- `vendors`
- `projects`
- `customers`
- job schedule fields: `scheduled_date`, `scheduled_start_at`, `scheduled_end_at`, `schedule_notes`
- job crew field: `crew_vendor_id`
- existing appointment and opportunity assessment schedule context where already present

No new schedule, dispatch, calendar, crew, warning, or board table was added.

## Route / Surface Changed

- `/schedule` remains the CrewBoard route.
- No route path was renamed.
- Navigation remains on the existing CrewBoard surface.

## Date Navigation / View Grouping Implemented

- Existing `?date=YYYY-MM-DD` handling remains the schedule anchor.
- Existing `layout=week`, `layout=day`, and `layout=board` modes remain intact.
- Previous, Today, and Next controls now remain visible in board mode as well as day/week modes.
- Board mode preserves the selected date in links so handoffs from jobs, projects, and schedule actions keep date context.
- The day rail continues to order scheduled jobs by start hour and shows untimed work separately as `Time not set`.

This is still a lightweight planner, not a full calendar system.

## Crew Visibility Improvements

- Job cards continue to show crew state from existing job assignments and crew vendor data.
- Scheduled or active jobs with no assignments remain visible as Missing Crew.
- Existing assign/unassign actions remain reachable through the selected-job action panel.
- Project links on CrewBoard cards and warning rows now use Project Workspace language for clearer continuity.

CrewBoard does not create crews, crew availability calendars, or separate crew records.

## Schedule Warning Behavior

Phase 2 adds a pure read-only schedule-warning helper under `apps/web/lib/schedule/warnings.ts`.

Warnings are derived from real job data only:

- scheduled or active job missing crew
- scheduled job with a start time but no end time, where overlap detection cannot be trusted
- same person, labor-provider vendor, or crew vendor assigned to overlapping scheduled job windows on the same date

These warnings are advisory. They do not block actions, mutate jobs, enforce new rules, create cue state, or bypass GateKeeper / Ready Check behavior.

## Actions Preserved

The existing write paths remain unchanged:

- schedule job
- unschedule job
- assign crew
- unassign crew

No server action was rewritten or added for this phase.

## GateKeeper / Ready Check Behavior Preserved

CrewBoard Phase 2 does not loosen readiness enforcement. Existing project ready-to-schedule rules and job schedule actions continue to own actual scheduling validation.

GateKeeper / Ready Check language remains explanatory: it helps users understand why work may not be ready, but the UI warning layer does not create a new enforcement system.

## Future Work Not Implemented

The following remain future work:

- drag/drop scheduling
- calendar sync
- notifications
- map routing
- automated dispatch
- recurring jobs
- advanced capacity planning
- crew availability calendars
- overtime or labor forecasting
- weather-aware schedule guidance
- route optimization

## Follow-Up Candidates

- Add a dedicated crew/resource capacity review once assignment windows become consistently populated.
- Extend warning copy once equipment, weather, or service/warranty schedule guidance is ready for a broader CrewBoard lane.
- Consider drag/drop only after a safe reschedule interaction model, keyboard accessibility, and conflict-review behavior are designed on top of the existing job schedule actions.
