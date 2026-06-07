# Mobile Field Capture Closeout V1 Plan

Status: Approved / Not Started
Doc Type: Review Packet
Review date: 2026-06-07

This packet records Architecture Coordination and Jeff approval for
`mobile-field-capture-closeout-v1` stream/worktree creation. It does not start
implementation, modify product code, modify schemas, open PRs, merge anything,
retire worktrees, or approve a next wave.

## Rationale

FloorConnector has now strengthened the Operational Command Center model, the
sales-to-production readiness path, and field execution depth. The next
contractor-value gap is the daily path from Field Work to Fast Capture to
Completion Evidence to Office Handoff to Closeout Readiness to Billing
Readiness.

This wave should make field capture and closeout easier without creating
duplicate field systems, duplicate issue models, duplicate punch-list models,
duplicate closeout models, or dashboard sprawl.

The wave still matches the highest-leverage next step recommended in
[docs/review-packets/next-portfolio-recommendation.md](C:/FloorConnector/docs/review-packets/next-portfolio-recommendation.md).
No stream names or ownership boundaries needed correction.

## Approval Gate

| Gate item                              | Status       | Evidence / note                                                                                         |
| -------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------- |
| Architecture Coordination approval     | Approved     | Stream ownership, dependency map, non-goals, validation, verification, and merge order are recorded.    |
| Jeff approval gate                     | Approved     | Jeff explicitly approved `mobile-field-capture-closeout-v1` for stream/worktree creation.               |
| Stream creation                        | Complete     | Four branches and worktrees were created from the verified current `main` baseline.                     |
| Implementation start                   | Not approved | This task may create the approved streams and worktrees only; implementation requires a later command.  |
| Human review gate                      | Required     | Future implementation, PRs, merge, cleanup, and next-wave continuation require separate human approval. |
| Autonomous merge / indefinite continue | Not allowed  | No merge, PR, next wave, schema/migration work, or destructive cleanup is approved by this gate.        |

## Stream Descriptions

### `field-quick-capture-v1`

- Branch: `stream/field-quick-capture-v1`
- Worktree: `C:\FC-worktrees\field-quick-capture-v1`
- Ownership: fast field capture inside existing field execution workflows.
- Mission: make it faster for crews or supervisors to record useful field
  evidence and work status.
- Future implementation may improve quick Daily Log visibility, quick
  field-note capture, blocker/issue capture using existing field notes,
  photo/file evidence visibility using existing execution attachments,
  mobile-friendly layout improvements where safe, and "what happened today?"
  capture flow.
- Non-goals: no new Daily Log model, new field-note model, new attachment
  model, offline sync, native mobile app, schema changes, migrations, or portal
  behavior changes.

### `closeout-readiness-command-v1`

- Branch: `stream/closeout-readiness-command-v1`
- Worktree: `C:\FC-worktrees\closeout-readiness-command-v1`
- Ownership: closeout readiness and billing handoff signals.
- Mission: make it clear when field work is complete enough to move toward
  closeout and billing readiness.
- Future implementation may improve closeout readiness visibility, missing
  Daily Log / field-note / photo evidence signals, incomplete or unresolved
  blocker signals, project/job completion handoff clarity, links from
  Field/Project into invoice/billing readiness where appropriate, and office
  "ready to bill?" awareness without duplicating Financials.
- Non-goals: no duplicate invoice model, duplicate closeout model, new
  checklist schema, accounting replacement, dashboard sprawl, schema changes,
  migrations, or autonomous billing.

### `field-communications-handoff-v1`

- Branch: `stream/field-communications-handoff-v1`
- Worktree: `C:\FC-worktrees\field-communications-handoff-v1`
- Ownership: field-to-office communication handoff.
- Mission: make field observations, blockers, and closeout signals easier for
  the office to understand and route without turning Field into
  Communications.
- Future implementation may improve links from field notes/blockers to
  Communications context, office attention signals from field execution,
  compact handoff evidence on field/project surfaces, communication-safe
  escalation paths, and clearer boundaries between Field evidence and
  Communications action.
- Non-goals: no duplicate communications model, autonomous sends, AI-generated
  customer sends, portal-only communication copies, schema changes, migrations,
  or dashboard sprawl.

### `verification-mobile-field-closeout-v1`

- Branch: `stream/verification-mobile-field-closeout-v1`
- Worktree: `C:\FC-worktrees\verification-mobile-field-closeout-v1`
- Ownership: verification.
- Mission: protect mobile field capture and closeout boundaries.
- Future verification should protect canonical Daily Logs, canonical field
  notes, canonical execution attachments, canonical jobs/schedule, no duplicate
  closeout model, no duplicate issue or punch-list model, no dashboard sprawl,
  Field execution capture ownership, Project diagnosis ownership,
  Communications conversation-action ownership, Financials billing/collection
  ownership, Portal customer-safety, and no schema/migration drift.
- Non-goals: no feature work, UI redesign, schema changes, migrations, or
  loosening existing tests.

## Ownership Map

| Area           | Owner in this wave                      | Boundary                                                                                 |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------------------------- |
| Field capture  | `field-quick-capture-v1`                | Uses existing Daily Logs, field notes, work items, jobs, and execution attachments.      |
| Closeout state | `closeout-readiness-command-v1`         | Derives readiness and office handoff signals without owning billing mutation.            |
| Communications | `field-communications-handoff-v1`       | Routes field context into communication review; Communications owns conversation action. |
| Verification   | `verification-mobile-field-closeout-v1` | Protects canonical ownership boundaries and duplicate-model exclusions.                  |
| Project        | Diagnostic consumer only                | Project diagnoses readiness and blockers; it does not become the acting workspace.       |
| Financials     | Billing/collections consumer only       | Financials owns billing and collection action; this wave does not mutate invoice state.  |
| Portal         | Out of scope unless later approved      | Portal remains customer-safe and unchanged by this wave gate.                            |
| Settings       | Out of scope unless later approved      | Settings owns configuration; field pages should not mutate settings.                     |

