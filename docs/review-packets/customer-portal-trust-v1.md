# Customer Portal Trust V1 Review Packet

Status: Review packet; Jeff decision pending.

Date: 2026-06-07

Scope: merge-readiness review for `customer-portal-trust-v1`.

## Executive Summary

`customer-portal-trust-v1` completed three implementation streams and one
verification stream. The wave improves customer-safe project clarity, financial
visibility, and communication confidence in the portal while keeping Project,
Financials, and Communications as the contractor-side owning workspaces.

No reviewed stream changes schemas or migrations. No reviewed stream introduces
duplicate project, invoice, payment, communication, customer-action, or
portal-owned workflow models.

The wave is safe for Jeff to approve for controlled merge after each
implementation stream is rebased onto current `origin/main` and the known
overlaps are resolved deliberately. Do not merge without reviewing the shared
portal project page and `docs/current-state.md` conflict areas.

## Streams Completed

| Stream                            | Branch                                   | Worktree                                          | Status         | Readiness          |
| --------------------------------- | ---------------------------------------- | ------------------------------------------------- | -------------- | ------------------ |
| `portal-project-clarity-v1`       | `stream/portal-project-clarity-v1`       | `C:\FC-worktrees\portal-project-clarity-v1`       | Clean, `1 / 1` | Ready after rebase |
| `portal-financial-visibility-v1`  | `stream/portal-financial-visibility-v1`  | `C:\FC-worktrees\portal-financial-visibility-v1`  | Clean, `1 / 1` | Ready after rebase |
| `portal-communication-trust-v1`   | `stream/portal-communication-trust-v1`   | `C:\FC-worktrees\portal-communication-trust-v1`   | Clean, `1 / 1` | Ready after rebase |
| `verification-customer-portal-v1` | `stream/verification-customer-portal-v1` | `C:\FC-worktrees\verification-customer-portal-v1` | Clean, `1 / 0` | Ready last         |

The three implementation streams are behind `origin/main` by one commit because
the live status packet landed on `main` after the implementation branches were
created. This review did not rebase them.

## Commits By Stream

| Stream                            | Commit                                     | Message                                     |
| --------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `portal-project-clarity-v1`       | `6e2df75c23e8867452b09a80e4cb8279ab648fdd` | `feat: improve portal project clarity`      |
| `portal-financial-visibility-v1`  | `e64af7ba2359aad0365bcb3e4fa3fc4e1f85ab54` | `feat: improve portal financial visibility` |
| `portal-communication-trust-v1`   | `56bf9ff62c7aa93bba267c4ba945f1e24fb79c6d` | `feat: improve portal communication trust`  |
| `verification-customer-portal-v1` | `28628902c7dab2d2e37e5c0917f191729bd75f78` | `test: protect customer portal trust`       |

## Files Changed By Stream

### `portal-project-clarity-v1`

- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/components/portal-project-summary-panel.tsx`
- `apps/web/lib/portal/project-status-window.test.ts`
- `apps/web/lib/portal/project-status-window.ts`

### `portal-financial-visibility-v1`

- `apps/web/app/(portal)/portal/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/lib/portal/financial-visibility.test.ts`
- `apps/web/lib/portal/financial-visibility.ts`
- `docs/current-state.md`

### `portal-communication-trust-v1`

- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- `apps/web/lib/communications/portal-project-summary.test.ts`
- `apps/web/lib/communications/portal-project-summary.ts`
- `docs/current-state.md`

### `verification-customer-portal-v1`

- `apps/web/lib/verification/customer-portal-trust.test.ts`
- `apps/web/lib/verification/customer-portal-trust.ts`

## Capabilities Added

### Customer-Safe Project Clarity

`portal-project-clarity-v1` adds a portal project status window over existing
shared project, estimate, contract, change-order, invoice, and job context. It
summarizes current stage, customer action needs, shared records, completed
items, and truthful empty states without adding portal-owned project state.

### Customer-Safe Financial Visibility

`portal-financial-visibility-v1` adds project-level billing visibility and
invoice-level financial clarity over canonical invoices, payments, and payment
events. It explains balances, payment history, latest activity, billing
readiness, and next steps without changing invoice math, payment state, or
provider behavior.

### Customer-Safe Communication Trust

`portal-communication-trust-v1` expands the portal project communication
section with customer-visible conversation status, reply context, customer
action counts, contractor-review indicators, and explicit customer-safe
boundaries. It stays on canonical `communication_threads` and
`communication_messages`.

### Verification Coverage

`verification-customer-portal-v1` adds pure verification helpers and tests for
the wave. The checks protect customer-safe portal boundaries, canonical record
ownership, duplicate-model prevention, schema/migration absence, autonomous
customer action absence, implementation overlap, and dirty out-of-scope
worktree overlap.

## Workflow Improvements

The wave strengthens this customer-facing trust flow:

```text
Customer Portal Trust
  -> customer-safe project clarity
  -> customer-safe financial visibility
  -> customer-safe communication context
