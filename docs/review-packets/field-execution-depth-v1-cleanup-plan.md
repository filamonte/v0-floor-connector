# Field Execution Depth V1 Cleanup Plan

Status: Cleanup Executed
Doc Type: Cleanup Plan
Plan date: 2026-06-07
Execution date: 2026-06-07

This plan covers post-wave cleanup for `field-execution-depth-v1` after the
approved stream set merged to `main`. Jeff explicitly approved retiring the
completed worktrees and eligible local branches. Cleanup did not start another
wave, modify schema, modify migrations, delete remote branches, or authorize
work in `C:\FC-worktrees\project-next-actions`.

## Wave Completion Status

Remote completion is confirmed on `origin/main`.

| Main commit | Message                                     |
| ----------- | ------------------------------------------- |
| `715af07d`  | `feat: deepen field handoff packet`         |
| `627358c4`  | `feat: strengthen daily execution workflow` |
| `980cfe5b`  | `feat: improve crew execution visibility`   |
| `36e80505`  | `test: protect field execution workflow`    |
| `3b2adf82`  | `docs: close field execution depth wave`    |

`main` was clean and even with `origin/main` before this cleanup-plan pass.
`pnpm.cmd worktree:doctor` passed with `PASS: 20`, and
`pnpm.cmd tooling:baseline -CommandsOnly` returned the standard validation
commands.

## Worktree Retirement Candidates

The completed stream branches were squash-merged to `main`, so branch tips are
not ancestry-contained by `origin/main`. Patch containment was checked with:

```powershell
git log --cherry-pick --right-only --no-merges --oneline origin/main...<branch>
```

The command returned no unique unmerged patch output for all four completed
streams.

| Worktree                                          | Branch                                   | Status | Ahead / behind `origin/main` | Main containment                                                  | Safe to retire later | Preserve reason                     |
| ------------------------------------------------- | ---------------------------------------- | ------ | ---------------------------- | ----------------------------------------------------------------- | -------------------- | ----------------------------------- |
| `C:\FC-worktrees\field-handoff-packet-v1`         | `stream/field-handoff-packet-v1`         | Clean  | `1 ahead / 6 behind`         | Patch-equivalent to `origin/main`; no unique branch patch remains | Yes, after approval  | Optional short-term inspection only |
| `C:\FC-worktrees\daily-execution-command-v1`      | `stream/daily-execution-command-v1`      | Clean  | `1 ahead / 6 behind`         | Patch-equivalent to `origin/main`; no unique branch patch remains | Yes, after approval  | Optional short-term inspection only |
| `C:\FC-worktrees\crew-execution-visibility-v1`    | `stream/crew-execution-visibility-v1`    | Clean  | `1 ahead / 6 behind`         | Patch-equivalent to `origin/main`; no unique branch patch remains | Yes, after approval  | Optional short-term inspection only |
| `C:\FC-worktrees\verification-field-execution-v1` | `stream/verification-field-execution-v1` | Clean  | `1 ahead / 6 behind`         | Patch-equivalent to `origin/main`; no unique branch patch remains | Yes, after approval  | Optional short-term inspection only |

The `1 ahead / 6 behind` result is expected after squash merge and governance
closeout. It is not evidence of unmerged work because patch-equivalence checks
found no unique branch changes.

## Cleanup Execution Result

Execution preflight confirmed `main` was clean and even with `origin/main`.
`pnpm.cmd worktree:doctor` passed, and
`pnpm.cmd tooling:baseline -CommandsOnly` returned the standard validation
commands.

Each approved candidate was reconfirmed before deletion:

- worktree existed and was on the expected branch;
- worktree status was clean;
- no schema or migration diff remained relative to `origin/main`;
- patch-equivalence checks against `main` and `origin/main` returned no unique
  unmerged patch output;
- matching remote branches were not present;
- no unique unmerged work would be lost.

Retired worktrees:

| Worktree                                          | Result                             |
| ------------------------------------------------- | ---------------------------------- |
| `C:\FC-worktrees\field-handoff-packet-v1`         | Removed from Git worktree registry |
| `C:\FC-worktrees\daily-execution-command-v1`      | Removed from Git worktree registry |
| `C:\FC-worktrees\crew-execution-visibility-v1`    | Removed from Git worktree registry |
| `C:\FC-worktrees\verification-field-execution-v1` | Removed from Git worktree registry |

Deleted local branches:

| Branch                                   | Result  |
| ---------------------------------------- | ------- |
| `stream/field-handoff-packet-v1`         | Deleted |
| `stream/daily-execution-command-v1`      | Deleted |
| `stream/crew-execution-visibility-v1`    | Deleted |
| `stream/verification-field-execution-v1` | Deleted |

Remote branch result: no matching remote branches were present, so no remote
branches were deleted.

The approved paths may still contain residual local development cache/link
directories after `git worktree remove`, but they are no longer registered Git
worktrees and the approved stream branches have been deleted.

## Branch Deletion Candidates

