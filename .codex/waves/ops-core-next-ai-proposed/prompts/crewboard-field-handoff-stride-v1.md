# Chat: Crewboard Field Handoff Stride V1

Branch: `stream/crewboard-field-handoff-stride-v1`
Worktree: `C:\FC-worktrees\crewboard-field-handoff-stride`

## Goal

Improve CrewBoard to field execution handoff clarity using canonical jobs, job assignments, daily logs, field notes, and project context.

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

- Do not add route optimization, automated scheduling, or dispatch tables.
- Do not bypass Ready Check or project readiness gates.
- Do not expose field internals to portal users.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or unrelated business logic.
- Do not create duplicate business models or portal-owned operational state.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and `git fetch origin`.
- Preserve existing repo conventions and canonical records.
- Keep the slice bounded to the named product outcome.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

- CrewBoard handoff remains advisory/read-only unless using existing actions.
- Daily Log and Job links route to canonical records.
- No new schedule, dispatch, or field task model is introduced.

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

Report branch, starting status, final status, commit hash/message, files changed, validation results, skipped checks, assumptions, and follow-up dependencies.
