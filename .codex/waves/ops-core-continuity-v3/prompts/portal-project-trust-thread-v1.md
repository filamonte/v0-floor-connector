Chat: Portal Project Trust Thread

Start by checking git status, current branch, and ahead/behind state.
Run git fetch origin.
Avoid staging unrelated changes.

Only surface field evidence that is already explicitly portal-visible through existing portal-safe loaders or visibility grants; otherwise show safe unavailable/fallback wording.

Read the required FloorConnector docs first:

- docs/developer-source-of-truth.md
- docs/current-state.md
- docs/workflows.md
- docs/chat-handoff.md
- .codex/worktree-rules.md
- .codex/active-stream-plan.md

Product outcome: Make the portal project view show a clearer customer-safe trust thread across project status, contract, invoice, shared documents, and field evidence visibility.

Work in the existing portal read models and portal project page. Use the contractor-owned canonical project, contract, invoice, shared document, evidence grant, appointment/status, and portal visibility data already exposed to the portal. Keep portal wording customer-safe and avoid leaking internal queue names, payment internals, or staff-only blocker language.

Acceptance criteria:

- Portal project context reads as one coherent trust thread for customer-visible status, approvals, invoices, shared documents, and evidence.
- Timeline/status labels are customer-safe and deterministic.
- Hidden or unavailable internal records produce safe fallback wording.
- Tests cover label safety, timeline ordering, and portal visibility fallbacks.

Boundaries:

- Use existing canonical records.
- Do not create duplicate business models.
- Do not change schema, migrations, Supabase policies, RLS, auth, env vars, route protection, payment math, provider behavior, or business logic outside the named product outcome.
- Do not change portal access grants, portal project access, route protection, auth, visibility authorization, or add portal-only record copies.

Validation:

- pnpm --filter @floorconnector/web exec tsx lib/portal/project-timeline.test.ts
- pnpm --filter @floorconnector/web exec tsx lib/portal/status-explanation.test.ts
- pnpm --filter @floorconnector/web typecheck
- pnpm --filter @floorconnector/web lint
- git diff --check

Run git diff --check.
Stage only intended files.
Commit the completed slice.
Final response requirements: Report branch name, starting status, final status, commit hash and message, files changed, validation results, and limitations.
