# Chat: Portal Operational Trust Stride V1

Branch: `stream/portal-operational-trust-stride-v1`
Worktree: `C:\FC-worktrees\portal-operational-trust-stride`

## Goal

Clarify customer-safe portal continuity across project, contract, invoice, payment, and shared document review paths.

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

- Do not change portal grants, RLS, auth, or route protection.
- Do not expose internal blockers, Job Notes, provider diagnostics, or contractor-only evidence.
- Do not create portal-specific business records.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or unrelated business logic.
- Do not create duplicate business models or portal-owned operational state.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and `git fetch origin`.
- Preserve existing repo conventions and canonical records.
- Keep the slice bounded to the named product outcome.
- Update docs only if implemented behavior changes.

## Acceptance Criteria

- Portal copy remains customer-safe and scoped by existing access checks.
- Customer actions route to canonical estimate, contract, invoice, and payment records.
- No portal-owned copies or access-rule changes are introduced.

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
