# Chat: Portal Trust Continuity V1

Branch: `stream/portal-trust-continuity-v1`
Worktree: `C:\FC-worktrees\portal-trust-continuity`

## Goal

Improve customer portal project/invoice/contract continuity so
customer-facing state reflects the same operational loop more clearly.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/portal-architecture.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  payment math, route protection, provider behavior, portal grants, or access
  rules.
- Do not create portal-owned copies of projects, customers, contracts,
  invoices, payments, messages, signatures, or documents.
- Do not expose contractor-only blockers, FieldTrail, internal notes, provider
  diagnostics, Job Notes, or unreviewed field evidence.
- Keep customer copy simple, customer-safe, and scoped to existing portal access
  checks.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and
  `git fetch origin`.
- Reuse existing portal-scoped loaders and read models.
- Improve continuity between portal project, estimate, contract, invoice,
  payment, and print/review paths.
- Keep loaders deterministic and avoid widening data access just to make copy
  more specific.
- Update `docs/current-state.md` only if implemented behavior changes.

## Validation

Run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Run narrow portal route smoke only with valid saved portal auth. Report
redirects, stale fixtures, and Supabase Auth rate limits honestly.

## Git Completion Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless asked.

## Final Response Requirements

Report branch, starting status, final status, commit hash/message, files
changed, validation results, skipped checks, assumptions, and follow-up
dependencies.
