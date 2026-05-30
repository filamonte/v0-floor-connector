# Chat: Communications V1 Wave

Worktree: `C:\FC-worktrees\communications`
Branch: `stream/communications`
Stream: `communications`

Use `.codex/prompt-templates/implementation-wave.md` as the execution template.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Scope Stub

Implement one bounded communications, delivery-proof, or message-memory slice
over canonical communication records.

## Out Of Scope

- Disconnected inbox models.
- Provider-owned business truth.
- Customer sends without explicit confirmation.
- AI-only communication memory.
- Portal leakage of contractor-only context.

## Validation Stub

- `pnpm worktree:doctor`
- Prettier check on changed files.
- Targeted communication helper/action tests.
- Protected route smoke when message or portal-visible behavior changes.
