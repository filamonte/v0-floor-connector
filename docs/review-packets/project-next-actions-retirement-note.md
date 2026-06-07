# Project Next Actions Retirement Note

Status: Retired
Doc Type: Review Packet
Retirement date: 2026-06-07

This note records the governed retirement of
`C:\FC-worktrees\project-next-actions` after Jeff explicitly approved archiving
the stale dirty worktree.

## Decision

`project-next-actions` was retired as stale governance debt, not continued as a
product stream.

The worktree branch head was already contained in `origin/main`, no unique
commits would be lost, and the remaining dirty staged files were not a safe
source of current product truth. Useful communication-continuity behavior had
already reached `main` through later communication-continuity work.

No dirty staged work was merged, rescued, staged into `main`, committed, or
applied.

## Safety Confirmation

Worktree:

`C:\FC-worktrees\project-next-actions`

Branch:

`stream/project-next-actions`

Latest commit:

`c53b7d25 feat: add project next actions panel`

Safety findings:

- Branch head was contained in `origin/main`.
- No unique commits would be lost by retiring the local branch.
- The worktree had staged dirty files only.
- There were no unstaged files.
- There were no untracked files.
- An archival patch was saved outside the canonical repo at
  `C:\FC-worktrees\_archive\project-next-actions-2026-06-07.patch`.

## Dirty Files Found

The dirty staged index contained:

- `apps/web/app/(app)/contracts/[contractId]/page.tsx`
- `apps/web/app/(app)/customers/[customerId]/page.tsx`
- `apps/web/app/(app)/invoices/[invoiceId]/page.tsx`
- `apps/web/app/(app)/projects/[projectId]/page.tsx`
- `apps/web/components/related-conversations-card.tsx`
- `apps/web/lib/communications/record-continuity.test.ts`
- `apps/web/lib/communications/record-continuity.ts`
- `docs/current-state.md`

The staged communication continuity helper and card content matched current
`origin/main`. The staged Project Workspace and `docs/current-state.md` content
was stale relative to current `origin/main` and would have risked rolling back
newer implemented-truth documentation or product surface work if applied.

## Preserved Value

The preserved value is conceptual only:

- record-linked communication continuity remains a valid command-center pattern;
- the useful behavior already exists on `main`;
- the stale staged index should not be used as a source for recovery,
  cherry-picks, or future implementation.

This retirement records that useful behavior was already preserved on `main`
and that no dirty work from the stale worktree was merged.

## Portfolio Impact

This cleanup clears automation and parallel-development risk before the next
financial wave. Future financial-wave approval should proceed from current
`main`, the active governance registry, and the next portfolio recommendation,
not from `stream/project-next-actions` or its archived patch.

This note does not approve a new wave, create streams, create worktrees, modify
schemas or migrations, or authorize financial feature implementation.
