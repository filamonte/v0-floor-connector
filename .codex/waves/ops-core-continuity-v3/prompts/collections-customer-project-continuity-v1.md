Chat: Collections Customer Project Continuity

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- .codex/worktree-rules.md
- .codex/active-stream-plan.md

Product outcome: Improve AR follow-up context by showing invoice, payment, customer, project, and last activity continuity from existing financial records.

Work inside the existing AR read-model stack: collections-read-model.ts, collections-core.ts, collections-summary.ts, collections-follow-up-intelligence.ts, collections-command-center.ts, and the Accounts Receivable route. Keep the slice read-only and derived from canonical invoices, payments, payment_events, customers, and projects.

Acceptance criteria:

- Follow-up context explains why an item is in attention or recent activity.
- Settled activity and open exceptions remain separate.
- Links point back to existing Invoice Workspace, Project Workspace, and customer/project context.
- Tests lock priority ordering, missing-context fallback labels, and settled-vs-attention buckets.

Boundaries:

- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.
- Do not alter invoice balances, payment allocation, payment state, reconciliation logic, provider behavior, send flows, reminders, automations, or new collections persistence.

Validation:

- pnpm --filter @floorconnector/web exec tsx apps/web/lib/financials/collections-follow-up-intelligence.test.ts
- pnpm --filter @floorconnector/web exec tsx apps/web/lib/financials/collections-command-center.test.ts
- pnpm --filter @floorconnector/web typecheck
- pnpm --filter @floorconnector/web lint
- git diff --check

Run git diff --check.
Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
