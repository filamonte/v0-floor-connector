# Active Worktrees

Status: Active
Doc Type: Developer Operations

This registry tracks the local FloorConnector worktrees used for parallel
development. It is an operational coordination aid, not product truth.

Canonical repo: `C:\FloorConnector`
Worktree root: `C:\FC-worktrees`

## Lifecycle

Statuses:

- `Proposed`: stream has been recommended, but ownership review, dependency
  analysis, conflict review, approval, branch creation, and worktree creation
  are not complete.
- `Architecture Review`: local or planned stream exists, but stream ownership,
  dependency mapping, conflict review, UX / IA review, verification scope,
  merge order, registry update, and Jeff approval are not all complete.
- `Approved / Not Started`: Architecture Coordination and Jeff have approved
  stream/worktree creation, but implementation has not started and a later
  explicit start command is still required.
- `Active`: open production-acceleration stream receiving implementation,
  verification, or coordination work.
- `Integration`: canonical integration branch, not a production-acceleration
  stream.
- `Waiting Review`: work is complete locally and waiting for review.
- `Ready Merge`: reviewed and ready to merge in the agreed order.
- `Paused / Downstream`: intentionally not part of the current six-stream
  operating model, but likely needed after upstream waves land.
- `Legacy / Superseded`: preserved local stream that has been replaced by a
  clearer active stream name.
- `Legacy / Review Needed`: preserved local stream that should be reviewed or
  merged before retirement.
- `Merged`: merged to `main`, but worktree still exists temporarily.
- `Retired / Superseded`: preserved local stream that has been audited as stale
  and replaced by a clearer branch; it should not be pushed, opened as a PR, or
  used for cherry-picks.
- `Archived`: worktree retired or removed.

Expectations:

- Create streams with `pnpm worktree:create <name>`.
- Run `pnpm worktree:reconcile` and `pnpm worktree:audit` at the start of the
  day.
- Run `pnpm worktree:doctor` before every Codex task.
- Use `docs/automation-tooling-baseline.md` for the current local tooling
  baseline, optional CLI handling, Playwright checks, and standard validation
  sequences.
- Keep stream branches small enough to review and merge.
- Update this registry when a worktree is created, repurposed, merged, paused,
  or archived.
- Retire completed local worktrees with `pnpm worktree:finish <name>`.
- The first production-acceleration stream set has merged to `main`. The only
  remaining active cleanup stream is `architecture-coordination`; merged stream
  worktrees are retained temporarily until explicit retirement.
- Treat this registry and `.codex/active-stream-plan.md` as the canonical
  active-stream truth. Older capability-wave inventories are reference topology
  only when they name paused or legacy streams.
- Architecture Coordination owns registry/tooling changes. Feature streams
  should not modify or delete active-stream registry files, prompt templates,
  worktree scripts, or package scripts unless that governance work is
  explicitly assigned.
- Permanent stream governance is defined in
  `docs/parallel-development-governance.md`. New streams must move through
  Proposed -> Architecture Review -> Approved -> Active -> Verification ->
  Merged -> Retired and must satisfy the stream creation rule before worktree
  creation.
- Architecture Coordination is a permanent governance function. It never owns
  feature implementation; it owns stream ownership governance, dependency
  mapping, duplicate capability/workflow/data-model detection, navigation drift
  detection, UX consistency review, documentation synchronization, merge
  sequencing, release coordination, and AI prompt governance.

