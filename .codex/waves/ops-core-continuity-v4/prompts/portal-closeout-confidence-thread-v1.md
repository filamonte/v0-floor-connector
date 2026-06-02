Chat: Portal Closeout Confidence Thread

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Product outcome: Strengthen the customer portal project view with a closeout confidence thread that connects customer-safe project status, contract/invoice visibility, shared documents, evidence receipts, warranty documents, and next-step context from existing portal helpers.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.

Scope the work to existing portal project helpers, presentational components, and the portal Project Workspace. Do not change portal access grants, route protection, signed URL behavior, document storage behavior, invoice/payment state, provider behavior, or customer mutation flows.

Acceptance criteria: the portal Project Workspace displays a customer-safe closeout confidence thread using existing project status, contract, invoice, shared document, evidence receipt, warranty, and next-step helpers; the thread never exposes contractor-only details; no portal-owned records or portal-only copies are introduced; focused tests cover in-progress, ready-for-closeout, missing-document, and completed closeout contexts; docs update implemented truth only if visible behavior changes.

Validation to run: pnpm --filter @floorconnector/web exec tsx lib/portal/closeout-handoff.test.ts; pnpm --filter @floorconnector/web exec tsx lib/portal/project-timeline.test.ts; pnpm --filter @floorconnector/web typecheck; pnpm --filter @floorconnector/web lint; Run git diff --check.

Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
