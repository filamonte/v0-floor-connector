Chat: Portal Project Trust Window

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Goal: improve the portal Project Workspace trust window so customers see clearer customer-safe continuity across project status, estimates, contracts, invoices, payments, shared documents, and next customer actions.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome. Do not expose contractor-only FieldTrail, Proof Center internals, internal blockers, Job Notes, execution attachments, provider metadata, or AI/collections internals to portal users. Avoid staging unrelated changes.

Run Prettier on changed supported files, targeted portal tests or portal fixture validation as applicable, and git diff --check. Stage only intended files. Commit the completed slice. Final response requirements: branch, status, commit hash, files changed, validation results, and limitations.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Required Final Response

Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
