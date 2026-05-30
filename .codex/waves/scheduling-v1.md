# Chat: Scheduling V1 Wave

Worktree: `C:\FC-worktrees\scheduling`
Branch: `stream/scheduling`
Stream: `scheduling`

Use `.codex/prompt-templates/implementation-wave.md` as the execution template.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `docs/design/scheduling-capability-wave-v1.md`

## Scope Stub

Implement one bounded CrewBoard or schedule-readiness slice on canonical jobs
and job assignments.

## Out Of Scope

- Separate dispatch tables.
- Readiness bypasses.
- Autonomous rescheduling.
- Portal-owned schedule state.

## Validation Stub

- `pnpm worktree:doctor`
- Prettier check on changed files.
- Targeted schedule helper/read-model tests.
- `/schedule` smoke or E2E when protected UI behavior changes.
