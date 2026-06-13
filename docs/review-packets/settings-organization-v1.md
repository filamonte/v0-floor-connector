# Settings Organization V1

Status: Setup created
Date: 2026-06-13
Branch: `stream/settings-organization-v1`
Worktree: `C:\FC-worktrees\settings-organization-v1`
Base: `origin/main` at `ddf9e2bd`

## Purpose

Make Settings clearer, lighter, and better organized without changing settings
routes, settings actions, persistence contracts, platform policy, or tenant
configuration ownership.

## Scope

- `/settings`
- `/settings/organization`
- Settings overview cards.
- Grouping into Company Controls, Workflow Defaults, Sales / Estimate,
  Financial, Templates, Users / Access, and Portal / Admin boundaries.

## Forbidden Scope

No schema, migrations, route/action changes, settings persistence changes,
platform policy changes, duplicate settings model, fake health score, fake KPI,
auth/tenant changes, provider/billing mutation, payment/signature/scheduling
logic changes, or portal/admin guard changes.

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

Existing Settings and organization data/actions only. Configuration grouping is
presentation and routing clarity, not new settings state.

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

Browser checks: `/settings`, `/settings/organization`, `/dashboard`, `/leads`,
`/projects`, `/portal`, and `/dashboard?capture=1#universal-capture` at
`1366px` and `390px`.

## Completion Notes

To be completed by the stream owner: files changed, Figma frames used, visual
improvements, deviations from Figma, no-data-silo confirmation, production
safety confirmation, remaining visual debt, validation results, browser checks,
final git status, ahead/behind count, and commit SHA.
