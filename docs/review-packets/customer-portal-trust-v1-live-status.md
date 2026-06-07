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
| Latest main commit   | `49ef8a6301f9c943b1ea7383dd0403b2ad508189` |

No feature work, schema work, migrations, PRs, merges, or next-wave work were
performed for this status packet.

## Wave Status

`customer-portal-trust-v1` has completed all three implementation stream
commits locally. Verification has not started. Verification is now ready to
start as the next stream, with merge-overlap awareness required.

## Stream Status Table

| Stream                            | Worktree exists | Branch                                   | Clean/dirty | Ahead/behind vs `origin/main` | Latest commit                              | Implementation complete | Verification start      |
| --------------------------------- | --------------- | ---------------------------------------- | ----------- | ----------------------------- | ------------------------------------------ | ----------------------- | ----------------------- |
| `portal-project-clarity-v1`       | Yes             | `stream/portal-project-clarity-v1`       | Clean       | `1 / 0`                       | `6e2df75c23e8867452b09a80e4cb8279ab648fdd` | Yes                     | Implementation complete |
| `portal-financial-visibility-v1`  | Yes             | `stream/portal-financial-visibility-v1`  | Clean       | `1 / 0`                       | `e64af7ba2359aad0365bcb3e4fa3fc4e1f85ab54` | Yes                     | Implementation complete |
| `portal-communication-trust-v1`   | Yes             | `stream/portal-communication-trust-v1`   | Clean       | `1 / 0`                       | `56bf9ff62c7aa93bba267c4ba945f1e24fb79c6d` | Yes                     | Implementation complete |
| `verification-customer-portal-v1` | Yes             | `stream/verification-customer-portal-v1` | Clean       | `0 / 0`                       | `49ef8a6301f9c943b1ea7383dd0403b2ad508189` | Not applicable          | Ready to start now      |

## Implementation Completion Status

All three implementation streams reported completed local commits with clean
worktrees, required validation, and no schema or migration changes.

Verification should start next. It should inspect the three implementation
branches and explicitly handle overlapping files before any merge
recommendation.

## Commits By Stream

| Stream                            | Commit                                     | Message                                     |
| --------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `portal-project-clarity-v1`       | `6e2df75c23e8867452b09a80e4cb8279ab648fdd` | `feat: improve portal project clarity`      |
| `portal-financial-visibility-v1`  | `e64af7ba2359aad0365bcb3e4fa3fc4e1f85ab54` | `feat: improve portal financial visibility` |
| `portal-communication-trust-v1`   | `56bf9ff62c7aa93bba267c4ba945f1e24fb79c6d` | `feat: improve portal communication trust`  |
| `verification-customer-portal-v1` | `49ef8a6301f9c943b1ea7383dd0403b2ad508189` | `docs: approve customer portal trust wave`  |

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
- repo-local Prettier formatting after known Windows App Router path parsing issue
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

No verification validation has run yet. This is expected because verification
was queued until implementation commits existed.

## Blockers

No implementation-completion blocker is currently visible.

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

Verification is ready to start because all three implementation streams now
have local commits and clean worktrees.

Verification should not merge anything. It should validate:

- customer-safe portal boundaries
- canonical project, invoice, payment, and communication records
- no duplicate models
- no schema or migration drift
- overlap risk in `apps/web/app/(portal)/portal/projects/[projectId]/page.tsx`
  and `docs/current-state.md`
- no conflict with the dirty out-of-scope `project-next-actions` worktree

## Next Recommended Action

Start `stream/verification-customer-portal-v1` in
`C:\FC-worktrees\verification-customer-portal-v1`.

The verification prompt should explicitly inspect all three implementation
commits, preserve the dirty `project-next-actions` boundary, and report merge
order or conflict risk before any integration recommendation.
