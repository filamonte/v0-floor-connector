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

Inspected with Figma MCP:

- `28:4` - `APPROVED / Dashboard / Desktop`
- `28:8` - `APPROVED / Opportunity-adjacent Sales Manager / Desktop`

No direct Communications or Financials frame exists in the inspected board.
This stream adapts the approved dashboard command-center density, hard-border
panel language, compact metric strips, action lanes, and blue `#005EB8`
primary/active treatment to the existing `/communications` and `/financials`
routes.

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

Implemented target pages:

- `/communications`
- `/financials`

Files changed:

- `apps/web/app/(app)/communications/page.tsx`
- `apps/web/app/(app)/financials/page.tsx`
- `docs/review-packets/communications-financial-command-v1.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Communications improvements:

- Reframed the opening summary into a four-card command strip for needs
  response, unread threads, finance context, and proof review using existing
  communications workspace summary values.
- Added a `communications-command-center` section that separates current
  customer/context signals, communication lanes, and the top attention item
  from supporting detail.
- Collapsed the heavier record-linked communication detail into a supporting
  disclosure so the first viewport starts with priority and ownership rather
  than a long operational inventory.
- Switched active queue/filter treatment to the approved blue `#005EB8`
  instead of the prior black active state.

Financials improvements:

- Reframed the opening summary into command cards for open receivables,
  overdue amount, ready-to-invoice count, and payment exceptions using the
  existing financial control, billing readiness, and payment trail values.
- Promoted cross-project finance action lanes into a compact
  `money-command-center` section near the top of the route.
- Removed the duplicate lower command-center presentation so the page has one
  clear command surface and then supporting financial workspaces.
- Switched primary command action treatment to blue `#005EB8`.

Data sources used:

- Existing communications thread, notification, workspace summary, proof, and
  record-link context already loaded by `/communications`.
- Existing invoices, payments, payment events, financial control, billing
  readiness, AR, payment trail, and financial workspace summaries already
  loaded by `/financials`.

Production safety and no-silo confirmation:

- No schema, migration, route, loader, server action, auth, tenant isolation,
  portal visibility, payment, invoice, payment event, storage, provider,
  communication send, or financial math changes.
- No fake records, fake KPIs, duplicate inbox, duplicate billing model,
  duplicate payment model, or local-only state was added.
- Communications still routes action back to canonical source records and
  owning workspaces; Financials still points users into invoice/payment/AR
  workspaces for mutation or review.

Mobile behavior:

- Command strips use responsive grids and retain compact hard-border panels.
- The new command sections stack into single-column lanes on narrow screens.
- Supporting Communications detail is collapsed behind a disclosure to reduce
  first-viewport density on mobile.

Figma deviations:

- The approved Figma board does not include direct Communications or
  Financials frames, so this stream applies the closest approved dashboard and
  sales-manager command patterns to the existing route structures.
- The global app shell, route layout, and existing page data order were
  preserved where changing them would imply broader IA or workflow scope.

Remaining visual debt:

- Invoice detail and downstream AR/payment workspaces can receive the same
  command-density treatment in a later approved stream.
- Communications thread detail could use a future focused composition pass once
  a dedicated communication workspace frame exists.

Validation completed:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/ui test`
- `pnpm.cmd fc:preflight:fast`
- `pnpm.cmd e2e:smoke:auth`
- `git diff --check`

Browser checks completed at `1366px` and `390px` against the local dev server:

- `/financials` with `#money-command-center`
- `/communications` with `#communications-command-center`
- `/invoices`
- `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f`
- `/dashboard`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- `/leads`
- `/leads/1b441af7-2ef0-491c-8a52-dc1ed32660d3`
- `/settings`
- `/portal`
- `/schedule`
- `/dashboard?capture=1#universal-capture`

The browser matrix returned HTTP 200 for every route, found the new
Communications and Financials command-center anchors, and found no application
error text, page errors, console errors, failed requests, or horizontal
overflow.
