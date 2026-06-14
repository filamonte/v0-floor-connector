# Communications Financial Command V1

Status: Active
Date: 2026-06-14
Branch: `stream/communications-financial-command-v1`
Worktree: `C:\FC-worktrees\communications-financial-command-v1`
Base: `origin/main` at setup

## Purpose

Refactor Communications and Financials command surfaces toward Industrial OS
command-center organization.

## Scope

- `/communications` if present
- communications continuity panels if safe
- `/financials`
- financial command center lanes/cards
- this review packet

## Product Intent

Communications should answer what threads need response, which
project/customer they relate to, and what action or follow-up is needed.

Financials should answer what money needs attention, what is overdue, what is
ready to invoice, what payment exceptions exist, and what should be opened in
the owning invoice/payment workspace.

## Forbidden Scope

No communications provider behavior, customer-facing sends, financial math,
invoice/payment state changes, duplicate inbox/billing/payment models, schema,
migrations, route renames, fake records, fake statuses, fake KPIs, fake
queues/counts, auth/tenant changes, or provider mutations.

## Figma References

Use `https://www.figma.com/design/N0tVE3uKWpHZc4dlF6ytgn` through Figma MCP
where relevant. Record exact frames inspected during implementation.

## Data Sources

Existing communications, invoice, payment, project, customer, Payment Trail,
AR, and financial read models only.

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

Browser checks at `1366px` and `390px`: `/communications` if present,
`/financials`, `/invoices`, `/dashboard`, `/projects`, one Project Workspace,
`/leads`, one Opportunity Workspace, `/settings`, `/portal`, `/schedule`, and
`/dashboard?capture=1#universal-capture`.

## Completion Notes

Figma frames inspected, target pages, files changed, data sources used, visual
improvements, mobile behavior, deviations from Figma, no-data-silo
confirmation, production safety confirmation, remaining visual debt, browser
checks, and validation results are pending implementation.
