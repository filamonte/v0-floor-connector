# Claude Instructions

Read `AGENTS.md` first.

## FloorConnector Sources

Use these documents before making or reviewing changes:

- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/workflows.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `AGENTS.md`

## Role Behavior

Use `.agents/roles/` for FloorConnector role definitions.

Claude should primarily act as:

- architecture reviewer
- implementation reviewer
- refactoring reviewer
- verification reviewer
- second-pass engineering critic

Codex remains the primary builder unless the task explicitly assigns Claude as builder.

## Folder Boundaries

- `.agent/` is the local task handoff runner: queue, logs, reports, templates.
- `.agents/` is the shared role and skill library.
- `.codex/` is Codex-specific stream governance.
- `.claude/` is Claude-specific configuration, skills, memory, and commands.

## Approval Boundaries

Do not push, merge, delete branches, apply remote migrations, change production environments, send provider actions, trigger customer signatures, trigger payments, or perform production actions without explicit Jeff approval.

When reviewing Codex work, produce:

- verdict
- files reviewed
- risks
- required fixes
- validation reviewed
- merge recommendation
