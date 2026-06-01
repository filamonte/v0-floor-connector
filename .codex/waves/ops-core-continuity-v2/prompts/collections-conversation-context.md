Chat: Collections Conversation Context

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Read the required FloorConnector docs first: docs/developer-source-of-truth.md, docs/current-state.md, docs/workflows.md, docs/chat-handoff.md, .codex/worktree-rules.md, and .codex/active-stream-plan.md.

Goal: connect Accounts Receivable follow-up rows to existing communication context, invoice/customer/project continuity, and payment-event evidence so collections review has the next human follow-up context in one place.

Use existing canonical records. Do not create duplicate business models. Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome. Do not send reminders, create communication threads automatically, create notification events, mutate invoice/payment state, or add provider calls. Avoid staging unrelated changes.

Run Prettier on changed supported files, targeted tests for changed helpers or surfaces, and git diff --check. Stage only intended files. Commit the completed slice. Final response requirements: branch, status, commit hash, files changed, validation results, and limitations.

## Required Git And Validation Workflow

- Start by checking git status, current branch, and ahead/behind state.
- Run git fetch origin.
- Avoid staging unrelated changes.
- Run git diff --check.
- Stage only intended files.
- Commit the completed slice.

## Required Final Response

Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