```

The implementation remains connected to the canonical lifecycle:

```text
opportunity -> customer -> project -> estimate -> contract -> change order -> job -> invoice -> payment
```

The portal reads and explains the shared project chain. It does not become a
workflow engine, separate customer dashboard, financial system, or
communication source of truth.

## User-Facing Changes

- Customers get clearer project status and project-stage language.
- Customers can see shared estimate, contract, change-order, invoice, and
  schedule/work cues in one customer-safe project context.
- Customers get clearer invoice balance, payment history, latest activity, and
  payment-readiness explanations.
- Customers get clearer communication history, reply status, and trust
  indicators for customer-visible project conversations.
- Customer-facing copy avoids contractor-only readiness internals, field
  details, provider metadata, and internal notes.

## Docs Updated

Implementation streams update `docs/current-state.md` in the financial and
communication streams. Those edits are appropriate as implemented-truth updates
after merge, but they require manual conflict resolution because both streams
touch the same doc and `C:\FC-worktrees\project-next-actions` also has a dirty
local edit to `docs/current-state.md`.

This review packet adds:

- `docs/review-packets/customer-portal-trust-v1.md`

## Validation Results

### `portal-project-clarity-v1`

Reported passing:

- `pnpm.cmd worktree:doctor` with expected no-upstream warning
- `pnpm.cmd tooling:baseline -CommandsOnly`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/portal/project-status-window.test.ts`
- repo-local Prettier formatting
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `git diff --cached --check`

### `portal-financial-visibility-v1`

Reported passing:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test ./lib/portal/financial-visibility.test.ts`
- repo-local Prettier formatting
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `git diff --cached --check`

### `portal-communication-trust-v1`

Reported passing:

- `pnpm.cmd worktree:doctor` with expected no-upstream warning
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/portal-project-summary.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `pnpm.cmd e2e:portal` with `39 passed, 4 skipped`
- `git diff --cached --check`

### `verification-customer-portal-v1`

Reported passing:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/customer-portal-trust.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/operational-ownership.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/golden-workflow-checks.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `git diff --cached --check`

### Review Packet Validation

To complete this packet, run:

- `pnpm.cmd exec prettier --check docs/review-packets/customer-portal-trust-v1.md`
- `git diff --check`
- `git diff --cached --check`

## Governance Review

- The wave follows the approved stream set and merge order.
- The implementation streams are bounded to customer-safe portal clarity,
  financial visibility, and communication trust.
- Verification landed after implementation evidence existed.
- No PRs, merges, schema changes, migrations, provider sends, autonomous
  messaging, payment mutation, financial mutation, next-wave work, or
  destructive cleanup are approved by this packet.
- Jeff approval is not granted in this packet; this packet is the decision
  input.

## Ownership Review

| Ownership question                                                        | Finding |
| ------------------------------------------------------------------------- | ------- |
| Portal presents customer-safe visibility only                             | Pass    |
| Portal does not own operational state                                     | Pass    |
| Portal does not create duplicate project status                           | Pass    |
| Portal does not create duplicate invoice/payment state                    | Pass    |
| Portal does not create duplicate communication state                      | Pass    |
| Portal does not expose internal-only readiness/field/financial complexity | Pass    |
| Project remains contractor diagnostic owner                               | Pass    |
| Financials remains billing/payment action owner                           | Pass    |
| Communications remains conversation action owner                          | Pass    |
| Settings owns configuration                                               | Pass    |
| No schema or migration changes                                            | Pass    |

No ownership drift was found.

## Duplicate Model Review

| Duplicate model risk            | Finding   |
| ------------------------------- | --------- |
| Duplicate project status model  | Not found |
| Portal project model            | Not found |
| Duplicate invoice model         | Not found |
| Duplicate payment model         | Not found |
| Duplicate communication model   | Not found |
| Duplicate customer action model | Not found |
| Portal-owned workflow model     | Not found |

The new helpers are read-model and verification helpers over existing canonical
records. They do not add persistence models, schemas, migrations, or separate
portal-owned workflow state.

## Overlap / Merge Risk Review

### Hotspot Files

- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx` is touched by
  all three implementation streams.
