# Chat: Project Workspace V1 Wave

Worktree: `C:\FC-worktrees\project-workspace`
Branch: `stream/project-workspace`
Stream: `project-workspace`

Use `.codex/prompt-templates/implementation-wave.md` as the execution template.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `docs/design/project-workspace-capability-wave-v1.md`

## Scope Stub

Implement one bounded Project Workspace maturity slice over existing canonical
records.

## Out Of Scope

- Duplicate project, activity, task, field, schedule, invoice, payment, or
  portal models.
- Schema or migration work unless the wave is explicitly rewritten to include
  it.
- Autonomous AI or provider actions.

## Validation Stub

- `pnpm worktree:doctor`
- Prettier check on changed files.
- Targeted helper/action/read-model tests.
- Protected route smoke when workspace behavior changes.
