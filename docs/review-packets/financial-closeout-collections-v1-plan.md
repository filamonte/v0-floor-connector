# Financial Closeout Collections V1 Plan

Status: Approved / Not Started
Doc Type: Review Packet
Approval date: 2026-06-07

Wave name: `financial-closeout-collections-v1`.

Jeff explicitly approves this wave for stream and worktree creation. This packet
does not start implementation, approve schema or migration work, approve
provider changes, open PRs, merge branches, or approve another wave.

## Rationale

The commercial chain, execution chain, closeout chain, and customer visibility
chain have all been strengthened. The next highest-leverage contractor pain
point is turning completed field work into cash:

```text
Field Complete -> Ready To Bill -> Invoice -> Payment -> Collection -> Cash
```

This wave should improve contractor cash-flow visibility and collection action
without replacing accounting, forking invoice or payment truth, or creating a
duplicate financial model.

## Guiding Principles

- Dashboard prioritizes.
- Project diagnoses.
- Field executes.
- Financials owns billing and collection action.
- Communications owns conversation action.
- Portal remains customer-safe.
- Settings owns configuration.
- No duplicate ownership.
- No duplicate invoice model.
- No duplicate payment model.
- No accounting replacement.
- No schema or migration work unless separately approved.

## Approved Stream Structure

| Stream                               | Branch                                      | Worktree                                             | Ownership area                    | Status                 |
| ------------------------------------ | ------------------------------------------- | ---------------------------------------------------- | --------------------------------- | ---------------------- |
| `billing-readiness-command-v1`       | `stream/billing-readiness-command-v1`       | `C:\FC-worktrees\billing-readiness-command-v1`       | Billing readiness                 | Approved / Not Started |
| `collections-priority-v1`            | `stream/collections-priority-v1`            | `C:\FC-worktrees\collections-priority-v1`            | Collections action prioritization | Approved / Not Started |
| `payment-continuity-v1`              | `stream/payment-continuity-v1`              | `C:\FC-worktrees\payment-continuity-v1`              | Payment continuity                | Approved / Not Started |
| `verification-financial-closeout-v1` | `stream/verification-financial-closeout-v1` | `C:\FC-worktrees\verification-financial-closeout-v1` | Financial verification            | Approved / Not Started |

Branches and worktrees were created from the verified current `main` approval
baseline.

## Stream Descriptions

### `billing-readiness-command-v1`

Mission: make it clearer when work is ready to invoice.

Future implementation may improve billing readiness visibility, missing billing
prerequisites, closeout-to-invoice continuity, invoice readiness guidance, and
project-to-financial handoff clarity.

Non-goals: no duplicate invoice model, accounting replacement, new billing
schema, migrations, payment mutation, or provider work.

### `collections-priority-v1`

Mission: help contractors understand where collection effort should be focused.

Future implementation may improve overdue visibility, collection priority
signals, aging awareness, collection readiness guidance, and AR action
visibility.

Non-goals: no collections automation, accounting replacement, duplicate payment
state, payment retry automation, schema changes, or migrations.

### `payment-continuity-v1`

Mission: improve visibility from invoice through payment events and payment
outcomes.

Future implementation may improve payment event visibility, payment status
clarity, payment failure continuity, partial payment understanding, and
invoice-payment continuity.

Non-goals: no gateway replacement, duplicate payment model, provider changes,
payment math changes, schema changes, or migrations.

### `verification-financial-closeout-v1`

Mission: protect canonical financial ownership and merge readiness after the
three implementation streams complete.

Verification protects canonical invoices, canonical payments, canonical payment
events, Financials ownership boundaries, no duplicate financial models, no
accounting replacement, and no schema or migration drift.

Non-goals: no feature work, UI redesign, schema changes, migrations, or
loosening existing tests.

## Ownership Map

