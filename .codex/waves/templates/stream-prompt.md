# Chat: Example Stream V1

Branch: `stream/example-stream-v1`
Worktree: `C:\FC-worktrees\example-stream`

## Goal

Describe the bounded product outcome.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  payment math, route protection, or provider behavior unless explicitly
  approved.
- Do not create duplicate business models.
- Use existing canonical records and routes.
- Keep the slice small, testable, and reviewable.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Implementation Requirements

- Confirm the branch and worktree match this prompt.
- Preserve repo conventions.
- Update docs only when behavior changes or the prompt requires it.

## Validation

Run the narrowest meaningful checks, including:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

## Final Response Requirements

Report branch name, starting status, final status, commit hash and message,
files changed, validation results, and limitations. Also report skipped checks,
assumptions, and follow-up dependencies when applicable.
