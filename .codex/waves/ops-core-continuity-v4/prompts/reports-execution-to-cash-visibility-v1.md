Chat: Reports Execution To Cash Visibility

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Product outcome: Enhance Reports with an execution-to-cash visibility lane that helps operators see how project readiness, field execution, schedule attention, invoices, payments, and recent movement connect across existing records.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Scope the work to existing reports operations helpers and the Reports route. Do not add reporting persistence, BI-only truth, financial calculation changes, payment-state changes, provider behavior, route protection changes, or workflow mutation actions.

Acceptance criteria: Reports includes an execution-to-cash lane derived from existing project, readiness, schedule, field, invoice, payment, and recent movement records; the lane routes users back to canonical source surfaces instead of creating reporting-only records or new workflow actions; focused tests cover ready-but-unscheduled, in-field-with-open-blockers, completed-with-open-invoice, and paid/recent-movement scenarios; docs update implemented truth only if visible behavior changes.

Validation to run: pnpm --filter @floorconnector/web exec tsx lib/reports/operations-summary.test.ts; pnpm --filter @floorconnector/web typecheck; pnpm --filter @floorconnector/web lint; Run git diff --check.

Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
