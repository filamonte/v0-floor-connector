# Customer Portal Trust V1 Live Status

Status date: 2026-06-07

Coordinator role: FloorConnector Wave Status Coordinator

Scope: status collection only for `customer-portal-trust-v1`.

## Main Checkout

| Check                | Result                                     |
| -------------------- | ------------------------------------------ |
| Worktree             | `C:\FloorConnector`                        |
| Branch               | `main`                                     |
| Status               | Clean                                      |
| `HEAD...origin/main` | `0 ahead / 0 behind`                       |
| Latest main commit   | `8f17b99927f24f9225276900cf7b84722406a8ce` |

No feature work, schema work, migrations, PRs, merges, or next-wave work were
performed for this status packet.

## Wave Status

`customer-portal-trust-v1` has completed all three implementation stream
commits locally. The implementation streams and verification stream were
rebased onto current `origin/main` and revalidated. Verification is complete
and the wave is ready for Jeff's controlled merge decision, with merge-overlap
awareness required.

## Stream Status Table

| Stream                            | Worktree exists | Branch                                   | Clean/dirty | Ahead/behind vs `origin/main` | Latest commit                              | Implementation complete | Verification start |
| --------------------------------- | --------------- | ---------------------------------------- | ----------- | ----------------------------- | ------------------------------------------ | ----------------------- | ------------------ |
| `portal-project-clarity-v1`       | Yes             | `stream/portal-project-clarity-v1`       | Clean       | `1 / 0`                       | `59ed0e51e3e4c35923490a1e6cde5e244056eff7` | Yes                     | Complete           |
| `portal-financial-visibility-v1`  | Yes             | `stream/portal-financial-visibility-v1`  | Clean       | `1 / 0`                       | `dd69983cb7599b3dcadddc48554c0ce19bc41814` | Yes                     | Complete           |
| `portal-communication-trust-v1`   | Yes             | `stream/portal-communication-trust-v1`   | Clean       | `1 / 0`                       | `fb1692ae4fa0dbe1d6312b4c63ed88f51737fed1` | Yes                     | Complete           |
| `verification-customer-portal-v1` | Yes             | `stream/verification-customer-portal-v1` | Clean       | `2 / 0`                       | `ca5554bd4880150e1f3b56228fb6a52fb3e4e26e` | Not applicable          | Complete           |

## Implementation Completion Status

All three implementation streams have completed local commits with clean
worktrees, required validation, and no schema or migration changes.

Verification is complete and records the rebased implementation commit heads.
The wave still needs controlled merge handling for overlapping files.

## Commits By Stream

| Stream                            | Commit                                     | Message                                           |
| --------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `portal-project-clarity-v1`       | `59ed0e51e3e4c35923490a1e6cde5e244056eff7` | `feat: improve portal project clarity`            |
| `portal-financial-visibility-v1`  | `dd69983cb7599b3dcadddc48554c0ce19bc41814` | `feat: improve portal financial visibility`       |
| `portal-communication-trust-v1`   | `fb1692ae4fa0dbe1d6312b4c63ed88f51737fed1` | `feat: improve portal communication trust`        |
| `verification-customer-portal-v1` | `ca5554bd4880150e1f3b56228fb6a52fb3e4e26e` | `test: update customer portal trust verification` |

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

- No changes yet. The worktree remains at the approval baseline.

## Validations By Stream

### `portal-project-clarity-v1`

Revalidated passing after rebase:

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

Revalidated passing after rebase:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test ./lib/portal/financial-visibility.test.ts`
- repo-local Prettier formatting after known Windows App Router path parsing issue
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `git diff --cached --check`

### `portal-communication-trust-v1`

Revalidated passing after rebase:

- `pnpm.cmd worktree:doctor` with expected no-upstream warning
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/communications/portal-project-summary.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`
- `pnpm.cmd e2e:portal` with `39 passed, 4 skipped`
- `git diff --cached --check`

### `verification-customer-portal-v1`

Revalidated passing after rebase and evidence update:

- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/customer-portal-trust.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/operational-ownership.test.ts`
- `pnpm.cmd --filter @floorconnector/web exec tsx --test lib/verification/golden-workflow-checks.test.ts`
- `pnpm.cmd --filter @floorconnector/web typecheck`
- `pnpm.cmd --filter @floorconnector/web lint`
- `pnpm.cmd fc:preflight:fast`
- `git diff --check`

## Blockers

No implementation-completion or verification-completion blocker is currently
visible.

Merge and verification coordination need human attention because several streams
touch the same files:

- `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx` is touched by
  all three implementation streams.
- `docs/current-state.md` is touched by the financial and communication streams.

## Dirty And Out-Of-Scope Worktrees

`C:\FC-worktrees\project-next-actions` remains dirty and was not touched.

Dirty files reported there:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/related-conversations-card.tsx`
- `apps/web/lib/communications/record-continuity.test.ts`
- `apps/web/lib/communications/record-continuity.ts`
- `docs/current-state.md`

Overlap with this wave:

- `docs/current-state.md` overlaps with
  `portal-financial-visibility-v1` and `portal-communication-trust-v1`.
- No inspected implementation stream touched the dirty out-of-scope app route
  files under `apps/web/app/(app)/...`.
- No inspected implementation stream touched
  `apps/web/components/related-conversations-card.tsx`.
- No inspected implementation stream touched
  `apps/web/lib/communications/record-continuity.ts` or its test.

## Verification Readiness

Verification is complete because all three implementation streams have rebased
local commits and clean worktrees.

The completed verification did not merge anything. It validated:

- customer-safe portal boundaries
- canonical project, invoice, payment, and communication records
- no duplicate models
- no schema or migration drift
- overlap risk in `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
  and `docs/current-state.md`
- no conflict with the dirty out-of-scope `project-next-actions` worktree

## Overlap Reconciliation

All streams rebased cleanly onto current `origin/main`. Pairwise merge
simulation still reports changed-in-both overlap in
`apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`. The overlap is
additive and should be resolved during the controlled merge by preserving the
project clarity, billing visibility, and communication trust sections.

Financial visibility and communication trust also both touch
`docs/current-state.md`. Preserve both implemented-truth bullets in the
controlled merge checkout. Do not use or modify
`C:\FC-worktrees\project-next-actions`.

## Next Recommended Action

Jeff can approve controlled merges in the recorded order:

1. `portal-project-clarity-v1`
2. `portal-financial-visibility-v1`
3. `portal-communication-trust-v1`
4. `verification-customer-portal-v1`

Manual conflict resolution should be expected for the portal project page and
`docs/current-state.md`.
