# Chat: Project Readiness Stride V1

Branch: `stream/project-readiness-stride-v1`
Worktree: `C:\FC-worktrees\project-readiness-stride`

## Goal

Tighten Project Workspace readiness and next-action continuity over existing project, estimate, contract, job, invoice, and payment records.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/system-overview.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not create a project activity table or duplicate project state.
- Do not mutate source records from read-model surfaces.
- Do not expose portal-only or contractor-only data incorrectly.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or unrelated business logic.
- Do not create duplicate business models or portal-owned operational state.

## Implementation Requirements

- Start by checking `git status --short --branch`, current branch, and ahead/behind state.
- Run `git fetch origin`.
- Avoid staging unrelated changes.
- Preserve existing repo conventions and canonical records.
- Keep the slice bounded to the named product outcome.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

- Project-facing changes use existing canonical records and read models.
- No schema, auth, RLS, payment math, provider, or route-protection changes are made.
- Users can identify the next safe operational action more quickly.

## Validation

Run:

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

Report branch, starting status, final status, commit hash/message, files changed, validation results, skipped checks, limitations, assumptions, and follow-up dependencies.
