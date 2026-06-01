# Chat: Collections Follow-Up Context V1

Branch: `stream/collections-follow-up-context-v1`
Worktree: `C:\FC-worktrees\collections-follow-up-context`

## Goal

Extend AR Collections with read-only follow-up context and clearer
invoice/customer/project continuity using existing records only.

## Required Docs

Read these before implementation:

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `docs/financial-architecture.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Boundaries

- Do not change schema, migrations, Supabase policies, RLS, auth, env vars,
  payment math, route protection, provider behavior, invoice math, payment
  state, payment events, or reconciliation logic.
- Do not create duplicate AR, ledger, collections-task, customer-financial, or
  portal billing models.
- Do not send reminders, create notifications, create communication threads, or
  call providers.
- Keep the surface read-only over canonical invoices, payments, payment events,
  projects, customers, contracts, and communication context.

## Implementation Requirements

- Start with `git status --short --branch`, current branch confirmation, and
  `git fetch origin`.
- Reuse existing AR collections helpers and Payment Trail context where
  practical.
- Improve review-first context: why this invoice needs attention, which record
  to open, and what safe follow-up context already exists.
- Route actions to canonical Invoice, Project, Customer, Communications, and
  Payments workspaces.
- Update `docs/current-state.md` only if implemented behavior changes.

## Validation

Run:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
```

Add or run focused helper tests if financial read-model logic changes.

## Git Completion Requirements

- Stage only intended files.
- Commit the completed slice.
- Do not push unless asked.

## Final Response Requirements

Report branch, starting status, final status, commit hash/message, files
changed, validation results, skipped checks, assumptions, and follow-up
dependencies.
