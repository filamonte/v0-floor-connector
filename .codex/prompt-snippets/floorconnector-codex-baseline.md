# FloorConnector Codex Baseline

Use this baseline for future FloorConnector Codex prompts that need the standard
repo safety, tool exposure, validation, and reporting posture.

Future prompts can say:

```text
Read AGENTS.md first.
Follow .codex/prompt-snippets/floorconnector-codex-baseline.md.
We are continuing...
```

## Startup

1. Read `AGENTS.md` first.
2. Read the required governance docs named by `AGENTS.md`, including
   `docs/agent-startup-checklist.md`,
   `docs/developer-source-of-truth.md`, `docs/current-state.md`,
   `docs/workflows.md`, `docs/chat-handoff.md`,
   `.codex/worktree-rules.md`, and `.codex/active-stream-plan.md`.
3. Run the standard startup verification before edits:

   ```powershell
   Get-Location
   git status --short --branch
   git branch --show-current
   git remote -v
   git fetch origin
   git rev-list --left-right --count HEAD...origin/main
   git rev-parse --show-toplevel
   ```

4. Confirm the intended stream, branch, and worktree from the prompt and active
   registry. Stop before editing if they are unclear.
5. Start from updated `main` unless the task explicitly names an approved
   existing stream worktree.

## Tool Exposure

Apply `.codex/prompt-snippets/tool-exposure-check.md`.

Default to local repo files, docs, scripts, tests, and git as the source of
truth. Use external tools/connectors only when they are exposed and materially
needed for the task.

Do not block on a missing optional tool unless that tool is required for safety
or correctness.

## Repo Safety

- Work only in `C:\FloorConnector` or an approved
  `C:\FC-worktrees\<stream>` worktree.
- Use `stream/<name>` for stream branches and
  `C:\FC-worktrees\<name>` for stream worktrees.
- Treat dirty files and dirty worktrees as user-owned unless explicitly scoped.
- Stage only intended files.
- Do not create shadow repositories or duplicate working copies.
- Do not change app code, schema, migrations, routes, Supabase behavior,
  provider behavior, package scripts, tests, or production logic unless the task
  explicitly scopes that work.
- Do not rename routes, tables, canonical entities, or workflow states unless
  explicitly requested.

## Product And Data Guardrails

- Preserve the canonical lifecycle:
  `opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment`.
- Do not create duplicate business truth for customers, projects, estimates,
  contracts, jobs, invoices, payments, communications, scheduling, field,
  portal, or AI.
- Preserve tenant safety, RLS assumptions, organization-aware auth, server-side
  validation, readiness gates, payment/signature state, and provider adapter
  boundaries.
- Keep portal surfaces customer-safe and backed by shared canonical records.
- Keep AI, reports, dashboards, tools, and external providers as views,
  adapters, or guidance around source records, not sources of business truth.

## Validation

Use the narrowest validation that fits the change.

For docs-only prompt/governance changes:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd exec prettier --check <changed-markdown-files>
git diff --check
git diff --cached --check
```

Run broader typecheck, lint, focused tests, or protected route smoke only when
the task changes helpers, app code, server actions, read models, routes,
protected workflows, or setup behavior.

## Reporting

Every completion report should include:

- branch and worktree
- upstream status and ahead/behind count
- files changed
- what changed
- validation executed and results
- environment variable changes, if any
- follow-up dependencies or blockers
- intentionally unchanged areas
- final git status
- commit hash, when committed
- tool exposure report

If validation is skipped or blocked, say exactly why. Do not convert blocked
checks into success.
