# Financial Closeout Collections V1 Cleanup Plan

Status: Cleanup Completed
Doc Type: Worktree Retirement Plan
Wave: `financial-closeout-collections-v1`
Prepared From: `main`
Prepared Date: 2026-06-07

## Wave Completion Status

`financial-closeout-collections-v1` has merged to `main` under Jeff's
controlled merge approval. Jeff explicitly approved cleanup execution, and the
four completed worktrees and eligible local branches were retired.

Merged stream commits on `main`:

| Stream                             | Stream head | Merge commit |
| ---------------------------------- | ----------- | ------------ |
| Billing Readiness Command V1       | `75435d99`  | `5ae3c0c2`   |
| Collections Priority V1            | `471bc481`  | `3e888512`   |
| Payment Continuity V1              | `3240c503`  | `ae05bb26`   |
| Verification Financial Closeout V1 | `03557da5`  | `be83f4ca`   |

Post-merge validation and targeted financial closeout verification passed in
the controlled merge task. `main` was pushed and verified even with
`origin/main` before cleanup execution.

## Retirement Candidates

All four completed financial closeout collections worktrees were removed from
the Git worktree registry. Residual directories were removed after exact-path
confirmation.

| Worktree                                             | Branch                                      | Current head | Worktree status      | Ahead / behind vs `origin/main` | Contained in `main` | Unique patch commits vs `main` | Retirement candidate |
| ---------------------------------------------------- | ------------------------------------------- | ------------ | -------------------- | ------------------------------- | ------------------- | ------------------------------ | -------------------- |
| `C:\FC-worktrees\billing-readiness-command-v1`       | `stream/billing-readiness-command-v1`       | `75435d99`   | Clean before removal | `0 / 10`                        | Yes                 | None                           | Retired              |
| `C:\FC-worktrees\collections-priority-v1`            | `stream/collections-priority-v1`            | `471bc481`   | Clean before removal | `0 / 10`                        | Yes                 | None                           | Retired              |
| `C:\FC-worktrees\payment-continuity-v1`              | `stream/payment-continuity-v1`              | `3240c503`   | Clean before removal | `0 / 10`                        | Yes                 | None                           | Retired              |
| `C:\FC-worktrees\verification-financial-closeout-v1` | `stream/verification-financial-closeout-v1` | `03557da5`   | Clean before removal | `0 / 10`                        | Yes                 | None                           | Retired              |

## Branch Deletion Candidates

The local stream branches were deleted after explicit human cleanup approval
because the approved stream heads were contained in `main` and no unique patch
commits remained outside `main`.

Deleted local branches:

- `stream/billing-readiness-command-v1`
- `stream/collections-priority-v1`
- `stream/payment-continuity-v1`
- `stream/verification-financial-closeout-v1`

No matching remote branches existed, so no remote branches were deleted.

## Containment Evidence

Cleanup audit commands confirmed before deletion:

- each worktree path exists;
- each worktree is on its expected `stream/*` branch;
- each worktree is clean;
- each branch head matches the reviewed stream commit;
- `git merge-base --is-ancestor <stream-head> main` passed for all four stream
  heads;
- `git log --cherry-pick --right-only --no-merges --oneline main...<branch>`
  returned no unique patch commits for all four branches.

No schema, migration, provider, gateway, accounting replacement, or duplicate
financial model work was part of cleanup.

## Cleanup Execution Result

Executed cleanup:

- removed `C:\FC-worktrees\billing-readiness-command-v1`;
- removed `C:\FC-worktrees\collections-priority-v1`;
- removed `C:\FC-worktrees\payment-continuity-v1`;
- removed `C:\FC-worktrees\verification-financial-closeout-v1`;
- deleted local branch `stream/billing-readiness-command-v1`;
- deleted local branch `stream/collections-priority-v1`;
- deleted local branch `stream/payment-continuity-v1`;
- deleted local branch `stream/verification-financial-closeout-v1`.

Remote branch result:

- `stream/billing-readiness-command-v1`: absent on `origin`, no deletion;
- `stream/collections-priority-v1`: absent on `origin`, no deletion;
- `stream/payment-continuity-v1`: absent on `origin`, no deletion;
- `stream/verification-financial-closeout-v1`: absent on `origin`, no
  deletion.

## Exact Cleanup Commands For Later

Run these only after explicit human approval to retire this exact wave set:

```powershell
cd C:\FloorConnector
git status --short --branch
git fetch origin
git rev-list --left-right --count HEAD...origin/main
pnpm.cmd worktree:doctor

pnpm.cmd worktree:finish billing-readiness-command-v1
pnpm.cmd worktree:finish collections-priority-v1
pnpm.cmd worktree:finish payment-continuity-v1
pnpm.cmd worktree:finish verification-financial-closeout-v1

pnpm.cmd worktree:doctor
git status --short --branch
```

Manual fallback, only if the scripted finish flow is unavailable and after
confirming the exact approved paths:

```powershell
cd C:\FloorConnector
git worktree remove C:\FC-worktrees\billing-readiness-command-v1
git worktree remove C:\FC-worktrees\collections-priority-v1
git worktree remove C:\FC-worktrees\payment-continuity-v1
git worktree remove C:\FC-worktrees\verification-financial-closeout-v1

git branch -d stream/billing-readiness-command-v1
git branch -d stream/collections-priority-v1
git branch -d stream/payment-continuity-v1
git branch -d stream/verification-financial-closeout-v1

pnpm.cmd worktree:doctor
git status --short --branch
```

If `git worktree remove` unregisters a worktree but leaves a residual directory,
remove the residual directory only after confirming it is the exact approved
path and the Git worktree registry no longer owns it.

## Required Approval

Human approval was recorded before deletion. This cleanup does not approve:

- deleting remote branches;
- starting another wave;
- modifying schemas or migrations;
- provider/gateway changes;
- feature work.

## Governance Follow-Up After Approved Cleanup

Cleanup execution updated:

- `active-worktrees.md` to mark the four financial closeout collections streams
  as archived/retired;
- `active-waves.md` to mark cleanup completed;
- `.codex/active-stream-plan.md` to record the cleanup result;
- `docs/chat-handoff.md` to replace the pending-retirement note with the final
  cleanup result.
