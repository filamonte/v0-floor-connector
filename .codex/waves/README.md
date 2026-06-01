# Codex Waves

Wave files are ready-to-run Codex prompts for bounded work in one active
FloorConnector stream.

Structured wave-runner manifests live in subdirectories such as
`.codex/waves/ops-core-next/`. Use `docs/agent-wave-runner.md` for the local
Node runner, approval gate, and merge process.

## Operating Rules

- ChatGPT creates or updates wave files.
- Codex implements from wave files.
- Each wave belongs to exactly one active stream.
- Each wave should be independently testable.
- Human review remains required before merge.
- Wave files are coordination inputs, not permission to implement outside the
  named scope.

## Draft PR Rule

Wave work should move through draft PRs by default. No script should mark a PR
ready for review, merge a PR, enable auto-merge, delete a branch, or delete a
worktree.

The safe rhythm is:

```powershell
pnpm codex:next
pnpm wave:review
pnpm wave:pr
```

For manifest-driven local waves, the safe V1 rhythm is:

```powershell
pnpm fc:wave:prepare --wave ops-core-next
pnpm fc:wave:status --wave ops-core-next
pnpm fc:wave:report --wave ops-core-next
```

Do not run `pnpm fc:wave:merge --wave <name> --approved` until a human has
reviewed the report and created approval with `pnpm fc:wave:approve`.
