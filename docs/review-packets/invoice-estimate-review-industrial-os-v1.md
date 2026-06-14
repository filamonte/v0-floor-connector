# Invoice Estimate Review Industrial OS V1

Status: Active
Date: 2026-06-14
Branch: `stream/invoice-estimate-review-industrial-os-v1`
Worktree: `C:\FC-worktrees\invoice-estimate-review-industrial-os-v1`
Base: `origin/main` at setup

## Purpose

Refactor Invoice detail/review and Estimate Review toward Industrial OS review
surfaces.

## Scope

- invoice detail route(s)
- invoice review UI/components
- estimate review route/components where safe
- proposal/review panels if directly used
- this review packet

## Product Intent

Invoice/Estimate Review should answer what is being reviewed, what is ready to
send/approve/pay, what is missing or blocked, what changed since last revision,
and what action should happen next.

## Forbidden Scope

Do not change invoice/payment/estimate/contract business logic. Do not change
amounts, totals, statuses, payment rules, signature rules, revision lineage,
readiness gates, schema, migrations, routes, auth/tenant behavior, provider
behavior, or portal access.

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing invoice, payment, estimate, proposal/review, customer, project, and
readiness/document-review read models only.

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
pnpm.cmd wave:status
```

Browser checks at `1366px` and `390px`: `/invoices`, one invoice detail,
estimate review/detail route if it exists, `/dashboard`, `/projects`, one
Project Workspace, `/leads`, one Opportunity Workspace, `/settings`, `/portal`,
`/schedule`, and `/dashboard?capture=1#universal-capture`.

## Completion Notes

Figma frames inspected, target pages, files changed, data sources used, visual
improvements, mobile behavior, deviations from Figma, no-data-silo
confirmation, production safety confirmation, remaining visual debt, browser
checks, and validation results are pending implementation.
