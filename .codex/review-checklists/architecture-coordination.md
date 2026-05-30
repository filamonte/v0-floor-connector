# Architecture Coordination Review Checklist

## Owned Files / Modules

- `.codex`
- `docs` coordination and governance files.
- `active-worktrees.md`
- Worktree and wave scripts.

## Common Risks

- Documentation claiming future work is implemented.
- Coordination docs authorizing unscoped schema, route, auth, or product
  changes.
- Automation that marks PRs ready, merges, enables auto-merge, or deletes
  branches/worktrees.

## Required Validations

- Prettier on changed docs and scripts.
- `pnpm worktree:doctor`
- `pnpm worktree:audit`
- Script status/review dry runs where safe.

## Out Of Scope

- Product feature implementation.
- Runtime behavior changes outside explicitly scoped tooling.
- Destructive cleanup.

## Merge Readiness Notes

- Coordination docs must preserve human approval.
- PRs stay draft by default.
- Branches and worktrees are not deleted automatically.

## Human Review Expectations

- Confirm no autonomous merge or ready-for-review transition exists.
- Confirm current-state remains the implemented truth.