| Area                       | Owner stream                         | Boundary                                                                 |
| -------------------------- | ------------------------------------ | ------------------------------------------------------------------------ |
| Billing readiness          | `billing-readiness-command-v1`       | Readiness visibility and handoff clarity only; no invoice model fork.    |
| Collections prioritization | `collections-priority-v1`            | AR action visibility and priority signals only; no automation or ledger. |
| Payment continuity         | `payment-continuity-v1`              | Payment-event and outcome visibility only; no provider/payment rewrite.  |
| Verification               | `verification-financial-closeout-v1` | Independent validation after implementation streams complete.            |
| Communications handoff     | Existing Communications ownership    | Conversation action stays in Communications; financial streams may link. |
| Project diagnosis          | Existing Project Workspace ownership | Project can diagnose readiness, but Financials owns billing action.      |
| Settings                   | Existing Settings ownership          | Configuration stays in Settings, not in financial action surfaces.       |

## Dependency Map

- `billing-readiness-command-v1` depends on current Project, Field, Job, Daily
  Log, invoice, closeout, and financial readiness truth on `main`.
- `collections-priority-v1` depends on canonical invoices, payments, payment
  events, AR read models, and any billing-readiness handoff labels that land
  first.
- `payment-continuity-v1` depends on canonical invoices, payments, payment
  events, Invoice Workspace, AR visibility, and collections priority context.
- `verification-financial-closeout-v1` depends on all three implementation
  streams landing first and must run last.

Shared hotspots:

- `apps/web/lib/financials/*`
- `/financials` and `/financials/accounts-receivable`
- Invoice Workspace payment/balance visibility
- Project financial continuity and closeout handoff surfaces
- `docs/current-state.md` only after implemented behavior changes

## Non-Goals

- No implementation from this approval packet.
- No schema changes or migrations.
- No accounting replacement.
- No duplicate invoice, payment, ledger, collection-task, or AR model.
- No payment provider changes, webhook changes, gateway replacement, refund,
  retry, dispute, or reconciliation mutation.
- No autonomous collections automation.
- No customer-facing sends from Financials; communication action remains
  review-first and owned by Communications.
- No portal financial mutation or portal-only billing truth.
- No Settings mutation from financial action surfaces.
- No PRs, merges, or next-wave continuation.

## Validation Plan

Every implementation stream should start with:

```powershell
git fetch origin
git status --short --branch
git rev-list --left-right --count HEAD...origin/main
pnpm.cmd worktree:doctor
pnpm.cmd tooling:baseline -CommandsOnly
```

Expected implementation validation unless a later prompt narrows scope:

```powershell
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
git diff --check
git diff --cached --check
```

Financial helper, read-model, payment-state, or lineage changes require
targeted tests before merge recommendation.

## Verification Plan

`verification-financial-closeout-v1` runs after the three implementation streams
complete. It should validate:

- canonical invoices remain the financial source of truth;
- canonical payments remain the payment source of truth;
- immutable payment events remain event evidence, not a replacement payment
  model;
- billing readiness does not create a duplicate closeout or invoice workflow;
- collection prioritization stays read-model/action guidance, not automation;
- payment continuity does not mutate provider, payment, or invoice state;
- Project, Dashboard, Communications, Portal, and Settings ownership boundaries
  are preserved;
- no schema or migration drift exists.

## Tooling Requirements

Preflight completed on `main` before stream creation:

- `git status`: clean
- Branch: `main`
- `git fetch origin`: complete
- Ahead / behind `origin/main`: `0 / 0`
- `pnpm.cmd worktree:doctor`: passed
- `pnpm.cmd tooling:baseline`: passed, with optional Vercel CLI absent
- `pnpm.cmd tooling:baseline -CommandsOnly`: passed

Standard command list:

```powershell
pnpm.cmd worktree:doctor
pnpm.cmd devtools:link
pnpm.cmd --filter @floorconnector/web typecheck
pnpm.cmd --filter @floorconnector/web lint
pnpm.cmd fc:preflight:fast
```

## Merge Order

1. `billing-readiness-command-v1`
2. `collections-priority-v1`
3. `payment-continuity-v1`
4. `verification-financial-closeout-v1`

Verification must merge last after the implementation streams have completed
and recorded their evidence.

## Jeff Approval Gate

Jeff explicitly approves `financial-closeout-collections-v1` for branch and
worktree creation only.

Implementation start still requires a later explicit start command. This
approval does not approve feature work, schema or migration work, provider
changes, PRs, merges, or another wave.
