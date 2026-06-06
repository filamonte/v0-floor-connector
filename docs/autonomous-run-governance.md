# Autonomous Run Governance

Status: Active
Doc Type: Developer Operations

This document defines what FloorConnector AI agents may do with minimal
supervision and what still requires explicit human approval. It complements
[AGENTS.md](C:/FloorConnector/AGENTS.md),
[docs/agent-governance.md](C:/FloorConnector/docs/agent-governance.md), and
[docs/parallel-development-governance.md](C:/FloorConnector/docs/parallel-development-governance.md).

Autonomous does not mean unreviewed. FloorConnector automation readiness remains
Ready With Human Review Gate.

## Autonomous Run Requirements

Before an autonomous or multi-agent run starts, the agent must:

- complete [docs/agent-startup-checklist.md](C:/FloorConnector/docs/agent-startup-checklist.md)
- confirm the branch and worktree are approved for the task
- confirm the task scope and non-goals in writing
- confirm the active registry does not assign the same ownership area to a
  conflicting stream
- preserve dirty user-owned changes
- state the validation plan before broad work begins

Autonomous runs may continue only while they remain within the approved scope.

## Safe Autonomous Work

These are generally safe after startup verification and normal validation:

- docs-only governance updates requested by the user
- focused docs alignment that does not claim planned work is implemented
- read-only audits over code, docs, branches, and stream registry files
- narrow tests or helper changes explicitly scoped by an approved task
- local validation commands such as Prettier, `git diff --check`,
  `pnpm.cmd worktree:doctor`, focused tests, lint, and typecheck
- review packets and merge-readiness summaries
- draft PR preparation when explicitly requested by the user or active process

Safe work still requires reporting files changed, validation, branch, worktree,
upstream status, final git status, and commit hash when committed.

## Requires Human Approval

These actions require explicit human approval in the current task or active
governance docs:

- creating, activating, merging, retiring, or deleting streams/worktrees
- opening PRs, marking PRs ready, merging, rebasing shared branches, force
  pushing, deleting branches, or destructive cleanup
- schema changes, migrations, generated database type updates, or RLS changes
- auth, tenant isolation, portal grant, role, permission, or bootstrap changes
- payment, invoice math, financial state, subscription, Stripe, or accounting
  behavior changes
- contract signature, legal approval, customer-facing send, provider call, or
  webhook behavior changes
- scheduling mutation, dispatch automation, route optimization, or field
  execution state changes
- provider-backed AI, autonomous AI actions, customer-facing AI, or AI-only
  persistence
- production deployment, staging mutation, remote database writes, or seed/write
  workflows

Runtime approval prompts are not product approval. A sandbox prompt can permit a
command to run, but it does not authorize these product or governance actions.

## Prohibited Actions

Agents must not:

- auto-merge
- auto-continue to the next wave
- work in dirty or out-of-scope worktrees
- create local-only persistence for canonical workflows
- create portal-only copies or duplicate business models
- claim planned capabilities are implemented unless
  [docs/current-state.md](C:/FloorConnector/docs/current-state.md) and code
  confirm them
- hide validation failures
- continue after a branch/worktree mismatch without resolving it

## Merge Requirements

Merge flow is human-reviewed:

1. stream work is completed and committed
2. validation and review packet are prepared
3. draft PR is created only when requested
4. verification reviews merge readiness
5. human reviewer checks the PR
6. human marks ready and merges
7. cleanup happens only after explicit approval

No automation should mark a PR ready, merge, delete branches, delete worktrees,
or perform destructive cleanup without human approval.

## Validation Requirements

Validation should match scope and risk:

- docs-only: Prettier on changed Markdown, `git diff --check`,
  `git diff --cached --check`, path checks proving no app/schema changes
- helper/test-only: focused tests plus formatting and diff checks
- implementation: targeted tests, typecheck, lint, relevant route smoke or E2E,
  and `pnpm.cmd fc:preflight:fast` unless the task narrows validation
- stream/platform work: `pnpm.cmd worktree:doctor` and registry/status checks

If a validation command cannot run, report the exact command, failure, and
residual risk.

## Reporting Requirements

Every autonomous or stream report must include:

- branch
- worktree
- upstream status and ahead/behind count
- files changed
- validation executed and result
- final git status
- commit hash when committed
- environment variables changed, if any
- blockers, skipped checks, and follow-up dependencies

## Rollback Expectations

Do not use destructive rollback commands unless explicitly requested.

Preferred recovery order:

1. inspect `git status --short --branch`
2. identify intended versus unrelated changes
3. preserve user-owned dirty files
4. reverse only the agent's own uncommitted edits with a targeted patch when
   possible
5. if committed work needs correction, add a follow-up commit unless the user
   explicitly requests history rewriting

Never run `git reset --hard`, `git clean`, force-push, delete branches, or
delete worktrees as an inferred cleanup step.
