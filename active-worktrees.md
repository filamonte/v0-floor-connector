# Active Worktrees

Status: Active
Doc Type: Developer Operations

This registry tracks the local FloorConnector worktrees used for parallel
development. It is an operational coordination aid, not product truth.

Canonical repo: `C:\FloorConnector`
Worktree root: `C:\FC-worktrees`

| Worktree                  | Branch                           | Purpose                                       | Status |
| ------------------------- | -------------------------------- | --------------------------------------------- | ------ |
| `main`                    | `main`                           | Canonical integration branch                  | Active |
| `communications`          | `stream/communications`          | Communications stream workspace               | Active |
| `field-mobile`            | `stream/field-mobile`            | Field/mobile stream workspace                 | Active |
| `financials`              | `stream/financials`              | Financials stream workspace                   | Active |
| `portal`                  | `stream/portal`                  | Customer portal stream workspace              | Active |
| `project-readiness-panel` | `stream/project-readiness-panel` | Project Workspace readiness slice workspace   | Active |
| `project-workspace`       | `stream/project-workspace`       | Project Workspace capability stream workspace | Active |
| `qa-verification`         | `stream/qa-verification`         | QA and verification stream workspace          | Active |
| `scheduling`              | `stream/scheduling`              | Scheduling/CrewBoard stream workspace         | Active |

Use `pnpm worktree:status` for live branch health. Update this registry when a
worktree is created, retired, or repurposed.
