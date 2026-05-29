# Active Worktrees

Status: Active
Doc Type: Developer Operations

This registry tracks the local FloorConnector worktrees used for parallel
development. It is an operational coordination aid, not product truth.

Canonical repo: `C:\FloorConnector`
Worktree root: `C:\FC-worktrees`

## Lifecycle

Statuses:

- `Active`: open stream receiving implementation or planning work.
- `Waiting Review`: work is complete locally and waiting for review.
- `Ready Merge`: reviewed and ready to merge in the agreed order.
- `Merged`: merged to `main`, but worktree still exists temporarily.
- `Archived`: worktree retired or removed.

Expectations:

- Create streams with `pnpm worktree:create <name>`.
- Run `pnpm worktree:reconcile` at the start of the day.
- Run `pnpm worktree:doctor` before and after meaningful work.
- Keep stream branches small enough to review and merge.
- Update this registry when a worktree is created, repurposed, merged, or
  archived.
- Retire completed local worktrees with `pnpm worktree:finish <name>`.

| Worktree                  | Branch                           | Purpose                                       | Owner       | Status | Created | Last Updated | Notes                                   |
| ------------------------- | -------------------------------- | --------------------------------------------- | ----------- | ------ | ------- | ------------ | --------------------------------------- |
| `main`                    | `main`                           | Canonical integration branch                  | Core        | Active | Unknown | 2026-05-28   | Platform source of truth                |
| `communications`          | `stream/communications`          | Communications stream workspace               | Codex/local | Active | Unknown | 2026-05-28   | No remote upstream currently configured |
| `field-mobile`            | `stream/field-mobile`            | Field/mobile stream workspace                 | Codex/local | Active | Unknown | 2026-05-28   | Platform main merged locally            |
| `financials`              | `stream/financials`              | Financials stream workspace                   | Codex/local | Active | Unknown | 2026-05-28   | No remote upstream currently configured |
| `portal`                  | `stream/portal`                  | Customer portal stream workspace              | Codex/local | Active | Unknown | 2026-05-28   | Platform main merged locally            |
| `project-readiness-panel` | `stream/project-readiness-panel` | Project Workspace readiness slice workspace   | Codex/local | Active | Unknown | 2026-05-28   | Platform main merged locally            |
| `project-workspace`       | `stream/project-workspace`       | Project Workspace capability stream workspace | Codex/local | Active | Unknown | 2026-05-28   | Platform main merged locally            |
| `qa-verification`         | `stream/qa-verification`         | QA and verification stream workspace          | Codex/local | Active | Unknown | 2026-05-28   | No remote upstream currently configured |
| `scheduling`              | `stream/scheduling`              | Scheduling/CrewBoard stream workspace         | Codex/local | Active | Unknown | 2026-05-28   | Platform main merged locally            |

Use `pnpm worktree:status` for compact live branch health and
`pnpm worktree:reconcile` for the morning reconciliation view.
