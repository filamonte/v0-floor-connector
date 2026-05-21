# Codex Prompt Templates

Status: short prompt scaffolds for future Codex sessions.

## Feature Planning Prompt

Read first:
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/chat-handoff.md`

Task:
- inspect the relevant files first
- produce an implementation plan before coding
- call out canonical workflow impact, tenant impact, UI impact, migration needs, validation steps, and doc updates
- wait for approval before implementation

## Build Prompt

Read first:
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/chat-handoff.md`

Task:
- inspect the relevant files first
- preserve canonical continuity and project-as-root behavior
- do not create duplicate models or module silos
- implement the smallest reviewable change
- run `pnpm typecheck` and `pnpm lint`
- update docs if implemented truth changed

## Review Prompt

Read first:
- `docs/current-state.md`
- `docs/developer-source-of-truth.md`
- `docs/chat-handoff.md`

Task:
- review for bugs, regressions, continuity breaks, tenant-isolation issues, duplicate-model drift, and UI-baseline drift
- prioritize findings first
- keep summaries brief
