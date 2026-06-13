# Leads Command Lanes V1

Status: Setup created
Date: 2026-06-13
Branch: `stream/leads-command-lanes-v1`
Worktree: `C:\FC-worktrees\leads-command-lanes-v1`
Base: `origin/main` at `ddf9e2bd`

## Purpose

Make `/leads` feel like Sales Command / Opportunity Intake instead of a
table-heavy manager, while keeping the table available and preserving existing
routes and data ownership.

## Scope

- `/leads` first viewport.
- Qualification, follow-up, site visit, estimate waiting, and missing-info
  lanes using existing real opportunity/lead data only.
- Lead detail only if a small shared improvement is obvious and does not
  collide with mobile workspace compression.

## Forbidden Scope

No schema, migrations, route renames, duplicate Lead or Opportunity model,
fake records, fake statuses, fake KPIs, fake queues/counts, local-only
persistence, auth/tenant changes, portal/admin guard changes,
payment/signature/scheduling logic changes, or removal of real actions.

## Required Startup Docs

- `AGENTS.md`
- `.codex/prompt-snippets/floorconnector-codex-baseline.md`
- `docs/developer-source-of-truth.md`
- `docs/current-state.md`
- `docs/system-overview.md`
- `docs/workflows.md`
- `docs/target-ia.md`
- `docs/chat-handoff.md`
- `docs/review-packets/figma-fidelity-refactor-v1.md`

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing `/leads` loader data, opportunity statuses, filters, quick-create
actions, and canonical links only. Lanes must be derived presentation over real
data, not persisted workflow state.

## Validation Plan

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd --filter @floorconnector/ui test
pnpm.cmd fc:preflight:fast
pnpm.cmd e2e:smoke:auth
git diff --check
git diff --cached --check
pnpm.cmd worktree:doctor
```

Browser checks: `/leads`, one Opportunity Workspace if touched, `/dashboard`,
`/settings`, `/projects`, `/portal`, and
`/dashboard?capture=1#universal-capture` at `1366px` and `390px`.

## Completion Notes

To be completed by the stream owner: files changed, Figma frames used, visual
improvements, deviations from Figma, no-data-silo confirmation, production
safety confirmation, remaining visual debt, validation results, browser checks,
final git status, ahead/behind count, and commit SHA.