The local stream branches are deletion candidates after explicit cleanup
approval. Matching remote branches were not found on `origin` during this audit.

| Branch                                   | Local delete candidate | Remote branch present | Safe to delete later | Required pre-delete check                           |
| ---------------------------------------- | ---------------------- | --------------------- | -------------------- | --------------------------------------------------- |
| `stream/field-handoff-packet-v1`         | Yes                    | No                    | Yes, after approval  | Confirm patch-equivalence command returns no output |
| `stream/daily-execution-command-v1`      | Yes                    | No                    | Yes, after approval  | Confirm patch-equivalence command returns no output |
| `stream/crew-execution-visibility-v1`    | Yes                    | No                    | Yes, after approval  | Confirm patch-equivalence command returns no output |
| `stream/verification-field-execution-v1` | Yes                    | No                    | Yes, after approval  | Confirm patch-equivalence command returns no output |

Because these branches were squash-merged, `git branch -d` may refuse local
branch deletion even when patch-equivalence is clean. Use forced local branch
deletion only after the explicit approval gate and after rerunning the
pre-delete checks below.

## Preservation Exceptions

- `C:\FC-worktrees\project-next-actions` is dirty and out of scope. It must not
  be touched by this cleanup.
- No completed `field-execution-depth-v1` worktree has a preservation blocker
  beyond optional short-term inspection.
- Do not delete any scratch, legacy, paused, or unrelated worktree as part of
  this wave cleanup.

Dirty out-of-scope worktree observed:

```text
C:\FC-worktrees\project-next-actions
```

Dirty files observed there:

```text
apps/web/app/(app)/contracts/[contractId]/page.tsx
apps/web/app/(app)/customers/[customerId]/page.tsx
apps/web/app/(app)/invoices/[invoiceId]/page.tsx
apps/web/app/(app)/projects/[projectId]/page.tsx
apps/web/components/related-conversations-card.tsx
apps/web/lib/communications/record-continuity.test.ts
apps/web/lib/communications/record-continuity.ts
docs/current-state.md
```

## Required Human Approval

Do not run cleanup commands until Jeff explicitly approves deletion of the
named worktrees and branches. Approval should name whether to retire all four
completed field execution worktrees or only a subset.

Before deletion, rerun:

```powershell
git fetch origin
git status --short --branch
pnpm.cmd worktree:doctor
git -C C:\FC-worktrees\field-handoff-packet-v1 status --short --branch
git -C C:\FC-worktrees\daily-execution-command-v1 status --short --branch
git -C C:\FC-worktrees\crew-execution-visibility-v1 status --short --branch
git -C C:\FC-worktrees\verification-field-execution-v1 status --short --branch
git log --cherry-pick --right-only --no-merges --oneline origin/main...stream/field-handoff-packet-v1
git log --cherry-pick --right-only --no-merges --oneline origin/main...stream/daily-execution-command-v1
git log --cherry-pick --right-only --no-merges --oneline origin/main...stream/crew-execution-visibility-v1
git log --cherry-pick --right-only --no-merges --oneline origin/main...stream/verification-field-execution-v1
```

Proceed only if the four worktrees are clean and the four patch-equivalence
checks produce no output.

## Safe Cleanup Commands For Later

Run these only after explicit approval:

```powershell
git worktree remove C:\FC-worktrees\field-handoff-packet-v1
git worktree remove C:\FC-worktrees\daily-execution-command-v1
git worktree remove C:\FC-worktrees\crew-execution-visibility-v1
git worktree remove C:\FC-worktrees\verification-field-execution-v1

git branch -D stream/field-handoff-packet-v1
git branch -D stream/daily-execution-command-v1
git branch -D stream/crew-execution-visibility-v1
git branch -D stream/verification-field-execution-v1
```

Remote branches were not present during this audit. If they appear before
cleanup, delete them only after explicit approval:

```powershell
git push origin --delete stream/field-handoff-packet-v1
git push origin --delete stream/daily-execution-command-v1
git push origin --delete stream/crew-execution-visibility-v1
git push origin --delete stream/verification-field-execution-v1
```

## Rollback / Recovery

The completed work is recoverable from `origin/main` because the approved
stream patches landed as main commits:

- `715af07d`
- `627358c4`
- `980cfe5b`
- `36e80505`
- `3b2adf82`

If a worktree is needed again after retirement, recreate a review worktree from
current `origin/main`:

```powershell
git fetch origin
git worktree add C:\FC-worktrees\field-execution-depth-v1-review origin/main
```

If a branch-specific investigation is needed, create a new recovery branch from
the relevant main commit:

```powershell
git switch main
git pull --ff-only origin main
git branch recovery/field-execution-depth-v1 <main-commit>
```

## Recommendation

Cleanup is complete for the four approved `field-execution-depth-v1` worktrees
and eligible local branches. No next wave is approved by this cleanup. Continue
to preserve `C:\FC-worktrees\project-next-actions` unless Jeff explicitly
scopes it in a later task.
