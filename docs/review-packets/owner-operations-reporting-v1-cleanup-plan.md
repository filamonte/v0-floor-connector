# Owner Operations Reporting V1 Cleanup Plan

Status: Cleanup planning only.

Wave: `owner-operations-reporting-v1`

Plan date: 2026-06-07

Human approval required before deletion: Yes.

This plan records the retirement candidates for the completed owner operations
reporting wave. It does not delete worktrees, delete branches, start another
wave, modify schemas or migrations, or perform feature work.

## Wave Completion Status

`owner-operations-reporting-v1` has merged to `main` under Jeff's controlled
merge approval.

Review packet:
[docs/review-packets/owner-operations-reporting-v1.md](C:/FloorConnector/docs/review-packets/owner-operations-reporting-v1.md).

Plan packet:
[docs/review-packets/owner-operations-reporting-v1-plan.md](C:/FloorConnector/docs/review-packets/owner-operations-reporting-v1-plan.md).

Controlled merge commits on `main`:

- `1181cdf5 feat: merge owner operations summary v1`
- `f4c3b5cc feat: merge execution to cash reporting v1`
- `f4b16512 feat: merge labor field management snapshot v1`
- `791156ee feat: merge portfolio risk exceptions v1`
- `e0c3119d test: merge verification owner operations reporting v1`

Closeout documentation commit on `main`:

- `95c9e7d9 docs: close owner operations reporting wave`

Current cleanup status: planned only. The completed worktrees and eligible local
branches remain present until Jeff explicitly approves cleanup execution.

No next wave is approved by this cleanup plan.

## Worktree Retirement Candidates

| Worktree                                                     | Branch                                              | Stream head | Main merge commit | Worktree status | Contained in `main` | Recommendation                 |
| ------------------------------------------------------------ | --------------------------------------------------- | ----------- | ----------------- | --------------- | ------------------- | ------------------------------ |
| `C:\FC-worktrees\owner-operations-summary-v1`                | `stream/owner-operations-summary-v1`                | `edf21324`  | `1181cdf5`        | Clean           | Yes                 | Retire after explicit approval |
| `C:\FC-worktrees\execution-to-cash-reporting-v1`             | `stream/execution-to-cash-reporting-v1`             | `20a8fffe`  | `f4c3b5cc`        | Clean           | Yes                 | Retire after explicit approval |
| `C:\FC-worktrees\labor-field-management-snapshot-v1`         | `stream/labor-field-management-snapshot-v1`         | `f2332b41`  | `f4b16512`        | Clean           | Yes                 | Retire after explicit approval |
| `C:\FC-worktrees\portfolio-risk-exceptions-v1`               | `stream/portfolio-risk-exceptions-v1`               | `8df1a6d3`  | `791156ee`        | Clean           | Yes                 | Retire after explicit approval |
| `C:\FC-worktrees\verification-owner-operations-reporting-v1` | `stream/verification-owner-operations-reporting-v1` | `f8d0378c`  | `e0c3119d`        | Clean           | Yes                 | Retire after explicit approval |

## Branch Deletion Candidates

| Local branch                                        | Expected head | Containment evidence                                        | Recommendation                                              |
| --------------------------------------------------- | ------------- | ----------------------------------------------------------- | ----------------------------------------------------------- |
| `stream/owner-operations-summary-v1`                | `edf21324`    | Head is ancestor of `main`; no right-only non-merge commits | Delete locally after worktree removal and explicit approval |
| `stream/execution-to-cash-reporting-v1`             | `20a8fffe`    | Head is ancestor of `main`; no right-only non-merge commits | Delete locally after worktree removal and explicit approval |
| `stream/labor-field-management-snapshot-v1`         | `f2332b41`    | Head is ancestor of `main`; no right-only non-merge commits | Delete locally after worktree removal and explicit approval |
| `stream/portfolio-risk-exceptions-v1`               | `8df1a6d3`    | Head is ancestor of `main`; no right-only non-merge commits | Delete locally after worktree removal and explicit approval |
| `stream/verification-owner-operations-reporting-v1` | `f8d0378c`    | Head is ancestor of `main`; no right-only non-merge commits | Delete locally after worktree removal and explicit approval |

Remote branch deletion is not approved by this plan. Preserve remote branches
unless a later cleanup execution prompt explicitly confirms they exist and are
safe to delete.

## Containment Evidence

Pre-cleanup audit confirmed:

- each listed worktree path exists;
- each worktree is on the expected stream branch;
- each worktree has a clean status;
- each stream branch is zero commits ahead and eleven commits behind
  `origin/main` after the owner operations merge and closeout documentation
  landed;
- each expected stream head is an ancestor of `main`;
- each controlled merge commit is an ancestor of `main`;
- `git log --cherry-pick --right-only --no-merges main...<branch>` returned no
  unique right-only non-merge commits for the five listed branches.

## Exact Cleanup Commands For Later

Run these commands only after explicit human approval for cleanup execution:

```powershell
git worktree remove C:\FC-worktrees\owner-operations-summary-v1
git branch -d stream/owner-operations-summary-v1

git worktree remove C:\FC-worktrees\execution-to-cash-reporting-v1
git branch -d stream/execution-to-cash-reporting-v1

git worktree remove C:\FC-worktrees\labor-field-management-snapshot-v1
git branch -d stream/labor-field-management-snapshot-v1

git worktree remove C:\FC-worktrees\portfolio-risk-exceptions-v1
git branch -d stream/portfolio-risk-exceptions-v1

git worktree remove C:\FC-worktrees\verification-owner-operations-reporting-v1
git branch -d stream/verification-owner-operations-reporting-v1
```

Do not use `git branch -D` unless a later cleanup execution explicitly records
why normal safe deletion is blocked and Jeff approves the stronger deletion.

Do not delete remote branches from this plan. Remote cleanup, if any, requires a
separate explicit safety confirmation.

## Required Human Approval Before Deletion

Before cleanup execution, Jeff must explicitly approve retiring these exact
worktrees and eligible local branches. The execution task should rerun:

```powershell
git status
git fetch origin
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

It should then reconfirm each worktree exists, is clean, and is contained in or
patch-equivalent to `main` before removing any worktree or local branch.