## Dependency Map

```text
field-quick-capture-v1
  -> closeout-readiness-command-v1
  -> field-communications-handoff-v1
  -> verification-mobile-field-closeout-v1
```

`field-quick-capture-v1` should land first because it sharpens source capture
context. `closeout-readiness-command-v1` consumes field evidence and blocker
signals. `field-communications-handoff-v1` consumes field/closeout context only
after ownership is clear. Verification runs last after implementation stream
commits exist.

## Likely File Overlap

Likely overlap areas:

- `apps/web/app/(app)/field/work-items/**`
- `apps/web/app/(app)/schedule/page.tsx`
- `apps/web/components/schedule-crewboard-presentational.tsx`
- `apps/web/lib/field/**`
- `apps/web/lib/schedule/**`
- `apps/web/lib/projects/**`
- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/lib/communications/**`
- `apps/web/lib/verification/**`
- `docs/golden-workflow-verification-matrix.md`
- `docs/review-packets/**`

Coordination rules:

- Field capture owns capture helpers/UI first.
- Closeout readiness owns derived closeout/billing-readiness summaries.
- Communications owns only handoff/review surfaces and must not own field
  evidence truth.
- Verification owns pure test/helper/docs evidence and must not implement
  features.

## Non-Goals

- No implementation from this approval task.
- No schema or migration work.
- No duplicate Daily Log, field-note, attachment, closeout, issue, punch-list,
  invoice, communication, or dashboard model.
- No offline sync, native mobile app, GPS, push notifications, new storage
  policy, provider/customer-facing action, autonomous billing, autonomous send,
  portal behavior change, PR, merge, or next wave.
- No work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

## Validation Plan

Future implementation streams should start with:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd tooling:baseline -CommandsOnly
```

Implementation validation should include focused tests for changed helpers,
read models, actions, or routes, then:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Route smoke should be used when protected Field, Schedule, Project,
Communications, or related workspace behavior changes. Missing auth, missing
fixtures, redirects, 404s, access denials, or Supabase rate limits must be
reported as blocked/skipped evidence, not success.

## Verification Plan

`verification-mobile-field-closeout-v1` should run after the implementation
streams report committed work. It should verify:

- canonical Daily Logs remain the Daily Log source of truth;
- canonical field notes remain the blocker/issue observation source;
- canonical execution attachments remain the evidence attachment source;
- canonical jobs/schedule remain the execution scheduling source;
- no duplicate closeout, issue, punch-list, dashboard, communication, invoice,
  or portal-owned model is introduced;
- Field owns execution capture;
- Project diagnoses readiness and blockers;
- Communications owns conversation action;
- Financials owns billing/collection action;
- Portal remains customer-safe;
- no schema/migration drift exists.

Verification should avoid feature implementation, UI redesign, schema changes,
migrations, and loosening existing tests.

## Tooling Requirements

Main-checkout tooling readiness at approval:

- `git status --short --branch`: `## main...origin/main`
- `git fetch origin`: passed
- `git rev-list --left-right --count HEAD...origin/main`: `0 0`
- `git push origin main`: completed with `Everything up-to-date`
- `pnpm.cmd worktree:doctor`: passed, `PASS: 20`
- `pnpm.cmd tooling:baseline`: passed; optional Vercel CLI missing only
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

Commands-only baseline:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

## Merge Order

1. `field-quick-capture-v1`
2. `closeout-readiness-command-v1`
3. `field-communications-handoff-v1`
4. `verification-mobile-field-closeout-v1`

Verification must run last after implementation stream commits exist.

## Dirty Out-Of-Scope Worktree Handling

`C:\FC-worktrees\project-next-actions` was inspected and preserved untouched.
It is dirty on `stream/project-next-actions` with existing user-owned changes.
It does not block this wave because this approval task did not touch that
branch/worktree and the approved wave starts from separate branches/worktrees.

Future implementation should keep that boundary hard. It should only block the
wave if a later implementation prompt explicitly touches the same files or
branch ownership.

## Created Branches And Worktrees

All created branches/worktrees were created from the verified current `main`
baseline and were clean with no upstream configured at creation:

| Stream                                  | Branch                                         | Worktree                                                | Baseline               |
| --------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- | ---------------------- |
| `field-quick-capture-v1`                | `stream/field-quick-capture-v1`                | `C:\FC-worktrees\field-quick-capture-v1`                | `0 / 0` against `main` |
| `closeout-readiness-command-v1`         | `stream/closeout-readiness-command-v1`         | `C:\FC-worktrees\closeout-readiness-command-v1`         | `0 / 0` against `main` |
| `field-communications-handoff-v1`       | `stream/field-communications-handoff-v1`       | `C:\FC-worktrees\field-communications-handoff-v1`       | `0 / 0` against `main` |
| `verification-mobile-field-closeout-v1` | `stream/verification-mobile-field-closeout-v1` | `C:\FC-worktrees\verification-mobile-field-closeout-v1` | `0 / 0` against `main` |

## Jeff Decision Options

Jeff has approved stream/worktree creation for this wave. Future decisions
remain separate:

- start implementation in the approved streams;
- modify stream scope before implementation starts;
- open PRs after implementation and validation;
- merge streams in the approved order;
- retire branches/worktrees after completed work lands;
- defer or cancel the wave before implementation starts;
- continue to another wave after this one is reviewed.

The wave is ready for a later explicit start command, not for implementation
inside this approval task.
