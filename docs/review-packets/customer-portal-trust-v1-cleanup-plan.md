# Customer Portal Trust V1 Cleanup Plan

Status date: 2026-06-07

Role: FloorConnector Release Operations Lead

Scope: cleanup planning and execution record for `customer-portal-trust-v1`.

This plan was executed after Jeff explicitly approved cleanup. No new wave was
started. `C:\FC-worktrees\project-next-actions` was not used or modified.

## Wave Completion Status

`customer-portal-trust-v1` is complete and merged to `main`.

The controlled merge landed in the approved order:

| Stream                            | Main merge commit | Message                                       |
| --------------------------------- | ----------------- | --------------------------------------------- |
| `portal-project-clarity-v1`       | `f0d8c81c`        | `feat: merge portal project clarity v1`       |
| `portal-financial-visibility-v1`  | `2fa1c633`        | `feat: merge portal financial visibility v1`  |
| `portal-communication-trust-v1`   | `7b63ceef`        | `feat: merge portal communication trust v1`   |
| `verification-customer-portal-v1` | `bb2db7dd`        | `test: merge verification customer portal v1` |

Closeout governance was committed as
`87896a34 docs: close customer portal trust wave` and pushed to `origin/main`.
Pre-cleanup planning preflight confirmed `main` was clean and even with
`origin/main`.

## Retirement Candidate Table

| Worktree path                                     | Branch                                   | Pre-cleanup status | Stream head                                                | Contained in `main` | Cleanup result |
| ------------------------------------------------- | ---------------------------------------- | ------------------ | ---------------------------------------------------------- | ------------------- | -------------- |
| `C:\FC-worktrees\portal-project-clarity-v1`       | `stream/portal-project-clarity-v1`       | Clean              | `59ed0e51 feat: improve portal project clarity`            | Yes                 | Retired        |
| `C:\FC-worktrees\portal-financial-visibility-v1`  | `stream/portal-financial-visibility-v1`  | Clean              | `dd69983c feat: improve portal financial visibility`       | Yes                 | Retired        |
| `C:\FC-worktrees\portal-communication-trust-v1`   | `stream/portal-communication-trust-v1`   | Clean              | `fb1692ae feat: improve portal communication trust`        | Yes                 | Retired        |
| `C:\FC-worktrees\verification-customer-portal-v1` | `stream/verification-customer-portal-v1` | Clean              | `ca5554bd test: update customer portal trust verification` | Yes                 | Retired        |

Containment evidence used:

```powershell
git log --cherry-pick --right-only --no-merges --oneline main...stream/portal-project-clarity-v1
git log --cherry-pick --right-only --no-merges --oneline main...stream/portal-financial-visibility-v1
git log --cherry-pick --right-only --no-merges --oneline main...stream/portal-communication-trust-v1
git log --cherry-pick --right-only --no-merges --oneline main...stream/verification-customer-portal-v1
```

All four commands returned no uncontained non-merge commits.

## Branch Deletion Candidates

The following local branches are cleanup candidates after explicit human
approval:

- `stream/portal-project-clarity-v1`
- `stream/portal-financial-visibility-v1`
- `stream/portal-communication-trust-v1`
- `stream/verification-customer-portal-v1`

No matching remote branches were found by:

```powershell
git ls-remote --heads origin stream/portal-project-clarity-v1 stream/portal-financial-visibility-v1 stream/portal-communication-trust-v1 stream/verification-customer-portal-v1
```

Remote deletion was therefore not part of the cleanup execution.

## Cleanup Execution Result

After explicit approval:

- `git worktree remove` removed all four approved worktrees from the Git
  worktree registry.
- The four residual directories were removed after confirming their resolved
  absolute paths exactly matched the approved portal wave paths.
- The four approved local stream branches were deleted.
- No remote branches were deleted because no matching remote branches were
  present.
- `C:\FC-worktrees\project-next-actions` was preserved untouched.

## Dirty And Out-Of-Scope Worktrees Preserved

`C:\FC-worktrees\project-next-actions` remains a hard exclusion. It was not used
for merge, cleanup planning, conflict resolution, deletion, branch commands, or
file edits.

The prior live status packet reported this out-of-scope worktree as dirty, with
`docs/current-state.md` overlapping the portal wave history. That overlap should
remain visible for any later project-next-actions recovery, but it is not part
of this cleanup plan.

## Exact Cleanup Commands For Later

Run these only after Jeff gives explicit cleanup approval.

First re-run safety checks from `C:\FloorConnector`:

```powershell
git status
git branch --show-current
git fetch origin
git rev-list --left-right --count HEAD...origin/main
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Then remove the approved completed worktrees:

```powershell
git worktree remove C:\FC-worktrees\portal-project-clarity-v1
git worktree remove C:\FC-worktrees\portal-financial-visibility-v1
git worktree remove C:\FC-worktrees\portal-communication-trust-v1
git worktree remove C:\FC-worktrees\verification-customer-portal-v1
```

Then delete the approved local branches:

```powershell
git branch -d stream/portal-project-clarity-v1
git branch -d stream/portal-financial-visibility-v1
git branch -d stream/portal-communication-trust-v1
git branch -d stream/verification-customer-portal-v1
```

Then verify cleanup:

```powershell
git worktree list
git branch --list stream/portal-project-clarity-v1 stream/portal-financial-visibility-v1 stream/portal-communication-trust-v1 stream/verification-customer-portal-v1
git status
```

If `git worktree remove` unregisters a worktree but leaves a residual directory,
only remove that residual directory after confirming the resolved absolute path
is exactly one of the four approved portal wave paths above.

## Required Human Approval Before Deletion

Jeff explicitly approved deletion before cleanup execution.

The approval covered:

- the four listed portal wave worktrees
- the four listed local stream branches

The approval continued to exclude `C:\FC-worktrees\project-next-actions` and
did not authorize a new wave by implication.

## Governance Docs

Cleanup execution updated:

- `active-worktrees.md`
- `active-waves.md`
- `.codex/active-stream-plan.md`
- `docs/chat-handoff.md`

Those updates mark the approved portal wave worktrees and branches as retired
or archived after deletion succeeded.

## Cleanup Readiness

Cleanup was completed after explicit approval.

No additional cleanup, branch deletion, worktree deletion, feature work, schema
work, migration work, or next wave is approved by this execution record.