| Worktree                              | Branch                                       | Purpose                                           | Owner       | Status                 | Created    | Last Updated | Notes                                                                                                                                                                                                                                                                                                                                                                                           | Current Wave                               | Merge Priority |
| ------------------------------------- | -------------------------------------------- | ------------------------------------------------- | ----------- | ---------------------- | ---------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------- |
| `main`                                | `main`                                       | Canonical integration branch                      | Core        | Integration            | Unknown    | 2026-05-31   | Platform source of truth; includes PRs #9, #10, and #12                                                                                                                                                                                                                                                                                                                                         | Integration                                | n/a            |
| `architecture-coordination`           | `stream/architecture-coordination`           | Permanent governance, sequencing, ownership       | Codex/local | Active                 | 2026-05-28 | 2026-06-04   | Permanent governance stream; never owns feature implementation. Owns stream lifecycle, creation approval, dependency mapping, duplicate detection, docs sync, merge sequencing, release coordination, and AI prompt governance.                                                                                                                                                                 | Permanent stream governance                | 1              |
| `verification`                        | `stream/verification`                        | Golden workflow QA and merge-gate validation      | Codex/local | Merged                 | 2026-05-28 | 2026-05-31   | PR #10 merged; worktree retained temporarily                                                                                                                                                                                                                                                                                                                                                    | Golden Workflow QA Wave V1                 | merged         |
| `project-workspace`                   | `stream/project-workspace`                   | Project Workspace capability stream workspace     | Codex/local | Merged                 | Unknown    | 2026-05-31   | Project Workspace work merged before downstream streams                                                                                                                                                                                                                                                                                                                                         | Project Workspace Production Hub Wave V1   | merged         |
| `scheduling`                          | `stream/scheduling`                          | Scheduling/CrewBoard stream workspace             | Codex/local | Merged                 | Unknown    | 2026-05-31   | PR #12 merged; worktree retained temporarily                                                                                                                                                                                                                                                                                                                                                    | Scheduling Dispatch Board Stabilization V1 | merged         |
| `communications`                      | `stream/communications`                      | Communications stream workspace                   | Codex/local | Merged                 | Unknown    | 2026-05-31   | PR #9 merged; worktree retained temporarily                                                                                                                                                                                                                                                                                                                                                     | Communications Delivery Proof Review V1    | merged         |
| `financials-reporting`                | `stream/financials-reporting`                | Financials and reporting stream workspace         | Codex/local | Merged                 | 2026-05-28 | 2026-05-31   | Financials reporting work merged; active branch retained                                                                                                                                                                                                                                                                                                                                        | Financials AR / Reporting Control Room V1  | merged         |
| `sales-readiness-command-v1`          | `stream/sales-readiness-command-v1`          | Sales readiness command stream workspace          | Codex/local | Merged                 | 2026-06-05 | 2026-06-06   | Merged to `main` as `89275554`; worktree retained pending explicit retirement approval. Scope clarified opportunity/site assessment state, requirements capture visibility, missing estimate inputs, and Project diagnosis links while avoiding dashboard sprawl, schema changes, duplicate intake models, autonomous scheduling, and portal behavior changes.                                  | Sales To Production Readiness V1           | merged         |
| `estimate-contract-readiness-v1`      | `stream/estimate-contract-readiness-v1`      | Estimate-to-contract readiness stream workspace   | Codex/local | Merged                 | 2026-06-05 | 2026-06-06   | Merged to `main` as `b28fb457`; worktree retained pending explicit retirement approval. Scope clarified approved estimate next steps, contract readiness, blockers before signature/send, Settings handoff links, and canonical estimate/contract/project readiness while avoiding duplicate contract/signature models, schema changes, settings mutation leakage, and portal behavior changes. | Sales To Production Readiness V1           | merged         |
| `schedule-readiness-handoff-v1`       | `stream/schedule-readiness-handoff-v1`       | Schedule readiness handoff stream workspace       | Codex/local | Merged                 | 2026-06-05 | 2026-06-06   | Merged to `main` as `09942b0b`; worktree retained pending explicit retirement approval. Scope clarified deposit/readiness blockers, schedule-to-Field ownership, handoff context, and Project diagnosis boundaries while avoiding duplicate schedule/dispatch models, new job schema, autonomous dispatching, route optimization, and dashboard work.                                           | Sales To Production Readiness V1           | merged         |
| `verification-sales-to-production-v1` | `stream/verification-sales-to-production-v1` | Sales-to-production verification stream workspace | Codex/local | Merged                 | 2026-06-05 | 2026-06-06   | Merged to `main` as `f4e31baf`; worktree retained pending explicit retirement approval. Scope added verification helpers/tests and matrix coverage for the canonical handoff while avoiding feature work, schema changes, UI redesign, and loosening existing checks.                                                                                                                           | Sales To Production Readiness V1           | merged         |
| `field-handoff-packet-v1`             | `stream/field-handoff-packet-v1`             | Field handoff context stream workspace            | Codex/local | Merged                 | 2026-06-06 | 2026-06-06   | Merged to `main` as `715af07d`; worktree retained pending explicit retirement approval. Scope deepened scheduled-job field handoff context over canonical job, project, estimate, contract, readiness, Daily Log, and field-note records while avoiding duplicate schedule/job models, portal work, dispatch automation, schema changes, and migrations.                                        | Field Execution Depth V1                   | merged         |
| `daily-execution-command-v1`          | `stream/daily-execution-command-v1`          | Daily execution command stream workspace          | Codex/local | Merged                 | 2026-06-06 | 2026-06-06   | Merged to `main` as `627358c4`; worktree retained pending explicit retirement approval. Scope strengthened daily execution guidance over canonical jobs, Daily Logs, field notes, blockers, observations, photos, and time-card context while avoiding a separate field reporting system, duplicate issue tracker, duplicate punch-list model, schema changes, and migrations.                  | Field Execution Depth V1                   | merged         |
| `crew-execution-visibility-v1`        | `stream/crew-execution-visibility-v1`        | Crew execution visibility stream workspace        | Codex/local | Merged                 | 2026-06-06 | 2026-06-06   | Merged to `main` as `980cfe5b`; worktree retained pending explicit retirement approval. Scope improved cross-project crew execution visibility into active, blocked, incomplete, office-attention, and execution-warning work while avoiding route optimization, dispatch replacement, crew scheduling replacement, dashboard sprawl, schema changes, and migrations.                           | Field Execution Depth V1                   | merged         |
| `verification-field-execution-v1`     | `stream/verification-field-execution-v1`     | Field execution verification stream workspace     | Codex/local | Merged                 | 2026-06-06 | 2026-06-06   | Merged to `main` as `36e80505`; worktree retained pending explicit retirement approval. Scope added pure verification helpers/tests protecting canonical project chain, jobs, schedule, Daily Logs, field notes, and operational ownership while avoiding feature work, schema changes, UI redesign, and loosening checks.                                                                      | Field Execution Depth V1                   | merged         |
| `field-mobile`                        | `stream/field-mobile`                        | Field/mobile stream workspace                     | Codex/local | Paused / Downstream    | Unknown    | 2026-05-28   | Resume after Project Workspace and Scheduling waves                                                                                                                                                                                                                                                                                                                                             | Field/Mobile Daily Field Speed V1          | paused         |
| `portal`                              | `stream/portal`                              | Customer portal stream workspace                  | Codex/local | Paused / Downstream    | Unknown    | 2026-05-28   | Resume after Project Workspace and Communications waves                                                                                                                                                                                                                                                                                                                                         | Portal Customer-Safe Project Status V1     | paused         |
| `financials`                          | `stream/financials`                          | Legacy financials stream workspace                | Codex/local | Retired / Superseded   | Unknown    | 2026-05-31   | Audited as stale and superseded by `stream/financials-reporting`; do not push, PR, merge, or cherry-pick. Manual local worktree removal may happen after owner review.                                                                                                                                                                                                                          | Retired legacy financials stream           | retired        |
| `qa-verification`                     | `stream/qa-verification`                     | Legacy QA and verification stream workspace       | Codex/local | Legacy / Superseded    | Unknown    | 2026-05-28   | Preserved; active work moves to `verification`                                                                                                                                                                                                                                                                                                                                                  | Legacy QA continuity review                | legacy         |
| `project-readiness-panel`             | `stream/project-readiness-panel`             | Project Workspace readiness slice workspace       | Codex/local | Legacy / Review Needed | Unknown    | 2026-05-28   | Review before retirement or merge into project-workspace                                                                                                                                                                                                                                                                                                                                        | Readiness panel continuity review          | legacy         |

