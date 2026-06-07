# Active Waves

Status: Planning-only
Doc Type: Coordination Index

This file is a compact pointer to the current operational capability-wave
planning set. It does not authorize implementation and does not make any planned
wave implemented truth.

For implemented status, use
[docs/current-state.md](C:/FloorConnector/docs/current-state.md).

For active stream status, use
[active-worktrees.md](C:/FloorConnector/active-worktrees.md) and
[.codex/active-stream-plan.md](C:/FloorConnector/.codex/active-stream-plan.md).
The first production-acceleration stream set has merged to `main`; the remaining
active cleanup stream is `architecture-coordination`. Field/Mobile and Portal
remain planning/downstream wave docs until the active registry says otherwise.

Permanent stream governance is defined in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md).
Future waves may not create new streams until Ownership Area, Dependency
Analysis, Ownership Conflict Check, UX / IA Review, Canonical Model Review,
Verification Strategy, and Architecture Coordination Approval are complete.
Future waves also require documented merge order, active registry update, and a
recorded Jeff approval gate before stream creation or activation.
Before starting stream work, future wave prompts must require
`pnpm.cmd worktree:doctor` and should reference
[docs/automation-tooling-baseline.md](C:/FloorConnector/docs/automation-tooling-baseline.md)
for local dependency, Playwright, optional CLI, and validation-command guidance.

The governing product architecture principle is defined in
[docs/operational-architecture-v1.md](C:/FloorConnector/docs/operational-architecture-v1.md):
future waves must make FloorConnector feel more like one operational command
center and less like disconnected modules.

## Operational Capability Waves v1

Use
[docs/design/operational-capability-waves-v1-coordination.md](C:/FloorConnector/docs/design/operational-capability-waves-v1-coordination.md)
as the coordination source for the four operational waves:

1. [Project Workspace Capability Wave v1](C:/FloorConnector/docs/design/project-workspace-capability-wave-v1.md)
2. [Scheduling Capability Wave v1](C:/FloorConnector/docs/design/scheduling-capability-wave-v1.md)
3. [Field/Mobile Capability Wave v1](C:/FloorConnector/docs/design/field-mobile-capability-wave-v1.md)
4. [Portal Capability Wave v1](C:/FloorConnector/docs/design/portal-capability-wave-v1.md)

Project Workspace and Scheduling have merged to `main` for the first stream set.
The remaining wave references are planning context and should not be read as
permission to implement all four waves at the same time.

## Parallel Planning Streams

Communications is also tracked as a planned parallel stream:

- [Communications Capability Wave v1](C:/FloorConnector/docs/design/communications-capability-wave-v1.md)

This does not change the four-wave operational sequence above. Communications
planning should stay record-linked and provider-dark until a separately
approved implementation slice is selected.

## Parallel Financials Planning Stream

Use
[docs/design/financials-capability-wave-v1.md](C:/FloorConnector/docs/design/financials-capability-wave-v1.md)
as the planning-only source for the Financials stream. Financials is a planned
parallel market-readiness stream over canonical invoices, payments, payment
events, project financial readiness, and customer-safe portal payment
continuity. It does not change the operational wave order above and does not
authorize payment provider changes, webhooks, accounting integrations, schema,
or duplicate financial models.

Local stream note: the stale `stream/financials` branch/worktree has been
retired as superseded by `stream/financials-reporting`. Financials planning
references remain product-area planning context only; they do not reactivate the
stale local branch, authorize a PR from it, or make it a source for
cherry-picks.

Shared guardrails:

- preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`
- do not create duplicate business models
- keep Project Workspace as the readiness and continuity hub
- keep Scheduling on canonical `jobs` and `job_assignments`
- keep Field/Mobile on canonical execution records
- keep Portal as a scoped customer read/action surface over canonical records
- keep Communications on canonical `communication_threads`,
  `communication_messages`, notifications, and source-record context without
  duplicate message models or provider-send expansion
- keep Financials on canonical invoices, payments, payment events, and
  source-record financial readiness without duplicate ledgers or portal-owned
  billing state

## Automation Readiness

Status: Ready With Human Review Gate.

Agents may draft wave proposals, stream briefs, validation plans, and review
packets from this registry. Agents may not begin a new wave, create active
streams, continue to the next wave, or merge without Architecture Coordination
approval and Jeff review.

## Field Execution Depth V1 Approval Gate

Gate date: 2026-06-06.

Wave name: `field-execution-depth-v1`.

Review packet:
[docs/review-packets/field-execution-depth-v1-plan.md](C:/FloorConnector/docs/review-packets/field-execution-depth-v1-plan.md).

Wave goal: deepen the canonical field execution path from Schedule to Crew,
Daily Execution, Blockers, Photos, Notes, and Closeout without creating
duplicate jobs, schedules, field reports, issue trackers, punch-list systems, or
dashboard sprawl.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                                  |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Stream ownership, dependency map, non-goals, validation, verification, and merge order recorded. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved `field-execution-depth-v1` for stream/worktree creation.                |
| Stream creation                        | Complete    | Four branches and worktrees were created from current `main` at `9bad7a65`.                      |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                            |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                                   |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and destructive cleanup still require explicit approval.                  |

Approved stream set:

| Stream                            | Ownership area                 | Mission                                                                                                      | Status |
| --------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------ | ------ |
| `field-handoff-packet-v1`         | Field handoff context          | Ensure every scheduled job arrives with complete execution context from canonical project, job, and records. | Merged |
| `daily-execution-command-v1`      | Daily execution workflow       | Strengthen daily logs, field notes, blockers, execution observations, photo visibility, and next actions.    | Merged |
| `crew-execution-visibility-v1`    | Cross-project field visibility | Improve visibility into active, blocked, incomplete, office-attention, and execution-warning work.           | Merged |
| `verification-field-execution-v1` | Field execution verification   | Protect canonical project chain, jobs, schedule, daily logs, field notes, and ownership boundaries.          | Merged |

Merge result:

- Field Handoff Packet V1 merged to `main` as `715af07d`.
- Daily Execution Command V1 merged to `main` as `627358c4`.
- Crew Execution Visibility V1 merged to `main` as `980cfe5b`.
- Verification Field Execution V1 merged to `main` as `36e80505`.

Post-merge validation passed: targeted field execution tests, typecheck, lint,
`pnpm.cmd fc:preflight:fast`, and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees are retirement
candidates retained pending explicit cleanup approval. No next wave is approved
by this merge.

Approved stream branches:

- `stream/field-handoff-packet-v1`
- `stream/daily-execution-command-v1`
- `stream/crew-execution-visibility-v1`
- `stream/verification-field-execution-v1`

Approved worktrees:

- `C:\FC-worktrees\field-handoff-packet-v1`
- `C:\FC-worktrees\daily-execution-command-v1`
- `C:\FC-worktrees\crew-execution-visibility-v1`
- `C:\FC-worktrees\verification-field-execution-v1`

Dependency and merge order:

1. `field-handoff-packet-v1` establishes scheduled-job execution context.
2. `daily-execution-command-v1` builds on handoff context for day-of-work
   execution review.
3. `crew-execution-visibility-v1` rolls canonical handoff and execution state
   into cross-project field visibility.
4. `verification-field-execution-v1` lands last after the implementation
   streams are complete and validated.

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no duplicate schedule, job, field report, issue tracker, punch-list, photo,
  note, closeout, or dashboard model;
- no portal work, dispatch automation, route optimization, customer-facing
  provider action, autonomous AI, or financial/signature mutation;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

## Proposed Governance Infrastructure Stream

Proposal date: 2026-06-06.

Proposed stream: `agent-verification-v1`.

Review packet:
[docs/review-packets/agent-verification-v1.md](C:/FloorConnector/docs/review-packets/agent-verification-v1.md).

Status: Proposed.

Rationale: FloorConnector now has mature AI governance documentation:
`AGENTS.md`, `docs/agent-governance.md`,
`docs/agent-startup-checklist.md`,
`docs/autonomous-run-governance.md`, and `docs/ai-diagnostics.md`. The next
governance maturity step is executable verification tooling so agents can
verify startup, stream alignment, and completion state instead of relying only
on written instructions.

Proposed branch:

- `stream/agent-verification-v1`

Proposed worktree:

- `C:\FC-worktrees\agent-verification-v1`

Proposed scope:

- `pnpm fc:startup-check`
- `pnpm fc:stream-check`
- `pnpm fc:completion-check`
- review existing `pnpm worktree:doctor` overlap and integration opportunities
- update `AGENTS.md` and autonomous-run guidance after the tooling exists

This proposal does not authorize implementation, branch creation, worktree
creation, package script changes, PR creation, merge, application-code changes,
schema changes, UI changes, Supabase changes, business workflow changes,
canonical-record changes, or financial logic changes.

## Next Recommended Wave

Recommendation date: 2026-06-05.

Recommended wave: `sales-to-production-readiness-v1`.

Review packet:
[docs/review-packets/next-wave-recommendation.md](C:/FloorConnector/docs/review-packets/next-wave-recommendation.md).

Status: Merged to `main`.

Rationale: after `operational-command-center-v1`, the highest-leverage next
step is tightening the opportunity-to-estimate-to-contract-to-schedule handoff
so downstream Project Workspace, Schedule, Field, Financials, Portal, Reporting,
and future automation surfaces consume clearer readiness truth.

Proposed streams:

- `sales-readiness-command-v1`
- `estimate-contract-readiness-v1`
- `schedule-readiness-handoff-v1`
- `verification-sales-to-production-v1`

This wave has merged to `main` under Jeff's controlled merge approval. It did
not authorize schema/migrations, provider actions, customer-facing sends,
autonomous AI behavior, destructive cleanup, next-wave continuation, or work in
dirty/out-of-scope worktrees.

## Sales To Production Readiness V1 Approval Gate

Gate date: 2026-06-05.

Wave name: `sales-to-production-readiness-v1`.

Wave goal: tighten the contractor sales-to-production handoff from
opportunity/site assessment through estimate, contract, deposit/readiness, and
schedule handoff.

Gate status:

| Gate item                              | Status      | Evidence / note                                                                      |
| -------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| Architecture Coordination approval     | Approved    | Approved from the next-wave recommendation and recorded in active governance docs.   |
| Jeff approval gate                     | Satisfied   | Jeff explicitly approved controlled merge of the reviewed ready stream set.          |
| Stream creation                        | Approved    | The approved stream set may be created from current `main`.                          |
| Implementation start                   | Completed   | The approved implementation and verification slices landed on `main`.                |
| Human review gate                      | Satisfied   | Jeff approved the controlled merge prompt; no PRs were opened.                       |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and destructive cleanup still require explicit Jeff approval. |

Approved stream set:

| Stream                                | Ownership area                                                                                                         | Mission                                                                        | Status |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------ |
| `sales-readiness-command-v1`          | Opportunity, lead, site assessment, requirements capture, and upstream estimating readiness.                           | Make sales readiness clearer before estimate work begins.                      | Merged |
| `estimate-contract-readiness-v1`      | Estimate approval, contract generation, contract send/signature readiness, and blockers between estimate and contract. | Make estimate-to-contract progression clearer and reduce handoff confusion.    | Merged |
| `schedule-readiness-handoff-v1`       | Commercial/financial readiness handoff into scheduling and Field.                                                      | Make ready-to-schedule truthful, visible, and connected into Field.            | Merged |
| `verification-sales-to-production-v1` | Verification for the sales-to-production handoff.                                                                      | Protect the opportunity -> estimate -> contract -> readiness -> schedule flow. | Merged |

Merge result:

- Sales Readiness Command V1 merged to `main` as `89275554`.
- Estimate Contract Readiness V1 merged to `main` as `b28fb457`.
- Schedule Readiness Handoff V1 merged to `main` as `09942b0b`.
- Verification Sales To Production V1 merged to `main` as `f4e31baf`.

Post-merge validation passed: targeted readiness tests, typecheck, lint,
`pnpm.cmd fc:preflight:fast`, and `git diff --check`.

Wave status: Merged to `main`; completed wave worktrees are retained pending
explicit retirement approval. No next wave is approved by this merge.

Approved stream branches:

- `stream/sales-readiness-command-v1`
- `stream/estimate-contract-readiness-v1`
- `stream/schedule-readiness-handoff-v1`
- `stream/verification-sales-to-production-v1`

Approved worktrees:

- `C:\FC-worktrees\sales-readiness-command-v1`
- `C:\FC-worktrees\estimate-contract-readiness-v1`
- `C:\FC-worktrees\schedule-readiness-handoff-v1`
- `C:\FC-worktrees\verification-sales-to-production-v1`

Required future stream startup checks:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Required implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Shared non-goals:

- no implementation from this approval task;
- no schema or migration work unless a later prompt explicitly approves it;
- no production code changes except explicitly scoped future implementation;
- no provider/customer-facing sends;
- no autonomous AI, scheduling, dispatching, signature, or financial actions;
- no work in dirty/out-of-scope worktrees, including
  `C:\FC-worktrees\project-next-actions`.

## Next Generation Wave Candidates

Audit date: 2026-06-04.

These names are current review candidates, not active wave authorization:

| Candidate stream               | Proposed wave role                                               | Required gate before work begins                                                          |
| ------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `ux-architecture`              | Architecture and IA governance for the next stream generation    | Decide whether it replaces or absorbs `architecture-coordination` in the active registry. |
| `project-workspace-v2`         | Project-centered continuity and next-action depth                | Approve ownership against Field, Communications, Financials, and Portal.                  |
| `field-command-center-v1`      | Field command-center continuity over canonical execution records | Confirm job, daily-log, execution evidence, and portal-safe proof boundaries.             |
| `communications-continuity-v2` | Record-linked communication follow-up continuity                 | Confirm provider-dark behavior and source-record handoff ownership.                       |
| `financial-command-center-v1`  | Financial command center and collections continuity              | Confirm financial math/payment-state test strategy and no detached billing truth.         |
| `verification-v2`              | Review packet and merge-gate verification framework              | Confirm evidence requirements for every approved stream.                                  |

## Operational Command Center V1 Gate

Wave name: `operational-command-center-v1`.

Wave goal: Strengthen FloorConnector's operational command center model by
making Project Workspace diagnose operational state, Field own execution action,
Communications own conversation action, Financials own AR/payment action, and
Verification protect the ownership model.

Governance rule:

- Dashboard prioritizes.
- Project Workspace diagnoses.
- Owning workspace acts.
- Settings owns tenant configuration.
- Super Admin owns platform policy.
- Portal remains customer-safe review/action only.

Gate status as of 2026-06-05:

| Gate item                              | Status      | Evidence / note                                                             |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| Architecture Coordination approval     | Approved    | Ownership boundaries and stream set are recorded in this registry and plan. |
| Jeff approval gate                     | Approved    | Jeff explicitly approved starting `operational-command-center-v1`.          |
| Human review gate rules                | Satisfied   | Jeff approved the controlled final rebase-and-merge prompt.                 |
| Autonomous merge / indefinite continue | Not allowed | Next-wave continuation and destructive cleanup still require Jeff approval. |

Architecture-approved implementation stream set:

- `stream/project-workspace-v2`
- `stream/field-command-center-v1`
- `stream/communications-continuity-v2`
- `stream/financial-command-center-v1`
- `stream/verification-v2`

Governance referee:

- UX Architecture / Architecture Coordination remains the governance referee for
  ownership, dependency, UX / IA, canonical model, verification, and merge-order
  decisions.

Merge result:

- Project Workspace V2 merged to `main` as `c809186c`.
- Field Command Center V1 was already on `main` as `6df16ed1`.
- Communications Continuity V2 merged to `main` as `890bfbad`.
- Financial Command Center V1 merged to `main` as `5844f52e`.
- Verification V2 merged to `main` as `f7caf1db`.

Remaining gates:

- No start or merge gate remains for the approved stream set.
- Next-wave continuation, provider/customer-facing risky actions, destructive
  cleanup, and any scope outside the approved stream briefs still require human
  review and approval.

Wave status: Merged to `main`; completed wave worktrees and eligible branches
were retired after explicit cleanup approval. No next wave is approved by this
cleanup.
