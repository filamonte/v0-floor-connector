# Operational Command Center V1 Cleanup Plan

Status: Cleanup Planning
Doc Type: Review Packet
Review date: 2026-06-05

## Scope

This cleanup plan covers post-wave retirement planning for
`operational-command-center-v1` after the approved stream set landed on
`main`.

It does not approve deletion, remove worktrees, delete branches, archive files,
start a new wave, or authorize production-code changes.

## Remote Completion Status

Remote completion is confirmed. Local `main` is even with `origin/main`, and
both local `main` and `origin/main` contain:

- `c809186c feat: clarify project operational command center`
- `890bfbad feat: strengthen communications continuity workspace`
- `5844f52e feat: shape financial command center`
- `f7caf1db test: protect operational ownership model`
- `10305a5d docs: close operational command center wave`
- `17cbc1cb docs: verify operational command center merge`
- `6df16ed1 feat: shape field command center (#15)`

## Worktree Retirement Candidates

| Worktree                                       | Branch                                | Status | Ahead / behind vs `origin/main` | Main containment evidence                                                                                | Safe to retire later | Preserve reason                                                                                       |
| ---------------------------------------------- | ------------------------------------- | ------ | ------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------- |
| `C:\FC-worktrees\project-workspace-v2`         | `stream/project-workspace-v2`         | Clean  | `6` behind / `1` ahead          | `c809186c` is on `origin/main`; `git log --cherry-pick --right-only --no-merges main...branch` is empty. | Yes, with approval   | Keep until Jeff approves cleanup because the squash-merged branch tip is not a literal main ancestor. |
| `C:\FC-worktrees\field-command-center-v1`      | `stream/field-command-center-v1`      | Clean  | `9` behind / `0` ahead          | `6df16ed1` is on `origin/main`; branch changes are already contained in `main`.                          | Yes, with approval   | Remote branch still exists, so coordinate remote branch deletion explicitly.                          |
| `C:\FC-worktrees\communications-continuity-v2` | `stream/communications-continuity-v2` | Clean  | `6` behind / `1` ahead          | `890bfbad` is on `origin/main`; `git log --cherry-pick --right-only --no-merges main...branch` is empty. | Yes, with approval   | Keep until Jeff approves cleanup because the squash-merged branch tip is not a literal main ancestor. |
| `C:\FC-worktrees\financial-command-center-v1`  | `stream/financial-command-center-v1`  | Clean  | `6` behind / `1` ahead          | `5844f52e` is on `origin/main`; `git log --cherry-pick --right-only --no-merges main...branch` is empty. | Yes, with approval   | Keep until Jeff approves cleanup because the squash-merged branch tip is not a literal main ancestor. |
| `C:\FC-worktrees\verification-v2`              | `stream/verification-v2`              | Clean  | `6` behind / `1` ahead          | `f7caf1db` is on `origin/main`; `git log --cherry-pick --right-only --no-merges main...branch` is empty. | Yes, with approval   | Keep until Jeff approves cleanup because the squash-merged branch tip is not a literal main ancestor. |

## Branch Deletion Candidates

| Branch                                | Local delete later | Remote delete later | Notes                                                                                              |
| ------------------------------------- | ------------------ | ------------------- | -------------------------------------------------------------------------------------------------- |
| `stream/project-workspace-v2`         | Candidate          | Not applicable      | No remote branch was found. Delete local branch only after worktree removal and explicit approval. |
| `stream/field-command-center-v1`      | Candidate          | Candidate           | Remote branch exists. Delete local and remote branch only after explicit approval.                 |
| `stream/communications-continuity-v2` | Candidate          | Not applicable      | No remote branch was found. Delete local branch only after worktree removal and explicit approval. |
| `stream/financial-command-center-v1`  | Candidate          | Not applicable      | No remote branch was found. Delete local branch only after worktree removal and explicit approval. |
| `stream/verification-v2`              | Candidate          | Not applicable      | No remote branch was found. Delete local branch only after worktree removal and explicit approval. |

## Preservation Exceptions

