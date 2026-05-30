# Chat: Verification V1 Wave

Worktree: `C:\FC-worktrees\verification`
Branch: `stream/verification`
Stream: `verification`

Use `.codex/prompt-templates/verification-wave.md` as the execution template.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`
- `docs/operating-core-validation-checklist.md`

## Scope Stub

Verify one completed wave against FloorConnector current truth and merge
readiness expectations.

## Out Of Scope

- Feature implementation.
- Schema, route, auth, or business-logic changes.
- Fake QA data or local-only persistence.
- Treating redirects, 404s, or missing fixtures as successful QA unless they
  are the expected negative case.

## Validation Stub

- `pnpm worktree:doctor`
- `pnpm worktree:audit`
- Targeted smoke or E2E command for the reviewed slice.
- Prettier check on changed docs/specs.