- `docs/current-state.md` is touched by `portal-financial-visibility-v1` and
  `portal-communication-trust-v1`.

### Merge Simulation Findings

Direct merge simulation from current `origin/main` into each individual stream
showed no conflict for the individual streams.

Pairwise implementation merge simulation found changed-in-both conflicts:

- Project clarity vs financial visibility:
  `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- Project clarity vs communication trust:
  `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
- Financial visibility vs communication trust:
  `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
  and `docs/current-state.md`

Manual conflict resolution is likely during the combined merge. This is an
expected integration risk, not a correction blocker.

### Dirty Out-Of-Scope Worktree

`C:\FC-worktrees\project-next-actions` remains dirty and must not be touched.
Its dirty files are outside this wave except `docs/current-state.md`.

To avoid touching it:

- merge only from the approved customer portal trust stream worktrees or local
  branches
- do not use `project-next-actions` as a merge base, scratch worktree, or
  conflict-resolution location
- resolve `docs/current-state.md` in the controlled merge checkout only
- preserve `project-next-actions` dirty files exactly as they are

## Workflow Review

The reviewed wave keeps the portal connected to canonical workflow records:

- project clarity derives customer-safe status from shared project and linked
  estimate, contract, change-order, invoice, and job context
- financial visibility derives balances and payment history from canonical
  invoices, payments, and payment events
- communication trust derives history and reply state from canonical
  communication threads and messages
- portal action remains explicit customer review, signature, approval, reply, or
  payment follow-through on shared records

No reviewed stream introduces autonomous customer communication, financial
action, payment mutation, scheduling mutation, provider send, internal note
exposure, or portal-only state.

## Merge Order Recommendation

Recommended controlled merge order:

1. `portal-project-clarity-v1`
2. `portal-financial-visibility-v1`
3. `portal-communication-trust-v1`
4. `verification-customer-portal-v1`

Readiness by stream:

| Stream                            | Recommendation     | Reason                                                                                                                                        |
| --------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `portal-project-clarity-v1`       | Ready after rebase | Clean and expected commit present; behind `origin/main` by one commit.                                                                        |
| `portal-financial-visibility-v1`  | Ready after rebase | Clean and expected commit present; behind `origin/main` by one commit; likely project-page conflict after first merge.                        |
| `portal-communication-trust-v1`   | Ready after rebase | Clean and expected commit present; behind `origin/main` by one commit; likely project-page and `current-state` conflict after earlier merges. |
| `verification-customer-portal-v1` | Ready last         | Clean and expected verification commit present; lands after implementation streams.                                                           |

No stream should be deferred or corrected before merge based on this review.
Manual conflict resolution should preserve all three customer-facing portal
sections and both implemented-truth doc updates.

## Risks / Follow-Ups

- Resolve `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
  carefully so project clarity, billing visibility, and communication trust all
  survive together.
- Resolve `docs/current-state.md` with current/future truth separation intact.
- Re-run focused tests from each stream after the controlled merge.
- Re-run `pnpm.cmd --filter @floorconnector/web typecheck`,
  `pnpm.cmd --filter @floorconnector/web lint`, `pnpm.cmd fc:preflight:fast`,
  and `git diff --check` after merge.
- Keep `C:\FC-worktrees\project-next-actions` untouched until Jeff scopes it.

## Next Recommended Wave Options

No next wave is approved by this review packet. Options for Jeff review after
this wave:

- approve controlled merge of `customer-portal-trust-v1`
- request a correction pass on one stream if merge resolution exposes drift
- defer a stream if conflict resolution becomes too risky
- continue planning the next wave after merge and post-merge validation

Potential future wave directions, subject to separate approval:

- portal customer action refinement over existing review/sign/pay/reply paths
- project-centered closeout/customer evidence visibility with explicit
  customer-safe sharing rules
- communications provider-depth planning without autonomous sends
- financial/payment reconciliation depth without duplicate ledgers or payment
  state

## Jeff Decision Options

- Approve merge.
- Request correction.
- Defer stream.
- Continue to next wave.

This packet does not mark Jeff approval as granted.
