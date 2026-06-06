# Field Execution Depth V1 Plan

Status: Approved / Not Started
Doc Type: Review Packet
Review date: 2026-06-06

This packet records Jeff's approval and Architecture Coordination's stream
creation gate for `field-execution-depth-v1`. It does not start implementation,
modify schemas or migrations, open PRs, merge branches, start another wave, or
authorize work in `C:\FC-worktrees\project-next-actions`.

## Rationale

The sales-to-production path is now substantially stronger. The next operational
gap is the field execution chain:

```text
Schedule -> Crew -> Daily Execution -> Blockers -> Photos -> Notes -> Closeout
```

This wave deepens field execution while preserving the current command-center
ownership model:

- Dashboard prioritizes.
- Project diagnoses.
- Field executes.
- Financials handles financial action.
- Communications handles conversation action.
- Settings owns configuration.

The wave must strengthen canonical continuity over existing projects, jobs,
schedule context, daily logs, field notes, execution evidence, work items where
already relevant, and closeout signals. It must not create duplicate jobs,
duplicate schedules, duplicate field reports, duplicate issue trackers,
duplicate punch lists, portal-only execution state, or dashboard sprawl.

## Stream Descriptions

| Stream                            | Branch                                   | Worktree                                          | Ownership                      | Mission                                                                                                   |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `field-handoff-packet-v1`         | `stream/field-handoff-packet-v1`         | `C:\FC-worktrees\field-handoff-packet-v1`         | Field handoff context          | Ensure every scheduled job arrives with complete execution context from canonical source records.         |
| `daily-execution-command-v1`      | `stream/daily-execution-command-v1`      | `C:\FC-worktrees\daily-execution-command-v1`      | Daily execution workflow       | Strengthen daily logs, field notes, blockers, observations, photo visibility, and execution next actions. |
| `crew-execution-visibility-v1`    | `stream/crew-execution-visibility-v1`    | `C:\FC-worktrees\crew-execution-visibility-v1`    | Cross-project field visibility | Improve visibility into active, blocked, incomplete, office-attention, and execution-warning work.        |
| `verification-field-execution-v1` | `stream/verification-field-execution-v1` | `C:\FC-worktrees\verification-field-execution-v1` | Verification                   | Protect canonical project chain, jobs, schedule, daily logs, field notes, and operational ownership.      |

## Ownership Map

| Area           | Owner in this wave                | Boundary                                                                                   |
| -------------- | --------------------------------- | ------------------------------------------------------------------------------------------ |
| Dashboard      | None                              | May prioritize later only through source-record summaries; no dashboard work in this gate. |
| Project        | Diagnostic consumer               | Project explains readiness and blockers, but does not become the field action owner.       |
| Field          | Primary owner                     | Field owns execution context, daily execution, blockers, notes, photos, and handoff views. |
| Schedule       | Source and handoff surface        | Schedule remains on canonical jobs, appointments, and assignments.                         |
| Financials     | No ownership                      | No invoice, payment, AR, or financial action ownership moves into Field.                   |
| Communications | No ownership                      | Conversation action remains in record-linked communications.                               |
| Settings       | Configuration owner               | Any future configurable behavior routes to Settings rather than operational pages.         |
| Portal         | No ownership                      | No portal-facing field execution exposure is approved by this wave.                        |
| Verification   | `verification-field-execution-v1` | Verifies canonical model, ownership boundaries, and docs claims after feature streams.     |

## Dependency Map

| Stream                            | Upstream dependencies                                                                                  | Downstream consumers                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `field-handoff-packet-v1`         | Current CrewBoard, Schedule readiness handoff, Project Workspace context, canonical jobs and projects. | Daily execution stream, crew visibility stream, verification stream.                |
| `daily-execution-command-v1`      | Field handoff context, current Daily Logs, field notes, execution attachments, work-item foundations.  | Crew visibility stream, verification stream, future closeout/reporting/portal work. |
| `crew-execution-visibility-v1`    | Handoff and daily execution signals, current schedule/job/read-model foundations.                      | Verification stream, future reporting/intelligence, future field/mobile depth.      |
| `verification-field-execution-v1` | All three implementation streams complete and validated.                                               | Integration review and Jeff review.                                                 |

## Non-Goals

- No implementation during this approval task.
- No schema changes or migrations.
- No new schedule model, dispatch model, job model, field report system, issue
  tracker, punch-list model, photo model, note model, closeout model, or
  dashboard-owned workflow model.
- No portal work or customer-facing field evidence exposure.
- No route optimization, dispatch automation, autonomous scheduling, provider
  sends, AI automation, financial mutation, signature mutation, or settings
  mutation on operational pages.
- No work in `C:\FC-worktrees\project-next-actions`.

## Validation Plan

Each implementation stream must start with:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Each implementation stream should run focused tests for changed helpers,
read-models, actions, or scripts, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Protected route smoke should be used when a later implementation slice touches
field, schedule, job, daily-log, project, or route behavior. Auth, fixture,
or Supabase rate-limit blockers must be reported honestly.

Docs-only governance changes use:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
pnpm.cmd exec prettier --check active-waves.md active-worktrees.md .codex/active-stream-plan.md docs/chat-handoff.md docs/review-packets/field-execution-depth-v1-plan.md
git diff --check
git diff --cached --check
```

## Verification Plan

`verification-field-execution-v1` owns verification after the feature streams
complete. It must check:

- canonical project chain preservation;
- canonical jobs and schedule ownership preservation;
- daily logs and field notes remain source records, not duplicated reports;
- execution photos/evidence do not become portal-visible by default;
- blockers and office-attention signals derive from existing canonical records
  or approved source helpers;
- Dashboard, Project, Field, Financials, Communications, Settings, and Portal
  ownership boundaries are preserved;
- no schema, migration, provider, autonomous AI, financial, signature, portal,
  or dispatch automation drift occurs unless a later prompt explicitly scopes it.

## Tooling Requirements

Tooling readiness for approval was checked from `C:\FloorConnector` on `main`:

- `pnpm.cmd worktree:doctor` passed.
- `pnpm.cmd tooling:baseline` passed with optional Vercel CLI missing.
- `pnpm.cmd tooling:baseline -CommandsOnly` returned the standard feature
  validation sequence.

Each new worktree was created from current `main` at `9bad7a65` and verified
clean on its expected branch.

## Merge Order

1. `field-handoff-packet-v1`
2. `daily-execution-command-v1`
3. `crew-execution-visibility-v1`
4. `verification-field-execution-v1`

Rationale:

- Field handoff context should land before deeper daily execution surfaces.
- Daily execution should land before cross-project rollups consume those
  signals.
- Crew visibility should land after the source handoff/execution signals are
  stable.
- Verification lands last so it can inspect all stream outcomes.

## Jeff Approval Gate

Jeff explicitly approved `field-execution-depth-v1` for wave approval and
stream/worktree creation.

Approved branches:

- `stream/field-handoff-packet-v1`
- `stream/daily-execution-command-v1`
- `stream/crew-execution-visibility-v1`
- `stream/verification-field-execution-v1`

Approved worktrees:

- `C:\FC-worktrees\field-handoff-packet-v1`
- `C:\FC-worktrees\daily-execution-command-v1`
- `C:\FC-worktrees\crew-execution-visibility-v1`
- `C:\FC-worktrees\verification-field-execution-v1`

Implementation remains not started. A later explicit start command is required.
