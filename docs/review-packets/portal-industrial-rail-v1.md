# Portal Industrial Rail V1

Status: Setup created
Date: 2026-06-13
Branch: `stream/portal-industrial-rail-v1`
Worktree: `C:\FC-worktrees\portal-industrial-rail-v1`
Base: `origin/main` at `ddf9e2bd`

## Purpose

Move the customer portal closer to the approved portal frame while preserving
customer-safe boundaries and existing canonical project, estimate, contract,
invoice, signature, and payment records.

## Scope

- `/portal`
- Customer portal review UI.
- Portal project detail if present and safe.
- Dark/light rail alignment only when customer-safe and responsive.

## Forbidden Scope

No internal-only data exposure, schema, migrations, route renames, portal grant
changes, auth changes, tenant changes, payment/signature behavior changes,
provider behavior changes, duplicate portal records, portal-owned project
state, fake statuses, fake KPIs, fake queues, or customer self-service claims
not backed by current implementation.

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

Existing portal loaders, portal grants, project access, customer-safe record
links, and review actions only. The portal remains a surface over canonical
records, not a separate customer project system.

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

Browser checks: `/portal`, any touched portal project/review routes,
`/dashboard`, `/settings`, `/leads`, `/projects`, and
`/dashboard?capture=1#universal-capture` at `1366px` and `390px`. Portal checks
must verify customer-safe content boundaries.

## Completion Notes

To be completed by the stream owner: files changed, Figma frames used, visual
improvements, deviations from Figma, no-data-silo confirmation, production
safety confirmation, remaining visual debt, validation results, browser checks,
final git status, ahead/behind count, and commit SHA.
