# Chat: Financials Reporting V1 Wave

Worktree: `C:\FC-worktrees\financials-reporting`
Branch: `stream/financials-reporting`
Stream: `financials-reporting`

Use `.codex/prompt-templates/implementation-wave.md` as the execution template.

## Required Docs

- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/workflows.md`
- `docs/chat-handoff.md`
- `.codex/worktree-rules.md`
- `.codex/active-stream-plan.md`

## Scope Stub

Implement one bounded financial visibility or reporting slice over canonical
invoices, payments, payment events, jobs, and projects.

## Out Of Scope

- Duplicate ledgers.
- Accounting-provider truth.
- Invoice or payment math changes unless explicitly scoped.
- Job-costing mutation before source inputs are ready.

## Validation Stub

- `pnpm worktree:doctor`
- Prettier check on changed files.
- Targeted invoice/payment/reporting helper tests.
- Route smoke or E2E when protected financial behavior changes.