Use `pnpm worktree:status` for compact live branch health,
`pnpm worktree:reconcile` for the morning reconciliation view, and
`pnpm codex:streams` for the active stream operating summary.

## Proposed Stream Queue

These streams are proposed only. They must pass the stream creation rule in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md)
before any branch or worktree is created.

| Proposed stream         | Proposed branch                | Proposed worktree                       | Type                             | Priority | Ownership area                                                                                                                              | Lifecycle status | Gate before activation                                                                                                                                          |
| ----------------------- | ------------------------------ | --------------------------------------- | -------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agent-verification-v1` | `stream/agent-verification-v1` | `C:\FC-worktrees\agent-verification-v1` | Governance Infrastructure Stream | High     | Executable AI governance verification tooling: `fc:startup-check`, `fc:stream-check`, `fc:completion-check`, and doctor integration review. | Proposed         | Architecture Coordination approval, ownership/dependency/conflict review, validation strategy approval, registry update, and Jeff approval for stream creation. |

## Next Generation Stream Review Queue

Audit date: 2026-06-04.

The following local worktrees exist and were clean at audit time, but current
`main` does not yet register them as active streams. They remain in Architecture
Review until the wave proposal gate in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md)
is complete. Do not treat these rows as implementation authorization.

| Worktree                       | Branch                                | Proposed ownership area                                        | Lifecycle status    | Gate before activation                                                               |
| ------------------------------ | ------------------------------------- | -------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------ |
| `ux-architecture`              | `stream/ux-architecture`              | Product architecture, UX / IA ownership, governance references | Architecture Review | Decide whether it replaces current `architecture-coordination` governance ownership. |
| `project-workspace-v2`         | `stream/project-workspace-v2`         | Project Workspace continuity and next-action depth             | Retired             | Worktree and local branch removed after `c809186c` landed on `main`.                 |
| `field-command-center-v1`      | `stream/field-command-center-v1`      | Field execution command layer over canonical field records     | Retired             | Worktree, local branch, and remote branch removed after `6df16ed1` landed on `main`. |
| `communications-continuity-v2` | `stream/communications-continuity-v2` | Record-linked communication continuity and follow-up review    | Retired             | Worktree and local branch removed after `890bfbad` landed on `main`.                 |
| `financial-command-center-v1`  | `stream/financial-command-center-v1`  | AR, collections, billing command-center continuity             | Retired             | Worktree and local branch removed after `5844f52e` landed on `main`.                 |
| `verification-v2`              | `stream/verification-v2`              | Verification framework, review packets, merge-gate evidence    | Retired             | Worktree and local branch removed after `f7caf1db` landed on `main`.                 |

The detailed ownership, dependency, UX / IA, canonical model, conflict, and
verification audit for these streams lives in
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md).

## Operational Command Center V1 Stream Gate

Gate date: 2026-06-04.

Wave: `operational-command-center-v1`.

Architecture Coordination approval and Jeff approval were recorded for the
implementation stream set below. The approved streams have merged to `main`;
their local worktrees are retained pending explicit retirement approval.

| Worktree                       | Branch                                | Gate status | Activation condition                                                   |
| ------------------------------ | ------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `project-workspace-v2`         | `stream/project-workspace-v2`         | Retired     | Worktree and local branch removed after merge to `main` as `c809186c`. |
| `field-command-center-v1`      | `stream/field-command-center-v1`      | Retired     | Worktree, local branch, and remote branch removed after `6df16ed1`.    |
| `communications-continuity-v2` | `stream/communications-continuity-v2` | Retired     | Worktree and local branch removed after merge to `main` as `890bfbad`. |
| `financial-command-center-v1`  | `stream/financial-command-center-v1`  | Retired     | Worktree and local branch removed after merge to `main` as `5844f52e`. |
| `verification-v2`              | `stream/verification-v2`              | Retired     | Worktree and local branch removed after merge to `main` as `f7caf1db`. |

UX Architecture / Architecture Coordination remains the governance referee.
Dashboard prioritizes, Project Workspace diagnoses, owning workspaces act,
Settings owns tenant configuration, Super Admin owns platform policy, and Portal
remains customer-safe review/action only. The next wave is not approved from
this merge; agents may not auto-continue or perform destructive cleanup without
Jeff approval.
