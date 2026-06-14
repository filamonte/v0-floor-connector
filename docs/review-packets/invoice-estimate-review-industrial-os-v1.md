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

Inspected with Figma MCP:

- `28:4` - `APPROVED / Dashboard / Desktop`
- `28:8` - `APPROVED / Opportunity-adjacent Sales Manager / Desktop`
- `28:20` - `APPROVED / Dashboard / Mobile`

No direct Invoice Review or Estimate Review frame exists in the inspected
board. This stream adapts the approved command-center review pattern, compact
metric strips, hard-border panels, action-first mobile order, and blue
`#005EB8` primary/active treatment to existing invoice and estimate review
routes.

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

Implemented target pages:

- `/invoices/[invoiceId]`
- `/estimates/[estimateId]`

Files changed:

- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/estimates/[estimateId]/page.tsx`
- `docs/review-packets/invoice-estimate-review-industrial-os-v1.md`
- `docs/current-state.md`
- `docs/chat-handoff.md`

Invoice Review improvements:

- Added an `invoice-review-command` section near the top of Invoice Workspace
  using existing invoice status, balance due, payment evidence, revision count,
  document readiness, online payment readiness, line item count, and owning
  workspace links.
- The new review command summarizes the next review move before the existing
  workflow bar, state summary, readiness, line-item, payment, provider send,
  editing, work-item, schedule, connected-record, communication, and revision
  sections.
- Primary review handoff uses blue `#005EB8` while existing invoice forms,
  sends, payment recording, Payment Trail, and editing actions remain on their
  current server-action paths.

Estimate Review improvements:

- Added an `estimate-review-command` section near the top of Estimate Workspace
  using existing proposal status, total, line item count, revision count,
  document readiness, contract handoff readiness, downstream record counts, and
  estimate work handoff item counts.
- The new review command clarifies proposal review, pricing, handoff readiness,
  downstream ownership, and next review move before the existing workflow,
  readiness, customer-facing proposal body, workflow actions, work items,
  connected records, schedule handoff, communication, and revision sections.
- Primary review handoff uses blue `#005EB8` while estimate send, manual
  decision, approval orchestration, role-slot, work-item, and downstream
  contract/invoice behavior remain unchanged.

Data sources used:

- Existing invoice, payment, payment event, document readiness, revision,
  customer, project, job/schedule, work-item, and delivery state already loaded
  by Invoice Workspace.
- Existing estimate, proposal line item, document readiness, customer event,
  revision, contract handoff, downstream contract/job/invoice, customer,
  project, schedule, work-item, and delivery state already loaded by Estimate
  Workspace.

Production safety and no-silo confirmation:

- No schema, migration, route, loader, server action, auth, tenant isolation,
  portal visibility, payment logic, invoice status, payment events, financial
  math, estimate pricing, approval logic, contract readiness, revision lineage,
  provider behavior, storage, or canonical workflow behavior changed.
- No fake invoice status, fake payment state, fake review status, fake approval
  state, fake totals, fake revision history, fake readiness warning, fake AI
  summary, fake queue, duplicate invoice model, duplicate payment model,
  duplicate estimate/proposal model, or duplicate visual-only record was added.

Mobile behavior:

- The new command panels stack into single-column review lanes at narrow
  widths.
- Action and ownership context appear before the heavier document, line-item,
  payment, workflow-action, work-item, and connected-record sections.

Figma deviations:

- The approved Figma board does not include direct Invoice Review or Estimate
  Review frames, so this stream adapts the closest approved dashboard,
  dashboard-mobile, and sales-manager command patterns.
- Existing app shell, route structure, forms, server-action placement, and
  business sections were preserved where changing them would imply broader IA
  or workflow ownership work.

Remaining visual debt:

- Portal estimate/invoice customer review routes still use their existing
  customer-safe review composition.
- A future approved stream can normalize Contract and Change Order review
  surfaces to the same command pattern.

Focused validation completed:

- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd --filter @floorconnector/ui test`
- `git diff --check`

Full validation and browser checks are recorded in the pull request and
closeout message for this stream.

Browser checks completed at `1366px` and `390px` against the local dev server:

- `/invoices`
- `/invoices/c3b636bf-78e7-40a8-ad32-31f4568b961f` with
  `#invoice-review-command`
- `/estimates/f0fac6c8-0769-4962-9a7a-09f2f7f827c8` with
  `#estimate-review-command`
- `/financials`
- `/dashboard`
- `/projects`
- `/projects/fe0ba4e8-97c2-4765-9259-c6de6344d82c`
- `/leads`
- `/leads/1b441af7-2ef0-491c-8a52-dc1ed32660d3`
- `/settings`
- `/portal`
- `/schedule`
- `/dashboard?capture=1#universal-capture`

The browser matrix returned HTTP 200 for every route, found the new Invoice and
Estimate review-command anchors, confirmed money totals rendered on the detail
routes, confirmed Universal Capture opened, and found no ChunkLoadError,
application error text, page errors, console errors, failed requests, favicon
errors, horizontal overflow, login redirect regression, organization-context
regression, or portal customer-safety regression.
