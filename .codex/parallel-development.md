# Parallel Development Coordination

Status: Active
Doc Type: Developer Operations

This document defines the operating model for parallel Codex streams in
FloorConnector. It is local development governance, not product behavior.

## Branch Strategy

- Use one stream branch per capability wave or tightly scoped implementation
  slice.
- Use one worktree per stream branch under `C:\FC-worktrees`.
- Name branches as `stream/<capability-or-slice>`.
- Keep `main` as the canonical integration branch.
- Avoid overlapping file ownership across active streams. If overlap is
  unavoidable, document the hotspot and reconcile early.

## Merge Strategy

- Reconcile frequently with `pnpm worktree:reconcile`.
- Merge small completed slices instead of letting streams drift.
- Prefer merging `main` into stream branches for local reconciliation before
  final review.
- Do not merge stream branches into `main` until review, validation, and merge
  ordering are explicit.
- Keep branch histories understandable; do not rewrite shared branch history
  without explicit approval.

## Codex Requirements

- Read required docs first.
- Inspect git status and branch state before edits.
- Preserve canonical lifecycle and anti-silo rules.
- Stage only intended files.
- Commit completed slices when requested.
- Report validation, blockers, branch state, and final git status.

## Conflict Strategy

- Merge early and reconcile often.
- Avoid editing the same files across streams, especially project workspace,
  schedule read models, portal project loaders, field read models, and E2E
  specs.
- Resolve conflicts by preserving the more complete canonical implementation,
  not by blindly accepting one side.
- Run `pnpm worktree:doctor` after conflict resolution.

## Daily Rhythm

Morning:

```powershell
pnpm worktree:reconcile
```

Before work:

```powershell
pnpm worktree:doctor
git status --short --branch
```

After work:

```powershell
git status --short --branch
git commit
```

Before merge:

```powershell
pnpm worktree:doctor
pnpm worktree:reconcile
```

After merge:

```powershell
pnpm worktree:finish <name>
```
