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

## Implementation Requirements

- Start with `git status --short --branch` and `git fetch origin`.
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

## Git Completion Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless asked.

## Final Response Requirements

Report branch, starting status, final status, commit hash/message, files
changed, validation results, skipped checks, assumptions, and follow-up
dependencies.