- Preserve all five worktrees until Jeff explicitly approves cleanup.
- Preserve `stream/field-command-center-v1` remote branch until Jeff explicitly
  approves remote branch deletion.
- The four squash-merged branches are patch-equivalent to `main` by
  `git --cherry-pick` evidence, but their exact branch commits are not main
  ancestors. If exact pre-squash branch history is still useful for review, defer
  local branch deletion even if the worktree is retired.
- Do not touch dirty or out-of-scope worktrees as part of this cleanup plan.

## Dirty Or Out-Of-Scope Worktrees

The only dirty out-of-scope worktree found during this audit was:

| Worktree                               | Branch                        | Status                                                                                                                                   | Action                                     |
| -------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `C:\FC-worktrees\project-next-actions` | `stream/project-next-actions` | Dirty: modified protected route pages, `related-conversations-card`, communication continuity helper/tests, and `docs/current-state.md`. | Report only; do not touch in this cleanup. |

## Cleanup Commands For Later Approval

Run these only after explicit cleanup approval.

Recommended tool-driven cleanup:

```powershell
pnpm.cmd worktree:finish project-workspace-v2
pnpm.cmd worktree:finish field-command-center-v1
pnpm.cmd worktree:finish communications-continuity-v2
pnpm.cmd worktree:finish financial-command-center-v1
pnpm.cmd worktree:finish verification-v2
```

Manual verification before destructive cleanup:

```powershell
git -C C:\FloorConnector fetch origin
git -C C:\FloorConnector status --short --branch
git -C C:\FloorConnector rev-list --left-right --count origin/main...HEAD
git -C C:\FC-worktrees\project-workspace-v2 status --short
git -C C:\FC-worktrees\field-command-center-v1 status --short
git -C C:\FC-worktrees\communications-continuity-v2 status --short
git -C C:\FC-worktrees\financial-command-center-v1 status --short
git -C C:\FC-worktrees\verification-v2 status --short
```

Manual worktree removal fallback:

```powershell
git -C C:\FloorConnector worktree remove C:\FC-worktrees\project-workspace-v2
git -C C:\FloorConnector worktree remove C:\FC-worktrees\field-command-center-v1
git -C C:\FloorConnector worktree remove C:\FC-worktrees\communications-continuity-v2
git -C C:\FloorConnector worktree remove C:\FC-worktrees\financial-command-center-v1
git -C C:\FloorConnector worktree remove C:\FC-worktrees\verification-v2
```

Manual local branch deletion fallback after worktree removal:

```powershell
git -C C:\FloorConnector branch -D stream/project-workspace-v2
git -C C:\FloorConnector branch -D stream/field-command-center-v1
git -C C:\FloorConnector branch -D stream/communications-continuity-v2
git -C C:\FloorConnector branch -D stream/financial-command-center-v1
git -C C:\FloorConnector branch -D stream/verification-v2
```

Remote branch deletion candidate:

```powershell
git -C C:\FloorConnector push origin --delete stream/field-command-center-v1
```

Do not run the remote branch deletion command unless Jeff explicitly approves
remote branch cleanup.

## Rollback / Recovery Note

If a retired stream is needed again, recover from current `main` rather than
reviving stale worktree state:

```powershell
git -C C:\FloorConnector fetch origin
git -C C:\FloorConnector worktree add C:\FC-worktrees\<new-cleanup-or-followup-name> -b stream/<new-cleanup-or-followup-name> origin/main
```

For stream-specific historical review, inspect the main merge commits:

```powershell
git -C C:\FloorConnector show c809186c
git -C C:\FloorConnector show 6df16ed1
git -C C:\FloorConnector show 890bfbad
git -C C:\FloorConnector show 5844f52e
git -C C:\FloorConnector show f7caf1db
```

## Recommendation

Plan to retire all five completed wave worktrees together after Jeff explicitly
approves cleanup. Do not delete branches or remove worktrees in the planning
task.

Recommended next cleanup approval scope:

- remove the five completed wave worktrees
- delete the five local stream branches after worktree removal
- delete the remote `stream/field-command-center-v1` branch only if Jeff
  approves remote branch cleanup
- leave all dirty or unrelated worktrees untouched
