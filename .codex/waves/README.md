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

## AI Next-Wave Generation

Use `pnpm fc:wave:generate --wave <current-wave>` only after the current wave
has a status/report worth reviewing. The command creates:

- `.codex/waves/<current-wave>/generator-context.md`
- `.codex/waves/<current-wave>/generate-next-wave.prompt.md`
- `.codex/waves/<current-wave>/generation-status.json`
- `.codex/waves/<current-wave>/ai-next-wave-review.md`
- `.codex/waves/<generated-wave>/wave.json`
- `.codex/waves/<generated-wave>/PROPOSED.md`
- `.codex/waves/<generated-wave>/prompts/*.md`

Generated waves are proposals, not approved execution plans. They are written
with `state: "proposed"` and the runner refuses to prepare or run them until a
human activates the proposal:

```powershell
pnpm fc:wave:approve --wave <generated-wave> --proposal
```

AI output must match `.codex/waves/templates/next-wave.schema.json` and pass
the runner's additional safety validation. If
`FLOORCONNECTOR_WAVE_GENERATOR_COMMAND` is missing, generation falls back to a
template/manual proposal and records `manual_ai_required` in the generation
status.
